// app/mode/[modeId]/schedule.tsx

import {
  clearModeSchedules,
  getModeDetail,
  getMyModes,
  setModeSchedules,
} from "@/api/service/modeService";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { ModeListItem } from "../../types/mode";

const DAYS = [
  { key: "MON", label: "월" },
  { key: "TUE", label: "화" },
  { key: "WED", label: "수" },
  { key: "THU", label: "목" },
  { key: "FRI", label: "금" },
  { key: "SAT", label: "토" },
  { key: "SUN", label: "일" },
] as const;

function parseRepeatDaysToSelectedDays(repeatDays?: string | null): string[] {
  if (!repeatDays) return ["MON", "TUE", "WED", "THU", "FRI"];
  if (repeatDays === "DAILY") return ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
  if (repeatDays === "WEEKDAY") return ["MON", "TUE", "WED", "THU", "FRI"];

  return repeatDays
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function applyTime24ToState(
  time24: string,
  setAmpm: (v: "AM" | "PM") => void,
  setHour12: (v: number) => void,
  setMinute: (v: number) => void,
) {
  const [HH, MM] = time24.split(":");
  const h24 = Number(HH);
  const m = Number(MM);

  const ampm: "AM" | "PM" = h24 >= 12 ? "PM" : "AM";
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;

  setAmpm(ampm);
  setHour12(h12);
  setMinute(Number.isFinite(m) ? m : 0);
}

// ✅ 1분 단위
const MINUTES = Array.from({ length: 60 }, (_, i) => i); // 0..59
const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1); // 1..12

function toTimeLabel(ampm: "AM" | "PM", hour12: number, minute: number) {
  const ap = ampm === "AM" ? "오전" : "오후";
  const hh = String(hour12).padStart(2, "0");
  const mm = String(minute).padStart(2, "0");
  return `${ap} ${hh}:${mm}`;
}

function toTime24(ampm: "AM" | "PM", hour12: number, minute: number) {
  let h = hour12 % 12; // 12 -> 0
  if (ampm === "PM") h += 12;
  const HH = String(h).padStart(2, "0");
  const MM = String(minute).padStart(2, "0");
  return `${HH}:${MM}`;
}

type SheetType = "START" | "END";

/** ✅ 공용 Chip(한 번만 선언) */
const Chip = ({
  label,
  on,
  onPress,
  minWidth,
}: {
  label: string;
  on: boolean;
  onPress: () => void;
  minWidth?: number;
}) => (
  <Pressable
    onPress={onPress}
    style={[styles.chip, { minWidth: minWidth ?? 44 }, on ? styles.chipOn : styles.chipOff]}
  >
    <Text style={[styles.chipText, on ? { color: "white" } : { color: "#111" }]}>{label}</Text>
  </Pressable>
);

/** ✅ 시간 선택 바텀시트(한 번만 선언) */
function TimeSheetModal({
  type,
  timeSheetOpen,
  setTimeSheetOpen,
  startAmpm,
  startHour12,
  startMinute,
  endAmpm,
  endHour12,
  endMinute,
  setStartAmpm,
  setStartHour12,
  setStartMinute,
  setEndAmpm,
  setEndHour12,
  setEndMinute,
}: {
  type: SheetType;
  timeSheetOpen: null | SheetType;
  setTimeSheetOpen: Dispatch<SetStateAction<SheetType | null>>;
  startAmpm: "AM" | "PM";
  startHour12: number;
  startMinute: number;
  endAmpm: "AM" | "PM";
  endHour12: number;
  endMinute: number;

  setStartAmpm: (v: "AM" | "PM") => void;
  setStartHour12: (v: number) => void;
  setStartMinute: (v: number) => void;
  setEndAmpm: (v: "AM" | "PM") => void;
  setEndHour12: (v: number) => void;
  setEndMinute: (v: number) => void;
}) {
  const isStart = type === "START";
  const visible = timeSheetOpen === type;

  const a = isStart ? startAmpm : endAmpm;
  const h = isStart ? startHour12 : endHour12;
  const m = isStart ? startMinute : endMinute;

  const setA = isStart ? setStartAmpm : setEndAmpm;
  const setH = isStart ? setStartHour12 : setEndHour12;
  const setM = isStart ? setStartMinute : setEndMinute;

  const title = isStart ? "시작 시간 선택" : "종료 시간 선택";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => setTimeSheetOpen(null)}
    >
      <View style={styles.modalRoot}>
        <Pressable style={styles.sheetOverlay} onPress={() => setTimeSheetOpen(null)} />

        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>{title}</Text>
            <Pressable onPress={() => setTimeSheetOpen(null)} style={styles.sheetClose}>
              <Text style={{ fontSize: 18, fontWeight: "900" }}>✕</Text>
            </Pressable>
          </View>

          <Text style={styles.sheetSectionTitle}>오전/오후</Text>
          <View style={styles.chipRow}>
            <Chip label="오전" on={a === "AM"} onPress={() => setA("AM")} minWidth={70} />
            <Chip label="오후" on={a === "PM"} onPress={() => setA("PM")} minWidth={70} />
          </View>

          <Text style={styles.sheetSectionTitle}>시간</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {HOURS_12.map((x) => (
              <Chip key={x} label={String(x)} on={h === x} onPress={() => setH(x)} />
            ))}
          </ScrollView>

          <Text style={styles.sheetSectionTitle}>분</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipRow}
          >
            {MINUTES.map((x) => (
              <Chip
                key={x}
                label={String(x).padStart(2, "0")}
                on={m === x}
                onPress={() => setM(x)}
              />
            ))}
          </ScrollView>

          <Text style={styles.previewText}>
            선택된 시간: {toTimeLabel(a, h, m)} ({toTime24(a, h, m)})
          </Text>

          <View style={styles.sheetBtns}>
            <Pressable style={styles.sheetBtnPrimary} onPress={() => setTimeSheetOpen(null)}>
              <Text style={styles.sheetBtnPrimaryText}>확인</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

/** ✅ 모드 선택 바텀시트(한 번만 선언) */
function ModePickerModal({
  modeSheetOpen,
  setModeSheetOpen,
  modes,
  setSwitchModeId,
}: {
  modeSheetOpen: boolean;
  setModeSheetOpen: Dispatch<SetStateAction<boolean>>;
  modes: ModeListItem[];
  setSwitchModeId: Dispatch<SetStateAction<number | null>>;
}) {
  return (
    <Modal
      visible={modeSheetOpen}
      transparent
      animationType="slide"
      onRequestClose={() => setModeSheetOpen(false)}
    >
      <View style={styles.modalRoot}>
        <Pressable style={styles.sheetOverlay} onPress={() => setModeSheetOpen(false)} />

        <View style={styles.sheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>전환 모드 선택</Text>
            <Pressable onPress={() => setModeSheetOpen(false)} style={styles.sheetClose}>
              <Text style={{ fontSize: 18, fontWeight: "900" }}>✕</Text>
            </Pressable>
          </View>

          <ScrollView style={{ maxHeight: 320 }}>
            <Pressable
              style={styles.modeRow}
              onPress={() => {
                setSwitchModeId(null);
                setModeSheetOpen(false);
              }}
            >
              <Text style={styles.modeRowText}>선택 안 함</Text>
            </Pressable>

            {modes.map((m) => (
              <Pressable
                key={m.modeId}
                style={styles.modeRow}
                onPress={() => {
                  setSwitchModeId(m.modeId);
                  setModeSheetOpen(false);
                }}
              >
                <Text style={styles.modeRowText}>{m.modeName}</Text>
                <Text style={styles.modeRowSub}>
                  {m.isDefault ? "기본" : "커스텀"} · {m.scheduleSummary ?? "예약 없음"}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.sheetBtns}>
            <Pressable style={styles.sheetBtn} onPress={() => setModeSheetOpen(false)}>
              <Text style={styles.sheetBtnText}>닫기</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function ModeScheduleScreen() {
  const router = useRouter();
  const { modeId } = useLocalSearchParams<{ modeId: string }>();
  const id = Number(modeId);

  // ✅ 서버에서 읽어온 isEnabled (이 화면에서는 토글 UI 없음)
  const [enabled, setEnabled] = useState(true);

  // 시작 시간(기본 23:00)
  const [startAmpm, setStartAmpm] = useState<"AM" | "PM">("PM");
  const [startHour12, setStartHour12] = useState<number>(11);
  const [startMinute, setStartMinute] = useState<number>(0);

  // 종료 시간(기본 23:30)
  const [endEnabled, setEndEnabled] = useState(false);
  const [endAmpm, setEndAmpm] = useState<"AM" | "PM">("PM");
  const [endHour12, setEndHour12] = useState<number>(11);
  const [endMinute, setEndMinute] = useState<number>(30);

  // 시간 선택 바텀시트
  const [timeSheetOpen, setTimeSheetOpen] = useState<null | SheetType>(null);

  const [selectedDays, setSelectedDays] = useState<string[]>(["MON", "TUE", "WED", "THU", "FRI"]);

  const [modes, setModes] = useState<ModeListItem[]>([]);
  const [switchModeId, setSwitchModeId] = useState<number | null>(null);
  const [modeSheetOpen, setModeSheetOpen] = useState(false);

  const repeatDaysLabel = useMemo(() => {
    if (selectedDays.length === 7) return "매일";
    const weekday = ["MON", "TUE", "WED", "THU", "FRI"];
    if (weekday.every((d) => selectedDays.includes(d)) && selectedDays.length === 5) return "평일";
    return selectedDays.map((d) => DAYS.find((x) => x.key === d)?.label ?? d).join(",");
  }, [selectedDays]);

  const repeatDaysKey = useMemo(() => {
    if (selectedDays.length === 7) return "DAILY";

    const weekday = ["MON", "TUE", "WED", "THU", "FRI"];
    if (weekday.every((d) => selectedDays.includes(d)) && selectedDays.length === 5)
      return "WEEKDAY";

    return selectedDays.join(",");
  }, [selectedDays]);

  const toggleDay = (k: string) => {
    setSelectedDays((prev) => (prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]));
  };

  const startLabel = useMemo(
    () => toTimeLabel(startAmpm, startHour12, startMinute),
    [startAmpm, startHour12, startMinute],
  );
  const endLabel = useMemo(
    () => toTimeLabel(endAmpm, endHour12, endMinute),
    [endAmpm, endHour12, endMinute],
  );

  const startTime24 = useMemo(
    () => toTime24(startAmpm, startHour12, startMinute),
    [startAmpm, startHour12, startMinute],
  );
  const endTime24 = useMemo(
    () => toTime24(endAmpm, endHour12, endMinute),
    [endAmpm, endHour12, endMinute],
  );

  const selectedSwitchModeName = useMemo(() => {
    if (!switchModeId) return "선택 안 함";
    return modes.find((m) => m.modeId === switchModeId)?.modeName ?? "선택 안 함";
  }, [switchModeId, modes]);

  const openModePicker = async () => {
    try {
      const ms = await getMyModes();
      setModes(ms ?? []);
      setModeSheetOpen(true);
    } catch (e) {
      console.log("모드 목록 로딩 실패:", e);
      Alert.alert("오류", "모드 목록을 불러오지 못했습니다.");
    }
  };

  const buildPayload = () => {
    return [
      {
        startTime: startTime24,
        endTime: endEnabled ? endTime24 : null,
        endModeId: endEnabled ? (switchModeId ?? null) : null,
        repeatDays: repeatDaysKey,
        isEnabled: enabled, // ✅ mode 화면에서 켜둔 값(서버값) 유지
      },
    ];
  };

  const loadSavedSchedule = useCallback(async () => {
    if (!id || Number.isNaN(id)) return;

    try {
      const detail = await getModeDetail(id);
      const s = detail?.schedules?.find((x) => x.isEnabled) ?? detail?.schedules?.[0];

      if (!s) {
        setEnabled(false);
        setSelectedDays(["MON", "TUE", "WED", "THU", "FRI"]);

        setStartAmpm("PM");
        setStartHour12(11);
        setStartMinute(0);

        setEndEnabled(false);
        setEndAmpm("PM");
        setEndHour12(11);
        setEndMinute(30);

        setSwitchModeId(null);
        return;
      }

      setEnabled(!!s.isEnabled);

      if (s.startTime) {
        applyTime24ToState(s.startTime.slice(0, 5), setStartAmpm, setStartHour12, setStartMinute);
      } else {
        setStartAmpm("PM");
        setStartHour12(11);
        setStartMinute(0);
      }

      setSelectedDays(parseRepeatDaysToSelectedDays(s.repeatDays));

      const endTime = s.endTime ?? null;
      setEndEnabled(Boolean(endTime));
      setSwitchModeId(s.endModeId ?? null);

      if (endTime) {
        applyTime24ToState(endTime.slice(0, 5), setEndAmpm, setEndHour12, setEndMinute);
      } else {
        setEndAmpm("PM");
        setEndHour12(11);
        setEndMinute(30);
      }
    } catch (e) {
      console.log("예약 로드 실패:", e);
    }
  }, [id]);

  useEffect(() => {
    loadSavedSchedule();
  }, [loadSavedSchedule]);

  const onSave = async () => {
    if (!id || Number.isNaN(id)) return;

    if (selectedDays.length === 0) {
      Alert.alert("요일 선택", "요일을 최소 1개 이상 선택해 주세요.");
      return;
    }

    try {
      await setModeSchedules(id, buildPayload());
      Alert.alert("저장 완료", "예약이 저장되었습니다.");
      router.back();
    } catch (e) {
      console.log("예약 저장 실패:", e);
      Alert.alert("오류", "예약 저장에 실패했습니다.");
    }
  };

  const onClear = async () => {
    if (!id || Number.isNaN(id)) return;
    try {
      await clearModeSchedules(id);

      setEnabled(false);
      setSelectedDays(["MON", "TUE", "WED", "THU", "FRI"]);

      setStartAmpm("PM");
      setStartHour12(11);
      setStartMinute(0);

      setEndEnabled(false);
      setEndAmpm("PM");
      setEndHour12(11);
      setEndMinute(30);

      setSwitchModeId(null);

      Alert.alert("해제 완료", "예약이 삭제되었습니다.");
      router.back();
    } catch (e) {
      console.log("예약 삭제 실패:", e);
      Alert.alert("오류", "예약 삭제에 실패했습니다. 네트워크/로그인 상태를 확인해 주세요.");
    }
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={{ fontSize: 22 }}>‹</Text>
          </Pressable>
          <Text style={styles.title}>예약 설정</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* ✅ 여기서 “예약 사용” 카드만 제거함 */}

        <View style={styles.card}>
          <Text style={styles.label}>시작 시간</Text>

          <Pressable style={styles.timeBox} onPress={() => setTimeSheetOpen("START")}>
            <Text style={styles.timeText}>{startLabel}</Text>
            <Text style={styles.timeIcon}>🕒</Text>
          </Pressable>

          <Text style={styles.hint}>눌러서 시간을 선택해 주세요.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>요일</Text>
          <View style={styles.daysWrap}>
            {DAYS.map((d) => {
              const on = selectedDays.includes(d.key);
              return (
                <Pressable
                  key={d.key}
                  onPress={() => toggleDay(d.key)}
                  style={[styles.dayChip, on ? styles.dayOn : styles.dayOff]}
                >
                  <Text style={[styles.dayText, on ? { color: "white" } : { color: "#111" }]}>
                    {d.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.hint}>현재 설정: {repeatDaysLabel}</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>종료 시간 설정</Text>
              <Text style={styles.subHint}>모드 자동 종료</Text>
            </View>

            <Pressable
              onPress={() => setEndEnabled((v) => !v)}
              style={[styles.pill, endEnabled ? styles.pillOn : styles.pillOff]}
            >
              <Text style={styles.pillText}>{endEnabled ? "ON" : "OFF"}</Text>
            </Pressable>
          </View>

          {endEnabled && (
            <>
              <Pressable
                style={[styles.timeBox, { marginTop: 12 }]}
                onPress={() => setTimeSheetOpen("END")}
              >
                <Text style={styles.timeText}>{endLabel}</Text>
                <Text style={styles.timeIcon}>🕒</Text>
              </Pressable>

              <Text style={styles.hint}>종료 시간: {endTime24}</Text>
            </>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>종료 시 전환 모드</Text>
          <Pressable style={[styles.timeBox, { marginTop: 10 }]} onPress={openModePicker}>
            <Text style={[styles.timeText, { fontSize: 16 }]}>{selectedSwitchModeName}</Text>
            <Text style={styles.timeIcon}>›</Text>
          </Pressable>
          <Text style={styles.hint}>
            {endEnabled
              ? switchModeId
                ? "종료 후 선택한 모드로 전환됩니다."
                : "종료 후 기본 모드(귀가)로 전환됩니다."
              : "종료 시간 OFF 상태입니다."}
          </Text>
        </View>

        <Pressable style={[styles.primaryBtn, { marginTop: 16 }]} onPress={onSave}>
          <Text style={styles.primaryBtnText}>저장</Text>
        </Pressable>

        <Pressable style={[styles.secondaryBtn, { marginTop: 10 }]} onPress={onClear}>
          <Text style={styles.secondaryBtnText}>예약 해제(삭제)</Text>
        </Pressable>

        <TimeSheetModal
          type="START"
          timeSheetOpen={timeSheetOpen}
          setTimeSheetOpen={setTimeSheetOpen}
          startAmpm={startAmpm}
          startHour12={startHour12}
          startMinute={startMinute}
          endAmpm={endAmpm}
          endHour12={endHour12}
          endMinute={endMinute}
          setStartAmpm={setStartAmpm}
          setStartHour12={setStartHour12}
          setStartMinute={setStartMinute}
          setEndAmpm={setEndAmpm}
          setEndHour12={setEndHour12}
          setEndMinute={setEndMinute}
        />

        <TimeSheetModal
          type="END"
          timeSheetOpen={timeSheetOpen}
          setTimeSheetOpen={setTimeSheetOpen}
          startAmpm={startAmpm}
          startHour12={startHour12}
          startMinute={startMinute}
          endAmpm={endAmpm}
          endHour12={endHour12}
          endMinute={endMinute}
          setStartAmpm={setStartAmpm}
          setStartHour12={setStartHour12}
          setStartMinute={setStartMinute}
          setEndAmpm={setEndAmpm}
          setEndHour12={setEndHour12}
          setEndMinute={setEndMinute}
        />

        <ModePickerModal
          modeSheetOpen={modeSheetOpen}
          setModeSheetOpen={setModeSheetOpen}
          modes={modes}
          setSwitchModeId={setSwitchModeId}
        />
      </ScrollView>
    </>
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
  rowBetween: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },

  label: { fontWeight: "900", fontSize: 15 },
  subHint: { marginTop: 4, color: "#64748B", fontWeight: "800" },
  hint: { marginTop: 8, color: "#666", fontWeight: "700" },

  pill: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 999 },
  pillOn: { backgroundColor: "#2563EB" },
  pillOff: { backgroundColor: "#CBD5E1" },
  pillText: { color: "white", fontWeight: "900" },

  timeBox: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  timeText: { fontWeight: "900", fontSize: 18, color: "#111" },
  timeIcon: { fontSize: 18, color: "#111" },

  daysWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 12 },
  dayChip: { paddingVertical: 10, paddingHorizontal: 12, borderRadius: 999 },
  dayOn: { backgroundColor: "#2563EB" },
  dayOff: { backgroundColor: "#F1F5F9" },
  dayText: { fontWeight: "900" },

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

  // 바텀시트
  modalRoot: { flex: 1, justifyContent: "flex-end" },
  sheetOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    backgroundColor: "white",
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 14,
    paddingBottom: 18,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  sheetTitle: { fontSize: 16, fontWeight: "900" },
  sheetClose: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 999,
    backgroundColor: "#F1F5F9",
  },

  sheetSectionTitle: { marginTop: 10, fontWeight: "900", color: "#111" },
  chipRow: { flexDirection: "row", gap: 8, paddingVertical: 10 },

  chip: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  chipOn: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  chipOff: { backgroundColor: "#F1F5F9", borderColor: "#E2E8F0" },
  chipText: { fontWeight: "900" },

  previewText: { marginTop: 8, color: "#64748B", fontWeight: "800" },

  sheetBtns: { flexDirection: "row", gap: 10, marginTop: 10 },
  sheetBtn: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  sheetBtnText: { fontWeight: "900" },
  sheetBtnPrimary: {
    flex: 1,
    backgroundColor: "#2563EB",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  sheetBtnPrimaryText: { fontWeight: "900", color: "white" },

  // 모드 선택 리스트
  modeRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modeRowText: { fontWeight: "900", fontSize: 15, color: "#111" },
  modeRowSub: { marginTop: 4, color: "#64748B", fontWeight: "700" },
});
