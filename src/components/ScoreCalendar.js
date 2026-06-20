import React, { useState } from "react";
import { Pressable, View } from "react-native";
import { FONT } from "../theme/fonts";
import { colors, radius, space } from "../theme/tokens";
import { Body, Small, Tiny } from "./Type";
import { ChevronLeft } from "./icons";
import { scoreColor } from "../lib/format";

const WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const keyFor = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

/* A month calendar showing each day's clarity score, color-coded. */
export default function ScoreCalendar({ history, onSelectDay }) {
  // Map each day to its latest scan that day.
  const byDay = {};
  for (const rec of history) {
    const d = new Date(rec.date);
    const k = keyFor(d);
    if (!byDay[k] || new Date(rec.date) > new Date(byDay[k].date)) byDay[k] = rec;
  }

  const latest = history.length ? new Date(history[history.length - 1].date) : new Date();
  const [view, setView] = useState(new Date(latest.getFullYear(), latest.getMonth(), 1));

  const y = view.getFullYear();
  const m = view.getMonth();
  const daysInMonth = new Date(y, m + 1, 0).getDate();
  const firstWeekday = new Date(y, m, 1).getDay();
  const todayKey = keyFor(new Date());

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const monthLabel = view.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const shiftMonth = (delta) => setView(new Date(y, m + delta, 1));

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: radius.card,
        borderWidth: 1,
        borderColor: colors.line,
        padding: space.xl,
      }}
    >
      {/* month header */}
      <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
        <Pressable onPress={() => shiftMonth(-1)} hitSlop={10} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: 4 })}>
          <ChevronLeft size={20} color={colors.ink2} />
        </Pressable>
        <Body style={{ fontFamily: FONT.serifMed, fontSize: 17, color: colors.ink }}>{monthLabel}</Body>
        <Pressable onPress={() => shiftMonth(1)} hitSlop={10} style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1, padding: 4, transform: [{ rotate: "180deg" }] })}>
          <ChevronLeft size={20} color={colors.ink2} />
        </Pressable>
      </View>

      {/* weekday labels */}
      <View style={{ flexDirection: "row", marginTop: space.lg }}>
        {WEEKDAYS.map((w, i) => (
          <View key={i} style={{ width: `${100 / 7}%`, alignItems: "center" }}>
            <Tiny style={{ color: colors.ink3 }}>{w}</Tiny>
          </View>
        ))}
      </View>

      {/* day grid */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: space.sm }}>
        {cells.map((d, i) => {
          if (d == null) return <View key={i} style={{ width: `${100 / 7}%`, aspectRatio: 1 }} />;
          const k = `${y}-${m}-${d}`;
          const rec = byDay[k];
          const isToday = k === todayKey;
          const sc = rec ? Math.round(rec.overallClarity) : null;
          return (
            <Pressable
              key={i}
              disabled={!rec}
              onPress={() => rec && onSelectDay?.(rec)}
              style={({ pressed }) => ({
                width: `${100 / 7}%`,
                aspectRatio: 1,
                alignItems: "center",
                justifyContent: "center",
                opacity: pressed ? 0.6 : 1,
              })}
            >
              <View
                style={{
                  width: "82%",
                  aspectRatio: 1,
                  borderRadius: 12,
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: rec ? `${scoreColor(sc)}22` : "transparent",
                  borderWidth: isToday ? 1.5 : 0,
                  borderColor: colors.ink,
                }}
              >
                <Tiny style={{ color: rec ? colors.ink3 : colors.ink3, fontSize: 10 }}>{d}</Tiny>
                {rec ? (
                  <Small style={{ fontFamily: FONT.serifMed, color: scoreColor(sc), fontSize: 15, marginTop: 1 }}>
                    {sc}
                  </Small>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      <Tiny style={{ color: colors.ink3, marginTop: space.md, textAlign: "center" }}>
        Tap a day to revisit that scan.
      </Tiny>
    </View>
  );
}
