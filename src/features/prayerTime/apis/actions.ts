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
    console.log(response);
    // if (!response.ok) {
    //   const body = await response.text();
    //   throw new Error(`Prayer API error ${response.status}: ${body}`);
    // }
    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching prayer times:", error);
    throw error instanceof Error ? error : new Error("Unknown error");
  }
}
