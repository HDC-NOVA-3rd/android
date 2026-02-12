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

// (선택) 제어요약 카드
// import DeviceControlCard from "./cards/DeviceControlCard";

// 카드 렌더링 함수
function renderCard(intent?: ChatIntent, data?: any, onQuickSend?: (text: string) => void) {
  if (!intent || !data) return null;

  switch (intent) {
    // === 기존 ===
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

    // === 신규: 시설/공간 ===
    case "FACILITY_LIST":
      return <FacilityListCard data={data} />;

    case "SPACE_LIST":
      // 시설 선택/공간 목록에서 버튼 클릭 → 바로 전송하도록 onQuickSend 내려줌
      return <SpaceListCard data={data} onQuickSend={onQuickSend} />;
    case "SPACE_INFO":
      return <SpaceInfoCard data={data} />;
    case "SPACE_BY_CAPACITY":
      return <SpaceByCapacityCard data={data} />;

    // === 신규: 공지/민원/예약 (리스트는 번호 선택 UX 가능) ===
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

    // === 신규(선택): 제어 ===
    // case "DEVICE_CONTROL":
    //   return <DeviceControlCard data={data} />;

    default:
      return null;
  }
}

// 채팅 말풍선 컴포넌트
export default function ChatBubble({
  role,
  content,
  intent,
  data,
  onQuickSend,
}: {
  role: "USER" | "ASSISTANT";
  content: string;
  intent?: ChatIntent;
  data?: any;
  onQuickSend?: (text: string) => void;
}) {
  const isUser = role === "USER";

  return (
    <View
      style={{
        alignSelf: isUser ? "flex-end" : "flex-start",
        maxWidth: "82%",
        marginVertical: 6,
        padding: 12,
        borderRadius: 14,
        backgroundColor: isUser ? "#2F6BFF" : "#F2F4F7",
      }}
    >
      <Text style={{ color: isUser ? "white" : "#111" }}>{content}</Text>

      {!isUser && renderCard(intent, data, onQuickSend)}

      {!!__DEV__ && !!intent && !isUser && (
        <Text style={{ marginTop: 8, fontSize: 11, color: "#999" }}>intent: {intent}</Text>
      )}
    </View>
  );
}
