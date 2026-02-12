import "dotenv/config"; // .env 파일을 읽어오기 위해 필요

export default ({ config }) => {
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
