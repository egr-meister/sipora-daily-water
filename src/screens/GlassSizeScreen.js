// Glass Size Settings — add, edit, delete custom glass sizes; reset defaults.
// Validation: amount 1..5000, label not empty.

import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import {
  Screen,
  TopBar,
  IconButton,
  PrimaryButton,
  GhostButton,
  Banner,
  Divider,
} from "../components/common";
import { colors, spacing, radius } from "../theme";
import { useApp } from "../context/AppContext";

export default function GlassSizeScreen({ navigation }) {
  const {
    glassSizes,
    addGlassSize,
    updateGlassSize,
    deleteGlassSize,
    resetGlassSizes,
  } = useApp();

  const [editingId, setEditingId] = useState(null);
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [banner, setBanner] = useState(null);

  const resetForm = () => {
    setEditingId(null);
    setLabel("");
    setAmount("");
  };

  const startEdit = (glass) => {
    setEditingId(glass.id);
    setLabel(glass.label);
    setAmount(String(glass.amountMl));
    setBanner(null);
  };

  const onSubmit = () => {
    const res = editingId
      ? updateGlassSize(editingId, label, Number(amount))
      : addGlassSize(label, Number(amount));
    setBanner({ tone: res.ok ? "success" : "error", text: res.message });
    if (res.ok) resetForm();
  };

  const onDelete = (glass) => {
    Alert.alert("Delete glass size?", `“${glass.label}” will be removed.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          const res = deleteGlassSize(glass.id);
          setBanner({ tone: "info", text: res.message });
          if (editingId === glass.id) resetForm();
        },
      },
    ]);
  };

  const onReset = () => {
    Alert.alert(
      "Reset glass sizes?",
      "This restores the default Small glass, Glass, and Bottle and removes custom sizes.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Reset",
          style: "destructive",
          onPress: () => {
            const res = resetGlassSizes();
            resetForm();
            setBanner({ tone: "info", text: res.message });
          },
        },
      ]
    );
  };

  return (
    <Screen>
      <TopBar
        title="Glass sizes"
        subtitle="Your quick-fill glasses"
        left={<IconButton label="‹ Back" onPress={() => navigation.goBack()} />}
      />

      <Banner text={banner && banner.text} tone={banner && banner.tone} />

      {/* List */}
      {(glassSizes || []).map((g) => (
        <View key={g.id} style={styles.row}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowLabel}>{g.label}</Text>
            <Text style={styles.rowMeta}>
              {g.amountMl} ml {g.custom ? "· custom" : "· default"}
            </Text>
          </View>
          <View style={styles.rowActions}>
            <TouchableOpacity
              onPress={() => startEdit(g)}
              accessibilityRole="button"
              accessibilityLabel={`Edit ${g.label}`}
            >
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => onDelete(g)}
              accessibilityRole="button"
              accessibilityLabel={`Delete ${g.label}`}
            >
              <Text style={styles.deleteText}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <Divider />

      {/* Add / edit form */}
      <Text style={styles.formTitle}>
        {editingId ? "Edit glass size" : "Add a glass size"}
      </Text>
      <Text style={styles.fieldLabel}>Label</Text>
      <TextInput
        style={styles.input}
        value={label}
        onChangeText={setLabel}
        placeholder="e.g. Mug, Large bottle"
        placeholderTextColor={colors.inkFaint}
        maxLength={30}
      />
      <Text style={styles.fieldLabel}>Amount (ml)</Text>
      <TextInput
        style={styles.input}
        value={amount}
        onChangeText={setAmount}
        placeholder="e.g. 400"
        placeholderTextColor={colors.inkFaint}
        keyboardType="number-pad"
        maxLength={5}
      />

      <View style={styles.formActions}>
        <PrimaryButton
          title={editingId ? "Save changes" : "Add glass size"}
          onPress={onSubmit}
        />
        {editingId ? (
          <GhostButton title="Cancel edit" onPress={resetForm} />
        ) : null}
      </View>

      <Divider />
      <GhostButton title="Reset to default glasses" tone="danger" onPress={onReset} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  rowInfo: { flex: 1 },
  rowLabel: { fontSize: 15, fontWeight: "700", color: colors.ink },
  rowMeta: { fontSize: 12, color: colors.inkSoft, marginTop: 2 },
  rowActions: { flexDirection: "row", alignItems: "center" },
  editText: {
    fontSize: 13,
    color: colors.teal,
    fontWeight: "600",
    marginRight: spacing.lg,
  },
  deleteText: { fontSize: 13, color: colors.danger, fontWeight: "600" },
  formTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: colors.ink,
    marginBottom: spacing.md,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.inkSoft,
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
  },
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
  formActions: { marginTop: spacing.lg },
});
