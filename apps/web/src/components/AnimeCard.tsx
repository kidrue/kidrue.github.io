import { Star } from "lucide-react";
import styled from "styled-components";
import type { CollectionRecord } from "../data/collections";
import CollectionArtwork from "./CollectionArtwork";

type AnimeRecord = Extract<CollectionRecord, { kind: "anime" }>;
const noteLabels = {
  看过: "查看观后感",
  在看: "查看追番记录",
  想看: "查看想看理由",
  搁置: "查看搁置记录",
  抛弃: "查看弃番记录",
};

const Card = styled.li`
  position: relative;
  min-width: 0;
  align-self: start;
  && .collection-artwork {
    aspect-ratio: 2 / 3;
    border-radius: 12px;
    background: #1c283b;
    transition:
      box-shadow 180ms ease,
      transform 180ms ease;
  }
  .collection-artwork > img {
    transition: transform 250ms ease;
  }
  &:hover .collection-artwork > img {
    transform: scale(1.035);
  }
  &:hover .collection-artwork {
    box-shadow: 0 8px 24px #0004;
  }
  .anime-badge {
    position: absolute;
    top: 11px;
    left: 0;
    z-index: 1;
    background: #f293ab;
    color: #331621;
    padding: 7px 11px;
    border-radius: 0 7px 7px 0;
    font-size: 11px;
    font-weight: 700;
    line-height: 1.3;
  }
  h3 {
    margin: 12px 0 5px;
    font-size: 15px;
    line-height: 1.6;
    color: var(--ink);
    overflow-wrap: anywhere;
  }
  .anime-meta {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    color: var(--muted);
    font-size: 12px;
    line-height: 1.8;
  }
  .anime-rating {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
  .anime-example {
    font-size: 9px;
    opacity: 0.85;
    margin-left: auto;
  }
  details > summary {
    position: absolute;
    inset: 0;
    z-index: 2;
    list-style: none;
    cursor: pointer;
    border-radius: 12px;
    min-height: 44px;
  }
  details > summary::-webkit-details-marker {
    display: none;
  }
  details > summary:focus-visible {
    outline: 2px solid #f293ab;
    outline-offset: 5px;
  }
  details[open] > summary {
    outline: 1px solid #f293ab77;
    outline-offset: 5px;
  }
  .anime-note {
    position: relative;
    z-index: 3;
    margin: 12px 0 0;
    padding: 12px;
    font-size: 12px;
    line-height: 1.9;
    color: var(--muted);
    background: var(--surface);
    border-left: 2px solid #f293ab;
    border-radius: 0 5px 5px 0;
    overflow-wrap: anywhere;
  }
  @media (max-width: 640px) {
    h3 {
      margin-top: 9px;
      font-size: 13px;
    }
    .anime-meta {
      gap: 5px;
      font-size: 11px;
    }
    .anime-badge {
      top: 9px;
      padding: 6px 9px;
      font-size: 10px;
    }
  }
`;

export default function AnimeCard({ record }: { record: AnimeRecord }) {
  return (
    <Card>
      <CollectionArtwork record={record} />
      <span className="anime-badge">{record.status}</span>
      <h3>{record.title}</h3>
      <div className="anime-meta">
        <span>{record.year ?? "年份待补"}</span>
        <span aria-hidden="true">·</span>
        {record.rating !== undefined ? (
          <span
            className="anime-rating"
            aria-label={`AniList 评分 ${record.rating.toFixed(1)} 分`}
          >
            <Star size={11} fill="currentColor" aria-hidden="true" />
            {record.rating.toFixed(1)}
          </span>
        ) : (
          <span>暂无评分</span>
        )}
        {record.example && <span className="anime-example">示例</span>}
      </div>
      <details>
        <summary aria-label={`${noteLabels[record.status]}：${record.title}`} />
        <p className="anime-note">{record.note}</p>
      </details>
    </Card>
  );
}
