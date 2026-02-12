import { Alert, Platform } from "react-native"; // Platform 확인을 위해 필요
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

// 앱이 실행되는 동안 알림이 도착했을 때 어떻게 처리할지 설정 (Foreground 알림 처리)
// 소리 재생, 뱃지 표시, 알림 표시 여부 등을 설정할 수 있습니다.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true, // 알림 도착 시 사용자에게 표시할지 여부
    shouldPlaySound: true, // 소리 재생 여부
    shouldSetBadge: true, // 뱃지 아이콘 표시 여부 (iOS)
    shouldShowBanner: true, // 상단 배너(팝업) 표시 여부
    shouldShowList: true, // 알림 센터(리스트) 표시 여부
  }),
});

// 에러 발생 시 알림을 띄우고 예외를 던지는 헬퍼 함수
function handleRegistrationError(errorMessage: string) {
  Alert.alert("푸시 알림 에러", errorMessage);
  throw new Error(errorMessage);
}

// 푸시 알림 등록 및 토큰 발급
export async function registerForPushNotificationsAsync() {
  // 1. 안드로이드 설정 (채널 생성)
  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default", // 사용자에게 설정 메뉴에서 보일 채널 이름
      importance: Notifications.AndroidImportance.MAX, // 알림 중요도 (MAX: 소리+화면 팝업)
      vibrationPattern: [0, 250, 250, 250], // 진동 패턴 (대기, 진동, 대기, 진동...)
      lightColor: "#FF231F7C", // 알림 LED 색상
    });
  }

  // 2. 환경 체크 (iOS 시뮬레이터만 제외하고 모두 허용)
  // - 안드로이드: 실물 기기(OK), 에뮬레이터(OK)
  // - iOS: 실물 기기(OK), 시뮬레이터(NO - 애플 정책상 불가)
  if (Platform.OS === "android" || Device.isDevice) {
    // 3. 권한 확인
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // 4. 권한 요청
    if (existingStatus !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // 5. 권한 거부됨
    if (finalStatus !== "granted") {
      handleRegistrationError("푸시 알림 권한을 허용하지 않았습니다.");
      return;
    }

    // 6. Project ID 가져오기
    const projectId = Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

    if (!projectId) {
      handleRegistrationError("Project ID를 찾을 수 없습니다. app.json을 확인하세요.");
      return;
    }

    try {
      // 7. 토큰 발급
      const pushTokenString = (
        await Notifications.getExpoPushTokenAsync({
          projectId,
        })
      ).data;

      console.log("✅ 발급된 푸시 토큰:", pushTokenString);
      return pushTokenString;
    } catch (e: unknown) {
      handleRegistrationError(`${e}`);
    }
  } else {
    // 8. 예외: iOS 시뮬레이터인 경우
    // 에러를 띄우지 않고, 개발자에게만 로그로 알려줌 (앱 종료 방지)
    console.log("⚠️ iOS 시뮬레이터에서는 푸시 알림을 사용할 수 없습니다. 실물 기기를 사용하세요.");
    return null;
  }
}
