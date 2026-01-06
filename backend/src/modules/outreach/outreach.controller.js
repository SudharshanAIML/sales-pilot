import * as outreachService from "./outreach.service.js";

/**
 * @desc   Upload company document for RAG
 * @route  POST /outreach/documents
 * @access Employee
 */
export const uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await outreachService.uploadCompanyDocument(
      req.user.companyId,
      req.file
    );

    res.status(201).json({
      message: "Document uploaded and processed successfully",
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get uploaded documents
 * @route  GET /outreach/documents
 * @access Employee
 */
export const getDocuments = async (req, res, next) => {
  try {
    const documents = await outreachService.getCompanyDocuments(req.user.companyId);
    res.json({ documents });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Delete a document
 * @route  DELETE /outreach/documents/:documentId
 * @access Employee
 */
export const deleteDocument = async (req, res, next) => {
  try {
    await outreachService.deleteCompanyDocument(
      req.user.companyId,
      req.params.documentId
    );
    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get RAG status
 * @route  GET /outreach/rag-status
 * @access Employee
 */
export const getRAGStatus = async (req, res, next) => {
  try {
    const status = await outreachService.getRAGStatus(req.user.companyId);
    res.json(status);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get contacts by status threshold
 * @route  GET /outreach/contacts
 * @access Employee
 */
export const getContactsByThreshold = async (req, res, next) => {
  try {
    const { fromStatus, toStatus } = req.query;

    if (!fromStatus || !toStatus) {
      return res.status(400).json({
        message: "fromStatus and toStatus are required",
      });
    }

    const contacts = await outreachService.getContactsByStatusThreshold(
      req.user.companyId,
      fromStatus,
      toStatus
    );

    res.json({ contacts });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Generate outreach emails using RAG
 * @route  POST /outreach/generate
 * @access Employee
 */
export const generateEmails = async (req, res, next) => {
  try {
    const { contactIds, employeeIntent, fromStatus, toStatus } = req.body;

    if (!contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
      return res.status(400).json({ message: "contactIds array is required" });
    }

    if (!employeeIntent) {
      return res.status(400).json({ message: "employeeIntent is required" });
    }

    if (!fromStatus || !toStatus) {
      return res.status(400).json({
        message: "fromStatus and toStatus are required",
      });
    }

    const results = await outreachService.generateOutreachEmails({
      companyId: req.user.companyId,
      empId: req.user.empId,
      contactIds,
      employeeIntent,
      fromStatus,
      toStatus,
    });

    res.json({ results });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Send generated outreach emails
 * @route  POST /outreach/send
 * @access Employee
 */
export const sendEmails = async (req, res, next) => {
  try {
    const { emails } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ message: "emails array is required" });
    }

    // Validate email structure
    for (const email of emails) {
      if (!email.contactId || !email.to || !email.subject || !email.body) {
        return res.status(400).json({
          message: "Each email must have contactId, to, subject, and body",
        });
      }
    }

    const results = await outreachService.sendOutreachEmails(req.user.empId, emails);

    res.json({
      message: "Emails processed",
      results,
      summary: {
        total: results.length,
        sent: results.filter((r) => r.success).length,
        failed: results.filter((r) => !r.success).length,
      },
    });
  } catch (error) {
    next(error);
  }
};
