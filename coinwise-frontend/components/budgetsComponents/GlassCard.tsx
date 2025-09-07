import { BlurView } from "expo-blur";
import React from "react";
import { StyleSheet, View } from "react-native";

import { ReactNode } from "react";

interface GlassCardProps {
  children: ReactNode;
}

const GlassCard = ({ children }: GlassCardProps) => {
  return (
    <View style={styles.glassCard}>
      <BlurView intensity={15} tint="light" style={styles.glassCardBlur}>
        {children}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  glassCard: {
    borderRadius: 20,
    marginBottom: 16,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  glassCardBlur: {
    padding: 20,
    borderRadius: 20,
  },
});

export default GlassCard;
