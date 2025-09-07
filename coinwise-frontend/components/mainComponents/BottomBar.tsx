import { colors } from "@/constants/colors";
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { usePathname, useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const tabs = [
  {
    name: "Finances",
    href: "/finances",
    icon: (color: string, size: number) => (
      <Feather name="credit-card" color={color} size={size} />
    ),
  },
  {
    name: "Stats",
    href: "/stats",
    icon: (color: string, size: number) => (
      <Feather name="bar-chart" color={color} size={size} />
    ),
  },
  {
    name: "Home",
    href: "/home",
    icon: (color: string, size: number) => (
      <Feather name="home" color={color} size={size} />
    ),
  },
  {
    name: "Goals",
    href: "/financial-goals",
    icon: (color: string, size: number) => (
      <Feather name="award" color={color} size={size} />
    ),
  },
  {
    name: "Budgets",
    href: "/budgets",
    icon: (color: string, size: number) => (
      <MaterialCommunityIcons
        name="piggy-bank-outline"
        size={size}
        color={color}
      />
    ),
  },
];

export default function BottomBar() {
  const pathname = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const bottomPadding = useMemo(() => {
    return Math.max(insets.bottom, 10);
  }, [insets.bottom]);

  const renderBackground = () => {
    if (Platform.OS === "ios") {
      return (
        <>
          <BlurView
            intensity={35}
            style={StyleSheet.absoluteFill}
            tint="dark"
          />
          <View style={[StyleSheet.absoluteFill, styles.iosOverlay]} />
        </>
      );
    } else {
      return (
        <View style={[StyleSheet.absoluteFill, styles.androidBackground]} />
      );
    }
  };

  return (
    <View style={[styles.wrapper, { paddingBottom: bottomPadding }]}>
      {renderBackground()}
      <View style={styles.container}>
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;

          return (
            <TouchableOpacity
              key={tab.href}
              style={styles.tab}
              activeOpacity={0.7}
              onPress={() => {
                if (pathname !== tab.href) {
                  router.replace(tab.href as any);
                }
              }}
            >
              <View style={styles.iconContainer}>
                {tab.icon(isActive ? colors.primary[500] : colors.text, 24)}
              </View>
              <Text
                style={[
                  styles.label,
                  {
                    color: isActive ? colors.primary[500] : colors.text,
                    opacity: isActive ? 1 : 0.8,
                  },
                ]}
              >
                {tab.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
    borderTopWidth: 1,
    borderTopColor: `${colors.secondaryLight}`,
  },
  androidBackground: {
    backgroundColor: `${colors.secondary}99`,
    borderTopWidth: 1,
    borderTopColor: `${colors.secondaryLight}30`,
  },
  iosOverlay: {
    backgroundColor: `${colors.secondary}40`,
  },
  container: {
    flexDirection: "row",
    paddingTop: 16,
    paddingBottom: 10,
    justifyContent: "space-around",
    alignItems: "center",
  },
  tab: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 10,
    gap: 4,
  },
  iconContainer: {
    alignItems: "center",
    justifyContent: "center",
    height: 40,
    position: "relative",
  },
  label: {
    fontSize: 11,
    fontWeight: "500",
    textAlign: "center",
    fontFamily: "Montserrat",
  },
});
