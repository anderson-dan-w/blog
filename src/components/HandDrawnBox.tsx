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

export function HandDrawnBox({
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
    const rect = generator.rectangle(x, y, width, height, { seed, roughness });
    return drawablesToStrokePath([rect]);
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
