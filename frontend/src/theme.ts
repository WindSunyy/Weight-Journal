import {
  MD3LightTheme as DefaultTheme,
  MD3DarkTheme,
} from "react-native-paper";

export const MonochromeDarkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#111111",
    onPrimary: "#ffffff",
    primaryContainer: "#f3f4f6",
    surface: "#ffffff",
    onSurface: "#111827", // 深灰黑，提升对比度
    surfaceVariant: "#f3f4f6",
    outline: "#e5e7eb",
    secondary: "#374151", // 文本次级色更深
    onSecondary: "#ffffff",
    background: "#ffffff",
  },
};

export const MonochromeLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: "#000000",
    onPrimary: "#ffffff",
    primaryContainer: "#f3f3f3",
    surface: "#ffffff",
    onSurface: "#111111",
    surfaceVariant: "#f7f7f7",
    outline: "#d0d0d0",
    secondary: "#666666",
    onSecondary: "#ffffff",
    background: "#ffffff",
  },
};
