// app/mode/create.tsx

import { useRouter } from "expo-router";
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
import { createMode } from "@/api/service/modeService";

type SnapshotDevice = {
  deviceId: number;
  deviceCode: string;
  name: string;
  type: "LED" | "FAN" | "AIRCON" | string;
  power?: boolean;
  brightness?: number | null;
  targetTemp?: number | null;
};

type LocalAction = {
  id: string;
  roomId: number;
  roomName: string;
  deviceId: number;
  deviceCode: string;
  deviceName: string;
  command: "POWER" | "BRIGHTNESS" | "SET_TEMP";
  value: string; // "ON"/"OFF"/"10"/"24"
};

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function getRoomSnapshotDevices(roomId: number): Promise<SnapshotDevice[]> {
  // 너가 이미 쓰는 스냅샷 엔드포인트가 /rooms/{roomId}/snapshot 라고 했으니 그 기준
  const res = await client.get(`/rooms/${roomId}/snapshot`);
  // res.data.device or res.data.devices 둘 다 대응
  const arr = res.data?.device ?? res.data?.devices ?? [];
  // deviceCode/name/type 정도만 필요
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

  const [command, setCommand] = useState<"POWER" | "BRIGHTNESS" | "SET_TEMP">("POWER");
  const [value, setValue] = useState<string>("OFF");

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
    setValue("OFF");
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

    // 디바이스 타입에 따라 기본 command/value 추천
    if (d.type === "LED") {
      setCommand("POWER");
      setValue("OFF");
    } else if (d.type === "FAN") {
      setCommand("POWER");
      setValue("OFF");
    } else if (d.type === "AIRCON") {
      setCommand("SET_TEMP");
      setValue("24");
    }
  };

  const addAction = () => {
    if (!selectedRoomId || !selectedDevice) {
      Alert.alert("선택 필요", "방과 디바이스를 선택해줘.");
      return;
    }

    // command별 value 유효성
    if (command === "POWER") {
      const v = value.toUpperCase();
      if (!(v === "ON" || v === "OFF")) {
        Alert.alert("값 오류", "POWER는 ON 또는 OFF로 입력해줘.");
        return;
      }
    } else {
      if (!/^\d+$/.test(value)) {
        Alert.alert("값 오류", "숫자만 입력해줘.");
        return;
      }
    }

    const next: LocalAction = {
      id: uid(),
      roomId: selectedRoomId,
      roomName: selectedRoomName,
      deviceId: selectedDevice.deviceId,
      deviceCode: selectedDevice.deviceCode,
      deviceName: selectedDevice.name,
      command,
      value: command === "POWER" ? value.toUpperCase() : value,
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

      // TODO(중요): actions를 서버에 저장하려면 ModeAction 저장 API가 필요
      // - 예: POST /api/mode/{modeId}/actions (배열로)
      // 지금은 “모드 생성”까지만 완료하고 상세로 이동
      Alert.alert("생성 완료", "커스텀 모드가 생성됐어.");
      const newId = created?.modeId ?? created?.id;
      if (newId) {
        router.replace({
          pathname: "/mode/[modeId]" as any,
          params: { modeId: String(newId) },
        });
      } else {
        router.back();
      }
    } catch (e) {
      console.log("모드 생성 실패:", e);
      Alert.alert("오류", "모드 생성에 실패했어. API 경로/바디 확인해줘.");
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
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
                    {a.roomName} · {a.deviceName}
                  </Text>
                  <Text style={styles.actionSub}>
                    {a.command} = {a.value}
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

      <View style={styles.card}>
        <Text style={styles.hintTitle}>💡 예시</Text>
        <Text style={styles.hintText}>• 아침 기상: 전등 켜기 + 온도 올리기</Text>
        <Text style={styles.hintText}>• 영화 감상: 거실 조명 어둡게 + 팬 켜기</Text>
        <Text style={styles.hintText}>• 손님 맞이: 거실·주방 전등 켜기 + 온도 조절</Text>
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

            <View style={styles.cmdRow}>
              {(["POWER", "BRIGHTNESS", "SET_TEMP"] as const).map((c) => {
                const on = command === c;
                return (
                  <Pressable
                    key={c}
                    onPress={() => setCommand(c)}
                    style={[styles.cmdChip, on ? styles.cmdOn : styles.cmdOff]}
                  >
                    <Text style={[styles.cmdText, on ? { color: "white" } : { color: "#111" }]}>
                      {c}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <TextInput
              value={value}
              onChangeText={setValue}
              placeholder={command === "POWER" ? "ON 또는 OFF" : "숫자 입력"}
              style={styles.input}
            />

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

  hintTitle: { fontWeight: "900" },
  hintText: { marginTop: 6, color: "#666", fontWeight: "700" },

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
});
