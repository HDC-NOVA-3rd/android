import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Stack } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChatbotScreen() {
  const baseUrl = process.env.EXPO_PUBLIC_API_URL;

  const [message, setMessage] = useState("테스트");
  const [sessionId, setSessionId] = useState("");
  const [resultText, setResultText] = useState("대기중");
  const [isLoading, setIsLoading] = useState(false);

  const handleTestCall = async () => {
    try {
      if (!baseUrl) {
        setResultText("EXPO_PUBLIC_API_URL이 설정되지 않았습니다. (.env 확인)");
        return;
      }

      setIsLoading(true);
      setResultText("요청 중...");

      const response = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          sessionId: sessionId || "",
        }),
      });

      const rawText = await response.text();

      if (!response.ok) {
        setResultText(`HTTP ${response.status}\n${rawText}`);
        return;
      }

      // JSON 파싱
      const json = JSON.parse(rawText);

      // 대화 이어가기: sessionId 갱신
      if (json?.sessionId) setSessionId(json.sessionId);

      setResultText(`성공 ✅\n${JSON.stringify(json, null, 2)}`);
    } catch (error: any) {
      setResultText(`네트워크 에러 ❌\n${error?.message || "unknown error"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Card>
          <CardHeader>
            <CardTitle>챗봇 API 호출 테스트</CardTitle>
            <CardDescription>/api/chat POST가 실제로 되는지 확인합니다.</CardDescription>
          </CardHeader>

          <CardContent>
            <View style={{ gap: 12 }}>
              <View>
                <Label>BASE URL</Label>
                <Input value={baseUrl || ""} editable={false} />
              </View>

              <View>
                <Label>message</Label>
                <Input value={message} onChangeText={setMessage} placeholder="보낼 메시지" />
              </View>

              <View>
                <Label>sessionId (자동 갱신됨)</Label>
                <Input value={sessionId} onChangeText={setSessionId} placeholder="없으면 빈 값" />
              </View>

              <Button onPress={handleTestCall} disabled={isLoading}>
                <Text style={{ color: "white", fontWeight: "bold" }}>
                  {isLoading ? "요청 중..." : "POST /api/chat 호출"}
                </Text>
              </Button>

              <View
                style={{ padding: 12, borderWidth: 1, borderColor: "#EAECF0", borderRadius: 12 }}
              >
                <Text style={{ fontSize: 12 }} selectable>
                  {resultText}
                </Text>
              </View>
            </View>
          </CardContent>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
