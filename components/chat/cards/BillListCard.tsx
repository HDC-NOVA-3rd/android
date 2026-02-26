import React from "react";
import { Text, View } from "react-native";
import CardContainer from "./CardContainer";
import TossCell from "./TossCell";

export default function BillListCard({
  data,
  onPickIndex,
}: {
  data: any;
  onPickIndex?: (text: string) => void;
}) {
  const bills = Array.isArray(data?.bills) ? data.bills : [];

  return (
    <CardContainer>
      <Text style={{ fontSize: 16, fontWeight: "800", color: "#111" }}>관리비 고지서</Text>
      <View style={{ height: 10 }} />

      {bills.length === 0 ? (
        <Text style={{ fontSize: 13, color: "#8C94A1" }}>조회된 고지서가 없습니다.</Text>
      ) : (
        <View>
          {bills.map((b: any, idx: number) => {
            const index = b?.index ?? idx + 1;
            const title = `${String(b?.billMonth ?? "-")} 관리비`;
            const subtitle =
              b?.totalPrice != null ? `${Number(b.totalPrice).toLocaleString()}원` : "-";

            return (
              <View key={String(b?.billId ?? index)}>
                <TossCell
                  title={title}
                  subtitle={subtitle}
                  rightText=">"
                  onPress={() => onPickIndex?.(`${index}번`)}
                />
                {idx !== bills.length - 1 && (
                  <View style={{ height: 1, backgroundColor: "#F1F3F6" }} />
                )}
              </View>
            );
          })}
        </View>
      )}
    </CardContainer>
  );
}
