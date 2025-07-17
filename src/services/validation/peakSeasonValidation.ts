import { Response } from "express";

// Interface untuk update peak season
interface UpdatePeakSeasonBody {
  type?: string;
  value?: string | number;
  start_date?: string;
  end_date?: string;
}

interface UpdatePeakSeasonParams {
  id?: string;
}

// Interface untuk create peak season
interface CreatePeakSeasonParams {
  room_id?: string;
  type?: string;
  value?: string;
  start_date?: string;
  end_date?: string;
}

// Interface untuk delete peak season
interface DeletePeakSeasonParams {
  id?: string;
}

// Interface untuk list peak season
interface ListPeakSeasonParams {
  room_id?: string;
  month?: string; // optional YYYY-MM
}

// Interfaces for validated parameters
export interface ValidatedUpdatePeakSeasonParams {
  id: number;
  type?: "percentage" | "fixed";
  value?: number;
  startDate?: Date;
  endDate?: Date;
}

export interface ValidatedCreatePeakSeasonParams {
  roomId: number;
  type: "percentage" | "fixed";
  value: number;
  startDate: Date;
  endDate: Date;
}

export interface ValidatedDeletePeakSeasonParams {
  id: number;
}

export interface ValidatedListPeakSeasonParams {
  roomId: number;
  startDate?: Date; // inclusive
  endDate?: Date; // exclusive
}

// Validation functions
export const validateUpdatePeakSeasonParams = (
  params: UpdatePeakSeasonParams,
  body: UpdatePeakSeasonBody,
  res: Response
): ValidatedUpdatePeakSeasonParams | null => {
  const { id } = params;
  const { type, value, start_date, end_date } = body;

  if (!id) {
    res.status(400).json({ success: false, message: "ID harus diisi" });
    return null;
  }

  const numericId = parseInt(id as string);
  if (isNaN(numericId)) {
    res.status(400).json({ success: false, message: "ID harus berupa angka" });
    return null;
  }

  let validatedType: "percentage" | "fixed" | undefined;
  if (type) {
    if (type !== "percentage" && type !== "fixed") {
      res.status(400).json({
        success: false,
        message: "Tipe harus 'percentage' atau 'fixed'",
      });
      return null;
    }
    validatedType = type;
  }

  let validatedValue: number | undefined;
  if (value) {
    validatedValue = Number(value);
    if (isNaN(validatedValue)) {
      res
        .status(400)
        .json({ success: false, message: "Nilai harus berupa angka" });
      return null;
    }
  }

  let startDate: Date | undefined;
  if (start_date) {
    startDate = new Date(start_date);
    if (isNaN(startDate.getTime())) {
      res
        .status(400)
        .json({ success: false, message: "Format tanggal mulai tidak valid" });
      return null;
    }
  }

  let endDate: Date | undefined;
  if (end_date) {
    endDate = new Date(end_date);
    if (isNaN(endDate.getTime())) {
      res
        .status(400)
        .json({ success: false, message: "Format tanggal akhir tidak valid" });
      return null;
    }
  }

  if (startDate && endDate && startDate > endDate) {
    res.status(400).json({
      success: false,
      message: "Tanggal mulai harus sebelum tanggal akhir",
    });
    return null;
  }

  return {
    id: numericId,
    type: validatedType,
    value: validatedValue,
    startDate,
    endDate,
  };
};

export const validateCreatePeakSeasonParams = (
  body: CreatePeakSeasonParams,
  res: Response
): ValidatedCreatePeakSeasonParams | null => {
  const { room_id, type, value, start_date, end_date } = body;

  if (!room_id || !type || !value || !start_date || !end_date) {
    res.status(400).json({
      success: false,
      message: "room_id, type, value, start_date, dan end_date harus diisi",
    });
    return null;
  }

  const roomId = parseInt(room_id as string);
  if (isNaN(roomId)) {
    res
      .status(400)
      .json({ success: false, message: "ID kamar harus berupa angka" });
    return null;
  }

  if (type !== "percentage" && type !== "fixed") {
    res.status(400).json({
      success: false,
      message: "Tipe harus 'percentage' atau 'fixed'",
    });
    return null;
  }

  const numericValue = Number(value);
  if (isNaN(numericValue)) {
    res
      .status(400)
      .json({ success: false, message: "Nilai harus berupa angka" });
    return null;
  }

  const startDate = new Date(start_date);
  const endDate = new Date(end_date);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    res
      .status(400)
      .json({ success: false, message: "Format tanggal tidak valid" });
    return null;
  }

  if (startDate > endDate) {
    res.status(400).json({
      success: false,
      message: "Tanggal mulai harus sebelum tanggal akhir",
    });
    return null;
  }

  return {
    roomId,
    type,
    value: numericValue,
    startDate,
    endDate,
  };
};

export const validateDeletePeakSeasonParams = (
  params: DeletePeakSeasonParams,
  res: Response
): ValidatedDeletePeakSeasonParams | null => {
  const { id } = params;

  if (!id) {
    res.status(400).json({ success: false, message: "ID harus diisi" });
    return null;
  }

  const numericId = parseInt(id as string);
  if (isNaN(numericId)) {
    res.status(400).json({ success: false, message: "ID harus berupa angka" });
    return null;
  }

  return { id: numericId };
};

export const validateListPeakSeasonParams = (
  query: ListPeakSeasonParams,
  res: Response
): ValidatedListPeakSeasonParams | null => {
  const { room_id, month } = query;

  if (!room_id) {
    res.status(400).json({ success: false, message: "ID kamar harus diisi" });
    return null;
  }

  const roomId = parseInt(room_id as string);
  if (isNaN(roomId)) {
    res
      .status(400)
      .json({ success: false, message: "ID kamar harus berupa angka" });
    return null;
  }

  if (month) {
    const [year, monthNum] = month.split("-").map(Number);
    if (!year || !monthNum || monthNum < 1 || monthNum > 12) {
      res.status(400).json({
        success: false,
        message: "Format bulan tidak valid (YYYY-MM)",
      });
      return null;
    }
    const startDate = new Date(year, monthNum - 1, 1);
    const endDate = new Date(year, monthNum, 1);
    return { roomId, startDate, endDate };
  }

  return { roomId };
};
