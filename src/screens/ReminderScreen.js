// Reminder Settings — control in-app reminder cards only.
// These never send phone notifications and never run in the background.

import React from "react";
import { View, Text, StyleSheet, Switch } from "react-native";
import { Screen, TopBar, IconButton, Card } from "../components/common";
import { colors, spacing, radius } from "../theme";
import { useApp } from "../context/AppContext";
import {
  REMINDER_DISCLAIMER,
  makeDefaultReminderSettings,
  REMINDER_HOURS,
} from "../data/defaults";

function ToggleRow({ title, subtitle, value, onValueChange, disabled }) {
  return (
    <View style={[styles.row, disabled && styles.rowDisabled]}>
      <View style={styles.rowText}>
        <Text style={styles.rowTitle}>{title}</Text>
        {subtitle ? <Text style={styles.rowSubtitle}>{subtitle}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: colors.line, true: colors.teal }}
        thumbColor={colors.white}
      />
    </View>
  );
}

export default function ReminderScreen({ navigation }) {
  const { settings, setReminderSettings } = useApp();
  const reminders = settings.reminders || makeDefaultReminderSettings();
  const enabled = reminders.enabled === true;

  return (
    <Screen>
      <TopBar
        title="Reminders"
        subtitle="Gentle in-app prompts"
        left={<IconButton label="‹ Back" onPress={() => navigation.goBack()} />}
      />

      <Card tone="note">
        <Text style={styles.disclaimer}>{REMINDER_DISCLAIMER}</Text>
      </Card>

      <Card>
        <ToggleRow
          title="In-app reminders"
          subtitle="Show gentle reminder cards inside the app"
          value={enabled}
          onValueChange={(v) => setReminderSettings({ enabled: v })}
        />
      </Card>

      <Text style={styles.groupLabel}>Section reminders</Text>
      <Card>
        <ToggleRow
          title="Morning check"
          subtitle={`Nudges after ${REMINDER_HOURS.Morning}:00 if empty`}
          value={reminders.morningEnabled === true}
          onValueChange={(v) => setReminderSettings({ morningEnabled: v })}
          disabled={!enabled}
        />
        <View style={styles.divider} />
        <ToggleRow
          title="Afternoon check"
          subtitle={`Nudges after ${REMINDER_HOURS.Afternoon}:00 if empty`}
          value={reminders.afternoonEnabled === true}
          onValueChange={(v) => setReminderSettings({ afternoonEnabled: v })}
          disabled={!enabled}
        />
        <View style={styles.divider} />
        <ToggleRow
          title="Evening check"
          subtitle={`Nudges after ${REMINDER_HOURS.Evening}:00 if empty`}
          value={reminders.eveningEnabled === true}
          onValueChange={(v) => setReminderSettings({ eveningEnabled: v })}
          disabled={!enabled}
        />
      </Card>

      <Text style={styles.footnote}>
        Reminders are based only on the time of day and today's progress while
        the app is open. No notification permission is requested, and nothing
        runs in the background.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  disclaimer: { fontSize: 13, color: colors.inkSoft, lineHeight: 19 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  rowDisabled: { opacity: 0.5 },
  rowText: { flex: 1, paddingRight: spacing.md },
  rowTitle: { fontSize: 15, fontWeight: "700", color: colors.ink },
  rowSubtitle: { fontSize: 12, color: colors.inkSoft, marginTop: 2 },
  groupLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.inkSoft,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  divider: { height: 1, backgroundColor: colors.lineSoft, marginVertical: spacing.xs },
  footnote: {
    fontSize: 12,
    color: colors.inkSoft,
    lineHeight: 18,
    marginTop: spacing.sm,
  },
});
