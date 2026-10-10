export const DUMMY_TESTOSTERONE = { kept: 0, committed: 0 };

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
