import styled from "styled-components";

export const Timeline = styled.ul`
  --timeline-date-width: 100px;
  margin: 0;
  padding: 0;
  list-style: none;
  .timeline-month {
    display: flex;
    align-items: baseline;
    gap: 12px;
    margin: 32px 0 10px;
  }
  .timeline-month:first-child {
    margin-top: 0;
  }
  .timeline-month h3 {
    margin: 0;
    font-size: 20px;
    color: var(--ink);
  }
  .timeline-month > span {
    font-size: 12px;
    color: var(--muted);
  }
  .timeline-item {
    position: relative;
    margin: 0;
    padding: 0;
    border: 0;
    border-radius: 0;
    background: transparent;
  }
  .timeline-item::before {
    content: "";
    position: absolute;
    left: calc(var(--timeline-date-width) + 17px);
    top: 0;
    bottom: 0;
    width: 1px;
    background: var(--muted);
    opacity: 0.3;
    pointer-events: none;
  }
  .timeline-row {
    display: grid;
    grid-template-columns: var(--timeline-date-width) 16px minmax(0, 1fr) auto;
    align-items: baseline;
    gap: 10px;
    min-height: 54px;
    padding: 14px 0;
    color: var(--ink);
  }
  .timeline-row time,
  .timeline-date-unknown {
    color: var(--muted);
    font-size: 12px;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  .timeline-arrow {
    position: relative;
    z-index: 1;
    align-self: start;
    margin-top: 4px;
    color: var(--cyan, #8cd3f5);
    background: var(--paper);
  }
  .timeline-row h4 {
    margin: 0;
    font-size: 15px;
    line-height: 1.8;
    overflow-wrap: anywhere;
  }
  .timeline-title {
    padding: 0;
    background: transparent;
    color: inherit;
    text-align: left;
    font: inherit;
    cursor: pointer;
  }
  .timeline-title:hover,
  summary:hover h4 {
    color: #8cd3f5;
  }
  .timeline-title:focus-visible,
  summary:focus-visible {
    outline: 2px solid #8cd3f5;
    outline-offset: 4px;
  }
  .timeline-label {
    color: var(--muted);
    font-size: 11px;
    white-space: nowrap;
  }
  summary {
    cursor: pointer;
    list-style: none;
  }
  summary::-webkit-details-marker {
    display: none;
  }
  details[open] summary h4 {
    color: #8cd3f5;
  }
  summary.timeline-row {
    align-items: center;
  }
  summary .timeline-arrow {
    align-self: center;
    margin-top: 0;
  }
  .timeline-anime-title {
    display: grid;
    grid-template-columns: 48px minmax(0, 1fr);
    align-items: center;
    gap: 14px;
  }
  .timeline-anime-title .collection-artwork {
    width: 48px;
    height: 72px;
    border-radius: 5px;
  }
  .timeline-detail {
    margin: 0 0 16px calc(var(--timeline-date-width) + 36px);
    padding: 14px;
    border: 1px solid #8cd3f533;
    border-radius: 8px;
    color: var(--muted);
    font-size: 12px;
    line-height: 1.9;
  }
  .timeline-detail p {
    margin: 0 0 8px;
    overflow-wrap: anywhere;
  }
  @media (max-width: 640px) {
    --timeline-date-width: 76px;
    .timeline-row {
      gap: 8px;
      grid-template-columns: var(--timeline-date-width) 16px minmax(0, 1fr);
    }
    .timeline-row time,
    .timeline-date-unknown {
      font-size: 11px;
    }
    .timeline-row h4 {
      font-size: 13px;
    }
    .timeline-label {
      grid-column: 3;
    }
    .timeline-item::before {
      left: calc(var(--timeline-date-width) + 15px);
    }
    .timeline-detail {
      margin-left: 0;
    }
    .timeline-anime-title {
      grid-template-columns: 42px minmax(0, 1fr);
      gap: 10px;
    }
    .timeline-anime-title .collection-artwork {
      width: 42px;
      height: 63px;
    }
  }
`;
