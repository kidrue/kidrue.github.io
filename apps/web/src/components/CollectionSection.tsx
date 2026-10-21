import { useState } from "react";
import {
  ArrowDownRight,
  Clapperboard,
  Heart,
  PackageCheck,
} from "lucide-react";
import {
  collectionRecords,
  type AnimeStatus,
  type CollectionKind,
} from "../data/collections";
import CollectionArtwork from "./CollectionArtwork";
import AnimeCard from "./AnimeCard";
import { AnimeFilters, AnimeGrid, CollectionTabs } from "./AnimeShelf.styles";

const animeStatuses = ["全部", "看过", "在看", "想看", "搁置", "抛弃"] as const;

export default function CollectionSection() {
  const [kind, setKind] = useState<CollectionKind>("anime");
  const [animeStatus, setAnimeStatus] = useState<"全部" | AnimeStatus>("全部");
  const kindRecords = collectionRecords.filter(
    (record) => record.kind === kind,
  );
  const records = kindRecords.filter(
    (record) =>
      record.kind !== "anime" ||
      animeStatus === "全部" ||
      record.status === animeStatus,
  );
  const exampleCount = records.filter((record) => record.example).length;

  return (
    <section
      id="collections"
      className="collection-section container"
      aria-labelledby="collections-title"
    >
      <div className="section-heading">
        <div>
          <div className="eyebrow section-eyebrow">
            <span className="little-diamond" />
            THINGS I LOVE
          </div>
          <h2 id="collections-title">
            兴趣，认真收藏<span className="brand-dot">。</span>
          </h2>
        </div>
        <CollectionTabs role="group" aria-label="收藏分类">
          <button
            type="button"
            className={kind === "anime" ? "selected" : ""}
            aria-pressed={kind === "anime"}
            aria-label="番剧记录"
            onClick={() => setKind("anime")}
          >
            动画
            <sup aria-hidden="true">
              {
                collectionRecords.filter((record) => record.kind === "anime")
                  .length
              }
            </sup>
          </button>
          <button
            type="button"
            className={kind === "figure" ? "selected" : ""}
            aria-pressed={kind === "figure"}
            aria-label="收藏的手办"
            onClick={() => setKind("figure")}
          >
            手办
            <sup aria-hidden="true">
              {
                collectionRecords.filter((record) => record.kind === "figure")
                  .length
              }
            </sup>
          </button>
        </CollectionTabs>
      </div>
      <div className="collection-intro">
        <p>
          {kind === "anime"
            ? "看过的故事、还未开始的期待，还有想留待以后继续的旅程。"
            : "把喜欢变成触手可及的小风景，每一格收藏柜都有自己的故事。"}
        </p>
        <span className="collection-count" role="status" aria-live="polite">
          {String(records.length).padStart(2, "0")}{" "}
          {kind === "anime" ? "部番剧" : "件藏品"}
          {exampleCount > 0 && ` · ${exampleCount} 项示例`}
        </span>
      </div>
      {kind === "anime" && (
        <AnimeFilters role="group" aria-label="番剧状态">
          {animeStatuses.map((status) => (
            <button
              key={status}
              type="button"
              className={animeStatus === status ? "selected" : ""}
              aria-pressed={animeStatus === status}
              aria-label={status}
              onClick={() => setAnimeStatus(status)}
            >
              {status}
              <sup aria-hidden="true">
                {
                  kindRecords.filter(
                    (record) => status === "全部" || record.status === status,
                  ).length
                }
              </sup>
            </button>
          ))}
        </AnimeFilters>
      )}
      {records.length === 0 ? (
        <div className="collection-empty">
          <Clapperboard size={28} strokeWidth={1.5} aria-hidden="true" />
          <h3>
            {kind === "anime" ? "这个分类还没有番剧记录" : "收藏柜还在慢慢布置"}
          </h3>
          <p>先留一个位置，下一段喜欢的故事会出现在这里。</p>
          {kind === "anime" && animeStatus !== "全部" && (
            <button type="button" onClick={() => setAnimeStatus("全部")}>
              查看全部番剧
            </button>
          )}
        </div>
      ) : kind === "anime" ? (
        <AnimeGrid aria-label="番剧记录">
          {records.map(
            (record) =>
              record.kind === "anime" && (
                <AnimeCard key={record.id} record={record} />
              ),
          )}
        </AnimeGrid>
      ) : (
        <ul className="collection-grid" aria-label="手办收藏">
          {records.map((record) => (
            <li className="collection-card" key={record.id}>
              <CollectionArtwork record={record} />
              <div className="collection-card-body">
                <div className="collection-topline">
                  <span className="collection-status is-figure">
                    <PackageCheck size={13} />
                    {record.status}
                  </span>
                  {record.example && (
                    <span className="sample-label">示例记录</span>
                  )}
                </div>
                <h3>{record.title}</h3>
                <p className="collection-subtitle">{record.subtitle}</p>
                <div className="collection-tags">
                  {record.tags.map((tag) => (
                    <span key={tag}># {tag}</span>
                  ))}
                </div>
                <details className="collection-details">
                  <summary>
                    查看收藏记录
                    <ArrowDownRight size={16} aria-hidden="true" />
                  </summary>
                  <p>{record.note}</p>
                </details>
              </div>
            </li>
          ))}
        </ul>
      )}
      <p className="section-note">
        <Heart size={13} aria-hidden="true" />
        <span>
          {exampleCount > 0
            ? "标注为示例的条目仅用于展示，可以换成自己的观看清单与收藏。"
            : "把喜欢的故事，留在自己的小角落。"}
          {kind === "anime" && (
            <>
              {" "}
              封面与评分来自{" "}
              <a
                href="https://anilist.co/"
                target="_blank"
                rel="noopener noreferrer"
              >
                AniList
              </a>
              。
            </>
          )}
        </span>
      </p>
    </section>
  );
}
