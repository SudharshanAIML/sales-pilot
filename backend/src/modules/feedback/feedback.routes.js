import { Router } from "express";
import * as feedbackController from "./feedback.controller.js";
// import { authenticateEmployee } from "../../middlewares/auth.middleware.js";

const router = Router();

/* ---------------------------------------------------
   SUBMIT FEEDBACK
--------------------------------------------------- */
/**
 * @route   POST /feedback
 * @desc    Submit feedback for a customer
 * @access  Customer / Employee
 *
 * body:
 * {
 *   contactId,
 *   rating,
 *   comment
 * }
 */
router.post(
  "/",
  // authenticateEmployee,  // optional (customer form may not need auth)
  feedbackController.submitFeedback
);

/* ---------------------------------------------------
   GET FEEDBACK BY CONTACT
--------------------------------------------------- */
/**
 * @route   GET /feedback/contact/:contactId
 * @desc    Get all feedback for a contact
 * @access  Employee
 */
router.get(
  "/contact/:contactId",
  /* authenticateEmployee, */
  feedbackController.getFeedbackByContact
);

/* ---------------------------------------------------
   GET FEEDBACK SUMMARY (AVG, COUNT)
--------------------------------------------------- */
/**
 * @route   GET /feedback/contact/:contactId/summary
 * @desc    Get feedback summary for evangelist decision
 * @access  Employee / System
 */
router.get(
  "/contact/:contactId/summary",
  /* authenticateEmployee, */
  feedbackController.getFeedbackSummary
);

export default router;
