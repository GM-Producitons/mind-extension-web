/**
 * Get local date in YYYY-MM-DD format without UTC conversion
 */
export const getLocalDateString = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

/**
 * Calculate end time based on start time and duration in minutes
 */
export const calculateEndTime = (
  startTime: string,
  durationMinutes: number,
): string => {
  const [hours, minutes] = startTime.split(":").map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;

  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;

  return `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`;
};

/**
 * Calculate duration in minutes between two times
 */
export const calculateDuration = (
  startTime: string,
  endTime: string,
): number => {
  const [startHours, startMinutes] = startTime.split(":").map(Number);
  const [endHours, endMinutes] = endTime.split(":").map(Number);

  const startTotalMinutes = startHours * 60 + startMinutes;
  let endTotalMinutes = endHours * 60 + endMinutes;

  if (endTotalMinutes < startTotalMinutes) {
    endTotalMinutes += 24 * 60;
  }

  return endTotalMinutes - startTotalMinutes;
};

/**
 * Converts a local time string with UTC offset to UTC time string
 * @param timeStr - Time in HH:mm format (local time)
 * @param utcOffset - UTC offset (e.g., 2 or 3 for Egypt)
 * @returns Time in HH:mm format (UTC time)
 */
export function convertLocalToUtcTime(
  timeStr: string,
  utcOffset: number,
): string {
  const [hours, minutes] = timeStr.split(":").map(Number);

  // Calculate total minutes
  const totalMinutes = hours * 60 + minutes;

  // Subtract offset hours to get UTC time
  const utcMinutes = totalMinutes - utcOffset * 60;

  // Handle day wrapping
  let utcTotalMinutes = utcMinutes;
  if (utcTotalMinutes < 0) {
    utcTotalMinutes += 24 * 60; // Add a day
  } else if (utcTotalMinutes >= 24 * 60) {
    utcTotalMinutes -= 24 * 60; // Subtract a day
  }

  const utcHours = Math.floor(utcTotalMinutes / 60);
  const utcMins = utcTotalMinutes % 60;

  return `${String(utcHours).padStart(2, "0")}:${String(utcMins).padStart(2, "0")}`;
}
