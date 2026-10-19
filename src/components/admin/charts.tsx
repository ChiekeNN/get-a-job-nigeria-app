"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";

/** Respect the visitor's motion setting: numbers jump instead of counting. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return reduced;
}

/** Counts from 0 to `value` once, when the element first appears. */
export function useCountUp(value: number, duration = 900): number {
  const reduced = usePrefersReducedMotion();
  const [shown, setShown] = useState(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (reduced) return;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setShown(Math.round(value * eased));
      if (progress < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [value, duration, reduced]);

  return reduced ? value : shown;
}

/** Grows a value from 0 to `target` percentage after mount, for CSS bars. */
export function useGrown(target: number, delay = 120): number {
  const reduced = usePrefersReducedMotion();
  const [grown, setGrown] = useState(0);
  useEffect(() => {
    if (reduced) return;
    const timer = window.setTimeout(() => setGrown(target), delay);
    return () => window.clearTimeout(timer);
  }, [target, delay, reduced]);
  return reduced ? target : grown;
}

/** Measures an element, so an SVG drawn in CSS pixels stays readable. */
function useMeasuredWidth(fallback: number): [RefObject<HTMLDivElement | null>, number] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new ResizeObserver((entries) => {
      const next = Math.round(entries[0]?.contentRect.width ?? fallback);
      if (next > 0) setWidth(next);
    });
    observer.observe(node);
    return () => observer.disconnect();
  }, [fallback]);
  return [ref, width];
}

export interface Point {
  label: string;
  value: number;
}

/**
 * Two-series area chart, drawn by hand so the console carries no chart
 * dependency. The line animates in with a dash offset.
 */
export function TrendChart({
  series,
  height = 200,
}: {
  series: Array<{ name: string; colour: string; points: Point[] }>;
  height?: number;
}) {
  const [ref, measured] = useMeasuredWidth(760);
  const width = Math.max(260, measured);
  const reduced = usePrefersReducedMotion();
  const [drawn, setDrawn] = useState(reduced);
  useEffect(() => {
    const timer = window.setTimeout(() => setDrawn(true), 60);
    return () => window.clearTimeout(timer);
  }, []);

  const padding = { left: width < 420 ? 26 : 34, right: 10, top: 14, bottom: 24 };
  const max = Math.max(4, ...series.flatMap((line) => line.points.map((point) => point.value)));
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;
  const count = Math.max(1, series[0]?.points.length ?? 1);

  const x = (index: number) => padding.left + (innerWidth * index) / Math.max(1, count - 1);
  const y = (value: number) => padding.top + innerHeight - (innerHeight * value) / max;

  const ticks = useMemo(
    () => [0, 0.5, 1].map((fraction) => Math.round(max * fraction)),
    [max],
  );
  const labelEvery = Math.max(1, Math.ceil(count / (width < 460 ? 3 : width < 720 ? 4 : 6)));

  return (
    <div ref={ref} className="min-w-0">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        className="max-w-full"
        role="img"
        aria-label={series.map((line) => line.name).join(" and ")}
      >
        {ticks.map((tick) => (
          <g key={tick}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={y(tick)}
              y2={y(tick)}
              stroke="var(--color-ink-100)"
              strokeWidth="1"
            />
            <text x={2} y={y(tick) + 3} fontSize={10} fill="var(--color-ink-400)">
              {tick}
            </text>
          </g>
        ))}

        {series.map((line, lineIndex) => {
          const path = line.points
            .map((point, index) => `${index === 0 ? "M" : "L"}${x(index).toFixed(1)},${y(point.value).toFixed(1)}`)
            .join(" ");
          const area = `${path} L${x(line.points.length - 1).toFixed(1)},${padding.top + innerHeight} L${x(0).toFixed(1)},${padding.top + innerHeight} Z`;
          return (
            <g key={line.name}>
              <path d={area} fill={line.colour} opacity="0.07" />
              <path
                d={path}
                fill="none"
                stroke={line.colour}
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  strokeDasharray: 4000,
                  strokeDashoffset: drawn ? 0 : 4000,
                  transition: `stroke-dashoffset 1.4s ease ${lineIndex * 0.18}s`,
                }}
              />
              {line.points.map((point, index) =>
                point.value > 0 ? (
                  <circle key={index} cx={x(index)} cy={y(point.value)} r="2" fill={line.colour} />
                ) : null,
              )}
            </g>
          );
        })}

        {series[0]?.points.map((point, index) =>
          index % labelEvery === 0 ? (
            <text
              key={point.label}
              x={x(index)}
              y={height - 7}
              fontSize={10}
              textAnchor={index === 0 ? "start" : index >= count - 1 ? "end" : "middle"}
              fill="var(--color-ink-400)"
            >
              {point.label}
            </text>
          ) : null,
        )}
      </svg>
    </div>
  );
}

/** Horizontal ranked bars, growing in from the left. */
export function BarList({
  items,
  colour = "var(--color-brand-600)",
  limit = 8,
  suffix,
}: {
  items: Array<{ name: string; count: number }>;
  colour?: string;
  limit?: number;
  suffix?: string;
}) {
  const max = Math.max(1, ...items.map((item) => item.count));
  const rows = items.slice(0, limit);
  const grown = useGrown(100);

  return (
    <ul className="space-y-2.5">
      {rows.map((item, index) => (
        <li key={item.name}>
          <div className="flex items-baseline justify-between gap-2 text-[12px]">
            <span className="min-w-0 truncate font-medium text-ink-700">{item.name}</span>
            <span className="shrink-0 font-bold tabular-nums text-ink-900">
              {item.count}
              {suffix ? <span className="font-medium text-ink-400"> {suffix}</span> : null}
            </span>
          </div>
          <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-ink-50">
            <div
              className="h-full rounded-full"
              style={{
                width: `${(item.count / max) * grown}%`,
                background: colour,
                opacity: 1 - index * 0.045,
                transition: `width 900ms cubic-bezier(0.22,1,0.36,1) ${index * 55}ms`,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Donut with an animated sweep. */
export function Donut({
  items,
  size = 168,
  thickness = 18,
}: {
  items: Array<{ name: string; count: number; colour: string }>;
  size?: number;
  thickness?: number;
}) {
  const total = items.reduce((sum, item) => sum + item.count, 0);
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const grown = useGrown(100, 180);

  // Each arc's dash length and its offset from the 12 o'clock start.
  const segments = items.map((item, index) => {
    const slice = (count: number) => circumference * (total === 0 ? 0 : count / total) * (grown / 100);
    return {
      ...item,
      dash: slice(item.count),
      offset: items.slice(0, index).reduce((sum, previous) => sum + slice(previous.count), 0),
    };
  });

  return (
    <div className="flex items-center gap-5">
      <svg viewBox={`0 0 ${size} ${size}`} className="shrink-0" width={size} height={size} role="img" aria-label="Distribution">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-ink-50)"
          strokeWidth={thickness}
        />
        {segments.map((segment) => (
          <circle
            key={segment.name}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={segment.colour}
            strokeWidth={thickness}
            strokeLinecap="butt"
            strokeDasharray={`${segment.dash} ${circumference - segment.dash}`}
            strokeDashoffset={-segment.offset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: "stroke-dasharray 1s cubic-bezier(0.22,1,0.36,1)" }}
          />
        ))}
        <text
          x="50%"
          y="46%"
          textAnchor="middle"
          fontSize="22"
          fontWeight="800"
          fill="var(--color-ink-900)"
        >
          {total}
        </text>
        <text x="50%" y="58%" textAnchor="middle" fontSize="9" fill="var(--color-ink-400)">
          LISTINGS
        </text>
      </svg>
      <ul className="min-w-0 space-y-1.5">
        {items.map((item) => (
          <li key={item.name} className="flex items-center gap-2 text-[11.5px]">
            <span className="size-2 shrink-0 rounded-full" style={{ background: item.colour }} />
            <span className="min-w-0 truncate text-ink-600">{item.name}</span>
            <span className="ml-auto shrink-0 font-semibold tabular-nums text-ink-900">{item.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
