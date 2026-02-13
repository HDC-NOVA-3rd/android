import "dotenv/config"; // .env 파일을 읽어오기 위해 필요
import fs from "fs";
import path from "path";

export default ({ config }) => {
  const googleServicesBase64 = process.env.GOOGLE_SERVICES_JSON_BASE64;
  // EAS Build 환경에서 Base64 값이 있으면 파일을 생성합니다.
  if (googleServicesBase64) {
    const filePath = path.resolve(__dirname, "google-services.json");
    fs.writeFileSync(filePath, Buffer.from(googleServicesBase64, "base64"));

    // 생성된 파일을 사용하도록 경로 설정
    if (config.android) {
      config.android.googleServicesFile = "./google-services.json";
    }
  }

  return {
    ...config, // 기존 app.json에 있는 내용을 기본으로 가져옵니다.

    // .env에 값이 있으면 그걸 쓰고, 없으면 기본값(app.json 값 or 'default')을 씁니다.
    name: process.env.MY_APP_NAME || config.name,

    // 앱 내부 코드에서 사용할 환경 변수들
    extra: {
      ...config.extra,
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
    },
  };
};
