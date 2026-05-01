import { useMemo } from "react";
import { drawablesToStrokePath, generator } from "../lib/rough";

type Props = {
  // Top-left of the bounding box (matches HandDrawnBox convention).
  x: number;
  y: number;
  width: number;
  height: number;
  /** Ratio of the elliptical cap height to total height. Clamped to 0.1–0.45. */
  capRatio?: number;
  seed?: number;
  roughness?: number;
  stroke?: string;
  strokeWidth?: number;
};

export function HandDrawnCylinder({
  x,
  y,
  width,
  height,
  capRatio = 0.25,
  seed = 1,
  roughness = 1.6,
  stroke = "currentColor",
  strokeWidth = 1.5,
}: Props) {
  const d = useMemo(() => {
    const capH = Math.max(6, Math.min(height * capRatio, height * 0.45));
    const cx = x + width / 2;
    const topCy = y + capH / 2;
    const bottomCy = y + height - capH / 2;

    // Four separate rough primitives composed into the cylinder silhouette.
    // Seeds are offset so each primitive has its own sketchy variation rather
    // than all four looking identically perturbed.
    const topEllipse = generator.ellipse(cx, topCy, width, capH, {
      seed,
      roughness,
    });
    const leftSide = generator.line(x, topCy, x, bottomCy, {
      seed: seed + 1,
      roughness,
    });
    const rightSide = generator.line(x + width, topCy, x + width, bottomCy, {
      seed: seed + 2,
      roughness,
    });
    // Bottom front half-arc: start=0 (right of center) sweeping through
    // stop=PI (left of center) passes through the point below center in
    // screen coords, giving us the visible front of the base.
    const bottomArc = generator.arc(
      cx,
      bottomCy,
      width,
      capH,
      0,
      Math.PI,
      false,
      { seed: seed + 3, roughness },
    );

    return drawablesToStrokePath([topEllipse, leftSide, rightSide, bottomArc]);
  }, [x, y, width, height, capRatio, seed, roughness]);

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
