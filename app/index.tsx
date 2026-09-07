import { Redirect } from 'expo-router';

export default function Index() {
  // Tự động chuyển hướng vào màn hình login khi mở app
  return <Redirect href="/(auth)/login" />;
}