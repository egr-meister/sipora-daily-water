// Settings — preferences, shortcuts, data management, and disclaimers.

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Switch,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  Screen,
  TopBar,
  IconButton,
  Card,
  Banner,
} from "../components/common";
import { colors, spacing, radius } from "../theme";
import { useApp } from "../context/AppContext";
import {
  APP_INFO,
  MANUAL_DISCLAIMER,
  PRIVACY_NOTE,
} from "../data/defaults";

function LinkRow({ title, subtitle, onPress, tone }) {
  return (
    <TouchableOpacity
      style={styles.linkRow}
      onPress={onPress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <View style={styles.linkText}>
        <Text
          style={[styles.linkTitle, tone === "danger" && { color: colors.danger }]}
        >
          {title}
        </Text>
        {subtitle ? <Text style={styles.linkSubtitle}>{subtitle}</Text> : null}
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

export default function SettingsScreen({ navigation }) {
  const {
    settings,
    setCompactMode,
    showOnboardingAgain,
    deleteAllRecords,
    resetAllData,
  } = useApp();
  const [banner, setBanner] = useState(null);

  const onDeleteRecords = () => {
    Alert.alert(
      "Delete all water records?",
      "Every logged day, drink, and note will be removed. Glass sizes and settings are kept.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete records",
          style: "destructive",
          onPress: () => {
            const res = deleteAllRecords();
            setBanner({ tone: "info", text: res.message });
          },
        },
      ]
    );
  };

  const onResetAll = () => {
    Alert.alert(
      "Reset all local data?",
      "This erases everything on this device: records, notes, glass sizes, goal, and reminder settings.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset everything",
          style: "destructive",
          onPress: async () => {
            const res = await resetAllData();
            setBanner({ tone: "info", text: res.message });
          },
        },
      ]
    );
  };

  const onShowOnboarding = () => {
    showOnboardingAgain();
    setBanner({
      tone: "success",
      text: "Onboarding will show next time you reopen the app.",
    });
  };

  return (
    <Screen>
      <TopBar
        title="Settings"
        subtitle="Preferences & data"
        left={<IconButton label="‹ Back" onPress={() => navigation.goBack()} />}
      />

      <Banner text={banner && banner.text} tone={banner && banner.tone} />

      <Text style={styles.groupLabel}>Display</Text>
      <Card>
        <View style={styles.toggleRow}>
          <View style={styles.toggleText}>
            <Text style={styles.toggleTitle}>Compact mode</Text>
            <Text style={styles.toggleSubtitle}>
              Hide quick-add buttons for a tighter journal view
            </Text>
          </View>
          <Switch
            value={settings.compactMode === true}
            onValueChange={(v) => setCompactMode(v)}
            trackColor={{ false: colors.line, true: colors.teal }}
            thumbColor={colors.white}
          />
        </View>
      </Card>

      <Text style={styles.groupLabel}>Journal setup</Text>
      <Card>
        <LinkRow
          title="Daily goal"
          subtitle={`${settings.dailyGoalMl || 2000} ml per day`}
          onPress={() => navigation.navigate("Goal")}
        />
        <View style={styles.divider} />
        <LinkRow
          title="Glass sizes"
          subtitle="Manage quick-fill glasses"
          onPress={() => navigation.navigate("GlassSizes")}
        />
        <View style={styles.divider} />
        <LinkRow
          title="Reminders"
          subtitle="In-app reminder cards only"
          onPress={() => navigation.navigate("Reminders")}
        />
        <View style={styles.divider} />
        <LinkRow
          title="Show onboarding again"
          subtitle="Revisit the welcome screens"
          onPress={onShowOnboarding}
        />
      </Card>

      <Text style={styles.groupLabel}>Data</Text>
      <Card>
        <LinkRow
          title="Delete all water records"
          subtitle="Keeps glass sizes and settings"
          onPress={onDeleteRecords}
          tone="danger"
        />
        <View style={styles.divider} />
        <LinkRow
          title="Reset all local data"
          subtitle="Erase everything on this device"
          onPress={onResetAll}
          tone="danger"
        />
      </Card>

      <Text style={styles.groupLabel}>About</Text>
      <Card>
        <Text style={styles.aboutTitle}>{APP_INFO.name}</Text>
        <Text style={styles.aboutVersion}>Version {APP_INFO.version}</Text>
        <Text style={styles.aboutTagline}>{APP_INFO.tagline}</Text>
      </Card>

      <Card tone="note">
        <Text style={styles.sectionHeading}>Manual tracking</Text>
        <Text style={styles.body}>{MANUAL_DISCLAIMER}</Text>
      </Card>

      <Card tone="aqua">
        <Text style={styles.sectionHeading}>Privacy</Text>
        <Text style={styles.body}>{PRIVACY_NOTE}</Text>
      </Card>

      <Text style={styles.footer}>
        Sipora Daily Water is a wellness-style journal utility. It is not a
        medical, diagnostic, or treatment app.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  groupLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.inkSoft,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  toggleText: { flex: 1, paddingRight: spacing.md },
  toggleTitle: { fontSize: 15, fontWeight: "700", color: colors.ink },
  toggleSubtitle: { fontSize: 12, color: colors.inkSoft, marginTop: 2 },
  linkRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: spacing.sm,
  },
  linkText: { flex: 1, paddingRight: spacing.md },
  linkTitle: { fontSize: 15, fontWeight: "600", color: colors.ink },
  linkSubtitle: { fontSize: 12, color: colors.inkSoft, marginTop: 2 },
  chevron: { fontSize: 22, color: colors.inkFaint },
  divider: { height: 1, backgroundColor: colors.lineSoft, marginVertical: spacing.xs },
  aboutTitle: { fontSize: 16, fontWeight: "800", color: colors.ink },
  aboutVersion: { fontSize: 12, color: colors.inkSoft, marginTop: 2 },
  aboutTagline: { fontSize: 13, color: colors.inkSoft, marginTop: spacing.sm, fontStyle: "italic" },
  sectionHeading: {
    fontSize: 13,
    fontWeight: "700",
    color: colors.ink,
    marginBottom: spacing.sm,
  },
  body: { fontSize: 12, color: colors.inkSoft, lineHeight: 18 },
  footer: {
    fontSize: 11,
    color: colors.inkFaint,
    lineHeight: 16,
    textAlign: "center",
    marginTop: spacing.sm,
  },
});
