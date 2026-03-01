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
export async function getChatMessages(memberId: number, sessionId: string) {
  const { data } = await client.get(API_PATHS.CHAT.SESSION_MESSAGES(sessionId), {
    params: { memberId },
  });
  return data;
}

//  단일 세션 삭제
export async function deleteChatSession(memberId: number, sessionId: string) {
  await client.delete(API_PATHS.CHAT.DELETE_SESSION(sessionId), {
    params: { memberId },
  });
}

//  전체 세션 삭제
export async function deleteAllChatSessions(memberId: number) {
  await client.delete(API_PATHS.CHAT.DELETE_ALL_SESSIONS, {
    params: { memberId },
  });
}
