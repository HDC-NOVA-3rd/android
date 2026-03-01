import { billService } from "@/api/service/billService";
import { Button } from "@/components/ui/button"; // 프로젝트 공통 버튼
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";

export default function BillDetailScreen() {
  const { billId } = useLocalSearchParams();
  const [detail, setDetail] = useState<any>(null);

  useEffect(() => {
    if (billId) fetchDetail();
  }, [billId]);

  const fetchDetail = async () => {
    try {
      const data = await billService.getBillDetail(Number(billId));
      setDetail(data);
    } catch (error) {
      Alert.alert("오류", "상세 내역을 불러오지 못했습니다.");
    }
  };

  const handleDownloadPdf = async () => {
    if (!detail || !detail.billId) return; 
    try {
      await billService.downloadBillPdf(detail.billId, detail.billMonth); 
    } catch (error) {
      Alert.alert("다운로드 실패", "PDF 파일을 저장할 수 없습니다.");
    }
  };

  if (!detail) return <View style={styles.centered}><Text>불러오는 중...</Text></View>;

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <CardHeader>
          <CardTitle>{detail.billMonth} 상세 내역</CardTitle>
        </CardHeader>
        <CardContent>
          <View style={styles.row}>
            <Text style={{fontWeight: 'bold'}}>아파트</Text>
            <Text>{detail?.apartmentName} {detail?.dongName}동 {detail?.hoName}호</Text>
          </View>

          {/* 서버에서 온 상세 항목들(items)을 반복문으로 표시 */}
          {detail?.items?.map((item: any, index: number) => (
            <View style={styles.row} key={index}>
              <Text>{item.itemName}</Text>
              <Text>{item.price.toLocaleString()}원</Text>
            </View>
          ))}

          <View style={[styles.row, styles.totalRow]}>
            <Text style={styles.totalLabel}>총 합계</Text>
            {/* totalAmount -> totalPrice */}
            <Text style={styles.totalValue}>
              {(detail?.totalPrice || 0).toLocaleString()}원
            </Text>
          </View>
          
          <Button 
            style={{ marginTop: 20 }} 
            onPress={() => detail?.billId && handleDownloadPdf()}
          >
            <Text style={{ color: "white" }}>PDF 고지서 다운로드</Text>
          </Button>
        </CardContent>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f9fafb" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  card: { marginBottom: 20 },
  row: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: "#e5e7eb" },
  totalRow: { borderBottomWidth: 0, marginTop: 10, paddingTop: 15 },
  totalLabel: { fontSize: 18, fontWeight: "bold" },
  totalValue: { fontSize: 18, fontWeight: "bold", color: "#2563eb" }
});