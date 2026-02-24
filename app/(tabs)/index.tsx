import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/context/AuthContext";
import useMqtt from "@/hooks/useMqtt";

import { getMyApartmentWeather } from "@/api/service/apartmentWeatherApi";
import {
  getMyRooms,
  getRoomSnapshot,
  type DeviceSnapshot,
  type HomeRoomCard,
} from "@/api/service/homeEnvironmentApi";
import { getMyApartmentInfo } from "@/api/service/memberService";
import { getMyModes } from "@/api/service/modeService";
import type { ModeListItem } from "../../app/types/mode";

type WeatherCard = {
  temp: number | null;
  humidity: number | null;
  airText: string;
  locationText: string;
  conditionText: string;
};

type MyApartment = {
  apartmentName?: string;
  dongNo?: string | number;
  hoNo?: string | number;
  hoId?: number;
  apartmentId?: number;
};

const makeDeviceSummary = (devices: DeviceSnapshot[]) => {
  const led = devices.find((d) => d.type === "LED" || d.deviceCode?.startsWith?.("light"));
  const fan = devices.find((d) => d.type === "FAN" || d.deviceCode?.startsWith?.("fan"));

  const ledText = led?.power ? "전등 켜짐" : "전등 꺼짐";
  const fanText = fan?.power ? "에어컨 켜짐" : "에어컨 꺼짐";

  return `${ledText} · ${fanText}`;
};

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
      return "#EAB308";
  }
};

export default function HomeTab() {
  const router = useRouter();
  const { accessToken, isLoading: authLoading } = useAuth();

  const [apt, setApt] = useState<MyApartment | null>(null);
  const [rooms, setRooms] = useState<HomeRoomCard[]>([]);
  const [modes, setModes] = useState<ModeListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<WeatherCard>({
    temp: null,
    humidity: null,
    airText: "--",
    locationText: "",
    conditionText: "--",
  });

  const brokerUrl = useMemo(() => process.env.EXPO_PUBLIC_MQTT_WS_URL ?? "", []);
  const HO_ID = "1";
  const TOPIC_ENV_ALL = useMemo(() => `hdc/${HO_ID}/room/+/env/data`, [HO_ID]);

  const mqttClientId = useMemo(() => `home-${Math.random().toString(16).slice(2, 8)}`, []);

  const { connectStatus, subscribe, unsubscribe, lastMessage } = useMqtt(brokerUrl, {
    clientId: mqttClientId,
    username: process.env.EXPO_PUBLIC_MQTT_USERNAME,
    password: process.env.EXPO_PUBLIC_MQTT_PASSWORD,
  });

  // ✅ 핵심: useFocusEffect를 사용하여 화면에 들어올 때마다 서버 데이터를 새로고침
  useFocusEffect(
    useCallback(() => {
      if (authLoading || !accessToken) return;

      let isMounted = true;
      const loadData = async () => {
        // 데이터가 없을 때만 로딩바 표시 (자연스러운 업데이트를 위함)
        if (rooms.length === 0 && modes.length === 0) setLoading(true);

        try {
          const [aptData, roomItems, w, ms] = await Promise.all([
            getMyApartmentInfo(),
            getMyRooms(),
            getMyApartmentWeather(),
            getMyModes(),
          ]);

          if (!isMounted) return;

          // 아파트 정보 & 날씨 업데이트
          setApt(aptData);
          setWeather({
            temp: w?.temperature ?? null,
            humidity: w?.humidity ?? null,
            airText: w?.airQuality ?? "--",
            locationText: w?.locationName ?? "서울",
            conditionText: w?.condition ?? "--",
          });

          // ✅ 1. 모드 업데이트 (생성된 최신 목록 반영 및 isVisible 필터링)
          setModes((ms ?? []).filter((m) => m.isVisible === true));

          // ✅ 2. 방 목록 업데이트 (설정에서 숨긴 방 즉시 반영)
          const visibleRooms = (roomItems ?? []).filter((r) => r.isVisible);
          if (visibleRooms.length > 0) {
            const snapResults = await Promise.allSettled(
              visibleRooms.map((r) => getRoomSnapshot(r.roomId)),
            );

            const cards: HomeRoomCard[] = visibleRooms.map((r, idx) => {
              const res = snapResults[idx];
              const s = res.status === "fulfilled" ? res.value : null;
              return {
                roomId: r.roomId,
                roomName: r.roomName,
                temperature: s?.temperature ?? null,
                humidity: s?.humidity ?? null,
                deviceSummary: s?.device ? makeDeviceSummary(s.device) : "기기 정보 없음",
              };
            });
            setRooms(cards);
          } else {
            setRooms([]);
          }
        } catch (e) {
          console.error("Home Data Fetch Error:", e);
        } finally {
          if (isMounted) setLoading(false);
        }
      };

      loadData();
      return () => {
        isMounted = false;
      };
    }, [accessToken, authLoading]),
  );

  // MQTT 구독 관리
  useEffect(() => {
    if (connectStatus === "connected") subscribe(TOPIC_ENV_ALL);
    return () => unsubscribe(TOPIC_ENV_ALL);
  }, [connectStatus, subscribe, unsubscribe, TOPIC_ENV_ALL]);

  // MQTT 실시간 센서 데이터 반영
  useEffect(() => {
    if (!lastMessage || !lastMessage.topic.endsWith("/env/data")) return;
    try {
      const data = JSON.parse(lastMessage.message);
      const rid = Number(data.roomId);
      if (!Number.isFinite(rid)) return;

      setRooms((prev) =>
        prev.map((r) =>
          r.roomId === rid
            ? {
                ...r,
                temperature:
                  data?.sensorType === "TEMP" && typeof data.value === "number"
                    ? data.value
                    : r.temperature,
                humidity:
                  data?.sensorType === "HUMIDITY" && typeof data.value === "number"
                    ? data.value
                    : r.humidity,
              }
            : r,
        ),
      );
    } catch {}
  }, [lastMessage]);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>{apt?.apartmentName ?? "내 집"}</Text>
          <Text style={styles.headerSub}>
            {apt?.dongNo ?? "--"}동 {apt?.hoNo ?? "--"}호
          </Text>
        </View>
        <Pressable style={styles.settingBtn} onPress={() => router.push("/homesettings")}>
          <Text style={{ fontSize: 24 }}>⚙️</Text>
        </Pressable>
      </View>

      {/* 날씨 섹션 */}
      <View style={styles.weatherBox}>
        <View style={styles.weatherTopRow}>
          <Text style={styles.sectionTitle}>현재 날씨</Text>
          <Text style={styles.weatherLocation}>{weather.locationText}</Text>
        </View>

        <View style={styles.weatherCardsRow}>
          <View style={[styles.weatherCard, styles.cardOrange]}>
            <Text style={styles.weatherValue}>
              {weather.temp === null ? "--" : `${Math.round(weather.temp)}°`}
            </Text>
            <Text style={styles.weatherLabel}>온도</Text>
          </View>
          <View style={[styles.weatherCard, styles.cardBlue]}>
            <Text style={styles.weatherValue}>
              {weather.humidity === null ? "--" : `${Math.round(weather.humidity)}%`}
            </Text>
            <Text style={styles.weatherLabel}>습도</Text>
          </View>
          <View style={[styles.weatherCard, styles.cardGreen]}>
            <Text style={styles.weatherValue}>{weather.airText}</Text>
            <Text style={styles.weatherLabel}>공기질</Text>
          </View>
          <View
            style={[styles.weatherCard, { backgroundColor: weatherColor(weather.conditionText) }]}
          >
            <Text style={styles.weatherValue}>{weather.conditionText}</Text>
            <Text style={styles.weatherLabel}>날씨</Text>
          </View>
        </View>
      </View>

      {/* 방 섹션 */}
      <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 8 }]}>방</Text>
      {loading && rooms.length === 0 && <ActivityIndicator color="#3B82F6" />}
      {rooms.length === 0 && !loading && (
        <Text style={styles.emptyText}>보이는 방이 없습니다.</Text>
      )}
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
      <Text style={[styles.sectionTitle, { marginTop: 24, marginBottom: 8 }]}>모드</Text>
      {modes.map((m) => (
        <Pressable
          key={m.modeId}
          style={styles.modeCard}
          onPress={() =>
            router.push({ pathname: "/mode/[modeId]" as any, params: { modeId: String(m.modeId) } })
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

      {/* 커스텀 모드 추가 버튼 */}
      <Pressable style={styles.addModeBox} onPress={() => router.push("/mode/create")}>
        <Text style={styles.addModePlus}>＋</Text>
        <Text style={styles.addModeText}>커스텀 모드 추가</Text>
      </Pressable>

      <View style={styles.mqttBadge}>
        <Text style={styles.mqttText}>MQTT 연결 상태: {connectStatus}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F6F7FB" },
  container: { padding: 16, paddingBottom: 120, marginTop: 40 },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerTitle: { fontSize: 24, fontWeight: "900", color: "#111827" },
  headerSub: { marginTop: 2, color: "#6B7280", fontWeight: "700" },
  settingBtn: { padding: 4 },

  sectionTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },

  weatherBox: { backgroundColor: "white", borderRadius: 20, padding: 16, elevation: 1 },
  weatherTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  weatherLocation: { color: "#6B7280", fontWeight: "700" },

  weatherCardsRow: { flexDirection: "row", gap: 8 },
  weatherCard: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  cardOrange: { backgroundColor: "#FF8A00" },
  cardBlue: { backgroundColor: "#3B82F6" },
  cardGreen: { backgroundColor: "#22C55E" },
  weatherValue: { color: "white", fontSize: 16, fontWeight: "900", marginBottom: 4 },
  weatherLabel: { color: "white", fontSize: 11, fontWeight: "800", opacity: 0.9 },

  roomCard: {
    marginTop: 10,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 16,
    elevation: 1,
  },
  roomCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  roomName: { fontSize: 18, fontWeight: "900", color: "#111827" },
  chevron: { fontSize: 24, color: "#D1D5DB" },
  roomEnvRow: { flexDirection: "row", gap: 12, marginTop: 6 },
  roomEnvText: { fontWeight: "800", color: "#4B5563" },
  roomDesc: { marginTop: 8, color: "#9CA3AF", fontWeight: "700" },

  modeCard: {
    marginTop: 10,
    backgroundColor: "white",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    elevation: 1,
  },
  modeHeaderRow: { flexDirection: "row", alignItems: "center", gap: 10, flex: 1 },
  modeTitle: { fontWeight: "900", fontSize: 17, color: "#111827", flexShrink: 1 },
  badgeRow: { flexDirection: "row", alignItems: "center", gap: 6 },

  badgeDefault: {
    backgroundColor: "#E2E8F0",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeDefaultText: { fontWeight: "900", fontSize: 12, color: "#475569" },
  badgeCustom: {
    backgroundColor: "#3B82F6",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeCustomText: { fontWeight: "900", fontSize: 12, color: "white" },
  badgeLock: {
    backgroundColor: "#F9FAFB",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  badgeLockText: { fontWeight: "900", fontSize: 11, color: "#9CA3AF" },

  addModeBox: {
    marginTop: 12,
    borderRadius: 18,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "rgba(255,255,255,0.5)",
  },
  addModePlus: { fontSize: 20, fontWeight: "900", color: "#9CA3AF" },
  addModeText: { fontSize: 16, fontWeight: "900", color: "#9CA3AF" },

  emptyText: { textAlign: "center", color: "#9CA3AF", marginTop: 10, fontWeight: "700" },
  mqttBadge: { marginTop: 30, alignItems: "center" },
  mqttText: { fontSize: 12, color: "#9CA3AF", fontWeight: "600" },
});
