import { colors } from "@/constants/colors";
import { useTransactionContext } from "@/contexts/AppContext";
import { useAuth } from "@/contexts/AuthContext";
import { useStatsContext } from "@/contexts/StatsContext";
import { formatCurrency } from "@/hooks/home-page/formatHooks";
import { Feather, FontAwesome } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
const HomeHeader = () => {
  const router = useRouter();
  const { state } = useAuth();
  const { transactions } = useTransactionContext();
  const { monthlySummary } = useStatsContext();

  return (
    <LinearGradient
      colors={["rgb(251, 193, 105)", "rgb(198, 119, 0)"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.balanceSection}
    >
      {/* Quick Action Buttons */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("./transactions")}
        >
          <View style={styles.actionIconContainer}>
            <FontAwesome name="bank" size={24} color={colors.text} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("./profile")}
        >
          <View style={styles.actionIconContainer}>
            <Feather name="user" size={24} color={colors.text} />
          </View>
        </TouchableOpacity>
      </View>

      <View style={styles.balanceContainer}>
        <Text style={styles.greeting}>
          Welcome back, {state.user?.full_name?.split(" ")[1]}
        </Text>
        <Text style={styles.balanceLabel}>Balance</Text>
        <Text style={styles.balanceAmount}>
          {formatCurrency(monthlySummary?.balance || 0)}
        </Text>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  balanceSection: {
    paddingTop: Platform.OS === "ios" ? 100 : 80,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
  },
  svgContainer: {
    ...StyleSheet.absoluteFillObject,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    overflow: "hidden",
    zIndex: -1,
  },

  quickActions: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 10,
  },
  actionButton: {
    alignItems: "center",
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 255, 255, 0.25)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  balanceContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  greeting: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
    marginTop: Platform.OS === "ios" ? 30 : 20,
    fontFamily: "Montserrat",
  },

  balanceLabel: {
    color: colors.text,
    fontSize: 16,
    marginBottom: 8,
    fontWeight: "500",
    fontFamily: "Montserrat",
  },
  balanceAmount: {
    color: colors.text,
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    fontFamily: "Montserrat",
  },
});

export default HomeHeader;
