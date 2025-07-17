import { NextFunction, Request, Response } from "express";
import "../middleware/authMiddleware";
import {
  validateGetUnavailabilitiesParams,
  validateCreateUnavailabilityParams,
  validateDeleteUnavailabilityParams,
  validateListRoomUnavailParams,
} from "../services/validation/roomUnavailabilityValidation";
import {
  getRoomUnavailabilitiesByProperty,
  createRoomUnavailability,
  deleteRoomUnavailabilityById,
  getRoomUnavailabilitiesByRoom,
} from "../services/query/roomUnavailabilityQuery";

export const getUnavailabilitiesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedParams = validateGetUnavailabilitiesParams(req.query, res);
    if (!validatedParams) return;

    const tenantId = req.user?.id;
    if (!tenantId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const result = await getRoomUnavailabilitiesByProperty(
      validatedParams,
      tenantId
    );
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const listRoomUnavailabilitiesHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedParams = validateListRoomUnavailParams(req.query, res);
    if (!validatedParams) return;

    const tenantId = req.user?.id;
    if (!tenantId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const result = await getRoomUnavailabilitiesByRoom(
      validatedParams,
      tenantId
    );
    res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    next(error);
  }
};

export const createUnavailabilityHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedParams = validateCreateUnavailabilityParams(req.body, res);
    if (!validatedParams) return;

    const tenantId = req.user?.id;
    if (!tenantId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const result = await createRoomUnavailability(validatedParams, tenantId);
    res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteUnavailabilityHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedParams = validateDeleteUnavailabilityParams(req.params, res);
    if (!validatedParams) return;

    const tenantId = req.user?.id;
    if (!tenantId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const result = await deleteRoomUnavailabilityById(
      validatedParams,
      tenantId
    );
    res.status(result.success ? 200 : 404).json(result);
  } catch (error) {
    next(error);
  }
};
