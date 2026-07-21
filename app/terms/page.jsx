import LegalPage from "../components/legal-page";

export const metadata = { title: "Terms | RefactorFlow" };

export default function TermsPage() {
  return <LegalPage
    eyebrow="The simple version"
    title="Terms of service."
    updated="July 21, 2026"
    intro="These terms explain the ground rules for using RefactorFlow. Please read them before creating an account or starting a paid plan."
    sections={[
      { title: "Using RefactorFlow", paragraphs: ["RefactorFlow gives you coding exercises, behavioral feedback, and progress tools for your personal practice. You may use the service only in a lawful way and in line with these terms. You are responsible for keeping your account credentials confidential." ] },
      { title: "Your account", paragraphs: ["You must provide accurate account information and be old enough to enter into a binding agreement in your location. You may not share your account, attempt to access another person's account, or interfere with the service or its security." ] },
      { title: "Your code and content", paragraphs: ["You retain ownership of code and other content you submit. You give us the limited permission needed to host, process, analyse, and display that content to operate RefactorFlow and provide reports to you. Do not submit content that you do not have the right to use." ] },
      { title: "Practice results", paragraphs: ["RefactorFlow reports are educational feedback based on activity within the platform. They are not professional, academic, recruitment, or employment assessments. We do not guarantee a particular outcome from using the service." ] },
      { title: "Paid plans", paragraphs: ["Some features are available through paid plans. Payment processing is handled by Paystack. Prices, taxes, renewal terms, and cancellation options are presented before purchase. You can manage your plan through Settings, and access to paid features continues until the end of the period you have paid for unless stated otherwise." ] },
      { title: "Acceptable use", paragraphs: ["You must not use RefactorFlow to distribute harmful code, probe the platform, overload its infrastructure, reverse engineer protected components, or submit content that is unlawful, infringing, or abusive." ] },
      { title: "Availability and changes", paragraphs: ["We aim to keep RefactorFlow reliable, but the service may change, be interrupted, or be unavailable from time to time. We may modify or discontinue features when necessary. Where practical, we will give reasonable notice of material changes." ] },
      { title: "Contact", paragraphs: ["If you have questions about these terms, contact hello@refactorflow.dev. These terms are governed by the laws applicable to RefactorFlow's operations, subject to the consumer protections that apply where you live." ] },
    ]}
  />;
}
