export type ChatIntent =
  | "IOT_CONTROL"
  | "ENV_STATUS"
  | "FACILITY_INFO"
  | "RESERVATION_LOOKUP"
  | "RAG_POLICY"
  | "SMALL_TALK"
  | "UNKNOWN";

export type ChatRequest = {
  message: string;
  sessionId?: string; // 있으면 대화 이어짐
  residentId?: number; // 백엔드에서 필요하면 (없으면 빼도 됨)
};

export type ChatResponse = {
  sessionId: string;
  answer: string;
  intent: ChatIntent;
  data?: any; // intent별로 달라서 MVP는 any로 두고, 나중에 세분화
};

export type UiMessage = {
  id: string;
  role: "user" | "assistant";
  text?: string;
  data?: any;
  intent?: ChatIntent;
  createdAt: number;
};
