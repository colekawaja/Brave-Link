import React from "react";
import { ScrollView, View } from "react-native";
import { FONT } from "../theme/fonts";
import { colors, radius, space } from "../theme/tokens";
import { Kicker, Heading, Serif, Body, Small, Tiny } from "../components/Type";
import { GhostButton } from "../components/Button";
import { Sparkle } from "../components/icons";
import Reveal from "../components/Reveal";
import ScoreRing from "../components/ScoreRing";
import ConcernCard from "../components/ConcernCard";
import RoutineCard from "../components/RoutineCard";
import { clamp, label, SEVERITY_ORDER } from "../lib/format";

function SectionLabel({ children }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
      <Kicker>{children}</Kicker>
      <View style={{ flex: 1, height: 1, backgroundColor: colors.line }} />
    </View>
  );
}

function ProductRow({ product }) {
  return (
    <View style={{ paddingVertical: space.md, borderTopWidth: 1, borderTopColor: colors.lineSoft }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: space.md }}>
        <Body style={{ flex: 1, fontFamily: FONT.sansSemi, color: colors.ink, fontSize: 14.5 }}>
          {product.example}
        </Body>
        <View
          style={{
            backgroundColor: colors.sageSoft,
            borderRadius: radius.chip,
            paddingHorizontal: 9,
            paddingVertical: 4,
          }}
        >
          <Tiny style={{ color: colors.sageDeep, fontFamily: FONT.sansMed }}>{product.ingredient}</Tiny>
        </View>
      </View>
      <Small style={{ marginTop: 5, color: colors.ink2 }}>
        {product.type} — {product.why}
      </Small>
    </View>
  );
}

export default function ResultsScreen({ result, demo, onRescan }) {
  const concerns = Array.isArray(result.concerns) ? result.concerns : [];
  const sorted = [...concerns].sort(
    (a, b) =>
      (SEVERITY_ORDER[b.severity] ?? 0) - (SEVERITY_ORDER[a.severity] ?? 0) ||
      a.score - b.score
  );
  const focus = sorted.filter((c) => c.severity !== "minimal");
  const calm = sorted.filter((c) => c.severity === "minimal");
  const recs = focus
    .filter((c) => Array.isArray(c.products) && c.products.length > 0)
    .slice(0, 4);
  const routine = result.routine || { am: [], pm: [] };

  return (
    <ScrollView
      contentContainerStyle={{ paddingHorizontal: space.xxl, paddingTop: space.xl, paddingBottom: space.giant }}
      showsVerticalScrollIndicator={false}
    >
      {/* hero */}
      <Reveal style={{ alignItems: "center", marginTop: space.md }}>
        {demo && (
          <View
            style={{
              backgroundColor: colors.sageSoft,
              borderRadius: radius.chip,
              paddingHorizontal: 12,
              paddingVertical: 5,
              marginBottom: space.lg,
            }}
          >
            <Tiny style={{ color: colors.sageDeep, fontFamily: FONT.sansMed, letterSpacing: 0.4 }}>
              Sample result · add a key for a real scan
            </Tiny>
          </View>
        )}
        <ScoreRing value={clamp(Math.round(result.overallClarity), 0, 100)} />
        <Serif style={{ textAlign: "center", marginTop: space.h3, maxWidth: 350 }}>
          {result.summary}
        </Serif>
      </Reveal>

      {/* focus */}
      {focus.length > 0 && (
        <View style={{ marginTop: space.giant }}>
          <Reveal>
            <SectionLabel>AREAS TO FOCUS ON</SectionLabel>
          </Reveal>
          <View style={{ marginTop: space.xl, gap: space.lg }}>
            {focus.map((c, idx) => (
              <ConcernCard key={c.name} concern={c} delay={120 + idx * 70} />
            ))}
          </View>
        </View>
      )}

      {/* calm */}
      {calm.length > 0 && (
        <Reveal delay={120}>
          <View
            style={{
              marginTop: space.lg,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              backgroundColor: colors.sageSoft,
              borderRadius: radius.card,
              paddingHorizontal: space.xl,
              paddingVertical: space.lg,
            }}
          >
            <Sparkle />
            <Small style={{ flex: 1, color: colors.sageDeep }}>
              <Small style={{ fontFamily: FONT.sansSemi, color: colors.sageDeep }}>Looking good — </Small>
              {calm.map((c) => label(c.name)).join(", ")}.
            </Small>
          </View>
        </Reveal>
      )}

      {/* recommendations */}
      {recs.length > 0 && (
        <View style={{ marginTop: space.giant }}>
          <Reveal>
            <SectionLabel>RECOMMENDED</SectionLabel>
          </Reveal>
          <View style={{ marginTop: space.xl, gap: space.h2 }}>
            {recs.map((c, idx) => (
              <Reveal key={c.name} delay={80 + idx * 70}>
                <Heading style={{ fontSize: 18 }}>{label(c.name)}</Heading>
                <View style={{ marginTop: space.sm }}>
                  {c.products.slice(0, 3).map((p, i) => (
                    <ProductRow key={i} product={p} />
                  ))}
                </View>
              </Reveal>
            ))}
          </View>
        </View>
      )}

      {/* routine */}
      {(routine.am?.length || routine.pm?.length) ? (
        <View style={{ marginTop: space.giant }}>
          <Reveal>
            <SectionLabel>YOUR ROUTINE</SectionLabel>
          </Reveal>
          <Reveal delay={100} style={{ marginTop: space.xl }}>
            <RoutineCard am={routine.am || []} pm={routine.pm || []} />
          </Reveal>
        </View>
      ) : null}

      {/* disclaimer + rescan */}
      <Tiny style={{ marginTop: space.h1 }}>
        Cosmetic and informational only — not medical advice. See a dermatologist
        for any skin condition or concern.
      </Tiny>

      <View style={{ marginTop: space.h1, alignItems: "center" }}>
        <GhostButton label="Scan again" onPress={onRescan} />
      </View>
    </ScrollView>
  );
}
