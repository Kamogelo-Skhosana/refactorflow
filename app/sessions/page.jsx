import SessionsClient from "./sessions-client";

export const metadata = {
  title: "Sessions | RefactorFlow",
  description: "Review your RefactorFlow practice history.",
};

export default function SessionsPage() {
  return <SessionsClient />;
}
