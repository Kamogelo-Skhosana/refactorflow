import MarketingLayout from "./marketing-layout";
import styles from "./legal-page.module.css";

export default function LegalPage({ eyebrow, title, intro, updated, sections }) {
  return <MarketingLayout>
    <article className={styles.page}>
      <header className={styles.hero}>
        <p>{eyebrow}</p>
        <h1>{title}</h1>
        <div>
          <span>Last updated {updated}</span>
          <span>RefactorFlow</span>
        </div>
        <p className={styles.intro}>{intro}</p>
      </header>
      <div className={styles.layout}>
        <aside className={styles.contents}>
          <p>On this page</p>
          {sections.map((section, index) => <a href={"#section-" + (index + 1)} key={section.title}>{String(index + 1).padStart(2, "0")}. {section.title}</a>)}
        </aside>
        <div className={styles.body}>
          {sections.map((section, index) => <section id={"section-" + (index + 1)} key={section.title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h2>{section.title}</h2>
            {section.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}
            {section.items && <ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul>}
          </section>)}
        </div>
      </div>
    </article>
  </MarketingLayout>;
}
