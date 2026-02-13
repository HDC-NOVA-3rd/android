import React from "react";
import { Text, View } from "react-native";
import type { ChatIntent } from "../../.expo/types/chat";

// 기존 카드
import ApartmentDongListCard from "./cards/ApartmentDongListCard";
import ApartmentWeatherCard from "./cards/ApartmentWeatherCard";
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

  const card = !isUser ? renderCard(intent, data, onQuickSend) : null;
  const cardMode = !isUser && !!card && isCardIntent(intent);

  // ✅ 토스 느낌: assistant 텍스트도 "카드"처럼 보이게 (흰색 + 얇은 테두리)
  const bubbleStyle = {
    alignSelf: isUser ? ("flex-end" as const) : ("flex-start" as const),
    maxWidth: "86%" as const,
    marginVertical: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: isUser ? "#2F6BFF" : "white",
    borderWidth: isUser ? 0 : 1,
    borderColor: isUser ? "transparent" : "#EEF0F3",
  };

  // ✅ 카드 wrapper: 화면에 가깝게 넓게 (쪼그라듦 방지)
  const cardWrapStyle = {
    alignSelf: "stretch" as const,
    width: "100%" as const,
    paddingRight: 48, // 오른쪽 여백(유저 버블과 균형)
    marginVertical: 6,
  };

  return (
    <View style={{ alignSelf: isUser ? "flex-end" : cardMode ? "stretch" : "flex-start" }}>
      {cardMode ? (
        <View style={cardWrapStyle}>{card}</View>
      ) : (
        <View style={bubbleStyle}>
          <Text style={{ color: isUser ? "white" : "#111", lineHeight: 20, fontSize: 14 }}>
            {displayText}
          </Text>
        </View>
      )}

      {/* ✅ intent 라벨: UI에서는 숨김 */}
      {false && !!intent && !isUser && (
        <Text style={{ marginTop: 10, fontSize: 11, color: "#B0B8C1", marginLeft: 6 }}>
          intent: {intent}
        </Text>
      )}
    </View>
  );
}
