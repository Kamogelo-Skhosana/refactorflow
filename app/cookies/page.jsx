import LegalPage from "../components/legal-page";

export const metadata = { title: "Cookies | RefactorFlow" };

export default function CookiesPage() {
  return <LegalPage
    eyebrow="Clear by design"
    title="Cookie policy."
    updated="July 21, 2026"
    intro="Cookies are small pieces of information that help RefactorFlow remember essential choices and keep your session working as expected."
    sections={[
      { title: "What cookies are", paragraphs: ["Cookies are small text files stored by your browser. Similar browser storage technologies can serve the same purpose. They help a site remember information between pages or visits." ] },
      { title: "Essential cookies", paragraphs: ["We use essential cookies and storage to support authentication, security, and the core operation of RefactorFlow. Without them, you may not be able to sign in, protect your account, or use coding sessions reliably." ] },
      { title: "Preference storage", paragraphs: ["We use local browser storage to remember preferences such as light or dark mode and to maintain the session state required to take you to the right place after signing in. This information stays in your browser unless it is needed to provide an account feature." ] },
      { title: "Analytics and advertising", paragraphs: ["We do not use cookies to sell your personal information. If we add optional analytics or advertising technology, we will describe it clearly and offer any consent options required by law before it is activated." ] },
      { title: "Your choices", paragraphs: ["Most browsers let you remove or block cookies in their settings. Blocking essential cookies may prevent RefactorFlow from working correctly. You can also sign out and clear browser storage from your browser controls." ] },
      { title: "Contact", paragraphs: ["For questions about cookies or related privacy choices, contact hello@refactorflow.dev. You can also read our Privacy Policy for more detail about how we handle personal information." ] },
    ]}
  />;
}
