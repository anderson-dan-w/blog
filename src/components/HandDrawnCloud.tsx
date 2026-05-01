import { useMemo } from "react";
import { drawablesToStrokePath, generator } from "../lib/rough";

type Props = {
  x: number;
  y: number;
  width: number;
  height: number;
  seed?: number;
  roughness?: number;
  stroke?: string;
  strokeWidth?: number;
};

export function HandDrawnCloud({
  x,
  y,
  width,
  height,
  seed = 1,
  roughness = 1.6,
  stroke = "currentColor",
  strokeWidth = 1.5,
}: Props) {
  const d = useMemo(() => {
    // Parameterised SVG path: four bumps across the top, flat-ish bottom.
    // All control points are fractions of (w, h) so the cloud scales cleanly
    // without distorting rough.js's sketchy perturbation magnitude.
    const p = (fx: number, fy: number) =>
      `${x + width * fx} ${y + height * fy}`;

    const pathData = [
      `M ${p(0.18, 0.92)}`,
      `Q ${p(-0.02, 0.92)} ${p(0.06, 0.62)}`,
      `Q ${p(-0.05, 0.36)} ${p(0.18, 0.3)}`,
      `Q ${p(0.22, 0.02)} ${p(0.42, 0.14)}`,
      `Q ${p(0.55, -0.04)} ${p(0.7, 0.12)}`,
      `Q ${p(0.9, 0.04)} ${p(0.94, 0.36)}`,
      `Q ${p(1.1, 0.58)} ${p(0.9, 0.82)}`,
      `Q ${p(0.88, 0.98)} ${p(0.7, 0.92)}`,
      `L ${p(0.3, 0.92)}`,
      `Q ${p(0.22, 0.98)} ${p(0.18, 0.92)}`,
      `Z`,
    ].join(" ");

    const drawable = generator.path(pathData, { seed, roughness });
    return drawablesToStrokePath([drawable]);
  }, [x, y, width, height, seed, roughness]);

  return (
    <path
      d={d}
      fill="none"
      stroke={stroke}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );
}
