import client from "@/api/client";
import { API_PATHS } from "@/api/requests";

/** ===== Types ===== */
export type RoomItem = {
  roomId: number;
  roomName: string;
};

export type DeviceSnapshot = {
  deviceId: number;
  deviceCode: string;
  name: string;
  type: "LED" | "FAN" | "AC" | string;
  power: boolean | null;
  brightness: number | null;
  targetTemp: number | null;
};

export type SnapshotResponse = {
  roomId: number;
  roomName: string;
  temperature: number | null;
  humidity: number | null;
  device: DeviceSnapshot[];
};

export type DeviceStatePatchRequest = {
  devices: {
    deviceCode: string;
    power?: boolean;
    brightness?: number;
    targetTemp?: number;
  }[];
};

export type HomeRoomCard = {
  roomId: number;
  roomName: string;
  temperature: number | null;
  humidity: number | null;
  deviceSummary: string;
};

/** ===== API (원자 단위) ===== */

// 내 방 목록
export const getMyRooms = async () => {
  const res = await client.get(API_PATHS.HOME_ENV.ROOMS_MY);
  return res.data as RoomItem[];
};

// 세대(hoId) 기준 방 목록
export const getRoomsByHo = async (hoId: number) => {
  const res = await client.get(API_PATHS.HOME_ENV.ROOMS_BY_HO(hoId));
  return res.data as RoomItem[];
};

// 방 스냅샷
export const getRoomSnapshot = async (roomId: number) => {
  const res = await client.get(API_PATHS.HOME_ENV.ROOM_SNAPSHOT(roomId));
  return res.data as SnapshotResponse;
};

// 디바이스 상태 저장
export const patchDeviceState = async (roomId: number, payload: DeviceStatePatchRequest) => {
  const res = await client.patch(API_PATHS.HOME_ENV.DEVICE_STATE(roomId), payload);
  return res.data;
};

/** ===== Util ===== */

const makeDeviceSummary = (devices: DeviceSnapshot[]) => {
  const led = devices.find((d) => d.type === "LED" || d.deviceCode === "light-1");
  const fan = devices.find((d) => d.type === "FAN" || d.deviceCode === "fan-1");

  const ledText = led?.power ? "전등 켜짐" : "전등 꺼짐";
  const fanText = fan?.power ? "에어컨 켜짐" : "에어컨 꺼짐";

  return `${ledText} · ${fanText}`;
};

/** ===== 조합 API (홈 카드용) ===== */

// ✅ 내 방 목록 + 각 방 스냅샷을 합쳐 홈 카드 생성
export const getHomeRoomsMy = async () => {
  const rooms = await getMyRooms();
  const snaps = await Promise.all(rooms.map((r) => getRoomSnapshot(r.roomId)));

  return rooms.map((r, idx) => {
    const s = snaps[idx];
    return {
      roomId: r.roomId,
      roomName: r.roomName,
      temperature: s.temperature,
      humidity: s.humidity,
      deviceSummary: makeDeviceSummary(s.device),
    } as HomeRoomCard;
  });
};

// ✅ hoId 기준 방 목록 + 각 방 스냅샷을 합쳐 홈 카드 생성
export const getHomeRoomsByHo = async (hoId: number) => {
  const rooms = await getRoomsByHo(hoId);
  const snaps = await Promise.all(rooms.map((r) => getRoomSnapshot(r.roomId)));

  return rooms.map((r, idx) => {
    const s = snaps[idx];
    return {
      roomId: r.roomId,
      roomName: r.roomName,
      temperature: s.temperature,
      humidity: s.humidity,
      deviceSummary: makeDeviceSummary(s.device),
    } as HomeRoomCard;
  });
};
