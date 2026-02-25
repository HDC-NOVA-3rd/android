// api/service/modeService.ts
import client from "../client";
import { API_PATHS } from "../requests";

import type { ModeDetail, ModeExecuteResponse, ModeListItem } from "../../app/types/mode";
/** 모드 액션 저장(업서트) 요청 타입 */
export type ModeActionUpsertRequest = {
  actions: {
    sortOrder?: number; // 없으면 서버에서 자동 채우도록 만들 수도 있음(서버 구현에 맞춰)
    deviceId: number;
    command: "POWER" | "BRIGHTNESS" | "SET_TEMP";
    value: string; // "ON"/"OFF"/"50"/"24"
  }[];
};
export const getMyModes = async (): Promise<ModeListItem[]> => {
  try {
    const url = API_PATHS.MODE.LIST; // "/mode/my"
    const res = await client.get(url);
    return res.data;
  } catch (error) {
    console.error("모드 목록 조회 실패:", error);
    throw error;
  }
};

export const getModeDetail = async (modeId: number): Promise<ModeDetail> => {
  try {
    const url = API_PATHS.MODE.DETAIL.replace("{modeId}", String(modeId)); // "/mode/{modeId}"
    const res = await client.get(url);
    return res.data;
  } catch (error) {
    console.error("모드 상세 조회 실패:", error);
    throw error;
  }
};

export const executeMode = async (modeId: number): Promise<ModeExecuteResponse> => {
  try {
    const url = API_PATHS.MODE.EXECUTE.replace("{modeId}", String(modeId)); // "/mode/{modeId}/execute"
    const res = await client.patch(url);
    return res.data;
  } catch (error) {
    console.error("모드 실행 실패:", error);
    throw error;
  }
};

export const createMode = async (params: { modeName: string; sourceModeId?: number | null }) => {
  try {
    const url = API_PATHS.MODE.CREATE; // "/mode"
    const res = await client.post(url, params);
    return res.data;
  } catch (error) {
    console.error("모드 생성 실패:", error);
    throw error;
  }
};

export const setModeSchedules = async (
  modeId: number,
  schedules: {
    startTime: string;
    endTime?: string | null;
    endModeId?: number | null;
    repeatDays: string;
    isEnabled: boolean;
  }[],
) => {
  const url = API_PATHS.MODE.SCHEDULE.replace("{modeId}", String(modeId));
  const res = await client.patch(url, { schedules });
  return res.data;
};

export const clearModeSchedules = async (modeId: number) => {
  try {
    const url = API_PATHS.MODE.SCHEDULE.replace("{modeId}", String(modeId));
    const res = await client.delete(url);
    return res.data;
  } catch (error) {
    console.error("모드 스케줄 삭제 실패:", error);
    throw error;
  }
};

/** 추가: 모드 실행 동작(actions) 저장 */
export const setModeActions = async (modeId: number, body: ModeActionUpsertRequest) => {
  try {
    // API_PATHS에 ACTIONS 추가
    const url = API_PATHS.MODE.ACTION.replace("{modeId}", String(modeId));
    const res = await client.put(url, body);
    return res.data;
  } catch (error) {
    console.error("모드 액션 저장 실패:", error);
    throw error;
  }
};

/** 추가: 모드 숨김/표시 변경 */
export const updateModeVisibility = async (modeId: number, visible: boolean) => {
  try {
    const url = API_PATHS.MODE.VISIBILITY.replace("{modeId}", String(modeId));
    const res = await client.patch(url, { visible });
    return res.data;
  } catch (error) {
    console.error("모드 숨김/표시 변경 실패:", error);
    throw error;
  }
};

/** 커스텀 모드 삭제(기본 모드는 서버에서 막힘) */
export const deleteMode = async (modeId: number) => {
  try {
    const url = API_PATHS.MODE.DELETE.replace("{modeId}", String(modeId));
    const res = await client.delete(url);
    return res.data;
  } catch (error) {
    console.error("모드 삭제 실패:", error);
    throw error;
  }
};

/**  설정 모드 전체 목록 조회  */
export const getMyModesAll = async (): Promise<ModeListItem[]> => {
  const res = await client.get(API_PATHS.MODE.LIST_ALL);
  return res.data;
};
