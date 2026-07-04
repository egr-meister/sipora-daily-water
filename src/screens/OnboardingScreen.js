// Welcome / Onboarding — shown only on first launch.
// Explains the journal concept, manual tracking, local-only storage,
// and in-app reminders.

import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Screen, PrimaryButton, GhostButton, Card } from "../components/common";
import { colors, spacing, radius, sectionTheme } from "../theme";
import { useApp } from "../context/AppContext";
import { MANUAL_DISCLAIMER } from "../data/defaults";

function Drop({ color }) {
  return <View style={[styles.drop, { backgroundColor: color }]} />;
}

function Point({ title, body }) {
  return (
    <View style={styles.point}>
      <Text style={styles.pointTitle}>{title}</Text>
      <Text style={styles.pointBody}>{body}</Text>
    </View>
  );
}

export default function OnboardingScreen() {
  const { completeOnboarding } = useApp();

  return (
    <Screen>
      <View style={styles.hero}>
        <View style={styles.drops}>
          <Drop color={sectionTheme.Morning.accent} />
          <Drop color={sectionTheme.Afternoon.accent} />
          <Drop color={sectionTheme.Evening.accent} />
        </View>
        <Text style={styles.brand}>Sipora Daily Water</Text>
        <Text style={styles.subtitle}>A calm journal for your daily water.</Text>
      </View>

      <Card>
        <Point
          title="Log drinks by part of day"
          body="Fill in your day across Morning, Afternoon, and Evening sections — like a gentle journal page."
        />
        <Point
          title="Manual journal"
          body="Water intake is entered manually. Tap a quick amount or add your own."
        />
        <Point
          title="Yours, on this device"
          body="No sensors. No Health Connect. No account. Works offline."
        />
        <Point
          title="In-app reminders only"
          body="Soft reminder cards appear inside the app. No phone notifications are ever sent."
        />
      </Card>

      <Card tone="note">
        <Text style={styles.disclaimer}>{MANUAL_DISCLAIMER}</Text>
      </Card>

      <PrimaryButton title="Start Journal" onPress={completeOnboarding} />
      <GhostButton title="Skip" onPress={completeOnboarding} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: "center",
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  drops: { flexDirection: "row", marginBottom: spacing.md },
  drop: {
    width: 26,
    height: 30,
    borderRadius: 13,
    borderTopLeftRadius: 4,
    marginHorizontal: 6,
  },
  brand: {
    fontSize: 24,
    fontWeight: "800",
    color: colors.ink,
    letterSpacing: 0.3,
  },
  subtitle: {
    fontSize: 14,
    color: colors.inkSoft,
    marginTop: spacing.xs,
  },
  point: {
    marginBottom: spacing.lg,
  },
  pointTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
    marginBottom: 3,
  },
  pointBody: { fontSize: 13, color: colors.inkSoft, lineHeight: 19 },
  disclaimer: {
    fontSize: 12,
    color: colors.inkSoft,
    lineHeight: 18,
  },
});
