// Weekly Overview — a weekly journal spread.
// Seven day tiles with three-section mini bars, plus quiet weekly totals.
// No chart library — plain views only.

import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Screen, TopBar, IconButton } from "../components/common";
import { colors, spacing, radius, sectionTheme } from "../theme";
import { useApp } from "../context/AppContext";
import {
  todayISO,
  prettyDate,
  longWeekday,
  shortWeekday,
  addDays,
  startOfWeekISO,
} from "../data/dateUtils";
import { weeklyStats, formatLiters, formatMl } from "../data/water";

function StatTile({ label, value, accent }) {
  return (
    <View style={[styles.statTile, accent && { borderLeftColor: accent }]}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function SectionMiniBar({ sections, max }) {
  const total = sections.Morning + sections.Afternoon + sections.Evening;
  const safeMax = Math.max(1, max);
  return (
    <View style={styles.miniBarWrap}>
      <View style={styles.miniBarTrack}>
        {["Morning", "Afternoon", "Evening"].map((s) => {
          const w = (sections[s] / safeMax) * 100;
          if (sections[s] <= 0) return null;
          return (
            <View
              key={s}
              style={{
                width: `${w}%`,
                backgroundColor: sectionTheme[s].water,
                height: "100%",
              }}
            />
          );
        })}
      </View>
      <Text style={styles.miniBarTotal}>{total > 0 ? `${total} ml` : "—"}</Text>
    </View>
  );
}

export default function WeeklyScreen({ navigation }) {
  const { records, settings } = useApp();
  const [anchor, setAnchor] = useState(todayISO());

  const stats = weeklyStats(records, anchor, settings);
  const weekStart = startOfWeekISO(anchor, settings.weekStartsOn);
  const weekEnd = addDays(weekStart, 6);

  const goPrevWeek = () => setAnchor(addDays(weekStart, -1));
  const goNextWeek = () => setAnchor(addDays(weekEnd, 1));

  return (
    <Screen>
      <TopBar
        title="Weekly journal"
        subtitle={`${prettyDate(weekStart)} – ${prettyDate(weekEnd)}`}
        left={<IconButton label="‹ Back" onPress={() => navigation.goBack()} />}
      />

      <View style={styles.weekNav}>
        <TouchableOpacity onPress={goPrevWeek} accessibilityRole="button">
          <Text style={styles.weekNavBtn}>‹ Prev</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setAnchor(todayISO())}
          accessibilityRole="button"
        >
          <Text style={styles.weekNavThis}>This week</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={goNextWeek} accessibilityRole="button">
          <Text style={styles.weekNavBtn}>Next ›</Text>
        </TouchableOpacity>
      </View>

      {/* Quiet weekly totals */}
      <View style={styles.statsGrid}>
        <StatTile
          label="This week"
          value={formatLiters(stats.total)}
          accent={colors.teal}
        />
        <StatTile
          label="Daily average"
          value={formatLiters(stats.average)}
          accent={colors.sky}
        />
        <StatTile
          label="Best day"
          value={stats.bestDayLabel || "—"}
          accent={colors.lavender}
        />
        <StatTile
          label="Goal days"
          value={`${stats.goalDays} of 7`}
          accent={colors.sand}
        />
      </View>

      <Text style={styles.mostSection}>
        {stats.mostSection
          ? `Most logged section: ${stats.mostSection}`
          : "No water logged this week yet."}
      </Text>

      {/* Seven-day journal spread */}
      <View style={styles.spread}>
        {stats.days.map((d) => {
          const isToday = d.date === todayISO();
          return (
            <TouchableOpacity
              key={d.date}
              style={[styles.dayTile, isToday && styles.dayTileToday]}
              onPress={() =>
                navigation.navigate("DayDetail", { date: d.date })
              }
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={`Open ${longWeekday(d.date)}`}
            >
              <View style={styles.dayTop}>
                <View>
                  <Text style={styles.dayName}>{shortWeekday(d.date)}</Text>
                  <Text style={styles.dayDate}>
                    {d.date.slice(8, 10)}/{d.date.slice(5, 7)}
                  </Text>
                </View>
                <View style={styles.dayRight}>
                  <Text style={styles.dayTotal}>{formatMl(d.total)}</Text>
                  {d.total > 0 && d.reached ? (
                    <Text style={styles.dayReached}>Goal ✓</Text>
                  ) : null}
                </View>
              </View>
              <SectionMiniBar sections={d.sections} max={stats.maxDayTotal} />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Section legend */}
      <View style={styles.legend}>
        {["Morning", "Afternoon", "Evening"].map((s) => (
          <View key={s} style={styles.legendItem}>
            <View
              style={[styles.legendDot, { backgroundColor: sectionTheme[s].water }]}
            />
            <Text style={styles.legendText}>{s}</Text>
          </View>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  weekNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.lg,
    paddingHorizontal: spacing.xs,
  },
  weekNavBtn: { fontSize: 13, color: colors.inkSoft, fontWeight: "600" },
  weekNavThis: { fontSize: 13, color: colors.teal, fontWeight: "700" },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statTile: {
    width: "48%",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    borderLeftWidth: 4,
    borderLeftColor: colors.teal,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  statValue: { fontSize: 18, fontWeight: "800", color: colors.ink },
  statLabel: { fontSize: 11, color: colors.inkSoft, marginTop: 3 },
  mostSection: {
    fontSize: 13,
    color: colors.inkSoft,
    fontStyle: "italic",
    marginBottom: spacing.lg,
    marginTop: spacing.xs,
  },
  spread: {},
  dayTile: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  dayTileToday: {
    borderColor: colors.teal,
    backgroundColor: colors.panelAqua,
  },
  dayTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.sm,
  },
  dayName: { fontSize: 14, fontWeight: "700", color: colors.ink },
  dayDate: { fontSize: 11, color: colors.inkFaint, marginTop: 1 },
  dayRight: { alignItems: "flex-end" },
  dayTotal: { fontSize: 14, fontWeight: "700", color: colors.inkSoft },
  dayReached: { fontSize: 10, color: colors.teal, fontWeight: "700", marginTop: 1 },
  miniBarWrap: { flexDirection: "row", alignItems: "center" },
  miniBarTrack: {
    flex: 1,
    height: 12,
    backgroundColor: colors.lineSoft,
    borderRadius: radius.pill,
    overflow: "hidden",
    flexDirection: "row",
    marginRight: spacing.sm,
  },
  miniBarTotal: { fontSize: 11, color: colors.inkFaint, width: 56, textAlign: "right" },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  legendItem: { flexDirection: "row", alignItems: "center", marginHorizontal: spacing.md },
  legendDot: { width: 10, height: 10, borderRadius: 5, marginRight: 6 },
  legendText: { fontSize: 12, color: colors.inkSoft },
});
