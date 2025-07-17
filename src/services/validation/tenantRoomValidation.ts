import { Response } from "express";

// Interfaces for request parameters
interface CreateRoomParams {
  name?: string;
  description?: string;
  price?: string;
  max_guests?: string;
  quantity?: string;
  property_id?: string;
}

interface OwnedRoomsParams {
  page?: string;
  property_id?: string;
  all?: string;
}

interface RoomEditParams {
  room_id?: string;
}

interface UpdateRoomParams {
  room_id?: string;
  name?: string;
  description?: string;
  price?: string;
  max_guests?: string;
  quantity?: string;
}

interface DeleteRoomParams {
  room_id?: string;
}

// Interfaces for validated parameters
export interface ValidatedCreateRoomParams {
  name: string;
  description: string;
  price: number;
  maxGuests: number;
  quantity: number;
  propertyId: number;
}

export interface ValidatedOwnedRoomsParams {
  page: number;
  propertyId?: number;
  all: boolean;
}

export interface ValidatedRoomEditParams {
  roomId: number;
}

export interface ValidatedUpdateRoomParams {
  roomId: number;
  name?: string;
  description?: string;
  price?: number;
  maxGuests?: number;
  quantity?: number;
}

export interface ValidatedDeleteRoomParams {
  roomId: number;
}

// Validation functions
export const validateCreateRoomParams = (
  body: CreateRoomParams,
  res: Response
): ValidatedCreateRoomParams | null => {
  const { name, description, price, max_guests, quantity, property_id } = body;

  if (
    !name ||
    !description ||
    !price ||
    !max_guests ||
    !quantity ||
    !property_id
  ) {
    res.status(400).json({
      success: false,
      message:
        "name, description, price, max_guests, quantity, dan property_id harus diisi",
    });
    return null;
  }

  const priceNum = parseFloat(price as string);
  const maxGuestsNum = parseInt(max_guests as string);
  const quantityNum = parseInt(quantity as string);
  const propertyIdNum = parseInt(property_id as string);

  if (
    isNaN(priceNum) ||
    isNaN(maxGuestsNum) ||
    isNaN(quantityNum) ||
    isNaN(propertyIdNum)
  ) {
    res.status(400).json({
      success: false,
      message:
        "price, max_guests, quantity, dan property_id harus berupa angka",
    });
    return null;
  }

  if (priceNum <= 0 || maxGuestsNum <= 0 || quantityNum < 0) {
    res.status(400).json({
      success: false,
      message:
        "price dan max_guests harus lebih besar dari 0, dan quantity tidak boleh negatif",
    });
    return null;
  }

  return {
    name,
    description,
    price: priceNum,
    maxGuests: maxGuestsNum,
    quantity: quantityNum,
    propertyId: propertyIdNum,
  };
};

export const validateOwnedRoomsParams = (
  query: OwnedRoomsParams,
  res: Response
): ValidatedOwnedRoomsParams | null => {
  const { page, property_id, all } = query;
  const pageNumber = parseInt(page as string) || 1;
  const showAll = all === "true";

  if (pageNumber < 1) {
    res
      .status(400)
      .json({
        success: false,
        message: "Nomor halaman harus lebih besar dari 0",
      });
    return null;
  }

  const propertyId = property_id ? parseInt(property_id as string) : undefined;
  if (property_id && isNaN(propertyId as number)) {
    res
      .status(400)
      .json({ success: false, message: "ID properti harus berupa angka" });
    return null;
  }

  return { page: pageNumber, propertyId, all: showAll };
};

export const validateRoomEditParams = (
  params: RoomEditParams,
  res: Response
): ValidatedRoomEditParams | null => {
  const { room_id } = params;

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

  return { roomId };
};

export const validateUpdateRoomParams = (
  params: UpdateRoomParams,
  body: UpdateRoomParams,
  res: Response
): ValidatedUpdateRoomParams | null => {
  const { room_id } = params;
  const { name, description, price, max_guests, quantity } = body;

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

  const priceNum = price ? parseFloat(price as string) : undefined;
  const maxGuestsNum = max_guests ? parseInt(max_guests as string) : undefined;
  const quantityNum = quantity ? parseInt(quantity as string) : undefined;

  if (
    (price && isNaN(priceNum as number)) ||
    (max_guests && isNaN(maxGuestsNum as number)) ||
    (quantity && isNaN(quantityNum as number))
  ) {
    res.status(400).json({
      success: false,
      message: "price, max_guests, dan quantity harus berupa angka",
    });
    return null;
  }

  if (
    (priceNum !== undefined && priceNum <= 0) ||
    (maxGuestsNum !== undefined && maxGuestsNum <= 0) ||
    (quantityNum !== undefined && quantityNum < 0)
  ) {
    res.status(400).json({
      success: false,
      message:
        "price dan max_guests harus lebih besar dari 0, dan quantity tidak boleh negatif",
    });
    return null;
  }

  return {
    roomId,
    name,
    description,
    price: priceNum,
    maxGuests: maxGuestsNum,
    quantity: quantityNum,
  };
};

export const validateDeleteRoomParams = (
  params: DeleteRoomParams,
  res: Response
): ValidatedDeleteRoomParams | null => {
  const { room_id } = params;

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

  return { roomId };
};
