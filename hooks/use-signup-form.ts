import { getApartmentList, getDongList, getHoList, signup, verify } from "@/api/service/authService";
import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { formatDateToYYYYMMDD } from "@/utils/date"; // 앞서 만든 유틸 함수 사용 가정

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
  });
  // 입력 데이터를 보여주는 목록리스트
  const [apartmentList, setApartmentList] = useState<CodeItem[]>([]);
  const [dongList, setDongList] = useState<any[]>([]);
  const [hoList, setHoList] = useState<any[]>([]);

  // 인증 상태 관리 (false: 인증 전, true: 인증 완료) -> UI 블락처리를 위함.
  const [isVerified, setIsVerified] = useState(false);
  const [residentId, setResidentId] = useState<number | null>(null);

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
        setResidentId(response.residentId);
        setIsVerified(true);
        Alert.alert("인증 성공", "입주민 정보가 확인되었습니다.");
      } else {
        Alert.alert("인증 실패", response.message);
      }
    } catch (e) {
      Alert.alert("오류", "인증 중 문제가 발생했습니다.");
    }
  };

  // 5. 회원가입 핸들러
  const handleSignup = async (onSuccess: () => void) => {
    if (!formData.loginId || !formData.password || !formData.email || !formData.birthDate) {
      Alert.alert("오류", "계정 정보를 모두 입력해주세요.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      Alert.alert("오류", "비밀번호가 일치하지 않습니다.");
      return;
    }

    // 유틸 함수 적용 (필요 시)
    const formattedDate = formatDateToYYYYMMDD(formData.birthDate);

    try {
      await signup({
        residentId,
        loginId: formData.loginId,
        password: formData.password,
        email: formData.email,
        name: formData.name,
        phoneNumber: formData.phone,
        birthDate: formattedDate,
        loginType: "NORMAL",
        profileImg: null,
      });
      Alert.alert("가입 완료", "성공적으로 가입되었습니다.", [{ text: "확인", onPress: onSuccess }]);
    } catch (e) {
      Alert.alert("오류", "회원가입 실패");
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
