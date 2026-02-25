import { Feather } from "@expo/vector-icons";
import Slider from "@react-native-community/slider";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getRoomSnapshot,
  patchDeviceState as patchDeviceStateApi,
} from "@/api/service/homeEnvironmentApi";
import useMqtt from "@/hooks/useMqtt";

type HvacMode = "STOP" | "HEAT" | "COOL" | "HOLD";

export default function RoomScreen() {
  const router = useRouter();
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const roomIdNum = Number(roomId);
  const invalidRoom = !Number.isFinite(roomIdNum);

  const DEFAULT_LED_BRIGHTNESS = 50;

  const [roomName, setRoomName] = useState<string>("방");
  const [temp, setTemp] = useState<number | null>(null);
  const [humi, setHumi] = useState<number | null>(null);

  // 전등
  const [ledOn, setLedOn] = useState(false);
  const [brightness, setBrightness] = useState(0);
  const [ledCode, setLedCode] = useState<string | null>(null);

  // 팬/에어컨
  const [fanOn, setFanOn] = useState(false);
  const [targetTemp, setTargetTemp] = useState(24);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [fanCode, setFanCode] = useState<string | null>(null);

  // 표시등(실제 디바이스 코드가 고정이면 유지)
  const redLedCode = "red-led-1";
  const blueLedCode = "blue-led-1";

  const [loading, setLoading] = useState(false);

  const brokerUrl = useMemo(() => process.env.EXPO_PUBLIC_MQTT_WS_URL ?? "", []);
  const HO_ID = "1";

  const TOPIC_CMD = useMemo(
    () => `hdc/${HO_ID}/room/${roomIdNum}/device/execute/req`,
    [HO_ID, roomIdNum],
  );
  const TOPIC_ENV = useMemo(() => `hdc/${HO_ID}/room/${roomIdNum}/env/data`, [HO_ID, roomIdNum]);

  const clientIdRef = useRef<string>(`rn-room-${roomIdNum}-${Date.now().toString(36)}`);

  const { connectStatus, publish, subscribe, unsubscribe, lastMessage } = useMqtt(brokerUrl, {
    clientId: clientIdRef.current,
    username: process.env.EXPO_PUBLIC_MQTT_USERNAME,
    password: process.env.EXPO_PUBLIC_MQTT_PASSWORD,
  });

  const publishCommand = useCallback(
    (deviceCode: string | null, command: string, value: any) => {
      if (invalidRoom) return;
      if (!deviceCode) return;

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
    },
    [invalidRoom, publish, roomIdNum, TOPIC_CMD],
  );

  // ====== ✅ 자동모드 난방/냉방 계산: state가 아니라 "계산값" ======
  const hvacMode: HvacMode = useMemo(() => {
    if (!isAutoMode) return "STOP";
    if (temp === null) return "HOLD";

    const HYSTERESIS = 1;
    const STOP_RANGE = 0.5;

    const diff = temp - targetTemp;

    if (Math.abs(diff) <= STOP_RANGE) return "STOP";
    if (temp < targetTemp - HYSTERESIS) return "HEAT";
    if (temp > targetTemp + HYSTERESIS) return "COOL";
    return "HOLD";
  }, [isAutoMode, temp, targetTemp]);

  const redOn = isAutoMode && fanOn && hvacMode === "HEAT";
  const blueOn = isAutoMode && fanOn && hvacMode === "COOL";

  // 자동제어 중복 호출 방지용
  const autoActingRef = useRef(false);

  const onToggleFan = useCallback(
    async (value: boolean) => {
      if (!fanCode) return;

      setFanOn(value);
      publishCommand(fanCode, "POWER", value ? "ON" : "OFF");

      try {
        await patchDeviceStateApi(roomIdNum, { devices: [{ deviceCode: fanCode, power: value }] });
      } catch (e) {
        console.log(e);
      }
    },
    [fanCode, publishCommand, roomIdNum],
  );

  const onToggleAutoMode = useCallback(
    async (value: boolean) => {
      if (!fanCode) return;

      setIsAutoMode(value);

      try {
        await patchDeviceStateApi(roomIdNum, {
          devices: [{ deviceCode: fanCode, autoMode: value }],
        });
      } catch (e) {
        console.log(e);
      }
    },
    [roomIdNum, fanCode],
  );

  const onTargetTempCommit = useCallback(
    async (v: number) => {
      if (!fanCode) return;

      const t = Math.round(v);
      setTargetTemp(t);

      try {
        await patchDeviceStateApi(roomIdNum, { devices: [{ deviceCode: fanCode, targetTemp: t }] });
      } catch (e) {
        console.log(e);
      }
    },
    [roomIdNum, fanCode],
  );

  // ====== ✅ 전등: 토글/밝기 완전 동기화 ======
  const commitLedState = useCallback(
    async (nextPower: boolean, nextBrightness: number) => {
      if (!ledCode) return;

      // UI 동기화
      setLedOn(nextPower);
      setBrightness(nextBrightness);

      // MQTT (밝기 먼저 보내면 장치쪽에서 on/off 판단하기 쉬움)
      publishCommand(ledCode, "BRIGHTNESS", nextBrightness);
      publishCommand(ledCode, "POWER", nextPower ? "ON" : "OFF");

      // DB
      try {
        await patchDeviceStateApi(roomIdNum, {
          devices: [{ deviceCode: ledCode, power: nextPower, brightness: nextBrightness }],
        });
      } catch (e) {
        console.log(e);
      }
    },
    [ledCode, publishCommand, roomIdNum],
  );

  const onToggleLed = useCallback(
    async (value: boolean) => {
      if (!ledCode) return;

      if (!value) {
        await commitLedState(false, 0);
        return;
      }

      const nextB = brightness > 0 ? brightness : DEFAULT_LED_BRIGHTNESS;
      await commitLedState(true, nextB);
    },
    [ledCode, commitLedState, brightness],
  );

  const onBrightnessCommit = useCallback(
    async (value: number) => {
      if (!ledCode) return;

      const b = Math.round(value);
      const nextPower = b > 0;

      await commitLedState(nextPower, b);
    },
    [ledCode, commitLedState],
  );

  // 슬라이더 움직일 때도 토글이 따라오게(체감 개선)
  const onBrightnessChange = useCallback((v: number) => {
    const b = Math.round(v);
    setBrightness(b);
    setLedOn(b > 0);
  }, []);

  // ====== ✅ 자동모드 실행(팬 ON/OFF + 표시등 publish 동기화) ======
  useEffect(() => {
    if (!isAutoMode) {
      // 자동모드 꺼지면 표시등은 끔(장치 동기화)
      publishCommand(redLedCode, "POWER", "OFF");
      publishCommand(blueLedCode, "POWER", "OFF");
      return;
    }
    if (temp === null) return;
    if (!fanCode) return;

    // STOP이면 팬 끄기(원래 네 로직 유지)
    if (hvacMode === "STOP") {
      if (fanOn && !autoActingRef.current) {
        autoActingRef.current = true;
        onToggleFan(false).finally(() => {
          autoActingRef.current = false;
        });
      }
      publishCommand(redLedCode, "POWER", "OFF");
      publishCommand(blueLedCode, "POWER", "OFF");
      return;
    }

    // HEAT/COOL이면 팬 켜기
    if ((hvacMode === "HEAT" || hvacMode === "COOL") && !fanOn && !autoActingRef.current) {
      autoActingRef.current = true;
      onToggleFan(true).finally(() => {
        autoActingRef.current = false;
      });
    }

    // 표시등 동기화 (UI는 계산값(redOn/blueOn)으로 이미 맞음)
    publishCommand(redLedCode, "POWER", hvacMode === "HEAT" && fanOn ? "ON" : "OFF");
    publishCommand(blueLedCode, "POWER", hvacMode === "COOL" && fanOn ? "ON" : "OFF");
  }, [
    isAutoMode,
    temp,
    hvacMode,
    fanOn,
    fanCode,
    onToggleFan,
    publishCommand,
    redLedCode,
    blueLedCode,
  ]);

  // ====== 스냅샷 로딩 ======
  useEffect(() => {
    if (invalidRoom) return;

    let cancelled = false;
    setLoading(true);

    getRoomSnapshot(roomIdNum)
      .then((data) => {
        if (cancelled) return;

        setRoomName(data.roomName ?? "방");
        setTemp(data.temperature ?? null);
        setHumi(data.humidity ?? null);

        const led = data.device?.find((d: any) => d.type === "LED");
        if (led) {
          const code = typeof led.deviceCode === "string" ? led.deviceCode : null;
          setLedCode(code);

          const b = typeof led.brightness === "number" ? led.brightness : 0;
          const p = typeof led.power === "boolean" ? led.power : b > 0;

          setBrightness(p ? b : 0);
          setLedOn(p && b > 0);
        } else {
          setLedCode(null);
        }

        const fan = data.device?.find((d: any) => d.type === "FAN" || d.type === "AIRCON");
        if (fan) {
          const code = typeof fan.deviceCode === "string" ? fan.deviceCode : null;
          setFanCode(code);

          setFanOn(Boolean(fan.power));
          if (typeof fan.targetTemp === "number") setTargetTemp(fan.targetTemp);
          if (fan.autoMode != null) setIsAutoMode(Boolean(fan.autoMode));
        } else {
          setFanCode(null);
        }
      })
      .catch(console.error)
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [roomIdNum, invalidRoom]);

  // ENV 구독
  useEffect(() => {
    if (invalidRoom) return;
    subscribe(TOPIC_ENV);
    return () => unsubscribe(TOPIC_ENV);
  }, [invalidRoom, subscribe, unsubscribe, TOPIC_ENV]);

  // ENV 수신
  useEffect(() => {
    if (!lastMessage || lastMessage.topic !== TOPIC_ENV) return;
    try {
      const data = JSON.parse(lastMessage.message);
      if (data?.sensorType === "TEMP") setTemp(data.value);
      if (data?.sensorType === "HUMIDITY") setHumi(data.value);
    } catch (e) {
      console.log(e);
    }
  }, [lastMessage, TOPIC_ENV]);

  const canControlLed = !!ledCode && !loading;
  const canControlFan = !!fanCode && !loading;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="chevron-left" size={26} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{roomName}</Text>
        <View style={styles.headerRightSpace} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{roomName}</Text>
        <Text style={styles.status}>MQTT: {connectStatus}</Text>
        {loading ? (
          <Text style={{ marginTop: 8, color: "#666", fontWeight: "700" }}>불러오는 중...</Text>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>실내 환경</Text>
          <View style={styles.envRow}>
            <Text style={styles.envText}>🌡 온도: {temp ?? "--"}°C</Text>
            <Text style={styles.envText}>💧 습도: {humi ?? "--"}%</Text>
          </View>
        </View>

        {/* 난방/냉방 표시(계산값) */}
        <View style={styles.ledStatusContainer}>
          <View style={[styles.ledIndicator, redOn && styles.ledRedActive]}>
            <Text style={[styles.ledLabel, redOn && styles.textWhite]}>난방</Text>
          </View>
          <View style={[styles.ledIndicator, blueOn && styles.ledBlueActive]}>
            <Text style={[styles.ledLabel, blueOn && styles.textWhite]}>냉방</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.headerRow}>
            <Text style={styles.sectionTitle}>전등</Text>
            <Switch value={ledOn} onValueChange={onToggleLed} disabled={!canControlLed} />
          </View>
          <Text style={styles.tempText}>밝기: {brightness}%</Text>
          <Slider
            minimumValue={0}
            maximumValue={100}
            step={1}
            value={brightness}
            onValueChange={onBrightnessChange}
            onSlidingComplete={onBrightnessCommit}
            disabled={!canControlLed}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.headerRow}>
            <Text style={styles.sectionTitle}>에어컨(팬)</Text>
            <Switch
              value={fanOn}
              onValueChange={onToggleFan}
              disabled={!canControlFan || isAutoMode}
            />
          </View>

          <View style={[styles.headerRow, { marginTop: 10 }]}>
            <Text style={styles.autoLabel}>자동 온도 조절 모드</Text>
            <Switch
              value={isAutoMode}
              onValueChange={onToggleAutoMode}
              trackColor={{ false: "#767577", true: "#10B981" }}
              disabled={!canControlFan}
            />
          </View>

          <Text style={styles.tempText}>희망 온도: {targetTemp}°C</Text>
          <Slider
            minimumValue={16}
            maximumValue={30}
            step={1}
            value={targetTemp}
            onValueChange={(v) => setTargetTemp(Math.round(v))}
            onSlidingComplete={onTargetTempCommit}
            disabled={!canControlFan}
          />

          <Text style={styles.hint}>
            {isAutoMode
              ? `자동 모드: ${hvacMode === "HEAT" ? "난방" : hvacMode === "COOL" ? "냉방" : "대기/정지"}`
              : "수동 제어 모드"}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F7FB" },
  header: { height: 56, flexDirection: "row", alignItems: "center", paddingHorizontal: 12 },
  backButton: { width: 40, height: 40, justifyContent: "center", alignItems: "center" },
  headerTitle: { flex: 1, textAlign: "center", fontSize: 16, fontWeight: "800", color: "#111827" },
  headerRightSpace: { width: 40, height: 40 },
  container: { padding: 16, paddingBottom: 24 },
  title: { fontSize: 22, fontWeight: "800", color: "#111827" },
  status: { marginTop: 6, color: "#666" },
  section: { backgroundColor: "white", borderRadius: 16, padding: 16, marginTop: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "800" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  envRow: { flexDirection: "row", gap: 20, marginTop: 10 },
  envText: { fontSize: 16, fontWeight: "700", color: "#374151" },
  tempText: { marginTop: 14, fontWeight: "700" },
  autoLabel: { fontSize: 14, fontWeight: "700", color: "#059669" },
  hint: { marginTop: 6, color: "#777", fontSize: 12 },
  ledStatusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    gap: 10,
  },
  ledIndicator: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  ledBlueActive: { backgroundColor: "#3B82F6", borderColor: "#2563EB" },
  ledRedActive: { backgroundColor: "#EF4444", borderColor: "#DC2626" },
  ledLabel: { fontWeight: "800", color: "#9CA3AF" },
  textWhite: { color: "white" },
});
