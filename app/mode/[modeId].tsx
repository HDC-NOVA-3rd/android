// app/mode/[modeId].tsx
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { executeMode, getModeDetail } from "@/api/service/modeService";
import type { ModeActionItem, ModeDetail } from "../../app/types/mode";

function actionToText(a: ModeActionItem) {
  if (a.command === "POWER") return `${a.deviceName} ${a.value === "ON" ? "ON" : "OFF"}`;
  if (a.command === "BRIGHTNESS") return `${a.deviceName} 밝기 ${a.value}%`;
  if (a.command === "SET_TEMP") return `${a.deviceName} 희망 온도 ${a.value}°C`;
  return `${a.deviceName} ${a.command} ${a.value}`;
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

  const scheduleSummary = useMemo(() => {
    if (!mode) return "예약 안 됨";
    if (!mode.schedules || mode.schedules.length === 0) return "예약 안 됨";

    const enabled = mode.schedules.find((s) => s.enabled);
    if (!enabled) return "예약 꺼짐";

    const time = enabled.startTime ? enabled.startTime.slice(0, 5) : "--:--";
    const days = enabled.repeatDays ?? "설정됨";
    return `${days} ${time}`;
  }, [mode]);

  const isScheduleEnabled = useMemo(() => {
    if (!mode?.schedules?.length) return false;
    return mode.schedules.some((s) => s.enabled);
  }, [mode]);

  const load = useCallback(async () => {
    if (!id || Number.isNaN(id)) return;

    setLoading(true);
    try {
      const d = await getModeDetail(id);
      setMode(d);
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
      // 화면 들어올 때 편집모드 꺼두기(원하면 제거)
      setIsEditing(false);
    }, [load]),
  );

  const onPressExecute = async () => {
    if (!id) return;

    try {
      setExecuting(true);
      const res = await executeMode(id);
      Alert.alert("실행 완료", `status: ${res?.status ?? "OK"}`);
      await load();
    } catch (e) {
      console.log("모드 실행 실패:", e);
      Alert.alert("오류", "모드를 실행하지 못했습니다.");
    } finally {
      setExecuting(false);
    }
  };

  // ✅ (UI만) 동작 삭제: 지금은 서버 삭제 API가 없으니 화면에서만 제거
  const removeActionUIOnly = (sortOrder: number) => {
    if (!mode) return;
    Alert.alert("삭제", "이 동작을 삭제할까요? (현재는 화면에서만 제거돼요)", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: () => {
          setMode({
            ...mode,
            actions: mode.actions.filter((a) => a.sortOrder !== sortOrder),
          });
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        {/* ✅ 헤더 숨김 */}
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

        <Text style={{ fontWeight: "900" }}>모드가 없습니다.</Text>
        <Pressable style={styles.primaryBtn} onPress={() => router.back()}>
          <Text style={styles.primaryBtnText}>뒤로가기</Text>
        </Pressable>
      </View>
    );
  }

  const canEdit = mode.isEditable && !mode.isDefault; // 서버 정의에 맞춰 조절 가능

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      {/* ✅ 헤더 숨김 */}
      <Stack.Screen options={{ headerShown: false }} />

      {/* 헤더 */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 22 }}>‹</Text>
        </Pressable>

        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Text style={styles.title}>{mode.modeName}</Text>

            {/* ✅ 기본 모드 뱃지 */}
            {mode.isDefault ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>기본</Text>
              </View>
            ) : null}
          </View>

          <Text style={styles.subTitle}>{scheduleSummary}</Text>
        </View>

        {/* ✅ 편집 버튼: 토글 */}
        <Pressable
          style={[styles.editBtn, !canEdit && { opacity: 0.5 }]}
          onPress={() => {
            if (!canEdit) {
              Alert.alert("안내", "기본 모드는 편집할 수 없어요.");
              return;
            }
            setIsEditing((v) => !v);
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
            <Text style={styles.cardSub}>설정하기</Text>
          </View>

          <Pressable
            onPress={() =>
              router.push({
                pathname: "/mode/[modeId]/schedule" as any,
                params: { modeId: String(mode.modeId) },
              })
            }
            style={[styles.pill, isScheduleEnabled ? styles.pillOn : styles.pillOff]}
          >
            <Text style={styles.pillText}>{isScheduleEnabled ? "ON" : "OFF"}</Text>
          </Pressable>
        </View>
      </View>

      {/* 실행 동작 */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>실행 동작</Text>

        {/* ✅ 편집모드일 때만 동작 추가 버튼 노출(지금은 UI만) */}
        {isEditing ? (
          <Pressable
            style={styles.addActionBtn}
            onPress={() => Alert.alert("안내", "동작 추가 UI/API는 다음 단계에서 연결하자!")}
          >
            <Text style={styles.addActionBtnText}>＋ 동작 추가</Text>
          </Pressable>
        ) : null}
      </View>

      {mode.actions?.length ? (
        mode.actions
          .slice()
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((a) => (
            <View key={`${a.deviceId}-${a.sortOrder}`} style={styles.actionItem}>
              <View style={styles.circle}>
                <Text style={styles.circleText}>{a.sortOrder}</Text>
              </View>

              <Text style={styles.actionText}>{actionToText(a)}</Text>

              {/* ✅ 편집모드일 때만 삭제 버튼 */}
              {isEditing ? (
                <Pressable onPress={() => removeActionUIOnly(a.sortOrder)} style={styles.trashBtn}>
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
