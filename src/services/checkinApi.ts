import apiClient from "./apiClient";

export interface RoomType {
  room_type_id: number;
  room_type_name: string;
}

export interface Room {
  room_id: number;
  room_no: string;
}

export interface SpecialNote {
  note_type?: string | null;
  note_content: string;
}

export interface CreateCheckInRequest {
  full_name: string;
  gender_id: number;
  birth_date?: string | null;
  country_code: string;
  mobile_phone?: string | null;
  phone?: string | null;
  email?: string | null;

  room_type_id: number;
  room_id: number;
  check_in_date: string;
  check_out_date: string;
  adult_count: number;
  child_count: number;

  has_parking: boolean;
  license_plate_no?: string | null;

  notes: SpecialNote[];
}

export async function getRoomTypes(): Promise<RoomType[]> {
  const response = await apiClient.get<RoomType[]>("/api/checkins/room-types");
  return response.data;
}

export async function getRooms(roomTypeId: number): Promise<Room[]> {
  const response = await apiClient.get<Room[]>("/api/checkins/rooms", {
    params: {
      room_type_id: roomTypeId,
    },
  });

  return response.data;
}

export async function createCheckIn(data: CreateCheckInRequest) {
  const response = await apiClient.post("/api/checkins", data);
  return response.data;
}