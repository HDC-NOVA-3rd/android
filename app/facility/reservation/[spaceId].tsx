import { getSpaceDetail } from "@/api/service/facilityService";
import { getMyInfo } from "@/api/service/memberService";
import { createReservation, getOccupiedReservations, OccupiedReservation } from "@/api/service/reservationService";
import { ReservationCalendar } from "@/components/reservation/ReservationCalendar";
import { TimeRangePicker } from "@/components/reservation/TimeRangePicker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTimeRangeSelection } from "@/hooks/useTimeRangeSelection";
import { styles } from "@/styles/facility/reservation.styles";
import { Feather } from "@expo/vector-icons";
import { format, setHours, setMinutes } from "date-fns";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function BookingScreen() {
  // spaceId 기반으로 데이터 값을 다르게 받아옴 -> 이후 space 값 저장
  const { spaceId } = useLocalSearchParams();
  const [space, setSpace] = useState<any>(null);

  const router = useRouter();
  const [loading, setLoading] = useState(true);
  // 예약 탭 / 상세정보 탭
  const [activeTab, setActiveTab] = useState<"booking" | "detail">("booking");

  // User Info
  const [userInfo, setUserInfo] = useState<any>(null);
  const [useUserInfo, setUseUserInfo] = useState(false);

  // Date Selection
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const [occupiedSlots, setOccupiedSlots] = useState<OccupiedReservation[]>([]);
  const { startIdx, endIdx, selectTimeSlot, resetSelection } = useTimeRangeSelection({ occupiedSlots });

  // Form State
  const [participants, setParticipants] = useState("1");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"MANAGEMENT_FEE" | "ONLINE_PAYMENT">("MANAGEMENT_FEE");

  useEffect(() => {
    fetchData();
    fetchUserInfo();
  }, [spaceId]);

  useEffect(() => {
    fetchOccupied();
    resetSelection();
  }, [selectedDate, spaceId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const spaceData = await getSpaceDetail(Number(spaceId));
      setSpace(spaceData);
      // Set default participants to min capacity
      if (spaceData) {
        setParticipants(String(spaceData.minCapacity));
      }
    } catch (error) {
      console.error(error);
      Alert.alert("오류", "공간 정보를 불러오는데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserInfo = async () => {
    try {
      const info = await getMyInfo();
      setUserInfo(info);
    } catch (error) {
      console.log("Failed to fetch user info", error);
    }
  };

  const fetchOccupied = async () => {
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const occupied = await getOccupiedReservations(Number(spaceId), dateStr);
      setOccupiedSlots(occupied);
    } catch (error) {
      console.error(error);
    }
  };

  const toggleAutoFill = () => {
    const newValue = !useUserInfo;
    setUseUserInfo(newValue);
    if (newValue && userInfo) {
      setName(userInfo.name);
      setPhone(userInfo.phoneNumber);
    } else {
      setName("");
      setPhone("");
    }
  };

  const handleBooking = async () => {
    if (startIdx === null || endIdx === null) {
      Alert.alert("알림", "이용하실 시간대를 선택해주세요.");
      return;
    }
    if (!name || !phone) {
      Alert.alert("알림", "예약자 정보를 입력해주세요.");
      return;
    }

    try {
      const start = setMinutes(setHours(new Date(selectedDate), startIdx), 0);

      const end = setMinutes(setHours(new Date(selectedDate), endIdx + 1), 0);

      await createReservation({
        spaceId: Number(spaceId),

        startTime: format(start, "yyyy-MM-dd'T'HH:mm:ss"),

        endTime: format(end, "yyyy-MM-dd'T'HH:mm:ss"),

        capacity: Number(participants),

        ownerName: name,

        ownerPhone: phone,

        paymentMethod,
      });

      Alert.alert("성공", "예약이 완료되었습니다.", [{ text: "확인", onPress: () => router.push("/(tabs)/mypage") }]);
    } catch (error: any) {
      Alert.alert("실패", error.response?.data?.message || "예약에 실패했습니다.");
    }
  };

  if (loading || !space) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#111827" />
      </View>
    );
  }

  const totalHours = startIdx !== null && endIdx !== null ? endIdx - startIdx + 1 : 0;
  const totalPrice = totalHours * space.price;

  // Generate participant options
  const participantOptions = Array.from(
    { length: space.maxCapacity - space.minCapacity + 1 },
    (_, i) => space.minCapacity + i,
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Feather name="chevron-left" size={28} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{space.name}</Text>
      </View>

      {/* Tabs Layout */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "booking" && styles.activeTab]}
          onPress={() => setActiveTab("booking")}
        >
          <Text style={[styles.tabText, activeTab === "booking" && styles.activeTabText]}>예약하기</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "detail" && styles.activeTab]}
          onPress={() => setActiveTab("detail")}
        >
          <Text style={[styles.tabText, activeTab === "detail" && styles.activeTabText]}>상세정보</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {activeTab === "booking" ? (
          <>
            {/* Date Section */}
            <View style={styles.section}>
              <View style={styles.sectionTitle}>
                <Feather name="calendar" size={18} color="black" style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 16, fontWeight: "bold" }}>날짜와 시간을 선택해 주세요.</Text>
              </View>
              <ReservationCalendar
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                currentMonth={currentMonth}
                onChangeMonth={setCurrentMonth}
              />
            </View>

            {/* Time Section */}
            <View style={styles.section}>
              <Text style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>
                최소 1시간 ~ 최대 24시간 이용가능
              </Text>
              <TimeRangePicker
                occupiedSlots={occupiedSlots}
                startIdx={startIdx}
                endIdx={endIdx}
                onSelectSlot={selectTimeSlot}
              />

              {startIdx !== null && endIdx !== null && (
                <View style={styles.selectionSummary}>
                  <Text style={styles.selectionTime}>
                    {format(setHours(new Date(), startIdx), "a h:00").replace("AM", "오전").replace("PM", "오후")} ~{" "}
                    {format(setHours(new Date(), endIdx + 1), "a h:00")
                      .replace("AM", "오전")
                      .replace("PM", "오후")}
                  </Text>
                  <Text style={styles.selectionDetail}>
                    {totalHours}시간 이용 {totalPrice.toLocaleString()}원
                  </Text>
                </View>
              )}
            </View>

            {/* User Info Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>예약자 정보</Text>
              <View style={styles.form}>
                {/* 이용 인원 Select */}
                <View style={styles.inputGroup}>
                  <Label>이용 인원</Label>
                  <Select value={participants} onValueChange={setParticipants}>
                    <SelectTrigger>
                      <SelectValue placeholder="인원 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {participantOptions.map((num) => (
                        <SelectItem key={num} value={String(num)}>
                          {num}명
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </View>

                {/* Auto-fill Checkbox */}
                <TouchableOpacity style={styles.checkboxRow} onPress={toggleAutoFill}>
                  <View style={[styles.checkbox, useUserInfo && styles.checkboxChecked]}>
                    {useUserInfo && <Feather name="check" size={14} color="white" />}
                  </View>
                  <Text style={styles.checkboxLabel}>내 정보 불러오기</Text>
                </TouchableOpacity>

                <View style={styles.inputGroup}>
                  <Label>예약자 성함</Label>
                  <Input value={name} onChangeText={setName} placeholder="성함을 입력하세요" editable={!useUserInfo} />
                </View>
                <View style={styles.inputGroup}>
                  <Label>연락처</Label>
                  <Input
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="010-0000-0000"
                    keyboardType="phone-pad"
                    editable={!useUserInfo}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Label>결제 수단</Label>
                  <View style={styles.paymentRow}>
                    <TouchableOpacity
                      style={[styles.paymentOption, paymentMethod === "MANAGEMENT_FEE" && styles.paymentSelected]}
                      onPress={() => setPaymentMethod("MANAGEMENT_FEE")}
                    >
                      <Text
                        style={[styles.paymentText, paymentMethod === "MANAGEMENT_FEE" && styles.paymentTextSelected]}
                      >
                        관리비 합산
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.paymentOption, paymentMethod === "ONLINE_PAYMENT" && styles.paymentSelected]}
                      onPress={() => setPaymentMethod("ONLINE_PAYMENT")}
                    >
                      <Text
                        style={[styles.paymentText, paymentMethod === "ONLINE_PAYMENT" && styles.paymentTextSelected]}
                      >
                        카드 결제
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </>
        ) : (
          /* Detail View */
          <View style={styles.detailContainer}>
            <View style={styles.detailRow}>
              <Feather name="info" size={20} color="#6b7280" style={styles.detailIcon} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>시설 소개</Text>
                <Text style={styles.detailValue}>{space.description || "등록된 설명이 없습니다."}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Feather name="clock" size={20} color="#6b7280" style={styles.detailIcon} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>운영 시간</Text>
                <Text style={styles.detailValue}>06:00 - 24:00 (연중무휴)</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Feather name="users" size={20} color="#6b7280" style={styles.detailIcon} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>수용 인원</Text>
                <Text style={styles.detailValue}>
                  최소 {space.minCapacity}명 ~ 최대 {space.maxCapacity}명
                </Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <Feather name="dollar-sign" size={20} color="#6b7280" style={styles.detailIcon} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>이용 요금</Text>
                <Text style={styles.detailValue}>{space.price.toLocaleString()}원 / 시간</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Fixed Bottom Bar (Only visible in Booking Tab) */}
      {activeTab === "booking" && (
        <View style={styles.priceBottomBar}>
          <View>
            <Text style={styles.totalLabel}>합계</Text>
            <Text style={styles.totalPrice}>{totalPrice.toLocaleString()}원</Text>
          </View>
          <TouchableOpacity style={styles.submitButton} onPress={handleBooking}>
            <Text style={styles.submitButtonText}>예약 확정</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
