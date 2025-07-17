import { PrismaClient, Prisma } from "../../../generated/prisma";
import {
  ValidatedCreateRoomParams,
  ValidatedOwnedRoomsParams,
  ValidatedRoomEditParams,
  ValidatedUpdateRoomParams,
} from "../validation/tenantRoomValidation";

const prisma = new PrismaClient();

export const createRoom = async (
  params: ValidatedCreateRoomParams,
  userId: string
) => {
  const { name, description, price, maxGuests, quantity, propertyId } = params;

  // Verify that the property belongs to the user
  const property = await prisma.properties.findFirst({
    where: { id: propertyId, tenant_id: userId },
  });

  if (!property) {
    throw new Error("Properti tidak ditemukan atau Anda tidak punya akses");
  }

  return await prisma.rooms.create({
    data: {
      name,
      description,
      price,
      max_guests: maxGuests,
      quantity,
      properties: {
        connect: { id: propertyId },
      },
    },
  });
};

export const getOwnedRooms = async (
  params: ValidatedOwnedRoomsParams,
  userId: string
) => {
  const { page, propertyId, all } = params;
  const limit = 5;
  const offset = (page - 1) * limit;

  let whereClause: Prisma.roomsWhereInput = {
    properties: {
      tenant_id: userId,
    },
  };

  if (propertyId) {
    whereClause = {
      ...whereClause,
      property_id: propertyId,
    };
  }

  const rooms = await prisma.rooms.findMany({
    where: whereClause,
    include: {
      properties: {
        select: {
          name: true,
        },
      },
      room_pictures: {
        select: {
          file_path: true,
        },
        take: 1,
      },
    },
    orderBy: {
      created_at: "desc",
    },
    ...(!all && { take: limit, skip: offset }),
  });

  const totalRooms = await prisma.rooms.count({ where: whereClause });

  return {
    data: rooms,
    pagination: {
      current_page: page,
      total_pages: all ? 1 : Math.ceil(totalRooms / limit),
      total_items: totalRooms,
    },
  };
};

export const getRoomForEdit = async (
  params: ValidatedRoomEditParams,
  userId: string
) => {
  const { roomId } = params;

  return await prisma.rooms.findFirst({
    where: {
      id: roomId,
      properties: {
        tenant_id: userId,
      },
    },
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      max_guests: true,
      quantity: true,
      property_id: true,
    },
  });
};

export const updateRoom = async (
  params: ValidatedUpdateRoomParams,
  userId: string
) => {
  const { roomId, name, description, price, maxGuests, quantity } = params;

  // Verify that the room belongs to the user
  const room = await prisma.rooms.findFirst({
    where: {
      id: roomId,
      properties: {
        tenant_id: userId,
      },
    },
  });

  if (!room) {
    throw new Error("Kamar tidak ditemukan atau Anda tidak punya akses");
  }

  const data: Prisma.roomsUpdateInput = {};
  if (name) data.name = name;
  if (description) data.description = description;
  if (price) data.price = price;
  if (maxGuests) data.max_guests = maxGuests;
  if (quantity) data.quantity = quantity;

  return await prisma.rooms.update({
    where: {
      id: roomId,
    },
    data,
  });
};

export const deleteRoomById = async (
  roomId: number,
  tenantId: string
): Promise<{ success: boolean; message: string; data?: any }> => {
  const room = await prisma.rooms.findFirst({
    where: {
      id: roomId,
      properties: {
        tenant_id: tenantId,
      },
    },
    include: {
      bookings: {
        where: {
          status_id: {
            in: [2, 3], // 2 = Confirmed, 3 = Payment Received
          },
          check_out: {
            gte: new Date(),
          },
        },
      },
    },
  });

  if (!room) {
    return {
      success: false,
      message: "Kamar tidak ditemukan atau Anda tidak memiliki akses.",
    };
  }

  if (room.bookings.length > 0) {
    return {
      success: false,
      message:
        "Kamar tidak dapat dihapus karena memiliki booking aktif atau yang akan datang.",
    };
  }

  await prisma.rooms.delete({ where: { id: roomId } });

  return { success: true, message: "Kamar berhasil dihapus." };
};
