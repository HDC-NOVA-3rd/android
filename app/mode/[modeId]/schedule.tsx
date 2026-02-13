// app/mode/[modeId]/schedule.tsx

import { Picker } from "@react-native-picker/picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { clearModeSchedules, getMyModes, setModeSchedules } from "@/api/service/modeService";
import type { ModeListItem } from "../../types/mode";

const DAYS = [
  { key: "MON", label: "월" },
  { key: "TUE", label: "화" },
  { key: "WED", label: "수" },
  { key: "THU", label: "목" },
  { key: "FRI", label: "금" },
  { key: "SAT", label: "토" },
  { key: "SUN", label: "일" },
];

const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5); // 0,5,...55
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

export default function ModeScheduleScreen() {
  const router = useRouter();
  const { modeId } = useLocalSearchParams<{ modeId: string }>();
  const id = Number(modeId);

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

  const [timeSheetOpen, setTimeSheetOpen] = useState<null | "START" | "END">(null);

  const [selectedDays, setSelectedDays] = useState<string[]>(["MON", "TUE", "WED", "THU", "FRI"]);

  // 종료 시 전환 모드
  const [modes, setModes] = useState<ModeListItem[]>([]);
  const [switchModeId, setSwitchModeId] = useState<number | null>(null);
  const [modeSheetOpen, setModeSheetOpen] = useState(false);

  const repeatDaysLabel = useMemo(() => {
    if (selectedDays.length === 7) return "매일";
    const weekday = ["MON", "TUE", "WED", "THU", "FRI"];
    if (weekday.every((d) => selectedDays.includes(d)) && selectedDays.length === 5) return "평일";
    return selectedDays.map((d) => DAYS.find((x) => x.key === d)?.label ?? d).join(",");
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
      // 모드 목록 로드(전환 모드 선택용)
      const ms = await getMyModes();
      setModes(ms ?? []);
      setModeSheetOpen(true);
    } catch (e) {
      console.log("모드 목록 로딩 실패:", e);
      Alert.alert("오류", "모드 목록을 불러오지 못했어.");
    }
  };

  const onSave = async () => {
    if (!id) return;

    if (selectedDays.length === 0) {
      Alert.alert("요일 선택", "요일을 최소 1개 이상 선택해줘.");
      return;
    }

    try {
      // ✅ 서버 저장은 현재 스키마상 startTime만
      await setModeSchedules(id, [
        {
          startTime: startTime24,
          repeatDays: repeatDaysLabel,
          enabled,
        },
      ]);

      // ⚠️ 종료/전환은 UI만 반영 (백엔드 확장 필요)
      if (endEnabled || switchModeId) {
        Alert.alert(
          "저장 완료",
          "시작 시간 예약은 저장됐어.\n(종료 시간/전환 모드는 현재 백엔드 API 확장 전이라 UI만 반영돼.)",
        );
      } else {
        Alert.alert("저장 완료", "예약이 저장됐어.");
      }

      router.back();
    } catch (e) {
      console.log("예약 저장 실패:", e);
      Alert.alert("오류", "예약 저장에 실패했어. API 경로/토큰 확인해줘.");
    }
  };

  const onClear = async () => {
    if (!id) return;
    try {
      await clearModeSchedules(id);
      Alert.alert("해제 완료", "예약이 삭제됐어.");
      router.back();
    } catch (e) {
      console.log("예약 삭제 실패:", e);
      Alert.alert("오류", "예약 삭제에 실패했어. API 경로 확인해줘.");
    }
  };

  // ✅ iOS에서 Picker 글자 안 보임 방지용
  const pickerItemStyle = Platform.select({
    ios: { fontSize: 18, fontWeight: "800", color: "#111" as const },
    android: { fontSize: 16, fontWeight: "800", color: "#111" as const },
    default: { fontSize: 18, fontWeight: "800", color: "#111" as const },
  });

  const renderTimeSheet = (type: "START" | "END") => {
    const isStart = type === "START";

    const a = isStart ? startAmpm : endAmpm;
    const h = isStart ? startHour12 : endHour12;
    const m = isStart ? startMinute : endMinute;

    const setA = isStart ? setStartAmpm : setEndAmpm;
    const setH = isStart ? setStartHour12 : setEndHour12;
    const setM = isStart ? setStartMinute : setEndMinute;

    const label = isStart ? "시작 시간" : "종료 시간";

    return (
      <Modal
        visible={timeSheetOpen === type}
        transparent
        animationType="slide"
        onRequestClose={() => setTimeSheetOpen(null)}
      >
        {/* ✅ 아래로 붙이기 위한 래퍼 */}
        <View style={styles.modalRoot}>
          <Pressable style={styles.sheetOverlay} onPress={() => setTimeSheetOpen(null)} />

          <View style={styles.sheet}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label} 선택</Text>
              <Pressable onPress={() => setTimeSheetOpen(null)} style={styles.sheetClose}>
                <Text style={{ fontSize: 18, fontWeight: "900" }}>✕</Text>
              </Pressable>
            </View>

            <View style={styles.pickerRow}>
              {/* ✅ AM/PM : Picker<"AM"|"PM"> */}
              <View style={styles.pickerCol}>
                <Picker<"AM" | "PM">
                  style={styles.picker}
                  selectedValue={a}
                  onValueChange={(v) => setA(v)}
                  itemStyle={pickerItemStyle}
                >
                  <Picker.Item label="오전" value="AM" />
                  <Picker.Item label="오후" value="PM" />
                </Picker>
              </View>

              {/* ✅ HOUR : Picker<number> */}
              <View style={styles.pickerCol}>
                <Picker<number>
                  style={styles.picker}
                  selectedValue={h}
                  onValueChange={(v) => setH(v)}
                  itemStyle={pickerItemStyle}
                >
                  {HOURS_12.map((x) => (
                    <Picker.Item key={x} label={String(x).padStart(2, "0")} value={x} />
                  ))}
                </Picker>
              </View>

              {/* ✅ MINUTE : Picker<number> */}
              <View style={styles.pickerCol}>
                <Picker<number>
                  style={styles.picker}
                  selectedValue={m}
                  onValueChange={(v) => setM(v)}
                  itemStyle={pickerItemStyle}
                >
                  {MINUTES.map((x) => (
                    <Picker.Item key={x} label={String(x).padStart(2, "0")} value={x} />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.sheetBtns}>
              <Pressable style={styles.sheetBtn} onPress={() => setTimeSheetOpen(null)}>
                <Text style={styles.sheetBtnText}>취소</Text>
              </Pressable>
              <Pressable
                style={[styles.sheetBtn, styles.sheetBtnPrimary]}
                onPress={() => setTimeSheetOpen(null)}
              >
                <Text style={[styles.sheetBtnText, { color: "white" }]}>확인</Text>
              </Pressable>
            </View>

            <Text style={[styles.hint, { marginTop: 10, textAlign: "center" }]}>
              선택됨: {toTimeLabel(a, h, m)} (서버 전송: {toTime24(a, h, m)})
            </Text>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 22 }}>‹</Text>
        </Pressable>
        <Text style={styles.title}>예약 설정</Text>
        <View style={{ width: 36 }} />
      </View>

      {/* 예약 사용 */}
      <View style={styles.card}>
        <View style={styles.rowBetween}>
          <Text style={styles.label}>예약 사용</Text>
          <Pressable
            onPress={() => setEnabled((v) => !v)}
            style={[styles.pill, enabled ? styles.pillOn : styles.pillOff]}
          >
            <Text style={styles.pillText}>{enabled ? "ON" : "OFF"}</Text>
          </Pressable>
        </View>
      </View>

      {/* 시작 시간 */}
      <View style={styles.card}>
        <Text style={styles.label}>시작 시간</Text>

        <Pressable style={styles.timeBox} onPress={() => setTimeSheetOpen("START")}>
          <Text style={styles.timeText}>{startLabel}</Text>
          <Text style={styles.timeIcon}>🕒</Text>
        </Pressable>

        <Text style={styles.hint}>눌러서 시간을 선택해줘</Text>
      </View>

      {/* 요일 */}
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
        <Text style={styles.hint}>현재: {repeatDaysLabel}</Text>
      </View>

      {/* ✅ 종료 시간 설정 */}
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

      {/* ✅ 종료 시 전환 모드 */}
      <View style={styles.card}>
        <Text style={styles.label}>종료 시 전환 모드</Text>

        <Pressable style={[styles.timeBox, { marginTop: 10 }]} onPress={openModePicker}>
          <Text style={[styles.timeText, { fontSize: 16 }]}>{selectedSwitchModeName}</Text>
          <Text style={styles.timeIcon}>›</Text>
        </Pressable>

        <Text style={styles.hint}>종료 후 자동으로 바꿀 모드를 선택할 수 있어</Text>
      </View>

      <Pressable style={[styles.primaryBtn, { marginTop: 16 }]} onPress={onSave}>
        <Text style={styles.primaryBtnText}>저장</Text>
      </Pressable>

      <Pressable style={[styles.secondaryBtn, { marginTop: 10 }]} onPress={onClear}>
        <Text style={styles.secondaryBtnText}>예약 해제(삭제)</Text>
      </Pressable>

      {/* 시작/종료 시간 시트 */}
      {renderTimeSheet("START")}
      {renderTimeSheet("END")}

      {/* 전환 모드 선택 시트 */}
      <Modal
        visible={modeSheetOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setModeSheetOpen(false)}
      >
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
            <Pressable
              style={[styles.sheetBtn, { flex: 1 }]}
              onPress={() => setModeSheetOpen(false)}
            >
              <Text style={styles.sheetBtnText}>닫기</Text>
            </Pressable>
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
  sheetOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)" },
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

  pickerRow: { flexDirection: "row", gap: 8, marginTop: 6 },
  pickerCol: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    overflow: "hidden",
    height: 200, // ✅ iOS에서 글자/휠 높이 확보
  },
  picker: {
    height: 200, // ✅ 중요: iOS에서 안 보이는 문제 방지
    width: "100%",
  },

  sheetBtns: { flexDirection: "row", gap: 10, marginTop: 10 },
  sheetBtn: {
    flex: 1,
    backgroundColor: "#F1F5F9",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  sheetBtnPrimary: { backgroundColor: "#2563EB" },
  sheetBtnText: { fontWeight: "900" },

  // 모드 선택 리스트
  modeRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  modeRowText: { fontWeight: "900", fontSize: 15, color: "#111" },
  modeRowSub: { marginTop: 4, color: "#64748B", fontWeight: "700" },
});
