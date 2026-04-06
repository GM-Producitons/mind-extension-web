"use client";

import ProposedBlock from "./proposedBlock";
import Block from "./block";

export default function TimelineWrapperPrototype() {
  const events = 40;
  const useProposedLayout = false;

  const renderYourTimeline = () => (
    <div className="relative w-full overflow-x-auto pb-10">
      <div className="absolute flex w-full gap-0">
        {Array.from({ length: events }).map((_, index) => (
          <Block key={index} />
        ))}
      </div>
      <div className={`border h-4 w-${4 * 16}`} />
      <div className="h-9.25 w-full" />
      <div className="flex w-full">
        {/* <span className="h-px w-full border-2" /> */}
      </div>
    </div>
  );

  const renderMyTimeline = () => (
    <div className="w-full overflow-x-auto pb-10">
      <div className="w-max min-w-full">
        <div className="relative w-max min-w-full">
          <div className="flex items-end justify-between gap-10">
            {Array.from({ length: events }).map((_, index) => (
              <ProposedBlock key={index} />
            ))}
          </div>
          <div className="mt-0 h-px w-full bg-border" />
        </div>
      </div>
    </div>
  );

  return useProposedLayout ? renderMyTimeline() : renderYourTimeline();
}
