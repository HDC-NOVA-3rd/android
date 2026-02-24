import { getComplaintDetail, updateComplaint } from "@/api/service/complaintService";
import { styles } from "@/styles/complaint.styles";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert, Text, TextInput, TouchableOpacity, View } from "react-native";

export default function ComplaintEditScreen() {
  const router = useRouter();
  const { complaintId } = useLocalSearchParams<{ complaintId: string }>();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [type, setType] = useState(""); // 백엔드 Enum 타입 (예: LIVING, SECURITY 등)

  // 1. 기존 데이터 불러오기
  useEffect(() => {
    const fetchOriginal = async () => {
      try {
        const data = await getComplaintDetail(Number(complaintId));
        setTitle(data.title);
        setContent(data.content);
        setType(data.type);
      } catch (error) {
        Alert.alert("에러", "데이터를 불러올 수 없습니다.");
        router.back();
      }
    };
    fetchOriginal();
  }, [complaintId]);

  // 2. 수정 요청 제출
  const handleUpdate = async () => {
    try {
      await updateComplaint(Number(complaintId), title, content, type);
      Alert.alert("알림", "민원이 수정되었습니다.", [
        { text: "확인", onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert("실패", "수정 중 오류가 발생했습니다.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>제목</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} />
      
      <Text style={styles.label}>내용</Text>
      <TextInput 
        style={[styles.input, { height: 150 }]} 
        multiline 
        value={content} 
        onChangeText={setContent} 
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleUpdate}>
        <Text style={styles.submitButtonText}>수정 완료</Text>
      </TouchableOpacity>
    </View>
  );
}