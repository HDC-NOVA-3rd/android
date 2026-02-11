import { ReservationResponse } from "@/api/service/reservationService";
import { Button } from "@/components/ui/button";
import { Feather } from "@expo/vector-icons";
import { format, parseISO } from "date-fns";
import React from "react";
import { Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import QRCode from "react-native-qrcode-svg";

interface QRCodeModalProps {
  booking: ReservationResponse | null;
  visible: boolean;
  onClose: () => void;
}

export function QRCodeModal({ booking, visible, onClose }: QRCodeModalProps) {
  if (!booking) return null;

  const QRCodePlaceholder = () => (
    <View style={styles.qrContainer}>
      <QRCode
        value={booking.qrToken} // 실제 토큰 값을 주입
        size={180} // 크기 설정
        color="black" // QR 코드 색상
        backgroundColor="white" // 배경 색상
        logoSize={30}
      />
    </View>
  );

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>출입 QR 코드</Text>
            <TouchableOpacity onPress={onClose}>
              <Feather name="x" size={24} color="black" />
            </TouchableOpacity>
          </View>

          <Text style={styles.modalDescription}>시설 출입 시 QR 코드를 스캔해주세요</Text>

          <View style={styles.qrWrapper}>
            <QRCodePlaceholder />
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.facilityName}>{booking.spaceName}</Text>

            <View style={styles.infoRow}>
              <Feather name="calendar" size={16} color="#6b7280" />
              <Text style={styles.infoValue}>{format(parseISO(booking.startTime), "yyyy년 MM월 dd일")}</Text>
            </View>

            <View style={styles.infoRow}>
              <Feather name="clock" size={16} color="#6b7280" />
              <Text style={styles.infoValue}>
                {format(parseISO(booking.startTime), "HH:mm")} - {format(parseISO(booking.endTime), "HH:mm")}
              </Text>
            </View>

            <View style={styles.accessCodeContainer}>
              <Feather name="lock" size={16} color="#2563eb" />
              <Text style={styles.accessCodeLabel}>출입 토큰:</Text>
              <Text style={styles.accessCodeValue}>{booking.qrToken.substring(0, 8).toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.actions}>
            <Button variant="outline" style={styles.actionButton}>
              <Feather name="download" size={16} color="black" />
              <Text style={{ marginLeft: 8 }}>QR 코드 저장</Text>
            </Button>
            <Button onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>닫기</Text>
            </Button>
          </View>

          <View style={styles.footerNotice}>
            <Text style={styles.noticeText}>• 이용 시작 30분 전부터 사용 가능</Text>
            <Text style={styles.noticeText}>• 이용 종료 시 자동으로 비활성화됩니다</Text>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold" },
  modalDescription: { fontSize: 14, color: "#6b7280", textAlign: "center", marginBottom: 20 },
  qrWrapper: { alignItems: "center", marginBottom: 24 },
  qrContainer: {
    width: 200,
    height: 200,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 10,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  qrGrid: {
    width: 180,
    height: 180,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  qrPixel: { width: 180 / 8, height: 180 / 8 },
  qrIconOverlay: {
    position: "absolute",
    backgroundColor: "white",
    padding: 4,
    borderRadius: 4,
  },
  infoBox: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  facilityName: { fontSize: 16, fontWeight: "bold", textAlign: "center", marginBottom: 12 },
  infoRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 4 },
  infoValue: { fontSize: 14, color: "#374151" },
  accessCodeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 12,
    padding: 10,
    backgroundColor: "#eff6ff",
    borderRadius: 8,
  },
  accessCodeLabel: { fontSize: 14, color: "#1e40af" },
  accessCodeValue: { fontSize: 18, fontWeight: "bold", color: "#1e40af" },
  actions: { gap: 8 },
  actionButton: { height: 45 },
  closeButton: { height: 45, backgroundColor: "#111827" },
  closeButtonText: { color: "white", fontWeight: "bold" },
  footerNotice: { marginTop: 16, alignItems: "center" },
  noticeText: { fontSize: 12, color: "#9ca3af" },
});
