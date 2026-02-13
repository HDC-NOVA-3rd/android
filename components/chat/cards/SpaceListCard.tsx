import React from "react";
import { Text, View } from "react-native";
import CardContainer from "./CardContainer";
import TossCell from "./TossCell";

export default function SpaceListCard({
  data,
  onQuickSend,
}: {
  data: any;
  onQuickSend?: (text: string) => void;
}) {
  const facilityName = data?.facilityName ?? data?.facility ?? "";
  const infoType = data?.info_type ?? data?.infoType ?? ""; // PRICE / CAPACITY 등
  const spaces = data?.spaces ?? data?.items ?? data?.list ?? [];
  const facilities = data?.facilities ?? [];

  const headerTitle =
    infoType === "PRICE" ? "공간 가격" : infoType === "CAPACITY" ? "공간 정원" : "공간 목록";

  // 1) 시설 선택 필요
  if (Array.isArray(facilities) && facilities.length > 0) {
    return (
      <CardContainer>
        <Text style={{ fontSize: 16, fontWeight: "800", color: "#111" }}>시설 선택</Text>
        <Text style={{ marginTop: 6, fontSize: 12, color: "#8C94A1" }}>
          어느 시설을 말씀하시는 건가요?
        </Text>
        <View style={{ height: 10 }} />

        <View>
          {facilities.map((f: any, idx: number) => {
            const TossId = String(f?.facilityId ?? f?.id ?? idx);
            const name = f?.name ?? f?.facilityName ?? `(시설 ${idx + 1})`;

            return (
              <View key={TossId}>
                <TossCell
                  title={name}
                  subtitle="탭해서 이 시설로 보기"
                  onPress={onQuickSend ? () => onQuickSend(name) : undefined}
                />
                {idx !== facilities.length - 1 && (
                  <View style={{ height: 1, backgroundColor: "#F1F3F6" }} />
                )}
              </View>
            );
          })}
        </View>
      </CardContainer>
    );
  }

  // 2) 공간 목록 없음
  if (!Array.isArray(spaces) || spaces.length === 0) {
    return (
      <CardContainer>
        <Text style={{ fontSize: 16, fontWeight: "800", color: "#111" }}>
          {facilityName ? `${facilityName} · ` : ""}
          {headerTitle}
        </Text>
        <View style={{ height: 10 }} />
        <Text style={{ fontSize: 13, color: "#8C94A1" }}>조회 결과가 없습니다.</Text>
      </CardContainer>
    );
  }

  // 3) 공간 목록
  return (
    <CardContainer>
      <Text style={{ fontSize: 16, fontWeight: "800", color: "#111" }}>
        {facilityName ? `${facilityName} · ` : ""}
        {headerTitle}
      </Text>
      <View style={{ height: 10 }} />

      <View>
        {spaces.map((s: any, idx: number) => {
          const id = String(s?.spaceId ?? s?.id ?? idx);
          const name = s?.spaceName ?? s?.name ?? s?.title ?? `(공간 ${idx + 1})`;

          const price = s?.price ?? s?.fee ?? s?.amount;
          const capacity = s?.capacity ?? s?.maxPeople ?? s?.max_capacity;

          const subtitle = [
            price != null ? `요금 ${String(price)}` : "",
            capacity != null ? `정원 ${String(capacity)}` : "",
          ]
            .filter(Boolean)
            .join(" · ");

          return (
            <View key={id}>
              <TossCell
                title={name}
                subtitle={subtitle || "탭해서 상세 보기"}
                onPress={onQuickSend ? () => onQuickSend(name) : undefined}
              />
              {idx !== spaces.length - 1 && (
                <View style={{ height: 1, backgroundColor: "#F1F3F6" }} />
              )}
            </View>
          );
        })}
      </View>

      {!!onQuickSend && (
        <Text style={{ marginTop: 10, fontSize: 12, color: "#8C94A1" }}>
          항목을 누르면 해당 공간 상세로 이동해요.
        </Text>
      )}
    </CardContainer>
  );
}
