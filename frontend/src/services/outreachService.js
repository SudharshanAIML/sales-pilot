import api from './api';

/**
 * Outreach Service
 * Handles AI-powered outreach email generation using RAG
 */

// Upload company document for RAG
export const uploadDocument = async (file) => {
  const formData = new FormData();
  formData.append('document', file);

  const response = await api.post('/outreach/documents', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Get uploaded documents
export const getDocuments = async () => {
  const response = await api.get('/outreach/documents');
  return response.data;
};

// Delete a document
export const deleteDocument = async (documentId) => {
  const response = await api.delete(`/outreach/documents/${documentId}`);
  return response.data;
};

// Get RAG status
export const getRAGStatus = async () => {
  const response = await api.get('/outreach/rag-status');
  return response.data;
};

// Get contacts by status threshold
export const getContactsByThreshold = async (fromStatus, toStatus) => {
  const response = await api.get('/outreach/contacts', {
    params: { fromStatus, toStatus },
  });
  return response.data;
};

// Generate outreach emails using RAG
export const generateEmails = async ({ contactIds, employeeIntent, fromStatus, toStatus }) => {
  const response = await api.post('/outreach/generate', {
    contactIds,
    employeeIntent,
    fromStatus,
    toStatus,
  });
  return response.data;
};

// Send generated emails
export const sendEmails = async (emails) => {
  const response = await api.post('/outreach/send', { emails });
  return response.data;
};

/* ===================================================
   AUTOPILOT API
=================================================== */

// Start autopilot mode
export const startAutopilot = async (intervalMinutes = 5) => {
  const response = await api.post('/outreach/autopilot/start', { intervalMinutes });
  return response.data;
};

// Stop autopilot mode
export const stopAutopilot = async () => {
  const response = await api.post('/outreach/autopilot/stop');
  return response.data;
};

// Get autopilot status
export const getAutopilotStatus = async () => {
  const response = await api.get('/outreach/autopilot/status');
  return response.data;
};

// Get autopilot activity log
export const getAutopilotLog = async (limit = 50) => {
  const response = await api.get('/outreach/autopilot/log', { params: { limit } });
  return response.data;
};
