// src/configs/authConfig.ts
import Constants from "expo-constants";
import { makeRedirectUri } from "expo-auth-session";

const appConfig = Constants.expoConfig || Constants.manifest;

// 1. 동적으로 Owner와 Slug 가져오기 (팀원별 .env 대응)
const slug = appConfig?.slug || "my-app";
const owner = appConfig?.owner;

// 2. Redirect URI 생성 로직 (핵심)
// 개발 환경(__DEV__)이면 AuthSession Proxy URL을 문자열로 조합
// 배포 환경이면 스킴 기반 URL 생성
const getRedirectUri = () => {
  if (__DEV__) {
    // Expo Go 개발용 (https://auth.expo.io/@user/slug)
    // owner가 없으면(로그인 안함) 경고가 뜰 수 있으니 체크
    return `https://auth.expo.io/@${owner}/${slug}`;
  } else {
    // 배포용 (myapp://redirect)
    return makeRedirectUri({
      scheme: appConfig?.scheme,
      path: "redirect",
    });
  }
};

export const AuthConfig = {
  // 사용하게 될 최종 Redirect URI
  redirectUri: getRedirectUri(),

  // 구글 설정 (나중에 .env에서 불러오게 수정 가능)
  google: {
    webClientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
    iosClientId: "YOUR_IOS_CLIENT_ID", // 필요시
    androidClientId: "YOUR_ANDROID_CLIENT_ID", // 필요시
  },

  // 카카오 등 다른 설정도 여기에 추가
  kakao: {
    appKey: "YOUR_KAKAO_APP_KEY",
  },
};

// 개발 편의를 위해 콘솔에 주소 출력 (앱 켜질 때 확인용)
console.log("=========================================");
console.log("Current Redirect URI:", AuthConfig.redirectUri);
console.log("=========================================");
