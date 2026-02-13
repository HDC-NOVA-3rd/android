import React, { useRef } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ChatBubble from "@/components/chat/ChatBubble";
import QuickReplies from "@/components/chat/QuickReplies";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { ChatIntent } from "../../.expo/types/chat";

// 채팅방 역할 타입
type ChatRole = "USER" | "ASSISTANT";

// 채팅 아이템 타입
export type ChatItem = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
  intent?: ChatIntent;
  data?: any;
};

type Props = {
  title?: string;
  messages: ChatItem[];
  text: string;
  setText: (v: string) => void;
  isSending: boolean;
  onSend: (text?: string) => void;
  quickReplies: string[];
};

export default function ChatRoom({
  title = "Chatbot",
  messages,
  text,
  setText,
  isSending,
  onSend,
  quickReplies,
}: Props) {
  const listRef = useRef<FlatList<ChatItem>>(null);
  const insets = useSafeAreaInsets();

  const scrollToEnd = () => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  };
  const isEmptyState = messages.length === 1 && messages[0].role === "ASSISTANT";
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
    >
      <View style={{ flex: 1, paddingHorizontal: 12, paddingTop: 12 }}>
        {!!title && (
          <Text style={{ fontSize: 16, fontWeight: "700", marginBottom: 10 }}>{title}</Text>
        )}

        <FlatList
          ref={listRef}
          style={{ flex: 1 }}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 12, gap: 8 }}
          renderItem={({ item }) => {
            return (
              <ChatBubble
                role={item.role}
                content={item.content}
                intent={item.intent}
                data={item.data}
                onQuickSend={(text) => onSend(text)}
              />
            );
          }}
          onContentSizeChange={scrollToEnd}
          keyboardShouldPersistTaps="handled"
        />

        <View style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
          <View style={{ marginBottom: 10 }}>
            <QuickReplies items={quickReplies} onPress={(v: string) => onSend(v)} />
          </View>

          <View style={{ flexDirection: "row", gap: 8, alignItems: "center" }}>
            <View style={{ flex: 1 }}>
              <Input
                placeholder="메시지를 입력하세요"
                value={text}
                onChangeText={setText}
                editable={!isSending}
                onSubmitEditing={() => onSend()}
                returnKeyType="send"
              />
            </View>

            <Button onPress={() => onSend()} disabled={isSending}>
              <Text style={{ color: "white", fontWeight: "700" }}>
                {isSending ? "전송중" : "전송"}
              </Text>
            </Button>
          </View>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
