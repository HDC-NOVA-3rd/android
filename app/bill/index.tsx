import { billService } from "@/api/service/billService";
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function BillListScreen() {
  const router = useRouter();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBills();
  }, []);

  const loadBills = async () => {
    try {
      const data = await billService.getBills(0, 20);
      setBills(data.content);
    } catch (error) {
      console.error("고지서 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.billItem}
      onPress={() => item?.billId && router.push(`/bill/${item.billId}`)}
    >
      <View style={styles.billInfo}>
        <Text style={styles.billMonth}>{item?.billMonth}분 관리비</Text>
        <Text style={styles.billAmount}>
          {(item?.totalPrice || 0).toLocaleString()}원
        </Text>
      </View>
      <Feather name="chevron-right" size={20} color="#9ca3af" />
    </TouchableOpacity>
  );

  if (loading) return <ActivityIndicator style={{ flex: 1 }} />;

  return (
    <View style={styles.container}>
      <FlatList
        data={bills}
        keyExtractor={(item) => item?.billId?.toString() || Math.random().toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={styles.emptyText}>고지서 내역이 없습니다.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f9fafb" },
  listContent: { padding: 16 },
  billItem: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  billInfo: { flex: 1 },
  billMonth: { fontSize: 16, fontWeight: "600", color: "#111827" },
  billAmount: { fontSize: 14, color: "#4b5563", marginTop: 4 },
  emptyText: { textAlign: "center", marginTop: 40, color: "#9ca3af" }
});