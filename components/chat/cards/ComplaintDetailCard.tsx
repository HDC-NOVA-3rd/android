import React from "react";
import { Text, View } from "react-native";
import CardContainer from "./CardContainer";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
      }}
    >
      <Text style={{ fontSize: 13, color: "#7B8494" }}>{label}</Text>
      <Text
        style={{
          fontSize: 14,
          color: "#111",
          fontWeight: "800",
          maxWidth: "70%",
          textAlign: "right",
        }}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

export default function ComplaintDetailCard({ data }: { data: any }) {
  const title = data?.title ?? data?.subject ?? "민원 상세";
  const content = data?.content ?? data?.body ?? data?.detail ?? "";
  const status = data?.status ?? data?.state ?? "";
  const createdAt = data?.createdAt ?? data?.created_at ?? data?.date ?? "";

  return (
    <CardContainer>
      <Text style={{ fontSize: 16, fontWeight: "800", color: "#111" }} numberOfLines={2}>
        {String(title)}
      </Text>

      <View style={{ height: 10 }} />

      <Row label="상태" value={status ? String(status) : "-"} />
      <View style={{ height: 1, backgroundColor: "#F1F3F6" }} />
      <Row label="접수일" value={createdAt ? String(createdAt) : "-"} />

      {!!content && (
        <>
          <View style={{ height: 1, backgroundColor: "#F1F3F6" }} />
          <View style={{ paddingTop: 12 }}>
            <Text style={{ fontSize: 13, color: "#7B8494" }}>내용</Text>
            <Text style={{ fontSize: 14, color: "#111", lineHeight: 20, marginTop: 6 }}>
              {String(content)}
            </Text>
          </View>
        </>
      )}
    </CardContainer>
  );
}
