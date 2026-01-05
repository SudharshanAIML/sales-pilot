import * as opportunityService from "./opportunity.service.js";

/**
 * @desc   Create Opportunity (SQL → OPPORTUNITY)
 * @route  POST /opportunities
 * @access Employee
 */
export const createOpportunity = async (req, res, next) => {
  try {
    const { contactId, expectedValue } = req.body;

    if (!contactId || !expectedValue) {
      return res.status(400).json({
        message: "contactId and expectedValue are required",
      });
    }

    const opportunityId =
      await opportunityService.createOpportunity(
        contactId,
        req.user.empId,
        expectedValue
      );

    res.status(201).json({
      message: "Opportunity created successfully",
      opportunityId,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get Opportunity by ID
 * @route  GET /opportunities/:id
 * @access Employee
 */
export const getOpportunityById = async (req, res, next) => {
  try {
    const opportunity =
      await opportunityService.getOpportunityById(
        req.params.id
      );

    if (!opportunity) {
      return res.status(404).json({
        message: "Opportunity not found",
      });
    }

    res.json(opportunity);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Mark Opportunity as WON (→ CUSTOMER)
 * @route  POST /opportunities/:id/won
 * @access Employee
 */
export const markAsWon = async (req, res, next) => {
  try {
    const { dealValue } = req.body;

    if (!dealValue) {
      return res.status(400).json({
        message: "dealValue is required",
      });
    }

    await opportunityService.markAsWon(
      req.params.id,
      req.user.empId,
      dealValue
    );

    res.json({
      message:
        "Opportunity marked as WON and contact converted to CUSTOMER",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Mark Opportunity as LOST (→ DORMANT)
 * @route  POST /opportunities/:id/lost
 * @access Employee
 */
export const markAsLost = async (req, res, next) => {
  try {
    const { reason } = req.body;

    await opportunityService.markAsLost(
      req.params.id,
      req.user.empId,
      reason || null
    );

    res.json({
      message:
        "Opportunity marked as LOST and contact moved to DORMANT",
    });
  } catch (error) {
    next(error);
  }
};
