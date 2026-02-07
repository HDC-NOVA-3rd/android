import "dotenv/config"; // .env 파일을 읽어오기 위해 필요

export default ({ config }) => {
  return {
    ...config, // 기존 app.json에 있는 내용을 기본으로 가져옵니다.

    // .env에 값이 있으면 그걸 쓰고, 없으면 기본값(app.json 값 or 'default')을 씁니다.
    name: process.env.MY_APP_NAME || "My App Default",
    slug: process.env.MY_APP_SLUG || "my-app-test",

    // owner가 .env에 있으면 설정하고, 없으면 삭제 (로그인된 계정 따라감)
    owner: process.env.MY_APP_OWNER || undefined,

    // 스킴도 겹치지 않게 분리하고 싶다면 환경변수 처리 가능
    scheme: process.env.MY_APP_SCHEME || "myapp",

    // 추가적인 설정들 (android, ios 등)
    android: {
      ...config.android,
      package: process.env.ANDROID_PACKAGE || "com.company.myapp",
    },
    ios: {
      ...config.ios,
      bundleIdentifier: process.env.IOS_BUNDLE || "com.company.myapp",
    },
  };
};
