import { css } from "styled-components";

export const collectionStyles = css`
  .collection-section,
  .projects-section {
    padding-top: 30px;
    padding-bottom: 35px;
  }
  .collection-intro {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 20px;
    margin-top: -5px;
    margin-bottom: 23px;
  }
  .collection-intro p,
  .projects-intro {
    font-size: 13px;
    color: var(--muted);
    line-height: 1.9;
    margin: 0;
  }
  .collection-count {
    flex-shrink: 0;
    font-size: 10px;
    letter-spacing: 0.5px;
    color: var(--muted);
  }
  .collection-filters button {
    gap: 8px;
  }
  .anime-status-filters {
    width: fit-content;
    max-width: 100%;
    margin-bottom: 23px;
    flex-wrap: wrap;
  }
  .collection-empty {
    padding: 38px 24px;
    border: 1px dashed #b7d4e5;
    border-radius: 5px 5px 23px 5px;
    text-align: center;
    color: var(--muted);
    background: #f7fbfd;
  }
  .collection-empty > svg {
    color: var(--accent);
  }
  .collection-empty h3 {
    color: var(--ink);
    font-size: 20px;
    line-height: 1.6;
    margin: 14px 0 9px;
  }
  .collection-empty p {
    font-size: 13px;
    line-height: 1.9;
    margin: 0;
  }
  .collection-empty > button {
    min-height: 44px;
    margin-top: 18px;
    padding: 8px 18px;
    border-radius: 3px 3px 13px 3px;
    background: #e3f0fa;
    color: var(--accent);
    font-size: 12px;
  }
  .collection-grid,
  .projects-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 24px;
    list-style: none;
    padding: 0;
    margin: 0;
  }
  .collection-card,
  .project-card {
    min-width: 0;
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 5px 5px 23px 5px;
    box-shadow: 3px 4px 0 #dfeaf33b;
    transition:
      transform 0.25s var(--ease),
      border-color 0.25s;
  }
  .collection-card:hover,
  .project-card:hover {
    transform: translateY(-3px);
    border-color: #afd4e7;
  }
  .collection-artwork {
    position: relative;
    aspect-ratio: 12 / 7;
    overflow: hidden;
    border-radius: 4px 4px 0 0;
    background: #e7f1f5;
  }
  .collection-artwork > svg,
  .collection-artwork > img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;
  }
  .collection-art-label {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    gap: 8px;
    padding: 9px 14px;
    background: #f8fcffed;
    font-size: 9px;
    letter-spacing: 0.5px;
    color: var(--muted);
  }
  .collection-art-label > span {
    font-size: 7px;
    letter-spacing: 1.5px;
  }
  .collection-card-body {
    padding: 22px 24px 10px;
  }
  .collection-topline {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
  }
  .collection-status {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    color: var(--accent);
    font-size: 10px;
  }
  .collection-status.is-figure {
    color: var(--green);
  }
  .sample-label {
    color: var(--muted);
    font-size: 9px;
  }
  .collection-card h3 {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.5px;
    line-height: 1.6;
    margin: 15px 0 7px;
  }
  .collection-subtitle {
    font-size: 12px;
    color: var(--muted);
    line-height: 1.9;
    margin: 0;
  }
  .collection-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    color: var(--muted);
    font-size: 10px;
    margin-block: 20px 17px;
  }
  .collection-details {
    border-top: 1px solid #e7eef4;
  }
  .collection-details > summary,
  .project-details > summary {
    min-height: 44px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    font-size: 11px;
    color: var(--muted);
    list-style: none;
    border-radius: 2px;
  }
  .collection-details > summary::-webkit-details-marker,
  .project-details > summary::-webkit-details-marker {
    display: none;
  }
  .collection-details > summary:hover,
  .project-details > summary:hover {
    color: var(--accent);
  }
  .collection-details > summary:focus-visible,
  .project-details > summary:focus-visible {
    outline: 3px solid var(--accent);
    outline-offset: 3px;
  }
  .collection-details[open] > summary svg,
  .project-details[open] > summary svg {
    transform: rotate(-90deg);
  }
  .collection-details > p,
  .project-details > p {
    color: var(--muted);
    font-size: 13px;
    line-height: 1.95;
    margin: 0 0 15px;
    padding-top: 3px;
    overflow-wrap: anywhere;
  }
  .section-note {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    gap: 8px;
    color: var(--muted);
    font-size: 10px;
    line-height: 1.8;
    margin: 22px 0 0;
  }
  .section-note svg {
    margin-top: 3px;
  }
  .section-heading-note {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: var(--muted);
    padding-bottom: 4px;
  }
  .projects-intro {
    margin: -5px 0 23px;
  }
  .project-card {
    padding: 27px 25px 12px;
    display: flex;
    flex-direction: column;
    position: relative;
  }
  .project-card::before {
    content: "";
    position: absolute;
    top: -1px;
    left: 24px;
    height: 3px;
    width: 37px;
    background: #54b1d6;
  }
  .project-ideas::before {
    background: #bb9eba;
  }
  .project-tasks::before {
    background: #a4b392;
  }
  .project-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 25px;
  }
  .project-icon {
    display: grid;
    place-items: center;
    width: 52px;
    height: 52px;
    border-radius: 5px 5px 16px 5px;
    color: var(--accent);
    background: #eaf4fc;
    border: 1px solid #dbeaf4;
  }
  .project-ideas .project-icon {
    color: #82647d;
    background: #f6edf4;
    border-color: #eddfe9;
  }
  .project-tasks .project-icon {
    color: #617b56;
    background: #eff3e9;
    border-color: #e0e8d9;
  }
  .project-status {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    color: var(--accent);
    font-size: 10px;
  }
  .project-status > span {
    width: 5px;
    height: 5px;
    background: currentColor;
    border-radius: 50%;
  }
  .status-ideas {
    color: #82647d;
  }
  .status-tasks {
    color: #537849;
  }
  .project-label {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    font-size: 9px;
    letter-spacing: 1.4px;
    color: var(--muted);
  }
  .project-label > span {
    letter-spacing: 0.3px;
  }
  .project-card h3 {
    font-size: 20px;
    font-weight: 700;
    letter-spacing: -0.5px;
    line-height: 1.6;
    margin: 12px 0 10px;
  }
  .project-description {
    font-size: 13px;
    line-height: 1.95;
    color: var(--muted);
    margin: 0;
    flex: 1;
  }
  .project-stack {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
    margin: 21px 0 22px;
  }
  .project-stack > span {
    border: 1px solid #dce8f1;
    background: #f6fafd;
    border-radius: 3px;
    padding: 4px 7px;
    color: var(--muted);
    font-family: ui-monospace, Consolas, monospace;
    font-size: 10px;
  }
  .project-actions {
    display: flex;
    align-items: flex-start;
    gap: 16px;
    border-top: 1px solid #e7eef4;
  }
  .project-details {
    flex: 1;
    min-width: 0;
  }
  .project-details > summary {
    justify-content: flex-start;
    gap: 8px;
  }
  .project-actions > a {
    min-height: 44px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    font-size: 11px;
    color: var(--accent);
    flex-shrink: 0;
  }
  @media (max-width: 1100px) {
    .collection-grid,
    .projects-grid {
      gap: 20px;
    }
    .collection-card-body {
      padding: 20px 20px 10px;
    }
    .project-card {
      padding: 24px 20px 10px;
    }
  }
  @media (max-width: 900px) {
    .main-nav {
      gap: 5px;
    }
    .main-nav a {
      min-width: 65px;
      gap: 6px;
    }
    .collection-grid,
    .projects-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .collection-intro {
      align-items: flex-start;
    }
    .collection-count {
      padding-top: 4px;
    }
    .collection-count,
    .collection-intro p,
    .projects-intro {
      font-size: 12px;
    }
  }
  @media (max-width: 640px) {
    .anime-status-filters {
      display: flex;
      gap: 6px;
      margin-bottom: 20px;
    }
    .anime-status-filters button {
      min-width: 0;
      padding-inline: 11px;
      gap: 5px;
    }
    .main-nav.is-open {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
    }
    .main-nav a {
      min-width: 0;
    }
    .collection-section,
    .projects-section {
      padding-top: 24px;
      padding-bottom: 23px;
    }
    .collection-grid,
    .projects-grid {
      grid-template-columns: minmax(0, 1fr);
    }
    .collection-intro {
      display: block;
      margin-bottom: 20px;
    }
    .collection-count {
      display: block;
      font-size: 10px;
      margin-top: 8px;
    }
    .collection-artwork {
      aspect-ratio: 7 / 4;
    }
    .collection-card-body {
      padding: 21px 23px 10px;
    }
    .collection-filters {
      flex-wrap: wrap;
    }
    .collection-filters button {
      font-size: 11px;
      padding-inline: 12px;
    }
    .section-heading-note {
      margin-top: 14px;
      font-size: 10px;
    }
    .section-note {
      justify-content: flex-start;
      font-size: 10px;
      margin-top: 19px;
    }
    .project-card {
      padding: 25px 23px 10px;
    }
    .project-card-top {
      margin-bottom: 24px;
    }
  }
`;
