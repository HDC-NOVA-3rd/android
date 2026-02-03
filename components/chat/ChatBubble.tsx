import React from "react";
import { Text, View } from "react-native";
import type { ChatIntent } from "../../.expo/types/chat";

// 채팅 말풍선 컴포넌트
import ApartmentDongListCard from "./cards/ApartmentDongListCard";
import ApartmentWeatherCard from "./cards/ApartmentWeatherCard";
import EnvHistoryCard from "./cards/EnvHistoryCard";
import EnvStatusCard from "./cards/EnvStatusCard";
import FacilityInfoCard from "./cards/FacilityInfoCard";
import MyApartmentCard from "./cards/MyApartmentCard";
import MyDongHoCard from "./cards/MyDongHoCard";
import MyMemberCard from "./cards/MyMemberCard";
import RoomListCard from "./cards/RoomListCard";

// 카드 렌더링 함수
function renderCard(intent?: ChatIntent, data?: any) {
  if (!intent || !data) return null;
  // 의도에 따른 카드 컴포넌트 반환
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
}: {
  role: "USER" | "ASSISTANT";
  content: string;
  intent?: ChatIntent;
  data?: any;
}) {
  const isUser = role === "USER";
  // 렌더링
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

      {!isUser && renderCard(intent, data)}

      {/*  디버그용: 개발 모드에서만 intent 표시 */}
      {!!__DEV__ && !!intent && !isUser && (
        <Text style={{ marginTop: 8, fontSize: 11, color: "#999" }}>intent: {intent}</Text>
      )}
    </View>
  );
}
