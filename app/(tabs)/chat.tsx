import React, { useEffect, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMemberId } from "../../api/memberStorage";
import { sendChat } from "../../api/service/chatService";

import ChatBubble from "@/components/chat/ChatBubble";
import QuickReplies from "@/components/chat/QuickReplies";

type ChatRole = "USER" | "ASSISTANT";

type ChatItem = {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: number;
};

const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export default function ChatScreen() {
  const [memberId, setMemberIdState] = useState<number | null>(null);
  const [sessionId, setSessionId] = useState<string>("");
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);

  const [messages, setMessages] = useState<ChatItem[]>([
    {
      id: makeId(),
      role: "ASSISTANT",
      content: "안녕하세요! 무엇을 도와드릴까요 🙂",
      createdAt: Date.now(),
    },
  ]);

  const listRef = useRef<FlatList<ChatItem>>(null);

  useEffect(() => {
    (async () => {
      const id = await getMemberId();
      console.log(" getMemberId() =", id);
      setMemberIdState(id);

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
      }
    })();
  }, []);

  const scrollToEnd = () => {
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 50);
  };

  const appendMessage = (role: ChatRole, content: string) => {
    setMessages((prev) => [...prev, { id: makeId(), role, content, createdAt: Date.now() }]);
  };

  const handleSend = async (messageText?: string) => {
    const content = (messageText ?? text).trim();
    if (!content) return;

    // ✅ 로그인(=memberId) 없으면 전송 막기
    if (!memberId) {
      appendMessage("ASSISTANT", "로그인이 필요해요. 로그인 후 다시 시도해주세요.");
      scrollToEnd();
      return;
    }

    // UI 반영
    appendMessage("USER", content);
    setText("");
    scrollToEnd();

    try {
      setIsSending(true);

      // ✅ sessionId 없으면 필드 자체를 빼서 보냄
      const payload: any = {
        message: content,
        memberId,
      };
      if (sessionId) payload.sessionId = sessionId;

      const res = await sendChat(payload);

      // 백엔드 응답 구조: { sessionId, answer, intent, data } 가정
      if (res?.sessionId) setSessionId(res.sessionId);

      const answer = res?.answer ?? "(응답이 비어있어요)";
      appendMessage("ASSISTANT", answer);
      scrollToEnd();
    } catch (e: any) {
      const status = e?.response?.status;
      const data = e?.response?.data;
      appendMessage(
        "ASSISTANT",
        `오류가 발생했어요.\nstatus=${status}\n${data ? JSON.stringify(data) : e?.message}`,
      );
      scrollToEnd();
    } finally {
      setIsSending(false);
    }
  };

  const quickReplies = [
    "내 입주민 정보 보여줘",
    "헬스장 운영시간이 언제야?",
    "지금 거실 온도 알려줘",
    "내 동/호 정보 뭐야?",
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 8 : 0}
      >
        <View style={{ flex: 1, paddingHorizontal: 12, paddingTop: 12 }}>
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingBottom: 12, gap: 8 }}
            renderItem={({ item }) => <ChatBubble role={item.role} content={item.content} />}
            onContentSizeChange={scrollToEnd}
          />

          <View style={{ marginBottom: 10 }}>
            <QuickReplies items={quickReplies} onPress={(v: string) => handleSend(v)} />
          </View>

          <View style={{ flexDirection: "row", gap: 8, alignItems: "center", paddingBottom: 12 }}>
            <View style={{ flex: 1 }}>
              <Input
                placeholder="메시지를 입력하세요"
                value={text}
                onChangeText={setText}
                editable={!isSending}
                onSubmitEditing={() => handleSend()}
                returnKeyType="send"
              />
            </View>

            <Button onPress={() => handleSend()} disabled={isSending}>
              <Text style={{ color: "white", fontWeight: "700" }}>
                {isSending ? "전송중" : "전송"}
              </Text>
            </Button>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
