// app/mode/[modeId].tsx
import Slider from "@react-native-community/slider";
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from "react-native";

import client from "@/api/client";
import { getHomeRoomsMy, HomeRoomCard } from "@/api/service/homeEnvironmentApi";
import {
  executeMode,
  getModeDetail,
  setModeActions,
  setModeSchedules,
} from "@/api/service/modeService";

import type { ModeActionItem, ModeDetail } from "../../app/types/mode";

function actionToText(a: ModeActionItem) {
  if (a.command === "POWER") return `${a.deviceName} ${a.value === "ON" ? "ON" : "OFF"}`;
  if (a.command === "BRIGHTNESS") return `${a.deviceName} 밝기 ${a.value}%`;
  if (a.command === "SET_TEMP") return `${a.deviceName} 희망 온도 ${a.value}°C`;
  return `${a.deviceName} ${a.command} ${a.value}`;
}
function statusToText(s?: string) {
  switch (s) {
    case "EXECUTED":
      return "모드가 실행됐어요.";
    case "QUEUED":
      return "실행 요청이 접수됐어요.";
    case "FAILED":
      return "실행에 실패했어요.";
    default:
      return "요청이 처리됐어요.";
  }
}
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

export default function ModeDetailScreen() {
  const router = useRouter();
  const { modeId } = useLocalSearchParams<{ modeId: string }>();
  const id = Number(modeId);

  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [mode, setMode] = useState<ModeDetail | null>(null);

  // ✅ 편집모드 토글
  const [isEditing, setIsEditing] = useState(false);
  // ✅ 편집용 액션(서버 저장 대상)
  const [editActions, setEditActions] = useState<ModeActionItem[]>([]);

  // ✅ 동작 추가 모달
  const [modalOpen, setModalOpen] = useState(false);
  const [rooms, setRooms] = useState<HomeRoomCard[]>([]);
  const [devices, setDevices] = useState<SnapshotDevice[]>([]);
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);
  const [selectedRoomName, setSelectedRoomName] = useState<string>("");
  const [selectedDevice, setSelectedDevice] = useState<SnapshotDevice | null>(null);
  const [command, setCommand] = useState<Command>("POWER");

  // 값 UI
  const [powerOn, setPowerOn] = useState(false);
  const [brightness, setBrightness] = useState(50);
  const [temp, setTemp] = useState(24);

  const allowedCommands = selectedDevice ? getCommandsByType(selectedDevice.type) : [];

  useEffect(() => {
    (async () => {
      try {
        const list = await getHomeRoomsMy();
        setRooms(list ?? []);
      } catch (e) {
        console.log("방 목록 로드 실패:", e);
      }
    })();
  }, []);

  // ✅ 반드시 saveActions보다 위에 있어야 안전
  const load = useCallback(async () => {
    if (!id || Number.isNaN(id)) return;

    setLoading(true);
    try {
      const d = await getModeDetail(id);
      setMode(d);
      setEditActions(d?.actions ? d.actions.slice().sort((a, b) => a.sortOrder - b.sortOrder) : []);
    } catch (e) {
      console.log("모드 상세 로딩 실패:", e);
      Alert.alert("오류", "모드 상세를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      load();
      setIsEditing(false);
    }, [load]),
  );
  function repeatDaysToLabel(repeatDays?: string | null) {
    if (!repeatDays) return "설정됨";
    if (repeatDays === "DAILY") return "매일";
    if (repeatDays === "WEEKDAY") return "평일";
    // "MON,TUE" 같은 케이스면 그대로 보여주거나, 원하면 한글 요일로 바꿔도 됨
    return repeatDays;
  }
  const scheduleSummary = useMemo(() => {
    if (!mode?.schedules?.length) return "예약 안 됨";

    const s = mode.schedules.find((x) => x.isEnabled);
    if (!s) return "예약 꺼짐";

    const daysLabel = repeatDaysToLabel(s.repeatDays);

    const start = s.startTime ? s.startTime.slice(0, 5) : "--:--";
    const end = s.endTime ? s.endTime.slice(0, 5) : null;

    return end ? `${daysLabel} ${start} ~ ${end}` : `${daysLabel} ${start}`;
  }, [mode]);

  const isScheduleEnabled = useMemo(() => {
    if (!mode?.schedules?.length) return false;
    return mode.schedules.some((s) => s.isEnabled);
  }, [mode]);
  const [scheduleSaving, setScheduleSaving] = useState(false);
  const pickSchedule = (m: ModeDetail | null) => {
    if (!m?.schedules?.length) return null;
    return m.schedules.find((x) => x.isEnabled) ?? m.schedules[0];
  };
  const buildSchedulePayload = (nextEnabled: boolean) => {
    const s = pickSchedule(mode);

    return [
      {
        startTime: s?.startTime ?? "23:00",
        endTime: s?.endTime ?? null,
        endModeId: (s as any)?.endModeId ?? null,
        repeatDays: s?.repeatDays ?? "WEEKDAY",
        isEnabled: nextEnabled,
      },
    ];
  };

  const onToggleSchedule = async (nextEnabled: boolean) => {
    if (!id || Number.isNaN(id)) return;
    if (scheduleSaving) return;

    const prevMode = mode;

    // 낙관적 UI 업데이트
    setMode((prev) => {
      if (!prev) return prev;

      const payload = buildSchedulePayload(nextEnabled)[0];
      const picked = pickSchedule(prev);

      // schedules가 없으면 새로 1개 만들어줌
      if (!prev.schedules?.length || !picked) {
        return { ...prev, schedules: [payload as any] };
      }

      return {
        ...prev,
        schedules: prev.schedules.map((sch) => {
          const isSame =
            (sch as any).scheduleId && (picked as any).scheduleId
              ? (sch as any).scheduleId === (picked as any).scheduleId
              : sch.startTime === picked.startTime && sch.repeatDays === picked.repeatDays;

          return isSame ? ({ ...sch, ...payload } as any) : sch;
        }),
      };
    });

    try {
      setScheduleSaving(true);
      await setModeSchedules(id, buildSchedulePayload(nextEnabled));
      await load(); // 서버 값 다시 동기화
    } catch (e) {
      console.log("예약 토글 실패:", e);
      Alert.alert("오류", "예약 ON/OFF 저장에 실패했습니다.");
      setMode(prevMode); // 실패시 원복
    } finally {
      setScheduleSaving(false);
    }
  };
  const openAddActionModal = () => {
    setSelectedRoomId(null);
    setSelectedRoomName("");
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
    setSelectedDevice(null);
    setDevices([]);

    try {
      const devs = await getRoomSnapshotDevices(roomId);
      setDevices(devs);
    } catch (e: any) {
      console.log(
        "스냅샷 로드 실패:",
        e?.response?.status,
        e?.config?.baseURL,
        e?.config?.url,
        e?.response?.data,
      );
      Alert.alert("오류", "해당 방의 디바이스 정보를 불러오지 못했습니다.");
    }
  };

  const onSelectDevice = (d: SnapshotDevice) => {
    setSelectedDevice(d);

    const allowed = getCommandsByType(d.type);
    const nextCmd: Command = allowed.includes("SET_TEMP") ? "SET_TEMP" : "POWER";
    setCommand(nextCmd);

    setPowerOn(Boolean(d.power ?? false));
    setBrightness(typeof d.brightness === "number" ? d.brightness : 50);
    setTemp(typeof d.targetTemp === "number" ? d.targetTemp : 24);
  };

  const addActionToEditList = () => {
    if (!selectedRoomId || !selectedDevice) {
      Alert.alert("선택 필요", "방과 디바이스를 선택해 주세요.");
      return;
    }
    if (!allowedCommands.includes(command)) {
      Alert.alert("불가", "선택하신 디바이스는 해당 명령을 지원하지 않습니다.");
      return;
    }

    let valueStr = "OFF";
    if (command === "POWER") valueStr = powerOn ? "ON" : "OFF";
    if (command === "BRIGHTNESS") valueStr = String(Math.round(brightness));
    if (command === "SET_TEMP") valueStr = String(Math.round(temp));

    const keyDeviceId = selectedDevice.deviceId;
    const keyCommand = command;

    setEditActions((prev) => {
      const idx = prev.findIndex((a) => a.deviceId === keyDeviceId && a.command === keyCommand);

      // ✅ 이미 있으면: 덮어쓰기(값/이름만 업데이트, sortOrder 유지)
      if (idx >= 0) {
        const next = prev.slice();
        next[idx] = {
          ...next[idx],
          deviceName: `${selectedRoomName} · ${selectedDevice.name}`,
          value: valueStr,
        };
        return next.map((a, i) => ({ ...a, sortOrder: i + 1 }));
      }

      // ✅ 없으면: 새로 추가 (맨 뒤로)
      const appended: ModeActionItem = {
        sortOrder: prev.length + 1,
        deviceId: keyDeviceId,
        deviceName: `${selectedRoomName} · ${selectedDevice.name}`,
        command: keyCommand,
        value: valueStr,
      };

      return [...prev, appended].map((a, i) => ({ ...a, sortOrder: i + 1 }));
    });

    setModalOpen(false);
  };

  const removeActionInEditList = (sortOrder: number) => {
    setEditActions((prev) =>
      prev.filter((a) => a.sortOrder !== sortOrder).map((a, idx) => ({ ...a, sortOrder: idx + 1 })),
    );
  };

  const saveActions = async () => {
    if (!id || Number.isNaN(id)) return;

    try {
      await setModeActions(id, {
        actions: editActions.map((a, idx) => ({
          sortOrder: idx + 1,
          deviceId: a.deviceId,
          command: a.command as any,
          value: a.value,
        })),
      });

      await load();
      Alert.alert("저장 완료", "동작이 저장되었습니다.");
    } catch (e) {
      console.log("동작 저장 실패:", e);
      Alert.alert(
        "오류",
        "동작 저장에 실패했습니다. 로그인 상태(토큰)와 API 연결을 확인해 주세요.",
      );
      throw e;
    }
  };

  const onPressExecute = async () => {
    if (!id) return;

    try {
      setExecuting(true);
      const res = await executeMode(id);
      Alert.alert("실행 완료", statusToText(res?.status));
      await load();
    } catch (e) {
      console.log("모드 실행 실패:", e);
      Alert.alert("오류", "모드를 실행하지 못했습니다.");
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ headerShown: false }} />
        <ActivityIndicator />
        <Text style={{ marginTop: 8, color: "#666", fontWeight: "700" }}>불러오는 중…</Text>
      </View>
    );
  }

  if (!mode) {
    return (
      <View style={styles.center}>
        <Stack.Screen options={{ headerShown: false }} />
        <Text style={{ fontWeight: "900" }}>모드 정보를 찾을 수 없습니다.</Text>

        <Pressable style={styles.primaryBtn} onPress={() => router.back()}>
          <Text style={styles.primaryBtnText}>뒤로가기</Text>
        </Pressable>
      </View>
    );
  }

  const shownActions = isEditing ? editActions : (mode.actions ?? []);
  const canEdit = mode.isEditable && !mode.isDefault;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* 헤더 */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 22 }}>‹</Text>
        </Pressable>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={styles.title}>{mode.modeName}</Text>
            {mode.isDefault ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>기본</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.subTitle}>{scheduleSummary}</Text>
        </View>

        <Pressable
          style={[styles.editBtn, !canEdit && { opacity: 0.5 }]}
          onPress={async () => {
            if (!canEdit) {
              Alert.alert("안내", "기본 모드는 편집할 수 없습니다.");
              return;
            }

            if (isEditing) {
              try {
                await saveActions();
                setIsEditing(false);
              } catch {}
            } else {
              setIsEditing(true);
              setEditActions(
                mode.actions ? mode.actions.slice().sort((a, b) => a.sortOrder - b.sortOrder) : [],
              );
            }
          }}
        >
          <Text style={styles.editBtnText}>{isEditing ? "완료" : "편집"}</Text>
        </Pressable>
      </View>

      {/* 예약 영역 */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>예약 실행</Text>
            <Text style={styles.cardSub}>{scheduleSummary}</Text>
          </View>

          <View style={{ alignItems: "flex-end", gap: 6 }}>
            <Switch
              value={isScheduleEnabled}
              onValueChange={onToggleSchedule}
              disabled={scheduleSaving}
              trackColor={{ false: "#CBD5E1", true: "#2563EB" }}
              thumbColor="#FFFFFF"
            />

            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/mode/[modeId]/schedule" as any,
                  params: { modeId: String(mode.modeId) },
                })
              }
              style={{ paddingVertical: 2 }}
            >
              <Text style={{ color: "#64748B", fontWeight: "800", fontSize: 12 }}>설정하기</Text>
            </Pressable>
          </View>
        </View>
      </View>

      {/* 실행 동작 */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>실행 동작</Text>

        {isEditing ? (
          <Pressable style={styles.addActionBtn} onPress={openAddActionModal}>
            <Text style={styles.addActionBtnText}>＋ 동작 추가</Text>
          </Pressable>
        ) : null}
      </View>

      {shownActions.length ? (
        shownActions
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((a) => (
            <View key={`${a.deviceId}-${a.sortOrder}`} style={styles.actionItem}>
              <View style={styles.circle}>
                <Text style={styles.circleText}>{a.sortOrder}</Text>
              </View>

              <Text style={styles.actionText}>{actionToText(a)}</Text>

              {isEditing ? (
                <Pressable
                  onPress={() => removeActionInEditList(a.sortOrder)}
                  style={styles.trashBtn}
                >
                  <Text style={{ fontSize: 16 }}>🗑</Text>
                </Pressable>
              ) : null}
            </View>
          ))
      ) : (
        <View style={[styles.card, { marginTop: 10 }]}>
          <Text style={{ color: "#94A3B8", fontWeight: "700" }}>등록된 동작이 없습니다.</Text>
        </View>
      )}

      {/* 지금 실행 */}
      <Pressable
        style={[styles.primaryBtn, { marginTop: 20 }, executing && { opacity: 0.6 }]}
        disabled={executing}
        onPress={onPressExecute}
      >
        <Text style={styles.primaryBtnText}>{executing ? "실행 중…" : "✓ 지금 실행"}</Text>
      </Pressable>

      {/* 동작 추가 모달 */}
      <Modal
        visible={modalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setModalOpen(false)}
      >
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.25)", justifyContent: "flex-end" }}>
          <View
            style={{
              backgroundColor: "#F6F7FB",
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
              padding: 14,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "900" }}>동작 추가</Text>

            <Text style={{ marginTop: 10, fontWeight: "900" }}>1) 방 선택</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
              {rooms.map((r) => {
                const on = selectedRoomId === r.roomId;
                return (
                  <Pressable
                    key={r.roomId}
                    onPress={() => onSelectRoom(r.roomId, r.roomName)}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderRadius: 999,
                      backgroundColor: on ? "#2563EB" : "#F1F5F9",
                    }}
                  >
                    <Text style={{ fontWeight: "900", color: on ? "white" : "#111" }}>
                      {r.roomName}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            <Text style={{ marginTop: 10, fontWeight: "900" }}>2) 디바이스 선택</Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
              {devices.length === 0 ? (
                <Text style={{ color: "#666", fontWeight: "700" }}>
                  {selectedRoomId
                    ? "디바이스가 없거나 불러오지 못했습니다."
                    : "먼저 방을 선택해 주세요."}
                </Text>
              ) : (
                devices.map((d) => {
                  const on = selectedDevice?.deviceId === d.deviceId;
                  return (
                    <Pressable
                      key={d.deviceId}
                      onPress={() => onSelectDevice(d)}
                      style={{
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderRadius: 999,
                        backgroundColor: on ? "#2563EB" : "#F1F5F9",
                      }}
                    >
                      <Text style={{ fontWeight: "900", color: on ? "white" : "#111" }}>
                        {d.name}
                      </Text>
                    </Pressable>
                  );
                })
              )}
            </View>

            <Text style={{ marginTop: 10, fontWeight: "900" }}>3) 명령/값</Text>
            <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
              {(["POWER", "BRIGHTNESS", "SET_TEMP"] as const).map((c) => {
                const enabledCmd = selectedDevice ? allowedCommands.includes(c) : false;
                const on = command === c;
                return (
                  <Pressable
                    key={c}
                    disabled={!enabledCmd}
                    onPress={() => setCommand(c)}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 12,
                      borderRadius: 999,
                      backgroundColor: on ? "#2563EB" : "#F1F5F9",
                      opacity: enabledCmd ? 1 : 0.35,
                    }}
                  >
                    <Text style={{ fontWeight: "900", color: on ? "white" : "#111" }}>{c}</Text>
                  </Pressable>
                );
              })}
            </View>

            {command === "POWER" ? (
              <View style={{ marginTop: 10 }}>
                <Text style={{ marginTop: 8, fontWeight: "900" }}>전원</Text>
                <View style={{ flexDirection: "row", gap: 10, marginTop: 10 }}>
                  <Pressable
                    onPress={() => setPowerOn(false)}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 999,
                      alignItems: "center",
                      backgroundColor: !powerOn ? "#2563EB" : "#F1F5F9",
                    }}
                  >
                    <Text style={{ fontWeight: "900", color: !powerOn ? "white" : "#111" }}>
                      OFF
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setPowerOn(true)}
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      borderRadius: 999,
                      alignItems: "center",
                      backgroundColor: powerOn ? "#2563EB" : "#F1F5F9",
                    }}
                  >
                    <Text style={{ fontWeight: "900", color: powerOn ? "white" : "#111" }}>ON</Text>
                  </Pressable>
                </View>
              </View>
            ) : command === "BRIGHTNESS" ? (
              <View style={{ marginTop: 10 }}>
                <Text style={{ marginTop: 8, fontWeight: "900" }}>
                  밝기: {Math.round(brightness)}%
                </Text>
                <View
                  style={{
                    marginTop: 10,
                    backgroundColor: "#F1F5F9",
                    borderRadius: 14,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                  }}
                >
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
                <Text style={{ marginTop: 8, fontWeight: "900" }}>
                  희망 온도: {Math.round(temp)}°C
                </Text>
                <View
                  style={{
                    marginTop: 10,
                    backgroundColor: "#F1F5F9",
                    borderRadius: 14,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                  }}
                >
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
                style={{
                  flex: 1,
                  backgroundColor: "white",
                  borderRadius: 16,
                  paddingVertical: 14,
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                }}
                onPress={() => setModalOpen(false)}
              >
                <Text style={{ color: "#111", fontWeight: "900", fontSize: 15 }}>취소</Text>
              </Pressable>

              <Pressable
                style={{
                  flex: 1,
                  backgroundColor: "#2563EB",
                  borderRadius: 16,
                  paddingVertical: 14,
                  alignItems: "center",
                }}
                onPress={addActionToEditList}
              >
                <Text style={{ color: "white", fontWeight: "900", fontSize: 16 }}>추가</Text>
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
  container: { padding: 14, paddingTop: 60, paddingBottom: 0 },

  center: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F6F7FB" },

  header: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },

  title: { fontSize: 20, fontWeight: "900" },
  subTitle: { marginTop: 2, color: "#666", fontWeight: "700" },

  badge: {
    backgroundColor: "#E2E8F0",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { fontWeight: "900", color: "#334155", fontSize: 12 },

  editBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  editBtnText: { fontWeight: "900", color: "#111" },

  sectionHeader: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: { fontSize: 16, fontWeight: "900" },

  addActionBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  addActionBtnText: { fontWeight: "900", color: "#111" },

  card: { backgroundColor: "white", borderRadius: 16, padding: 14, marginTop: 8 },
  cardTitle: { fontWeight: "900", fontSize: 15 },
  cardSub: { marginTop: 2, color: "#666", fontWeight: "700" },

  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  pill: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999 },
  pillOn: { backgroundColor: "#2563EB" },
  pillOff: { backgroundColor: "#CBD5E1" },
  pillText: { color: "white", fontWeight: "900" },

  actionItem: {
    marginTop: 10,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
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
  actionText: { flex: 1, fontWeight: "800" },

  trashBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F1F5F9",
  },

  primaryBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryBtnText: { color: "white", fontWeight: "900", fontSize: 16 },
});
