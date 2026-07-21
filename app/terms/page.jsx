import LegalPage from "../components/legal-page";

export const metadata = { title: "Terms | RefactorFlow" };

export default function TermsPage() {
  return <LegalPage
    eyebrow="The rules for using RefactorFlow"
    title="Terms of service."
    updated="July 21, 2026"
    intro="These terms set out the ground rules for using RefactorFlow. By creating an account or using the service, you agree to them."
    sections={[
      { title: "Acceptance of terms", paragraphs: ["By creating an account or using RefactorFlow, you agree to these Terms of Service and our Privacy Policy. If you do not agree, do not use the service.", "You must be at least 16 years old to use RefactorFlow."] },
      { title: "Account creation", paragraphs: ["You are responsible for safeguarding your account credentials and for activity carried out through your account. Provide accurate information and keep it current.", "Accounts are for one person. Do not share an account or attempt to access an account or behavioral data that belongs to someone else."] },
      { title: "Acceptable use", paragraphs: ["Use RefactorFlow for lawful practice and learning. Do not interfere with the platform or use it to harm, harass, or deceive others."], items: ["Do not reverse engineer or attempt to bypass the behavioral tracking or safe code runner.", "Do not automate submissions or simulate keystrokes artificially.", "Do not attempt to access another person's account or behavioral data.", "Do not use Thrashing Index or other behavioral metrics to discriminate against anyone."] },
      { title: "Subscription and billing", paragraphs: ["The Free tier does not require payment. Pro is offered at $12 per month or $96 per year. Subscription payments are processed by Paystack, and the price and renewal details shown at checkout apply to your purchase.", "Subscriptions renew automatically unless you cancel before the next renewal. You may cancel at any time to stop future renewals. Except where required by law, payments for a partial billing period are not refunded. We will give at least 30 days notice before a material price change."] },
      { title: "Intellectual property", paragraphs: ["RefactorFlow, its brand, platform code, and exercise content are owned by RefactorFlow or its licensors. Your submitted code and your behavioral data remain yours.", "You grant RefactorFlow a limited licence to store, process, analyse, and display your submitted material only as needed to operate the service and provide your reports."] },
      { title: "Behavioral data and privacy", paragraphs: ["Your behavioral data is private by default. We process it to provide your reports and do not sell, share, or expose individual behavioral data. Read the Privacy Policy for the full details."] },
      { title: "Disclaimer of warranties", paragraphs: ["RefactorFlow is provided on an as-is and as-available basis. We do not promise that a Thrashing Index, coaching insight, or behavioral analysis is perfectly accurate or suitable for any particular purpose, and we do not guarantee uninterrupted access."] },
      { title: "Limitation of liability", paragraphs: ["To the maximum extent permitted by law, RefactorFlow is not liable for indirect, incidental, special, or consequential damages. Our total liability for a claim is limited to the amount you paid us in the 12 months before the event giving rise to the claim."] },
      { title: "Termination", paragraphs: ["You may delete your account at any time. We may suspend or terminate accounts that violate these terms or threaten the security or reliability of the service. On termination, personal data is handled as described in the Privacy Policy."] },
      { title: "Governing law", paragraphs: ["These terms are governed by the laws applicable to RefactorFlow's operations, subject to the mandatory consumer protections that apply where you live."] },
      { title: "Changes to terms", paragraphs: ["We may change these terms when the product, law, or our operations change. For material changes, we will provide notice at least 30 days in advance. Continued use after the effective date means you accept the updated terms."] },
      { title: "Contact", paragraphs: ["Questions about these terms can be sent to hello@refactorflow.dev."] },
    ]}
  />;
}
