// History — previous journal pages in reverse chronological order.
// Each card: date, total, goal indicator, section mini totals, note preview.
// Includes a small, calm streak label (informational only).

import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Screen, TopBar, IconButton } from "../components/common";
import { colors, spacing, radius, sectionTheme } from "../theme";
import { useApp } from "../context/AppContext";
import { prettyDate, isValidISODate } from "../data/dateUtils";
import {
  sectionTotals,
  dayTotal,
  goalForRecord,
  goalReached,
  computeStreaks,
  formatMl,
} from "../data/water";

function SectionPips({ sections }) {
  return (
    <View style={styles.pips}>
      {["Morning", "Afternoon", "Evening"].map((s) => (
        <View key={s} style={styles.pip}>
          <View
            style={[styles.pipDot, { backgroundColor: sectionTheme[s].water }]}
          />
          <Text style={styles.pipText}>{formatMl(sections[s])}</Text>
        </View>
      ))}
    </View>
  );
}

export default function HistoryScreen({ navigation }) {
  const { records, settings, deleteDay } = useApp();

  const sorted = useMemo(() => {
    const list = (Array.isArray(records) ? records : []).filter(
      (r) => r && isValidISODate(r.date)
    );
    return list.slice().sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [records]);

  const streaks = useMemo(
    () => computeStreaks(records, settings),
    [records, settings]
  );

  const confirmDelete = (date) => {
    Alert.alert(
      "Delete this day?",
      `${prettyDate(date)} will be permanently removed.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteDay(date),
        },
      ]
    );
  };

  return (
    <Screen>
      <TopBar
        title="Journal history"
        subtitle="Your past water pages"
        left={<IconButton label="‹ Back" onPress={() => navigation.goBack()} />}
      />

      {/* Calm streak label */}
      {streaks.best > 0 ? (
        <View style={styles.streakBar}>
          <Text style={styles.streakText}>
            Current streak: {streaks.current}{" "}
            {streaks.current === 1 ? "day" : "days"}
          </Text>
          <Text style={styles.streakDivider}>·</Text>
          <Text style={styles.streakText}>Best: {streaks.best}</Text>
        </View>
      ) : null}

      {sorted.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No water journal history yet.</Text>
          <Text style={styles.emptyBody}>
            Days you log will appear here as journal pages.
          </Text>
        </View>
      ) : (
        sorted.map((record) => {
          const totals = sectionTotals(record);
          const total = dayTotal(record);
          const goal = goalForRecord(record, settings.dailyGoalMl);
          const reached = goalReached(record, settings.dailyGoalMl);
          const note = (record.note || "").trim();
          return (
            <TouchableOpacity
              key={record.id || record.date}
              style={styles.card}
              onPress={() =>
                navigation.navigate("DayDetail", { date: record.date })
              }
              onLongPress={() => confirmDelete(record.date)}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={`Open ${prettyDate(record.date)}`}
            >
              <View style={styles.cardHeader}>
                <Text style={styles.cardDate}>{prettyDate(record.date)}</Text>
                <View style={styles.cardHeaderRight}>
                  <Text style={styles.cardTotal}>{total} ml</Text>
                  {total > 0 && reached ? (
                    <Text style={styles.goalTag}>Goal ✓</Text>
                  ) : (
                    <Text style={styles.goalTagMuted}>
                      of {goal}
                    </Text>
                  )}
                </View>
              </View>

              <SectionPips sections={totals} />

              {note ? (
                <Text style={styles.notePreview} numberOfLines={1}>
                  “{note}”
                </Text>
              ) : null}

              <View style={styles.cardFooter}>
                <Text style={styles.openText}>Open ›</Text>
                <TouchableOpacity
                  onPress={() => confirmDelete(record.date)}
                  accessibilityRole="button"
                  accessibilityLabel={`Delete ${prettyDate(record.date)}`}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  streakBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.panelAqua,
    borderRadius: radius.pill,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
  },
  streakText: { fontSize: 12, color: colors.tealDeep, fontWeight: "600" },
  streakDivider: { marginHorizontal: spacing.sm, color: colors.inkFaint },
  empty: { alignItems: "center", paddingVertical: spacing.xxl },
  emptyTitle: { fontSize: 15, fontWeight: "700", color: colors.ink },
  emptyBody: {
    fontSize: 13,
    color: colors.inkSoft,
    marginTop: 4,
    textAlign: "center",
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  cardDate: { fontSize: 15, fontWeight: "700", color: colors.ink },
  cardHeaderRight: { flexDirection: "row", alignItems: "center" },
  cardTotal: { fontSize: 14, fontWeight: "700", color: colors.inkSoft },
  goalTag: {
    fontSize: 10,
    color: colors.white,
    backgroundColor: colors.teal,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    overflow: "hidden",
    marginLeft: spacing.sm,
    fontWeight: "700",
  },
  goalTagMuted: {
    fontSize: 10,
    color: colors.inkFaint,
    marginLeft: spacing.sm,
  },
  pips: { flexDirection: "row", justifyContent: "space-between" },
  pip: { flexDirection: "row", alignItems: "center" },
  pipDot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  pipText: { fontSize: 12, color: colors.inkSoft },
  notePreview: {
    fontSize: 12,
    color: colors.inkSoft,
    fontStyle: "italic",
    marginTop: spacing.md,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.lineSoft,
    paddingTop: spacing.sm,
  },
  openText: { fontSize: 12, color: colors.teal, fontWeight: "600" },
  deleteText: { fontSize: 12, color: colors.danger, fontWeight: "600" },
});
