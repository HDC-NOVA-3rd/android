import React from "react";
import { Text, View } from "react-native";
import CardContainer from "./CardContainer";
import TossCell from "./TossCell";

export default function NoticeListCard({
  data,
  onPickIndex,
}: {
  data: any;
  onPickIndex?: (text: string) => void;
}) {
  const notices = data?.notices ?? data?.items ?? data?.list ?? [];

  return (
    <CardContainer>
      <Text style={{ fontSize: 16, fontWeight: "800", color: "#111" }}>공지사항</Text>
      <View style={{ height: 10 }} />

      {!Array.isArray(notices) || notices.length === 0 ? (
        <Text style={{ fontSize: 13, color: "#8C94A1" }}>조회된 공지사항이 없습니다.</Text>
      ) : (
        <View>
          {notices.map((n: any, idx: number) => {
            const index = n?.index ?? idx + 1;
            const title = n?.title ?? n?.subject ?? "(제목 없음)";
            const createdAt = n?.createdAt ?? n?.created_at ?? n?.date ?? "";

            return (
              <View key={String(n?.noticeId ?? n?.id ?? index)}>
                <TossCell
                  title={`${index}번 · ${title}`}
                  subtitle={createdAt ? String(createdAt) : undefined}
                  onPress={onPickIndex ? () => onPickIndex(String(index)) : undefined}
                />
                {idx !== notices.length - 1 && (
                  <View style={{ height: 1, backgroundColor: "#F1F3F6" }} />
                )}
              </View>
            );
          })}
        </View>
      )}

      {!!onPickIndex && (
        <Text style={{ marginTop: 10, fontSize: 12, color: "#8C94A1" }}>
          항목을 누르면 상세로 이동해요.
        </Text>
      )}
    </CardContainer>
  );
}
