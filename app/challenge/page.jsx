import ChallengesClient from "./challenges-client";

export const revalidate = 3600;

async function getChallenges() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return [];

  const response = await fetch(
    url + "/rest/v1/challenges?select=id,slug,title,language,difficulty,starter_code,created_at&order=created_at.asc,id.asc",
    {
      headers: { apikey: key },
      next: { revalidate: 3600 },
    },
  );

  return response.ok ? response.json() : [];
}

export const metadata = {
  title: "Challenges | RefactorFlow",
};

export default async function ChallengesPage() {
  const challenges = await getChallenges();
  return <ChallengesClient challenges={challenges} />;
}
