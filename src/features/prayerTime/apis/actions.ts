"use server";
export async function getPrayerTimes(
  latitude: number,
  longitude: number,
  method: number,
  school: number,
) {
  try {
    const response = await fetch(
      `https://islamicapi.com/api/v1/prayer-time/?lat=${latitude}&lon=${longitude}&method=${method}&school=${school}&api_key=${process.env.IslamicAPI}`,
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
      console.log("Failed to fetch prayer times:", response.statusText);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching prayer times:", error);
  }
}
