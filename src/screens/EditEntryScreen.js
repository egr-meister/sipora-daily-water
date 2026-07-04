// Add / Edit Drink Entry.
// Fields: section, amount (ml), label. Glass sizes offer one-tap fills.
// Validation: amount > 0, amount <= 5000, valid section.

import React, { useMemo, useState } from "react";
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
  PrimaryButton,
  GhostButton,
  Banner,
} from "../components/common";
import { colors, spacing, radius, sectionTheme, SECTIONS } from "../theme";
import { useApp } from "../context/AppContext";
import { MAX_GLASS_ML } from "../data/defaults";
import { todayISO, isValidISODate, prettyDate } from "../data/dateUtils";
import { getEntries, safeSection } from "../data/water";

export default function EditEntryScreen({ route, navigation }) {
  const params = (route && route.params) || {};
  const date = isValidISODate(params.date) ? params.date : todayISO();
  const mode = params.mode === "edit" ? "edit" : "add";
  const entryId = params.entryId || null;

  const { getRecord, glassSizes, addEntry, updateEntry, deleteEntry } =
    useApp();

  const record = getRecord(date);
  const existing = useMemo(() => {
    if (mode !== "edit") return null;
    return getEntries(record).find((e) => e && e.id === entryId) || null;
  }, [mode, record, entryId]);

  const [section, setSection] = useState(
    safeSection(existing ? existing.section : params.section)
  );
  const [amount, setAmount] = useState(
    existing ? String(existing.amountMl) : ""
  );
  const [label, setLabel] = useState(existing ? existing.label || "" : "");
  const [banner, setBanner] = useState(null);

  const applyGlass = (glass) => {
    setAmount(String(glass.amountMl));
    if (!label) setLabel(glass.label);
  };

  const onSave = () => {
    const amt = Number(amount);
    if (!Number.isFinite(amt) || amt <= 0) {
      setBanner({ tone: "error", text: "Amount must be greater than 0 ml." });
      return;
    }
    if (amt > MAX_GLASS_ML) {
      setBanner({
        tone: "error",
        text: `Amount must not exceed ${MAX_GLASS_ML} ml.`,
      });
      return;
    }
    const finalLabel = label.trim() || `${Math.round(amt)} ml`;
    let res;
    if (mode === "edit") {
      res = updateEntry(date, entryId, {
        section,
        amountMl: amt,
        label: finalLabel,
      });
    } else {
      res = addEntry(date, section, amt, finalLabel);
    }
    if (res && res.ok) {
      navigation.goBack();
    } else {
      setBanner({ tone: "error", text: (res && res.message) || "Could not save." });
    }
  };

  const onDelete = () => {
    Alert.alert("Delete drink?", "This drink entry will be removed.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          deleteEntry(date, entryId);
          navigation.goBack();
        },
      },
    ]);
  };

  return (
    <Screen>
      <TopBar
        title={mode === "edit" ? "Edit drink" : "Add drink"}
        subtitle={prettyDate(date)}
        left={<IconButton label="‹ Back" onPress={() => navigation.goBack()} />}
      />

      <Banner text={banner && banner.text} tone={banner && banner.tone} />

      <Text style={styles.fieldLabel}>Day section</Text>
      <View style={styles.sectionRow}>
        {SECTIONS.map((s) => {
          const t = sectionTheme[s];
          const active = section === s;
          return (
            <TouchableOpacity
              key={s}
              onPress={() => setSection(s)}
              activeOpacity={0.85}
              style={[
                styles.sectionChip,
                active && { backgroundColor: t.accent, borderColor: t.accent },
              ]}
              accessibilityRole="button"
              accessibilityLabel={`Choose ${s}`}
            >
              <Text
                style={[styles.sectionChipText, active && { color: "#3A3A3A" }]}
              >
                {s}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Text style={styles.fieldLabel}>Amount (ml)</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        keyboardType="number-pad"
        placeholder="e.g. 250"
        placeholderTextColor={colors.inkFaint}
        maxLength={5}
      />

      <Text style={styles.helper}>Quick fill from your glasses</Text>
      <View style={styles.glassRow}>
        {(glassSizes || []).map((g) => (
          <TouchableOpacity
            key={g.id}
            style={styles.glassChip}
            onPress={() => applyGlass(g)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel={`Use ${g.label}, ${g.amountMl} ml`}
          >
            <Text style={styles.glassChipLabel}>{g.label}</Text>
            <Text style={styles.glassChipAmt}>{g.amountMl} ml</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.fieldLabel}>Label (optional)</Text>
      <TextInput
        style={styles.input}
        value={label}
        onChangeText={setLabel}
        placeholder="Water, Tea, Bottle…"
        placeholderTextColor={colors.inkFaint}
        maxLength={40}
      />

      <View style={styles.actions}>
        <PrimaryButton title="Save Drink" onPress={onSave} />
        {mode === "edit" ? (
          <GhostButton title="Delete Drink" tone="danger" onPress={onDelete} />
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.inkSoft,
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  sectionRow: { flexDirection: "row", justifyContent: "space-between" },
  sectionChip: {
    flex: 1,
    marginRight: spacing.sm,
    paddingVertical: 12,
    borderRadius: radius.md,
    backgroundColor: colors.panelAqua,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: "center",
  },
  sectionChipText: { fontSize: 13, fontWeight: "700", color: colors.ink },
  input: {
    fontSize: 16,
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
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  glassRow: { flexDirection: "row", flexWrap: "wrap" },
  glassChip: {
    backgroundColor: colors.panelAqua,
    borderRadius: radius.md,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.line,
  },
  glassChipLabel: { fontSize: 12, fontWeight: "700", color: colors.ink },
  glassChipAmt: { fontSize: 11, color: colors.inkSoft, marginTop: 1 },
  actions: { marginTop: spacing.xl },
});
