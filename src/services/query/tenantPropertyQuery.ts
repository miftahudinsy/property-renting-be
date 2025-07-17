import { PrismaClient, Prisma } from "../../../generated/prisma";
import {
  ValidatedCategoryParams,
  ValidatedCreateCategoryParams,
  ValidatedUpdateCategoryParams,
  ValidatedDeleteCategoryParams,
  ValidatedCreatePropertyParams,
  ValidatedMyPropertiesParams,
  ValidatedUpdatePropertyParams,
  ValidatedPropertyEditParams,
} from "../validation/tenantPropertyValidation";
import { CategoryData } from "../propertyInterfaces";

const prisma = new PrismaClient();

export const getPropertyCategories = async (
  params: ValidatedCategoryParams
) => {
  const { tenantId } = params;
  let whereClause: Prisma.property_categoriesWhereInput = {};

  if (tenantId) {
    whereClause = {
      OR: [{ tenant_id: tenantId }, { tenant_id: null }],
    };
  }

  return await prisma.property_categories.findMany({
    where: whereClause,
    select: {
      id: true,
      name: true,
      tenant_id: true,
    },
    orderBy: {
      name: "asc",
    },
  });
};

export const createCategory = async (params: ValidatedCreateCategoryParams) => {
  const { name, tenantId } = params;

  // Cek apakah tenant ada
  const tenant = await prisma.auth_users.findUnique({
    where: { id: tenantId },
  });

  if (!tenant) {
    throw new Error("Tenant tidak ditemukan");
  }

  return await prisma.property_categories.create({
    data: {
      name,
      tenant_id: tenantId,
    },
  });
};

export const updateCategory = async (
  params: ValidatedUpdateCategoryParams,
  userId: string
) => {
  const { categoryId, name } = params;

  const category = await prisma.property_categories.findFirst({
    where: {
      id: categoryId,
      tenant_id: userId,
    },
  });

  if (!category) {
    throw new Error("Kategori tidak ditemukan atau Anda tidak punya akses");
  }

  return await prisma.property_categories.update({
    where: {
      id: categoryId,
    },
    data: {
      name,
    },
  });
};

export const deleteCategory = async (
  params: ValidatedDeleteCategoryParams,
  userId: string
) => {
  const { categoryId } = params;

  const category = await prisma.property_categories.findFirst({
    where: {
      id: categoryId,
      tenant_id: userId,
    },
  });

  if (!category) {
    throw new Error("Kategori tidak ditemukan atau Anda tidak punya akses");
  }

  return await prisma.property_categories.delete({
    where: {
      id: categoryId,
    },
  });
};

export const getUserProperties = async (
  userId: string,
  params: ValidatedMyPropertiesParams
) => {
  const { page, all } = params;
  const limit = 5;
  const offset = (page - 1) * limit;

  const whereClause: Prisma.propertiesWhereInput = {
    tenant_id: userId,
  };

  const properties = await prisma.properties.findMany({
    where: whereClause,
    include: {
      cities: {
        select: {
          name: true,
        },
      },
      property_categories: {
        select: {
          name: true,
        },
      },
      property_pictures: {
        where: { is_main: true },
        select: { file_path: true },
      },
      rooms: {
        select: {
          price: true,
        },
      },
    },
    orderBy: {
      created_at: "desc",
    },
    ...(!all && { take: limit, skip: offset }),
  });

  const totalProperties = await prisma.properties.count({ where: whereClause });

  const processedProperties = properties.map((p) => ({
    ...p,
    price: p.rooms.length > 0 ? Math.min(...p.rooms.map((r) => r.price)) : 0,
  }));

  const totalPages = all ? 1 : Math.ceil(totalProperties / limit);

  return {
    data: processedProperties,
    pagination: {
      current_page: page,
      total_pages: totalPages,
      total_items: totalProperties,
      has_prev_page: page > 1,
      has_next_page: page < totalPages,
    },
  };
};

export const createProperty = async (
  params: ValidatedCreatePropertyParams,
  tenantId: string
) => {
  const { name, description, location, categoryId, cityId } = params;

  const data: Prisma.propertiesCreateInput = {
    name,
    description,
    location,
    users: {
      connect: { id: tenantId },
    },
  };

  if (categoryId) {
    data.property_categories = { connect: { id: categoryId } };
  }

  if (cityId) {
    data.cities = { connect: { id: cityId } };
  }

  return await prisma.properties.create({
    data,
  });
};

export const getOwnedPropertyDetail = async (
  propertyId: number,
  userId: string
) => {
  return await prisma.properties.findFirst({
    where: {
      id: propertyId,
      tenant_id: userId,
    },
    include: {
      property_categories: { select: { name: true } },
      cities: { select: { name: true, type: true } },
      property_pictures: {
        select: { id: true, file_path: true, is_main: true },
        orderBy: [{ is_main: "desc" }, { id: "asc" }],
      },
    },
  });
};

export const updateProperty = async (
  params: ValidatedUpdatePropertyParams,
  tenantId: string
) => {
  const { propertyId, name, description, location, categoryId, cityId } =
    params;

  const property = await prisma.properties.findFirst({
    where: { id: propertyId, tenant_id: tenantId },
  });

  if (!property) {
    throw new Error("Properti tidak ditemukan atau Anda tidak punya akses");
  }

  const data: Prisma.propertiesUpdateInput = {};

  if (name) data.name = name;
  if (description) data.description = description;
  if (location) data.location = location;
  if (categoryId) data.property_categories = { connect: { id: categoryId } };
  if (cityId) data.cities = { connect: { id: cityId } };

  return await prisma.properties.update({
    where: { id: propertyId },
    data,
  });
};

export const getPropertyForEdit = async (
  params: ValidatedPropertyEditParams,
  userId: string
) => {
  const { propertyId } = params;
  return await prisma.properties.findFirst({
    where: { id: propertyId, tenant_id: userId },
    select: {
      id: true,
      name: true,
      description: true,
      location: true,
      category_id: true,
      city_id: true,
    },
  });
};

export const deletePropertyById = async (
  propertyId: number,
  tenantId: string
): Promise<{ success: boolean; message: string; data?: any }> => {
  const property = await prisma.properties.findFirst({
    where: { id: propertyId, tenant_id: tenantId },
    include: { rooms: true },
  });

  if (!property) {
    return {
      success: false,
      message: "Properti tidak ditemukan atau Anda tidak memiliki akses.",
    };
  }

  if (property.rooms.length > 0) {
    return {
      success: false,
      message:
        "Properti tidak dapat dihapus karena masih memiliki kamar. Hapus semua kamar terlebih dahulu.",
    };
  }

  await prisma.properties.delete({ where: { id: propertyId } });
  return { success: true, message: "Properti berhasil dihapus." };
};
