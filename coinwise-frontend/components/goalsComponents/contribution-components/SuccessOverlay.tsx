import { colors } from "@/constants/colors";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

export const SuccessOverlay = ({ opacity }: { opacity: Animated.Value }) => (
  <Animated.View style={[styles.overlay, { opacity }]}>
    <View style={styles.content}>
      <Feather name="check-circle" size={60} color={colors.success} />
      <Text style={styles.text}>Contribution Added!</Text>
    </View>
  </Animated.View>
);

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  text: {
    fontSize: 20,
    fontWeight: "600",
    color: colors.text,
    marginTop: 16,
  },
});
