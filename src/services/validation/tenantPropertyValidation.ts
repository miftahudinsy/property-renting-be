import { Response } from "express";

// Interfaces for request parameters
interface CategoryParams {
  tenant_id?: string;
}

interface CreateCategoryParams {
  name?: string;
  tenant_id?: string;
}

interface UpdateCategoryParams {
  category_id?: string;
  name?: string;
}

interface DeleteCategoryParams {
  category_id?: string;
}

interface CreatePropertyParams {
  name?: string;
  description?: string;
  location?: string;
  category_id?: string;
  city_id?: string;
}

interface MyPropertiesParams {
  page?: string;
  all?: string;
}

interface OwnedPropertyDetailParams {
  property_id?: string;
}

interface UpdatePropertyParams {
  property_id?: string;
  name?: string;
  description?: string;
  location?: string;
  category_id?: string;
  city_id?: string;
}

interface PropertyEditParams {
  property_id?: string;
}

interface DeletePropertyParams {
  property_id?: string;
}

// Interfaces for validated parameters
export interface ValidatedCategoryParams {
  tenantId?: string;
}

export interface ValidatedCreateCategoryParams {
  name: string;
  tenantId: string;
}

export interface ValidatedUpdateCategoryParams {
  categoryId: number;
  name?: string;
}

export interface ValidatedDeleteCategoryParams {
  categoryId: number;
}

export interface ValidatedCreatePropertyParams {
  name: string;
  description: string;
  location: string;
  categoryId?: number;
  cityId?: number;
}

export interface ValidatedMyPropertiesParams {
  page: number;
  all: boolean;
}

export interface ValidatedOwnedPropertyDetailParams {
  propertyId: number;
}

export interface ValidatedUpdatePropertyParams {
  propertyId: number;
  name?: string;
  description?: string;
  location?: string;
  categoryId?: number;
  cityId?: number;
}

export interface ValidatedPropertyEditParams {
  propertyId: number;
}

export interface ValidatedDeletePropertyParams {
  propertyId: number;
}

// Validation functions
export const validateCategoryParams = (
  params: CategoryParams,
  res: Response
): ValidatedCategoryParams | null => {
  const { tenant_id } = params;

  if (!tenant_id) {
    // tenant_id is optional, so no error if it's missing
    return { tenantId: undefined };
  }

  return {
    tenantId: tenant_id as string,
  };
};

export const validateCreateCategoryParams = (
  body: CreateCategoryParams,
  res: Response
): ValidatedCreateCategoryParams | null => {
  const { name, tenant_id } = body;

  if (!name || !tenant_id) {
    res.status(400).json({
      success: false,
      message: "Nama kategori dan tenant_id harus diisi",
    });
    return null;
  }

  if (typeof name !== "string" || name.trim().length === 0) {
    res.status(400).json({
      success: false,
      message: "Nama kategori harus berupa string yang tidak kosong",
    });
    return null;
  }

  return {
    name: name.trim(),
    tenantId: tenant_id,
  };
};

export const validateUpdateCategoryParams = (
  params: UpdateCategoryParams,
  body: UpdateCategoryParams,
  res: Response
): ValidatedUpdateCategoryParams | null => {
  const { category_id } = params;
  const { name } = body;

  if (!category_id) {
    res.status(400).json({
      success: false,
      message: "ID kategori harus diisi",
    });
    return null;
  }

  const categoryId = parseInt(category_id as string);
  if (isNaN(categoryId)) {
    res
      .status(400)
      .json({ success: false, message: "ID kategori harus berupa angka" });
    return null;
  }

  if (name !== undefined) {
    if (typeof name !== "string" || name.trim().length === 0) {
      res.status(400).json({
        success: false,
        message: "Nama kategori harus berupa string yang tidak kosong",
      });
      return null;
    }
  }

  return {
    categoryId,
    name: name ? name.trim() : undefined,
  };
};

export const validateDeleteCategoryParams = (
  params: DeleteCategoryParams,
  res: Response
): ValidatedDeleteCategoryParams | null => {
  const { category_id } = params;

  if (!category_id) {
    res.status(400).json({
      success: false,
      message: "ID kategori harus diisi",
    });
    return null;
  }

  const categoryId = parseInt(category_id as string);
  if (isNaN(categoryId)) {
    res
      .status(400)
      .json({ success: false, message: "ID kategori harus berupa angka" });
    return null;
  }

  return { categoryId };
};

export const validateCreatePropertyParams = (
  body: CreatePropertyParams,
  res: Response
): ValidatedCreatePropertyParams | null => {
  const { name, description, location, category_id, city_id } = body;

  if (!name || !description || !location) {
    res.status(400).json({
      success: false,
      message: "Nama, deskripsi, dan lokasi properti harus diisi",
    });
    return null;
  }

  if (
    typeof name !== "string" ||
    name.trim().length === 0 ||
    typeof description !== "string" ||
    description.trim().length === 0 ||
    typeof location !== "string" ||
    location.trim().length === 0
  ) {
    res.status(400).json({
      success: false,
      message: "Nama, deskripsi, dan lokasi harus berupa string yang valid",
    });
    return null;
  }

  const categoryId = category_id ? parseInt(category_id as string) : undefined;
  if (category_id && isNaN(categoryId as number)) {
    res
      .status(400)
      .json({ success: false, message: "ID kategori harus berupa angka" });
    return null;
  }

  const cityId = city_id ? parseInt(city_id as string) : undefined;
  if (city_id && isNaN(cityId as number)) {
    res
      .status(400)
      .json({ success: false, message: "ID kota harus berupa angka" });
    return null;
  }

  return {
    name: name.trim(),
    description: description.trim(),
    location: location.trim(),
    categoryId,
    cityId,
  };
};

export const validateMyPropertiesParams = (
  query: MyPropertiesParams,
  res: Response
): ValidatedMyPropertiesParams | null => {
  const { page, all } = query;
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

  return { page: pageNumber, all: showAll };
};

export const validateOwnedPropertyDetailParams = (
  params: OwnedPropertyDetailParams,
  res: Response
): ValidatedOwnedPropertyDetailParams | null => {
  const { property_id } = params;

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

  return { propertyId };
};

export const validateUpdatePropertyParams = (
  params: UpdatePropertyParams,
  body: UpdatePropertyParams,
  res: Response
): ValidatedUpdatePropertyParams | null => {
  const { property_id } = params;
  const { name, description, location, category_id, city_id } = body;

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

  if (
    (name && typeof name !== "string") ||
    (description && typeof description !== "string") ||
    (location && typeof location !== "string")
  ) {
    res.status(400).json({
      success: false,
      message: "Nama, deskripsi, dan lokasi harus berupa string",
    });
    return null;
  }

  const categoryId = category_id ? parseInt(category_id as string) : undefined;
  if (category_id && isNaN(categoryId as number)) {
    res
      .status(400)
      .json({ success: false, message: "ID kategori harus berupa angka" });
    return null;
  }

  const cityId = city_id ? parseInt(city_id as string) : undefined;
  if (city_id && isNaN(cityId as number)) {
    res
      .status(400)
      .json({ success: false, message: "ID kota harus berupa angka" });
    return null;
  }

  return {
    propertyId,
    name: name ? name.trim() : undefined,
    description: description ? description.trim() : undefined,
    location: location ? location.trim() : undefined,
    categoryId,
    cityId,
  };
};

export const validatePropertyEditParams = (
  params: PropertyEditParams,
  res: Response
): ValidatedPropertyEditParams | null => {
  const { property_id } = params;

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

  return { propertyId };
};

export const validateDeletePropertyParams = (
  params: DeletePropertyParams,
  res: Response
): ValidatedDeletePropertyParams | null => {
  const { property_id } = params;

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

  return { propertyId };
};
