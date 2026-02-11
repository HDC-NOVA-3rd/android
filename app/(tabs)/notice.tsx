import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getNoticeList, NoticeItem } from "@/api/service/noticeService";
import { useAuth } from "@/context/AuthContext";
import { styles } from "@/styles/notice.styles";

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}.${month}.${day}`;
}

function truncate(text: string, maxLen: number): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen) + "...";
}

export default function NoticeScreen() {
  const router = useRouter();
  const { accessToken } = useAuth();
  const [notices, setNotices] = useState<NoticeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotices = useCallback(async () => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    try {
      const data = await getNoticeList();
      setNotices(data);
    } catch (error) {
      console.error("공지사항 조회 실패:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchNotices();
  }, [fetchNotices]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchNotices();
  }, [fetchNotices]);

  const onPressNotice = (notice: NoticeItem) => {
    router.push({
      pathname: "/notice/[noticeId]",
      params: {
        noticeId: notice.noticeId.toString(),
        title: notice.title,
        content: notice.content,
        authorName: notice.authorName,
        createdAt: notice.createdAt,
      },
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#0a7ea4" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>공지사항</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {notices.length > 0 ? (
          notices.map((notice) => (
            <TouchableOpacity
              key={notice.noticeId}
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => onPressNotice(notice)}
            >
              <Text style={styles.cardTitle}>{notice.title}</Text>
              <Text style={styles.cardContent} numberOfLines={2}>
                {truncate(notice.content, 80)}
              </Text>
              <View style={styles.cardFooter}>
                <Text style={styles.authorText}>{notice.authorName}</Text>
                <Text style={styles.dateText}>{formatDate(notice.createdAt)}</Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Feather name="bell-off" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>공지사항이 없습니다</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
