import { RefObject } from "react";

const DAY_MS = 24 * 60 * 60 * 1000;

interface AutoScrollConfig {
  rangeStart: Date;
  dayCount: number;
  dayWidthPx: number;
}

export const provider = (
  scrollContainerRef: RefObject<HTMLDivElement | null>,
  config: AutoScrollConfig,
) => {
  const container = scrollContainerRef.current;
  if (!container || config.dayCount === 0) return;

  const startMidnight = new Date(
    config.rangeStart.getFullYear(),
    config.rangeStart.getMonth(),
    config.rangeStart.getDate(),
  );
  const today = new Date();
  const todayMidnight = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const rawIndex = Math.floor(
    (todayMidnight.getTime() - startMidnight.getTime()) / DAY_MS,
  );
  const clampedIndex = Math.min(Math.max(rawIndex, 0), config.dayCount - 1);

  const centeredTarget =
    clampedIndex * config.dayWidthPx -
    container.clientWidth / 2 +
    config.dayWidthPx / 2;
  const maxScrollLeft = Math.max(
    container.scrollWidth - container.clientWidth,
    0,
  );
  const target = Math.min(Math.max(centeredTarget, 0), maxScrollLeft);

  // Spring-like motion: accelerate toward target and damp velocity over time.
  let position = container.scrollLeft;
  let velocity = 0;
  let animationFrame = 0;
  const stiffness = 0.12;
  const damping = 0.8;

  const animate = () => {
    const distance = target - position;
    velocity += distance * stiffness;
    velocity *= damping;
    position += velocity;
    container.scrollLeft = position;

    if (Math.abs(distance) < 0.5 && Math.abs(velocity) < 0.5) {
      container.scrollLeft = target;
      return;
    }

    animationFrame = window.requestAnimationFrame(animate);
  };

  animationFrame = window.requestAnimationFrame(animate);

  return () => {
    window.cancelAnimationFrame(animationFrame);
  };
};
