import * as feedbackService from "./feedback.service.js";

/**
 * @desc   Submit feedback for a customer
 * @route  POST /feedback
 * @access Customer / Employee
 */
export const submitFeedback = async (req, res, next) => {
  try {
    const { contactId, rating, comment } = req.body;

    if (!contactId || !rating) {
      return res.status(400).json({
        message: "contactId and rating are required",
      });
    }

    await feedbackService.submitFeedback({
      contactId,
      rating,
      comment,
    });

    res.status(201).json({
      message: "Feedback submitted successfully",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get all feedback for a contact
 * @route  GET /feedback/contact/:contactId
 * @access Employee
 */
export const getFeedbackByContact = async (req, res, next) => {
  try {
    const feedbackList =
      await feedbackService.getFeedbackByContact(
        req.params.contactId
      );

    res.json(feedbackList);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get feedback summary (avg rating, count)
 * @route  GET /feedback/contact/:contactId/summary
 * @access Employee / System
 */
export const getFeedbackSummary = async (req, res, next) => {
  try {
    const summary =
      await feedbackService.getFeedbackSummary(
        req.params.contactId
      );

    res.json(summary);
  } catch (error) {
    next(error);
  }
};
