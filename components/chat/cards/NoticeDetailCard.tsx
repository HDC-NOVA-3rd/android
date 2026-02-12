import React from "react";
import { Text, View } from "react-native";

export default function NoticeDetailCard({ data }: { data: any }) {
  const title = data?.title ?? data?.subject ?? "공지 상세";
  const content = data?.content ?? data?.body ?? data?.detail ?? "";
  const createdAt = data?.createdAt ?? data?.created_at ?? data?.date ?? "";

  return (
    <View style={{ marginTop: 10, gap: 6 }}>
      <Text style={{ fontWeight: "900" }}>{title}</Text>
      {!!createdAt && <Text style={{ color: "#666" }}>{String(createdAt)}</Text>}
      {!!content && <Text style={{ color: "#222", lineHeight: 20 }}>{String(content)}</Text>}
    </View>
  );
}
