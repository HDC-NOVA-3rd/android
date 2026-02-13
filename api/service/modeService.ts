// api/service/modeService.ts
import client from "../client";
import { API_PATHS } from "../requests";

import type { ModeDetail, ModeExecuteResponse, ModeListItem } from "../../app/types/mode";

export const getMyModes = async (): Promise<ModeListItem[]> => {
  try {
    const url = API_PATHS.MODE.LIST; // 예: "/mode"
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
  schedules: { startTime: string; repeatDays: string; enabled: boolean }[],
) => {
  try {
    const url = API_PATHS.MODE.SCHEDULES.replace("{modeId}", String(modeId)); // "/mode/{modeId}/schedules"
    const res = await client.put(url, schedules);
    return res.data;
  } catch (error) {
    console.error("모드 스케줄 설정 실패:", error);
    throw error;
  }
};

export const clearModeSchedules = async (modeId: number) => {
  try {
    const url = API_PATHS.MODE.SCHEDULES.replace("{modeId}", String(modeId));
    const res = await client.delete(url);
    return res.data;
  } catch (error) {
    console.error("모드 스케줄 삭제 실패:", error);
    throw error;
  }
};
