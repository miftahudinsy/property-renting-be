import { NextFunction, Request, Response } from "express";
import "../../middleware/authMiddleware";
import {
  validateCreateRoomParams,
  validateOwnedRoomsParams,
  validateRoomEditParams,
  validateUpdateRoomParams,
  validateDeleteRoomParams,
} from "../../services/validation/tenantRoomValidation";
import {
  createRoom,
  getOwnedRooms,
  getRoomForEdit,
  updateRoom,
  deleteRoomById as deleteRoomQuery,
} from "../../services/query/tenantRoomQuery";
import { sendErrorResponse } from "../../services/responseHelper";

export const createNewRoom = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const validatedParams = validateCreateRoomParams(req.body, res);
    if (!validatedParams) return;

    const newRoom = await createRoom(validatedParams, userId);
    res.status(201).json({
      success: true,
      message: "Kamar berhasil dibuat",
      data: newRoom,
    });
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

export const getOwnedRoomsList = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const validatedParams = validateOwnedRoomsParams(req.query, res);
    if (!validatedParams) return;

    const result = await getOwnedRooms(validatedParams, userId);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

export const getRoomForEditForm = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const validatedParams = validateRoomEditParams(req.params, res);
    if (!validatedParams) return;

    const room = await getRoomForEdit(validatedParams, userId);
    if (!room) {
      res
        .status(404)
        .json({ success: false, message: "Kamar tidak ditemukan" });
      return;
    }
    res.status(200).json({ success: true, data: room });
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

export const updateRoomById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const validatedParams = validateUpdateRoomParams(req.params, req.body, res);
    if (!validatedParams) return;

    const updatedRoom = await updateRoom(validatedParams, userId);
    res.status(200).json({
      success: true,
      message: "Kamar berhasil diperbarui",
      data: updatedRoom,
    });
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

export const deleteRoomById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }
    const validatedParams = validateDeleteRoomParams(req.params, res);
    if (!validatedParams) return;

    const result = await deleteRoomQuery(validatedParams.roomId, userId);
    if (!result.success) {
      res.status(400).json(result);
      return;
    }
    res.status(200).json(result);
  } catch (error) {
    sendErrorResponse(res, error);
  }
};
