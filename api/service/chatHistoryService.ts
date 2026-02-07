import client from "../client";
import { API_PATHS } from "../requests";
// DTO: Data Transfer Object
export type ChatSessionDto = {
  sessionId: string;
  lastMessage: string;
  lastMessageAt: string;
  status: string;
};
// DTO: Data Transfer Object
export type ChatMessageDto = {
  id: number | string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  createdAt: string;
};
// 채팅 세션 목록 가져오기
export async function getChatSessions(memberId: number) {
  const { data } = await client.get<ChatSessionDto[]>(API_PATHS.CHAT.SESSIONS, {
    params: { memberId },
  });
  return data;
}
// 특정 채팅 세션의 메시지들 가져오기
export async function getChatMessages(sessionId: string) {
  const { data } = await client.get<ChatMessageDto[]>(API_PATHS.CHAT.SESSION_MESSAGES(sessionId));
  return data;
}
