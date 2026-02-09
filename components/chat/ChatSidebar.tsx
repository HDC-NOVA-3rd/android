import type { ChatSessionDto } from "@/api/service/chatHistoryService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

type TabKey = "CHAT" | "COMMAND" | "MANAGE";

type Props = {
  sessions: ChatSessionDto[];
  activeSessionId: string | null;

  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;

  onDeleteSession: (sessionId: string) => void;
  onDeleteAll: () => void;

  // ✅ 추천 질문/명령 바로 전송
  onQuickSend?: (text: string) => void;

  // ✅ 확장 기능
  pinnedIds?: Set<string>;
  archivedIds?: Set<string>;
  debugEnabled?: boolean;

  onTogglePin?: (sessionId: string) => void;
  onArchiveSession?: (sessionId: string) => void;
  onUnarchiveSession?: (sessionId: string) => void;

  onCleanupOldSessions?: (days: number) => void;

  onToggleDebug?: () => void;
  onOpenPrivacy?: () => void;
};

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
}: Props) {
  const [tab, setTab] = useState<TabKey>("CHAT");
  const [query, setQuery] = useState("");
  const [showArchived, setShowArchived] = useState(false);

  const isPinned = (sid: string) => !!pinnedIds?.has(sid);
  const isArchived = (sid: string) => !!archivedIds?.has(sid);

  const filteredSessions = useMemo(() => {
    const q = query.trim().toLowerCase();

    // 1) 검색 + (기본) 아카이브 숨김
    let list = sessions.filter((s) => {
      const sid = s.sessionId ?? "";
      if (!showArchived && isArchived(sid)) return false;

      if (!q) return true;
      const a = (s.lastMessage ?? "").toLowerCase();
      const b = sid.toLowerCase();
      return a.includes(q) || b.includes(q);
    });

    // 2) 핀 먼저
    list = [...list].sort((a, b) => {
      const ap = isPinned(a.sessionId) ? 1 : 0;
      const bp = isPinned(b.sessionId) ? 1 : 0;
      return bp - ap;
    });

    return list;
  }, [sessions, query, showArchived, pinnedIds, archivedIds]);

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

  const TabButton = ({ k, label }: { k: TabKey; label: string }) => {
    const active = tab === k;
    return (
      <Pressable
        onPress={() => setTab(k)}
        style={{
          paddingVertical: 8,
          paddingHorizontal: 14,
          borderRadius: 999,
          borderWidth: 1,
          borderColor: active ? "#3b82f6" : "#e5e5e5",
          backgroundColor: active ? "#eff6ff" : "white",
        }}
      >
        <Text style={{ fontWeight: "700", color: active ? "#2563eb" : "#111" }}>{label}</Text>
      </Pressable>
    );
  };

  const Chip = ({ text, onPress }: { text: string; onPress: () => void }) => (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: "#e5e5e5",
        backgroundColor: "white",
      }}
    >
      <Text style={{ fontWeight: "700", color: "#2563eb" }} numberOfLines={1}>
        {text}
      </Text>
    </Pressable>
  );

  const StatusRow = ({ label, ok, value }: { label: string; ok: boolean; value: string }) => (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 8 }}>
      <Text style={{ width: 54, fontWeight: "800" }}>{label}</Text>
      <Text style={{ fontSize: 14 }}>{ok ? "🟢" : "🔴"}</Text>
      <Text style={{ color: ok ? "#16a34a" : "#dc2626", fontWeight: "800" }}>{value}</Text>
    </View>
  );

  const renderTabs = () => (
    <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
      <TabButton k="CHAT" label="대화" />
      <TabButton k="COMMAND" label="명령" />
      <TabButton k="MANAGE" label="관리" />
    </View>
  );

  const renderSessionRow = (s: ChatSessionDto) => {
    const sid = s.sessionId;
    const active = activeSessionId === sid;

    const pinned = isPinned(sid);
    const archived = isArchived(sid);

    return (
      <View
        key={sid}
        style={{
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
          paddingVertical: 10,
          paddingHorizontal: 10,
          borderRadius: 12,
          marginBottom: 8,
          backgroundColor: active ? "#f2f2f2" : "transparent",
          borderWidth: 1,
          borderColor: active ? "#e5e5e5" : "transparent",
        }}
      >
        <Pressable style={{ flex: 1 }} onPress={() => onSelectSession(sid)}>
          <Text style={{ fontWeight: "700" }} numberOfLines={1}>
            {s.lastMessage || sid.slice(0, 12) + "..."}
          </Text>
          <Text style={{ color: "#666", marginTop: 2, fontSize: 12 }} numberOfLines={1}>
            {s.lastMessageAt}
          </Text>
        </Pressable>

        {/* 📌 핀 */}
        <Pressable onPress={() => onTogglePin?.(sid)} hitSlop={10}>
          <Text style={{ fontSize: 16 }}>{pinned ? "📌" : "📍"}</Text>
        </Pressable>

        {/* 🗄 아카이브/복원 */}
        {archived ? (
          <Pressable onPress={() => onUnarchiveSession?.(sid)} hitSlop={10}>
            <Text style={{ fontSize: 16 }}>🗃</Text>
          </Pressable>
        ) : (
          <Pressable onPress={() => onArchiveSession?.(sid)} hitSlop={10}>
            <Text style={{ fontSize: 16 }}>🗄</Text>
          </Pressable>
        )}

        {/* 🗑 삭제 */}
        <Pressable onPress={() => onDeleteSession(sid)} hitSlop={10}>
          <Text style={{ fontSize: 16 }}>🗑</Text>
        </Pressable>
      </View>
    );
  };

  const renderChatTab = () => (
    <>
      {renderTabs()}

      <View style={{ marginBottom: 10 }}>
        <Input
          placeholder="세션 검색 (메시지/ID)"
          value={query}
          onChangeText={setQuery}
          returnKeyType="search"
        />
      </View>

      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        <View style={{ flex: 1 }}>
          <Button variant="outline" onPress={onNewChat}>
            <Text>새 채팅</Text>
          </Button>
        </View>
        <View style={{ flex: 1 }}>
          <Button variant="outline" onPress={onDeleteAll}>
            <Text>전체 삭제</Text>
          </Button>
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <Pressable
          onPress={() => setShowArchived((v) => !v)}
          style={{
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 999,
            borderWidth: 1,
            borderColor: showArchived ? "#3b82f6" : "#e5e5e5",
            backgroundColor: showArchived ? "#eff6ff" : "white",
          }}
        >
          <Text style={{ fontWeight: "800", color: showArchived ? "#2563eb" : "#111" }}>
            {showArchived ? "숨김 포함" : "숨김 제외"}
          </Text>
        </Pressable>
        <Text style={{ color: "#666", fontSize: 12 }}>📍/📌=고정, 🗄=숨김, 🗃=복원</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 14 }}>
        {filteredSessions.length === 0 ? (
          <Text style={{ color: "#666", marginBottom: 12 }}>세션이 없어요.</Text>
        ) : (
          filteredSessions.map(renderSessionRow)
        )}

        <View style={{ height: 10 }} />

        <Text style={{ fontSize: 14, fontWeight: "800", marginBottom: 10 }}>최근 / 추천 질문</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
          {suggestedQuestions.map((q) => (
            <Chip key={q} text={q} onPress={() => onQuickSend?.(q)} />
          ))}
        </View>
        <Text style={{ color: "#666", marginBottom: 14 }}>버튼을 누르면 바로 질문이 전송돼요.</Text>

        <View
          style={{
            borderWidth: 1,
            borderColor: "#e5e5e5",
            backgroundColor: "#f8fafc",
            borderRadius: 14,
            padding: 14,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: "800", marginBottom: 10 }}>시스템 상태</Text>
          <StatusRow label="서버:" ok value="정상" />
          <StatusRow label="MQTT:" ok value="연결됨" />
          <StatusRow label="센서:" ok value="수신 중" />
          <Text style={{ color: "#666", marginTop: 10 }}>마지막 업데이트: 방금 전</Text>
        </View>
      </ScrollView>
    </>
  );

  const renderCommandTab = () => (
    <View style={{ flex: 1 }}>
      {renderTabs()}

      <Text style={{ fontSize: 14, fontWeight: "800", marginBottom: 10 }}>빠른 명령</Text>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 12 }}>
        {commandPresets.map((c) => (
          <Chip key={c} text={c} onPress={() => onQuickSend?.(c)} />
        ))}
      </View>

      <View
        style={{
          borderWidth: 1,
          borderColor: "#e5e5e5",
          borderRadius: 14,
          padding: 14,
          backgroundColor: "white",
        }}
      >
        <Text style={{ fontWeight: "800", marginBottom: 8 }}>팁</Text>
        <Text style={{ color: "#444", lineHeight: 20 }}>
          • “거실 불 꺼줘”, “온도 23도로 설정해줘” 처럼 명령형이 좋아요.
          {"\n"}• 실행이 안 되면 MQTT/센서 상태를 먼저 확인해요.
        </Text>
      </View>
    </View>
  );

  const renderManageTab = () => (
    <View style={{ flex: 1 }}>
      {renderTabs()}

      <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
        <View style={{ flex: 1 }}>
          <Button variant="outline" onPress={onNewChat}>
            <Text>새 채팅</Text>
          </Button>
        </View>
        <View style={{ flex: 1 }}>
          <Button variant="outline" onPress={onDeleteAll}>
            <Text>전체 삭제</Text>
          </Button>
        </View>
      </View>

      {/* ✅ 관리 기능 확장 */}
      <View
        style={{
          borderWidth: 1,
          borderColor: "#e5e5e5",
          borderRadius: 14,
          padding: 14,
          backgroundColor: "white",
          marginBottom: 12,
        }}
      >
        <Text style={{ fontWeight: "900", marginBottom: 8 }}>관리 기능</Text>

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

        <Text style={{ color: "#666", lineHeight: 20 }}>
          • 📌: 세션을 상단에 고정해요{"\n"}• 🗄: 세션을 숨겨서 정리해요(복원 가능){"\n"}• 디버그
          ON: 상태/응답 확인용
        </Text>
      </View>

      <View
        style={{
          borderWidth: 1,
          borderColor: "#e5e5e5",
          borderRadius: 14,
          padding: 14,
          backgroundColor: "white",
        }}
      >
        <Text style={{ fontWeight: "800", marginBottom: 8 }}>관리 아이디어</Text>
        <Text style={{ color: "#444", lineHeight: 20 }}>
          • 즐겨찾기 세션 고정(📌){"\n"}• 오래된 세션 자동 정리{"\n"}• 디버그 로그 토글{"\n"}•
          개인정보/보안 안내
        </Text>
      </View>
    </View>
  );

  const renderContent = () => {
    if (tab === "CHAT") return renderChatTab();
    if (tab === "COMMAND") return renderCommandTab();
    return renderManageTab();
  };

  return <View style={{ width: 320, padding: 12, flex: 1 }}>{renderContent()}</View>;
}
