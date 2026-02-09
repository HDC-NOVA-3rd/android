import { getMyReservations, ReservationResponse, cancelReservation } from "@/api/service/reservationService";
import { QRCodeModal } from "@/components/reservation/QRCodeModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Feather } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, View, TouchableOpacity, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "@/styles/reservations.styles";

export default function ReservationsScreen() {
  const router = useRouter();
  // 회원의 예약 내역 리스트
  const [reservationList, setReservationList] = useState<ReservationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  // 선택된 예약 상세 정보 (QR 코드 모달용)
  const [selectedReservation, setSelectedReservation] = useState<ReservationResponse | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  // 활성화된 탭 상태
  const [activeTab, setActiveTab] = useState<"upcoming" | "completed" | "cancelled">("upcoming");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      // GET /api/reservation/me API 호출
      const data = await getMyReservations();
      setReservationList(data);
    } catch (error) {
      console.error(error);
      Alert.alert("오류", "예약 내역을 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id: number) => {
    Alert.alert("예약 취소", "정말로 이 예약을 취소하시겠습니까?", [
      { text: "아니오", style: "cancel" },
      {
        text: "예",
        style: "destructive",
        onPress: async () => {
          try {
            await cancelReservation(id);
            Alert.alert("성공", "예약이 취소되었습니다.");
            fetchBookings(); // 목록 새로고침
          } catch (error) {
            console.error(error);
            Alert.alert("오류", "예약 취소에 실패했습니다.");
          }
        },
      },
    ]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchBookings();
    setRefreshing(false);
  };

  const filteredBookings = reservationList.filter((b) => {
    if (activeTab === "upcoming") return b.status === "CONFIRMED" && parseISO(b.startTime) >= new Date();
    if (activeTab === "completed")
      return b.status === "COMPLETED" || (b.status === "CONFIRMED" && parseISO(b.startTime) < new Date());
    if (activeTab === "cancelled") return b.status === "CANCELLED";
    return true;
  });

  const getStatusBadge = (status: string, startTime: string) => {
    if (status === "CANCELLED")
      return (
        <Badge variant="destructive" style={{ paddingVertical: 2 }}>
          <Text style={styles.badgeText}>예약 취소</Text>
        </Badge>
      );
    if (status === "COMPLETED" || parseISO(startTime) < new Date())
      return (
        <Badge variant="secondary" style={{ paddingVertical: 2 }}>
          <Text style={styles.badgeText}>이용 완료</Text>
        </Badge>
      );
    return (
      <Badge style={{ backgroundColor: "#10b981", paddingVertical: 2 }}>
        <Text style={styles.badgeText}>예약 확정</Text>
      </Badge>
    );
  };

  const BookingCard = ({ booking }: { booking: ReservationResponse }) => (
    <Card style={styles.card}>
      <CardHeader style={styles.cardHeader}>
        <View style={styles.cardHeaderTop}>
          <View style={{ flex: 1 }}>
            <CardTitle style={styles.cardTitle}>{booking.spaceName}</CardTitle>
            <CardDescription>
              {booking.paymentMethod === "MANAGEMENT_FEE" ? "관리비 청구" : "카드 결제"}
            </CardDescription>
          </View>
          {getStatusBadge(booking.status, booking.startTime)}
        </View>
      </CardHeader>
      <CardContent style={styles.cardContent}>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Feather name="calendar" size={14} color="#6b7280" />
            <Text style={styles.infoText}>{format(parseISO(booking.startTime), "yyyy년 MM월 dd일")}</Text>
          </View>
          <View style={styles.infoItem}>
            <Feather name="clock" size={14} color="#6b7280" />
            <Text style={styles.infoText}>
              {format(parseISO(booking.startTime), "HH:mm")} - {format(parseISO(booking.endTime), "HH:mm")}
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Feather name="users" size={14} color="#6b7280" />
            <Text style={styles.infoText}>{booking.capacity}명</Text>
          </View>
          <View style={styles.infoItem}>
            <Feather name="user" size={14} color="#6b7280" />
            <Text style={styles.infoText}>{booking.ownerName}</Text>
          </View>
        </View>

        <View style={styles.priceRow}>
          <Text style={styles.priceLabel}>결제 금액</Text>
          <Text style={styles.priceValue}>{booking.totalPrice.toLocaleString()}원</Text>
        </View>

        {booking.status === "CONFIRMED" && parseISO(booking.startTime) >= new Date() && (
          <>
            <Button
              variant="outline"
              style={styles.qrButton}
              onPress={() => {
                setSelectedReservation(booking);
                setModalVisible(true);
              }}
            >
              <Feather name="maximize" size={16} color="black" />
              <Text style={styles.qrButtonText}>QR 코드 보기</Text>
            </Button>
            <Button
              variant="destructive"
              style={{ marginTop: 8, height: 40, flexDirection: "row", gap: 8 }}
              onPress={() => handleCancel(booking.id)}
            >
              <Feather name="x-circle" size={16} color="white" />
              <Text style={{ color: "white", fontWeight: "600" }}>예약 취소</Text>
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>내 예약 내역</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {(["upcoming", "completed", "cancelled"] as const).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.activeTab]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab === "upcoming" ? "예정" : tab === "completed" ? "완료" : "취소"}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {loading ? (
          <ActivityIndicator size="large" color="#2563eb" style={{ marginTop: 40 }} />
        ) : filteredBookings.length > 0 ? (
          filteredBookings.map((booking) => <BookingCard key={booking.id} booking={booking} />)
        ) : (
          <View style={styles.emptyState}>
            <Feather name="calendar" size={48} color="#d1d5db" />
            <Text style={styles.emptyText}>예약 내역이 없습니다.</Text>
          </View>
        )}
      </ScrollView>

      <QRCodeModal booking={selectedReservation} visible={modalVisible} onClose={() => setModalVisible(false)} />
    </SafeAreaView>
  );
}
