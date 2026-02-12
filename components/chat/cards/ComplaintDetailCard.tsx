import React from "react";
import { Text, View } from "react-native";

export default function ComplaintDetailCard({ data }: { data: any }) {
  const title = data?.title ?? data?.subject ?? "민원 상세";
  const content = data?.content ?? data?.body ?? data?.detail ?? "";
  const status = data?.status ?? data?.state ?? "";
  const createdAt = data?.createdAt ?? data?.created_at ?? data?.date ?? "";

  return (
    <View style={{ marginTop: 10, gap: 6 }}>
      <Text style={{ fontWeight: "900" }}>{title}</Text>
      <View style={{ flexDirection: "row", gap: 10 }}>
        {!!status && <Text style={{ color: "#666" }}>상태: {String(status)}</Text>}
        {!!createdAt && <Text style={{ color: "#666" }}>{String(createdAt)}</Text>}
      </View>
      {!!content && <Text style={{ color: "#222", lineHeight: 20 }}>{String(content)}</Text>}
    </View>
  );
}
