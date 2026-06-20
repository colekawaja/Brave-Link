import React, { useState } from "react";
import { TextInput, View } from "react-native";
import { colors, radius, space } from "../theme/tokens";
import { FONT } from "../theme/fonts";
import { Title, Body, Small, Tiny } from "../components/Type";
import { GoogleButton, PrimaryButton } from "../components/Button";
import Reveal from "../components/Reveal";

const nameFromEmail = (email) => {
  const handle = (email.split("@")[0] || "").replace(/[._]+/g, " ").trim();
  if (!handle) return "there";
  return handle.charAt(0).toUpperCase() + handle.slice(1);
};

/* Fast account creation — one tap with Google, or an email with no
 * password and no verification. */
export default function AccountScreen({ onSignIn }) {
  const [email, setEmail] = useState("");
  const valid = /\S+@\S+\.\S+/.test(email);

  return (
    <View style={{ flex: 1, justifyContent: "center", paddingHorizontal: space.xxl }}>
      <Reveal style={{ alignItems: "center" }}>
        <Title style={{ textAlign: "center" }}>Save your results</Title>
        <Body style={{ textAlign: "center", color: colors.ink2, marginTop: space.md, maxWidth: 300 }}>
          Create an account so you can track your skin as it improves.
        </Body>
      </Reveal>

      <Reveal delay={140} style={{ marginTop: space.h1 }}>
        <GoogleButton
          full
          onPress={() => onSignIn({ name: "there", email: "you@gmail.com", provider: "google" })}
        />
      </Reveal>

      <Reveal delay={220} style={{ flexDirection: "row", alignItems: "center", gap: space.md, marginVertical: space.xl }}>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
        <Tiny style={{ color: colors.ink3 }}>or</Tiny>
        <View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
      </Reveal>

      <Reveal delay={300}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@email.com"
          placeholderTextColor={colors.ink3}
          autoCapitalize="none"
          keyboardType="email-address"
          inputMode="email"
          style={{
            fontFamily: FONT.sans,
            fontSize: 15,
            color: colors.ink,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.line,
            borderRadius: radius.pill,
            paddingVertical: 15,
            paddingHorizontal: 20,
          }}
        />
        <View style={{ marginTop: space.md }}>
          <PrimaryButton
            label="Continue"
            full
            onPress={() =>
              onSignIn({
                name: nameFromEmail(valid ? email : "there"),
                email: valid ? email.trim() : "you@email.com",
                provider: "email",
              })
            }
          />
        </View>
      </Reveal>

      <Reveal delay={380} style={{ alignItems: "center", marginTop: space.xl }}>
        <Tiny style={{ textAlign: "center", maxWidth: 300 }}>
          No password, no email verification — you're in instantly.
        </Tiny>
      </Reveal>
    </View>
  );
}
