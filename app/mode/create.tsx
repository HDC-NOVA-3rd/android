// app/mode/create.tsx
import { createMode, setModeActions } from "@/api/service/modeService";
import Slider from "@react-native-community/slider";
import { Stack, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import client from "@/api/client";
import { getHomeRoomsMy, HomeRoomCard } from "@/api/service/homeEnvironmentApi";

type SnapshotDevice = {
  deviceId: number;
  deviceCode: string;
  name: string;
  type: "LED" | "FAN" | "AIRCON" | string;
  power?: boolean;
  brightness?: number | null;
  targetTemp?: number | null;
};

type Command = "POWER" | "BRIGHTNESS" | "SET_TEMP";

type LocalAction = {
  id: string;
  roomId: number;
  roomName: string;
  deviceId: number;
  deviceCode: string;
  deviceName: string;
  command: Command;
  value: string; // "ON"/"OFF"/"10"/"24"
};

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getCommandsByType(type: SnapshotDevice["type"]): Command[] {
  if (type === "LED") return ["POWER", "BRIGHTNESS"];
  if (type === "FAN") return ["POWER"];
  if (type === "AIRCON") return ["POWER", "SET_TEMP"];
  return ["POWER"];
}

async function getRoomSnapshotDevices(roomId: number): Promise<SnapshotDevice[]> {
  const res = await client.get(`/room/${roomId}/snapshot`);
  const arr = res.data?.device ?? res.data?.devices ?? [];
  return arr.map((d: any) => ({
    deviceId: d.deviceId ?? d.id,
    deviceCode: d.deviceCode,
    name: d.name,
    type: d.type,
    power: d.power,
    brightness: d.brightness,
    targetTemp: d.targetTemp,
  }));
}

export default function ModeCreateScreen() {
  const router = useRouter();

  const [modeName, setModeName] = useState("");
  const [actions, setActions] = useState<LocalAction[]>([]);

  // 동작 추가 모달 상태
  const [modalOpen, setModalOpen] = useState(false);
  const [rooms, setRooms] = useState<HomeRoomCard[]>([]);
  const [devices, setDevices] = useState<SnapshotDevice[]>([]);

  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [selectedRoomName, setSelectedRoomName] = useState<string>("");
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<SnapshotDevice | null>(null);

  const [command, setCommand] = useState<Command>("POWER");

  // ✅ 값 UI(텍스트 입력 제거)
  const [powerOn, setPowerOn] = useState<boolean>(false);
  const [brightness, setBrightness] = useState<number>(50);
  const [temp, setTemp] = useState<number>(24);

  const canCreate = useMemo(() => modeName.trim().length > 0, [modeName]);

  const loadRooms = useCallback(async () => {
    try {
      const list = await getHomeRoomsMy();
      setRooms(list);
    } catch (e) {
      console.log("방 목록 로드 실패:", e);
    }
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  const openAddAction = () => {
    setSelectedRoomId(null);
    setSelectedRoomName("");
    setSelectedDeviceId(null);
    setSelectedDevice(null);
    setDevices([]);

    setCommand("POWER");
    setPowerOn(false);
    setBrightness(50);
    setTemp(24);

    setModalOpen(true);
  };

  const onSelectRoom = async (roomId: number, roomName: string) => {
    setSelectedRoomId(roomId);
    setSelectedRoomName(roomName);

    setSelectedDeviceId(null);
    setSelectedDevice(null);
    setDevices([]);

    try {
      const devs = await getRoomSnapshotDevices(roomId);
      setDevices(devs);
    } catch (e) {
      console.log("스냅샷 로드 실패:", e);
      Alert.alert("오류", "해당 방의 디바이스를 불러오지 못했어.");
    }
  };

  const onSelectDevice = (d: SnapshotDevice) => {
    setSelectedDeviceId(d.deviceId);
    setSelectedDevice(d);

    const allowed = getCommandsByType(d.type);

    // ✅ 기본 command 추천: AIRCON이면 SET_TEMP 우선, 아니면 POWER
    const nextCmd: Command = allowed.includes("SET_TEMP") ? "SET_TEMP" : "POWER";
    setCommand(nextCmd);

    // ✅ 기본 값 추천(스냅샷 기반)
    setPowerOn(Boolean(d.power ?? false));
    setBrightness(typeof d.brightness === "number" ? d.brightness : 50);
    setTemp(typeof d.targetTemp === "number" ? d.targetTemp : 24);
  };

  const addAction = () => {
    if (!selectedRoomId || !selectedDevice) {
      Alert.alert("선택 필요", "방과 디바이스를 선택해줘.");
      return;
    }

    const allowed = getCommandsByType(selectedDevice.type);
    if (!allowed.includes(command)) {
      Alert.alert("불가", "이 디바이스는 해당 명령을 지원하지 않아.");
      return;
    }

    let valueStr = "OFF";
    if (command === "POWER") valueStr = powerOn ? "ON" : "OFF";
    if (command === "BRIGHTNESS") valueStr = String(Math.round(brightness));
    if (command === "SET_TEMP") valueStr = String(Math.round(temp));

    const next: LocalAction = {
      id: uid(),
      roomId: selectedRoomId,
      roomName: selectedRoomName,
      deviceId: selectedDevice.deviceId,
      deviceCode: selectedDevice.deviceCode,
      deviceName: selectedDevice.name,
      command,
      value: valueStr,
    };

    setActions((prev) => [...prev, next]);
    setModalOpen(false);
  };

  const removeAction = (id: string) => {
    setActions((prev) => prev.filter((a) => a.id !== id));
  };

  const onCreate = async () => {
    if (!canCreate) return;

    try {
      const created = await createMode({ modeName: modeName.trim(), sourceModeId: null });
      const newId = created?.modeId ?? created?.id;

      if (!newId) {
        Alert.alert("오류", "생성은 됐는데 modeId를 못 받았어.");
        return;
      }

      // ✅ actions 저장 (sortOrder는 서버가 자동 채워도 되지만, 여기서도 넣어주면 더 안정적)
      const payload = {
        actions: actions.map((a, idx) => ({
          sortOrder: idx + 1,
          deviceId: a.deviceId,
          command: a.command,
          value: a.value,
        })),
      };

      if (payload.actions.length > 0) {
        await setModeActions(newId, payload);
      }

      Alert.alert("생성 완료", "커스텀 모드가 생성됐어.");
      router.replace({ pathname: "/mode/[modeId]" as any, params: { modeId: String(newId) } });
    } catch (e) {
      console.log("모드 생성 실패:", e);
      Alert.alert("오류", "모드 생성/저장에 실패했어.");
    }
  };

  const renderActionText = (a: LocalAction) => {
    if (a.command === "POWER") return `${a.deviceName} 전원 ${a.value}`;
    if (a.command === "BRIGHTNESS") return `${a.deviceName} 밝기 ${a.value}%`;
    if (a.command === "SET_TEMP") return `${a.deviceName} 온도 ${a.value}°C`;
    return `${a.deviceName} ${a.command} = ${a.value}`;
  };

  const allowedCommands = selectedDevice ? getCommandsByType(selectedDevice.type) : [];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 22 }}>‹</Text>
        </Pressable>
        <Text style={styles.title}>커스텀 모드 만들기</Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>모드 이름</Text>
        <TextInput
          value={modeName}
          onChangeText={setModeName}
          placeholder="예: 영화 감상 모드"
          style={styles.input}
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>실행 동작</Text>

        {actions.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>
              아직 추가된 동작이 없습니다.{"\n"}버튼을 눌러 동작을 추가해보세요.
            </Text>
          </View>
        ) : (
          <View style={{ marginTop: 10, gap: 10 }}>
            {actions.map((a, idx) => (
              <View key={a.id} style={styles.actionRow}>
                <View style={styles.circle}>
                  <Text style={styles.circleText}>{idx + 1}</Text>
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.actionMain}>
                    {a.roomName} · {renderActionText(a)}
                  </Text>
                  <Text style={styles.actionSub}>
                    {a.command} / {a.value}
                  </Text>
                </View>

                <Pressable onPress={() => removeAction(a.id)} style={styles.trashBtn}>
                  <Text style={{ fontSize: 16 }}>🗑</Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}

        <Pressable style={styles.addActionBtn} onPress={openAddAction}>
          <Text style={styles.addActionPlus}>＋</Text>
          <Text style={styles.addActionText}>동작 추가</Text>
        </Pressable>
      </View>

      <Pressable
        style={[styles.primaryBtn, { marginTop: 14 }, !canCreate && { opacity: 0.4 }]}
        disabled={!canCreate}
        onPress={onCreate}
      >
        <Text style={styles.primaryBtnText}>모드 생성</Text>
      </Pressable>

      {/* 동작 추가 모달 */}
      <Modal
        visible={modalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <Text style={styles.modalTitle}>동작 추가</Text>

            <Text style={[styles.label, { marginTop: 10 }]}>1) 방 선택</Text>
            <View style={styles.chipsWrap}>
              {rooms.map((r) => {
                const on = selectedRoomId === r.roomId;
                return (
                  <Pressable
                    key={r.roomId}
                    onPress={() => onSelectRoom(r.roomId, r.roomName)}
                    style={[styles.chip, on ? styles.chipOn : styles.chipOff]}
                  >
                    <Text style={[styles.chipText, on ? { color: "white" } : { color: "#111" }]}>
                      {r.roomName}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={[styles.label, { marginTop: 10 }]}>2) 디바이스 선택</Text>
            <View style={styles.chipsWrap}>
              {devices.length === 0 ? (
                <Text style={{ color: "#666", fontWeight: "700" }}>
                  {selectedRoomId ? "디바이스가 없거나 불러오지 못했어." : "먼저 방을 선택해줘."}
                </Text>
              ) : (
                devices.map((d) => {
                  const on = selectedDeviceId === d.deviceId;
                  return (
                    <Pressable
                      key={d.deviceId}
                      onPress={() => onSelectDevice(d)}
                      style={[styles.chip, on ? styles.chipOn : styles.chipOff]}
                    >
                      <Text style={[styles.chipText, on ? { color: "white" } : { color: "#111" }]}>
                        {d.name}
                      </Text>
                    </Pressable>
                  );
                })
              )}
            </View>

            <Text style={[styles.label, { marginTop: 10 }]}>3) 명령/값</Text>

            {/* ✅ 명령 선택: 가능한 것만 활성화 */}
            <View style={styles.cmdRow}>
              {(["POWER", "BRIGHTNESS", "SET_TEMP"] as const).map((c) => {
                const enabledCmd = selectedDevice ? allowedCommands.includes(c) : false;
                const on = command === c;

                return (
                  <Pressable
                    key={c}
                    disabled={!enabledCmd}
                    onPress={() => setCommand(c)}
                    style={[
                      styles.cmdChip,
                      on ? styles.cmdOn : styles.cmdOff,
                      !enabledCmd && { opacity: 0.35 },
                    ]}
                  >
                    <Text style={[styles.cmdText, on ? { color: "white" } : { color: "#111" }]}>
                      {c}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {/* ✅ 값 UI: command별 */}
            {command === "POWER" ? (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.valueTitle}>전원</Text>
                <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                  <Pressable
                    onPress={() => setPowerOn(false)}
                    style={[styles.valueChip, !powerOn ? styles.valueOn : styles.valueOff]}
                  >
                    <Text
                      style={[
                        styles.valueChipText,
                        !powerOn ? { color: "white" } : { color: "#111" },
                      ]}
                    >
                      OFF
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setPowerOn(true)}
                    style={[styles.valueChip, powerOn ? styles.valueOn : styles.valueOff]}
                  >
                    <Text
                      style={[
                        styles.valueChipText,
                        powerOn ? { color: "white" } : { color: "#111" },
                      ]}
                    >
                      ON
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : command === "BRIGHTNESS" ? (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.valueTitle}>밝기: {Math.round(brightness)}%</Text>
                <View style={styles.sliderRow}>
                  <Slider
                    value={brightness}
                    onValueChange={setBrightness}
                    minimumValue={0}
                    maximumValue={100}
                    step={1}
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
            ) : (
              <View style={{ marginTop: 10 }}>
                <Text style={styles.valueTitle}>희망 온도: {Math.round(temp)}°C</Text>
                <View style={styles.sliderRow}>
                  <Slider
                    value={temp}
                    onValueChange={setTemp}
                    minimumValue={16}
                    maximumValue={30}
                    step={1}
                    style={{ flex: 1 }}
                  />
                </View>
              </View>
            )}

            <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
              <Pressable
                style={[styles.secondaryBtn, { flex: 1 }]}
                onPress={() => setModalOpen(false)}
              >
                <Text style={styles.secondaryBtnText}>취소</Text>
              </Pressable>
              <Pressable style={[styles.primaryBtn, { flex: 1, marginTop: 0 }]} onPress={addAction}>
                <Text style={styles.primaryBtnText}>추가</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F6F7FB" },
  container: { padding: 14, paddingTop: 18, paddingBottom: 24 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "900" },

  card: { backgroundColor: "white", borderRadius: 16, padding: 14, marginTop: 10 },
  label: { fontWeight: "900", fontSize: 15 },

  input: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontWeight: "800",
  },

  emptyBox: {
    marginTop: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    backgroundColor: "#fff",
  },
  emptyText: { color: "#666", fontWeight: "700", textAlign: "center" },

  addActionBtn: {
    marginTop: 12,
    borderRadius: 16,
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
  addActionPlus: { fontSize: 18, fontWeight: "900", color: "#666" },
  addActionText: { fontWeight: "900", color: "#666" },

  actionRow: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    gap: 10,
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  circleText: { color: "white", fontWeight: "900" },
  actionMain: { fontWeight: "900" },
  actionSub: { marginTop: 2, color: "#666", fontWeight: "700" },
  trashBtn: { width: 32, alignItems: "center", justifyContent: "center" },

  primaryBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryBtnText: { color: "white", fontWeight: "900", fontSize: 16 },

  secondaryBtn: {
    backgroundColor: "white",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  secondaryBtnText: { color: "#111", fontWeight: "900", fontSize: 15 },

  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.25)", justifyContent: "flex-end" },
  modalSheet: {
    backgroundColor: "#F6F7FB",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 14,
  },
  modalTitle: { fontSize: 16, fontWeight: "900" },

  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 },
  chip: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 999 },
  chipOn: { backgroundColor: "#2563EB" },
  chipOff: { backgroundColor: "#F1F5F9" },
  chipText: { fontWeight: "900" },

  cmdRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  cmdChip: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 999 },
  cmdOn: { backgroundColor: "#2563EB" },
  cmdOff: { backgroundColor: "#F1F5F9" },
  cmdText: { fontWeight: "900" },

  valueTitle: { marginTop: 8, fontWeight: "900", color: "#111" },
  valueChip: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 999,
    alignItems: "center",
    borderWidth: 1,
  },
  valueOn: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  valueOff: { backgroundColor: "#F1F5F9", borderColor: "#E2E8F0" },
  valueChipText: { fontWeight: "900" },

  sliderRow: {
    marginTop: 10,
    backgroundColor: "#F1F5F9",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
