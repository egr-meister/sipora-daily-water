// Reusable presentational components for the Sipora water journal.
// Kept simple: plain React Native views, no animation libraries.

import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing, shadow } from "../theme";

// Screen wrapper with safe area + optional scroll.
export function Screen({ children, scroll = true, contentStyle }) {
  const inner = scroll ? (
    <ScrollView
      contentContainerStyle={[styles.scrollContent, contentStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.plainContent, contentStyle]}>{children}</View>
  );
  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right"]}>
      {inner}
    </SafeAreaView>
  );
}

// Compact top header: title on the left, optional action on the right.
export function TopBar({ title, subtitle, right, left }) {
  return (
    <View style={styles.topBar}>
      <View style={styles.topBarSide}>{left}</View>
      <View style={styles.topBarCenter}>
        <Text style={styles.topBarTitle} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.topBarSubtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      <View style={[styles.topBarSide, styles.topBarRight]}>{right}</View>
    </View>
  );
}

export function IconButton({ label, onPress, tone = "ink" }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={styles.iconButton}
      accessibilityRole="button"
      accessibilityLabel={label}
      activeOpacity={0.7}
    >
      <Text
        style={[
          styles.iconButtonText,
          tone === "teal" && { color: colors.teal },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function Card({ children, style, tone }) {
  return (
    <View
      style={[
        styles.card,
        tone === "aqua" && { backgroundColor: colors.panelAqua },
        tone === "note" && { backgroundColor: colors.noteCard },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function PrimaryButton({ title, onPress, disabled, tone = "teal" }) {
  const bg =
    tone === "danger"
      ? colors.danger
      : tone === "sky"
      ? colors.skyDeep
      : colors.teal;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      style={[
        styles.primaryButton,
        { backgroundColor: bg },
        disabled && styles.disabled,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <Text style={styles.primaryButtonText}>{title}</Text>
    </TouchableOpacity>
  );
}

export function GhostButton({ title, onPress, tone = "ink" }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.ghostButton}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      <Text
        style={[
          styles.ghostButtonText,
          tone === "danger" && { color: colors.danger },
          tone === "teal" && { color: colors.teal },
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

// Thin horizontal water fill bar (calm progress mark).
export function WaterBar({ ratio = 0, color = colors.sky, height = 8 }) {
  const clamped = Math.max(0, Math.min(1, Number(ratio) || 0));
  return (
    <View style={[styles.waterBarTrack, { height }]}>
      <View
        style={[
          styles.waterBarFill,
          {
            width: `${clamped * 100}%`,
            backgroundColor: color,
            height,
          },
        ]}
      />
    </View>
  );
}

export function Chip({ label, onPress, active, accent }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.chip,
        active && { backgroundColor: accent || colors.teal },
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text
        style={[styles.chipText, active && { color: colors.white }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function Divider({ style }) {
  return <View style={[styles.divider, style]} />;
}

// Small ripple-style separator (three dots) for journal feel.
export function RippleDivider() {
  return (
    <View style={styles.ripple}>
      <View style={styles.rippleDot} />
      <View style={styles.rippleDot} />
      <View style={styles.rippleDot} />
    </View>
  );
}

export function EmptyNote({ text }) {
  return (
    <View style={styles.emptyNote}>
      <Text style={styles.emptyNoteText}>{text}</Text>
    </View>
  );
}

export function Banner({ text, tone = "info" }) {
  if (!text) return null;
  return (
    <View
      style={[
        styles.banner,
        tone === "error" && { backgroundColor: "#F6E5E3" },
        tone === "success" && { backgroundColor: "#E3F0EA" },
      ]}
    >
      <Text
        style={[
          styles.bannerText,
          tone === "error" && { color: colors.danger },
        ]}
      >
        {text}
      </Text>
    </View>
  );
}

export function SectionLabel({ children }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl * 2,
  },
  plainContent: { flex: 1, padding: spacing.lg },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.lg,
    minHeight: 40,
  },
  topBarSide: { width: 64, justifyContent: "center" },
  topBarRight: { alignItems: "flex-end" },
  topBarCenter: { flex: 1, alignItems: "center" },
  topBarTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.ink,
    letterSpacing: 0.2,
  },
  topBarSubtitle: {
    fontSize: 12,
    color: colors.inkSoft,
    marginTop: 2,
  },
  iconButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  iconButtonText: { fontSize: 13, color: colors.ink, fontWeight: "600" },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow.soft,
  },
  primaryButton: {
    borderRadius: radius.pill,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: colors.white,
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  disabled: { opacity: 0.45 },
  ghostButton: {
    paddingVertical: 12,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
  },
  ghostButtonText: { color: colors.inkSoft, fontSize: 14, fontWeight: "600" },
  waterBarTrack: {
    backgroundColor: colors.lineSoft,
    borderRadius: radius.pill,
    overflow: "hidden",
    width: "100%",
  },
  waterBarFill: { borderRadius: radius.pill },
  chip: {
    backgroundColor: colors.panelAqua,
    borderRadius: radius.pill,
    paddingVertical: 9,
    paddingHorizontal: 14,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.line,
  },
  chipText: { color: colors.ink, fontSize: 13, fontWeight: "600" },
  divider: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: spacing.md,
  },
  ripple: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: spacing.md,
  },
  rippleDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.sky,
    marginHorizontal: 4,
    opacity: 0.6,
  },
  emptyNote: {
    paddingVertical: spacing.lg,
    alignItems: "center",
  },
  emptyNoteText: {
    color: colors.inkFaint,
    fontSize: 13,
    fontStyle: "italic",
  },
  banner: {
    backgroundColor: colors.panelAqua,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  bannerText: { color: colors.ink, fontSize: 13 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.inkSoft,
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: spacing.sm,
  },
});

export { styles as commonStyles };
