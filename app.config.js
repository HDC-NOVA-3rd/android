export default ({ config }) => {
  return {
    ...config, // 기존 app.json에 있는 내용을 기본으로 가져옵니다.
    name: config.name,
    android: {
      ...config.android,
      googleServicesFile: "./google-services.json",
    },

    // 앱 내부 코드에서 사용할 환경 변수들
    extra: {
      ...config.extra,
      eas: {
        ...config.extra?.eas,
        projectId: "62b95506-be2d-4cfe-a7bd-c16f9363fb1d",
      },
    },
  };
};
