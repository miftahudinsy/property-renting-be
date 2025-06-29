export interface ProcessedProperty {
  property_id: number;
  name: string;
  location: string;
  category: string | null;
  city_id: number;
  property_pictures: string | null;
  price: number;
  available_rooms: number;
}

export interface ProcessedRoom {
  id: number;
  name: string;
  price: number;
  max_guests: number;
  quantity: number;
  available_quantity: number;
  final_price: number;
  bookings: any[];
  room_unavailabilities: any[];
  peak_season_rates: any[];
}

export interface PropertyDetail {
  property_id: number;
  name: string;
  description: string;
  location: string;
  category: string | null;
  city: {
    name: string;
    type: string;
  } | null;
  property_pictures: Array<{
    id: number;
    file_path: string;
    is_main: boolean;
  }>;
  available_rooms: ProcessedRoom[];
}

export interface CalendarDay {
  date: string;
  day_of_week: string;
  is_available: boolean;
  min_price: number | null;
  available_rooms_count: number;
}

export interface CalendarData {
  property_id: number;
  property_name: string;
  year: number;
  month: number;
  calendar: CalendarDay[];
  pagination: {
    current_month: number;
    current_year: number;
    has_prev_month: boolean;
    has_next_month: boolean;
    prev_month_url: string;
    next_month_url: string;
  };
}
