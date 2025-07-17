import {
  ProcessedProperty,
  ProcessedRoom,
  PropertyDetail,
  CalendarDay,
  CalendarData,
  Booking,
  RoomUnavailability,
  PeakSeasonRate,
  PropertyPicture,
  RoomPicture,
  PropertyCategory,
  City,
  PrismaPropertyResult,
  PrismaCalendarResult,
} from "./propertyInterfaces";

// Interface untuk Prisma query results yang kompleks
export interface PropertyWithRooms {
  id: number;
  name: string;
  location: string;
  description?: string;
  property_categories?: PropertyCategory | null;
  cities?: City | null;
  city_id: number;
  property_pictures: PropertyPicture[];
  rooms: RoomWithRelations[];
}

export interface RoomWithRelations {
  id: number;
  name: string;
  description: string;
  price: number;
  max_guests: number;
  quantity: number;
  bookings: Booking[];
  room_unavailabilities: RoomUnavailability[];
  peak_season_rates: PeakSeasonRate[];
  room_pictures?: RoomPictureWithUrl[];
}

export interface RoomPictureWithUrl extends RoomPicture {
  public_url?: string;
}

export interface PropertyPictureWithUrl extends PropertyPicture {
  public_url?: string;
}

export interface ProcessedRoomWithPictures extends ProcessedRoom {
  // Interface ini sudah tidak diperlukan karena ProcessedRoom sudah include room_pictures
}

export const processRoomsAvailability = (
  property: PrismaPropertyResult
): ProcessedRoom[] => {
  const availableRooms: ProcessedRoom[] = [];

  for (const room of property.rooms) {
    // Hitung jumlah room yang sudah di-booking pada tanggal tersebut
    const bookedRoomsCount = room.bookings.length;

    // Cek apakah ada room unavailability pada tanggal tersebut
    const hasUnavailability = room.room_unavailabilities.length > 0;

    // Hitung available quantity
    const availableQuantity = hasUnavailability
      ? 0
      : room.quantity - bookedRoomsCount;

    if (availableQuantity >= 0) {
      // Hitung harga dengan peak season rate jika ada
      let finalPrice = room.price;

      if (room.peak_season_rates.length > 0) {
        const peakRate = room.peak_season_rates[0];
        if (peakRate.type === "percentage") {
          finalPrice = room.price + (room.price * peakRate.value) / 100;
        } else if (peakRate.type === "fixed") {
          finalPrice = room.price + peakRate.value;
        }
      }

      availableRooms.push({
        id: room.id,
        name: room.name,
        description: room.description,
        price: room.price,
        max_guests: room.max_guests,
        quantity: room.quantity,
        available_quantity: availableQuantity,
        final_price: finalPrice,
        bookings: room.bookings,
        room_unavailabilities: room.room_unavailabilities,
        peak_season_rates: room.peak_season_rates,
        room_pictures:
          room.room_pictures?.map((pic) => ({
            id: pic.id || 0,
            file_path: pic.file_path || null,
          })) || [],
      });
    }
  }

  return availableRooms;
};

export const transformPropertyData = (
  property: PrismaPropertyResult,
  availableRooms: ProcessedRoom[]
): ProcessedProperty => {
  // Ambil harga termurah dari room yang tersedia
  const cheapestRoom = availableRooms.reduce((prev, current) =>
    prev.final_price < current.final_price ? prev : current
  );

  return {
    property_id: property.id,
    name: property.name,
    location: property.location || "",
    category: property.property_categories?.name || null,
    city_id: property.city_id ?? 0,
    property_pictures:
      property.property_pictures.length > 0
        ? property.property_pictures[0].file_path
        : null,
    price: cheapestRoom.final_price,
    available_rooms: availableRooms.length,
  };
};

export const sortProperties = (
  properties: ProcessedProperty[],
  sortBy?: string,
  sortOrder?: string
): ProcessedProperty[] => {
  if (!sortBy) return properties;

  const sortedProperties = [...properties];
  const orderValue = sortOrder || "asc";

  sortedProperties.sort((a, b) => {
    let compareValue = 0;

    if (sortBy === "name") {
      compareValue = a.name.localeCompare(b.name);
    } else if (sortBy === "price") {
      compareValue = a.price - b.price;
    }

    return orderValue === "desc" ? -compareValue : compareValue;
  });

  return sortedProperties;
};

export const applyPagination = (
  data: ProcessedProperty[],
  page: number,
  limit: number = 5
) => {
  const offset = (page - 1) * limit;
  const totalItems = data.length;
  const totalPages = Math.ceil(totalItems / limit);
  const paginatedData = data.slice(offset, offset + limit);

  return {
    data: paginatedData,
    pagination: {
      current_page: page,
      total_pages: totalPages,
      total_properties: totalItems,
      has_next_page: page < totalPages,
      has_prev_page: page > 1,
    },
  };
};

export const processPropertyDetail = (
  property: PrismaPropertyResult
): PropertyDetail => {
  const availableRooms = processRoomsAvailability(property);

  return {
    property_id: property.id,
    name: property.name,
    description: property.description || "",
    location: property.location || "",
    category: property.property_categories?.name || null,
    city: property.cities
      ? {
          name: property.cities.name,
          type: property.cities.type,
        }
      : null,
    property_pictures: property.property_pictures.map((pic) => ({
      id: pic.id || 0,
      file_path: pic.file_path,
      is_main: pic.is_main || false,
    })),
    available_rooms: availableRooms,
  };
};

export type {
  ProcessedProperty,
  ProcessedRoom,
  PropertyDetail,
  CalendarDay,
  CalendarData,
};
