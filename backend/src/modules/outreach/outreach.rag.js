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
  model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile",
  temperature: 0.7,
  maxTokens: 4096,
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
 * Email generation prompt template
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

GUIDELINES:
1. Keep the email concise and professional (150-250 words)
2. Personalize based on the lead's information and company context
3. Include a clear call-to-action appropriate for the status transition
4. Use a warm, conversational tone while maintaining professionalism
5. Reference specific company offerings/benefits from the context when relevant
6. For LEAD→MQL: Focus on initial engagement and value proposition
7. For MQL→SQL: Focus on qualifying questions and scheduling a call
8. For SQL→OPPORTUNITY: Focus on specific solutions and next steps

Generate ONLY the email body (no subject line). Start directly with the greeting.
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

  return {
    subject: subject.trim(),
    body: emailBody.trim(),
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
