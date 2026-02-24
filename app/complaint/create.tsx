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
import { createStyles as styles } from "@/styles/complaint-create.styles";

// 백엔드 Enum과 동일한 값 정의
const COMPLAINT_TYPES = [
  { label: "소음", value: "NOISE" },
  { label: "생활", value: "LIVING" },
  { label: "주차", value: "PARKING" },
  { label: "시설", value: "MAINTENANCE" },
  { label: "행정", value: "ADMIN" },
  { label: "기타", value: "OTHER" },
];

export default function ComplaintCreateScreen() {
  const router = useRouter();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState("LIVING"); // 기본값 설정
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      Alert.alert("알림", "제목과 내용을 모두 입력해주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      await createComplaint(title, content, type); 
      
      Alert.alert("성공", "민원이 정상적으로 등록되었습니다.", [
        { text: "확인", onPress: () => router.replace("/(tabs)/complaint") },
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
      <View style={styles.detailHeader}>
        <TouchableOpacity onPress={() => router.back()} disabled={isSubmitting}>
          <Feather name="x" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.detailHeaderTitle}>민원 신청</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* 민원 유형 선택 */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>민원 유형</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {COMPLAINT_TYPES.map((item) => (
              <TouchableOpacity
                key={item.value}
                style={[
                  { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#e5e7eb' },
                  type === item.value && { backgroundColor: '#2563eb', borderColor: '#2563eb' }
                ]}
                onPress={() => setType(item.value)}
              >
                <Text style={[{ color: '#4b5563' }, type === item.value && { color: '#fff', fontWeight: 'bold' }]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

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
            placeholder="민원 내용을 상세히 작성해주세요."
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
          {isSubmitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>민원 등록하기</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}