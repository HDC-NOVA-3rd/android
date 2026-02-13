import React from "react";
import { Text, View } from "react-native";
import CardContainer from "./CardContainer";

export default function NoticeDetailCard({ data }: { data: any }) {
  const title = data?.title ?? data?.subject ?? "공지 상세";
  const content = data?.content ?? data?.body ?? data?.detail ?? "";
  const createdAt = data?.createdAt ?? data?.created_at ?? data?.date ?? "";

  return (
    <CardContainer>
      <Text style={{ fontSize: 16, fontWeight: "800", color: "#111" }} numberOfLines={2}>
        {String(title)}
      </Text>

      {!!createdAt && (
        <Text style={{ marginTop: 6, fontSize: 12, color: "#8C94A1" }}>{String(createdAt)}</Text>
      )}

      {!!content && (
        <View style={{ marginTop: 12 }}>
          <Text style={{ fontSize: 14, color: "#111", lineHeight: 20 }}>{String(content)}</Text>
        </View>
      )}
    </CardContainer>
  );
}
