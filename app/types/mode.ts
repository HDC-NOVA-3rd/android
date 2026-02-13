// types/mode.ts

export type ModeListItem = {
  modeId: number;
  modeName: string;
  isDefault: boolean;
  isEditable: boolean;
  isVisible: boolean;
  isScheduled: boolean;
  scheduleSummary: string | null;
};

export type ModeActionItem = {
  sortOrder: number;
  deviceId: number;
  deviceName: string;
  command: "POWER" | "BRIGHTNESS" | "SET_TEMP" | string;
  value: string;
};

export type ModeScheduleItem = {
  startTime: string | null; // "23:00:00" or "23:00"
  repeatDays: string | null; // ex) "매일" "평일" "월,수,금"
  enabled: boolean;
};

export type ModeDetail = {
  modeId: number;
  modeName: string;
  isDefault: boolean;
  isEditable: boolean;
  actions: ModeActionItem[];
  schedules: ModeScheduleItem[];
};

export type ModeExecuteResponse = {
  modeId: number;
  status: string; // "EXECUTED" etc
};
