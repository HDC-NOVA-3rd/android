import React from "react";
import { Text, View } from "react-native";
import type { ChatIntent } from "../../.expo/types/chat";

import RagEvidence from "@/components/chat/RagEvidence";
import CardContainer from "./cards/CardContainer";

// 기존 카드
import ApartmentDongListCard from "./cards/ApartmentDongListCard";
import ApartmentWeatherCard from "./cards/ApartmentWeatherCard";
import BillListCard from "./cards/BillListCard";
import ComplaintDetailCard from "./cards/ComplaintDetailCard";
import ComplaintListCard from "./cards/ComplaintListCard";
import EnvHistoryCard from "./cards/EnvHistoryCard";
import EnvStatusCard from "./cards/EnvStatusCard";
import FacilityInfoCard from "./cards/FacilityInfoCard";
import FacilityListCard from "./cards/FacilityListCard";
import MyApartmentCard from "./cards/MyApartmentCard";
import MyDongHoCard from "./cards/MyDongHoCard";
import MyMemberCard from "./cards/MyMemberCard";
import NoticeDetailCard from "./cards/NoticeDetailCard";
import NoticeListCard from "./cards/NoticeListCard";
import ReservationDetailCard from "./cards/ReservationDetailCard";
import ReservationListCard from "./cards/ReservationListCard";
import RoomListCard from "./cards/RoomListCard";
import SpaceByCapacityCard from "./cards/SpaceByCapacityCard";
import SpaceInfoCard from "./cards/SpaceInfoCard";
import SpaceListCard from "./cards/SpaceListCard";
function renderCard(intent?: ChatIntent, data?: any, onQuickSend?: (text: string) => void) {
  if (!intent || !data) return null;

  switch (intent) {
    case "ENV_STATUS":
      return <EnvStatusCard data={data} />;
    case "ENV_HISTORY":
      return <EnvHistoryCard data={data} />;
    case "ROOM_LIST":
      return <RoomListCard data={data} />;
    case "MY_DONG_HO":
      return <MyDongHoCard data={data} />;
    case "FACILITY_INFO":
      return <FacilityInfoCard data={data} />;
    case "MY_MEMBER":
      return <MyMemberCard data={data} />;
    case "MY_APARTMENT":
      return <MyApartmentCard data={data} />;
    case "APARTMENT_DONG_LIST":
      return <ApartmentDongListCard data={data} />;
    case "APARTMENT_WEATHER":
      return <ApartmentWeatherCard data={data} />;
    case "BILL_LIST":
      return <BillListCard data={data} onPickIndex={onQuickSend} />;
    case "FACILITY_LIST":
      return <FacilityListCard data={data} />;

    case "SPACE_LIST":
      return <SpaceListCard data={data} onQuickSend={onQuickSend} />;
    case "SPACE_INFO":
      return <SpaceInfoCard data={data} />;
    case "SPACE_BY_CAPACITY":
      return <SpaceByCapacityCard data={data} />;

    case "NOTICE_LIST":
      return <NoticeListCard data={data} onPickIndex={onQuickSend} />;
    case "NOTICE_DETAIL":
      return <NoticeDetailCard data={data} />;

    case "COMPLAINT_LIST":
      return <ComplaintListCard data={data} onPickIndex={onQuickSend} />;
    case "COMPLAINT_DETAIL":
      return <ComplaintDetailCard data={data} />;

    case "RESERVATION_LIST":
      return <ReservationListCard data={data} onPickIndex={onQuickSend} />;
    case "RESERVATION_DETAIL":
      return <ReservationDetailCard data={data} />;

    default:
      return null;
  }
}

function isCardIntent(intent?: ChatIntent) {
  if (!intent) return false;
  if ((intent as any) === "FREE_CHAT") return false;
  if ((intent as any) === "UNKNOWN") return false;
  return true;
}

function pickDisplayText(content: any, data?: any, isUser?: boolean) {
  const candidate =
    (typeof content === "string" && content.trim().length > 0 ? content : "") ||
    (typeof data?.reply === "string" && data.reply.trim().length > 0 ? data.reply : "") ||
    (typeof data?.message === "string" && data.message.trim().length > 0 ? data.message : "") ||
    (typeof data?.text === "string" && data.text.trim().length > 0 ? data.text : "");

  if (candidate) return candidate;
  if (!isUser) return "응답을 생성하지 못했어요. 다시 시도해 주세요.";
  return "";
}

export default function ChatBubble({
  role,
  content,
  intent,
  data,
  onQuickSend,
}: {
  role: "USER" | "ASSISTANT";
  content: any;
  intent?: ChatIntent;
  data?: any;
  onQuickSend?: (text: string) => void;
}) {
  const isUser = role === "USER";
  const displayText = pickDisplayText(content, data, isUser);
  type AnswerField = { label: string; value: string };

  function formatAnswerText(text: string): {
    headline?: string;
    fields: AnswerField[];
    body: string[];
  } {
    const raw = (text ?? "").trim();
    if (!raw) return { fields: [], body: [] };

    // 공통 정리
    const cleaned = raw
      .replace(/\r\n/g, "\n")
      .replace(/[ \t]+\n/g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    const lines = cleaned
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    // 1) "라벨: 값" 형태는 필드로 우선 수집
    const labelMap: Record<string, string> = {
      행사명: "행사",
      행사: "행사",
      일시: "일시",
      시간: "일시",
      날짜: "일시",
      장소: "장소",
      위치: "장소",
      비용: "비용",
      요금: "비용",
      가격: "비용",
      연락처: "연락처",
      전화: "연락처",
      운영시간: "운영시간",
      운영: "운영시간",
      주소: "주소",
    };

    const fields: AnswerField[] = [];
    const rest: string[] = [];

    for (const l of lines) {
      const m = l.match(/^([가-힣A-Za-z0-9\s]+)\s*[:：]\s*(.+)$/);
      if (m) {
        const k = m[1].trim();
        const v = m[2].trim();
        const mapped = labelMap[k] ?? k;
        fields.push({ label: mapped, value: v });
      } else {
        rest.push(l);
      }
    }

    // 2) 자연어에서 날짜/시간/전화/좌표/주소 등을 패턴으로 뽑아 필드화
    let bodyText = rest.join("\n");

    // (a) 좌표
    const coord = bodyText.match(
      /(?:좌표|위치\s*좌표)\s*[:：]?\s*\(?\s*([-]?\d+\.\d+)\s*,\s*([-]?\d+\.\d+)\s*\)?/,
    );
    if (coord) {
      fields.push({ label: "좌표", value: `(${coord[1]}, ${coord[2]})` });
      bodyText = bodyText.replace(coord[0], "").trim();
    }

    // (b) 전화/내선
    const phone = bodyText.match(
      /(내선\s*\d{2,4}번(?:\s*또는\s*\d{2,4}번)?|\d{2,3}-\d{3,4}-\d{4})/,
    );
    if (phone && !fields.some((f) => f.label === "연락처")) {
      fields.push({ label: "연락처", value: phone[1] });
      // 문장 전체를 제거하진 말고, 본문은 유지
    }

    // (c) "2.28(토) 10:00 ~ 17:00" 같은 일시
    const dt = bodyText.match(/(\d{1,2}\.\d{1,2}\([^)]+\))\s*(\d{1,2}:\d{2}\s*~\s*\d{1,2}:\d{2})/);
    if (dt && !fields.some((f) => f.label === "일시")) {
      fields.push({
        label: "일시",
        value: `${dt[1]} ${dt[2].replace(/\s*/g, " ").replace(" ~ ", " ~ ")}`,
      });
    }

    // (d) 시간만 있는 경우 "10:00 ~ 17:00"
    const tOnly = bodyText.match(/(\d{1,2}:\d{2}\s*~\s*\d{1,2}:\d{2})/);
    if (!dt && tOnly && !fields.some((f) => f.label === "일시")) {
      fields.push({ label: "시간", value: tOnly[1].replace(/\s*/g, " ").replace(" ~ ", " ~ ") });
    }

    // (e) 장소 키워드 포함 문장(단순 추출)
    const place = bodyText.match(
      /(장소|위치)\s*(?:는|은|:)?\s*([가-힣A-Za-z0-9\s]+(센터|광장|관리사무소|경비실|카페|헬스장|도서실|스터디룸).*)/,
    );
    if (place && !fields.some((f) => f.label === "장소")) {
      fields.push({ label: "장소", value: place[2].trim() });
    }

    // 3) 헤드라인(첫 문장을 “제목”처럼)
    // - 필드가 있으면, 남은 본문 첫 줄을 headline 후보로
    // - 너무 길면 headline 안 쓰고 본문으로
    let headline: string | undefined;
    const bodyLines = bodyText
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    if (bodyLines.length > 0) {
      const first = bodyLines[0];
      // "…입니다/…예정입니다" 같은 문장을 headline으로 쓰면 밋밋해서,
      // 길이가 적당하고 “행사/안내/공지/예약” 느낌이면 headline 채택
      if (first.length <= 30 && !/입니다|됩니다|바랍니다|가능합니다$/.test(first)) {
        headline = first;
        bodyLines.shift();
      } else if (/행사|안내|공지|예약|운영|문의/.test(first) && first.length <= 45) {
        headline = first.replace(/입니다\.?$/g, "").trim();
        bodyLines.shift();
      }
    }

    // 4) 중복 라벨 제거(같은 label 여러개면 첫 번째만)
    const dedup: AnswerField[] = [];
    const seen = new Set<string>();
    for (const f of fields) {
      const key = f.label;
      if (seen.has(key)) continue;
      seen.add(key);
      dedup.push(f);
    }

    return {
      headline,
      fields: dedup,
      body: bodyLines,
    };
  }

  const card = !isUser ? renderCard(intent, data, onQuickSend) : null;
  const cardMode = !isUser && !!card && isCardIntent(intent);

  // ✅ RAG 근거 chunks
  const ragChunks = data?.rag?.chunks ?? data?.ragChunks ?? data?.chunks ?? data?.references ?? [];

  // ✅ 유저 버블 스타일은 그대로 사용
  const userBubbleStyle = {
    alignSelf: "flex-end" as const,
    maxWidth: "86%" as const,
    marginVertical: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: "#2F6BFF",
  };

  // ✅ 카드 wrapper: 화면에 가깝게 넓게(쪼그라듦 방지)
  const cardWrapStyle = {
    alignSelf: "stretch" as const,
    width: "100%" as const,
    paddingRight: 48, // 오른쪽 여백(유저 버블과 균형)
    marginVertical: 6,
  };

  // ✅ 목록/줄바꿈 가독성(선택): "- " 를 "• "로
  const prettyText =
    typeof displayText === "string"
      ? displayText
          // 날짜+시간 앞에서 줄바꿈
          .replace(/(\d{1,2}\.\d{1,2}\([^)]+\)\s*\d{1,2}:\d{2}\s*~\s*\d{1,2}:\d{2})/g, "\n\n$1")
      : displayText;

  return (
    <View style={{ alignSelf: isUser ? "flex-end" : cardMode ? "stretch" : "flex-start" }}>
      {cardMode ? (
        // 1) intent 카드가 있는 경우: 기존 카드 렌더
        <View style={cardWrapStyle}>{card}</View>
      ) : isUser ? (
        // 2) 유저: 파란 버블
        <View style={userBubbleStyle}>
          <Text style={{ color: "white", lineHeight: 20, fontSize: 14 }}>{prettyText}</Text>
        </View>
      ) : (
        // 3) 어시스턴트 텍스트: CardContainer로 통일
        <View style={cardWrapStyle}>
          <CardContainer>
            <Text style={{ fontSize: 12, fontWeight: "700", color: "#2F6BFF" }}>🤖 AI 답변</Text>

            <View style={{ height: 8 }} />

            <Text style={{ fontSize: 14, color: "#111", lineHeight: 21 }}>{prettyText}</Text>
          </CardContainer>
        </View>
      )}

      {/* ✅ RAG 근거 UI: assistant에서만 */}
      {!isUser && Array.isArray(ragChunks) && ragChunks.length > 0 && (
        <View style={{ alignSelf: cardMode ? "stretch" : "flex-start", paddingRight: 48 }}>
          <RagEvidence chunks={ragChunks} />
        </View>
      )}

      {/* intent 라벨 숨김 */}
      {false && !!intent && !isUser && (
        <Text style={{ marginTop: 10, fontSize: 11, color: "#B0B8C1", marginLeft: 6 }}>
          intent: {intent}
        </Text>
      )}
    </View>
  );
}
