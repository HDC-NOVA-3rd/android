import type { ChatSessionDto } from "@/api/service/chatHistoryService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Feather } from "@expo/vector-icons";
import * as SecureStore from "expo-secure-store";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Modal, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type TabKey = "CHAT" | "COMMAND" | "MANAGE";

type PeekItem = { role: "USER" | "ASSISTANT"; content: string; createdAt?: string | number };

type Props = {
  sessions: ChatSessionDto[];
  activeSessionId: string | null;

  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;

  onDeleteSession: (sessionId: string) => void;
  onDeleteAll: () => void;

  onQuickSend?: (text: string) => void;

  pinnedIds?: Set<string>;
  archivedIds?: Set<string>;
  debugEnabled?: boolean;

  onTogglePin?: (sessionId: string) => void;
  onArchiveSession?: (sessionId: string) => void;
  onUnarchiveSession?: (sessionId: string) => void;

  onCleanupOldSessions?: (days: number) => void;

  onToggleDebug?: () => void;
  onOpenPrivacy?: () => void;

  // ✅ 롱프레스 미리보기(최근 메시지 n개)
  onPeekMessages?: (sessionId: string) => Promise<PeekItem[]>;
  peekLimit?: number; // 기본 5
};

const C = {
  bg: "#f6f7fb",
  card: "#ffffff",
  border: "#e5e7eb",
  text: "#111827",
  sub: "#6b7280",
  brand: "#2563eb",
  brandBg: "#eff6ff",
  danger: "#dc2626",
  mutedChip: "#f3f4f6",
};

// ✅ "삭제는 길게" 힌트 1회 노출용 키(웹/모바일 공통)
const DELETE_HINT_KEY = "chat_delete_hint_dismissed";

async function getDeleteHintDismissed(): Promise<boolean> {
  try {
    if (Platform.OS === "web") return localStorage.getItem(DELETE_HINT_KEY) === "1";
    const v = await SecureStore.getItemAsync(DELETE_HINT_KEY);
    return v === "1";
  } catch {
    return false;
  }
}

async function setDeleteHintDismissed(v: boolean) {
  try {
    if (Platform.OS === "web") {
      localStorage.setItem(DELETE_HINT_KEY, v ? "1" : "0");
      return;
    }
    await SecureStore.setItemAsync(DELETE_HINT_KEY, v ? "1" : "0");
  } catch {
    // ignore
  }
}

function formatRelativeKorean(isoLike?: string) {
  if (!isoLike) return "—";
  const t = new Date(isoLike).getTime();
  if (Number.isNaN(t)) return "—";

  const now = Date.now();
  const diffMs = Math.max(0, now - t);

  const sec = Math.floor(diffMs / 1000);
  if (sec < 60) return "방금";

  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}분 전`;

  const hour = Math.floor(min / 60);
  if (hour < 24) return `${hour}시간 전`;

  const dNow = new Date(now);
  const dThen = new Date(t);
  const startOfToday = new Date(dNow.getFullYear(), dNow.getMonth(), dNow.getDate()).getTime();
  const startOfThatDay = new Date(dThen.getFullYear(), dThen.getMonth(), dThen.getDate()).getTime();
  const dayDiff = Math.round((startOfToday - startOfThatDay) / (24 * 60 * 60 * 1000));

  if (dayDiff === 1) return "어제";
  if (dayDiff > 1 && dayDiff < 7) return `${dayDiff}일 전`;

  const yyyy = dThen.getFullYear();
  const mm = String(dThen.getMonth() + 1).padStart(2, "0");
  const dd = String(dThen.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function ChatSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onDeleteSession,
  onDeleteAll,
  onQuickSend,

  pinnedIds,
  archivedIds,
  debugEnabled,

  onTogglePin,
  onArchiveSession,
  onUnarchiveSession,
  onCleanupOldSessions,

  onToggleDebug,
  onOpenPrivacy,

  onPeekMessages,
  peekLimit: peekLimitProp,
}: Props) {
  const insets = useSafeAreaInsets();
  const peekLimit = peekLimitProp ?? 5;

  const [tab, setTab] = useState<TabKey>("CHAT");
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  // ✅ 숨김 섹션 토글 (기본: 접힘)
  const [archivedOpen, setArchivedOpen] = useState(false);

  // ✅ 1초 토스트
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<any>(null);
  const showToast = (msg: string) => {
    setToast(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(null), 1000);
  };
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  // ✅ 삭제 확인 모달용
  const [deleteTarget, setDeleteTarget] = useState<ChatSessionDto | null>(null);

  // ✅ "삭제는 길게" 힌트: 딱 1회만 표시
  const [showDeleteHint, setShowDeleteHint] = useState(false);

  // ✅ 핀 bounce 애니메이션: sessionId별 scale 관리
  const pinScalesRef = useRef<Map<string, Animated.Value>>(new Map());
  const getPinScale = (sid: string) => {
    const m = pinScalesRef.current;
    let v = m.get(sid);
    if (!v) {
      v = new Animated.Value(1);
      m.set(sid, v);
    }
    return v;
  };
  const bouncePin = (sid: string) => {
    const scale = getPinScale(sid);
    scale.setValue(1);
    Animated.sequence([
      Animated.timing(scale, { toValue: 1.18, duration: 90, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 4, tension: 180, useNativeDriver: true }),
    ]).start();
  };

  useEffect(() => {
    (async () => {
      const dismissed = await getDeleteHintDismissed();
      setShowDeleteHint(!dismissed);
    })();
  }, []);

  const isPinned = (sid: string) => !!pinnedIds?.has(sid);
  const isArchived = (sid: string) => !!archivedIds?.has(sid);

  // ✅ Peek(미리보기) 모달 상태
  const [peekOpen, setPeekOpen] = useState(false);
  const [peekTitle, setPeekTitle] = useState<string>("");
  const [peekSessionId, setPeekSessionId] = useState<string | null>(null);
  const [peekLoading, setPeekLoading] = useState(false);
  const [peekItems, setPeekItems] = useState<PeekItem[]>([]);

  const openPeek = async (s: ChatSessionDto) => {
    const sid = s.sessionId;
    setPeekSessionId(sid);
    setPeekTitle(s.lastMessage || sid.slice(0, 12) + "...");
    setPeekOpen(true);

    if (!onPeekMessages) {
      setPeekItems([]);
      setPeekLoading(false);
      return;
    }

    try {
      setPeekLoading(true);
      const items = await onPeekMessages(sid);
      setPeekItems(items.slice(-peekLimit));
    } catch {
      setPeekItems([]);
    } finally {
      setPeekLoading(false);
    }
  };

  const closePeek = () => {
    setPeekOpen(false);
    setPeekSessionId(null);
    setPeekItems([]);
  };

  // ✅ "표시" / "숨김" 리스트 분리 + 검색 적용 + pinned 우선
  const { visibleSessions, archivedSessions } = useMemo(() => {
    const q = query.trim().toLowerCase();

    const match = (s: ChatSessionDto) => {
      if (!q) return true;
      const sid = (s.sessionId ?? "").toLowerCase();
      const msg = (s.lastMessage ?? "").toLowerCase();
      return sid.includes(q) || msg.includes(q);
    };

    const visible: ChatSessionDto[] = [];
    const archived: ChatSessionDto[] = [];

    for (const s of sessions) {
      if (!match(s)) continue;
      if (isArchived(s.sessionId)) archived.push(s);
      else visible.push(s);
    }

    visible.sort((a, b) => {
      const ap = isPinned(a.sessionId) ? 1 : 0;
      const bp = isPinned(b.sessionId) ? 1 : 0;
      return bp - ap;
    });

    archived.sort((a, b) => {
      const ta = a.lastMessageAt ? new Date(a.lastMessageAt).getTime() : 0;
      const tb = b.lastMessageAt ? new Date(b.lastMessageAt).getTime() : 0;
      return tb - ta;
    });

    return { visibleSessions: visible, archivedSessions: archived };
  }, [sessions, query, pinnedIds, archivedIds]);

  const suggestedQuestions = [
    "내 입주민 정보 보여줘",
    "헬스장 운영시간이 언제야?",
    "지금 거실 온도 알려줘",
    "거실 불 꺼줘",
  ];

  const commandPresets = [
    "거실 불 켜줘",
    "거실 불 꺼줘",
    "온도 23도로 설정해줘",
    "지금 온습도 알려줘",
  ];

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <Text style={{ fontSize: 13, fontWeight: "900", color: C.text, marginBottom: 10 }}>
      {children}
    </Text>
  );

  const Card = ({ children }: { children: React.ReactNode }) => (
    <View
      style={{
        backgroundColor: C.card,
        borderWidth: 1,
        borderColor: C.border,
        borderRadius: 16,
        padding: 12,
      }}
    >
      {children}
    </View>
  );

  const SegButton = ({ k, label }: { k: TabKey; label: string }) => {
    const active = tab === k;
    return (
      <Pressable
        onPress={() => setTab(k)}
        style={{
          flex: 1,
          paddingVertical: 10,
          borderRadius: 999,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: active ? C.brandBg : "transparent",
          borderWidth: 1,
          borderColor: active ? "#bfdbfe" : "transparent",
        }}
      >
        <Text style={{ fontWeight: "900", color: active ? C.brand : C.sub }}>{label}</Text>
      </Pressable>
    );
  };

  const Chip = ({ text, onPress }: { text: string; onPress: () => void }) => (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: C.border,
        backgroundColor: C.mutedChip,
      }}
    >
      <Text style={{ fontWeight: "900", color: C.brand }} numberOfLines={1}>
        {text}
      </Text>
    </Pressable>
  );

  const Badge = ({ text }: { text: string }) => (
    <View
      style={{
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        backgroundColor: C.brandBg,
        borderWidth: 1,
        borderColor: "#bfdbfe",
      }}
    >
      <Text style={{ fontSize: 11, fontWeight: "900", color: C.brand }}>{text}</Text>
    </View>
  );

  const IconBtn = ({
    name,
    onPress,
    onLongPress,
    color = C.text,
    bg = "white",
  }: {
    name: React.ComponentProps<typeof Feather>["name"];
    onPress?: () => void;
    onLongPress?: () => void;
    color?: string;
    bg?: string;
  }) => (
    <Pressable
      onPress={(e) => {
        // @ts-ignore
        e?.stopPropagation?.();
        onPress?.();
      }}
      onLongPress={(e) => {
        // @ts-ignore
        e?.stopPropagation?.();
        onLongPress?.();
      }}
      delayLongPress={380}
      hitSlop={12}
      style={{
        width: 36,
        height: 36,
        borderRadius: 12,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        borderColor: C.border,
        backgroundColor: bg,
      }}
    >
      <Feather name={name} size={16} color={color} />
    </Pressable>
  );

  const renderHeader = () => (
    <View style={{ marginBottom: 12 }}>
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <View>
          <Text style={{ fontSize: 16, fontWeight: "900", color: C.text }}>Chat</Text>
          <Text style={{ fontSize: 12, color: C.sub, marginTop: 2 }}>세션·명령·관리</Text>
        </View>

        <View
          style={{
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 999,
            backgroundColor: C.brandBg,
            borderWidth: 1,
            borderColor: "#bfdbfe",
          }}
        >
          <Text style={{ fontWeight: "900", color: C.brand, fontSize: 12 }}>
            {sessions.length} sessions
          </Text>
        </View>
      </View>

      <View
        style={{
          marginTop: 12,
          flexDirection: "row",
          gap: 8,
          padding: 6,
          borderRadius: 999,
          backgroundColor: "white",
          borderWidth: 1,
          borderColor: C.border,
        }}
      >
        <SegButton k="CHAT" label="대화" />
        <SegButton k="COMMAND" label="명령" />
        <SegButton k="MANAGE" label="관리" />
      </View>
    </View>
  );

  const renderSessionRow = (s: ChatSessionDto) => {
    const sid = s.sessionId;
    const active = activeSessionId === sid;

    const pinned = isPinned(sid);
    const archived = isArchived(sid);

    const pinScale = getPinScale(sid);

    const Row = (
      <View
        style={{
          padding: 12,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: active ? "#bfdbfe" : C.border,
          backgroundColor: active ? C.brandBg : "white",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 10 }}>
          {/* ✅ 내용 영역: 탭=선택 / 롱프레스=Peek */}
          <Pressable
            style={{ flex: 1 }}
            onPress={() => onSelectSession(sid)}
            onLongPress={() => openPeek(s)}
            delayLongPress={320}
          >
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <Text style={{ fontWeight: "900", color: C.text, flex: 1 }} numberOfLines={1}>
                {s.lastMessage || sid.slice(0, 12) + "..."}
              </Text>
              {pinned && <Badge text="고정" />}
              {archived && <Badge text="숨김" />}
            </View>

            <Text style={{ color: C.sub, marginTop: 6, fontSize: 12 }} numberOfLines={1}>
              {formatRelativeKorean(s.lastMessageAt)}
            </Text>

            {showDeleteHint && (
              <Text style={{ marginTop: 8, fontSize: 11, color: C.sub }}>
                팁: 삭제는 🗑 길게 눌러 확인 후 진행돼요.
              </Text>
            )}
          </Pressable>

          {/* ✅ 아이콘 영역 */}
          <View style={{ flexDirection: "row", gap: 8 }}>
            {/* ⭐ PIN: bounce */}
            <Pressable
              onPress={() => {
                bouncePin(sid);
                onTogglePin?.(sid);
              }}
              hitSlop={12}
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                borderWidth: 1,
                borderColor: C.border,
                backgroundColor: "white",
              }}
            >
              <Animated.View style={{ transform: [{ scale: pinScale }] }}>
                <Feather name="star" size={16} color={pinned ? C.brand : "#9ca3af"} />
              </Animated.View>
            </Pressable>

            {/* 📦 ARCHIVE */}
            <IconBtn
              name={archived ? "inbox" : "archive"}
              color={archived ? C.brand : "#374151"}
              onPress={() => {
                if (archived) {
                  onUnarchiveSession?.(sid);
                  showToast("복원했어요");
                } else {
                  onArchiveSession?.(sid);
                  showToast("숨김 처리됨 · 복원 가능");
                  setArchivedOpen(true);
                }
              }}
            />

            {/* 🗑 DELETE: 길게 눌러 모달 */}
            <IconBtn
              name="trash-2"
              color={C.danger}
              bg="#fff"
              onPress={() => {}}
              onLongPress={async () => {
                if (showDeleteHint) {
                  setShowDeleteHint(false);
                  await setDeleteHintDismissed(true);
                }
                setDeleteTarget(s);
              }}
            />
          </View>
        </View>
      </View>
    );

    // ✅ Swipeable Actions
    const renderLeftActions = () => (
      <View style={{ justifyContent: "center" }}>
        <Pressable
          onPress={() => {
            bouncePin(sid);
            onTogglePin?.(sid);
          }}
          style={{
            width: 86,
            marginRight: 10,
            borderRadius: 14,
            backgroundColor: pinned ? "#eff6ff" : "#f3f4f6",
            borderWidth: 1,
            borderColor: C.border,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Feather name="star" size={18} color={pinned ? C.brand : "#6b7280"} />
          <Text style={{ marginTop: 6, fontWeight: "900", color: pinned ? C.brand : "#6b7280" }}>
            {pinned ? "해제" : "고정"}
          </Text>
        </Pressable>
      </View>
    );

    const renderRightActions = () => (
      <View style={{ flexDirection: "row", justifyContent: "flex-end", gap: 10 }}>
        <Pressable
          onPress={() => {
            if (archived) {
              onUnarchiveSession?.(sid);
              showToast("복원했어요");
            } else {
              onArchiveSession?.(sid);
              showToast("숨김 처리됨 · 복원 가능");
              setArchivedOpen(true);
            }
          }}
          style={{
            width: 86,
            borderRadius: 14,
            backgroundColor: "#f3f4f6",
            borderWidth: 1,
            borderColor: C.border,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Feather name={archived ? "inbox" : "archive"} size={18} color="#374151" />
          <Text style={{ marginTop: 6, fontWeight: "900", color: "#374151" }}>
            {archived ? "복원" : "숨김"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setDeleteTarget(s)}
          style={{
            width: 86,
            borderRadius: 14,
            backgroundColor: "#fef2f2",
            borderWidth: 1,
            borderColor: "#fecaca",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Feather name="trash-2" size={18} color={C.danger} />
          <Text style={{ marginTop: 6, fontWeight: "900", color: C.danger }}>삭제</Text>
        </Pressable>
      </View>
    );

    return (
      <View key={sid} style={{ marginBottom: 10 }}>
        <Swipeable
          renderLeftActions={renderLeftActions}
          renderRightActions={renderRightActions}
          overshootLeft={false}
          overshootRight={false}
        >
          {Row}
        </Swipeable>
      </View>
    );
  };

  const renderChatTab = () => (
    <>
      {renderHeader()}

      <Card>
        <SectionTitle>세션 검색</SectionTitle>
        <Input
          placeholder="메시지/ID로 검색"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
        />

        <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
          <View style={{ flex: 1 }}>
            <Button variant="outline" onPress={onNewChat}>
              <Text>새 채팅</Text>
            </Button>
          </View>
          <View style={{ flex: 1 }}>
            <Button variant="outline" onPress={onDeleteAll}>
              <Text style={{ color: C.danger, fontWeight: "900" }}>전체 삭제</Text>
            </Button>
          </View>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 12 }}>
          <Pressable
            onPress={() => setShowArchived((v) => !v)}
            style={{
              paddingVertical: 8,
              paddingHorizontal: 12,
              borderRadius: 999,
              borderWidth: 1,
              borderColor: showArchived ? "#bfdbfe" : C.border,
              backgroundColor: showArchived ? C.brandBg : "white",
            }}
          >
            <Text style={{ fontWeight: "900", color: showArchived ? C.brand : C.text }}>
              {showArchived ? "숨김 포함" : "숨김 제외"}
            </Text>
          </Pressable>
          <Text style={{ color: C.sub, fontSize: 12 }}>⭐ 고정 · 📦 숨김/복원 · 🗑(길게)</Text>
        </View>
      </Card>

      <View style={{ height: 12 }} />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 18 }}>
        <SectionTitle>대화 목록</SectionTitle>

        {/* ✅ 일반 세션 */}
        {visibleSessions.length === 0 ? (
          <Card>
            <Text style={{ color: C.sub }}>표시할 세션이 없어요.</Text>
          </Card>
        ) : (
          visibleSessions.map(renderSessionRow)
        )}

        {/* ✅ 숨김됨 섹션 (showArchived=true일 때만 표시) */}
        {showArchived && (
          <View style={{ marginTop: 12 }}>
            <Pressable
              onPress={() => setArchivedOpen((v) => !v)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 14,
                borderWidth: 1,
                borderColor: C.border,
                backgroundColor: "white",
                marginBottom: 10,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <Text style={{ fontSize: 13, fontWeight: "900", color: C.text }}>숨김됨</Text>
                <View
                  style={{
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 999,
                    backgroundColor: C.brandBg,
                    borderWidth: 1,
                    borderColor: "#bfdbfe",
                  }}
                >
                  <Text style={{ fontWeight: "900", color: C.brand, fontSize: 12 }}>
                    {archivedSessions.length}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                <Text style={{ color: C.sub, fontSize: 12 }}>
                  {archivedOpen ? "접기" : "펼치기"}
                </Text>
                <Feather
                  name={archivedOpen ? "chevron-up" : "chevron-down"}
                  size={18}
                  color={C.sub}
                />
              </View>
            </Pressable>

            {archivedOpen && (
              <>
                {archivedSessions.length === 0 ? (
                  <Card>
                    <Text style={{ color: C.sub }}>숨김된 세션이 없어요.</Text>
                  </Card>
                ) : (
                  archivedSessions.map(renderSessionRow)
                )}
              </>
            )}
          </View>
        )}

        <View style={{ height: 10 }} />

        <Card>
          <SectionTitle>최근 / 추천 질문</SectionTitle>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
            {suggestedQuestions.map((q) => (
              <Chip key={q} text={q} onPress={() => onQuickSend?.(q)} />
            ))}
          </View>
          <Text style={{ color: C.sub, marginTop: 10, fontSize: 12 }}>
            버튼을 누르면 바로 전송돼요.
          </Text>
        </Card>
      </ScrollView>
    </>
  );

  const renderCommandTab = () => (
    <View style={{ flex: 1 }}>
      {renderHeader()}

      <Card>
        <SectionTitle>빠른 명령</SectionTitle>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
          {commandPresets.map((c) => (
            <Chip key={c} text={c} onPress={() => onQuickSend?.(c)} />
          ))}
        </View>
      </Card>

      <View style={{ height: 12 }} />

      <Card>
        <SectionTitle>팁</SectionTitle>
        <Text style={{ color: "#374151", lineHeight: 20 }}>
          • “거실 불 꺼줘”, “온도 23도로 설정해줘” 같은 명령형이 좋아요.{"\n"}• 실행이 안 되면
          MQTT/센서 상태를 먼저 확인해요.
        </Text>
      </Card>
    </View>
  );

  const renderManageTab = () => (
    <View style={{ flex: 1 }}>
      {renderHeader()}

      <Card>
        <SectionTitle>빠른 작업</SectionTitle>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Button variant="outline" onPress={onNewChat}>
              <Text>새 채팅</Text>
            </Button>
          </View>
          <View style={{ flex: 1 }}>
            <Button variant="outline" onPress={onDeleteAll}>
              <Text style={{ color: C.danger, fontWeight: "900" }}>전체 삭제</Text>
            </Button>
          </View>
        </View>
      </Card>

      <View style={{ height: 12 }} />

      <Card>
        <SectionTitle>관리 기능</SectionTitle>

        <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
          <View style={{ flex: 1 }}>
            <Button variant="outline" onPress={() => onCleanupOldSessions?.(30)}>
              <Text>30일 정리</Text>
            </Button>
          </View>
          <View style={{ flex: 1 }}>
            <Button variant="outline" onPress={() => onCleanupOldSessions?.(7)}>
              <Text>7일 정리</Text>
            </Button>
          </View>
        </View>

        <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
          <View style={{ flex: 1 }}>
            <Button variant="outline" onPress={onToggleDebug}>
              <Text>디버그 {debugEnabled ? "ON" : "OFF"}</Text>
            </Button>
          </View>
          <View style={{ flex: 1 }}>
            <Button variant="outline" onPress={onOpenPrivacy}>
              <Text>보안 안내</Text>
            </Button>
          </View>
        </View>

        <Text style={{ color: C.sub, lineHeight: 20 }}>
          • ⭐: 세션 상단 고정{"\n"}• 📦: 세션 숨김(복원 가능){"\n"}• 디버그 ON: 상태/응답 확인용
        </Text>
      </Card>
    </View>
  );

  const renderContent = () => {
    if (tab === "CHAT") return renderChatTab();
    if (tab === "COMMAND") return renderCommandTab();
    return renderManageTab();
  };

  return (
    <View
      style={{
        width: 320,
        flex: 1,
        backgroundColor: C.bg,

        paddingTop: Math.max(insets.top, 12),
        paddingLeft: 12,
        paddingRight: 12,
        paddingBottom: Math.max(insets.bottom, 12),
      }}
    >
      {renderContent()}

      {/* ✅ 삭제 확인 모달 */}
      <Modal transparent visible={!!deleteTarget} onRequestClose={() => setDeleteTarget(null)}>
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)" }}
          onPress={() => setDeleteTarget(null)}
        />
        <View
          style={{
            position: "absolute",
            left: 16,
            right: 16,
            top: 180,
            backgroundColor: "white",
            borderRadius: 16,
            borderWidth: 1,
            borderColor: C.border,
            padding: 14,
          }}
        >
          <Text style={{ fontWeight: "900", fontSize: 16, marginBottom: 8, color: C.text }}>
            세션을 삭제할까요?
          </Text>

          <Text style={{ color: C.sub, lineHeight: 20 }}>
            이 작업은 되돌리기 어려워요.
            {"\n"}
            대상:{" "}
            <Text style={{ color: C.text, fontWeight: "900" }}>
              {deleteTarget?.lastMessage || deleteTarget?.sessionId.slice(0, 12) + "..."}
            </Text>
          </Text>

          <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
            <View style={{ flex: 1 }}>
              <Button variant="outline" onPress={() => setDeleteTarget(null)}>
                <Text>취소</Text>
              </Button>
            </View>
            <View style={{ flex: 1 }}>
              <Button
                variant="outline"
                onPress={async () => {
                  const sid = deleteTarget?.sessionId;
                  setDeleteTarget(null);
                  if (sid) onDeleteSession(sid);

                  // 힌트는 "삭제 액션 경험" 시점에 내려도 되고, 이미 롱프레스에서 내려서 여기선 생략
                  if (showDeleteHint) {
                    setShowDeleteHint(false);
                    await setDeleteHintDismissed(true);
                  }
                }}
              >
                <Text style={{ color: C.danger, fontWeight: "900" }}>삭제</Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* ✅ Peek(롱프레스 미리보기) 모달 */}
      <Modal transparent visible={peekOpen} onRequestClose={closePeek}>
        <Pressable style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)" }} onPress={closePeek} />
        <View
          style={{
            position: "absolute",
            left: 14,
            right: 14,
            top: 120,
            backgroundColor: "white",
            borderRadius: 18,
            borderWidth: 1,
            borderColor: C.border,
            padding: 14,
          }}
        >
          <Text style={{ fontWeight: "900", fontSize: 16, color: C.text }} numberOfLines={1}>
            {peekTitle}
          </Text>
          <Text style={{ color: C.sub, marginTop: 6, marginBottom: 10, fontSize: 12 }}>
            롱프레스 미리보기 · 최근 {peekLimit}개
          </Text>

          <View style={{ maxHeight: 280 }}>
            <ScrollView>
              {peekLoading ? (
                <Text style={{ color: C.sub }}>불러오는 중...</Text>
              ) : peekItems.length === 0 ? (
                <Text style={{ color: C.sub }}>미리볼 메시지가 없어요.</Text>
              ) : (
                peekItems.map((m, idx) => (
                  <View
                    key={`${idx}-${String(m.createdAt ?? idx)}`}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderRadius: 14,
                      borderWidth: 1,
                      borderColor: C.border,
                      backgroundColor: m.role === "ASSISTANT" ? "#f8fafc" : "white",
                      marginBottom: 8,
                    }}
                  >
                    <Text
                      style={{ fontSize: 11, fontWeight: "900", color: C.sub, marginBottom: 6 }}
                    >
                      {m.role === "ASSISTANT" ? "ASSISTANT" : "YOU"}
                    </Text>
                    <Text style={{ color: C.text, lineHeight: 19 }} numberOfLines={4}>
                      {m.content}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>

          <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
            <View style={{ flex: 1 }}>
              <Button variant="outline" onPress={closePeek}>
                <Text>닫기</Text>
              </Button>
            </View>
            <View style={{ flex: 1 }}>
              <Button
                variant="outline"
                onPress={() => {
                  if (peekSessionId) onSelectSession(peekSessionId);
                  closePeek();
                }}
              >
                <Text style={{ fontWeight: "900", color: C.brand }}>열기</Text>
              </Button>
            </View>
          </View>
        </View>
      </Modal>

      {/* ✅ 1초 토스트 */}
      {toast && (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            left: 12,
            right: 12,
            bottom: 16,
            alignItems: "center",
          }}
        >
          <View
            style={{
              paddingVertical: 10,
              paddingHorizontal: 14,
              borderRadius: 999,
              backgroundColor: "rgba(17,24,39,0.92)",
              borderWidth: 1,
              borderColor: "rgba(255,255,255,0.12)",
            }}
          >
            <Text style={{ color: "white", fontWeight: "900", fontSize: 12 }}>{toast}</Text>
          </View>
        </View>
      )}
    </View>
  );
}
