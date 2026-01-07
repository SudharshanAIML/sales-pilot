import * as autopilotService from "./autopilot.service.js";

/**
 * @desc   Start autopilot mode
 * @route  POST /outreach/autopilot/start
 * @access Employee
 */
export const startAutopilot = async (req, res, next) => {
  try {
    const { intervalMinutes } = req.body;

    const result = await autopilotService.startAutopilot(
      req.user.empId,
      req.user.companyId,
      intervalMinutes || 5
    );

    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Stop autopilot mode
 * @route  POST /outreach/autopilot/stop
 * @access Employee
 */
export const stopAutopilot = async (req, res, next) => {
  try {
    const result = await autopilotService.stopAutopilot(req.user.empId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get autopilot status
 * @route  GET /outreach/autopilot/status
 * @access Employee
 */
export const getAutopilotStatus = async (req, res, next) => {
  try {
    const status = await autopilotService.getAutopilotStatus(req.user.empId);
    res.json(status);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc   Get autopilot activity log
 * @route  GET /outreach/autopilot/log
 * @access Employee
 */
export const getAutopilotLog = async (req, res, next) => {
  try {
    const { limit } = req.query;
    const log = await autopilotService.getAutopilotLog(
      req.user.empId,
      parseInt(limit) || 50
    );
    res.json({ log });
  } catch (error) {
    next(error);
  }
};
