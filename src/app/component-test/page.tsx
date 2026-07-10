type task = {
  startUTC: string;
  endUTC: string;
  title: string;
  missionId?: string;
};

type wateredDownTask = {
  startBlock: number;
  num_of_blocks: number;
  title: string;
  missionId?: string;
};

const dummyTasks: task[] = [
  {
    startUTC: "10:30",
    endUTC: "11:00",
    title: "have breakfast",
  },
  {
    startUTC: "11:30",
    endUTC: "13:20",
    title: "have breakfast",
  },
  {
    startUTC: "14:00",
    endUTC: "17:50",
    title: "have breakfast",
  },
];

export default function DayTimeline() {
  const timeBlockHeight = 0.5 * 4;
  const timeBlockWidth = 60 * 4;

  function TasksEngine(tasks: task[], blockHeight: number, blockWidth: number) {
    function toMinutes(time: string): number {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    }

    const wateredDownTasks = tasks.map((task) => {
      const startMinutes = toMinutes(task.startUTC);
      const endMinutes = toMinutes(task.endUTC);
      return {
        startBlock: Math.floor(startMinutes / 5),
        num_of_blocks: Math.floor((endMinutes - startMinutes) / 5),
        title: task.title,
        missionId: task.missionId,
      };
    });

    return (
      <div className="flex relative bg-gray-300 p-5 gap-10">
        {wateredDownTasks.map((wdt, i) => (
          <span
            key={i}
            className="absolute left-0 right-0 bg-gray-600"
            style={{
              width: `${blockWidth}px`,
              height: `${wdt.num_of_blocks * blockHeight}px`,
              top: `${wdt.startBlock * blockHeight}px`,
            }}
          />
        ))}
      </div>
    );
  }
  // {TasksEngine(dummyTasks, timeBlockHeight, timeBlockWidth)}

  return (
    <main className="flex flex-col h-full w-full p-8 gap-4">
      {/* main --> the whole page */}
      {/* <section className="flex flex-1 justify-center items-center"> */}
      {/* section --> child of the whole page :) */}
      <header className="flex flex-col items-center justify-center min-h-32 bg-accent/20">
        {/* header --> will contain the ai chat */}
      </header>
      <section className="flex gap-8 justify-start w-full h-full">
        {/* Meat section */}
        <div className="flex flex-col flex-2/3 bg-accent/50 w-full p-4 gap-4">
          {/* left part containing day-stats, timeline & missions  */}
          <div className="flex flex-1/6 bg-accent/55">{/* day-stats */}</div>
          <div className="flex flex-5/6 bg-red-400/65 gap-">
            {/* timeline & missions */}
            <div className="flex flex-2/3 bg-accent/90"></div>
            <div className="flex flex-1/3 bg0accent/70"></div>
          </div>
        </div>
        <div className="flex flex-1/3 bg-accent/40 w-full"></div>
      </section>
      {/* </section> */}
    </main>
  );
}
