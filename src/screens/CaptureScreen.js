import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Platform, View, StyleSheet } from "react-native";
import Svg, { Ellipse, Path } from "react-native-svg";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as Device from "expo-device";
import { colors, radius, shadow, space } from "../theme/tokens";
import { Title, Body, Small } from "../components/Type";
import { ShutterButton, PrimaryButton, TextLink, IconButton } from "../components/Button";
import { ChevronLeft, ImageIcon } from "../components/icons";
import Reveal from "../components/Reveal";
import useReducedMotion from "../lib/useReducedMotion";

// Simulators/emulators have no usable camera — steer to upload there.
const HAS_CAMERA = Platform.OS === "web" || Device.isDevice;

/* Corner ticks framing the oval — a quiet "viewfinder" cue. */
function Guide() {
  return (
    <Svg style={StyleSheet.absoluteFill} viewBox="0 0 300 400" preserveAspectRatio="none">
      <Ellipse
        cx="150"
        cy="180"
        rx="96"
        ry="126"
        fill="none"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="1.4"
        strokeDasharray="3 8"
      />
    </Svg>
  );
}

export default function CaptureScreen({ onBack, onCapture }) {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [ready, setReady] = useState(false);
  const flash = useRef(new Animated.Value(0)).current;
  const reduced = useReducedMotion();

  const triggerFlash = useCallback(() => {
    if (reduced) return;
    flash.setValue(0);
    Animated.sequence([
      Animated.timing(flash, { toValue: 0.85, duration: 70, useNativeDriver: true }),
      Animated.timing(flash, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]).start();
  }, [flash, reduced]);

  useEffect(() => {
    if (HAS_CAMERA && permission && !permission.granted && permission.canAskAgain) {
      requestPermission();
    }
  }, [permission, requestPermission]);

  const capture = useCallback(async () => {
    if (!cameraRef.current) return;
    triggerFlash();
    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.7,
      });
      onCapture(photo.base64, "image/jpeg");
    } catch {
      onCapture(null, null);
    }
  }, [onCapture, triggerFlash]);

  const pick = useCallback(async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      base64: true,
      quality: 0.7,
    });
    if (res.canceled || !res.assets?.[0]?.base64) return;
    const asset = res.assets[0];
    const mediaType =
      asset.mimeType && asset.mimeType.startsWith("image/") ? asset.mimeType : "image/jpeg";
    onCapture(asset.base64, mediaType);
  }, [onCapture]);

  const granted = HAS_CAMERA && permission?.granted;

  return (
    <View style={{ flex: 1, paddingHorizontal: space.xxl }}>
      {/* top bar */}
      <View style={{ flexDirection: "row", alignItems: "center", height: 48 }}>
        <View style={{ marginLeft: -8 }}>
          <IconButton onPress={onBack}>
            <ChevronLeft />
          </IconButton>
        </View>
      </View>

      <Reveal style={{ alignItems: "center", marginTop: space.sm }}>
        <Title>{HAS_CAMERA ? "Center your face" : "Add your selfie"}</Title>
        <Body style={{ marginTop: space.sm, color: colors.ink2, textAlign: "center" }}>
          {HAS_CAMERA
            ? "Face a window, no harsh shadows."
            : "No camera in the Simulator — upload a clear, well-lit selfie."}
        </Body>
      </Reveal>

      {/* viewport */}
      <Reveal delay={120} style={{ flex: 1, justifyContent: "center", marginVertical: space.xxl }}>
        <View style={[styles.viewport, shadow.lift]}>
          {granted ? (
            <>
              <CameraView
                ref={cameraRef}
                style={StyleSheet.absoluteFill}
                facing="front"
                onCameraReady={() => setReady(true)}
              />
              <Guide />
              {!ready && (
                <View style={[StyleSheet.absoluteFill, styles.center]}>
                  <Small style={{ color: colors.ink2 }}>Waking the camera…</Small>
                </View>
              )}
            </>
          ) : (
            <View style={[StyleSheet.absoluteFill, styles.center, { padding: space.xxl }]}>
              <Title style={{ fontSize: 20 }}>{HAS_CAMERA ? "Camera is off" : "Simulator"}</Title>
              <Body style={{ textAlign: "center", marginTop: space.md, color: colors.ink2 }}>
                {HAS_CAMERA
                  ? "Allow camera access, or upload a clear, well-lit selfie instead."
                  : "Drag a photo onto the Simulator (it saves to Photos), then upload it below."}
              </Body>
            </View>
          )}
          <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFill, { backgroundColor: "#FFFFFF", opacity: flash }]}
          />
        </View>
      </Reveal>

      {/* actions */}
      <Reveal delay={220} style={{ alignItems: "center", gap: space.lg, paddingBottom: space.lg }}>
        {granted ? (
          <>
            <ShutterButton onPress={capture} />
            <TextLink label="Upload a photo instead" icon={<ImageIcon />} onPress={pick} />
          </>
        ) : (
          <PrimaryButton label="Upload a photo" full onPress={pick} />
        )}
      </Reveal>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: "center", justifyContent: "center" },
  viewport: {
    width: "100%",
    aspectRatio: 3 / 4,
    borderRadius: radius.viewport,
    backgroundColor: "#E6E0D2",
    borderWidth: 1,
    borderColor: colors.line,
    overflow: "hidden",
  },
});
