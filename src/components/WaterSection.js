// A single journal panel for one part of the day (Morning / Afternoon / Evening).
// Shows: title, section total, quick-add chips, drink rows, water fill mark,
// soft empty state, and optional reminder label.

import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { colors, radius, spacing, sectionTheme } from "../theme";
import { WaterBar } from "./common";
import { formatMl, safeAmount } from "../data/water";

function DrinkRow({ entry, onPress }) {
  const amount = safeAmount(entry && entry.amountMl);
  const label = (entry && entry.label) || "Water";
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${amount} ml`}
    >
      <View style={styles.rowDot} />
      <Text style={styles.rowLabel} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.rowAmount}>{amount} ml</Text>
    </TouchableOpacity>
  );
}

export default function WaterSection({
  section,
  total,
  goalHint,
  entries,
  quickAmounts,
  onQuickAdd,
  onAddCustom,
  onPressEntry,
  reminderText,
  compact,
}) {
  const theme = sectionTheme[section] || sectionTheme.Morning;
  const list = Array.isArray(entries) ? entries : [];
  const totalMl = safeAmount(total);
  const ratio = goalHint > 0 ? Math.min(totalMl / goalHint, 1) : 0;

  const emptyText =
    section === "Morning"
      ? "No morning drinks yet."
      : section === "Afternoon"
      ? "No afternoon drinks yet."
      : "No evening drinks yet.";

  return (
    <View style={[styles.panel, { borderLeftColor: theme.accent }]}>
      <View style={styles.header}>
        <View style={styles.titleWrap}>
          <View style={[styles.marker, { backgroundColor: theme.accent }]} />
          <View>
            <Text style={styles.title}>{theme.label}</Text>
            <Text style={styles.hint}>{theme.hint}</Text>
          </View>
        </View>
        <Text style={[styles.total, { color: colors.ink }]}>
          {formatMl(totalMl)}
        </Text>
      </View>

      <WaterBar ratio={ratio} color={theme.water} height={7} />

      {reminderText ? (
        <View style={[styles.reminder, { backgroundColor: theme.accentSoft }]}>
          <Text style={styles.reminderText}>{reminderText}</Text>
        </View>
      ) : null}

      {!compact && (
        <View style={styles.quickRow}>
          {(quickAmounts || []).map((amt) => (
            <TouchableOpacity
              key={`${section}_${amt}`}
              style={styles.quickBtn}
              onPress={() => onQuickAdd && onQuickAdd(amt)}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Add ${amt} ml to ${section}`}
            >
              <Text style={styles.quickBtnText}>+{amt}</Text>
              <Text style={styles.quickBtnUnit}>ml</Text>
            </TouchableOpacity>
          ))}
          {onAddCustom ? (
            <TouchableOpacity
              style={[styles.quickBtn, styles.customBtn]}
              onPress={onAddCustom}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel={`Add custom drink to ${section}`}
            >
              <Text style={[styles.quickBtnText, { color: colors.teal }]}>
                +
              </Text>
              <Text style={styles.quickBtnUnit}>more</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}

      <View style={styles.entries}>
        {list.length === 0 ? (
          <Text style={styles.empty}>{emptyText}</Text>
        ) : (
          list.map((e) => (
            <DrinkRow
              key={e.id}
              entry={e}
              onPress={onPressEntry ? () => onPressEntry(e) : undefined}
            />
          ))
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    borderLeftWidth: 5,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: spacing.md,
  },
  titleWrap: { flexDirection: "row", alignItems: "center" },
  marker: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  title: { fontSize: 16, fontWeight: "700", color: colors.ink },
  hint: { fontSize: 11, color: colors.inkFaint, marginTop: 1 },
  total: { fontSize: 16, fontWeight: "700" },
  reminder: {
    marginTop: spacing.md,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  reminderText: { fontSize: 12, color: colors.ink },
  quickRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: spacing.md,
  },
  quickBtn: {
    backgroundColor: colors.panelAqua,
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    alignItems: "center",
    minWidth: 56,
    borderWidth: 1,
    borderColor: colors.line,
  },
  customBtn: { backgroundColor: colors.panelAquaDeep },
  quickBtnText: { fontSize: 15, fontWeight: "700", color: colors.ink },
  quickBtnUnit: { fontSize: 10, color: colors.inkSoft, marginTop: 1 },
  entries: { marginTop: spacing.sm },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.lineSoft,
  },
  rowDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.sky,
    marginRight: spacing.md,
  },
  rowLabel: { flex: 1, fontSize: 14, color: colors.ink },
  rowAmount: { fontSize: 14, fontWeight: "600", color: colors.inkSoft },
  empty: {
    fontSize: 13,
    color: colors.inkFaint,
    fontStyle: "italic",
    paddingVertical: spacing.sm,
  },
});
