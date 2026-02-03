import { Text, View } from "react-native";

export default function ChatBubble({
  role,
  content,
  intent,
  data,
}: {
  role: "USER" | "ASSISTANT";
  content: string;
  intent?: string;
  data?: any;
}) {
  const isUser = role === "USER";

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
      <Text style={{ color: isUser ? "white" : "#111" }}>{content}</Text>

      {!!intent && !isUser && (
        <Text style={{ marginTop: 6, fontSize: 12, color: "#666" }}>intent: {intent}</Text>
      )}

      {!!data && !isUser && (
        <Text style={{ marginTop: 6, fontSize: 12, color: "#666" }}>{JSON.stringify(data)}</Text>
      )}
    </View>
  );
}
