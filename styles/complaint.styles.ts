// 예시 스타일 (프로젝트 스타일에 맞춰 조정하세요)
import { Dimensions, StyleSheet } from "react-native";

const { width } = Dimensions.get("window");

export const styles = StyleSheet.create({
  // 공통 컨테이너
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  content: {
    padding: 20,
  },

  // 헤더 스타일 (목록, 상세, 등록 공통)
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },

  // 상세/등록 페이지용 헤더
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  detailHeaderTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },

  // 목록 카드 스타일
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  dateText: {
    fontSize: 13,
    color: "#6b7280",
  },

  // 상태 배지 (PENDING, PROCESSING, COMPLETED)
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    backgroundColor: "#eff6ff",
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1d4ed8",
  },

  // 상세 페이지 전용
  detailContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  detailContent: {
    padding: 20,
  },
  detailTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#111827",
    marginBottom: 8,
  },
  detailMeta: {
    marginBottom: 16,
  },
  detailDate: {
    fontSize: 14,
    color: "#6b7280",
  },
  divider: {
    height: 1,
    backgroundColor: "#f3f4f6",
    marginVertical: 20,
  },
  detailBody: {
    fontSize: 16,
    lineHeight: 24,
    color: "#374151",
  },

  // 관리자 답변 영역
  answerSection: {
    marginTop: 30,
    padding: 16,
    backgroundColor: "#f0f9ff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#bae6fd",
  },
  answerHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  answerTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0369a1",
    marginLeft: 6,
  },
  answerBody: {
    fontSize: 15,
    color: "#0c4a6e",
    lineHeight: 22,
  },

  // 등록 페이지 입력창 스타일
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#fff",
    color: "#111827",
  },
  textArea: {
    minHeight: 200,
    paddingTop: 12,
  },

  // 버튼 스타일
  submitButton: {
    backgroundColor: "#0a7ea4",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 30,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#9ca3af",
  },
  editButton: {
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#0a7ea4",
    alignItems: "center",
  },
  editButtonText: {
    color: "#0a7ea4",
    fontWeight: "600",
  },

  // 텅 비었을 때
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 100,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: "#9ca3af",
  },
});
