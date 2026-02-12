import { Button } from "@/components/ui/button";
import React from "react";
import { Text, View } from "react-native";

export default function ComplaintListCard({
  data,
  onPickIndex,
}: {
  data: any;
  onPickIndex?: (text: string) => void;
}) {
  const items = data?.complaints ?? data?.items ?? data?.list ?? [];

  if (!Array.isArray(items) || items.length === 0) {
    return (
      <View style={{ marginTop: 10 }}>
        <Text style={{ fontWeight: "800" }}>민원</Text>
        <Text style={{ color: "#666", marginTop: 4 }}>조회 결과가 없어요.</Text>
      </View>
    );
  }

  return (
    <View style={{ marginTop: 10, gap: 8 }}>
      <Text style={{ fontWeight: "800" }}>민원 목록</Text>

      {items.map((c: any, idx: number) => {
        const index = c?.index ?? idx + 1;
        const title = c?.title ?? c?.subject ?? c?.type ?? "(항목)";
        const status = c?.status ?? c?.state ?? "";
        const createdAt = c?.createdAt ?? c?.created_at ?? c?.date ?? "";

        return (
          <View
            key={String(c?.complaintId ?? c?.id ?? index)}
            style={{
              borderWidth: 1,
              borderColor: "#eee",
              borderRadius: 12,
              padding: 10,
              backgroundColor: "white",
            }}
          >
            <Text style={{ fontWeight: "700" }}>
              {index}번 · {title}
            </Text>

            <View style={{ marginTop: 4, flexDirection: "row", gap: 10 }}>
              {!!status && <Text style={{ color: "#666" }}>상태: {String(status)}</Text>}
              {!!createdAt && <Text style={{ color: "#666" }}>{String(createdAt)}</Text>}
            </View>

            {!!onPickIndex && (
              <View style={{ marginTop: 8 }}>
                <Button variant="outline" onPress={() => onPickIndex(String(index))}>
                  <Text>상세 보기</Text>
                </Button>
              </View>
            )}
          </View>
        );
      })}
    </View>
  );
}
