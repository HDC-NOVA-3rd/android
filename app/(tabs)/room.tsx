import useMqtt from "@/hooks/useMqtt";
import Slider from "@react-native-community/slider";
import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

type SnapshotResponse = {
  roomId: number;
  roomName: string;
  temperature: number | null;
  humidity: number | null;
  device: {
    deviceId: number;
    deviceCode: string;
    name: string;
    type: "LED" | "FAN" | "AC" | string;
    power: boolean | null;
    brightness: number | null;
    targetTemp: number | null;
  }[];
};

export default function RoomScreen() {
  const roomId = 1;

  // ✅ 서버 API Base URL (.env)
  const BASE_URL = process.env.EXPO_PUBLIC_API_URL; // 예: http://192.168.14.90:8080/api

  // ✅ MQTT (브로커는 그대로 WS)
  const brokerUrl = useMemo(() => "ws://192.168.14.90:9001", []);

  // ✅ 토픽 통일
  const HO_ID = "1";
  const DEFAULT_LED_BRIGHTNESS = 50;
  const TOPIC_CMD = `hdc/${HO_ID}/assistant/execute/req`;

  // ✅ 센서 토픽도 통일(스프링에 저장되는 그 토픽)
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

  /**
   * ✅ MQTT 명령 publish 헬퍼 (코드 짧게!)
   */
  const publishCommand = (deviceCode: string, command: string, value: any) => {
    publish(
      TOPIC_CMD,
      JSON.stringify({
        traceId: `rn-${Date.now()}`,
        roomId,
        deviceCode,
        command,
        value,
      }),
    );
  };

  /**
   * ✅ PATCH로 DB에 상태 저장 (스냅샷/다른폰 동기화 대비)
   */
  const patchDeviceState = async (payload: any) => {
    try {
      if (!BASE_URL) {
        console.log("EXPO_PUBLIC_API_URL이 설정되지 않았음");
        return;
      }

      const res = await fetch(`${BASE_URL}/room/${roomId}/devices/state`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      console.log("PATCH status:", res.status, "body:", text);
    } catch (e) {
      console.log("PATCH error:", e);
    }
  };

  /**
   * ✅ 0) 방 상세 진입 시: 스냅샷 GET → state 초기 세팅
   */
  useEffect(() => {
    const fetchSnapshot = async () => {
      try {
        if (!BASE_URL) {
          console.log("EXPO_PUBLIC_API_URL이 설정되지 않았음");
          return;
        }

        const res = await fetch(`${BASE_URL}/room/${roomId}/snapshot`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) {
          console.log("스냅샷 GET 실패:", res.status);
          return;
        }

        const data: SnapshotResponse = await res.json();

        // 1) 온습도 초기값
        if (typeof data.temperature === "number") setTemp(data.temperature);
        if (typeof data.humidity === "number") setHumi(data.humidity);

        // 2) 디바이스 초기값
        const led = data.device.find((d) => d.type === "LED" || d.deviceCode === "light-1");
        if (led) {
          const b = typeof led.brightness === "number" ? led.brightness : 0;

          setBrightness(b);

          // LED는 "밝기 기준"으로 토글 상태 결정
          setLedOn(b > 0);
        }

        const fan = data.device.find((d) => d.type === "FAN" || d.deviceCode === "fan-1");
        if (fan) {
          setFanOn(Boolean(fan.power));
          if (typeof fan.targetTemp === "number") setTargetTemp(fan.targetTemp);
        }

        console.log("스냅샷 초기화 완료");
      } catch (e) {
        console.log("스냅샷 GET 에러:", e);
      }
    };

    fetchSnapshot();
  }, [BASE_URL]);

  /**
   * ✅ 1) MQTT 연결되면 ENV 구독
   */
  useEffect(() => {
    if (connectStatus === "connected") {
      subscribe(TOPIC_ENV);
    }
    return () => {
      unsubscribe(TOPIC_ENV);
    };
  }, [connectStatus, subscribe, unsubscribe]);

  /**
   * ✅ 2) ENV 메시지 오면 화면 갱신
   * Pi는 TEMP/HUMIDITY를 같은 토픽으로 따로 보내니까 sensorType으로 분기
   */
  useEffect(() => {
    if (!lastMessage) return;
    if (lastMessage.topic !== TOPIC_ENV) return;

    try {
      const data = JSON.parse(lastMessage.message);
      // payload 예시:
      // { roomId: 1, sensorType: "TEMP", value: 24, unit: "C", ts: "..." }
      if (data?.sensorType === "TEMP" && typeof data.value === "number") setTemp(data.value);
      if (data?.sensorType === "HUMIDITY" && typeof data.value === "number") setHumi(data.value);
    } catch (e) {
      console.log("ENV JSON 파싱 실패:", e);
    }
  }, [lastMessage]);

  /**
   * ✅ 전등 토글: MQTT + PATCH
   */
  const onToggleLed = async (value: boolean) => {
    if (!value) {
      // OFF: power만 끄고, brightness는 유지(0이든 34든 그대로 둠)
      setLedOn(false);

      publishCommand("light-1", "POWER", "OFF");

      await patchDeviceState({
        devices: [{ deviceCode: "light-1", power: false }],
      });
      return;
    }

    // ON 요청
    // 밝기가 0이면 기본 밝기로 올리고 켠다
    const nextBrightness = brightness > 0 ? brightness : DEFAULT_LED_BRIGHTNESS;

    setBrightness(nextBrightness);
    setLedOn(true);

    // MQTT: 밝기 먼저 보내고, 그 다음 POWER ON (안정적)
    publishCommand("light-1", "BRIGHTNESS", nextBrightness);
    publishCommand("light-1", "POWER", "ON");

    await patchDeviceState({
      devices: [{ deviceCode: "light-1", power: true, brightness: nextBrightness }],
    });
  };

  /**
   * ✅ 밝기 조절: MQTT + PATCH
   */
  const onBrightnessCommit = async (value: number) => {
    const b = Math.round(value);
    setBrightness(b);

    const nextPower = b > 0;
    setLedOn(nextPower);

    // MQTT: 밝기 보내고, 0이면 OFF / 아니면 ON
    publishCommand("light-1", "BRIGHTNESS", b);
    publishCommand("light-1", "POWER", nextPower ? "ON" : "OFF");

    await patchDeviceState({
      devices: [{ deviceCode: "light-1", power: nextPower, brightness: b }],
    });
  };

  /**
   * ✅ 팬 토글: MQTT + PATCH
   */
  const onToggleFan = async (value: boolean) => {
    setFanOn(value);

    // MQTT (통일)  ✅ 여기 중요: 기존 woo 토픽 제거!
    publishCommand("fan-1", "POWER", value ? "ON" : "OFF");

    // DB 저장
    await patchDeviceState({
      devices: [
        {
          deviceCode: "fan-1",
          power: value,
        },
      ],
    });
  };

  /**
   * ✅ 목표 온도: MQTT + (DB 저장은 선택)
   */
  const onTempCommit = async (value: number) => {
    const rounded = Math.round(value);
    setTargetTemp(rounded);

    // MQTT (통일)
    publishCommand("fan-1", "SET_TEMP", rounded);

    await patchDeviceState({
      devices: [
        {
          deviceCode: "fan-1",
          targetTemp: rounded,
        },
      ],
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>거실</Text>
      <Text style={styles.status}>MQTT 상태: {connectStatus}</Text>

      {/* 실내 환경 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>실내 환경</Text>
        <Text>온도: {temp === null ? "--" : `${temp}°C`}</Text>
        <Text>습도: {humi === null ? "--" : `${humi}%`}</Text>
      </View>

      {/* 전등 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>전등</Text>
        <View style={styles.row}>
          <Text>{ledOn ? "켜짐" : "꺼짐"}</Text>
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
        <Text style={styles.sectionTitle}>에어컨(팬)</Text>
        <View style={styles.row}>
          <Text>{fanOn ? "켜짐" : "꺼짐"}</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#F6F7FB" },
  title: { fontSize: 22, fontWeight: "800" },
  status: { marginTop: 6, color: "#666" },
  section: { backgroundColor: "white", borderRadius: 16, padding: 16, marginTop: 12 },
  sectionTitle: { fontSize: 16, fontWeight: "800", marginBottom: 10 },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  tempText: { marginTop: 14, fontWeight: "700" },
  hint: { marginTop: 6, color: "#777", fontSize: 12 },
});
