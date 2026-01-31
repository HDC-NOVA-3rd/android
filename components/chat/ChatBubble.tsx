import { Text, View } from "react-native";

export default function ChatBubble({
  role,
  text,
  intent,
  data,
}: {
  role: "user" | "assistant";
  text?: string;
  intent?: string;
  data?: any;
}) {
  const isUser = role === "user";

  return (
    <View
      style={{
        alignSelf: isUser ? "flex-end" : "flex-start",
        maxWidth: "82%",
        marginVertical: 6,
        padding: 12,
        borderRadius: 14,
        backgroundColor: isUser ? "#2F6BFF" : "#F2F4F7",
      }}
    >
      {!!text && <Text style={{ color: isUser ? "white" : "#111" }}>{text}</Text>}

      {/* MVP: intent/data가 있으면 간단히 보조로 표시 */}
      {!!intent && !isUser && (
        <Text style={{ marginTop: 6, fontSize: 12, color: "#666" }}>intent: {intent}</Text>
      )}

      {!!data && !isUser && (
        <Text style={{ marginTop: 6, fontSize: 12, color: "#666" }}>{JSON.stringify(data)}</Text>
      )}
    </View>
  );
}
