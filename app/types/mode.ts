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
  startTime: string | null;
  endTime?: string | null;
  endModeId?: number | null;
  repeatDays: string | null;
  isEnabled: boolean;
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
