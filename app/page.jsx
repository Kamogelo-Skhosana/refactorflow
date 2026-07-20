import LandingClient from "./landing-client";

export const metadata = {
  title: { absolute: "RefactorFlow | Developer behavior intelligence" },
  description: "Understand how you code, not just whether your solution passed.",
};

export default function HomePage() {
  return <LandingClient />;
}
