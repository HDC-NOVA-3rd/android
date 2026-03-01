import { getApartmentList, getDongList, getHoList, signup, verify } from "@/api/service/authService";
import { useAuth } from "@/context/AuthContext";
import { formatDateToYYYYMMDD } from "@/utils/date"; // 앞서 만든 유틸 함수 사용 가정
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert } from "react-native";

export interface CodeItem {
  id: number;
  name?: string;
  dongNo?: string;
  hoNo?: string;
}

export const useSignupForm = () => {
  const [formData, setFormData] = useState({
    apartmentId: "",
    apartmentName: "",
    dongId: "",
    dongNo: "",
    hoId: "",
    hoNo: "",
    name: "",
    phone: "",
    loginId: "",
    password: "",
    confirmPassword: "",
    email: "",
    birthDate: "",
    registerToken: "",
    login_type: "",
    providerId: "",
  });
  // 입력 데이터를 보여주는 목록리스트
  const [apartmentList, setApartmentList] = useState<CodeItem[]>([]);
  const [dongList, setDongList] = useState<any[]>([]);
  const [hoList, setHoList] = useState<any[]>([]);

  // 인증 상태 관리 (false: 인증 전, true: 인증 완료) -> UI 블락처리를 위함.
  const [isVerified, setIsVerified] = useState(false);
  const [residentId, setResidentId] = useState<number | null>(null);
  // [추가] 자동 로그인을 위해 signIn 함수 가져오기
  const { signIn } = useAuth();

  // [Effect] 초기 아파트 목록 조회
  useEffect(() => {
    (async () => {
      try {
        const data = await getApartmentList();
        setApartmentList(data);
      } catch (e) {
        Alert.alert("오류", "아파트 목록을 불러오는데 실패했습니다.");
      }
    })();
  }, []);

  // 한 번에 여러 필드를 업데이트하는 헬퍼
  const updateFields = (fields: Partial<typeof formData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  // 1. 아파트 변경 핸들러
  const onApartmentChange = async (selectedAptName: string) => {
    // Select는 value(이름)를 줍니다
    const selectedApt = apartmentList.find((apt) => apt.name === selectedAptName);
    const aptId = selectedApt ? String(selectedApt.id) : "";

    updateFields({
      apartmentId: aptId,
      apartmentName: selectedAptName,
      dongId: "",
      dongNo: "",
      hoId: "",
      hoNo: "",
    });
    setDongList([]);
    setHoList([]);

    if (aptId) {
      try {
        const data = await getDongList(aptId);
        setDongList(data);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // 2. 동 변경 핸들러
  const onDongChange = async (selectedDongNo: string) => {
    const selectedDong = dongList.find((d) => d.dongNo === selectedDongNo);
    const dongId = selectedDong ? String(selectedDong.id) : "";

    updateFields({
      dongId: dongId,
      dongNo: selectedDongNo,
      hoId: "",
      hoNo: "",
    });
    setHoList([]);

    if (dongId) {
      try {
        const data = await getHoList(dongId);
        setHoList(data);
      } catch (e) {
        console.error(e);
      }
    }
  };

  // 3. 호 변경 핸들러 (추가됨)
  const onHoChange = (selectedHoNo: string) => {
    const selectedHo = hoList.find((h) => h.hoNo === selectedHoNo);
    updateFields({
      hoId: selectedHo ? String(selectedHo.id) : "",
      hoNo: selectedHoNo,
    });
  };
  // 4. 입주민 인증 핸들러
  const handleVerify = async () => {
    if (!formData.hoId || !formData.name || !formData.phone) {
      Alert.alert("안내", "입주민 인증 정보를 모두 입력해주세요.");
      return;
    }
    try {
      const response = await verify({
        hoId: Number(formData.hoId),
        name: formData.name,
        phone: formData.phone,
      });
      if (response.isVerified) {
        if (response.status === "ALREADY_EXISTS") {
          if (response.loginType === "NORMAL") {
            Alert.alert("안내", "이미 일반 계정으로 가입된 입주민입니다.");
          } else {
            Alert.alert("안내", `이미 ${response.loginType} 소셜 계정으로 가입된 입주민입니다.`);
          }
          router.replace("/login");
        } else if (response.status === "AVAILABLE") {
          Alert.alert("인증 성공", "입주민 정보가 확인되었습니다.\n이어서 회원가입을 진행해주세요.");
          setResidentId(response.residentId);
          setIsVerified(true);
        }
      } else {
        Alert.alert("인증 실패", response.message);
      }
    } catch (e) {
      Alert.alert("오류", "인증 중 문제가 발생했습니다.");
    }
  };

  // 5. 회원가입 핸들러
  const handleSignup = async (onSuccess: () => void) => {
    // 소셜 회원 여부 판단
    const isSocial = !!formData.registerToken;

    // [Step 1] 유효성 검사 분기 처리
    if (isSocial) {
      // 1-A. 소셜 회원가입: 아이디, 비밀번호 검사 제외
      if (!formData.email || !formData.birthDate || !formData.name || !formData.phone) {
        Alert.alert("오류", "필수 정보를 모두 입력해주세요.");
        return;
      }
    } else {
      // 1-B. 일반 회원가입: 아이디, 비밀번호 포함 모든 정보 검사
      if (!formData.loginId || !formData.password || !formData.email || !formData.birthDate) {
        Alert.alert("오류", "계정 정보를 모두 입력해주세요.");
        return;
      }
      if (formData.password !== formData.confirmPassword) {
        Alert.alert("오류", "비밀번호가 일치하지 않습니다.");
        return;
      }
    }

    // 유틸 함수 적용
    const formattedDate = formatDateToYYYYMMDD(formData.birthDate);

    try {
      // [Step 2] API 호출 데이터 구성
      const signupData = {
        residentId,
        // 소셜 회원은 loginId가 없으므로 이메일이나 providerId로 대체하거나 백엔드에서 처리
        loginId: isSocial ? formData.email : formData.loginId,
        // 소셜 회원은 비밀번호가 없지만 DB가 NotNull이라면 더미 값 전송 (백엔드에서 무시하도록 처리 권장)
        password: isSocial ? `SOCIAL_USER_${Math.random()}` : formData.password,
        email: formData.email,
        name: formData.name,
        phoneNumber: formData.phone,
        birthDate: formattedDate,
        loginType: isSocial ? formData.login_type.toUpperCase() : "NORMAL", // 'NAVER', 'GOOGLE' 등
        profileImg: null,
        // 소셜 토큰 및 정보 함께 전송
        registerToken: formData.registerToken,
        providerId: formData.providerId,
      };

      // API 호출 (응답값을 받도록 변수 할당)
      const response = await signup(signupData);

      // [Step 3] 가입 후 처리 (자동 로그인 vs 로그인 화면 이동)

      // 만약 백엔드에서 signup 응답으로 바로 { accessToken, refreshToken }을 준다면:
      if (response && response.accessToken) {
        await signIn(response.accessToken, response.accessToken); // Refresh 토큰 로직에 따라 수정
        Alert.alert("환영합니다", "회원가입과 로그인이 완료되었습니다.");
        // onSuccess는 router.replace('/') 처럼 메인으로 가는 로직이어야 함
      } else {
        // 백엔드가 토큰을 안 주면 로그인 화면으로 이동
        Alert.alert("가입 완료", "성공적으로 가입되었습니다. 로그인해주세요.", [{ text: "확인", onPress: onSuccess }]);
      }
    } catch (e: any) {
      console.error(e);
      const msg = e.response?.data?.message || "회원가입 실패";
      Alert.alert("오류", msg);
    }
  };

  return {
    formData,
    updateFields,
    apartmentList,
    dongList,
    hoList,
    isVerified,
    onApartmentChange,
    onDongChange,
    onHoChange,
    handleVerify,
    handleSignup,
  };
};
