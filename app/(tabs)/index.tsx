import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/context/AuthContext";

import { getMyApartmentWeather } from "@/api/service/apartmentWeatherApi";
import { getHomeRoomsMy, HomeRoomCard } from "@/api/service/homeEnvironmentApi";
import { getMyApartmentInfo } from "@/api/service/memberService";

// ✅ 모드 가져오기
import { getMyModes } from "@/api/service/modeService";
import type { ModeListItem } from "../../app/types/mode";

type WeatherCard = {
  temp: number | null;
  humidity: number | null;
  airText: string;
  locationText: string;
  conditionText: string; // 맑음/비/눈...
};

type MyApartment = {
  apartmentName?: string;
  dongNo?: string | number;
  hoNo?: string | number;
  hoId?: number;
  apartmentId?: number;
};

export default function HomeTab() {
  const router = useRouter();
  const { accessToken, isLoading } = useAuth();

  const [apt, setApt] = useState<MyApartment | null>(null);
  const [rooms, setRooms] = useState<HomeRoomCard[]>([]);
  const [modes, setModes] = useState<ModeListItem[]>([]);

  const [weather, setWeather] = useState<WeatherCard>({
    temp: null,
    humidity: null,
    airText: "--",
    locationText: "",
    conditionText: "--",
  });

  useFocusEffect(
    useCallback(() => {
      if (isLoading) return;
      if (!accessToken) return;

      const load = async () => {
        try {
          const aptData = await getMyApartmentInfo();
          setApt(aptData);

          const cards = await getHomeRoomsMy();
          setRooms(cards);

          const w = await getMyApartmentWeather();
          setWeather({
            temp: w?.temperature ?? null,
            humidity: w?.humidity ?? null,
            airText: w?.airQuality ?? "--",
            locationText: w?.locationName ?? "",
            conditionText: w?.condition ?? "--",
          });

          // ✅ 모드 목록 불러오기
          const ms = await getMyModes();
          setModes(ms ?? []);
        } catch (e) {
          console.log("홈 로딩 실패:", e);
        }
      };

      load();
    }, [accessToken, isLoading]),
  );

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{apt?.apartmentName ?? "내 집"}</Text>
          <Text style={styles.headerSub}>
            {apt?.dongNo ?? "--"} {apt?.hoNo ?? "--"}
          </Text>
        </View>

        <Pressable style={styles.settingBtn} onPress={() => console.log("설정")}>
          <Text style={{ fontSize: 30 }}>⚙️</Text>
        </Pressable>
      </View>

      {/* 외부 날씨 카드 */}
      <View style={styles.weatherBox}>
        <View style={styles.weatherTopRow}>
          <Text style={styles.sectionTitle}>현재 날씨</Text>
          <Text style={styles.weatherLocation}>{weather.locationText}</Text>
        </View>

        <View style={styles.weatherCardsRow}>
          <View style={[styles.weatherCard, styles.weatherCardHot]}>
            <Text style={styles.weatherMainValue}>
              {weather.temp === null ? "--" : `${Math.round(weather.temp)}°`}
            </Text>
            <Text style={styles.weatherLabel}>온도</Text>
          </View>

          <View style={[styles.weatherCard, styles.weatherCardBlue]}>
            <Text style={styles.weatherMainValue}>
              {weather.humidity === null ? "--" : `${Math.round(weather.humidity)}%`}
            </Text>
            <Text style={styles.weatherLabel}>습도</Text>
          </View>

          <View style={[styles.weatherCard, styles.weatherCardGreen]}>
            <Text style={styles.weatherMainValue}>{weather.airText}</Text>
            <Text style={styles.weatherLabel}>공기질</Text>
          </View>

          <View
            style={[styles.weatherCard, { backgroundColor: weatherColor(weather.conditionText) }]}
          >
            <Text style={styles.weatherMainValue}>{weather.conditionText}</Text>
            <Text style={styles.weatherLabel}>날씨</Text>
          </View>
        </View>
      </View>

      {/* 방 섹션 */}
      <Text style={[styles.sectionTitle, { marginTop: 18 }]}>방</Text>

      {rooms.map((card) => (
        <Pressable
          key={card.roomId}
          style={styles.roomCard}
          onPress={() =>
            router.push({
              pathname: "/room/[roomId]" as any,
              params: { roomId: String(card.roomId) },
            })
          }
        >
          <View style={styles.roomCardTop}>
            <Text style={styles.roomName}>{card.roomName}</Text>
            <Text style={styles.chevron}>›</Text>
          </View>

          <View style={styles.roomEnvRow}>
            <Text style={styles.roomEnvText}>🌡 {card.temperature ?? "--"}°C</Text>
            <Text style={styles.roomEnvText}>💧 {card.humidity ?? "--"}%</Text>
          </View>

          <Text style={styles.roomDesc}>{card.deviceSummary}</Text>
        </Pressable>
      ))}

      {/* 모드 섹션 */}
      <Text style={[styles.sectionTitle, { marginTop: 18 }]}>모드</Text>

      {modes.map((m) => (
        <Pressable
          key={m.modeId}
          style={styles.modeCard}
          onPress={() =>
            router.push({
              pathname: "/mode/[modeId]" as any,
              params: { modeId: String(m.modeId) },
            })
          }
        >
          <View style={styles.modeHeaderRow}>
            <Text style={styles.modeTitle} numberOfLines={1}>
              {m.modeName}
            </Text>

            <View style={styles.badgeRow}>
              {m.isDefault ? (
                <View style={styles.badgeDefault}>
                  <Text style={styles.badgeDefaultText}>기본</Text>
                </View>
              ) : (
                <View style={styles.badgeCustom}>
                  <Text style={styles.badgeCustomText}>커스텀</Text>
                </View>
              )}

              {!m.isEditable && (
                <View style={styles.badgeLock}>
                  <Text style={styles.badgeLockText}>편집불가</Text>
                </View>
              )}
            </View>
          </View>

          <Text style={styles.chevron}>›</Text>
        </Pressable>
      ))}

      <Pressable
        style={styles.addModeBox}
        onPress={() => router.push({ pathname: "/mode/create" as any })}
      >
        <Text style={styles.addModePlus}>＋</Text>
        <Text style={styles.addModeText}>커스텀 모드 추가</Text>
      </Pressable>
    </ScrollView>
  );
}

const weatherColor = (condition?: string) => {
  switch (condition) {
    case "맑음":
      return "#F59E0B";
    case "구름":
      return "#60A5FA";
    case "비":
      return "#64748B";
    case "눈":
      return "#38BDF8";
    case "번개":
      return "#7C3AED";
    case "안개":
      return "#94A3B8";
    default:
      return "#64748B";
  }
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F6F7FB" },
  container: {
    padding: 12,
    paddingBottom: 120,
    marginTop: 40,
    backgroundColor: "#F6F7FB",
  },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  headerTitle: { fontSize: 20, fontWeight: "800" },
  headerSub: { marginTop: 2, color: "#333", fontWeight: "700" },
  settingBtn: { padding: 8 },

  sectionTitle: { fontSize: 16, fontWeight: "800" },

  weatherBox: { marginTop: 8, backgroundColor: "white", borderRadius: 16, padding: 12 },
  weatherTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  weatherLocation: { color: "#666", fontWeight: "600" },

  weatherCardsRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  weatherCard: {
    flex: 1,
    borderRadius: 14,
    padding: 12,
    minHeight: 72,
    justifyContent: "space-between",
  },
  weatherCardHot: { backgroundColor: "#FF8A00" },
  weatherCardBlue: { backgroundColor: "#3B82F6" },
  weatherCardGreen: { backgroundColor: "#22C55E" },
  weatherCardGray: { backgroundColor: "#64748B" },
  weatherMainValue: { color: "white", fontSize: 20, fontWeight: "900" },
  weatherLabel: { color: "white", fontWeight: "700" },

  roomCard: { marginTop: 8, backgroundColor: "white", borderRadius: 16, padding: 14 },
  roomCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  roomName: { fontSize: 17, fontWeight: "900" },
  chevron: { fontSize: 22, color: "#999" },
  roomEnvRow: { flexDirection: "row", gap: 12, marginTop: 6 },
  roomEnvText: { fontWeight: "800" },
  roomDesc: { marginTop: 4, color: "#666", fontWeight: "700" },

  modeCard: {
    marginTop: 8,
    backgroundColor: "white",
    borderRadius: 18,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  modeHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  // 기존 modeTitle에서 flex:1 제거하고 아래로 교체 추천
  modeTitle: {
    fontWeight: "900",
    fontSize: 16,
    flexShrink: 1,
  },

  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  modeSub: { color: "#666", fontWeight: "700" },

  addModeBox: {
    marginTop: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    justifyContent: "center",
    backgroundColor: "white",
  },
  addModePlus: { fontSize: 18, fontWeight: "900", color: "#666" },
  addModeText: { fontWeight: "900", color: "#666" },

  badgeDefault: {
    backgroundColor: "#E2E8F0",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeDefaultText: {
    fontWeight: "900",
    fontSize: 12,
    color: "#334155",
  },
  badgeCustom: {
    backgroundColor: "#2563EB",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeCustomText: {
    fontWeight: "900",
    fontSize: 12,
    color: "white",
  },
  badgeLock: {
    backgroundColor: "#F1F5F9",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  badgeLockText: {
    fontWeight: "900",
    fontSize: 11,
    color: "#64748B",
  },
});
