import ChatRoom, { type ChatItem } from "@/components/chat/ChatRoom";
import ChatSidebar from "@/components/chat/ChatSidebar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { Text, View, useWindowDimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { ChatIntent } from "../../.expo/types/chat";
import { getMemberId } from "../../api/memberStorage";
import {
  getChatMessages,
  getChatSessions,
  type ChatMessageDto,
  type ChatSessionDto,
} from "../../api/service/chatHistoryService";
import { sendChat } from "../../api/service/chatService";
// import type { ChatIntent } from "@/types/chat";
const CHAT_INTENTS: readonly ChatIntent[] = [
  "ENV_STATUS",
  "ENV_HISTORY",
  "ROOM_LIST",
  "MY_MEMBER",
  "MY_APARTMENT",
  "MY_DONG_HO",
  "APARTMENT_DONG_LIST",
  "FACILITY_INFO",
  "APARTMENT_WEATHER",
  "SMALL_TALK",
  "UNKNOWN",
] as const;
// import { CHAT_INTENTS } from "@/constants/chat";
const isChatIntent = (v: any): v is ChatIntent => CHAT_INTENTS.includes(v);
// export const CHAT_INTENTS = [
type ChatRole = "USER" | "ASSISTANT";
//   "ENV_STATUS",
const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;
//   "ENV_HISTORY",
const WELCOME: ChatItem = {
  id: makeId(),
  role: "ASSISTANT",
  content: "안녕하세요! 무엇을 도와드릴까요 🙂",
  createdAt: Date.now(),
};
//   "ROOM_LIST",
export default function ChatScreen() {
  // Responsive layout
  const { width } = useWindowDimensions();
  const isWide = width >= 900; // 웹이면 좌측 사이드바 고정
  const [isSessionListOpen, setIsSessionListOpen] = useState(false);
  const [memberId, setMemberId] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [sessions, setSessions] = useState<ChatSessionDto[]>([]);
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatItem[]>([WELCOME]);
  // 메시지 추가 헬퍼
  const appendMessage = (
    role: ChatRole,
    content: string,
    extra?: { intent?: ChatIntent; data?: any },
  ) => {
    setMessages((prev) => [
      ...prev,
      { id: makeId(), role, content, createdAt: Date.now(), ...extra },
    ]);
  };
  // 세션 목록 새로고침
  const refreshSessions = async (mid: number) => {
    const list = await getChatSessions(mid);
    setSessions(list);
  };
  // 특정 세션 로드
  const loadSession = async (targetSessionId: string) => {
    setSessionId(targetSessionId);
    // 모바일이면 목록 닫기
    const serverMsgs: ChatMessageDto[] = await getChatMessages(targetSessionId);
    // 서버 메시지를 UI 메시지로 변환
    const uiMsgs: ChatItem[] = serverMsgs.map((m) => ({
      id: String(m.id ?? makeId()),
      role: m.role === "ASSISTANT" ? "ASSISTANT" : "USER",
      content: m.content,
      createdAt: new Date(m.createdAt).getTime(),
    }));
    // 메시지 설정
    setMessages(uiMsgs.length ? uiMsgs : [{ ...WELCOME, id: makeId(), createdAt: Date.now() }]);
  };
  // 새 채팅 시작
  const onNewChat = () => {
    setSessionId("");
    setMessages([{ ...WELCOME, id: makeId(), createdAt: Date.now() }]);
  };
  // 초기 로드
  useEffect(() => {
    (async () => {
      const id = await getMemberId();
      setMemberId(id);
      // ️ 로그인 안 됨 처리
      if (!id) {
        setMessages((prev) => [
          ...prev,
          {
            id: makeId(),
            role: "ASSISTANT",
            content: "로그인이 필요해요. 로그인 후 다시 시도해주세요.",
            createdAt: Date.now(),
          },
        ]);
        return;
      }
      //  세션 목록 로드
      await refreshSessions(id);

      //  세션이 있으면 자동으로 첫 세션 로드(원하면 유지)
      // (refreshSessions가 끝난 뒤 sessions state가 바로 안 바뀌므로, 직접 다시 받아서 쓰는게 안전)
      const list = await getChatSessions(id);
      setSessions(list);
      if (list.length > 0) await loadSession(list[0].sessionId);
    })();
  }, []);
  // 메시지 전송 핸들러
  const handleSend = async (messageText?: string) => {
    const content = (messageText ?? text).trim();
    if (!content) return;
    // ️ 로그인 체크
    if (!memberId) {
      appendMessage("ASSISTANT", "로그인이 필요해요. 로그인 후 다시 시도해주세요.");
      return;
    }
    // 사용자 메시지 추가
    appendMessage("USER", content);
    setText("");
    // 서버에 메시지 전송
    try {
      setIsSending(true);
      // ️ 기존 세션 ID 있으면 같이 보냄
      const payload: any = { message: content, memberId };
      if (sessionId) payload.sessionId = sessionId;
      // ️ 메시지 전송
      const res = await sendChat(payload);
      // ️ 새로 생성된 세션 ID 있으면 설정
      if (res?.sessionId) setSessionId(res.sessionId);
      // ️ 어시스턴트 메시지 추가
      const answer = res?.answer ?? "(응답이 비어있어요)";
      const intent: ChatIntent = isChatIntent(res?.intent) ? res.intent : "UNKNOWN";
      appendMessage("ASSISTANT", answer, { intent, data: res?.data });

      // 응답 후 세션 목록 갱신
      const list = await getChatSessions(memberId);
      setSessions(list);
    } catch (e: any) {
      const status = e?.response?.status;
      const data = e?.response?.data;
      appendMessage(
        "ASSISTANT",
        `오류가 발생했어요.\nstatus=${status}\n${data ? JSON.stringify(data) : e?.message}`,
      );
    } finally {
      setIsSending(false);
    }
  };
  // 빠른 응답 예시
  const quickReplies = [
    "내 입주민 정보 보여줘",
    "헬스장 운영시간이 언제야?",
    "지금 거실 온도 알려줘",
    "내 동/호 정보 뭐야?",
  ];
  // 렌더링
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ flex: 1, flexDirection: "row" }}>
        {/*  웹: 좌측 사이드바 고정 */}
        {isWide && (
          <View style={{ width: 320, borderRightWidth: 1, borderRightColor: "#eee" }}>
            <ChatSidebar
              sessions={sessions}
              activeSessionId={sessionId || null}
              onSelectSession={loadSession}
              onNewChat={onNewChat}
            />
          </View>
        )}

        {/*  모바일: 사이드바 대신 상단 토글 + 목록 패널 */}
        {!isWide && (
          <>
            {/* 상단 버튼 영역 */}
            <View
              style={{
                position: "absolute",
                top: 12,
                left: 12,
                right: 12,
                zIndex: 20,
                flexDirection: "row",
                gap: 8,
              }}
            >
              <Button
                variant="outline"
                onPress={() => setIsSessionListOpen((v) => !v)}
                disabled={!memberId}
              >
                <Text>대화목록</Text>
              </Button>

              <Button variant="outline" onPress={onNewChat}>
                <Text>새 채팅</Text>
              </Button>
            </View>

            {/* 목록 패널 */}
            {isSessionListOpen && (
              <View
                style={{
                  position: "absolute",
                  top: 60, // 버튼 아래로
                  left: 12,
                  right: 12,
                  maxHeight: 320,
                  backgroundColor: "white",
                  borderWidth: 1,
                  borderColor: "#eee",
                  borderRadius: 12,
                  padding: 8,
                  zIndex: 30,
                }}
              >
                {sessions.length === 0 ? (
                  <Text style={{ color: "#666" }}>세션이 없어요.</Text>
                ) : (
                  sessions.map((s) => (
                    <View
                      key={s.sessionId}
                      style={{
                        paddingVertical: 10,
                        borderBottomWidth: 1,
                        borderBottomColor: "#f2f2f2",
                      }}
                    >
                      <Text
                        onPress={() => loadSession(s.sessionId)}
                        style={{ fontWeight: "700" }}
                        numberOfLines={1}
                      >
                        {s.lastMessage || s.sessionId.slice(0, 12) + "..."}
                      </Text>
                      <Text style={{ color: "#666", marginTop: 2, fontSize: 12 }} numberOfLines={1}>
                        {s.lastMessageAt}
                      </Text>
                    </View>
                  ))
                )}
              </View>
            )}
          </>
        )}

        {/* 우측 채팅(모바일도 여기 렌더링) */}
        <View style={{ flex: 1 }}>
          <ChatRoom
            title="Chatbot"
            messages={messages}
            text={text}
            setText={setText}
            isSending={isSending}
            onSend={handleSend}
            quickReplies={quickReplies}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}
