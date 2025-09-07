import { colors } from "@/constants/colors";
import { useTransactionContext } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useBudgets } from "@/contexts/BudgetsContext";
import { useGoals } from "@/contexts/GoalsContext";
import { Feather, Ionicons, MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const ProfileScreen = () => {
  const { signOut, deleteAccount, state } = useAuth();
  const { transactionsCleanup } = useTransactionContext();
  const { budgetCleanup } = useBudgets();
  const { goalsCleanup } = useGoals();

  const menuItems = [
    {
      icon: "help-circle-outline",
      iconLib: "Ionicons",
      label: "Help",
      badge: null,
    },
    {
      icon: "person-outline",
      iconLib: "Ionicons",
      label: "Account",
      badge: null,
    },
    {
      icon: "document-text-outline",
      iconLib: "Ionicons",
      label: "Documents & statements",
      badge: null,
    },
    { icon: "bulb-outline", iconLib: "Ionicons", label: "Learn", badge: null },
    { icon: "mail-outline", iconLib: "Ionicons", label: "Inbox", badge: 6 },
  ];

  const settingsItems = [
    {
      icon: "shield-checkmark-outline",
      iconLib: "Ionicons",
      label: "Security",
      badge: 1,
    },
    { icon: "eye-outline", iconLib: "Ionicons", label: "Privacy", badge: null },
    {
      icon: "notifications-outline",
      iconLib: "Ionicons",
      label: "Notification settings",
      badge: null,
    },
    {
      icon: "color-palette-outline",
      iconLib: "Ionicons",
      label: "Appearance",
      badge: null,
    },
    {
      icon: "accessibility-outline",
      iconLib: "Ionicons",
      label: "Accessibility",
      badge: null,
    },
    {
      icon: "sparkles-outline",
      iconLib: "Ionicons",
      label: "New features",
      badge: null,
    },
  ];

  const bottomItems = [
    {
      icon: "log-out-outline",
      iconLib: "Ionicons",
      label: "Log out",
      badge: null,
      onPress: () => {
        transactionsCleanup();
        budgetCleanup();
        goalsCleanup();
        signOut();
        router.push("/auth/sign-in");
      },
    },
    {
      icon: "delete",
      iconLib: "Feather",
      label: "Delete account",
      badge: null,
      onPress: () => {
        Alert.alert(
          "Delete Account",
          "Are you sure you want to permanently delete your account? This action cannot be undone.",
          [
            {
              text: "Cancel",
              style: "cancel",
            },
            {
              text: "Delete",
              style: "destructive",
              onPress: async () => {
                try {
                  await deleteAccount();
                  router.push("/auth/sign-up");
                } catch (err) {
                  console.error("Failed to delete account:", err);
                  Alert.alert(
                    "Error",
                    "Something went wrong while deleting your account."
                  );
                }
              },
            },
          ],
          { cancelable: false }
        );
      },
    },
  ];
  useEffect(() => {}, []);

  const renderIcon = (
    iconName: string,
    iconLib: string,
    size = 20,
    color = colors.text
  ) => {
    if (iconLib === "Ionicons") {
      return (
        <Ionicons
          name={iconName as React.ComponentProps<typeof Ionicons>["name"]}
          size={size}
          color={color}
        />
      );
    } else if (iconLib === "MaterialIcons") {
      return (
        <MaterialIcons
          name={iconName as React.ComponentProps<typeof MaterialIcons>["name"]}
          size={size}
          color={color}
        />
      );
    } else if (iconLib === "Feather") {
      return (
        <Feather
          name={iconName as React.ComponentProps<typeof Feather>["name"]}
          size={size}
          color={colors.error}
        />
      );
    }
  };

  type MenuItemProps = {
    icon: string;
    iconLib: string;
    label: string;
    badge: number | null;
    isLast?: boolean;
    onPress?: () => void;
  };

  const MenuItem: React.FC<MenuItemProps> = ({
    icon,
    iconLib,
    label,
    badge,
    isLast = false,
    onPress = () => {},
  }) => (
    <TouchableOpacity
      style={[styles.menuItem, isLast && styles.lastMenuItem]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <View style={styles.menuItemLeft}>
        {renderIcon(icon, iconLib)}
        <Text style={styles.menuItemText}>{label}</Text>
      </View>
      {badge && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
  const getInitials = (name: string) => {
    const names = name.split(" ");
    if (names.length === 0) return "";
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    const initials = names.map((n) => n.charAt(0).toUpperCase());
    return initials.slice(0, 2).join("");
  };
  const avatarInitials = getInitials(state.user?.full_name || "User");
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              router.back();
            }}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.upgradeButton} activeOpacity={0.7}>
            <Ionicons
              name="diamond-outline"
              size={16}
              color={colors.primary["400"]}
            />
            <Text style={styles.upgradeText}>Upgrade</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Section */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarInitials}</Text>
          </View>
          <Text style={styles.profileName}>{state.user?.full_name}</Text>
          <View style={styles.profileHandle}>
            <Text style={styles.handleText}>{state.user?.email}</Text>
            <View style={styles.verifiedBadge}>
              <Ionicons name="checkmark" size={12} color={colors.text} />
            </View>
          </View>
        </View>

        {/* Bottom Items */}
        <View style={styles.menuSection}>
          {bottomItems.map((item, index) => (
            <MenuItem
              key={index}
              {...item}
              isLast={index === bottomItems.length - 1}
            />
          ))}
        </View>

        {/* Version Info */}
        <View style={styles.versionInfo}>
          <Text style={styles.versionText}>Version 1.0.0</Text>
          <Text style={styles.versionText}>CoinWise - Financial Freedom</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  upgradeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.backgroundLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  upgradeText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "500",
  },
  profileSection: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.secondary["400"],
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "bold",
  },
  profileName: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
  },
  profileHandle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  handleText: {
    color: colors.textSecondary,
    fontSize: 16,
  },
  verifiedBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  planCards: {
    flexDirection: "row",
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 32,
  },
  planCard: {
    flex: 1,
    backgroundColor: colors.backgroundLight,
    padding: 16,
    borderRadius: 12,
  },
  planIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  planTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  planSubtitle: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  menuSection: {
    marginHorizontal: 16,
    backgroundColor: colors.backgroundLight,
    borderRadius: 12,
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.backgroundDark,
  },
  lastMenuItem: {
    borderBottomWidth: 0,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuItemText: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "500",
  },
  badge: {
    backgroundColor: colors.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    minWidth: 24,
    alignItems: "center",
  },
  badgeText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "600",
  },
  versionInfo: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  versionText: {
    color: colors.textMuted,
    fontSize: 14,
    marginBottom: 4,
  },
});

export default ProfileScreen;
