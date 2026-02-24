import { Feather } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getRoomSnapshot,
  patchDeviceState as patchDeviceStateApi,
} from "@/api/service/homeEnvironmentApi";
import useMqtt from "@/hooks/useMqtt";

export default function RoomScreen() {
  const router = useRouter();
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const roomIdNum = Number(roomId);

  const invalidRoom = !Number.isFinite(roomIdNum);

  const [roomName, setRoomName] = useState<string>("방");

  const [temp, setTemp] = useState<number | null>(null);
  const [humi, setHumi] = useState<number | null>(null);

  const [ledOn, setLedOn] = useState(false);
  const [brightness, setBrightness] = useState(80);

  const [fanOn, setFanOn] = useState(false);
  const [targetTemp, setTargetTemp] = useState(24);

  const [ledCode, setLedCode] = useState<string>("light-1");
  const [fanCode, setFanCode] = useState<string>("fan-1");

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const brokerUrl = useMemo(() => process.env.EXPO_PUBLIC_MQTT_WS_URL ?? "", []);
  const HO_ID = "1";
  const DEFAULT_LED_BRIGHTNESS = 50;

  const TOPIC_CMD = useMemo(
    () => `hdc/${HO_ID}/room/${roomIdNum}/device/execute/req`,
    [HO_ID, roomIdNum],
  );
  const TOPIC_ENV = useMemo(() => `hdc/${HO_ID}/room/${roomIdNum}/env/data`, [HO_ID, roomIdNum]);

  // ✅ clientId는 "최초 1번만" 고정 (Fast Refresh/리렌더로 바뀌면 브로커가 끊을 수 있음)
  const clientIdRef = useRef<string>("");
  if (!clientIdRef.current) {
    const baseClientId = process.env.EXPO_PUBLIC_CLIENT_ID ?? "rn";
    clientIdRef.current =
      `${baseClientId}-room-${roomIdNum}-` +
      `${Date.now().toString(36)}-${Math.random().toString(16).slice(2, 6)}`;
  }

  const { connectStatus, publish, subscribe, unsubscribe, lastMessage } = useMqtt(brokerUrl, {
    clientId: clientIdRef.current,
    username: process.env.EXPO_PUBLIC_MQTT_USERNAME,
    password: process.env.EXPO_PUBLIC_MQTT_PASSWORD,
  });

  const publishCommand = (deviceCode: string, command: string, value: any) => {
    if (invalidRoom) return;

    publish(
      TOPIC_CMD,
      JSON.stringify({
        traceId: `rn-${Date.now()}`,
        roomId: roomIdNum,
        deviceCode,
        command,
        value,
      }),
    );
  };

  // ✅ 0) 방 진입 시 스냅샷 로드 (로딩/에러 표시)
  useEffect(() => {
    if (invalidRoom) return;

    let cancelled = false;

    const fetchSnapshot = async () => {
      setLoading(true);
      setLoadError(null);

      try {
        const data = await getRoomSnapshot(roomIdNum);
        if (cancelled) return;

        setRoomName(data.roomName ?? "방");

        setTemp(typeof data.temperature === "number" ? data.temperature : null);
        setHumi(typeof data.humidity === "number" ? data.humidity : null);

        const led = data.device?.find((d: any) => d.type === "LED");
        if (led) {
          if (typeof led.deviceCode === "string") setLedCode(led.deviceCode);

          const b = typeof led.brightness === "number" ? led.brightness : 0;
          const p = typeof led.power === "boolean" ? led.power : b > 0;

          setBrightness(p ? (b > 0 ? b : DEFAULT_LED_BRIGHTNESS) : 0);
          setLedOn(p);
        }

        const fan = data.device?.find((d: any) => d.type === "FAN");
        if (fan) {
          if (typeof fan.deviceCode === "string") setFanCode(fan.deviceCode);

          setFanOn(Boolean(fan.power));
          if (typeof fan.targetTemp === "number") setTargetTemp(fan.targetTemp);
        }
      } catch (e: any) {
        console.log("스냅샷 GET 에러:", e);
        if (!cancelled) setLoadError(e?.message ?? "스냅샷 로드 실패");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchSnapshot();

    return () => {
      cancelled = true;
    };
  }, [invalidRoom, roomIdNum]);

  // ✅ 1) ENV 구독은 토픽이 바뀔 때만 (재연결 시 useMqtt가 재구독)
  useEffect(() => {
    if (invalidRoom) return;
    subscribe(TOPIC_ENV);
    return () => unsubscribe(TOPIC_ENV);
  }, [invalidRoom, subscribe, unsubscribe, TOPIC_ENV]);

  // ✅ 2) ENV 메시지 오면 화면 갱신
  useEffect(() => {
    if (!lastMessage) return;
    if (lastMessage.topic !== TOPIC_ENV) return;

    try {
      const data = JSON.parse(lastMessage.message);

      if (data?.sensorType === "TEMP" && typeof data.value === "number") setTemp(data.value);
      if (data?.sensorType === "HUMIDITY" && typeof data.value === "number") setHumi(data.value);
    } catch (e) {
      console.log("ENV JSON 파싱 실패:", e);
    }
  }, [lastMessage, TOPIC_ENV]);

  const onToggleLed = async (value: boolean) => {
    if (invalidRoom) return;

    if (!value) {
      setLedOn(false);
      setBrightness(0);

      publishCommand(ledCode, "BRIGHTNESS", 0);
      publishCommand(ledCode, "POWER", "OFF");

      try {
        await patchDeviceStateApi(roomIdNum, {
          devices: [{ deviceCode: ledCode, power: false, brightness: 0 }],
        });
      } catch (e) {
        console.log("LED PATCH 실패:", e);
      }
      return;
    }

    const nextBrightness = brightness > 0 ? brightness : DEFAULT_LED_BRIGHTNESS;
    setBrightness(nextBrightness);
    setLedOn(true);

    publishCommand(ledCode, "BRIGHTNESS", nextBrightness);
    publishCommand(ledCode, "POWER", "ON");

    try {
      await patchDeviceStateApi(roomIdNum, {
        devices: [{ deviceCode: ledCode, power: true, brightness: nextBrightness }],
      });
    } catch (e) {
      console.log("LED PATCH 실패:", e);
    }
  };

  const onToggleFan = async (value: boolean) => {
    if (invalidRoom) return;

    setFanOn(value);
    publishCommand(fanCode, "POWER", value ? "ON" : "OFF");

    try {
      await patchDeviceStateApi(roomIdNum, {
        devices: [{ deviceCode: fanCode, power: value }],
      });
    } catch (e) {
      console.log("FAN PATCH 실패:", e);
    }
  };

  const onTempCommit = async (value: number) => {
    if (invalidRoom) return;

    const rounded = Math.round(value);
    setTargetTemp(rounded);

    publishCommand(fanCode, "SET_TEMP", rounded);

    try {
      await patchDeviceStateApi(roomIdNum, {
        devices: [{ deviceCode: fanCode, targetTemp: rounded }],
      });
    } catch (e) {
      console.log("TEMP PATCH 실패:", e);
    }
  };

  const onBrightnessCommit = async (value: number) => {
    if (invalidRoom) return;

    const b = Math.round(value);

    setBrightness(b);
    const nextPower = b > 0;
    setLedOn(nextPower);

    publishCommand(ledCode, "BRIGHTNESS", b);
    publishCommand(ledCode, "POWER", nextPower ? "ON" : "OFF");

    try {
      await patchDeviceStateApi(roomIdNum, {
        devices: [{ deviceCode: ledCode, power: nextPower, brightness: b }],
      });
    } catch (e) {
      console.log("BRIGHTNESS PATCH 실패:", e);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          activeOpacity={0.7}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          style={styles.backButton}
        >
          <Feather name="chevron-left" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{roomName}</Text>
        <View style={styles.headerRightSpace} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {invalidRoom ? (
          <>
            <Text style={styles.title}>잘못된 방 접근</Text>
            <Text style={styles.status}>roomId 파라미터가 올바르지 않습니다.</Text>
          </>
        ) : (
          <>
            <Text style={styles.title}>{roomName}</Text>
            <Text style={styles.status}>MQTT 상태: {connectStatus}</Text>

            {loadError ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorTitle}>스냅샷 로딩 실패</Text>
                <Text style={styles.errorText}>{loadError}</Text>
              </View>
            ) : null}

            {loading ? (
              <Text style={{ marginTop: 8, color: "#666", fontWeight: "700" }}>불러오는 중...</Text>
            ) : null}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>실내 환경</Text>
              <Text>온도: {temp === null ? "--" : `${temp}°C`}</Text>
              <Text>습도: {humi === null ? "--" : `${humi}%`}</Text>
            </View>

            <View style={styles.section}>
              <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>전등</Text>
                <Switch value={ledOn} onValueChange={onToggleLed} />
              </View>
              <Text style={styles.tempText}>밝기: {brightness}%</Text>
              <Slider
                minimumValue={0}
                maximumValue={100}
                step={1}
                value={brightness}
                onValueChange={(v) => setBrightness(Math.round(v))}
                onSlidingComplete={onBrightnessCommit}
              />
              <Text style={styles.hint}>슬라이더에서 손 뗄 때만 MQTT 전송</Text>
            </View>

            <View style={styles.section}>
              <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>에어컨(팬)</Text>
                <Switch value={fanOn} onValueChange={onToggleFan} />
              </View>
              <Text style={styles.tempText}>희망 온도: {targetTemp}°C</Text>
              <Slider
                minimumValue={18}
                maximumValue={30}
                step={1}
                value={targetTemp}
                onValueChange={(v) => setTargetTemp(Math.round(v))}
                onSlidingComplete={onTempCommit}
              />
              <Text style={styles.hint}>슬라이더에서 손 뗄 때만 MQTT 전송</Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F7FB" },

  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  header: {
    height: 56,
    backgroundColor: "#F6F7FB",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  backButton: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 16, fontWeight: "800", color: "#111827" },
  headerRightSpace: { width: 40, height: 40 },

  container: { padding: 16, paddingBottom: 24, backgroundColor: "#F6F7FB" },

  title: { fontSize: 22, fontWeight: "800", color: "#111827" },
  status: { marginTop: 6, color: "#666" },

  section: { backgroundColor: "white", borderRadius: 16, padding: 16, marginTop: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "800", marginBottom: 10 },
  tempText: { marginTop: 14, fontWeight: "700" },
  hint: { marginTop: 6, color: "#777", fontSize: 12 },

  errorBox: { marginTop: 10, padding: 12, backgroundColor: "white", borderRadius: 12 },
  errorTitle: { fontWeight: "900", color: "#B91C1C" },
  errorText: { marginTop: 6, color: "#444" },
});
