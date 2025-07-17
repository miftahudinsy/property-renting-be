import { NextFunction, Request, Response } from "express";
import "../../middleware/authMiddleware";
import {
  validateCategoryParams,
  validateCreateCategoryParams,
  validateUpdateCategoryParams,
  validateDeleteCategoryParams,
  validateCreatePropertyParams,
  validateMyPropertiesParams,
  validateOwnedPropertyDetailParams,
  validateUpdatePropertyParams,
  validatePropertyEditParams,
  validateDeletePropertyParams,
} from "../../services/validation/tenantPropertyValidation";
import {
  getPropertyCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getUserProperties,
  createProperty,
  getOwnedPropertyDetail,
  updateProperty,
  getPropertyForEdit,
  deletePropertyById as deletePropertyQuery,
} from "../../services/query/tenantPropertyQuery";
import {
  sendErrorResponse,
  sendCategoriesSuccessResponse,
  sendCategoriesEmptyResponse,
} from "../../services/responseHelper";

export const getPropertyCategoriesByTenant = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedParams = validateCategoryParams(req.query, res);
    if (!validatedParams) return;

    const categories = await getPropertyCategories(validatedParams);

    if (categories.length === 0) {
      sendCategoriesEmptyResponse(res);
      return;
    }

    sendCategoriesSuccessResponse(res, categories);
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

export const createNewCategory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
      return;
    }

    const validatedParams = validateCreateCategoryParams(req.body, res);
    if (!validatedParams) return;

    const newCategory = await createCategory(validatedParams);
    res.status(201).json({
      success: true,
      message: "Kategori berhasil dibuat",
      data: newCategory,
    });
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

export const updateCategoryById = async (
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

    const validatedParams = validateUpdateCategoryParams(
      req.params,
      req.body,
      res
    );
    if (!validatedParams) return;

    const updatedCategory = await updateCategory(validatedParams, userId);
    res.status(200).json({
      success: true,
      message: "Kategori berhasil diperbarui",
      data: updatedCategory,
    });
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

export const deleteCategoryById = async (
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

    const validatedParams = validateDeleteCategoryParams(req.params, res);
    if (!validatedParams) return;

    await deleteCategory(validatedParams, userId);
    res.status(200).json({
      success: true,
      message: "Kategori berhasil dihapus",
    });
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

export const getUserOwnedProperties = async (
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
    const validatedParams = validateMyPropertiesParams(req.query, res);
    if (!validatedParams) return;

    const result = await getUserProperties(userId, validatedParams);
    res.status(200).json({ success: true, ...result });
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

export const createNewProperty = async (
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
    const validatedParams = validateCreatePropertyParams(req.body, res);
    if (!validatedParams) return;

    const newProperty = await createProperty(validatedParams, userId);
    res.status(201).json({
      success: true,
      message: "Properti berhasil dibuat",
      data: newProperty,
    });
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

export const getOwnedPropertyDetailById = async (
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
    const validatedParams = validateOwnedPropertyDetailParams(req.params, res);
    if (!validatedParams) return;

    const property = await getOwnedPropertyDetail(
      validatedParams.propertyId,
      userId
    );
    if (!property) {
      res
        .status(404)
        .json({ success: false, message: "Properti tidak ditemukan" });
      return;
    }
    res.status(200).json({ success: true, data: property });
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

export const getPropertyForEditForm = async (
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
    const validatedParams = validatePropertyEditParams(req.params, res);
    if (!validatedParams) return;

    const property = await getPropertyForEdit(validatedParams, userId);
    if (!property) {
      res
        .status(404)
        .json({ success: false, message: "Properti tidak ditemukan" });
      return;
    }
    res.status(200).json({ success: true, data: property });
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

export const updatePropertyById = async (
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
    const validatedParams = validateUpdatePropertyParams(
      req.params,
      req.body,
      res
    );
    if (!validatedParams) return;

    const updatedProperty = await updateProperty(validatedParams, userId);
    res.status(200).json({
      success: true,
      message: "Properti berhasil diperbarui",
      data: updatedProperty,
    });
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

export const deletePropertyById = async (
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
    const validatedParams = validateDeletePropertyParams(req.params, res);
    if (!validatedParams) return;

    const result = await deletePropertyQuery(
      validatedParams.propertyId,
      userId
    );
    if (!result.success) {
      res.status(400).json(result);
      return;
    }
    res.status(200).json(result);
  } catch (error) {
    sendErrorResponse(res, error);
  }
};
