// app/homesettings.tsx
import { Stack, useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from "react-native";

import { getMyRooms, updateRoomVisibility, type RoomItem } from "@/api/service/homeEnvironmentApi";
import { deleteMode, getMyModesAll, updateModeVisibility } from "@/api/service/modeService";
import type { ModeListItem } from "@/app/types/mode";

export default function HomeSettingsScreen() {
  const router = useRouter();
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [modes, setModes] = useState<ModeListItem[]>([]);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const [r, m] = await Promise.all([getMyRooms(), getMyModesAll()]);
    setRooms(r ?? []);
    setModes(m ?? []);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load().catch(console.log);
    }, [load]),
  );

  const toggleRoom = async (roomId: number, nextVisible: boolean) => {
    try {
      setSaving(true);
      await updateRoomVisibility(roomId, nextVisible);
      await load(); // 서버값 다시 가져오기
    } catch (e) {
      console.log(e);
      Alert.alert("오류", "방 설정 변경에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const toggleMode = async (modeId: number, nextVisible: boolean) => {
    try {
      setSaving(true);
      await updateModeVisibility(modeId, nextVisible);
      // 서버 저장 후 다시 로드(홈에서도 바로 반영되게)
      await load();
    } catch (e) {
      console.log(e);
      Alert.alert("오류", "모드 설정 변경에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const onDeleteMode = async (modeId: number) => {
    Alert.alert("모드 삭제", "정말 삭제할까요?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            setSaving(true);
            await deleteMode(modeId); // ✅ DELETE /mode/{modeId}
            await load(); // ✅ 다시 로드해서 목록 갱신
          } catch (e) {
            console.log(e);
            Alert.alert("오류", "모드 삭제에 실패했습니다.");
          } finally {
            setSaving(false);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* ✅ 상단 “내정보 카드” 없음. 헤더만 */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={{ fontSize: 22 }}>‹</Text>
        </Pressable>
        <Text style={styles.title}>설정</Text>
        <View style={{ width: 36 }} />
      </View>

      <Text style={styles.sectionTitle}>홈 화면 설정</Text>
      <Text style={styles.sectionSub}>표시할 방/모드를 선택할 수 있습니다.</Text>

      {/* 방 토글 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>방</Text>

        {rooms.map((r) => (
          <View key={r.roomId} style={styles.row}>
            <Text style={styles.rowText}>{r.roomName}</Text>
            <Switch
              disabled={saving}
              value={r.isVisible}
              onValueChange={(v) => toggleRoom(r.roomId, v)}
            />
          </View>
        ))}
      </View>

      {/* 모드 토글 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>모드</Text>

        {modes.map((m) => (
          <View key={m.modeId} style={styles.row}>
            <Text style={styles.rowText}>{m.modeName}</Text>

            <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
              {/* ✅ 커스텀만 삭제 버튼 */}
              {!m.isDefault && (
                <Pressable
                  disabled={saving || m.isDefault}
                  onPress={() => onDeleteMode(m.modeId)}
                  style={styles.deleteBtn}
                >
                  <Text style={styles.deleteBtnText}>삭제</Text>
                </Pressable>
              )}

              <Switch
                disabled={saving}
                value={m.isVisible}
                onValueChange={(v) => toggleMode(m.modeId, v)}
              />
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#F6F7FB" },
  container: { padding: 14, paddingTop: 18, paddingBottom: 24 },

  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backBtn: { width: 36, height: 36, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 18, fontWeight: "900" },

  sectionTitle: { marginTop: 12, fontSize: 16, fontWeight: "900" },
  sectionSub: { marginTop: 6, color: "#64748B", fontWeight: "700" },

  card: { marginTop: 12, backgroundColor: "white", borderRadius: 16, padding: 14 },
  cardTitle: { fontWeight: "900", fontSize: 15, marginBottom: 10 },

  row: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  rowText: { fontWeight: "800", color: "#111" },
  deleteBtn: {
    backgroundColor: "#FEE2E2",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  deleteBtnText: {
    color: "#B91C1C",
    fontWeight: "900",
  },
});
