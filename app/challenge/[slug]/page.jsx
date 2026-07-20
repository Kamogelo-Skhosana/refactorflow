import Link from "next/link";
import ChallengeWorkspace from "./workspace";

export const dynamic = "force-dynamic";

async function getChallenge(slug) {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;

  const response = await fetch(
    url + "/rest/v1/challenges?slug=eq." + encodeURIComponent(slug) + "&select=id,slug,title,language,description,starter_code,difficulty&limit=1",
    { headers: { apikey: key, Authorization: "Bearer " + key }, cache: "no-store" },
  );

  if (!response.ok) return null;
  const rows = await response.json();
  return rows[0] || null;
}

export default async function ChallengeDetailPage({ params }) {
  const { slug } = await params;
  const challenge = await getChallenge(slug);

  if (!challenge) {
    return <main className="challenge-detail">
      <section className="empty-challenge shell">
        <p className="kicker">Challenge not found</p>
        <h1>That challenge is still being shaped.</h1>
        <Link className="secondary-button" href="/challenge">Back to challenges</Link>
      </section>
    </main>;
  }

  return <ChallengeWorkspace challenge={challenge} />;
}
