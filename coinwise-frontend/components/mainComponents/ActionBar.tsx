import { colors } from "@/constants/colors";
import { Feather } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { ReactNode } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export type ActionBarButton = {
  icon: keyof typeof Feather.glyphMap;
  onPress: () => void;
  accessibilityLabel?: string;
};

interface ActionBarProps {
  title: string;

  leftButton?: ActionBarButton;

  rightButton?: ActionBarButton;

  actionButtons?: ActionBarButton[];

  children?: ReactNode;

  gradientStartColor?: string;

  gradientEndColor?: string;

  style?: ViewStyle;
}

export default function ActionBar({
  title,
  leftButton,
  rightButton,
  actionButtons = [],
  children,
  gradientStartColor = "rgb(198, 119, 0)",
  gradientEndColor = "rgb(251, 193, 105)",
  style,
}: ActionBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <LinearGradient
      colors={[gradientStartColor, gradientEndColor]}
      start={{ x: 1, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[styles.container, { paddingTop: insets.top + 10 }, style]}
    >
      {/* Buttons row at the top */}
      <View style={styles.buttonsContainer}>
        {/* Left button or placeholder */}
        <View style={styles.sideButtonContainer}>
          {leftButton ? (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={leftButton.onPress}
              accessibilityLabel={
                leftButton.accessibilityLabel || leftButton.icon
              }
            >
              <Feather name={leftButton.icon} size={20} color={colors.text} />
            </TouchableOpacity>
          ) : (
            <View style={styles.iconPlaceholder} />
          )}
        </View>
        {/* Title underneath the buttons */}
        <View style={styles.titleContainer}>
          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={1}
          >
            {title}
          </Text>
        </View>

        {/* Right button or placeholder */}
        <View style={styles.sideButtonContainer}>
          {rightButton ? (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={rightButton.onPress}
              accessibilityLabel={
                rightButton.accessibilityLabel || rightButton.icon
              }
            >
              <Feather name={rightButton.icon} size={20} color={colors.text} />
            </TouchableOpacity>
          ) : (
            <View style={styles.iconPlaceholder} />
          )}
        </View>
      </View>

      {/* Optional children */}
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingBottom: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonsContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  sideButtonContainer: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  titleContainer: {
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    fontFamily: "Montserrat",
  },
  iconButton: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  iconPlaceholder: {
    width: 40,
    height: 40,
  },
  actionsContainer: {
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
});
