import React from "react";
import { Text as RNText } from "react-native";
import { FONT } from "../theme/fonts";
import { colors } from "../theme/tokens";

/* A small set of semantic text styles for a consistent type voice. */

const make =
  (base) =>
  ({ style, color, children, ...rest }) =>
    (
      <RNText {...rest} style={[base, color ? { color } : null, style]}>
        {children}
      </RNText>
    );

export const Kicker = make({
  fontFamily: FONT.sansMed,
  fontSize: 11,
  letterSpacing: 2.6,
  color: colors.ink3,
});

export const Display = make({
  fontFamily: FONT.serif,
  fontSize: 44,
  lineHeight: 49,
  color: colors.ink,
  letterSpacing: -0.4,
});

export const Title = make({
  fontFamily: FONT.serif,
  fontSize: 27,
  lineHeight: 32,
  color: colors.ink,
  letterSpacing: -0.2,
});

export const Heading = make({
  fontFamily: FONT.serifMed,
  fontSize: 19,
  lineHeight: 24,
  color: colors.ink,
});

export const Serif = make({
  fontFamily: FONT.serif,
  fontSize: 20,
  lineHeight: 29,
  color: colors.ink,
});

export const Body = make({
  fontFamily: FONT.sans,
  fontSize: 15,
  lineHeight: 24,
  color: colors.ink2,
});

export const Small = make({
  fontFamily: FONT.sans,
  fontSize: 13,
  lineHeight: 20,
  color: colors.ink2,
});

export const Tiny = make({
  fontFamily: FONT.sans,
  fontSize: 11.5,
  lineHeight: 18,
  color: colors.ink3,
});
