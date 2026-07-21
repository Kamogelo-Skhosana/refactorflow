"use client";

import { useEffect, useState } from "react";
import MarketingLayout from "./marketing-layout";
import styles from "./legal-page.module.css";

export default function LegalPage({ eyebrow, title, intro, updated, sections }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const sectionNodes = sections.map((_, index) => document.getElementById("section-" + (index + 1))).filter(Boolean);
    if (!("IntersectionObserver" in window) || !sectionNodes.length) return undefined;

    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visible) setActive(Math.max(0, sectionNodes.indexOf(visible.target)));
    }, { rootMargin: "-18% 0px -65% 0px", threshold: 0.01 });

    sectionNodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [sections]);

  return <MarketingLayout>
    <article className={styles.page}>
      <header className={styles.hero}>
        <p>{eyebrow}</p>
        <h1>{title}</h1>
        <span>Last updated: {updated}</span>
        <p className={styles.intro}>{intro}</p>
      </header>

      <div className={styles.layout}>
        <div className={styles.body}>
          {sections.map((section, index) => <section id={"section-" + (index + 1)} key={section.title}>
            <h2>{section.title}</h2>
            {section.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}
            {section.items && <ul>{section.items.map((item) => <li key={item}>{item}</li>)}</ul>}
            {section.table && <div className={styles.tableWrap}><table><thead><tr>{section.table.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead><tbody>{section.table.rows.map((row, rowIndex) => <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex}>{cell}</td>)}</tr>)}</tbody></table></div>}
          </section>)}
        </div>
        <aside className={styles.contents}>
          <p>On this page</p>
          {sections.map((section, index) => <a className={active === index ? styles.active : ""} href={"#section-" + (index + 1)} key={section.title}>{section.title}</a>)}
        </aside>
      </div>
    </article>
  </MarketingLayout>;
}
