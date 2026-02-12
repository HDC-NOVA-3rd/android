// chat.tsx
import {
  archiveId,
  getArchivedIds,
  getDebugEnabled,
  getPinnedIds,
  setDebugEnabled,
  togglePinnedId,
  unarchiveId,
} from "@/api/service/chatUiStorage";
import ChatRoom, { type ChatItem } from "@/components/chat/ChatRoom";
import ChatSidebar from "@/components/chat/ChatSidebar";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import type { ChatIntent } from "../../.expo/types/chat";
import { getMemberId } from "../../api/memberStorage";
import {
  deleteAllChatSessions,
  deleteChatSession,
  getChatMessages,
  getChatSessions,
  type ChatSessionDto,
} from "../../api/service/chatHistoryService";
import { sendChat } from "../../api/service/chatService";

const CHAT_INTENTS: readonly ChatIntent[] = [
  "ENV_STATUS",
  "ENV_HISTORY",
  "ROOM_LIST",
  "MY_MEMBER",
  "MY_APARTMENT",
  "MY_DONG_HO",
  "APARTMENT_DONG_LIST",
  "FACILITY_INFO",
  "FACILITY_LIST",

  "SPACE_LIST",
  "SPACE_INFO",
  "SPACE_BY_CAPACITY",

  "NOTICE_LIST",
  "NOTICE_DETAIL",

  "COMPLAINT_LIST",
  "COMPLAINT_DETAIL",

  "RESERVATION_LIST",
  "RESERVATION_DETAIL",

  "DEVICE_CONTROL",
  "APARTMENT_WEATHER",
  "SMALL_TALK",
  "FREE_CHAT",
  "UNKNOWN",
] as const;

const isChatIntent = (v: any): v is ChatIntent => CHAT_INTENTS.includes(v);

type ChatRole = "USER" | "ASSISTANT";
const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

const WELCOME: ChatItem = {
  id: makeId(),
  role: "ASSISTANT",
  content: "안녕하세요! 무엇을 도와드릴까요 🙂",
  createdAt: Date.now(),
};

export default function ChatScreen() {
  const { width } = useWindowDimensions();

  // 웹에서만 wide 레이아웃 적용
  const isWide = Platform.OS === "web" && width >= 900;
  const isMobile = !isWide;

  const [memberId, setMemberId] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [sessions, setSessions] = useState<ChatSessionDto[]>([]);
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [messages, setMessages] = useState<ChatItem[]>([WELCOME]);

  // ✅ UI 확장 상태
  const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());
  const [archivedIds, setArchivedIds] = useState<Set<string>>(new Set());
  const [debugEnabled, setDebugEnabledState] = useState(false);
  const [privacyOpen, setPrivacyOpen] = useState(false);

  // 모바일 Drawer 상태/애니메이션 (왼쪽 슬라이드)
  const [drawerOpen, setDrawerOpen] = useState(false);
  const anim = useRef(new Animated.Value(0)).current;

  const panelWidth = Math.min(360, width * 0.92);
  const translateX = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [-panelWidth, 0],
  });

  const openDrawer = () => {
    setDrawerOpen(true);
    Animated.timing(anim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
  };

  const closeDrawer = () => {
    Animated.timing(anim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => {
      setDrawerOpen(false);
    });
  };

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
    return list;
  };

  // 특정 세션 로드 (memberId 타이밍 이슈 방지: mid를 인자로 받게)
  const loadSession = async (mid: number, targetSessionId: string) => {
    setSessionId(targetSessionId);
    // 메시지 로드
    const serverMsgs = await getChatMessages(mid, targetSessionId);
    // 변환
    const uiMsgs: ChatItem[] = serverMsgs.map((m) => ({
      id: String((m as any).id ?? makeId()),
      role: m.role === "ASSISTANT" ? "ASSISTANT" : "USER",
      content: m.content,
      createdAt: new Date(m.createdAt).getTime(),
    }));

    setMessages(uiMsgs.length ? uiMsgs : [{ ...WELCOME, id: makeId(), createdAt: Date.now() }]);
  };

  // Sidebar Peek(롱프레스 미리보기)용: 최근 n개 메시지 가져오기
  const handlePeekMessages = async (sid: string) => {
    if (!memberId) return [];
    const serverMsgs = await getChatMessages(memberId, sid);
    // 최근 n개
    return serverMsgs.map((m) => ({
      role: m.role === "ASSISTANT" ? "ASSISTANT" : "USER",
      content: m.content,
      createdAt: m.createdAt,
    }));
  };

  // 새 채팅 시작
  const onNewChat = () => {
    setSessionId("");
    setMessages([{ ...WELCOME, id: makeId(), createdAt: Date.now() }]);
  };

  // 세션 삭제
  const handleDeleteSession = async (targetSessionId: string) => {
    if (!memberId) return;

    await deleteChatSession(memberId, targetSessionId);

    const list = await refreshSessions(memberId);

    // 고정/아카이브에 남아있어도 UI상 문제 없지만, 원하면 여기서 set에서도 제거 가능
    if (sessionId === targetSessionId) {
      const visible = list.filter((s) => !archivedIds.has(s.sessionId));
      if (visible.length > 0) await loadSession(memberId, visible[0].sessionId);
      else onNewChat();
    }
  };

  // 전체 삭제
  const handleDeleteAll = async () => {
    if (!memberId) return;
    await deleteAllChatSessions(memberId);
    setSessions([]);
    onNewChat();
  };

  //  세션 리스트: "전체를 Sidebar로 전달" + 핀 우선 + (아카이브는 뒤로)
  const sessionsForSidebar = useMemo(() => {
    const pinned: ChatSessionDto[] = [];
    const normal: ChatSessionDto[] = [];
    const archived: ChatSessionDto[] = [];

    for (const s of sessions) {
      const sid = s.sessionId;
      const isA = archivedIds.has(sid);
      const isP = pinnedIds.has(sid);

      if (isA) archived.push(s);
      else if (isP) pinned.push(s);
      else normal.push(s);
    }

    // pinned / normal / archived 순
    return [...pinned, ...normal, ...archived];
  }, [sessions, archivedIds, pinnedIds]);

  //  핀 토글
  const handleTogglePin = async (sid: string) => {
    const next = await togglePinnedId(sid);
    setPinnedIds(new Set(next));
  };

  //  아카이브/복원
  const handleArchiveSession = async (sid: string) => {
    const next = await archiveId(sid);
    setArchivedIds(new Set(next));

    // 현재 보고 있던 세션을 숨겼으면 새 채팅으로
    if (sessionId === sid) onNewChat();
  };

  const handleUnarchiveSession = async (sid: string) => {
    const next = await unarchiveId(sid);
    setArchivedIds(new Set(next));
  };

  //  오래된 세션 정리(아카이브로 안전하게)
  const handleCleanupOldSessions = async (days: number) => {
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;

    const targets = sessions
      .filter((s) => {
        if (!s.lastMessageAt) return false;
        const t = new Date(s.lastMessageAt).getTime();
        if (Number.isNaN(t)) return false;
        return t < cutoff;
      })
      .map((s) => s.sessionId);

    if (targets.length === 0) return;

    // 저장은 1개씩 (targets가 많으면 writeSet 버전 만드는 게 더 좋음)
    for (const sid of targets) await archiveId(sid);

    setArchivedIds((prev) => {
      const next = new Set(prev);
      for (const sid of targets) next.add(sid);
      return next;
    });

    if (targets.includes(sessionId)) onNewChat();
  };

  //  디버그 토글
  const handleToggleDebug = async () => {
    const next = !debugEnabled;
    setDebugEnabledState(next);
    await setDebugEnabled(next);
  };

  // ✅ 초기 로드: UI 스토리지 + memberId/세션 로드 (한 번에)
  useEffect(() => {
    (async () => {
      const [p, a, d, id] = await Promise.all([
        getPinnedIds(),
        getArchivedIds(),
        getDebugEnabled(),
        getMemberId(),
      ]);

      setPinnedIds(p);
      setArchivedIds(a);
      setDebugEnabledState(d);

      setMemberId(id);

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

      const list = await refreshSessions(id);

      // 첫 세션 자동 로드(아카이브 제외)
      const firstVisible = list.find((s) => !a.has(s.sessionId));
      if (firstVisible) await loadSession(id, firstVisible.sessionId);
    })();
  }, []);

  // 메시지 전송 핸들러
  const handleSend = async (messageText?: string) => {
    const content = (messageText ?? text).trim();
    if (!content) return;

    if (!memberId) {
      appendMessage("ASSISTANT", "로그인이 필요해요. 로그인 후 다시 시도해주세요.");
      return;
    }

    appendMessage("USER", content);
    setText("");

    try {
      setIsSending(true);

      const payload: any = { message: content, memberId };
      if (sessionId) payload.sessionId = sessionId;

      const res = await sendChat(payload);

      if (res?.sessionId) setSessionId(res.sessionId);

      const answer = res?.answer ?? "(응답이 비어있어요)";
      const intent: ChatIntent = isChatIntent(res?.intent) ? res.intent : "UNKNOWN";
      appendMessage("ASSISTANT", answer, { intent, data: res?.data });

      await refreshSessions(memberId);
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

  //  Drawer에서 추천 질문 클릭 → Drawer 닫고 바로 전송
  const handleQuickSendFromSidebar = async (q: string) => {
    if (isMobile) closeDrawer();
    await handleSend(q);
  };

  // 빠른 응답 예시(채팅 입력창 위)
  const quickReplies = [
    "내 입주민 정보 보여줘",
    "공지사항 보여줘",
    "내 민원 목록 보여줘",
    "내 예약 목록 보여줘",
    "헬스장 가격 알려줘",
    "스터디룸 4명 가능한 공간 찾아줘",
    "헬스장 운영시간이 언제야?",
    "지금 거실 온도 알려줘",
    "내 동/호 정보 뭐야?",
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <View style={{ flex: 1, flexDirection: "row" }}>
        {/* 웹: 좌측 사이드바 고정 */}
        {isWide && (
          <View style={{ width: 320, borderRightWidth: 1, borderRightColor: "#eee" }}>
            <ChatSidebar
              sessions={sessionsForSidebar}
              activeSessionId={sessionId || null}
              onSelectSession={(sid) => memberId && loadSession(memberId, sid)}
              onNewChat={onNewChat}
              onDeleteSession={handleDeleteSession}
              onDeleteAll={handleDeleteAll}
              onQuickSend={handleQuickSendFromSidebar}
              // ✅ Peek props
              onPeekMessages={handlePeekMessages}
              peekLimit={5}
              // ✅ 확장 props
              pinnedIds={pinnedIds}
              archivedIds={archivedIds}
              debugEnabled={debugEnabled}
              onTogglePin={handleTogglePin}
              onArchiveSession={handleArchiveSession}
              onUnarchiveSession={handleUnarchiveSession}
              onCleanupOldSessions={handleCleanupOldSessions}
              onToggleDebug={handleToggleDebug}
              onOpenPrivacy={() => setPrivacyOpen(true)}
            />
          </View>
        )}

        {/* 메인 */}
        <View style={{ flex: 1 }}>
          {/* 모바일 헤더 */}
          {isMobile && (
            <View
              style={{
                height: 48,
                borderBottomWidth: 1,
                borderBottomColor: "#eee",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingHorizontal: 12,
              }}
            >
              <Button variant="outline" onPress={openDrawer} disabled={!memberId}>
                <Text>☰</Text>
              </Button>

              <Text style={{ fontWeight: "700" }}>Chatbot</Text>

              <Button variant="outline" onPress={onNewChat}>
                <Text>새 채팅</Text>
              </Button>
            </View>
          )}

          <ChatRoom
            title={isWide ? "Chatbot" : undefined}
            messages={messages}
            text={text}
            setText={setText}
            isSending={isSending}
            onSend={handleSend}
            quickReplies={quickReplies}
          />

          {/* ✅ 개인정보/보안 안내 모달 */}
          <Modal transparent visible={privacyOpen} onRequestClose={() => setPrivacyOpen(false)}>
            <Pressable
              style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)" }}
              onPress={() => setPrivacyOpen(false)}
            />
            <View
              style={{
                position: "absolute",
                left: 16,
                right: 16,
                top: 120,
                backgroundColor: "white",
                borderRadius: 14,
                borderWidth: 1,
                borderColor: "#eee",
                padding: 14,
              }}
            >
              <Text style={{ fontWeight: "900", fontSize: 16, marginBottom: 8 }}>
                개인정보/보안 안내
              </Text>
              <ScrollView style={{ maxHeight: 260 }}>
                <Text style={{ color: "#333", lineHeight: 20 }}>
                  • 대화/세션 기록은 서비스 품질 개선과 이용 편의를 위해 저장될 수 있어요.{"\n"}•
                  ‘전체 삭제’ 또는 세션 삭제로 기록을 삭제할 수 있어요.{"\n"}• 계정( memberId )
                  기준으로 데이터가 관리돼요.{"\n"}• 민감한 개인정보(주민번호/계좌/비밀번호 등)는
                  입력하지 않는 것을 권장해요.{"\n"}• 디버그 로그는 개발/테스트 목적이며 필요 시 끌
                  수 있어요.
                </Text>
              </ScrollView>

              <View style={{ marginTop: 12 }}>
                <Button variant="outline" onPress={() => setPrivacyOpen(false)}>
                  <Text>닫기</Text>
                </Button>
              </View>
            </View>
          </Modal>

          {/* 모바일 Drawer */}
          {isMobile && drawerOpen && (
            <Modal transparent visible onRequestClose={closeDrawer}>
              <Pressable
                style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)" }}
                onPress={closeDrawer}
              />

              <Animated.View
                style={{
                  position: "absolute",
                  top: 0,
                  bottom: 0,
                  left: 0,
                  width: panelWidth,
                  backgroundColor: "white",
                  transform: [{ translateX }],
                  borderRightWidth: 1,
                  borderRightColor: "#eee",
                }}
              >
                <ChatSidebar
                  sessions={sessionsForSidebar}
                  activeSessionId={sessionId || null}
                  onSelectSession={async (sid) => {
                    if (!memberId) return;
                    await loadSession(memberId, sid);
                    closeDrawer();
                  }}
                  onNewChat={() => {
                    onNewChat();
                    closeDrawer();
                  }}
                  onDeleteSession={handleDeleteSession}
                  onDeleteAll={async () => {
                    await handleDeleteAll();
                    closeDrawer();
                  }}
                  onQuickSend={handleQuickSendFromSidebar}
                  //  Peek props
                  onPeekMessages={handlePeekMessages}
                  peekLimit={5}
                  //  확장 props
                  pinnedIds={pinnedIds}
                  archivedIds={archivedIds}
                  debugEnabled={debugEnabled}
                  onTogglePin={handleTogglePin}
                  onArchiveSession={handleArchiveSession}
                  onUnarchiveSession={handleUnarchiveSession}
                  onCleanupOldSessions={async (days) => {
                    await handleCleanupOldSessions(days);
                    closeDrawer();
                  }}
                  onToggleDebug={async () => {
                    await handleToggleDebug();
                  }}
                  onOpenPrivacy={() => setPrivacyOpen(true)}
                />
              </Animated.View>
            </Modal>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}
