// Root component: navigation + app-wide providers.
// Uses a custom theme that EXTENDS DefaultTheme (never built from scratch),
// so theme.fonts.regular and other required fields are always present.

import React from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer, DefaultTheme } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import { AppProvider, useApp } from "./src/context/AppContext";
import { colors } from "./src/theme";

import OnboardingScreen from "./src/screens/OnboardingScreen";
import HomeScreen from "./src/screens/HomeScreen";
import DayDetailScreen from "./src/screens/DayDetailScreen";
import EditEntryScreen from "./src/screens/EditEntryScreen";
import WeeklyScreen from "./src/screens/WeeklyScreen";
import HistoryScreen from "./src/screens/HistoryScreen";
import GlassSizeScreen from "./src/screens/GlassSizeScreen";
import GoalScreen from "./src/screens/GoalScreen";
import ReminderScreen from "./src/screens/ReminderScreen";
import SettingsScreen from "./src/screens/SettingsScreen";

const Stack = createNativeStackNavigator();

// Extend DefaultTheme so all required fields (including fonts) exist.
const AppNavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.background,
    card: colors.card,
    text: colors.ink,
    primary: colors.teal,
    border: colors.line,
    notification: colors.teal,
  },
};

function RootNavigator() {
  const { loading, settings } = useApp();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.teal} />
        <Text style={styles.loadingText}>Opening your water journal…</Text>
      </View>
    );
  }

  const onboardingDone = settings && settings.onboardingCompleted === true;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: "slide_from_right",
      }}
    >
      {!onboardingDone ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : null}
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="DayDetail" component={DayDetailScreen} />
      <Stack.Screen name="EditEntry" component={EditEntryScreen} />
      <Stack.Screen name="Weekly" component={WeeklyScreen} />
      <Stack.Screen name="History" component={HistoryScreen} />
      <Stack.Screen name="GlassSizes" component={GlassSizeScreen} />
      <Stack.Screen name="Goal" component={GoalScreen} />
      <Stack.Screen name="Reminders" component={ReminderScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AppProvider>
        <StatusBar style="dark" />
        <NavigationContainer theme={AppNavTheme}>
          <RootNavigator />
        </NavigationContainer>
      </AppProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 12,
    color: colors.inkSoft,
    fontSize: 14,
  },
});
