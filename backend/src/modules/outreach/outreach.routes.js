import { Router } from "express";
import multer from "multer";
import * as outreachController from "./outreach.controller.js";
import { authenticateEmployee } from "../../middlewares/auth.middleware.js";

const router = Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "text/plain",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF, DOCX, DOC, and TXT are allowed."));
    }
  },
});

/* ---------------------------------------------------
   DOCUMENT MANAGEMENT
--------------------------------------------------- */

/**
 * @route   POST /outreach/documents
 * @desc    Upload company document for RAG
 * @access  Employee
 */
router.post(
  "/documents",
  authenticateEmployee,
  upload.single("document"),
  outreachController.uploadDocument
);

/**
 * @route   GET /outreach/documents
 * @desc    Get uploaded documents
 * @access  Employee
 */
router.get(
  "/documents",
  authenticateEmployee,
  outreachController.getDocuments
);

/**
 * @route   DELETE /outreach/documents/:documentId
 * @desc    Delete a document
 * @access  Employee
 */
router.delete(
  "/documents/:documentId",
  authenticateEmployee,
  outreachController.deleteDocument
);

/* ---------------------------------------------------
   RAG STATUS
--------------------------------------------------- */

/**
 * @route   GET /outreach/rag-status
 * @desc    Get RAG configuration status
 * @access  Employee
 */
router.get(
  "/rag-status",
  authenticateEmployee,
  outreachController.getRAGStatus
);

/* ---------------------------------------------------
   CONTACT FILTERING
--------------------------------------------------- */

/**
 * @route   GET /outreach/contacts
 * @desc    Get contacts by status threshold
 * @access  Employee
 */
router.get(
  "/contacts",
  authenticateEmployee,
  outreachController.getContactsByThreshold
);

/* ---------------------------------------------------
   EMAIL GENERATION & SENDING
--------------------------------------------------- */

/**
 * @route   POST /outreach/generate
 * @desc    Generate outreach emails using RAG
 * @access  Employee
 */
router.post(
  "/generate",
  authenticateEmployee,
  outreachController.generateEmails
);

/**
 * @route   POST /outreach/send
 * @desc    Send generated outreach emails
 * @access  Employee
 */
router.post(
  "/send",
  authenticateEmployee,
  outreachController.sendEmails
);

export default router;
