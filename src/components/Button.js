import React, { useRef } from "react";
import { Animated, Pressable, View } from "react-native";
import { colors, radius, shadow } from "../theme/tokens";
import { FONT } from "../theme/fonts";
import { Body } from "./Type";
import { AppleLogo } from "./icons";
import { tapLight, tapMedium } from "../lib/haptics";

/* Springy press scale shared by the tactile buttons. */
function usePressScale(to = 0.96) {
  const s = useRef(new Animated.Value(1)).current;
  const onPressIn = () =>
    Animated.spring(s, { toValue: to, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
  const onPressOut = () =>
    Animated.spring(s, { toValue: 1, useNativeDriver: true, speed: 30, bounciness: 6 }).start();
  return { s, onPressIn, onPressOut };
}

export function PrimaryButton({ label, onPress, style, full }) {
  const { s, onPressIn, onPressOut } = usePressScale();
  return (
    <Animated.View style={[{ transform: [{ scale: s }] }, full && { alignSelf: "stretch" }, style]}>
      <Pressable
        onPressIn={() => {
          tapMedium();
          onPressIn();
        }}
        onPressOut={onPressOut}
        onPress={onPress}
        style={[
          {
            backgroundColor: colors.ink,
            borderRadius: radius.pill,
            paddingVertical: 17,
            paddingHorizontal: 36,
            alignItems: "center",
            justifyContent: "center",
          },
          shadow.button,
        ]}
      >
        <Body style={{ fontFamily: FONT.sansMed, color: "#F4EFE6", fontSize: 15 }}>
          {label}
        </Body>
      </Pressable>
    </Animated.View>
  );
}

export function GhostButton({ label, onPress }) {
  const { s, onPressIn, onPressOut } = usePressScale(0.97);
  return (
    <Animated.View style={{ transform: [{ scale: s }] }}>
      <Pressable
        onPressIn={() => {
          tapLight();
          onPressIn();
        }}
        onPressOut={onPressOut}
        onPress={onPress}
        style={{
          borderRadius: radius.pill,
          borderWidth: 1,
          borderColor: colors.ink,
          paddingVertical: 16,
          paddingHorizontal: 34,
        }}
      >
        <Body style={{ fontFamily: FONT.sansMed, color: colors.ink, fontSize: 15 }}>
          {label}
        </Body>
      </Pressable>
    </Animated.View>
  );
}

export function TextLink({ label, icon, onPress }) {
  return (
    <Pressable
      onPress={() => {
        tapLight();
        onPress();
      }}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        opacity: pressed ? 0.55 : 1,
        paddingVertical: 6,
      })}
    >
      {icon}
      <Body
        style={{
          fontFamily: FONT.sansMed,
          color: colors.ink2,
          fontSize: 14,
        }}
      >
        {label}
      </Body>
    </Pressable>
  );
}

/* Camera-style shutter: a ring with an inner disc, springy + haptic. */
export function ShutterButton({ onPress, disabled }) {
  const { s, onPressIn, onPressOut } = usePressScale(0.9);
  return (
    <Animated.View style={{ transform: [{ scale: s }], opacity: disabled ? 0.4 : 1 }}>
      <Pressable
        disabled={disabled}
        onPressIn={() => {
          tapMedium();
          onPressIn();
        }}
        onPressOut={onPressOut}
        onPress={onPress}
        style={{
          width: 78,
          height: 78,
          borderRadius: 39,
          borderWidth: 2.5,
          borderColor: colors.ink,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={[
            {
              width: 60,
              height: 60,
              borderRadius: 30,
              backgroundColor: colors.ink,
            },
            shadow.button,
          ]}
        />
      </Pressable>
    </Animated.View>
  );
}

/* Apple Pay-style button. Visual + simulated tap; real StoreKit/PassKit
 * needs a dev build, so this stands in for the purchase in Expo Go. */
export function ApplePayButton({ onPress, full }) {
  const { s, onPressIn, onPressOut } = usePressScale(0.97);
  return (
    <Animated.View style={[{ transform: [{ scale: s }] }, full && { alignSelf: "stretch" }]}>
      <Pressable
        onPressIn={() => {
          tapMedium();
          onPressIn();
        }}
        onPressOut={onPressOut}
        onPress={onPress}
        style={[
          {
            backgroundColor: "#000000",
            borderRadius: 14,
            paddingVertical: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 7,
          },
          shadow.button,
        ]}
      >
        <AppleLogo size={20} color="#FFFFFF" />
        <Body style={{ fontFamily: FONT.sansSemi, color: "#FFFFFF", fontSize: 18 }}>Pay</Body>
      </Pressable>
    </Animated.View>
  );
}

export function IconButton({ children, onPress }) {
  return (
    <Pressable
      onPress={() => {
        tapLight();
        onPress();
      }}
      hitSlop={12}
      style={({ pressed }) => ({
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: pressed ? colors.surfaceAlt : "transparent",
      })}
    >
      {children}
    </Pressable>
  );
}
