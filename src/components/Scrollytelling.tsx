import { useEffect, useMemo, useRef, useState } from "react";
import scrollama from "scrollama";
import type { Scene } from "../content/posts/automated-db-migration/scenes";
import { diffScenes } from "../lib/diff";
import { ArchitectureDiagram } from "./ArchitectureDiagram";
import { Prose } from "./Prose";

type Props = { scenes: Scene[] };

export function Scrollytelling({ scenes }: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scroller = scrollama();
    scroller
      .setup({
        step: ".scrolly-step",
        offset: 0.5,
      })
      .onStepEnter((resp) => setActiveIndex(resp.index));

    const onResize = () => scroller.resize();
    const onScroll = () => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight;
      const scrolled = Math.max(0, -rect.top);
      setProgress(total > 0 ? Math.min(1, scrolled / total) : 0);
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      scroller.destroy();
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const active = scenes[activeIndex] ?? scenes[0];

  // Diff against the previous scene to highlight what's *new this scene*
  // (vs. carried over). Skip when the previous scene is the intro — intro
  // ghost-renders nearly the whole stack, which would falsely mark step-0's
  // visible nodes as "unchanged". Treat step-0 as the baseline instead.
  const diff = useMemo(() => {
    const prev = activeIndex > 0 ? scenes[activeIndex - 1] : null;
    const prevForDiff = prev && prev.id !== "intro" ? prev : null;
    return diffScenes(prevForDiff, active);
  }, [activeIndex, scenes, active]);

  return (
    <div ref={containerRef} className="scrolly-container">
      <div className="scrolly-progressbar" aria-hidden="true">
        <div
          className="scrolly-progress-fill"
          style={{ transform: `scaleX(${progress})` }}
        />
        <ol className="scrolly-progress-dots">
          {scenes.map((scene, i) => (
            <li
              key={scene.id}
              data-active={i === activeIndex ? "true" : "false"}
            >
              <span className="label">{scene.shortTitle}</span>
              <span className="dot" />
            </li>
          ))}
        </ol>
      </div>

      <div className="scrolly-diagram">
        <div className="diagram-zone">
          <div className="scrolly-diagram-inner">
            {active ? <ArchitectureDiagram scene={active} diff={diff} /> : null}
          </div>
        </div>
        <div className="extras-zone" aria-hidden={!active?.extras}>
          {active?.extras ? (
            <div className="extras-inner">
              <Prose text={active.extras} />
            </div>
          ) : null}
        </div>
      </div>

      <div className="scrolly-steps">
        {scenes.map((scene, i) => (
          <section
            key={scene.id}
            className="scrolly-step"
            data-scene-id={scene.id}
            data-active={i === activeIndex ? "true" : "false"}
          >
            <h2>{scene.title}</h2>
            <Prose text={scene.prose} />
            {scene.extras ? (
              <div className="extras-inline">
                <Prose text={scene.extras} />
              </div>
            ) : null}
          </section>
        ))}
      </div>
    </div>
  );
}
