import { PrismaClient } from "../../../generated/prisma";
import {
  ValidatedGetUnavailabilitiesParams,
  ValidatedCreateUnavailabilityParams,
  ValidatedDeleteUnavailabilityParams,
  ValidatedListRoomUnavailParams,
} from "../validation/roomUnavailabilityValidation";

const prisma = new PrismaClient();

export const getRoomUnavailabilitiesByProperty = async (
  params: ValidatedGetUnavailabilitiesParams,
  tenantId: string
) => {
  const { propertyId, page } = params;
  const limit = 10;
  const offset = (page - 1) * limit;

  const where = {
    rooms: {
      property_id: propertyId,
      properties: {
        tenant_id: tenantId,
      },
    },
  };

  const unavailabilities = await prisma.room_unavailabilities.findMany({
    where,
    include: {
      rooms: {
        select: {
          name: true,
        },
      },
    },
    take: limit,
    skip: offset,
    orderBy: { start_date: "asc" },
  });

  const total = await prisma.room_unavailabilities.count({ where });

  return {
    data: unavailabilities,
    pagination: {
      current_page: page,
      total_pages: Math.ceil(total / limit),
      total_items: total,
    },
  };
};

export const createRoomUnavailability = async (
  params: ValidatedCreateUnavailabilityParams,
  tenantId: string
): Promise<{ success: boolean; message: string; data?: any }> => {
  const { roomId, startDate, endDate } = params;

  const room = await prisma.rooms.findFirst({
    where: { id: roomId, properties: { tenant_id: tenantId } },
  });

  if (!room) {
    return {
      success: false,
      message: "Kamar tidak ditemukan atau Anda tidak punya akses.",
    };
  }

  const overlapping = await prisma.room_unavailabilities.findMany({
    where: {
      room_id: roomId,
      start_date: { lt: endDate },
      end_date: { gt: startDate },
    },
  });

  if (overlapping.length > 0) {
    return {
      success: false,
      message: "Sudah ada jadwal tidak tersedia pada rentang tanggal tersebut.",
    };
  }

  const data = await prisma.room_unavailabilities.create({
    data: {
      room_id: roomId,
      start_date: startDate,
      end_date: endDate,
    },
  });

  return {
    success: true,
    message: "Jadwal tidak tersedia berhasil ditambahkan.",
    data,
  };
};

export const deleteRoomUnavailabilityById = async (
  params: ValidatedDeleteUnavailabilityParams,
  tenantId: string
): Promise<{ success: boolean; message: string; data?: any }> => {
  const { unavailabilityId } = params;

  const unavailability = await prisma.room_unavailabilities.findFirst({
    where: {
      id: unavailabilityId,
      rooms: { properties: { tenant_id: tenantId } },
    },
  });

  if (!unavailability) {
    return {
      success: false,
      message: "Jadwal tidak ditemukan atau Anda tidak punya akses.",
    };
  }

  await prisma.room_unavailabilities.delete({
    where: { id: unavailabilityId },
  });
  return { success: true, message: "Jadwal berhasil dihapus." };
};

export const getRoomUnavailabilitiesByRoom = async (
  params: ValidatedListRoomUnavailParams,
  tenantId: string
): Promise<{ success: boolean; message: string; data?: any[] }> => {
  const { roomId, startDate, endDate } = params;

  const room = await prisma.rooms.findFirst({
    where: { id: roomId, properties: { tenant_id: tenantId } },
  });

  if (!room) {
    return {
      success: false,
      message: "Kamar tidak ditemukan atau Anda tidak punya akses.",
    };
  }

  const unavailabilities = await prisma.room_unavailabilities.findMany({
    where: {
      room_id: roomId,
      start_date: { lt: endDate },
      end_date: { gt: startDate },
    },
    orderBy: { start_date: "asc" },
  });

  return {
    success: true,
    message: "Data berhasil diambil.",
    data: unavailabilities,
  };
};
