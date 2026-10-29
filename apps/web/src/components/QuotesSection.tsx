import { Quote } from "lucide-react";
import styled from "styled-components";
import { favoriteQuotes } from "../data/favorite-quotes";

const Section = styled.section`
  padding-block: 32px 64px;
  .quotes-intro {
    margin: 0 0 24px;
    color: var(--muted);
    line-height: 1.9;
    font-size: 13px;
  }
  .quotes-list {
    display: grid;
    gap: 18px;
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .quote-card {
    display: grid;
    grid-template-columns: 40px minmax(0, 1fr);
    gap: 24px;
    padding: 28px 32px;
    border: 1px solid var(--border);
    border-radius: 12px;
    background: var(--surface);
  }
  .quote-mark {
    color: #a9d9ff;
    display: grid;
    align-content: start;
    justify-items: center;
    gap: 12px;
    font-size: 11px;
    font-variant-numeric: tabular-nums;
  }
  blockquote {
    margin: 0;
    align-self: center;
    font-size: clamp(15px, 1.5vw, 18px);
    line-height: 2;
    letter-spacing: 0.4px;
    overflow-wrap: anywhere;
  }
  @media (max-width: 640px) {
    padding-block: 24px 40px;
    .quote-card {
      grid-template-columns: 24px minmax(0, 1fr);
      gap: 14px;
      padding: 20px 16px;
    }
  }
`;

export default function QuotesSection() {
  return (
    <Section
      id="quote-list"
      className="container"
      aria-labelledby="quotes-title"
    >
      <div className="section-heading">
        <div>
          <div className="eyebrow section-eyebrow">
            <span className="little-diamond" /> WORDS TO KEEP
          </div>
          <h2 id="quotes-title">
            把喜欢的话，留在这里<span className="brand-dot">。</span>
          </h2>
        </div>
        <span className="section-heading-note">
          {favoriteQuotes.length} 句收藏
        </span>
      </div>
      <p className="quotes-intro">有些话，读过之后，就一直记得。</p>
      <ol className="quotes-list" aria-label="喜欢的一句话">
        {favoriteQuotes.map((quote, index) => (
          <li className="quote-card" key={quote.id}>
            <span className="quote-mark" aria-hidden="true">
              <Quote size={24} strokeWidth={1.5} />
              {String(index + 1).padStart(2, "0")}
            </span>
            <blockquote>{quote.text}</blockquote>
          </li>
        ))}
      </ol>
    </Section>
  );
}
