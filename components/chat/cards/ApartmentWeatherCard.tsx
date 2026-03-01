import React from "react";
import { Text, View } from "react-native";
import type { ApartmentWeatherData } from "../../../.expo/types/chat";
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
      <Text style={{ fontSize: 14, color: "#111", fontWeight: "800" }} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export default function ApartmentWeatherCard({ data }: { data: ApartmentWeatherData }) {
  const w = data?.weather;

  const tempHum =
    w?.temperature != null && w?.humidity != null
      ? `${w.temperature}°C · ${w.humidity}%`
      : w?.temperature != null
        ? `${w.temperature}°C`
        : "-";

  return (
    <CardContainer>
      <Text style={{ fontSize: 16, fontWeight: "800", color: "#111" }}>
        {w?.locationName ? `${w.locationName} 날씨` : "날씨"}
      </Text>

      <View style={{ height: 10 }} />

      <Row label="기온/습도" value={tempHum} />
      <View style={{ height: 1, backgroundColor: "#F1F3F6" }} />

      <Row label="상태" value={String(w?.condition ?? "-")} />
      <View style={{ height: 1, backgroundColor: "#F1F3F6" }} />

      <Row label="공기질" value={String(w?.airQuality ?? "-")} />
    </CardContainer>
  );
}
