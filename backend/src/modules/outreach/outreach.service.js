import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
import mammoth from "mammoth";
import * as ragService from "./outreach.rag.js";
import * as contactRepo from "../contacts/contact.repo.js";
import * as employeeRepo from "../employees/employee.repo.js";
import * as companyRepo from "../companies/company.repo.js";
import * as gmailService from "../../services/gmail.service.js";
import { db } from "../../config/db.js";

// Status hierarchy for filtering
const STATUS_HIERARCHY = ["LEAD", "MQL", "SQL", "OPPORTUNITY", "CUSTOMER", "EVANGELIST"];

/**
 * Parse document content based on file type
 */
export const parseDocument = async (buffer, mimeType, filename) => {
  let text = "";

  if (mimeType === "application/pdf") {
    const pdfData = await pdfParse(buffer);
    text = pdfData.text;
  } else if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mimeType === "application/msword"
  ) {
    const result = await mammoth.extractRawText({ buffer });
    text = result.value;
  } else if (mimeType === "text/plain") {
    text = buffer.toString("utf-8");
  } else {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }

  return text;
};

/**
 * Split text into chunks for storage
 */
const splitIntoChunks = (text, chunkSize = 1000, overlap = 200) => {
  const chunks = [];
  let start = 0;

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length);
    chunks.push(text.slice(start, end));
    start = end - overlap;
    if (start >= text.length - overlap) break;
  }

  return chunks.filter((chunk) => chunk.trim().length > 50);
};

/**
 * Upload and process company document for RAG
 */
export const uploadCompanyDocument = async (companyId, file) => {
  // Parse document content
  const text = await parseDocument(file.buffer, file.mimetype, file.originalname);

  if (!text || text.trim().length < 100) {
    throw new Error("Document content is too short or empty");
  }

  // Split into chunks
  const chunks = splitIntoChunks(text);

  // Store chunks in MySQL
  const storedCount = await ragService.storeDocumentChunks(companyId, chunks, {
    filename: file.originalname,
    mimeType: file.mimetype,
  });

  // Save document metadata
  await db.query(
    `INSERT INTO outreach_document_meta (company_id, filename, mime_type, chunks_count, created_at)
     VALUES (?, ?, ?, ?, NOW())`,
    [companyId, file.originalname, file.mimetype, storedCount]
  );

  return {
    filename: file.originalname,
    chunksProcessed: storedCount,
  };
};

/**
 * Get uploaded documents for a company
 */
export const getCompanyDocuments = async (companyId) => {
  const [rows] = await db.query(
    `SELECT * FROM outreach_document_meta WHERE company_id = ? ORDER BY created_at DESC`,
    [companyId]
  );
  return rows;
};

/**
 * Delete a company document
 */
export const deleteCompanyDocument = async (companyId, documentId) => {
  // Get document info
  const [docs] = await db.query(
    `SELECT * FROM outreach_document_meta WHERE id = ? AND company_id = ?`,
    [documentId, companyId]
  );

  if (docs.length === 0) {
    throw new Error("Document not found");
  }

  const doc = docs[0];

  // Delete document chunks
  await ragService.deleteDocumentsByFilename(companyId, doc.filename);

  // Delete document metadata
  await db.query(
    `DELETE FROM outreach_document_meta WHERE id = ?`,
    [documentId]
  );

  return { deleted: true };
};

/**
 * Get contacts by status threshold
 */
export const getContactsByStatusThreshold = async (companyId, fromStatus, toStatus) => {
  const fromIndex = STATUS_HIERARCHY.indexOf(fromStatus);
  const toIndex = STATUS_HIERARCHY.indexOf(toStatus);

  if (fromIndex === -1 || toIndex === -1 || fromIndex >= toIndex) {
    throw new Error("Invalid status threshold");
  }

  // Get contacts with the 'from' status
  const contacts = await contactRepo.getByStatus(fromStatus, companyId);

  return contacts.map((contact) => ({
    contact_id: contact.contact_id,
    name: contact.name,
    email: contact.email,
    job_title: contact.job_title,
    status: contact.status,
    temperature: contact.temperature,
    interest_score: contact.interest_score,
    created_at: contact.created_at,
  }));
};

/**
 * Generate outreach emails for selected contacts
 */
export const generateOutreachEmails = async ({
  companyId,
  empId,
  contactIds,
  employeeIntent,
  fromStatus,
  toStatus,
}) => {
  // Get employee and company info
  const [employee, company] = await Promise.all([
    employeeRepo.getById(empId),
    companyRepo.getById(companyId),
  ]);

  if (!employee || !company) {
    throw new Error("Employee or company not found");
  }

  // Generate emails for each contact
  const results = [];

  for (const contactId of contactIds) {
    const contact = await contactRepo.getById(contactId);

    if (!contact) {
      results.push({
        contactId,
        success: false,
        error: "Contact not found",
      });
      continue;
    }

    try {
      const email = await ragService.generateOutreachEmail({
        companyId,
        lead: contact,
        employee,
        companyName: company.company_name,
        employeeIntent,
        statusFrom: fromStatus,
        statusTo: toStatus,
      });

      results.push({
        contactId,
        contactName: contact.name,
        contactEmail: contact.email,
        success: true,
        email,
      });
    } catch (error) {
      results.push({
        contactId,
        contactName: contact.name,
        success: false,
        error: error.message,
      });
    }
  }

  return results;
};

/**
 * Send generated outreach emails
 */
export const sendOutreachEmails = async (empId, emails) => {
  const results = [];

  for (const emailData of emails) {
    try {
      // Check if employee can send via Gmail
      const canSend = await gmailService.canSendEmail(empId);

      if (!canSend) {
        results.push({
          contactId: emailData.contactId,
          success: false,
          error: "Gmail not connected",
        });
        continue;
      }

      // Create draft and send - use htmlBody if available, otherwise body
      const draft = await gmailService.createDraft(empId, {
        to: emailData.to,
        subject: emailData.subject,
        body: emailData.htmlBody || emailData.body,
        isHtml: !!emailData.htmlBody,
      });

      const sent = await gmailService.sendDraft(empId, draft.draftId);

      results.push({
        contactId: emailData.contactId,
        success: true,
        messageId: sent.messageId,
      });
    } catch (error) {
      results.push({
        contactId: emailData.contactId,
        success: false,
        error: error.message,
      });
    }
  }

  return results;
};

/**
 * Get RAG status for a company
 */
export const getRAGStatus = async (companyId) => {
  const documentCount = await ragService.getDocumentCount(companyId);
  const documents = await getCompanyDocuments(companyId);

  return {
    isConfigured: documentCount > 0,
    totalChunks: documentCount,
    documentsCount: documents.length,
    documents: documents.map((d) => ({
      id: d.id,
      filename: d.filename,
      chunksCount: d.chunks_count,
      uploadedAt: d.created_at,
    })),
  };
};

export default {
  uploadCompanyDocument,
  getCompanyDocuments,
  deleteCompanyDocument,
  getContactsByStatusThreshold,
  generateOutreachEmails,
  sendOutreachEmails,
  getRAGStatus,
};
