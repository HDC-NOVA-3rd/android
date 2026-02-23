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
import { styles } from "@/styles/complaint.styles"; // 기존 스타일 활용

export default function ComplaintDetailScreen() {
  const router = useRouter();
  const { complaintId } = useLocalSearchParams<{ complaintId: string }>();
  
  const [complaint, setComplaint] = useState<ComplaintDetail | null>(null);
  const [loading, setLoading] = useState(true);

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
          <View style={[styles.statusBadge, { alignSelf: 'flex-start', marginBottom: 12 }]}>
            <Text style={styles.statusText}>{complaint.status}</Text>
          </View>

          <Text style={styles.detailTitle}>{complaint.title}</Text>
          
          <View style={styles.detailMeta}>
            <Text style={styles.detailDate}>
              작성일: {complaint.createdAt.replace('T', ' ').slice(0, 16)}
            </Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.detailBody}>{complaint.content}</Text>

          {/* 관리자 답변 영역 (백엔드 DTO에 답변 필드가 있다고 가정) */}
          {complaint.status === "COMPLETED" && (
            <View style={styles.answerSection}>
              <View style={styles.answerHeader}>
                <Feather name="message-circle" size={18} color="#0a7ea4" />
                <Text style={styles.answerTitle}>관리자 답변</Text>
              </View>
              <Text style={styles.answerBody}>
                {complaint.answer || "처리가 완료되었습니다. 이용해 주셔서 감사합니다."}
              </Text>
            </View>
          )}
        </View>

        {/* 수정 버튼 (필요 시) */}
        {complaint.status === "PENDING" && (
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