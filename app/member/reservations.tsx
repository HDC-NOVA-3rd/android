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
  // 2. 탭 상태를 4가지로 변경
  const [activeTab, setActiveTab] = useState<ReservationResponse["status"]>("INUSE"); // 기본값을 '이용 중'으로 하여 QR 접근성을 높임

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

  // 3. 필터링 로직 단순화 (Status 값만 비교)
  const filteredBookings = reservationList.filter((b) => b.status === activeTab);

  // 4. 상태별 뱃지 컴포넌트
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "INUSE":
        return (
          <Badge style={{ backgroundColor: "#2563eb", paddingVertical: 2 }}>
            <Text style={{ color: "white", fontSize: 12, fontWeight: "bold" }}>이용 중</Text>
          </Badge>
        );
      case "CONFIRMED":
        return (
          <Badge style={{ backgroundColor: "#10b981", paddingVertical: 2 }}>
            <Text style={{ color: "white", fontSize: 12, fontWeight: "bold" }}>예약 확정</Text>
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge variant="secondary" style={{ paddingVertical: 2 }}>
            <Text style={{ color: "#374151", fontSize: 12 }}>이용 완료</Text>
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge variant="destructive" style={{ paddingVertical: 2 }}>
            <Text style={{ color: "white", fontSize: 12 }}>취소됨</Text>
          </Badge>
        );
      default:
        return null;
    }
  };

  // 5. 탭 메뉴 라벨 정의
  const TABS: { key: ReservationResponse["status"]; label: string }[] = [
    { key: "INUSE", label: "이용 중" },
    { key: "CONFIRMED", label: "예정" },
    { key: "COMPLETED", label: "완료" },
    { key: "CANCELLED", label: "취소" },
  ];

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
          {getStatusBadge(booking.status)}
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

        <View style={styles.buttonContainer}>
          {/* 1. 이용 중(INUSE)일 때: QR 코드 버튼 노출 */}
          {booking.status === "INUSE" && (
            <Button
              style={styles.qrButton} // 스타일 수정됨 (파란색 배경)
              onPress={() => {
                setSelectedReservation(booking);
                setModalVisible(true);
              }}
            >
              <Feather name="maximize" size={18} color="white" style={{ marginRight: 8 }} />
              <Text style={styles.qrButtonText}>QR 코드 열기</Text>
            </Button>
          )}

          {/* 2. 예약 확정(CONFIRMED)일 때: 취소 버튼 노출 */}
          {booking.status === "CONFIRMED" && (
            <Button variant="destructive" style={styles.cancelButton} onPress={() => handleCancel(booking.id)}>
              <Text style={{ color: "white", fontWeight: "600" }}>예약 취소</Text>
            </Button>
          )}
        </View>
      </CardContent>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>내 예약 관리</Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabBar}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.activeTab]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.activeTabText]}>{tab.label}</Text>
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
