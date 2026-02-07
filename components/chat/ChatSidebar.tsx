import type { ChatSessionDto } from "@/api/service/chatHistoryService";
import { Button } from "@/components/ui/button";
import React from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

// 채팅 사이드바 컴포넌트
type Props = {
  sessions: ChatSessionDto[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onNewChat: () => void;
};
// 렌더링
export default function ChatSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
}: Props) {
  // 렌더링
  return (
    <View style={{ flex: 1, padding: 12 }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 12 }}>
        <Text style={{ fontSize: 16, fontWeight: "700" }}>대화</Text>
        <Button variant="outline" onPress={onNewChat}>
          <Text>새 채팅</Text>
        </Button>
      </View>

      <ScrollView>
        {sessions.length === 0 ? (
          <Text style={{ color: "#666" }}>세션이 없어요.</Text>
        ) : (
          sessions.map((s) => {
            const isActive = activeSessionId === s.sessionId;
            // 세션 아이템 렌더링
            return (
              <Pressable
                key={s.sessionId}
                onPress={() => onSelectSession(s.sessionId)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 10,
                  borderRadius: 10,
                  marginBottom: 8,
                  backgroundColor: isActive ? "#f2f2f2" : "transparent",
                }}
              >
                <Text style={{ fontWeight: "700" }} numberOfLines={1}>
                  {s.lastMessage || s.sessionId.slice(0, 12) + "..."}
                </Text>
                <Text style={{ color: "#666", marginTop: 2, fontSize: 12 }} numberOfLines={1}>
                  {s.lastMessageAt}
                </Text>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
