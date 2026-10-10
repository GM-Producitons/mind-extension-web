export const DUMMY_TESTOSTERONE = { kept: 7, committed: 10 };

export const DUMMY_MISSIONS = [
  { id: "m-control", title: "Applied Control", priority: 1, progress: 42, tasks: [] },
  { id: "m-canada", title: "Canada", priority: 2, progress: 18, tasks: [] },
  { id: "m-os", title: "OS notes", priority: 3, progress: 70, tasks: [] },
];

export const DUMMY_POSTS = [
  { week: "W36", count: 1 },
  { week: "W37", count: 4 },
  { week: "W38", count: 2 },
  { week: "W39", count: 6 },
  { week: "W40", count: 3 },
  { week: "W41", count: 5 },
];

export const DUMMY_MONEY_SANKEY = {
  nodes: [
    { name: "Job" },
    { name: "Allowance" },
    { name: "Food" },
    { name: "Benzene" },
  ],
  links: [
    { source: 0, target: 2, value: 3200 },
    { source: 0, target: 3, value: 400 },
    { source: 1, target: 2, value: 800 },
    { source: 1, target: 3, value: 150 },
  ],
};
