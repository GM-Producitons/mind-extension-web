"use server";
import axios from "axios";

export async function getPrayerTimes(
  latitude: number,
  longitude: number,
  method: number,
  school: number,
) {
  try {
    const response = await axios.get(
      `https://islamicapi.com/api/v1/prayer-time/?lat=${31.250168}&lon=${29.972676}&method=${5}&school=${1}&api_key=LxXspFjzfJuIdYOKIEmbSFI6Wk8SqtgCzAnmbjw0tOSqPwdt`,
    );
    console.log(response);
    // if (!response.ok) {
    //   const body = await response.text();
    //   throw new Error(`Prayer API error ${response.status}: ${body}`);
    // }
    const data = response.data;
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching prayer times:", error);
    throw error instanceof Error ? error : new Error("Unknown error");
  }
}
