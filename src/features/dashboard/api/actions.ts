"use server";

export async function GET() {
  const res = await fetch("https://www.dragonball-api.com/api/characters/1");
  const data = await res.json();
  return Response.json(data);
}

const magna = 5;
export default magna;
