import { css } from "styled-components";

export const darkStyles = css`
  .site-header {
    background: #0b1423f0;
  }
  .main-nav a:before {
    background: #1b3047;
  }
  .status-dot {
    background: #9bc4ad;
    box-shadow: 0 0 0 4px #182e2a;
  }
  .skip-link {
    background: var(--surface-raised);
  }
  button:focus-visible,
  a:focus-visible,
  summary:focus-visible {
    outline-color: var(--accent);
  }
  .menu-toggle {
    color: var(--ink);
  }
  .section-heading {
    border-bottom-color: #4a6583;
  }
  .post-card,
  .collection-card,
  .project-card {
    background: var(--surface);
    box-shadow: 3px 4px 0 #02091440;
  }
  .post-card:hover,
  .collection-card:hover,
  .project-card:hover {
    border-color: #52799e;
    box-shadow: 4px 8px 0 #02091450;
  }
  .post-card:has(.post-title-button:focus-visible) {
    outline-color: var(--accent);
  }
  .filters button.selected {
    background: #203b55;
    color: #ade0ff;
  }
  .filters button:hover {
    background: #1a3048;
  }
  .post-footer,
  .collection-details,
  .project-actions {
    border-top-color: var(--border);
  }
  .category-label.life,
  .collection-status.is-figure {
    color: var(--green);
  }
  .card-arrow {
    color: #a9c3dd;
  }
  .code-art {
    background-color: #15273c;
    background-image:
      linear-gradient(#7ca9cb0b 1px, transparent 1px),
      linear-gradient(90deg, #7ca9cb0b 1px, transparent 1px);
  }
  .code-window {
    background: #142337;
    border-color: #3a526b;
    box-shadow: 10px 11px 0 #030a1533;
  }
  .window-bar {
    background: #1b2e43;
    border-bottom-color: #344a61;
  }
  .window-code {
    color: #b5c9df;
  }
  .syntax-purple {
    color: #ceb3ea;
  }
  .syntax-blue {
    color: #9acef1;
  }
  .syntax-green {
    color: #a5cebc;
  }
  .code-orbit {
    border-color: #45627a;
    opacity: 0.5;
  }
  .about-card {
    background: #132338;
    border-color: var(--border);
  }
  .about-avatar img {
    border-color: #344b65;
  }
  .avatar-status {
    border-color: #132338;
  }
  .about-side {
    border-left-color: var(--border);
  }
  .about-decoration {
    color: #1e354e;
  }
  .back-to-top {
    background: #192a40;
    border-color: #3d5876;
    box-shadow: 3px 3px 0 #02091455;
  }
  .reading-dialog {
    background: #121e30;
    border-color: #3a4e68;
    box-shadow: 0 25px 100px #0008;
  }
  .reading-dialog::backdrop {
    background: #020815c4;
  }
  .reading-toolbar {
    background: #15243a;
  }
  .reading-toolbar button {
    color: #b8cee5;
  }
  .reading-toolbar button:hover {
    background: #233b56;
  }
  .reading-intro {
    background: #1a3047;
    border-left-color: #8ed1ff;
  }
  .reading-body p {
    color: #bac9dc;
  }
  .reading-body pre {
    background: #0e192a;
    border-color: var(--border);
    color: #b8d8ed;
  }
  .collection-art-label {
    background: #111e30ed;
    color: #b8cadd;
  }
  .project-icon {
    background: #1b334b;
    border-color: #365570;
  }
  .project-ideas .project-icon {
    color: var(--lavender);
    background: #30253d;
    border-color: #51405e;
  }
  .project-tasks .project-icon {
    color: var(--green);
    background: #24362f;
    border-color: #405c4e;
  }
  .status-ideas {
    color: var(--lavender);
  }
  .status-tasks {
    color: var(--green);
  }
  .project-stack > span {
    background: #192b42;
    border-color: #344b65;
  }
  .article-search,
  .article-tag-select {
    background: #121e30;
  }
  .article-tag-select option {
    background: #121e30;
    color: var(--ink);
  }
  .article-search input::placeholder {
    color: #9eafc6;
  }
  .article-result-row > button:hover {
    color: #c3e7ff;
  }
  .clear-search:hover {
    background: #203b55;
  }
  .article-empty,
  .collection-empty {
    background: #101d2e;
    border-color: #466381;
  }
  .empty-search-icon {
    background: #213c55;
  }
  .article-empty > button,
  .collection-empty > button {
    background: #213e59;
    color: #b2dfff;
  }
  .article-empty > button:hover,
  .collection-empty > button:hover {
    background: #2b4c68;
  }

  .blog-intro {
    padding-block: 48px 4px;
  }
  .blog-intro h1 {
    margin: 12px 0 0;
    font-size: clamp(25px, 3.5vw, 42px);
    line-height: 1.5;
  }
  .entry-hero.hero {
    min-height: 100svh;
    background: #071324;
    border-bottom: 0;
    isolation: isolate;
    display: flex;
    flex-direction: column;
    color: #eef5ff;
  }
  .entry-sky,
  .entry-shade {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: -3;
  }
  .entry-sky {
    object-fit: cover;
    object-position: center 66%;
    opacity: 0.76;
  }
  .entry-shade {
    z-index: -2;
    background:
      radial-gradient(
        ellipse at 50% 42%,
        #081429a8 0%,
        #07132676 45%,
        #07132473 70%
      ),
      linear-gradient(180deg, #07132428 0%, #07132433 55%, #0b1220 100%);
  }
  .entry-inner {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding-block: 64px 80px;
    position: relative;
  }
  .entry-profile {
    width: min(610px, 100%);
    text-align: center;
  }
  .entry-avatar.avatar-frame {
    position: relative;
    inset: auto;
    width: 96px;
    height: 96px;
    transform: none;
    border: 3px solid #bbd8f0ad;
    border-radius: 50%;
    margin: 0 auto;
    overflow: hidden;
    box-shadow:
      0 0 0 7px #abcce912,
      0 9px 30px #02071344;
  }
  .entry-avatar.avatar-frame img {
    object-position: center 40%;
  }
  .entry-hero.hero h1 {
    font-size: clamp(60px, 6.4vw, 88px);
    font-weight: 700;
    line-height: 1.17;
    letter-spacing: -3px;
    margin: 19px 0 8px;
    color: #f3f8ff;
    text-shadow: 0 3px 20px #03091944;
  }
  .entry-hero.hero h1 > span {
    color: #a9d9ff;
  }
  .daily-quote {
    margin: 27px auto 21px;
    max-width: 560px;
    min-height: 125px;
    padding: 20px 24px 8px;
    border-top: 1px solid #b2cbe42b;
  }
  .daily-quote-label {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 10px;
    letter-spacing: 1px;
    color: #c7d7ec;
  }
  .daily-quote-label > svg {
    color: #c1dfff;
  }
  .quote-label-line {
    height: 10px;
    width: 1px;
    background: #9cb2cd73;
    margin: 0 5px;
  }
  .daily-quote-label time {
    font-size: 10px;
    letter-spacing: 1px;
  }
  .daily-quote blockquote {
    margin: 14px 0 0;
  }
  .daily-quote blockquote p {
    margin: 0;
    font-size: 17px;
    line-height: 1.95;
    letter-spacing: 0.6px;
    color: #f0f5fd;
    overflow-wrap: anywhere;
    text-wrap: pretty;
  }
  .daily-quote figcaption {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 7px;
    min-height: 44px;
    font-size: 11px;
    line-height: 1.8;
    color: #c3d1e5;
  }
  .daily-quote figcaption a {
    display: flex;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    padding: 6px;
    overflow-wrap: anywhere;
  }
  .daily-quote figcaption a:hover {
    color: #fff;
  }
  .daily-quote figcaption button {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    min-height: 44px;
    padding: 8px;
    background: transparent;
    color: #c5e4ff;
    font-size: 11px;
  }
  .entry-socials {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
  }
  .entry-socials > a {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    gap: 9px;
    border: 1px solid #a3bdd63d;
    border-radius: 5px;
    padding: 10px 14px;
    background: #08182d52;
    color: #dce9f8;
    font-size: 12px;
    transition:
      background 0.2s,
      border-color 0.2s,
      transform 0.2s;
  }
  .entry-socials > a:hover {
    background: #21405a99;
    border-color: #b7d8f2a1;
    transform: translateY(-2px);
  }
  .social-outward {
    color: #bacde3;
    margin-left: 5px;
  }
  .social-brand-icon {
    flex-shrink: 0;
    object-fit: contain;
  }
  .entry-actions {
    margin-top: 25px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 25px;
  }
  .entry-art-credit {
    position: absolute;
    right: max(24px, env(safe-area-inset-right));
    bottom: max(8px, env(safe-area-inset-bottom));
    display: flex;
    align-items: center;
    min-height: 44px;
    font-size: 9px;
    color: #c0cfe3;
  }
  .site-uptime {
    grid-column: 2;
    margin: 22px 0 0;
    color: #c3d1e5;
    font-size: 11px;
    line-height: 1.8;
    font-variant-numeric: tabular-nums;
  }
  .uptime-dot {
    display: inline-block;
    width: 5px;
    height: 5px;
    margin-right: 8px;
    border-radius: 50%;
    background: #b1dcc9;
    vertical-align: middle;
  }
  .entry-art-credit:hover {
    color: #fff;
  }
  @media (max-width: 640px) {
    .main-nav {
      background: #0d192b;
      box-shadow: 0 9px 16px #0004;
    }
    .entry-inner {
      padding-block: 40px 64px;
    }
    .entry-avatar.avatar-frame {
      width: 86px;
      height: 86px;
    }
    .entry-hero.hero h1 {
      font-size: 65px;
      letter-spacing: -2px;
      margin: 18px 0 7px;
    }
    .daily-quote {
      margin: 22px auto 17px;
      padding: 17px 8px 0;
      min-height: 125px;
    }
    .daily-quote blockquote p {
      font-size: 15px;
      letter-spacing: 0.3px;
    }
    .daily-quote figcaption {
      font-size: 10px;
      flex-wrap: wrap;
      gap: 0;
    }
    .daily-quote-label,
    .daily-quote-label time {
      font-size: 9px;
    }
    .entry-socials {
      gap: 8px;
    }
    .entry-socials > a {
      font-size: 11px;
      gap: 7px;
      padding: 10px 12px;
    }
    .social-outward {
      display: none;
    }
    .entry-actions {
      margin-top: 23px;
      gap: 21px;
    }
    .entry-art-credit {
      font-size: 8px;
    }
    .entry-sky {
      object-position: center 71%;
    }
    .entry-shade {
      background: linear-gradient(
        180deg,
        #06132869 0%,
        #07142699 35%,
        #071426a3 73%,
        #0b1220 100%
      );
    }
  }
  @media (max-height: 700px) {
    .entry-inner {
      padding-block: 28px 56px;
    }
    .entry-avatar.avatar-frame {
      width: 64px;
      height: 64px;
    }
    .entry-hero.hero h1 {
      font-size: 48px;
      margin-block: 12px 0;
    }
    .daily-quote {
      margin-block: 16px 12px;
      padding-block: 14px 0;
      min-height: 110px;
    }
    .daily-quote blockquote p {
      font-size: 14px;
      line-height: 1.75;
    }
    .entry-actions {
      margin-top: 16px;
    }
  }
  @media (max-height: 480px) and (min-width: 640px) {
    .entry-profile {
      width: min(760px, 100%);
      display: grid;
      grid-template-columns: 160px minmax(0, 1fr);
      column-gap: 32px;
    }
    .entry-identity {
      grid-column: 1;
      grid-row: 1 / 4;
      align-self: center;
    }
    .daily-quote {
      grid-column: 2;
      margin: 0 0 12px;
      padding: 0;
      border: 0;
    }
    .entry-socials,
    .entry-actions {
      grid-column: 2;
    }
  }
`;
