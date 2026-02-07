import { useRouter } from "expo-router";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

/**
 * 홈 탭 화면
 * - 방 목록 역할
 * - MVP에서는 "거실" 카드 1개만 제공
 * - 거실을 누르면 /room/1 로 이동 (상세 화면)
 */
export default function HomeTab() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* 화면 제목 */}
      <Text style={styles.title}>내 집</Text>

      {/* 방 카드 (거실) */}
      <Pressable style={styles.card} onPress={() => router.push("/(tabs)/room")}>
        <Text style={styles.roomName}>거실</Text>
        <Text style={styles.roomDesc}>LED / 에어컨 제어</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F6F7FB",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
  },
  roomName: {
    fontSize: 18,
    fontWeight: "700",
  },
  roomDesc: {
    marginTop: 6,
    color: "#666",
  },
});
