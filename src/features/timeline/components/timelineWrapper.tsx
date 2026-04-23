"use client";

import Block from "./block";

export default function TimelineWrapper() {
  const events = 40;
  return (
    <div className="relative w-full overflow-x-auto pb-10">
      {/* ruler ticks */}
      <div className="flex gap-10 w-full absolute">
        {Array.from({ length: events }).map((_, index) => (
          // <Block key={index} />
          <span>m</span>
        ))}
      </div>
      {/* Gap */}
      <div className="h-9.25 w-full" />
      {/* Horizontal line */}
      <div className="w-full flex">
        <span className="border-2 w-full h-px " />
      </div>
    </div>
  );
}
