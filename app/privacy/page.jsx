import LegalPage from "../components/legal-page";

export const metadata = { title: "Privacy | RefactorFlow" };

export default function PrivacyPage() {
  return <LegalPage
    eyebrow="How RefactorFlow handles your data"
    title="Privacy policy."
    updated="July 21, 2026"
    intro="RefactorFlow is designed to help you understand your coding process. That only works when behavioral data is handled with care, restraint, and a clear explanation of your choices."
    sections={[
      { title: "Introduction", paragraphs: ["This policy explains how RefactorFlow collects, uses, stores, and protects personal information when you use our website and product. RefactorFlow is the data controller for the information described here.", "For privacy questions or requests, contact hello@refactorflow.dev."] },
      { title: "Data we collect", paragraphs: ["We collect the information needed to run your account and generate the practice feedback you request."], items: ["Account data, including your email address, display name, and optional avatar.", "Behavioral session data, including keystroke tape, pause events, backspace count, submitted code, test outcome, and Thrashing Index.", "Usage data such as pages visited, session timestamps, and basic browser or device information needed for reliability and security.", "Payment-related information supplied to Paystack if you choose a paid plan. RefactorFlow does not store card numbers.", "Email delivery information needed to send account and report notifications when you enable them."] },
      { title: "How we use your data", paragraphs: ["We use personal information to operate RefactorFlow, authenticate your account, generate behavioral reports, protect the service, improve the product, process subscriptions through Paystack, and send opted-in account or session emails.", "We never sell your personal information to third parties."] },
      { title: "Behavioral data - special notice", paragraphs: ["Your keystroke tape, raw event data, pauses, and related metrics are private to you by default. They are collected only while you actively work in a RefactorFlow coding session.", "We do not share individual behavioral data with employers, managers, instructors, or other users. Any future organisation-level product will use aggregate information only, unless you explicitly choose to share an individual report."] },
      { title: "Third-party services", paragraphs: ["We rely on carefully selected providers to run RefactorFlow. Each provider processes data only as needed to provide its service."], items: ["Supabase for authentication and database storage.", "Vercel for application hosting and delivery.", "Paystack for subscription payment processing.", "Resend for transactional email when notifications are enabled.", "Carbon Ads for clearly labelled, non-intrusive ads shown only to Free-tier users outside the editor.", "OpenAI only if optional AI coaching is enabled in a future release."] },
      { title: "Data retention", paragraphs: ["Account, session, and metric data are retained while your account remains active so that your reports and history remain available. You can request deletion or delete your account from Settings. We permanently delete or anonymise applicable personal data within 30 days of a confirmed deletion request, except where a longer retention period is legally required."] },
      { title: "Your rights", paragraphs: ["Depending on where you live, you may have rights to access, correct, delete, export, or object to particular uses of your personal information. RefactorFlow supports these choices through Settings and by request."], items: ["Access and portability: download your data from Settings.", "Correction: update your profile details in Settings.", "Deletion: delete your account from the Settings danger zone.", "Email preference: opt out of non-essential email in Settings.", "EU users may also complain to their local supervisory authority."] },
      { title: "Cookies and local storage", paragraphs: ["We use essential authentication storage and preference storage to keep you signed in and remember your theme. We do not use third-party analytics or advertising tracking cookies without the notice and consent required by law. Read our Cookie Policy for more detail."] },
      { title: "Children", paragraphs: ["RefactorFlow is not intended for anyone under 16 years of age. We do not knowingly collect personal information from children under 16."] },
      { title: "Changes to this policy", paragraphs: ["We may update this policy as the product changes. If a revision is material, we will update the date above and provide notice through the product or by email where appropriate."] },
      { title: "Contact", paragraphs: ["For privacy questions, data requests, or GDPR-related enquiries, contact hello@refactorflow.dev. We aim to respond to verified requests within 30 days."] },
    ]}
  />;
}
