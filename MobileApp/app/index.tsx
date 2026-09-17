import { Image } from "expo-image";
import { router } from "expo-router";
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import PrimaryButton from "../components/auth/PrimaryButton";
import { COLORS } from "../constants/colors";

const { width } = Dimensions.get("window");

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      {/* Background / Hero Image */}
      <View style={styles.illustrationContainer}>
        <Image
          source={require("../assets/images/home-banner.png")}
          style={styles.heroImage}
          contentFit="cover"
        />
        {/* Lớp phủ mờ (overlay) để làm dịu ảnh nếu cần */}
        <View style={styles.overlay} />
      </View>

      <View style={styles.contentContainer}>
        <Image
          source={require("../assets/images/bookmart_logo.png")}
          style={styles.logo}
          contentFit="contain"
        />
        <Text style={styles.title}>Chào mừng bạn</Text>
        <Text style={styles.subtitle}>
          Khám phá thế giới tri thức vô tận cùng BookMart. Đọc, học hỏi và phát
          triển mỗi ngày!
        </Text>

        <View style={styles.buttonContainer}>
          {/* Primary Action (Đăng ký) */}
          <PrimaryButton
            title="Bắt đầu ngay"
            onPress={() => router.push("/(auth)/register")}
          />

          {/* Secondary Action (Đăng nhập) */}
          <TouchableOpacity
            style={styles.loginLinkContainer}
            activeOpacity={0.8}
            onPress={() => router.push("/(auth)/login")}
          >
            <Text style={styles.loginLinkText}>
              Bạn đã có tài khoản?{" "}
              <Text style={styles.loginLinkHighlight}>Đăng nhập</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  illustrationContainer: {
    flex: 1.3,
    width: "100%",
    borderBottomLeftRadius: 60,
    borderBottomRightRadius: 60,
    overflow: "hidden",
    backgroundColor: COLORS.primaryLight,
  },
  heroImage: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.1)", // Phủ mờ nhẹ
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 40,
    paddingBottom: 40,
    alignItems: "center",
    justifyContent: "space-between", // Trải đều khoảng trắng
  },
  logo: {
    width: 200,
    height: 100,
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: COLORS.text,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  buttonContainer: {
    width: "100%",
    marginTop: "auto", // Đẩy phần nút xuống dưới cùng
    gap: 20,
  },
  loginLinkContainer: {
    alignItems: "center",
    paddingVertical: 10,
  },
  loginLinkText: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  loginLinkHighlight: {
    color: COLORS.primary,
    fontWeight: "700",
  },
});
