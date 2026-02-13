import { Feather } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
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

  const [roomName, setRoomName] = useState<string>("방");

  // ✅ MQTT
  const brokerUrl = useMemo(() => "ws://192.168.14.90:9001", []);

  // ✅ 토픽
  const HO_ID = "1";
  const DEFAULT_LED_BRIGHTNESS = 50;
  const TOPIC_CMD = `hdc/${HO_ID}/assistant/execute/req`;
  const TOPIC_ENV = "hdc/device/dht11-1/env/data";

  const { connectStatus, publish, subscribe, unsubscribe, lastMessage } = useMqtt(brokerUrl);

  // ✅ 실내 환경 state
  const [temp, setTemp] = useState<number | null>(null);
  const [humi, setHumi] = useState<number | null>(null);

  // ✅ 디바이스 state
  const [ledOn, setLedOn] = useState(false);
  const [brightness, setBrightness] = useState(80);

  const [fanOn, setFanOn] = useState(false);
  const [targetTemp, setTargetTemp] = useState(24);

  const invalidRoom = !Number.isFinite(roomIdNum);

  /** ✅ MQTT 명령 publish */
  const publishCommand = (deviceCode: string, command: string, value: any) => {
    if (!Number.isFinite(roomIdNum)) return;

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

  /** ✅ 0) 방 상세 진입 시 스냅샷 */
  useEffect(() => {
    if (!Number.isFinite(roomIdNum)) return;

    const fetchSnapshot = async () => {
      try {
        const data = await getRoomSnapshot(roomIdNum);

        setRoomName(data.roomName ?? "방");

        setTemp(typeof data.temperature === "number" ? data.temperature : null);
        setHumi(typeof data.humidity === "number" ? data.humidity : null);

        const led = data.device?.find((d: any) => d.type === "LED" || d.deviceCode === "light-1");
        if (led) {
          const b = typeof led.brightness === "number" ? led.brightness : 0;

          // ✅ power가 명시되어 있으면 power를 우선
          const p = typeof led.power === "boolean" ? led.power : b > 0;

          setBrightness(p ? (b > 0 ? b : DEFAULT_LED_BRIGHTNESS) : 0);
          setLedOn(p);
        }

        const fan = data.device?.find((d: any) => d.type === "FAN" || d.deviceCode === "fan-1");
        if (fan) {
          setFanOn(Boolean(fan.power));
          if (typeof fan.targetTemp === "number") setTargetTemp(fan.targetTemp);
        }
      } catch (e) {
        console.log("스냅샷 GET 에러:", e);
      }
    };

    fetchSnapshot();
  }, [roomIdNum]);

  /** ✅ 1) MQTT 연결되면 ENV 구독 */
  useEffect(() => {
    if (connectStatus === "connected") subscribe(TOPIC_ENV);
    return () => unsubscribe(TOPIC_ENV);
  }, [connectStatus, subscribe, unsubscribe]);

  /** ✅ 2) ENV 메시지 오면 화면 갱신 */
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
  }, [lastMessage]);

  /** ✅ 전등 토글 */
  const onToggleLed = async (value: boolean) => {
    if (!Number.isFinite(roomIdNum)) return;

    if (!value) {
      // ✅ UI도 바로 0으로 맞추기
      setLedOn(false);
      setBrightness(0);

      // ✅ MQTT도 밝기 0 + OFF로 보내기 (라즈베리파이가 brightness 기반이면 안전)
      publishCommand("light-1", "BRIGHTNESS", 0);
      publishCommand("light-1", "POWER", "OFF");

      // ✅ DB에도 power=false, brightness=0 둘 다 저장
      await patchDeviceStateApi(roomIdNum, {
        devices: [{ deviceCode: "light-1", power: false, brightness: 0 }],
      });
      return;
    }

    const nextBrightness = brightness > 0 ? brightness : DEFAULT_LED_BRIGHTNESS;
    setBrightness(nextBrightness);
    setLedOn(true);

    publishCommand("light-1", "BRIGHTNESS", nextBrightness);
    publishCommand("light-1", "POWER", "ON");

    await patchDeviceStateApi(roomIdNum, {
      devices: [{ deviceCode: "light-1", power: true, brightness: nextBrightness }],
    });
  };

  /** ✅ 팬 토글 */
  const onToggleFan = async (value: boolean) => {
    if (!Number.isFinite(roomIdNum)) return;

    setFanOn(value);
    publishCommand("fan-1", "POWER", value ? "ON" : "OFF");

    await patchDeviceStateApi(roomIdNum, {
      devices: [{ deviceCode: "fan-1", power: value }],
    });
  };

  /** ✅ 목표 온도 */
  const onTempCommit = async (value: number) => {
    if (!Number.isFinite(roomIdNum)) return;

    const rounded = Math.round(value);
    setTargetTemp(rounded);

    publishCommand("fan-1", "SET_TEMP", rounded);

    await patchDeviceStateApi(roomIdNum, {
      devices: [{ deviceCode: "fan-1", targetTemp: rounded }],
    });
  };
  /** ✅ 밝기 조절(슬라이더에서 손 뗄 때) */
  const onBrightnessCommit = async (value: number) => {
    if (!Number.isFinite(roomIdNum)) return;

    const b = Math.round(value);

    // ✅ UI 반영
    setBrightness(b);
    const nextPower = b > 0;
    setLedOn(nextPower);

    // ✅ MQTT 반영 (0이면 OFF)
    publishCommand("light-1", "BRIGHTNESS", b);
    publishCommand("light-1", "POWER", nextPower ? "ON" : "OFF");

    // ✅ DB 반영
    await patchDeviceStateApi(roomIdNum, {
      devices: [{ deviceCode: "light-1", power: nextPower, brightness: b }],
    });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      {/* ✅ 기본 헤더 숨김 (tabs 글자/검정 애니메이션 원천 차단) */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* ✅ 커스텀 헤더 */}
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

        {/* 오른쪽 공간 맞추기용 더미 */}
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

            {/* 실내 환경 */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>실내 환경</Text>
              <Text>온도: {temp === null ? "--" : `${temp}°C`}</Text>
              <Text>습도: {humi === null ? "--" : `${humi}%`}</Text>
            </View>

            {/* 전등 */}
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

            {/* 팬 */}
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
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  header: {
    height: 56,
    backgroundColor: "#F6F7FB",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "800",
    color: "#111827",
  },
  headerRightSpace: { width: 40, height: 40 },

  container: { padding: 16, paddingBottom: 24, backgroundColor: "#F6F7FB" },

  title: { fontSize: 22, fontWeight: "800", color: "#111827" },
  status: { marginTop: 6, color: "#666" },

  section: { backgroundColor: "white", borderRadius: 16, padding: 16, marginTop: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "800", marginBottom: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  tempText: { marginTop: 14, fontWeight: "700" },
  hint: { marginTop: 6, color: "#777", fontSize: 12 },
});
