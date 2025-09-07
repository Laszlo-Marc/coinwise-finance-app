import { colors } from "@/constants/colors";
import React from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

interface Props {
  progressAnim: Animated.Value;
  percentage: number;
  color: string;
}

export const ProgressCircle = ({ progressAnim, percentage, color }: Props) => {
  return (
    <View style={styles.progressCircleContainer}>
      <View style={styles.progressCircle}>
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor: color,
              width: progressAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
              borderRadius: 10,
            },
          ]}
        />
        <Text style={styles.progressText}>{percentage.toFixed(0)}%</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  progressCircleContainer: {
    alignItems: "center",
    marginVertical: 24,
  },
  progressCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  progressText: {
    fontSize: 32,
    fontWeight: "bold",
    color: colors.text,
  },
});
