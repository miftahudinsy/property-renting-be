import {
  CalendarDay,
  CalendarData,
  PrismaCalendarResult,
} from "./propertyInterfaces";

export const processCalendarData = (
  property: PrismaCalendarResult,
  year: number,
  month: number,
  propertyId: number
): CalendarData => {
  const calendar: CalendarDay[] = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  interface AvailableRoomInCalendar {
    id: number;
    name: string;
    price: number;
    available_quantity: number;
    final_price: number;
  }

  for (let day = 1; day <= daysInMonth; day++) {
    // Buat currentDate dan normalisasi ke tengah malam UTC agar perbandingan tanggal akurat
    const currentDate = new Date(year, month - 1, day);
    currentDate.setHours(0, 0, 0, 0);
    const dateString = `${year}-${month.toString().padStart(2, "0")}-${day
      .toString()
      .padStart(2, "0")}`;
    const dayOfWeek = dayNames[currentDate.getDay()];

    const availableRooms: AvailableRoomInCalendar[] = [];

    for (const room of property.rooms) {
      const isBooked = room.bookings.some((booking) => {
        const checkIn = new Date(booking.check_in);
        checkIn.setHours(0, 0, 0, 0);
        const checkOut = new Date(booking.check_out);
        checkOut.setHours(0, 0, 0, 0);
        return currentDate >= checkIn && currentDate < checkOut;
      });

      const isUnavailable = room.room_unavailabilities.some((unavail) => {
        const startDate = new Date(unavail.start_date);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(unavail.end_date);
        endDate.setHours(0, 0, 0, 0);
        return currentDate >= startDate && currentDate <= endDate;
      });

      const availableQuantity = room.quantity - (isBooked ? 1 : 0);

      if (!isUnavailable && availableQuantity > 0) {
        let finalPrice = room.price;
        const peakRate = room.peak_season_rates.find((rate) => {
          const startDate = new Date(rate.start_date);
          startDate.setHours(0, 0, 0, 0);
          const endDate = new Date(rate.end_date);
          endDate.setHours(0, 0, 0, 0);
          return currentDate >= startDate && currentDate <= endDate;
        });

        if (peakRate) {
          if (peakRate.type === "percentage") {
            finalPrice += (room.price * peakRate.value) / 100;
          } else if (peakRate.type === "fixed") {
            finalPrice += peakRate.value;
          }
        }

        availableRooms.push({
          id: room.id,
          name: room.name,
          price: room.price,
          available_quantity: availableQuantity,
          final_price: finalPrice,
        });
      }
    }

    let minPrice = null;
    if (availableRooms.length > 0) {
      minPrice = Math.min(...availableRooms.map((r) => r.final_price));
    }

    calendar.push({
      date: dateString,
      day_of_week: dayOfWeek,
      is_available: availableRooms.length > 0,
      min_price: minPrice,
      available_rooms_count: availableRooms.length,
    });
  }

  const hasPrevMonth = true; // Logika bisa ditambahkan nanti
  const hasNextMonth = true; // Logika bisa ditambahkan nanti
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;

  return {
    property_id: propertyId,
    property_name: property.name,
    year,
    month,
    calendar,
    pagination: {
      current_month: month,
      current_year: year,
      has_prev_month: hasPrevMonth,
      has_next_month: hasNextMonth,
      prev_month_url: `/properties/${propertyId}/calendar?year=${prevYear}&month=${prevMonth}`,
      next_month_url: `/properties/${propertyId}/calendar?year=${nextYear}&month=${nextMonth}`,
    },
  };
};
