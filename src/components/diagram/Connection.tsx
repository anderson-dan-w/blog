import { useMemo } from "react";
import { drawablesToStrokePath, generator } from "../../lib/rough";
import {
  anchorPoint,
  endpointId,
  resolveEndpointRect,
  type Edge,
} from "../../lib/layout";

type Props = Edge & { seed?: number };

const ARROW_LEN = 10;
const ARROW_ANGLE = Math.PI / 7;

export function Connection({ from, to, label, seed = 51 }: Props) {
  const a = anchorPoint(resolveEndpointRect(from), from.side);
  const b = anchorPoint(resolveEndpointRect(to), to.side);

  const { shaftD, headD, labelX, labelY } = useMemo(() => {
    const shaft = generator.line(a.x, a.y, b.x, b.y, {
      seed,
      roughness: 1.3,
    });

    // Chevron arrow head: two short sketchy lines stemming from the target
    // endpoint back at +/- ARROW_ANGLE off the shaft's direction.
    const theta = Math.atan2(b.y - a.y, b.x - a.x);
    const lx = b.x - Math.cos(theta - ARROW_ANGLE) * ARROW_LEN;
    const ly = b.y - Math.sin(theta - ARROW_ANGLE) * ARROW_LEN;
    const rx = b.x - Math.cos(theta + ARROW_ANGLE) * ARROW_LEN;
    const ry = b.y - Math.sin(theta + ARROW_ANGLE) * ARROW_LEN;
    const leftFin = generator.line(b.x, b.y, lx, ly, {
      seed: seed + 1,
      roughness: 1.3,
    });
    const rightFin = generator.line(b.x, b.y, rx, ry, {
      seed: seed + 2,
      roughness: 1.3,
    });

    // Offset the label perpendicular to the arrow, on the "upper" side.
    // For horizontal arrows (theta=0) this is straight up; for diagonals
    // it tracks the slope so the label never gets crossed by the shaft.
    const midX = (a.x + b.x) / 2;
    const midY = (a.y + b.y) / 2;
    const LABEL_OFFSET = 10;
    return {
      shaftD: drawablesToStrokePath([shaft]),
      headD: drawablesToStrokePath([leftFin, rightFin]),
      labelX: midX + Math.sin(theta) * LABEL_OFFSET,
      labelY: midY - Math.cos(theta) * LABEL_OFFSET,
    };
  }, [a.x, a.y, b.x, b.y, seed]);

  return (
    <g
      className="diagram-connection"
      data-connection={`${endpointId(from)}-${endpointId(to)}`}
    >
      <path
        d={shaftD}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.3}
        strokeLinecap="round"
        opacity={0.8}
      />
      <path
        d={headD}
        fill="none"
        stroke="currentColor"
        strokeWidth={1.3}
        strokeLinecap="round"
        opacity={0.8}
      />
      {label ? (
        // Bg-colored "halo" stroke painted first so the arrow shaft is
        // visually cut where it would otherwise run through the label.
        // The halo styles (stroke, stroke-width, paint-order) live in CSS:
        // `var()` is unreliable inside SVG presentation attributes across
        // browsers/build pipelines, but is solid inside CSS rules.
        <text
          className="connection-label"
          x={labelX}
          y={labelY}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="10"
          opacity={0.9}
          fill="currentColor"
        >
          {label}
        </text>
      ) : null}
    </g>
  );
}
