import { NextFunction, Request, Response } from "express";
import {
  validateSearchParams,
  validatePagination,
  validateDetailParams,
  validateCalendarParams,
} from "../../services/validation/publicPropertyValidation";
import {
  buildWhereClause,
  getAvailableProperties,
  getPropertyDetail,
  getPropertyForCalendar,
} from "../../services/query/publicPropertyQuery";
import {
  processRoomsAvailability,
  transformPropertyData,
  sortProperties,
  applyPagination,
  ProcessedProperty,
  processPropertyDetail,
} from "../../services/propertyProcessor";
import {
  sendSuccessResponse,
  sendEmptyResponse,
  sendErrorResponse,
  sendPropertyDetailResponse,
  sendPropertyNotFoundResponse,
  sendNoAvailableRoomsResponse,
  sendCalendarResponse,
  sendCalendarNotFoundResponse,
} from "../../services/responseHelper";
import { processCalendarData } from "../../services/calendarProcessor";

export const searchProperties = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedParams = validateSearchParams(req.query, res);
    if (!validatedParams) return;

    const { pageNumber, sortBy, sortOrder } = validatedParams;
    const whereClause = buildWhereClause(validatedParams);
    const availableProperties = await getAvailableProperties(
      whereClause,
      validatedParams
    );

    const processedProperties: ProcessedProperty[] = [];
    for (const property of availableProperties) {
      const availableRooms = processRoomsAvailability(property);
      if (availableRooms.length > 0) {
        const processedProperty = transformPropertyData(
          property,
          availableRooms
        );
        processedProperties.push(processedProperty);
      }
    }

    const sortedProperties = sortProperties(
      processedProperties,
      sortBy,
      sortOrder
    );

    if (sortedProperties.length === 0) {
      sendEmptyResponse(res, pageNumber);
      return;
    }

    const paginatedResult = applyPagination(sortedProperties, pageNumber);

    if (
      !validatePagination(
        pageNumber,
        paginatedResult.pagination.total_pages,
        res
      )
    ) {
      return;
    }

    const categories = availableProperties.map(
      (property) => property.property_categories
    );

    sendSuccessResponse(
      res,
      paginatedResult.data,
      categories,
      paginatedResult.pagination
    );
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

export const getPropertyDetailById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedParams = validateDetailParams(req.query, res);
    if (!validatedParams) return;

    const property = await getPropertyDetail(validatedParams);

    if (!property) {
      sendPropertyNotFoundResponse(res);
      return;
    }

    const processedProperty = processPropertyDetail(property);

    if (processedProperty.available_rooms.length === 0) {
      sendNoAvailableRoomsResponse(res);
      return;
    }

    sendPropertyDetailResponse(res, processedProperty);
  } catch (error) {
    sendErrorResponse(res, error);
  }
};

export const getPropertyCalendar = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const validatedParams = validateCalendarParams(req.query, req.params, res);
    if (!validatedParams) return;

    const { propertyId, year, month } = validatedParams;

    const property = await getPropertyForCalendar(propertyId, year, month);

    if (!property) {
      sendCalendarNotFoundResponse(res);
      return;
    }

    const calendarData = processCalendarData(property, year, month, propertyId);
    sendCalendarResponse(res, calendarData);
  } catch (error) {
    sendErrorResponse(res, error);
  }
};
