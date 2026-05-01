import type { Rect } from "../../lib/layout";

export function NodeLabel({
  rect,
  title,
  subtitle,
}: {
  rect: Rect;
  title: string;
  /** Single line, or multiple stacked lines. */
  subtitle?: string | string[];
}) {
  const cx = rect.x + rect.width / 2;
  const cy = rect.y + rect.height / 2;
  const subtitles = subtitle
    ? Array.isArray(subtitle)
      ? subtitle
      : [subtitle]
    : [];
  if (subtitles.length === 0) {
    return (
      <text
        x={cx}
        y={cy + 5}
        textAnchor="middle"
        fontSize="14"
        fill="currentColor"
      >
        {title}
      </text>
    );
  }
  // Title sits one half-line above center; subtitles stack below it.
  const titleY = cy - 4 - (subtitles.length - 1) * 6;
  return (
    <>
      <text
        x={cx}
        y={titleY}
        textAnchor="middle"
        fontSize="14"
        fill="currentColor"
      >
        {title}
      </text>
      {subtitles.map((line, i) => (
        <text
          key={i}
          x={cx}
          y={titleY + 16 + i * 12}
          textAnchor="middle"
          fontSize="10"
          opacity={0.6}
          fill="currentColor"
        >
          {line}
        </text>
      ))}
    </>
  );
}

export function GroupLabel({ rect, label }: { rect: Rect; label: string }) {
  return (
    <text
      x={rect.x + 10}
      y={rect.y + 15}
      fontSize="11"
      fill="currentColor"
    >
      {label}
    </text>
  );
}
