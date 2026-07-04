// Goal Settings — edit the daily water goal, reset to default.
// Validation: goal > 0, goal <= 10000.

import React, { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from "react-native";
import {
  Screen,
  TopBar,
  IconButton,
  PrimaryButton,
  GhostButton,
  Banner,
} from "../components/common";
import { colors, spacing, radius } from "../theme";
import { useApp } from "../context/AppContext";
import { DEFAULT_GOAL_ML, MAX_GOAL_ML } from "../data/defaults";

const PRESETS = [1500, 2000, 2500, 3000];

export default function GoalScreen({ navigation }) {
  const { settings, setDailyGoal, resetDailyGoal } = useApp();
  const [goal, setGoal] = useState(String(settings.dailyGoalMl || DEFAULT_GOAL_ML));
  const [banner, setBanner] = useState(null);

  const onSave = () => {
    const res = setDailyGoal(Number(goal));
    setBanner({ tone: res.ok ? "success" : "error", text: res.message });
  };

  const onReset = () => {
    const res = resetDailyGoal();
    setGoal(String(DEFAULT_GOAL_ML));
    setBanner({ tone: "info", text: res.message });
  };

  return (
    <Screen>
      <TopBar
        title="Daily goal"
        subtitle="How much water you aim for"
        left={<IconButton label="‹ Back" onPress={() => navigation.goBack()} />}
      />

      <Banner text={banner && banner.text} tone={banner && banner.tone} />

      <View style={styles.hero}>
        <Text style={styles.heroValue}>{Number(goal) || 0}</Text>
        <Text style={styles.heroUnit}>ml per day</Text>
      </View>

      <Text style={styles.fieldLabel}>Set your goal (ml)</Text>
      <TextInput
        style={styles.input}
        value={goal}
        onChangeText={setGoal}
        keyboardType="number-pad"
        placeholder="e.g. 2000"
        placeholderTextColor={colors.inkFaint}
        maxLength={5}
      />

      <Text style={styles.helper}>Quick presets</Text>
      <View style={styles.presetRow}>
        {PRESETS.map((p) => (
          <TouchableOpacity
            key={p}
            style={[styles.preset, Number(goal) === p && styles.presetActive]}
            onPress={() => setGoal(String(p))}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Set goal ${p} ml`}
          >
            <Text
              style={[
                styles.presetText,
                Number(goal) === p && styles.presetTextActive,
              ]}
            >
              {p}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.note}>
        A common daily aim is around 2000 ml, but the right amount is personal.
        This is a manual journal goal, not medical advice. Maximum {MAX_GOAL_ML}{" "}
        ml.
      </Text>

      <View style={styles.actions}>
        <PrimaryButton title="Save Goal" onPress={onSave} />
        <GhostButton title="Reset to default (2000 ml)" onPress={onReset} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    backgroundColor: colors.panelAqua,
    borderRadius: radius.lg,
    paddingVertical: spacing.xl,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.line,
  },
  heroValue: { fontSize: 44, fontWeight: "800", color: colors.ink },
  heroUnit: { fontSize: 14, color: colors.inkSoft, marginTop: 2 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.inkSoft,
    marginBottom: spacing.sm,
  },
  input: {
    fontSize: 18,
    color: colors.ink,
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
  },
  helper: {
    fontSize: 12,
    color: colors.inkFaint,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  presetRow: { flexDirection: "row", justifyContent: "space-between" },
  preset: {
    flex: 1,
    marginRight: spacing.sm,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.panelAqua,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
  },
  presetActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  presetText: { fontSize: 13, fontWeight: "700", color: colors.ink },
  presetTextActive: { color: colors.white },
  note: {
    fontSize: 12,
    color: colors.inkSoft,
    lineHeight: 18,
    marginTop: spacing.lg,
  },
  actions: { marginTop: spacing.lg },
});
