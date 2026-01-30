import { ChatGroq } from "@langchain/groq";
import { PromptTemplate } from "@langchain/core/prompts";
import { RunnableSequence } from "@langchain/core/runnables";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { db } from "../../config/db.js";
import dotenv from "dotenv";

dotenv.config();

// Initialize Groq LLM with the specified model
const llm = new ChatGroq({
  apiKey: process.env.GROQ_API_KEY,
  model: "llama-3.1-8b-instant",
  temperature: 0.7,
});

/**
 * Simple text-based similarity using keyword matching
 * (No external embedding API needed)
 */
const calculateSimilarity = (text1, text2) => {
  const words1 = text1.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const words2 = text2.toLowerCase().split(/\s+/).filter(w => w.length > 3);

  const set1 = new Set(words1);
  const set2 = new Set(words2);

  let intersection = 0;
  for (const word of set1) {
    if (set2.has(word)) intersection++;
  }

  const union = set1.size + set2.size - intersection;
  return union > 0 ? intersection / union : 0;
};

/**
 * Store document chunks in MySQL
 */
export const storeDocumentChunks = async (companyId, chunks, metadata = {}) => {
  const insertPromises = chunks.map((chunk, index) => {
    return db.query(
      `INSERT INTO outreach_documents (company_id, content, filename, chunk_index, created_at)
       VALUES (?, ?, ?, ?, NOW())`,
      [companyId, chunk, metadata.filename || 'unknown', index]
    );
  });

  await Promise.all(insertPromises);
  return chunks.length;
};

/**
 * Perform similarity search using keyword matching
 */
export const similaritySearch = async (companyId, query, topK = 5) => {
  const [rows] = await db.query(
    `SELECT * FROM outreach_documents WHERE company_id = ?`,
    [companyId]
  );

  if (rows.length === 0) {
    return [];
  }

  // Calculate similarity scores
  const scoredDocs = rows.map((doc) => ({
    ...doc,
    score: calculateSimilarity(query, doc.content),
  }));

  // Sort by score and return top K
  scoredDocs.sort((a, b) => b.score - a.score);
  return scoredDocs.slice(0, topK);
};

/**
 * Email generation prompt template - generates structured HTML email
 */
const emailPromptTemplate = PromptTemplate.fromTemplate(`
You are an expert sales and marketing email copywriter. Your task is to draft a personalized, professional outreach email.

COMPANY CONTEXT (from company documents):
{companyContext}

LEAD INFORMATION:
- Name: {leadName}
- Email: {leadEmail}
- Job Title: {leadJobTitle}
- Current Status: {leadStatus}
- Temperature: {leadTemperature}

EMPLOYEE INFORMATION:
- Sender Name: {employeeName}
- Sender Email: {employeeEmail}
- Company: {companyName}

EMPLOYEE'S INTENT/INSTRUCTIONS:
{employeeIntent}

TARGET STATUS TRANSITION: {statusFrom} → {statusTo}

IMPORTANT FORMATTING RULES:
1. Structure the email with clear paragraphs separated by blank lines
2. Use proper greeting (Dear [Name],)
3. First paragraph: Opening and purpose
4. Middle paragraphs: Key points, value proposition, or answers
5. Final paragraph: Call-to-action
6. Professional sign-off with name

CONTENT GUIDELINES:
1. Keep the email concise and professional (150-250 words)
2. Personalize based on the lead's information and company context
3. Include a clear call-to-action appropriate for the status transition
4. Use a warm, conversational tone while maintaining professionalism
5. Reference specific company offerings/benefits from the context when relevant
6. For LEAD→MQL: Focus on initial engagement and value proposition
7. For MQL→SQL: Focus on qualifying questions and scheduling a call
8. For SQL→OPPORTUNITY: Focus on specific solutions and next steps

Generate the email body with proper paragraph breaks. Start with "Dear [Name]," greeting.
`);

/**
 * Subject line generation prompt template
 */
const subjectPromptTemplate = PromptTemplate.fromTemplate(`
Generate a compelling email subject line for a sales outreach email.

CONTEXT:
- Lead Name: {leadName}
- Company: {companyName}
- Status Transition: {statusFrom} → {statusTo}
- Employee Intent: {employeeIntent}

GUIDELINES:
1. Keep it under 60 characters
2. Make it personalized and attention-grabbing
3. Avoid spam trigger words
4. Create curiosity or highlight value

Generate ONLY the subject line, nothing else.
`);

/**
 * Convert plain text email to structured HTML
 */
const formatEmailAsHtml = (plainText, employeeName, employeeEmail, companyName) => {
  // Split into paragraphs and format
  const paragraphs = plainText
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  const htmlParagraphs = paragraphs.map(p => {
    // Convert single line breaks to <br>
    const formatted = p.replace(/\n/g, '<br>');
    return `<p style="margin: 0 0 16px 0; line-height: 1.6;">${formatted}</p>`;
  }).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; color: #333333; line-height: 1.6; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto;">
    ${htmlParagraphs}
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
      <p style="margin: 0; font-weight: 600; color: #333;">${employeeName}</p>
      <p style="margin: 4px 0 0 0; color: #666; font-size: 13px;">${companyName}</p>
      <p style="margin: 4px 0 0 0; color: #666; font-size: 13px;">
        <a href="mailto:${employeeEmail}" style="color: #0066cc; text-decoration: none;">${employeeEmail}</a>
      </p>
    </div>
  </div>
</body>
</html>`.trim();
};

/**
 * Generate personalized outreach email using RAG
 */
export const generateOutreachEmail = async ({
  companyId,
  lead,
  employee,
  companyName,
  employeeIntent,
  statusFrom,
  statusTo,
}) => {
  // Retrieve relevant company context
  const relevantDocs = await similaritySearch(
    companyId,
    `${employeeIntent} ${lead.job_title || ""} ${statusFrom} ${statusTo}`,
    5
  );

  const companyContext = relevantDocs.length > 0
    ? relevantDocs.map((doc) => doc.content).join("\n\n")
    : "No specific company documents available. Use general professional sales approach.";

  // Create the email generation chain
  const emailChain = RunnableSequence.from([
    emailPromptTemplate,
    llm,
    new StringOutputParser(),
  ]);

  // Create the subject generation chain
  const subjectChain = RunnableSequence.from([
    subjectPromptTemplate,
    llm,
    new StringOutputParser(),
  ]);

  // Generate email body and subject in parallel
  const [emailBody, subject] = await Promise.all([
    emailChain.invoke({
      companyContext,
      leadName: lead.name,
      leadEmail: lead.email,
      leadJobTitle: lead.job_title || "Professional",
      leadStatus: lead.status,
      leadTemperature: lead.temperature || "COLD",
      employeeName: employee.name,
      employeeEmail: employee.email,
      companyName,
      employeeIntent,
      statusFrom,
      statusTo,
    }),
    subjectChain.invoke({
      leadName: lead.name,
      companyName,
      statusFrom,
      statusTo,
      employeeIntent,
    }),
  ]);

  // Format email as HTML
  const htmlBody = formatEmailAsHtml(
    emailBody.trim(),
    employee.name,
    employee.email,
    companyName
  );

  return {
    subject: subject.trim(),
    body: emailBody.trim(),
    htmlBody,
    context: {
      documentsUsed: relevantDocs.length,
      statusTransition: `${statusFrom} → ${statusTo}`,
    },
  };
};

/**
 * Delete all documents for a company
 */
export const deleteCompanyDocuments = async (companyId) => {
  const [result] = await db.query(
    `DELETE FROM outreach_documents WHERE company_id = ?`,
    [companyId]
  );
  return result.affectedRows;
};

/**
 * Get document count for a company
 */
export const getDocumentCount = async (companyId) => {
  const [rows] = await db.query(
    `SELECT COUNT(*) as count FROM outreach_documents WHERE company_id = ?`,
    [companyId]
  );
  return rows[0].count;
};

/**
 * Delete documents by filename
 */
export const deleteDocumentsByFilename = async (companyId, filename) => {
  const [result] = await db.query(
    `DELETE FROM outreach_documents WHERE company_id = ? AND filename = ?`,
    [companyId, filename]
  );
  return result.affectedRows;
};

export default {
  storeDocumentChunks,
  similaritySearch,
  generateOutreachEmail,
  deleteCompanyDocuments,
  getDocumentCount,
  deleteDocumentsByFilename,
};
