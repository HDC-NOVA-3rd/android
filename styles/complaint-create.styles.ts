import { StyleSheet } from "react-native";

export const createStyles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#ffffff" 
  },
  // 헤더 스타일
  detailHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  detailHeaderTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111827",
  },
  // 입력 폼 스타일
  content: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#111827",
  },
  textArea: {
    height: 250,
    textAlignVertical: "top",
  },
  // 버튼 스타일
  submitButton: {
    backgroundColor: "#2563eb",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    // 그림자 효과 (iOS/Android)
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  disabledButton: {
    backgroundColor: "#93c5fd",
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});