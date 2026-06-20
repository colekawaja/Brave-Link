import React, { useRef } from "react";
import { Animated, Pressable, View } from "react-native";
import { FONT } from "../theme/fonts";
import useReducedMotion from "../lib/useReducedMotion";
import { colors, radius, space } from "../theme/tokens";
import { Title, Heading, Serif, Body, Small, Tiny } from "../components/Type";
import { PrimaryButton } from "../components/Button";
import { Arrow } from "../components/icons";
import SectionLabel from "../components/SectionLabel";
import Reveal from "../components/Reveal";
import ScoreRing from "../components/ScoreRing";
import RoutineCard from "../components/RoutineCard";
import ScoreBar from "../components/ScoreBar";
import ScoreCalendar from "../components/ScoreCalendar";
import { useApp } from "../state/AppContext";
import { clamp, label, scoreColor, SEVERITY_ORDER } from "../lib/format";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function Delta({ latest, previous }) {
  if (!previous) {
    return (
      <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: radius.chip, paddingHorizontal: 12, paddingVertical: 6 }}>
        <Tiny style={{ color: colors.ink2 }}>Your baseline — rescan in a week to track progress</Tiny>
      </View>
    );
  }
  const d = Math.round(latest.overallClarity - previous.overallClarity);
  const up = d >= 0;
  const color = up ? colors.sage : colors.gold;
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: colors.sageSoft,
        borderRadius: radius.chip,
        paddingHorizontal: 12,
        paddingVertical: 6,
      }}
    >
      <Arrow size={13} color={color} down={!up} />
      <Tiny style={{ color: colors.sageDeep, fontFamily: FONT.sansSemi }}>
        {up ? "+" : ""}{d} since last scan
      </Tiny>
    </View>
  );
}

export default function HomeScreen({ onRescan, onViewReport, onViewRecord, onSignOut, canScan = true }) {
  const { user, latest, previous, history } = useApp();
  const reduced = useReducedMotion();
  const scrollY = useRef(new Animated.Value(0)).current;
  if (!latest) return null;

  const headerStyle = reduced
    ? null
    : {
        transform: [
          {
            translateY: scrollY.interpolate({
              inputRange: [-120, 0, 240],
              outputRange: [-20, 0, -36],
              extrapolate: "clamp",
            }),
          },
        ],
        opacity: scrollY.interpolate({
          inputRange: [0, 150, 260],
          outputRange: [1, 0.75, 0.45],
          extrapolate: "clamp",
        }),
      };

  const routine = latest.routine || { am: [], pm: [] };
  const concerns = Array.isArray(latest.concerns) ? latest.concerns : [];
  const focus = [...concerns]
    .filter((c) => c.severity !== "minimal")
    .sort((a, b) => (SEVERITY_ORDER[b.severity] ?? 0) - (SEVERITY_ORDER[a.severity] ?? 0) || a.score - b.score)
    .slice(0, 3);

  return (
    <Animated.ScrollView
      contentContainerStyle={{ paddingHorizontal: space.xxl, paddingTop: space.xl, paddingBottom: space.giant }}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })}
    >
      <Animated.View style={headerStyle}>
        {/* header */}
        <Reveal>
          <Tiny style={{ color: colors.ink3 }}>{greeting()}</Tiny>
          <Title style={{ marginTop: 2 }}>Your skin today</Title>
        </Reveal>

        {/* latest score */}
        <Reveal delay={90} style={{ alignItems: "center", marginTop: space.xl }}>
          <ScoreRing value={clamp(Math.round(latest.overallClarity), 0, 100)} size={172} compact />
          <View style={{ marginTop: space.lg }}>
            <Delta latest={latest} previous={previous} />
          </View>
          <Serif style={{ textAlign: "center", marginTop: space.lg, fontSize: 18, lineHeight: 26, maxWidth: 330 }}>
            {latest.summary}
          </Serif>
        </Reveal>
      </Animated.View>

      {/* rescan */}
      <Reveal delay={180} style={{ marginTop: space.h1 }}>
        <PrimaryButton label={canScan ? "Rescan my skin" : "Next scan tomorrow"} full onPress={onRescan} />
        {!canScan && (
          <Tiny style={{ textAlign: "center", color: colors.ink3, marginTop: space.md }}>
            One scan a day keeps your progress meaningful.
          </Tiny>
        )}
      </Reveal>

      {/* progress calendar */}
      {history.length >= 1 && (
        <Reveal delay={240} style={{ marginTop: space.giant }}>
          <SectionLabel>YOUR SCANS</SectionLabel>
          <View style={{ marginTop: space.lg }}>
            <ScoreCalendar history={history} onSelectDay={onViewRecord} />
          </View>
        </Reveal>
      )}

      {/* routine */}
      {(routine.am?.length || routine.pm?.length) ? (
        <Reveal delay={360} style={{ marginTop: space.giant }}>
          <SectionLabel>TODAY'S ROUTINE</SectionLabel>
          <View style={{ marginTop: space.lg }}>
            <RoutineCard am={routine.am || []} pm={routine.pm || []} />
          </View>
        </Reveal>
      ) : null}

      {/* focus */}
      {focus.length > 0 && (
        <Reveal delay={450} style={{ marginTop: space.giant }}>
          <SectionLabel>FOCUS AREAS</SectionLabel>
          <View
            style={{
              marginTop: space.lg,
              backgroundColor: colors.surface,
              borderRadius: radius.card,
              borderWidth: 1,
              borderColor: colors.line,
              paddingHorizontal: space.xl,
              paddingVertical: space.sm,
            }}
          >
            {focus.map((c, i) => (
              <Reveal
                key={c.name}
                delay={480 + i * 70}
                distance={6}
                style={{
                  paddingVertical: space.lg,
                  borderTopWidth: i === 0 ? 0 : 1,
                  borderTopColor: colors.lineSoft,
                }}
              >
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                  <Body style={{ color: colors.ink, fontFamily: FONT.sansMed }}>{label(c.name)}</Body>
                  <Body style={{ fontFamily: FONT.serifMed, color: scoreColor(c.score), fontSize: 17 }}>{c.score}</Body>
                </View>
                <View style={{ marginTop: 10 }}>
                  <ScoreBar value={c.score} />
                </View>
              </Reveal>
            ))}
          </View>
          <Pressable
            onPress={onViewReport}
            style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1, marginTop: space.lg, alignItems: "center" })}
          >
            <Small style={{ fontFamily: FONT.sansMed, color: colors.ink, textDecorationLine: "underline" }}>
              View full report
            </Small>
          </Pressable>
        </Reveal>
      )}

      {/* account footer */}
      <Reveal delay={540} style={{ marginTop: space.giant, alignItems: "center", gap: 6 }}>
        <Tiny style={{ color: colors.ink3 }}>
          {history.length} {history.length === 1 ? "scan" : "scans"} · signed in as {user?.email}
        </Tiny>
        <Pressable onPress={onSignOut} style={({ pressed }) => ({ opacity: pressed ? 0.6 : 1 })}>
          <Tiny style={{ color: colors.ink2, fontFamily: FONT.sansMed, textDecorationLine: "underline" }}>
            Sign out
          </Tiny>
        </Pressable>
      </Reveal>
    </Animated.ScrollView>
  );
}
