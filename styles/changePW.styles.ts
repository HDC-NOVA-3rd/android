// styles/changePW.styles.ts
import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollContent: {
    padding: 16,
    justifyContent: "center",
    minHeight: "100%",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logoTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#111827",
  },
  logoSubtitle: {
    fontSize: 16,
    color: "#6b7280",
  },
  formSpace: {
    gap: 16,
  },
  submitButton: {
    marginTop: 8,
  },
  buttonText: {
    color: "white",
    fontWeight: "500",
  },
  backContainer: {
    marginTop: 24,
    alignItems: "center",
  },
  backLink: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    textDecorationLine: "underline",
  },
  inputNote: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
    marginLeft: 4,
  }
});
