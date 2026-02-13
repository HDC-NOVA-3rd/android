import React from "react";
import { Text, View } from "react-native";
import CardContainer from "./CardContainer";
import TossCell from "./TossCell";

export default function ComplaintListCard({
  data,
  onPickIndex,
}: {
  data: any;
  onPickIndex?: (text: string) => void;
}) {
  const items = data?.complaints ?? data?.items ?? data?.list ?? [];

  return (
    <CardContainer>
      <Text style={{ fontSize: 16, fontWeight: "800", color: "#111" }}>민원</Text>
      <View style={{ height: 10 }} />

      {!Array.isArray(items) || items.length === 0 ? (
        <Text style={{ fontSize: 13, color: "#8C94A1" }}>조회된 민원이 없습니다.</Text>
      ) : (
        <View>
          {items.map((c: any, idx: number) => {
            const index = c?.index ?? idx + 1;
            const title = c?.title ?? c?.subject ?? c?.type ?? "(민원)";
            const status = c?.status ?? "";
            const date = c?.createdAt ?? c?.created_at ?? c?.date ?? "";

            const subtitle = [date && String(date), status && `상태: ${status}`]
              .filter(Boolean)
              .join(" · ");

            return (
              <View key={String(c?.complaintId ?? c?.id ?? index)}>
                <TossCell
                  title={`${index}번 · ${title}`}
                  subtitle={subtitle || undefined}
                  onPress={onPickIndex ? () => onPickIndex(String(index)) : undefined}
                />
                {idx !== items.length - 1 && (
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
