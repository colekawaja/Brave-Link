import React, { useEffect, useRef, useState } from "react";
import { Animated, Easing, View } from "react-native";
import Svg, { Defs, LinearGradient, Stop, Path, Circle } from "react-native-svg";
import { FONT } from "../theme/fonts";
import { colors, motion } from "../theme/tokens";
import { Tiny } from "./Type";
import { clamp, scoreColor, scoreGradient } from "../lib/format";
import useReducedMotion from "../lib/useReducedMotion";

const AnimatedPath = Animated.createAnimatedComponent(Path);
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

/* A clean sparkline of overall clarity across past scans. */
export default function ProgressChart({ history }) {
  const reduced = useReducedMotion();
  const [w, setW] = useState(0);
  const draw = useRef(new Animated.Value(0)).current;

  const data = history.map((h) => clamp(Math.round(h.overallClarity), 0, 100));
  const n = data.length;
  const H = 104;
  const padX = 14;
  const padTop = 16;
  const padBottom = 16;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const lo = Math.max(0, min - 6);
  const hi = Math.min(100, max + 6);
  const range = Math.max(1, hi - lo);

  const xFor = (i) => (n === 1 ? w / 2 : padX + (i / (n - 1)) * (w - 2 * padX));
  const yFor = (v) => padTop + (1 - (v - lo) / range) * (H - padTop - padBottom);
  const pts = data.map((v, i) => ({ x: xFor(i), y: yFor(v) }));

  const linePath = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const areaPath = `${linePath} L ${pts[pts.length - 1].x.toFixed(1)} ${H} L ${pts[0].x.toFixed(1)} ${H} Z`;

  // Total length of the polyline, for the stroke-draw animation.
  let len = 0;
  for (let i = 1; i < pts.length; i++) {
    len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  }

  useEffect(() => {
    if (!w) return;
    if (reduced) {
      draw.setValue(1);
      return;
    }
    draw.setValue(0);
    Animated.timing(draw, {
      toValue: 1,
      duration: 900,
      delay: 150,
      easing: motion.ease,
      useNativeDriver: false,
    }).start();
  }, [w, len, reduced, draw]);

  const dashoffset = draw.interpolate({ inputRange: [0, 1], outputRange: [len, 0] });
  const grad = scoreGradient(data[n - 1]);
  const last = pts[pts.length - 1];

  // Gentle pulse on the latest point.
  const pulse = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduced) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 0, duration: 1400, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse, reduced]);
  const haloR = pulse.interpolate({ inputRange: [0, 1], outputRange: [8, 12] });
  const haloO = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.22, 0.06] });

  return (
    <View>
      <View onLayout={(e) => setW(e.nativeEvent.layout.width)} style={{ height: H }}>
        {w > 0 && (
          <Svg width={w} height={H}>
            <Defs>
              <LinearGradient id="progFill" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0%" stopColor={grad.from} stopOpacity={0.22} />
                <Stop offset="100%" stopColor={grad.from} stopOpacity={0} />
              </LinearGradient>
              <LinearGradient id="progLine" x1="0" y1="0" x2="1" y2="0">
                <Stop offset="0%" stopColor={grad.from} />
                <Stop offset="100%" stopColor={grad.to} />
              </LinearGradient>
            </Defs>
            <Path d={areaPath} fill="url(#progFill)" />
            <AnimatedPath
              d={linePath}
              fill="none"
              stroke="url(#progLine)"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={len}
              strokeDashoffset={dashoffset}
            />
            <AnimatedCircle cx={last.x} cy={last.y} r={haloR} fill={scoreColor(data[n - 1])} opacity={haloO} />
            <Circle cx={last.x} cy={last.y} r={4.5} fill={scoreColor(data[n - 1])} />
          </Svg>
        )}
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
        <Tiny style={{ color: colors.ink3 }}>
          First <Tiny style={{ fontFamily: FONT.sansSemi, color: colors.ink2 }}>{data[0]}</Tiny>
        </Tiny>
        <Tiny style={{ color: colors.ink3 }}>
          Now <Tiny style={{ fontFamily: FONT.sansSemi, color: colors.ink2 }}>{data[n - 1]}</Tiny>
        </Tiny>
      </View>
    </View>
  );
}
