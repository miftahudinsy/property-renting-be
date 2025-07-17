import { PrismaClient, Prisma } from "../../../generated/prisma";
import {
  ValidatedSearchParams,
  ValidatedDetailParams,
} from "../validation/publicPropertyValidation";

const prisma = new PrismaClient();

// Interface untuk Prisma where clause yang spesifik
type PropertyWhereInput = Prisma.propertiesWhereInput;

export const buildWhereClause = (
  params: ValidatedSearchParams
): PropertyWhereInput => {
  const { cityId, guestCount, propertyName, categoryName } = params;

  const whereClause: PropertyWhereInput = {
    city_id: cityId,
    rooms: {
      some: {
        max_guests: {
          gte: guestCount,
        },
        quantity: {
          gt: 0,
        },
      },
    },
  };

  // Filter by property name (case insensitive)
  if (propertyName) {
    whereClause.name = {
      contains: propertyName,
      mode: "insensitive",
    };
  }

  // Filter by category name (support multiple categories)
  if (categoryName) {
    const categories = categoryName.split(",").map((cat) => cat.trim());

    if (categories.length === 1) {
      // Single category - gunakan contains untuk partial match
      whereClause.property_categories = {
        name: {
          contains: categories[0],
          mode: "insensitive",
        },
      };
    } else {
      // Multiple categories - gunakan in untuk exact match
      whereClause.property_categories = {
        name: {
          in: categories,
          mode: "insensitive",
        },
      };
    }
  }

  return whereClause;
};

export const getAvailableProperties = async (
  whereClause: PropertyWhereInput,
  params: ValidatedSearchParams
) => {
  const { guestCount, checkInDate, checkOutDate } = params;

  return await prisma.properties.findMany({
    where: whereClause,
    include: {
      property_categories: {
        select: {
          name: true,
        },
      },
      property_pictures: {
        where: {
          is_main: true,
        },
        select: {
          file_path: true,
        },
      },
      rooms: {
        where: {
          max_guests: {
            gte: guestCount,
          },
          quantity: {
            gt: 0,
          },
        },
        include: {
          bookings: {
            where: {
              status_id: {
                not: 1, // 1 = Canceled
              },
              check_in: {
                lt: checkOutDate,
              },
              check_out: {
                gt: checkInDate,
              },
            },
          },
          room_unavailabilities: {
            where: {
              start_date: {
                lt: checkOutDate,
              },
              end_date: {
                gt: checkInDate,
              },
            },
          },
          peak_season_rates: {
            where: {
              AND: [
                { start_date: { lte: checkOutDate } },
                { end_date: { gte: checkInDate } },
              ],
            },
          },
        },
      },
    },
  });
};

export const getPropertyDetail = async (params: ValidatedDetailParams) => {
  const { propertyId, guestCount, checkInDate, checkOutDate } = params;

  return await prisma.properties.findUnique({
    where: {
      id: propertyId,
    },
    include: {
      property_categories: {
        select: {
          name: true,
        },
      },
      cities: {
        select: {
          name: true,
          type: true,
        },
      },
      property_pictures: {
        select: {
          id: true,
          file_path: true,
          is_main: true,
        },
        orderBy: [{ is_main: "desc" }, { id: "asc" }],
      },
      rooms: {
        where: {
          max_guests: {
            gte: guestCount,
          },
          quantity: {
            gt: 0,
          },
        },
        include: {
          bookings: {
            where: {
              status_id: {
                not: 1, // 1 = Canceled
              },
              check_in: {
                lte: checkOutDate,
              },
              check_out: {
                gte: checkInDate,
              },
            },
          },
          room_unavailabilities: {
            where: {
              start_date: {
                lt: checkOutDate,
              },
              end_date: {
                gte: checkInDate,
              },
            },
          },
          peak_season_rates: {
            where: {
              AND: [
                { start_date: { lt: checkOutDate } },
                { end_date: { gte: checkInDate } },
              ],
            },
          },
          room_pictures: {
            select: {
              id: true,
              file_path: true,
            },
            orderBy: {
              created_at: "asc",
            },
          },
        },
      },
    },
  });
};

export const getPropertyForCalendar = async (
  propertyId: number,
  year: number,
  month: number
) => {
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 1));

  return await prisma.properties.findUnique({
    where: {
      id: propertyId,
    },
    include: {
      rooms: {
        where: {
          quantity: {
            gt: 0,
          },
        },
        include: {
          bookings: {
            where: {
              status_id: {
                not: 1, // 1 = Canceled
              },
              check_in: {
                lte: endDate,
              },
              check_out: {
                gte: startDate,
              },
            },
          },
          room_unavailabilities: {
            where: {
              start_date: {
                lte: endDate,
              },
              end_date: {
                gte: startDate,
              },
            },
          },
          peak_season_rates: {
            where: {
              start_date: {
                lte: endDate,
              },
              end_date: {
                gte: startDate,
              },
            },
          },
        },
      },
    },
  });
};
