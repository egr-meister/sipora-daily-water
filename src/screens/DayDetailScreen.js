// Day Detail — a single journal page for a selected date.
// Shows total, goal progress, the three sections with all entries,
// a daily note editor, and a reset-day action.

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Alert,
  TouchableOpacity,
} from "react-native";
import {
  Screen,
  TopBar,
  IconButton,
  WaterBar,
  Banner,
  PrimaryButton,
} from "../components/common";
import WaterSection from "../components/WaterSection";
import { colors, spacing, radius } from "../theme";
import { useApp } from "../context/AppContext";
import { QUICK_AMOUNTS } from "../data/defaults";
import { todayISO, isValidISODate, prettyDate } from "../data/dateUtils";
import {
  sectionTotals,
  dayTotal,
  goalForRecord,
  progressRatio,
  progressLabel,
  percentLabel,
  getEntries,
} from "../data/water";

export default function DayDetailScreen({ route, navigation }) {
  const params = (route && route.params) || {};
  const date = isValidISODate(params.date) ? params.date : todayISO();

  const { getRecord, settings, addEntry, setNote, clearDay } = useApp();
  const record = getRecord(date);

  const [noteDraft, setNoteDraft] = useState((record && record.note) || "");
  const [banner, setBanner] = useState(null);

  const totals = sectionTotals(record);
  const total = dayTotal(record);
  const goal = goalForRecord(record, settings.dailyGoalMl);
  const ratio = progressRatio(total, goal);

  const isToday = date === todayISO();

  const quickAdd = (section, amt) => {
    addEntry(date, section, amt, `${amt} ml`);
  };

  const openEntry = (entry) =>
    navigation.navigate("EditEntry", {
      date,
      section: entry.section,
      mode: "edit",
      entryId: entry.id,
    });

  const saveNote = () => {
    setNote(date, noteDraft);
    setBanner({ tone: "success", text: "Note saved." });
  };

  const confirmClear = () => {
    Alert.alert(
      "Clear this day?",
      "This removes all drinks and the note for this day. This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear day",
          style: "destructive",
          onPress: () => {
            clearDay(date);
            setNoteDraft("");
            setBanner({ tone: "info", text: "Day cleared." });
          },
        },
      ]
    );
  };

  return (
    <Screen>
      <TopBar
        title={isToday ? "Today" : "Day journal"}
        subtitle={prettyDate(date)}
        left={
          <IconButton label="‹ Back" onPress={() => navigation.goBack()} />
        }
        right={<IconButton label="Clear" tone="teal" onPress={confirmClear} />}
      />

      <Banner text={banner && banner.text} tone={banner && banner.tone} />

      <View style={styles.header}>
        <View style={styles.totalRow}>
          <Text style={styles.totalValue}>{total}</Text>
          <Text style={styles.totalUnit}>ml</Text>
        </View>
        <WaterBar ratio={ratio} color={colors.skyDeep} height={10} />
        <View style={styles.progressRow}>
          <Text style={styles.progressLabel}>{progressLabel(total, goal)}</Text>
          <Text style={styles.percentLabel}>{percentLabel(total, goal)}</Text>
        </View>
      </View>

      {["Morning", "Afternoon", "Evening"].map((section) => (
        <WaterSection
          key={section}
          section={section}
          total={totals[section]}
          goalHint={Math.max(1, Math.round(goal / 3))}
          entries={getEntries(record).filter((e) => e.section === section)}
          quickAmounts={QUICK_AMOUNTS}
          onQuickAdd={(amt) => quickAdd(section, amt)}
          onAddCustom={() =>
            navigation.navigate("EditEntry", { date, section, mode: "add" })
          }
          onPressEntry={openEntry}
          compact={settings.compactMode}
        />
      ))}

      {/* Daily note editor */}
      <View style={styles.noteCard}>
        <Text style={styles.noteTitle}>Daily note</Text>
        <TextInput
          style={styles.noteInput}
          value={noteDraft}
          onChangeText={setNoteDraft}
          placeholder="Hot day • Workout day • Mostly tea…"
          placeholderTextColor={colors.inkFaint}
          multiline
          maxLength={280}
          textAlignVertical="top"
        />
        <PrimaryButton title="Save Note" onPress={saveNote} />
      </View>

      <TouchableOpacity
        style={styles.resetLink}
        onPress={confirmClear}
        accessibilityRole="button"
        accessibilityLabel="Reset this day"
      >
        <Text style={styles.resetText}>Reset this day</Text>
      </TouchableOpacity>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: colors.panelAqua,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.line,
  },
  totalRow: { flexDirection: "row", alignItems: "flex-end", marginBottom: spacing.md },
  totalValue: { fontSize: 36, fontWeight: "800", color: colors.ink, lineHeight: 40 },
  totalUnit: { fontSize: 14, color: colors.inkSoft, marginLeft: 8, marginBottom: 5 },
  progressRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: spacing.sm,
  },
  progressLabel: { fontSize: 12, color: colors.inkSoft },
  percentLabel: { fontSize: 12, color: colors.teal, fontWeight: "700" },
  noteCard: {
    backgroundColor: colors.noteCard,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.sand,
  },
  noteTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  noteInput: {
    minHeight: 88,
    fontSize: 14,
    color: colors.ink,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  resetLink: { alignItems: "center", paddingVertical: spacing.md },
  resetText: { color: colors.danger, fontSize: 13, fontWeight: "600" },
});
