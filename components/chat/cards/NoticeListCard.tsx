import { Button } from "@/components/ui/button";
import React from "react";
import { Text, View } from "react-native";

export default function NoticeListCard({
  data,
  onPickIndex,
}: {
  data: any;
  onPickIndex?: (text: string) => void;
}) {
  const notices = data?.notices ?? data?.items ?? data?.list ?? [];

  if (!Array.isArray(notices) || notices.length === 0) {
    return (
      <View style={{ marginTop: 10 }}>
        <Text style={{ fontWeight: "800" }}>공지사항</Text>
        <Text style={{ color: "#666", marginTop: 4 }}>조회 결과가 없어요.</Text>
      </View>
    );
  }

  return (
    <View style={{ marginTop: 10, gap: 8 }}>
      <Text style={{ fontWeight: "800" }}>공지사항 목록</Text>

      {notices.map((n: any, idx: number) => {
        const index = n?.index ?? idx + 1;
        const title = n?.title ?? n?.subject ?? "(제목 없음)";
        const createdAt = n?.createdAt ?? n?.created_at ?? n?.date ?? "";

        return (
          <View
            key={String(n?.noticeId ?? n?.id ?? index)}
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

            {!!createdAt && (
              <Text style={{ marginTop: 4, color: "#666" }}>{String(createdAt)}</Text>
            )}

            {!!onPickIndex && (
              <View style={{ marginTop: 8 }}>
                <Button variant="outline" onPress={() => onPickIndex(String(index))}>
                  <Text>자세히 보기</Text>
                </Button>
              </View>
            )}
          </View>
        );
      })}

      <Text style={{ marginTop: 2, fontSize: 12, color: "#666" }}>
        번호를 누르면 상세로 이어져요.
      </Text>
    </View>
  );
}
