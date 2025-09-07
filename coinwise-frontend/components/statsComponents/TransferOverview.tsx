import { colors } from "@/constants/colors";
import { TransferStats } from "@/models/stats";
import { capitalizeName } from "@/utils/capitalization";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type Props = {
  data: TransferStats;
};

export const TransferOverview: React.FC<Props> = ({ data }) => {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Transfer Overview</Text>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.label}>Received</Text>
          <Text style={[styles.amount, { color: colors.success }]}>
            {new Intl.NumberFormat("ro-RO").format(data.totalReceived)}
          </Text>
          <Text style={styles.count}>{data.totalTransfers} total</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.label}>Sent</Text>
          <Text style={[styles.amount, { color: colors.error }]}>
            {new Intl.NumberFormat("ro-RO").format(data.totalSent)}
          </Text>
          <Text style={styles.count}>{data.totalTransfers} total</Text>
        </View>

        <View style={styles.statItem}>
          <Text style={styles.label}>Net Flow</Text>
          <Text
            style={[
              styles.amount,
              {
                color: data.netFlow >= 0 ? colors.success : colors.error,
              },
            ]}
          >
            {new Intl.NumberFormat("ro-RO").format(data.netFlow)}
          </Text>
        </View>
      </View>

      {data.top5Transfers.length > 0 && (
        <>
          <Text style={[styles.title, { marginTop: 20 }]}>Top Transfers</Text>
          {data.top5Transfers.map((tx, index) => (
            <View key={tx.id} style={styles.transferItem}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  <Feather name="user" size={20} color={colors.textSecondary} />
                </Text>
              </View>
              <View style={styles.txInfo}>
                <Text style={styles.txName}>
                  {tx.sender &&
                    tx.receiver &&
                    `${capitalizeName(tx.sender)} to ${capitalizeName(
                      tx.receiver
                    )}`}
                </Text>
                <Text style={styles.txMeta}>
                  {new Date(tx.date).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.txAmount}>{tx.amount.toFixed(0)} RON</Text>
            </View>
          ))}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statItem: {
    flex: 1,
    marginHorizontal: 4,
    backgroundColor: `${colors.backgroundDark}40`,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
  },
  label: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: "500",
  },
  amount: {
    fontSize: 18,
    fontWeight: "700",
    marginVertical: 4,
    fontFamily: "Montserrat",
    textAlign: "center",
  },
  count: {
    fontSize: 10,
    color: colors.textSecondary,
  },
  transferItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: `${colors.backgroundDark}50`,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.backgroundDark}50`,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: {
    fontSize: 20,
  },
  txInfo: {
    flex: 1,
  },
  txName: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "500",
  },
  txMeta: {
    color: colors.textSecondary,
    fontSize: 12,
  },
  txAmount: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "600",
  },
});
