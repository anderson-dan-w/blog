import { useEffect, useState } from "react";

type Day = { date: string; count: number; level: number };

type Data = {
  generatedAt: string;
  accounts: string[];
  startYear: number;
  endYear: number;
  totalContributions: number;
  data: Day[];
};

const CELL = 11;
const GAP = 2;
const STEP = CELL + GAP;
const WEEKDAY_LABELS = ["", "Mon", "", "Wed", "", "Fri", ""];

type Props = {
  src: string;
};

export default function ContributionsHeatmap({ src }: Props) {
  const [data, setData] = useState<Data | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(src)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((j: Data) => alive && setData(j))
      .catch((e) => alive && setErr(String(e)));
    return () => {
      alive = false;
    };
  }, [src]);

  if (err) return <p className="heatmap-status">Failed to load: {err}</p>;
  if (!data) return <p className="heatmap-status">Loading…</p>;

  const byYear = new Map<number, Day[]>();
  for (const d of data.data) {
    const y = Number(d.date.slice(0, 4));
    const arr = byYear.get(y);
    if (arr) arr.push(d);
    else byYear.set(y, [d]);
  }
  const years = [...byYear.keys()].sort((a, b) => b - a);

  const fmt = new Date(data.generatedAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

  return (
    <div className="heatmap">
      <p className="heatmap-meta">
        <strong>{data.totalContributions.toLocaleString()}</strong>{" "}
        contributions merged across{" "}
        {data.accounts.map((a, i) => (
          <span key={a}>
            {i > 0 && ", "}
            <a href={`https://github.com/${a}`}>@{a}</a>
          </span>
        ))}
        . Last refreshed {fmt}.
      </p>

      <div className="heatmap-years">
        {years.map((y) => (
          <YearGrid key={y} year={y} days={byYear.get(y)!} />
        ))}
      </div>

      <Legend />
    </div>
  );
}

function YearGrid({ year, days }: { year: number; days: Day[] }) {
  // GitHub heatmap convention: columns are weeks (Sun..Sat). Pad the start so
  // Jan 1 lands on its correct weekday row.
  const offset = new Date(`${year}-01-01T00:00:00Z`).getUTCDay();
  const cells: (Day | null)[] = Array(offset).fill(null);
  cells.push(...days);
  while (cells.length % 7 !== 0) cells.push(null);
  const cols = cells.length / 7;

  const yearTotal = days.reduce((s, d) => s + d.count, 0);

  return (
    <section className="heatmap-year">
      <header className="heatmap-year-header">
        <h3>{year}</h3>
        <span>{yearTotal.toLocaleString()} contributions</span>
      </header>
      <div className="heatmap-year-grid">
        <ul className="heatmap-weekday-labels" aria-hidden="true">
          {WEEKDAY_LABELS.map((l, i) => (
            <li key={i}>{l}</li>
          ))}
        </ul>
        <svg
          className="heatmap-svg"
          width={cols * STEP}
          height={7 * STEP}
          role="img"
          aria-label={`${year} GitHub contributions, ${yearTotal} total`}
        >
          {cells.map((d, i) => {
            if (!d) return null;
            const col = Math.floor(i / 7);
            const row = i % 7;
            return (
              <rect
                key={d.date}
                x={col * STEP}
                y={row * STEP}
                width={CELL}
                height={CELL}
                rx={2}
                className={`heatmap-cell heatmap-level-${d.level}`}
              >
                <title>
                  {d.date}: {d.count} contribution{d.count === 1 ? "" : "s"}
                </title>
              </rect>
            );
          })}
        </svg>
      </div>
    </section>
  );
}

function Legend() {
  return (
    <div className="heatmap-legend" aria-hidden="true">
      <span>Less</span>
      {[0, 1, 2, 3, 4].map((lvl) => (
        <span key={lvl} className={`heatmap-legend-cell heatmap-level-${lvl}`} />
      ))}
      <span>More</span>
    </div>
  );
}
