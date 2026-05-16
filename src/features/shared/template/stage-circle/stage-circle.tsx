'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface StageSegment {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  completed: boolean;
}

export interface StageCircleProps {
  segments: StageSegment[];
  size?: number;
  className?: string;
  activeSegmentIndex?: number;
  completedColor?: string;
}

export function StageCircle({
  segments,
  size = 200,
  className,
  activeSegmentIndex,
  completedColor,
}: StageCircleProps) {
  const total = segments.length;
  if (total === 0) return null;

  const pad = 26;
  const cx = size / 2;
  const cy = size / 2;

  // ✅ RESTORED ORIGINAL PROPORTIONS
  const outerR = size / 2 - 4;
  const innerR = outerR * 0.55;
  const iconR = (outerR + innerR) / 2;

  const gapDeg = 4;
  const arcDeg = (360 - total * gapDeg) / total;

  function polarToCartesian(r: number, angleDeg: number) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad),
    };
  }

  function describeArc(r: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(r, startAngle);
    const end = polarToCartesian(r, endAngle);
    const largeArc = endAngle - startAngle > 180 ? 1 : 0;
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  }

  const completedCount = segments.filter((s) => s.completed).length;
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg
        width={size}
        height={size}
        viewBox={`${-pad} ${-pad} ${size + pad * 2} ${size + pad * 2}`}
        className="overflow-visible"
      >
        {segments.map((seg, i) => {
          const startAngle = i * (arcDeg + gapDeg);
          const endAngle = startAngle + arcDeg;
          const midAngle = startAngle + arcDeg / 2;

          const outerStart = polarToCartesian(outerR, startAngle);
          const outerEnd = polarToCartesian(outerR, endAngle);
          const innerStart = polarToCartesian(innerR, startAngle);
          const innerEnd = polarToCartesian(innerR, endAngle);
          const largeArc = arcDeg > 180 ? 1 : 0;

          const pathD = [
            `M ${outerStart.x} ${outerStart.y}`,
            `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
            `L ${innerEnd.x} ${innerEnd.y}`,
            `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
            'Z',
          ].join(' ');

          const iconPos = polarToCartesian(iconR, midAngle);
          const Icon = seg.icon;

          const isActive = activeSegmentIndex === i;
          const isHovered = hoveredIndex === i;

          // ✅ ACTIVE COLOR (matches badge tone)
          const activeColor = '#003c71';

          const segmentFill = isActive
            ? activeColor
            : completedColor && seg.completed
              ? completedColor
              : undefined;

          const hoverOffset = 7;
          const dx = Math.cos(((midAngle - 90) * Math.PI) / 180) * hoverOffset;
          const dy = Math.sin(((midAngle - 90) * Math.PI) / 180) * hoverOffset;

          const badgeR = outerR + 14;
          const badgeStart = startAngle + 2;
          const badgeEnd = endAngle - 2;
          const badgePathId = `badge-path-${i}`;

          return (
            <g key={seg.label}>
              {/* SEGMENT */}
              <motion.g
                style={{
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                  cursor: 'pointer',
                }}
                animate={{
                  x: isHovered ? dx : 0,
                  y: isHovered ? dy : 0,
                  scale: isHovered ? 1.06 : 1,
                }}
                transition={{
                  type: 'spring',
                  stiffness: 260,
                  damping: 18,
                }}
                onHoverStart={() => setHoveredIndex(i)}
                onHoverEnd={() => setHoveredIndex(null)}
              >
                <path
                  d={pathD}
                  fill={segmentFill ?? undefined}
                  className={cn(
                    'transition-all duration-300',
                    !segmentFill && (seg.completed ? 'fill-primary' : 'fill-muted'),
                    isActive && 'drop-shadow-md',
                  )}
                />

                <foreignObject x={iconPos.x - 10} y={iconPos.y - 10} width={20} height={20}>
                  <div className="flex h-full w-full items-center justify-center">
                    <Icon
                      className={cn(
                        'h-3.5 w-3.5',
                        isActive
                          ? 'text-white'
                          : seg.completed
                            ? 'text-primary-foreground'
                            : 'text-muted-foreground',
                      )}
                    />
                  </div>
                </foreignObject>
              </motion.g>

              {/* BADGE */}
              {/* {isActive && (
                <g pointerEvents="none">
                  <path
                    d={describeArc(badgeR, badgeStart, badgeEnd)}
                    fill="none"
                    stroke="rgba(245, 158, 11, 0.2)"
                    strokeWidth={16}
                    strokeLinecap="round"
                  />

                  <path
                    id={badgePathId}
                    d={describeArc(badgeR, badgeStart, badgeEnd)}
                    fill="none"
                  />

                  <text
                    fill="rgb(245, 158, 11)"
                    fontSize="10"
                    fontWeight="700"
                    letterSpacing="0.08em"
                  >
                    <textPath href={`#${badgePathId}`} startOffset="50%" textAnchor="middle">
                      CURRENT
                    </textPath>
                  </text>
                </g>
              )} */}
            </g>
          );
        })}
      </svg>

      {/* CENTER */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-foreground tabular-nums">
          {completedCount}/{total}
        </span>
        <span className="text-[10px] text-muted-foreground">Completed</span>
      </div>
    </div>
  );
}
