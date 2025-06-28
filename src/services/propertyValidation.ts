import { Response } from "express";

interface SearchParams {
  city_id?: string;
  check_in?: string;
  check_out?: string;
  guests?: string;
  page?: string;
  property_name?: string;
  category_name?: string;
  sort_by?: string;
  sort_order?: string;
}

interface DetailParams {
  property_id?: string;
  check_in?: string;
  check_out?: string;
  guests?: string;
}

export interface ValidatedSearchParams {
  cityId: number;
  checkInDate: Date;
  checkOutDate: Date;
  guestCount: number;
  pageNumber: number;
  propertyName?: string;
  categoryName?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface ValidatedDetailParams {
  propertyId: number;
  checkInDate: Date;
  checkOutDate: Date;
  guestCount: number;
}

export const validateSearchParams = (
  params: SearchParams,
  res: Response
): ValidatedSearchParams | null => {
  const {
    city_id,
    check_in,
    check_out,
    guests,
    page,
    property_name,
    category_name,
    sort_by,
    sort_order,
  } = params;

  // Validasi input wajib
  if (!city_id || !check_in || !check_out || !guests) {
    res.status(400).json({
      success: false,
      message: "city_id, check_in, check_out, dan guests harus diisi",
    });
    return null;
  }

  const pageNumber = parseInt(page as string) || 1;

  // Validasi page number
  if (pageNumber < 1) {
    res.status(400).json({
      success: false,
      message: "Page number harus lebih besar dari 0",
    });
    return null;
  }

  // Validasi sort parameters
  const validSortBy = ["name", "price"];
  const validSortOrder = ["asc", "desc"];

  if (sort_by && !validSortBy.includes(sort_by as string)) {
    res.status(400).json({
      success: false,
      message: "sort_by harus 'name' atau 'price'",
    });
    return null;
  }

  if (sort_order && !validSortOrder.includes(sort_order as string)) {
    res.status(400).json({
      success: false,
      message: "sort_order harus 'asc' atau 'desc'",
    });
    return null;
  }

  const cityId = parseInt(city_id as string);
  const guestCount = parseInt(guests as string);
  const checkInDate = new Date(check_in as string);
  const checkOutDate = new Date(check_out as string);

  // Validasi tanggal
  if (checkInDate >= checkOutDate) {
    res.status(400).json({
      success: false,
      message: "Tanggal check_in harus sebelum check_out",
    });
    return null;
  }

  // Validasi tanggal tidak boleh di masa lalu
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (checkInDate < today) {
    res.status(400).json({
      success: false,
      message: "Tanggal check_in tidak boleh di masa lalu",
    });
    return null;
  }

  return {
    cityId,
    checkInDate,
    checkOutDate,
    guestCount,
    pageNumber,
    propertyName: property_name as string,
    categoryName: category_name as string,
    sortBy: sort_by as string,
    sortOrder: sort_order as string,
  };
};

export const validatePagination = (
  pageNumber: number,
  totalPages: number,
  res: Response
): boolean => {
  if (pageNumber > totalPages && totalPages > 0) {
    res.status(400).json({
      success: false,
      message: `Page ${pageNumber} tidak tersedia. Total page: ${totalPages}`,
    });
    return false;
  }
  return true;
};

export const validateDetailParams = (
  params: DetailParams,
  res: Response
): ValidatedDetailParams | null => {
  const { property_id, check_in, check_out, guests } = params;

  // Validasi input wajib
  if (!property_id || !check_in || !check_out || !guests) {
    res.status(400).json({
      success: false,
      message: "property_id, check_in, check_out, dan guests harus diisi",
    });
    return null;
  }

  const propertyId = parseInt(property_id as string);
  const guestCount = parseInt(guests as string);
  const checkInDate = new Date(check_in as string);
  const checkOutDate = new Date(check_out as string);

  // Validasi property_id adalah number yang valid
  if (isNaN(propertyId) || propertyId <= 0) {
    res.status(400).json({
      success: false,
      message: "property_id harus berupa angka yang valid",
    });
    return null;
  }

  // Validasi guests adalah number yang valid
  if (isNaN(guestCount) || guestCount <= 0) {
    res.status(400).json({
      success: false,
      message: "guests harus berupa angka yang valid",
    });
    return null;
  }

  // Validasi tanggal
  if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
    res.status(400).json({
      success: false,
      message: "Format tanggal tidak valid",
    });
    return null;
  }

  if (checkInDate >= checkOutDate) {
    res.status(400).json({
      success: false,
      message: "Tanggal check_in harus sebelum check_out",
    });
    return null;
  }

  // Validasi tanggal tidak boleh di masa lalu
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (checkInDate < today) {
    res.status(400).json({
      success: false,
      message: "Tanggal check_in tidak boleh di masa lalu",
    });
    return null;
  }

  return {
    propertyId,
    checkInDate,
    checkOutDate,
    guestCount,
  };
};
