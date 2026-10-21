import styled from "styled-components";

export const CollectionTabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 22px;
  button {
    position: relative;
    min-height: 44px;
    padding: 10px 0;
    background: transparent;
    color: var(--muted);
    font-size: 13px;
    font-weight: 700;
  }
  button[aria-pressed="true"] {
    color: #f293ab;
  }
  button[aria-pressed="true"]::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 2px;
    background: #f293ab;
  }
  sup {
    font-size: 10px;
    margin-left: 4px;
  }
`;
export const AnimeFilters = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px 20px;
  margin: 0 0 24px;
  button {
    min-height: 44px;
    padding: 8px 0;
    font-size: 13px;
    color: var(--muted);
    background: transparent;
  }
  button[aria-pressed="true"] {
    color: #f293ab;
    font-weight: 700;
  }
  button:hover {
    color: #f5adbf;
  }
  sup {
    margin-left: 4px;
    font-size: 10px;
  }
  button:focus-visible {
    outline: 2px solid #f293ab;
    outline-offset: 4px;
    border-radius: 2px;
  }
  @media (max-width: 640px) {
    gap: 0 15px;
    margin-bottom: 18px;
    button {
      font-size: 12px;
    }
  }
`;
export const AnimeGrid = styled.ul`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 28px 22px;
  list-style: none;
  margin: 0;
  padding: 0;
  @media (max-width: 1000px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 25px 20px;
  }
  @media (max-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 23px 16px;
  }
`;
