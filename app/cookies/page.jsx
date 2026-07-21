import LegalPage from "../components/legal-page";

export const metadata = { title: "Cookies | RefactorFlow" };

export default function CookiesPage() {
  return <LegalPage
    eyebrow="What RefactorFlow stores in your browser"
    title="Cookie policy."
    updated="July 21, 2026"
    intro="RefactorFlow uses essential browser storage to keep you signed in and remember the preferences that make the product comfortable to use. We do not use third-party analytics tracking cookies."
    sections={[
      { title: "What is a cookie?", paragraphs: ["A cookie is a small text file placed on your device by a website. Browser local storage is a similar technology that lets a website remember information between pages. RefactorFlow uses these technologies primarily to support your authenticated session and preferences."] },
      { title: "Essential authentication and preference storage", paragraphs: ["Essential authentication storage cannot be disabled without breaking sign-in and account protection. Theme preference storage can be cleared at any time through your browser settings."], table: { headers: ["Storage name", "Type", "Duration", "Purpose"], rows: [["refactorflow-access-token", "Essential local storage", "Session", "Stores the authenticated access token used to keep you signed in."], ["refactorflow-theme", "Preference local storage", "Until cleared", "Remembers your light or dark mode preference."], ["Supabase authentication storage", "Essential", "Session", "Supports Supabase authentication when it is configured by the platform."]] } },
      { title: "Third-party services", paragraphs: ["If you are a Free-tier user, Carbon Ads may use limited storage to deliver a developer-relevant advertisement. It is shown outside the code editor and is clearly labelled. Upgrading to Pro removes ads.", "Paystack may set strictly necessary cookies during checkout for fraud prevention and payment security. These are active only while you use the Paystack checkout flow."] },
      { title: "How to control storage", paragraphs: ["Most browsers let you clear cookies and local storage or block third-party cookies. Clearing RefactorFlow's essential storage will sign you out. Blocking essential storage can stop the service from working correctly."] },
      { title: "Consent", paragraphs: ["Essential authentication storage does not normally require consent. We do not activate non-essential analytics, social media, or advertising tracking cookies without the notice and consent required by law."] },
      { title: "Contact", paragraphs: ["For questions about cookies or browser storage, contact hello@refactorflow.dev. You can also read our Privacy Policy for more information about personal data."] },
    ]}
  />;
}
