# Sipora Daily Water — ProGuard / R8 rules
# Standard, conservative rules for a React Native / Expo (Hermes) release build.
# After `npx expo prebuild`, copy this file to android/app/proguard-rules.pro
# (or merge its contents) so `minifyEnabled true` works safely.

# --- React Native core ---
-keep,allowobfuscation @interface com.facebook.proguard.annotations.DoNotStrip
-keep,allowobfuscation @interface com.facebook.proguard.annotations.KeepGettersAndSetters
-keep @com.facebook.proguard.annotations.DoNotStrip class *
-keepclassmembers class * { @com.facebook.proguard.annotations.DoNotStrip *; }
-keepclassmembers @com.facebook.proguard.annotations.KeepGettersAndSetters class * {
  void set*(***);
  *** get*();
}
-keep class com.facebook.react.** { *; }
-keep class com.facebook.jni.** { *; }

# --- Hermes ---
-keep class com.facebook.hermes.unicode.** { *; }
-keep class com.facebook.jni.** { *; }

# --- Expo modules ---
-keep class expo.modules.** { *; }
-keep class versioned.host.exp.exponent.** { *; }

# --- AsyncStorage ---
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# --- react-native-screens / safe-area-context ---
-keep class com.swmansion.** { *; }
-keep class com.th3rdwave.safeareacontext.** { *; }

# Keep native method names
-keepclasseswithmembernames class * {
  native <methods>;
}

# Suppress warnings for optional/absent classes
-dontwarn com.facebook.react.**
-dontwarn expo.modules.**
-dontwarn okhttp3.**
-dontwarn okio.**
