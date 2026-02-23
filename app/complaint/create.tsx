import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { createComplaint } from "@/api/service/complaintService";
import { styles } from "@/styles/complaint.styles";

export default function ComplaintCreateScreen() {
  const router = useRouter();
  
  // 입력 상태 관리
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 등록 핸들러
  const handleSubmit = async () => {
    // 유효성 검사
    if (!title.trim() || !content.trim()) {
      Alert.alert("알림", "제목과 내용을 모두 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      
      // 백엔드 API 호출 (@PostMapping)
      await createComplaint(title, content);
      
      Alert.alert("성공", "민원이 정상적으로 등록되었습니다.", [
        {
          text: "확인",
          onPress: () => {
            // 등록 성공 시 목록으로 이동하며 화면 스택 정리
            router.replace("/(tabs)/complaint");
          },
        },
      ]);
    } catch (error) {
      console.error("민원 등록 실패:", error);
      Alert.alert("에러", "민원 등록 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* 헤더 */}
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={() => router.back()} disabled={isSubmitting}>
          <Feather name="x" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.detailHeaderTitle}>민원 신청</Text>
        <View style={{ width: 24 }} /> {/* 좌우 밸런스용 */}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>제목</Text>
          <TextInput
            style={styles.input}
            placeholder="민원 제목을 입력하세요"
            value={title}
            onChangeText={setTitle}
            maxLength={100}
            editable={!isSubmitting}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>내용</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="관리소에 전달할 민원 내용을 상세히 작성해주세요."
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={10}
            textAlignVertical="top"
            editable={!isSubmitting}
          />
        </View>

        <TouchableOpacity
          style={[styles.submitButton, isSubmitting && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>민원 등록하기</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}