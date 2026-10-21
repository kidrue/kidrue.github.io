import { useState } from "react";
import type { CollectionRecord } from "../data/collections";

const palettes = {
  mint: {
    sky: "#e2f0ed",
    pale: "#c6ddd5",
    mid: "#91b9ab",
    dark: "#4f7e70",
    mark: "#e8ce8b",
  },
  rose: {
    sky: "#f3e6ec",
    pale: "#e4cddc",
    mid: "#bf98b6",
    dark: "#856881",
    mark: "#ecc7a0",
  },
  sand: {
    sky: "#f3ede0",
    pale: "#e2d8bb",
    mid: "#b7b78f",
    dark: "#7b8a6b",
    mark: "#d2ae7e",
  },
};

export default function CollectionArtwork({
  record,
}: {
  record: CollectionRecord;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const palette = palettes[record.tone];
  if (record.image && !imageFailed) {
    return (
      <div className="collection-artwork">
        <img
          src={record.image}
          alt={`${record.title}${record.kind === "anime" ? "封面" : "手办实拍"}`}
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      </div>
    );
  }

  return (
    <div className={`collection-artwork tone-${record.tone}`}>
      <svg viewBox="0 0 480 280" fill="none" aria-hidden="true">
        <path fill={palette.sky} d="M0 0h480v280H0z" />
        <path
          d="M40 0v280M120 0v280M200 0v280M280 0v280M360 0v280M440 0v280M0 60h480M0 140h480M0 220h480"
          stroke={palette.dark}
          opacity=".045"
        />
        {record.kind === "figure" ? (
          <>
            <path
              d="M127 220V72c0-18 15-32 32-32h162c18 0 32 14 32 32v148"
              fill="white"
              fillOpacity=".3"
              stroke={palette.mid}
              strokeWidth="1.5"
            />
            <path
              d="M143 211V75c0-9 7-16 16-16"
              stroke="white"
              strokeWidth="5"
              opacity=".75"
              strokeLinecap="round"
            />
            <ellipse cx="240" cy="222" rx="112" ry="17" fill={palette.pale} />
            <ellipse cx="240" cy="213" rx="100" ry="15" fill="#fafcfb" />
            <ellipse
              cx="240"
              cy="208"
              rx="62"
              ry="9"
              fill={palette.mid}
              opacity=".3"
            />
            <path
              d="m221 183-4 25h15l6-25m18 0 6 25h-15l-5-25"
              fill={palette.dark}
            />
            <path
              d="m220 121-26 59c21 16 69 16 92 0l-27-59z"
              fill={palette.mid}
            />
            <path d="m223 129 17 50 18-50" fill="white" opacity=".7" />
            <path
              d="m217 136-25 21m70-21 22 16"
              stroke={palette.pale}
              strokeWidth="10"
              strokeLinecap="round"
            />
            <circle cx="240" cy="99" r="28" fill="#f3dfcb" />
            <path
              d="M210 105c-9-39 13-56 38-49 26 6 26 30 20 51l-8-25-15 9-10-11-15 25-7 16z"
              fill={palette.dark}
            />
            <path d="M194 79h91l-24-9-17-40-28 39z" fill={palette.dark} />
            <path d="m218 68 42-1 4 9h-50z" fill={palette.mark} />
            <path d="M293 106v93" stroke={palette.dark} strokeWidth="3" />
            <path
              d="m293 83 5 14 15 1-12 9 4 15-12-8-13 8 4-15-12-9 16-1z"
              fill={palette.mark}
            />
            <circle cx="152" cy="99" r="3" fill={palette.mark} />
            <path d="M323 146h12m-6-6v12" stroke={palette.mid} />
          </>
        ) : record.tone === "rose" ? (
          <>
            <circle cx="345" cy="78" r="40" fill="white" fillOpacity=".45" />
            <path d="M0 227 480 129v151H0z" fill={palette.pale} />
            <path d="m167 203 162-115 8 10-162 115z" fill={palette.dark} />
            <path
              d="M166 136c-25-13-49-4-45 17 3 14-8 22-23 29-31 15-11 53 24 54 18 1 28-15 32-31 4-15 18-13 27-19 15-9 7-36-15-50z"
              fill={palette.mid}
              stroke="white"
              strokeWidth="2"
            />
            <path d="m139 184 30 22" stroke={palette.dark} strokeWidth="11" />
            <path
              d="m145 178 180-86m-176 91 179-86"
              stroke="#fff7ec"
              opacity=".8"
            />
            <path
              d="M90 75v26m0-20 16-4v21"
              stroke={palette.dark}
              strokeWidth="3"
            />
            <ellipse cx="85" cy="102" rx="6" ry="4" fill={palette.dark} />
            <ellipse cx="101" cy="99" rx="6" ry="4" fill={palette.dark} />
            <path
              d="M355 155h34m-27 11h49m-42 11h31"
              stroke={palette.dark}
              strokeWidth="2"
              opacity=".35"
            />
            <path
              d="m220 49 4 11 12 1-10 7 4 12-10-7-10 7 4-12-10-7 12-1z"
              fill={palette.mark}
            />
          </>
        ) : (
          <>
            <circle cx="338" cy="77" r="34" fill="#fff9e6" />
            <path
              d="m0 191 99-61 87 57 105-86 111 81 78-31v129H0z"
              fill={palette.pale}
            />
            <path
              d="M0 216c90-33 127-36 205-13s148 9 275-39v116H0z"
              fill={palette.mid}
            />
            <path
              d="M0 256c117-30 195-24 268-9s151 6 212-2v35H0z"
              fill={palette.dark}
              opacity=".65"
            />
            <path
              d="m239 280-33-31 41-28-10-18 32 20-35 26 64 31z"
              fill="#f5f2dd"
              opacity=".8"
            />
            <path
              d="M81 196V99m-19 54 19 12 24-28"
              stroke={palette.dark}
              strokeWidth="5"
              strokeLinecap="round"
            />
            <circle cx="80" cy="99" r="36" fill={palette.dark} opacity=".75" />
            <circle cx="53" cy="122" r="26" fill={palette.dark} opacity=".7" />
            <circle cx="107" cy="123" r="29" fill={palette.dark} opacity=".7" />
            <path
              d="M368 136v72m-16-59h32"
              stroke={palette.dark}
              strokeWidth="3"
            />
            <rect
              x="355"
              y="151"
              width="26"
              height="31"
              rx="9"
              fill={palette.mark}
            />
            <path d="M368 155v23" stroke="white" opacity=".6" />
            <path
              d="m175 75 3 8 8 3-8 3-3 8-3-8-8-3 8-3z"
              fill={palette.mark}
            />
          </>
        )}
      </svg>
      <span className="collection-art-label">
        {imageFailed
          ? "图片暂不可用 · 示意图"
          : record.kind === "anime"
            ? "原创示意封面"
            : "原创藏品示意"}
        <span aria-hidden="true">
          {record.kind === "anime" ? "STORY ARCHIVE" : "MY LITTLE SHELF"}
        </span>
      </span>
    </div>
  );
}
