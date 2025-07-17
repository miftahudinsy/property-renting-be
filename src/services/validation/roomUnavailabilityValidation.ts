import { Response } from "express";

// Interfaces for request parameters
interface GetUnavailabilitiesParams {
  property_id?: string;
  page?: string;
}

interface CreateUnavailabilityParams {
  room_id?: string;
  start_date?: string;
  end_date?: string;
}

interface DeleteUnavailabilityParams {
  id?: string;
}

interface ListRoomUnavailParams {
  room_id?: string;
  month?: string; // Format YYYY-MM
}

// Interfaces for validated parameters
export interface ValidatedGetUnavailabilitiesParams {
  propertyId: number;
  page: number;
}

export interface ValidatedCreateUnavailabilityParams {
  roomId: number;
  startDate: Date;
  endDate: Date;
}

export interface ValidatedDeleteUnavailabilityParams {
  unavailabilityId: number;
}

export interface ValidatedListRoomUnavailParams {
  roomId: number;
  startDate: Date;
  endDate: Date;
}

// Validation functions
export const validateGetUnavailabilitiesParams = (
  query: GetUnavailabilitiesParams,
  res: Response
): ValidatedGetUnavailabilitiesParams | null => {
  const { property_id, page } = query;

  if (!property_id) {
    res.status(400).json({
      success: false,
      message: "ID properti harus diisi",
    });
    return null;
  }

  const propertyId = parseInt(property_id as string);
  if (isNaN(propertyId)) {
    res
      .status(400)
      .json({ success: false, message: "ID properti harus berupa angka" });
    return null;
  }

  const pageNumber = parseInt(page as string) || 1;
  if (pageNumber < 1) {
    res.status(400).json({
      success: false,
      message: "Nomor halaman harus lebih besar dari 0",
    });
    return null;
  }

  return { propertyId, page: pageNumber };
};

export const validateCreateUnavailabilityParams = (
  body: CreateUnavailabilityParams,
  res: Response
): ValidatedCreateUnavailabilityParams | null => {
  const { room_id, start_date, end_date } = body;

  if (!room_id || !start_date || !end_date) {
    res.status(400).json({
      success: false,
      message: "room_id, start_date, dan end_date harus diisi",
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

  const startDate = new Date(start_date);
  const endDate = new Date(end_date);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    res
      .status(400)
      .json({ success: false, message: "Format tanggal tidak valid" });
    return null;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (startDate < today) {
    res.status(400).json({
      success: false,
      message: "Tanggal mulai tidak boleh di masa lalu",
    });
    return null;
  }

  if (startDate > endDate) {
    res.status(400).json({
      success: false,
      message: "Tanggal mulai harus sebelum tanggal akhir",
    });
    return null;
  }

  return { roomId, startDate, endDate };
};

export const validateDeleteUnavailabilityParams = (
  params: DeleteUnavailabilityParams,
  res: Response
): ValidatedDeleteUnavailabilityParams | null => {
  const { id } = params;

  if (!id) {
    res.status(400).json({ success: false, message: "ID harus diisi" });
    return null;
  }

  const unavailabilityId = parseInt(id as string);
  if (isNaN(unavailabilityId)) {
    res.status(400).json({
      success: false,
      message: "ID ketidaktersediaan harus berupa angka",
    });
    return null;
  }

  return { unavailabilityId };
};

export const validateListRoomUnavailParams = (
  query: ListRoomUnavailParams,
  res: Response
): ValidatedListRoomUnavailParams | null => {
  const { room_id, month } = query;

  if (!room_id || !month) {
    res
      .status(400)
      .json({ success: false, message: "room_id dan month harus diisi" });
    return null;
  }

  const roomId = parseInt(room_id as string);
  if (isNaN(roomId)) {
    res
      .status(400)
      .json({ success: false, message: "ID kamar harus berupa angka" });
    return null;
  }

  const [year, monthNum] = month.split("-").map(Number);
  if (!year || !monthNum || monthNum < 1 || monthNum > 12) {
    res
      .status(400)
      .json({ success: false, message: "Format bulan tidak valid (YYYY-MM)" });
    return null;
  }

  const startDate = new Date(Date.UTC(year, monthNum - 1, 1));
  const endDate = new Date(Date.UTC(year, monthNum, 1));

  return { roomId, startDate, endDate };
};
