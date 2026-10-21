import { css } from "styled-components";

export const articleStyles = css`
  .article-toolbar {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 210px;
    gap: 16px;
  }
  .article-search,
  .article-tag-select {
    display: flex;
    align-items: center;
    min-width: 0;
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 4px 4px 13px 4px;
    color: var(--muted);
  }
  .article-search {
    padding-left: 16px;
  }
  .article-search > svg {
    margin-right: 11px;
    color: var(--muted);
  }
  .article-search:focus-within,
  .article-tag-select:focus-within {
    border-color: var(--accent);
    outline: 2px solid #b8e0f1;
    outline-offset: 2px;
  }
  .article-search input {
    flex: 1;
    width: 100%;
    min-width: 0;
    min-height: 48px;
    padding: 10px 12px 10px 0;
    color: var(--ink);
    background: transparent;
    border: none;
    border-radius: 4px;
    font: inherit;
    font-size: 13px;
    line-height: 1.7;
  }
  .article-search input::placeholder {
    color: var(--muted);
    opacity: 1;
  }
  .article-search input:focus-visible,
  .article-tag-select select:focus-visible {
    outline: none;
  }
  .article-search input::-webkit-search-cancel-button {
    appearance: none;
  }
  .clear-search {
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    margin-right: 3px;
    flex-shrink: 0;
    background: transparent;
    color: var(--muted);
    border-radius: 4px 4px 10px 4px;
  }
  .clear-search:hover {
    color: var(--accent);
    background: #edf6fc;
  }
  .article-tag-select {
    position: relative;
  }
  .article-tag-select > svg:first-child {
    position: absolute;
    left: 15px;
    pointer-events: none;
  }
  .article-tag-select select {
    appearance: none;
    min-height: 48px;
    width: 100%;
    padding: 10px 35px 10px 41px;
    color: var(--ink);
    background: transparent;
    border: none;
    border-radius: inherit;
    font: inherit;
    font-size: 12px;
    line-height: 1.7;
    cursor: pointer;
  }
  .select-chevron {
    position: absolute;
    right: 14px;
    pointer-events: none;
  }
  .article-result-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    min-height: 58px;
    font-size: 11px;
    line-height: 1.8;
    color: var(--muted);
    margin-bottom: 4px;
  }
  .article-result-row > button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    padding: 8px 3px 8px 10px;
    gap: 6px;
    background: transparent;
    color: var(--accent);
    font-size: 11px;
    flex-shrink: 0;
  }
  .article-result-row > button:hover {
    color: var(--accent);
  }
  .article-empty {
    padding: 45px 24px 39px;
    text-align: center;
    border: 1px dashed #b7d4e5;
    border-radius: 5px 5px 23px 5px;
    background: #f7fbfd;
  }
  .empty-search-icon {
    display: grid;
    place-items: center;
    margin: 0 auto 17px;
    width: 60px;
    height: 60px;
    background: #e7f2fa;
    border-radius: 5px 5px 19px 5px;
    color: var(--accent);
  }
  .article-empty h3 {
    margin: 0 0 10px;
    font-size: 21px;
    line-height: 1.6;
    font-weight: 700;
  }
  .article-empty p {
    margin: 0 0 19px;
    color: var(--muted);
    font-size: 13px;
    line-height: 1.95;
  }
  .article-empty > button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    min-height: 44px;
    padding: 10px 18px;
    background: #e3f0fa;
    color: var(--accent);
    border-radius: 3px 3px 13px 3px;
    font-size: 12px;
  }
  .article-empty > button:hover {
    background: #d5e9f7;
  }
  @media (max-width: 640px) {
    .article-toolbar {
      grid-template-columns: minmax(0, 1fr);
      gap: 11px;
    }
    .article-search {
      padding-left: 13px;
    }
    .article-search > svg {
      margin-right: 8px;
      width: 15px;
    }
    .article-search input {
      font-size: 12px;
    }
    .article-tag-select select {
      min-height: 46px;
    }
    .article-result-row {
      font-size: 10px;
      min-height: 55px;
    }
    .article-result-row > button {
      font-size: 10px;
    }
    .article-empty {
      padding: 34px 18px;
    }
    .article-empty h3 {
      font-size: 19px;
    }
    .article-empty p {
      font-size: 12px;
    }
  }
`;
