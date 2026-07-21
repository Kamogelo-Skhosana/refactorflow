import LegalPage from "../components/legal-page";

export const metadata = { title: "Privacy | RefactorFlow" };

export default function PrivacyPage() {
  return <LegalPage
    eyebrow="Your data, explained"
    title="Privacy policy."
    updated="July 21, 2026"
    intro="RefactorFlow is built to help you understand your coding process. That only works when your data is treated with care, restraint, and transparency."
    sections={[
      { title: "What we collect", paragraphs: ["We collect the information you provide when you create an account, such as your name and email address. When you use a coding exercise, we collect the code you submit, session duration, test outcome, and behavioral signals created during that session."], items: ["Keystrokes, edits, backspaces, and pauses recorded while a session is active", "Challenge attempts, test outcomes, and the reports generated from them", "Account preferences such as display name, theme, and coaching settings"] },
      { title: "Why we use it", paragraphs: ["We use this information to operate RefactorFlow, provide your session reports, personalise your dashboard, protect the service, and improve the product. Behavioral data is used to describe patterns in your own practice, not to make decisions about employment, education, or eligibility." ] },
      { title: "How sessions work", paragraphs: ["A session begins when you work in a RefactorFlow challenge. We save your submitted code and the signals needed to create the report you request. We do not secretly record activity outside the active RefactorFlow session or access files on your device." ] },
      { title: "Sharing and processors", paragraphs: ["We do not sell your personal information. We only share data with service providers that help us run RefactorFlow, including Supabase for authentication and data storage, Vercel for application hosting, and Paystack if you choose a paid plan. Those providers may process data only to provide their services to us." ] },
      { title: "Retention and your choices", paragraphs: ["You can edit your profile information in Settings, export your account data, or delete your account. We retain session data while your account remains active so that your reports and progress history remain available. When you delete your account, we delete or anonymise personal data as required by applicable law." ] },
      { title: "Security", paragraphs: ["We use reasonable technical and organisational safeguards to protect your information. No online service can promise absolute security, so please use a unique password and contact us promptly if you believe your account has been accessed without permission." ] },
      { title: "Changes and contact", paragraphs: ["We may update this policy as RefactorFlow evolves. If a change is material, we will update the date above and provide notice where appropriate. Questions about privacy can be sent to hello@refactorflow.dev." ] },
    ]}
  />;
}
