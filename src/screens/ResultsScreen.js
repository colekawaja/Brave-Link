import React from "react";
import { ScrollView, View } from "react-native";
import { FONT } from "../theme/fonts";
import { colors, radius, space } from "../theme/tokens";
import { Serif, Body, Small, Tiny } from "../components/Type";
import { PrimaryButton } from "../components/Button";
import { Sparkle } from "../components/icons";
import Reveal from "../components/Reveal";
import SectionLabel from "../components/SectionLabel";
import ScoreRing from "../components/ScoreRing";
import ConcernCard from "../components/ConcernCard";
import RoutineCard from "../components/RoutineCard";
import Collapsible from "../components/Collapsible";
import ProductRow from "../components/ProductRow";
import { clamp, label, scoreColor, SEVERITY_ORDER } from "../lib/format";

export default function ResultsScreen({ result, demo, onDone }) {
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

      {/* recommendations — tap a concern to expand its evidence-based picks */}
      {recs.length > 0 && (
        <View style={{ marginTop: space.giant }}>
          <Reveal>
            <SectionLabel>RECOMMENDED</SectionLabel>
            <Small style={{ marginTop: space.sm, color: colors.ink3 }}>
              Tap a concern for picks, each backed by peer-reviewed research.
            </Small>
          </Reveal>
          <View style={{ marginTop: space.xl, gap: space.md }}>
            {recs.map((c, idx) => {
              const n = Math.min(c.products.length, 3);
              return (
                <Reveal key={c.name} delay={80 + idx * 70}>
                  <Collapsible
                    title={label(c.name)}
                    accent={scoreColor(c.score)}
                    meta={`${n} ${n === 1 ? "pick" : "picks"}`}
                    defaultOpen={idx === 0}
                  >
                    {c.products.slice(0, 3).map((p, i) => (
                      <ProductRow key={i} product={p} first={i === 0} />
                    ))}
                  </Collapsible>
                </Reveal>
              );
            })}
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

      <View style={{ marginTop: space.h1 }}>
        <PrimaryButton label="Go to my dashboard" full onPress={onDone} />
      </View>
    </ScrollView>
  );
}
