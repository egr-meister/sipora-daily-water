// Daily Water Journal — the main screen.
// A three-part journal page: compact header, small daily header, three
// stacked section panels with their own quick adds, a paper note at the
// bottom, gentle reminder prompts, and a seven-day mini preview.

import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Screen, TopBar, IconButton, WaterBar } from "../components/common";
import WaterSection from "../components/WaterSection";
import { colors, spacing, radius } from "../theme";
import { useApp } from "../context/AppContext";
import { QUICK_AMOUNTS } from "../data/defaults";
import { todayISO, prettyDate, longWeekday, weekDates } from "../data/dateUtils";
import {
  sectionTotals,
  dayTotal,
  goalForRecord,
  progressRatio,
  progressLabel,
  percentLabel,
  getEntries,
  computeReminders,
  sectionReminderLabel,
  findRecord,
} from "../data/water";

function amountLabel(amt) {
  return `${amt} ml`;
}

function MiniWeek({ records, settings, onPress }) {
  const today = todayISO();
  const dates = weekDates(today, settings.weekStartsOn);
  const goal = Math.max(1, Number(settings.dailyGoalMl) || 2000);
  const max = dates.reduce((m, d) => {
    const r = findRecord(records, d);
    return Math.max(m, dayTotal(r));
  }, 0);
  return (
    <TouchableOpacity
      style={styles.weekCard}
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel="Open weekly overview"
    >
      <View style={styles.weekHeader}>
        <Text style={styles.weekTitle}>This week</Text>
        <Text style={styles.weekLink}>Overview ›</Text>
      </View>
      <View style={styles.weekRow}>
        {dates.map((d) => {
          const r = findRecord(records, d);
          const total = dayTotal(r);
          const ratio = max > 0 ? total / max : 0;
          const reached = total >= goalForRecord(r, goal);
          const isToday = d === today;
          return (
            <View key={d} style={styles.weekCol}>
              <View style={styles.weekBarTrack}>
                <View
                  style={[
                    styles.weekBarFill,
                    {
                      height: `${Math.max(6, ratio * 100)}%`,
                      backgroundColor: reached
                        ? colors.teal
                        : total > 0
                        ? colors.sky
                        : colors.lineSoft,
                    },
                  ]}
                />
              </View>
              <Text
                style={[styles.weekDay, isToday && styles.weekDayToday]}
              >
                {longWeekday(d).slice(0, 1)}
              </Text>
            </View>
          );
        })}
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen({ navigation }) {
  const {
    records,
    settings,
    getRecord,
    addEntry,
  } = useApp();

  const date = todayISO();
  const record = getRecord(date);
  const totals = sectionTotals(record);
  const total = dayTotal(record);
  const goal = goalForRecord(record, settings.dailyGoalMl);
  const ratio = progressRatio(total, goal);
  const note = (record && record.note) || "";
  const hasEntries = getEntries(record).length > 0;

  const reminders = useMemo(
    () => computeReminders(record, settings),
    [record, settings]
  );

  const goToEntry = (section) =>
    navigation.navigate("EditEntry", { date, section, mode: "add" });

  const openEntry = (entry) =>
    navigation.navigate("EditEntry", {
      date,
      section: entry.section,
      mode: "edit",
      entryId: entry.id,
    });

  const quickAdd = (section, amt) =>
    addEntry(date, section, amt, amountLabel(amt));

  return (
    <Screen>
      <TopBar
        title="Sipora"
        subtitle="Daily Water Journal"
        right={
          <IconButton
            label="Settings"
            onPress={() => navigation.navigate("Settings")}
            tone="teal"
          />
        }
        left={
          <IconButton
            label="History"
            onPress={() => navigation.navigate("History")}
          />
        }
      />

      {/* Small journal header (not a generic stats card) */}
      <View style={styles.journalHeader}>
        <View style={styles.dateRow}>
          <Text style={styles.dateText}>{prettyDate(date)}</Text>
          <Text style={styles.manualTag}>Manual journal</Text>
        </View>
        <View style={styles.totalRow}>
          <Text style={styles.totalValue}>{total}</Text>
          <Text style={styles.totalUnit}>ml today</Text>
        </View>
        <WaterBar ratio={ratio} color={colors.skyDeep} height={10} />
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>{progressLabel(total, goal)}</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Goal")}
            accessibilityRole="button"
            accessibilityLabel="Edit daily goal"
          >
            <Text style={styles.percentLabel}>{percentLabel(total, goal)}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Gentle in-app reminder card */}
      {reminders.length > 0 ? (
        <View style={styles.reminderCard}>
          <Text style={styles.reminderTitle}>A gentle note</Text>
          {reminders.map((r) => (
            <Text key={r.id} style={styles.reminderLine}>
              • {r.text}
            </Text>
          ))}
        </View>
      ) : null}

      {/* Empty state */}
      {!hasEntries ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>No water logged today</Text>
          <Text style={styles.emptyBody}>
            Add your first drink to one of the day sections below.
          </Text>
        </View>
      ) : null}

      {/* Three journal sections: Morning / Afternoon / Evening */}
      {["Morning", "Afternoon", "Evening"].map((section) => (
        <WaterSection
          key={section}
          section={section}
          total={totals[section]}
          goalHint={Math.max(1, Math.round(goal / 3))}
          entries={getEntries(record).filter((e) => e.section === section)}
          quickAmounts={QUICK_AMOUNTS}
          onQuickAdd={(amt) => quickAdd(section, amt)}
          onAddCustom={() => goToEntry(section)}
          onPressEntry={openEntry}
          reminderText={sectionReminderLabel(record, section, settings)}
          compact={settings.compactMode}
        />
      ))}

      {/* Daily note — paper note at the bottom */}
      <TouchableOpacity
        style={styles.noteCard}
        onPress={() => navigation.navigate("DayDetail", { date })}
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Open today's note"
      >
        <View style={styles.noteHeader}>
          <Text style={styles.noteTitle}>Today's note</Text>
          <Text style={styles.noteEdit}>Edit ›</Text>
        </View>
        <Text style={note ? styles.noteText : styles.notePlaceholder}>
          {note ? note : "Tap to add a short note for today…"}
        </Text>
      </TouchableOpacity>

      {/* Weekly mini preview */}
      <MiniWeek
        records={records}
        settings={settings}
        onPress={() => navigation.navigate("Weekly")}
      />

      <View style={styles.footerNav}>
        <TouchableOpacity
          onPress={() => navigation.navigate("DayDetail", { date })}
          accessibilityRole="button"
          accessibilityLabel="Open full day detail"
        >
          <Text style={styles.footerLink}>Open full day</Text>
        </TouchableOpacity>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  journalHeader: {
    backgroundColor: colors.panelAqua,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.line,
  },
  dateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  dateText: { fontSize: 14, fontWeight: "700", color: colors.ink },
  manualTag: {
    fontSize: 10,
    color: colors.tealDeep,
    backgroundColor: colors.panelAquaDeep,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    overflow: "hidden",
    fontWeight: "700",
  },
  totalRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: spacing.md },
  totalValue: { fontSize: 40, fontWeight: "800", color: colors.ink, lineHeight: 44 },
  totalUnit: { fontSize: 14, color: colors.inkSoft, marginLeft: 8, marginBottom: 6 },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  progressLabel: { fontSize: 12, color: colors.inkSoft },
  percentLabel: { fontSize: 12, color: colors.teal, fontWeight: "700" },
  reminderCard: {
    backgroundColor: colors.noteCard,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: colors.sand,
  },
  reminderTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  reminderLine: { fontSize: 13, color: colors.inkSoft, lineHeight: 20 },
  emptyState: {
    alignItems: "center",
    paddingVertical: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyTitle: { fontSize: 15, fontWeight: "700", color: colors.ink },
  emptyBody: {
    fontSize: 13,
    color: colors.inkSoft,
    marginTop: 4,
    textAlign: "center",
  },
  noteCard: {
    backgroundColor: colors.noteCard,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.sand,
  },
  noteHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.sm,
  },
  noteTitle: { fontSize: 13, fontWeight: "700", color: colors.ink },
  noteEdit: { fontSize: 12, color: colors.teal, fontWeight: "600" },
  noteText: { fontSize: 14, color: colors.ink, lineHeight: 20 },
  notePlaceholder: { fontSize: 14, color: colors.inkFaint, fontStyle: "italic" },
  weekCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.line,
    marginBottom: spacing.lg,
  },
  weekHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  weekTitle: { fontSize: 13, fontWeight: "700", color: colors.ink },
  weekLink: { fontSize: 12, color: colors.teal, fontWeight: "600" },
  weekRow: { flexDirection: "row", justifyContent: "space-between" },
  weekCol: { alignItems: "center", flex: 1 },
  weekBarTrack: {
    width: 14,
    height: 48,
    backgroundColor: colors.lineSoft,
    borderRadius: radius.pill,
    justifyContent: "flex-end",
    overflow: "hidden",
  },
  weekBarFill: { width: 14, borderRadius: radius.pill },
  weekDay: { fontSize: 10, color: colors.inkFaint, marginTop: 6 },
  weekDayToday: { color: colors.teal, fontWeight: "800" },
  footerNav: { alignItems: "center", paddingVertical: spacing.sm },
  footerLink: { fontSize: 13, color: colors.teal, fontWeight: "600" },
});
