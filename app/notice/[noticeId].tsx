import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { styles } from "@/styles/notice.styles";

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}.${month}.${day} ${hours}:${minutes}`;
}

export default function NoticeDetailScreen() {
  const router = useRouter();
  const { title, content, authorName, createdAt } = useLocalSearchParams<{
    noticeId: string;
    title: string;
    content: string;
    authorName: string;
    createdAt: string;
  }>();

  return (
    <SafeAreaView style={styles.detailContainer} edges={["top"]}>
      <View style={styles.detailHeader}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Feather name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.detailHeaderTitle}>공지사항</Text>
      </View>

      <ScrollView>
        <View style={styles.detailContent}>
          <Text style={styles.detailTitle}>{title}</Text>
          <View style={styles.detailMeta}>
            <Text style={styles.detailAuthor}>{authorName}</Text>
            <Text style={styles.detailDate}>{createdAt ? formatDateTime(createdAt) : ""}</Text>
          </View>
          <Text style={styles.detailBody}>{content}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
