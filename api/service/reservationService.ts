import client from "../client";
import { API_PATHS } from "../requests";

export interface ReservationRequest {
  spaceId: number;
  startTime: string; // ISO 8601 string
  endTime: string;
  capacity: number;
  ownerName: string;
  ownerPhone: string;
  paymentMethod: "MANAGEMENT_FEE" | "ONLINE_PAYMENT";
}

export interface ReservationResponse {
  id: number;
  spaceId: number;
  spaceName: string;
  startTime: string;
  endTime: string;
  capacity: number;
  totalPrice: number;
  ownerName: string;
  ownerPhone: string;
  paymentMethod: "MANAGEMENT_FEE" | "ONLINE_PAYMENT";
  qrToken: string;
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED" | "INUSE";
}

export interface OccupiedReservation {
  startTime: string;
  endTime: string;
}

export const createReservation = async (data: ReservationRequest) => {
  const response = await client.post<number>(API_PATHS.RESERVATION.CREATE, data);
  return response.data;
};

export const getMyReservations = async () => {
  const response = await client.get<ReservationResponse[]>(API_PATHS.RESERVATION.MY_LIST);
  return response.data;
};

export const getReservationDetails = async (id: number) => {
  const url = API_PATHS.RESERVATION.DETAIL.replace("{reservationId}", id.toString());
  const response = await client.get<ReservationResponse>(url);
  return response.data;
};

export const cancelReservation = async (id: number) => {
  const url = API_PATHS.RESERVATION.CANCEL.replace("{reservationId}", id.toString());
  await client.patch(url);
};

export const getOccupiedReservations = async (spaceId: number, date: string) => {
  const response = await client.get<OccupiedReservation[]>(API_PATHS.RESERVATION.OCCUPIED, {
    params: { spaceId, date },
  });
  return response.data;
};
