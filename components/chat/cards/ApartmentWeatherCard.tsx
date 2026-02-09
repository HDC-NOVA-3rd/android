import React from "react";
import { Text, View } from "react-native";
import type { ApartmentWeatherData } from "../../../.expo/types/chat";
// 아파트 날씨 카드 컴포넌트
export default function ApartmentWeatherCard({ data }: { data: ApartmentWeatherData }) {
  const w = data.weather;
  return (
    <View style={{ marginTop: 8 }}>
      <Text style={{ fontSize: 13, color: "#111", fontWeight: "600" }}>{w.locationName} 날씨</Text>
      <Text style={{ fontSize: 12, color: "#333", marginTop: 2 }}>
        기온: {w.temperature}°C / 습도: {w.humidity}%
      </Text>
      <Text style={{ fontSize: 12, color: "#333", marginTop: 2 }}>
        상태: {w.condition} / 공기질: {w.airQuality}
      </Text>
    </View>
  );
}
