// components/LoadingScreen.tsx
import { colors } from "@/constants/colors";
import React from "react";
import { ActivityIndicator, Image, StyleSheet, Text, View } from "react-native";

export const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <Image
        source={require("../../assets/images/logo1.png")}
        style={styles.logo}
        resizeMode="contain"
      />
      <ActivityIndicator
        size="large"
        color={colors.primary[500]}
        style={{ marginTop: 20 }}
      />
      <Text style={styles.text}>Loading, please wait...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 150,
    height: 150,
  },
  text: {
    marginTop: 12,
    fontSize: 16,
    color: colors.text,
    fontFamily: "Montserrat",
  },
});
