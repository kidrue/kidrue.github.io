import assert from "node:assert/strict";
import test from "node:test";
import {
  collectBangumi,
  normalizeBangumi,
  isImage,
} from "./import-bilibili.mjs";

const entry = (season_id, extra = {}) => ({
  season_id,
  title: `动画 ${season_id}`,
  follow_status: 2,
  cover: "http://i0.hdslb.com/bfs/bangumi/cover.jpg",
  is_started: 1,
  publish: { release_date: "2020-01-02", pub_time: "2020-02-01 00:00:00" },
  ...extra,
});

test("历史封面按图片签名识别，HTML 错误页不能保存为海报", () => {
  assert.equal(isImage(Buffer.from([0xff, 0xd8, 0xff, 0xe0])), true);
  assert.equal(isImage(Buffer.from("<html>error</html>")), false);
  assert.equal(isImage(Buffer.alloc(0)), false);
});

test("读取全部分页，按 season_id 去重且保持状态", async () => {
  const requested = [];
  const rows = await collectBangumi(async (pn) => {
    requested.push(pn);
    return {
      code: 0,
      data: {
        total: 3,
        list:
          pn === 1
            ? [entry(1), entry(2)]
            : [entry(2), entry(3, { follow_status: 3 })],
      },
    };
  });
  assert.deepEqual(requested, [1, 2]);
  assert.deepEqual(
    rows.map((x) => x.season_id),
    [1, 2, 3],
  );
  assert.equal(normalizeBangumi(rows[2]).status, "看过");
});

test("失败和缺页不能生成部分清单覆盖已有快照", async () => {
  await assert.rejects(
    collectBangumi(async () => ({ code: -352, message: "blocked" })),
    /-352/,
  );
  await assert.rejects(
    collectBangumi(async () => ({ code: 0, data: { total: 2, list: [] } })),
    /empty|空/,
  );
  await assert.rejects(
    collectBangumi(async () => ({
      code: 0,
      data: { total: 2, list: [entry(1)] },
    })),
    /progress|重复/,
  );
});

test("状态、上映日期和待定日期规范化，不把平台评分当成个人评分", () => {
  const row = normalizeBangumi(
    entry(7, { follow_status: 1, rating: { score: 9.8 } }),
  );
  assert.equal(row.status, "想看");
  assert.equal(row.airDate, "2020-01-02");
  assert.equal(row.rating, undefined);
  assert.equal(row.coverUrl, "https://i0.hdslb.com/bfs/bangumi/cover.jpg");
  assert.equal(
    normalizeBangumi(entry(8, { is_started: 0 })).airDate,
    undefined,
  );
  assert.equal(
    normalizeBangumi(entry(9, { publish: { release_date: "2020-02-30" } }))
      .airDate,
    undefined,
  );
  assert.throws(
    () => normalizeBangumi(entry(10, { follow_status: 99 })),
    /status|状态/,
  );
});
