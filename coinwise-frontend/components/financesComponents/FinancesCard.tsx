import { MaterialIcons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../../constants/colors";

type SimpleCardProps = {
  header: string;
  content: string;
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  textColor?: string;
};
export function FinancesCard({ header, content, icon }: SimpleCardProps) {
  return (
    <View style={styles.card}>
      <TouchableOpacity style={styles.sectionHeaderButton}>
        <Text style={styles.sectionHeaderText}>{header}</Text>
      </TouchableOpacity>
      <MaterialIcons name={icon} size={24} color="white" />
      <View style={styles.cardContent}>
        <Text style={styles.cardText}>{content}</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignContent: "center",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  sectionHeaderButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionHeaderText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "500",
    fontFamily: "Montserrat",
    textTransform: "capitalize",
  },
  cardContent: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 30,
  },
  cardText: {
    color: colors.text,
    fontSize: 18,
    marginTop: 10,
    textAlign: "center",
    fontFamily: "Montserrat",
  },
});
