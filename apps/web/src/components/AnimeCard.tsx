import { ArrowRight, Star } from "lucide-react";
import styled from "styled-components";
import type { CollectionRecord } from "../data/collections";
import CollectionArtwork from "./CollectionArtwork";
import type { ListView } from "./ViewSwitcher";

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
  h4 {
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
  .anime-sources p {
    margin: 8px 0 0;
  }
  @media (max-width: 640px) {
    h4 {
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

function BilibiliSources({ record }: { record: AnimeRecord }) {
  if (!record.bilibili?.length) return null;
  return (
    <div className="anime-sources">
      {record.bilibili.map((source) => (
        <p key={source.seasonId}>
          <a href={source.url} target="_blank" rel="noopener noreferrer">
            Bilibili：{source.title}
          </a>
          <span> · {source.status}</span>
        </p>
      ))}
    </div>
  );
}

export default function AnimeCard({
  record,
  view = "cards",
}: {
  record: AnimeRecord;
  view?: ListView;
}) {
  if (view === "timeline") {
    return (
      <li className="timeline-item" data-air-date={record.airDate}>
        <details>
          <summary
            className="timeline-row"
            aria-label={`${noteLabels[record.status]}：${record.title}`}
          >
            {record.airDate ? (
              <time dateTime={record.airDate}>{record.airDate}</time>
            ) : (
              <span className="timeline-date-unknown">时间待确认</span>
            )}
            <ArrowRight
              className="timeline-arrow"
              size={16}
              aria-hidden="true"
            />
            <div className="timeline-anime-title">
              <CollectionArtwork record={record} />
              <h4>{record.title}</h4>
            </div>
            <span className="timeline-label">{record.status}</span>
          </summary>
          <div className="timeline-detail">
            <div>
              <p>
                {record.rating === undefined
                  ? "暂无评分"
                  : `AniList 评分 ${record.rating.toFixed(1)} 分`}
              </p>
              <p>{record.note}</p>
              <BilibiliSources record={record} />
            </div>
          </div>
        </details>
      </li>
    );
  }
  return (
    <Card data-air-date={record.airDate}>
      <CollectionArtwork record={record} />
      <span className="anime-badge">{record.status}</span>
      <h4>{record.title}</h4>
      <div className="anime-meta">
        {record.airDate ? (
          <time dateTime={record.airDate}>{record.airDate.slice(0, 7)}</time>
        ) : (
          <span>播出时间待确认</span>
        )}
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
        <div className="anime-note">
          <p>{record.note}</p>
          <BilibiliSources record={record} />
        </div>
      </details>
    </Card>
  );
}
