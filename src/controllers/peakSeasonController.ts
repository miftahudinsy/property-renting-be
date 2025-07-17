import { NextFunction, Request, Response } from "express";
import "../middleware/authMiddleware";
import {
  validateListPeakSeasonParams,
  validateCreatePeakSeasonParams,
  validateUpdatePeakSeasonParams,
  validateDeletePeakSeasonParams,
} from "../services/validation/peakSeasonValidation";
import {
  getPeakSeasonRatesByRoom,
  createPeakSeasonRate,
  updatePeakSeasonRateById,
  deletePeakSeasonRateById,
} from "../services/query/peakSeasonQuery";

export const getPeakSeasonRatesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedParams = validateListPeakSeasonParams(req.query, res);
    if (!validatedParams) return;

    const tenantId = req.user?.id;
    if (!tenantId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const result = await getPeakSeasonRatesByRoom(validatedParams, tenantId);
    res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    next(error);
  }
};

export const createPeakSeasonRateHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedParams = validateCreatePeakSeasonParams(req.body, res);
    if (!validatedParams) return;

    const tenantId = req.user?.id;
    if (!tenantId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const result = await createPeakSeasonRate(validatedParams, tenantId);
    res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    next(error);
  }
};

export const updatePeakSeasonRateHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedParams = validateUpdatePeakSeasonParams(
      req.params,
      req.body,
      res
    );
    if (!validatedParams) return;

    const tenantId = req.user?.id;
    if (!tenantId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const result = await updatePeakSeasonRateById(validatedParams, tenantId);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    next(error);
  }
};

export const deletePeakSeasonRateHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedParams = validateDeletePeakSeasonParams(req.params, res);
    if (!validatedParams) return;

    const tenantId = req.user?.id;
    if (!tenantId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const result = await deletePeakSeasonRateById(validatedParams, tenantId);
    res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    next(error);
  }
};
