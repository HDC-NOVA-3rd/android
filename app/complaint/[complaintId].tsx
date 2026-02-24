import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ComplaintDetail, deleteComplaint, getComplaintDetail } from "@/api/service/complaintService";
import { styles } from "@/styles/complaint.styles";

export default function ComplaintDetailScreen() {
  const router = useRouter();
  const { complaintId } = useLocalSearchParams<{ complaintId: string }>();
  
  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const STATUS_MAP = {
    RECEIVED: { label: "접수", color: "#6b7280" },
    ASSIGNED: { label: "담당자 배정", color: "#3b82f6" },
    IN_PROGRESS: { label: "처리 중", color: "#f59e0b" },
    COMPLETED: { label: "완료", color: "#10b981" },
  };

  // 데이터 가져오기
  const fetchDetail = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getComplaintDetail(Number(complaintId));
      setComplaint(data);
    } catch (error) {
      console.error("민원 상세 조회 실패:", error);
      Alert.alert("에러", "데이터를 불러올 수 없습니다.");
      router.back();
    } finally {
      setLoading(false);
    }
  }, [complaintId]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  // 민원 삭제 핸들러
  const handleDelete = () => {
    Alert.alert("민원 삭제", "정말로 이 민원을 삭제하시겠습니까?", [
      { text: "취소", style: "cancel" },
      {
        text: "삭제",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteComplaint(Number(complaintId));
            Alert.alert("알림", "민원이 삭제되었습니다.");
            router.replace("/(tabs)/complaint"); // 목록으로 돌아가기
          } catch (error) {
            Alert.alert("실패", "삭제 중 오류가 발생했습니다.");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </View>
    );
  }

  if (!complaint) return null;

  return (
    <SafeAreaView style={styles.detailContainer} edges={["top"]}>
      {/* 헤더 */}
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.detailHeaderTitle}>민원 상세 정보</Text>
        <TouchableOpacity onPress={handleDelete}>
          <Feather name="trash-2" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={styles.detailContent}>
          {/* 상태 배지 */}
            <View style={[styles.statusBadge, { backgroundColor: STATUS_MAP[complaint.status]?.color || "#eee" }]}>
              <Text style={styles.statusText}>
                {STATUS_MAP[complaint.status]?.label || complaint.status}
              </Text>
            </View>

          <Text style={styles.detailTitle}>{complaint.title}</Text>
          
          <View style={styles.detailMeta}>
            <Text style={styles.detailDate}>
              작성일: {complaint.createdAt.replace('T', ' ').slice(0, 16)}
            </Text>
          </View>

        <View style={styles.divider} />

          <Text style={styles.detailBody}>{complaint.content}</Text>

            {complaint.answer ? (
              <View style={styles.answerSection}>
                <View style={styles.answerHeader}>
                  <Feather name="message-circle" size={18} color="#2563eb" />
                  <Text style={styles.answerTitle}>
                    {complaint.status === "COMPLETED" ? "최종 답변" : "관리자 안내"} 
                    {complaint.adminName ? ` (${complaint.adminName})` : ""}
                  </Text>
                </View>
                <Text style={styles.answerBody}>
                  {complaint.answer.resultContent}
                </Text>
                <Text style={{ fontSize: 12, color: '#9ca3af', marginTop: 8 }}>
                  작성일: {complaint.answer.createdAt.replace('T', ' ').slice(0, 16)}
                </Text>
              </View>
            ) : (
              /* 답변이 없을 때 보여줄 안내 (선택 사항) */
              complaint.status !== "RECEIVED" && (
                <View style={{ padding: 16, alignItems: 'center' }}>
                  <Text style={{ color: '#9ca3af', fontSize: 14 }}>담당자가 민원을 확인 중입니다.</Text>
                </View>
              )
            )}

        </View>

          {complaint.status === "RECEIVED" && (
            <TouchableOpacity 
              style={styles.editButton}
              onPress={() => router.push(`/complaint/edit/${complaintId}`)}
            >
              <Text style={styles.editButtonText}>민원 수정하기</Text>
            </TouchableOpacity>
          )}
      </ScrollView>
    </SafeAreaView>
  );
}