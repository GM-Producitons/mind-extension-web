"use client";

import ProposedBlock from "./proposedBlock";
import Block from "./block";

const blockWidth = 16 * 4;
const blockHeight = 10 * 4;
const eventSize = 7;

export default function TimelineWrapperPrototype() {
  const events = 40;
  const eventLength = blockWidth * eventSize; // px
  return (
    <div className="relative w-full overflow-x-auto pb-10">
      <div className="absolute flex w-full gap-0">
        {Array.from({ length: events }).map((_, index) => (
          <Block
            blockWidth={blockWidth}
            blockHeight={blockHeight}
            key={index}
          />
        ))}
      </div>

      <div className="border h-4" style={{ width: `${eventLength}px` }} />
    </div>
  );
}
