import React from "react";
import { Text, View } from "react-native";
import CardContainer from "./CardContainer";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        paddingVertical: 10,
      }}
    >
      <Text style={{ fontSize: 13, color: "#7B8494" }}>{label}</Text>
      <Text
        style={{
          fontSize: 14,
          color: "#111",
          fontWeight: "800",
          maxWidth: "70%",
          textAlign: "right",
        }}
        numberOfLines={2}
      >
        {value}
      </Text>
    </View>
  );
}

function formatKoreanDateTime(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso; // 파싱 실패 시 원문 반환

  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
}

function formatTimeRange(start?: string, end?: string) {
  const s = formatKoreanDateTime(start);
  const e = formatKoreanDateTime(end);
  if (!s && !e) return "";
  if (s && e) return `${s} ~ ${e}`;
  return s || e;
}

function mapStatus(status?: string) {
  switch (status) {
    case "COMPLETED":
      return "이용 완료";
    case "PENDING":
      return "대기";
    case "CONFIRMED":
      return "예약 확정";
    case "CANCELLED":
      return "취소";
    case "IN_USE":
      return "이용 중";
    default:
      return status ?? "";
  }
}

function formatWon(value: any) {
  if (value === null || value === undefined || value === "") return "";
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  return `${n.toLocaleString()}원`;
}

export default function ReservationDetailCard({ data }: { data: any }) {
  // ✅ 핵심: { reservation: {...} } 형태 흡수
  const r = data?.reservation ?? data;

  const spaceName = r?.spaceName ?? r?.space?.name ?? r?.space ?? r?.roomName ?? "예약 상세";

  const time =
    r?.startTime || r?.endTime
      ? formatTimeRange(r?.startTime, r?.endTime)
      : (r?.time ?? r?.reservedAt ?? r?.dateTime ?? "");

  const status = mapStatus(r?.status ?? r?.state ?? "");
  const price = formatWon(r?.totalPrice ?? r?.price ?? r?.amount ?? r?.fee ?? "");
  const memo = r?.memo ?? r?.note ?? "";
  function StatusBadge({ status }: { status?: string }) {
    const map = {
      COMPLETED: { label: "이용 완료", bg: "#E6F4EA", color: "#1E7E34" },
      PENDING: { label: "대기", bg: "#FFF4E5", color: "#B26A00" },
      CONFIRMED: { label: "예약 확정", bg: "#E8F0FE", color: "#1A73E8" },
      CANCELLED: { label: "취소", bg: "#FDECEA", color: "#C5221F" },
      IN_USE: { label: "이용 중", bg: "#E3F2FD", color: "#1565C0" },
    } as const;

    const s = map[status as keyof typeof map];

    if (!s) {
      return (
        <Text style={{ fontSize: 14, fontWeight: "700", color: "#111" }}>{status ?? "-"}</Text>
      );
    }

    return (
      <View
        style={{
          backgroundColor: s.bg,
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 20,
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: "700",
            color: s.color,
          }}
        >
          {s.label}
        </Text>
      </View>
    );
  }

  return (
    <CardContainer>
      <Text style={{ fontSize: 16, fontWeight: "800", color: "#111" }}>{String(spaceName)}</Text>
      <View style={{ height: 10 }} />

      <Row label="예약 시간" value={time ? String(time) : "-"} />
      <View style={{ height: 1, backgroundColor: "#F1F3F6" }} />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingVertical: 10,
        }}
      >
        <Text style={{ fontSize: 13, color: "#7B8494" }}>상태</Text>
        <StatusBadge status={r?.status} />
      </View>
      <View style={{ height: 1, backgroundColor: "#F1F3F6" }} />

      <View style={{ height: 1, backgroundColor: "#F1F3F6" }} />

      <Row label="요금" value={price ? String(price) : "-"} />

      {!!memo && (
        <>
          <View style={{ height: 1, backgroundColor: "#F1F3F6" }} />
          <View style={{ paddingTop: 12 }}>
            <Text style={{ fontSize: 13, color: "#7B8494" }}>메모</Text>
            <Text style={{ fontSize: 14, color: "#111", lineHeight: 20, marginTop: 6 }}>
              {String(memo)}
            </Text>
          </View>
        </>
      )}
    </CardContainer>
  );
}
