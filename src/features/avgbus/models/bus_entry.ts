export interface BusEntry {
  type: "go" | "return";
  period: 1 | 2 | 3 | 4;
  time: string;
  duringFinals: boolean;
  pickedUp: "pickup" | "dropoff";
  duringRamadan: boolean;
}
