import { Resolver } from "node:dns/promises";

export async function waitForDns(
  domain,
  ip,
  { timeout = 900000, resolve4 } = {},
) {
  const resolver = new Resolver({ timeout: 5000, tries: 2 });
  resolver.setServers(["1.1.1.1", "8.8.8.8"]);
  const lookup = resolve4 ?? ((name) => resolver.resolve4(name));
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    try {
      const values = await lookup(domain);
      if (values.length === 1 && values[0] === ip) return;
    } catch {
      /* DNS may be propagating. */
    }
    await new Promise((resolve) =>
      setTimeout(resolve, Math.min(5000, Math.max(0, deadline - Date.now()))),
    );
  }
  throw new Error(
    "公共 DNS 解析尚未指向目标服务器，请检查阿里云记录及公网 DNS；尚未申请证书。",
  );
}

export async function ensureDnsRecord(client, domain, ip) {
  if (domain !== "kidrue.top") throw new Error("此部署仅管理 kidrue.top");
  const records = [];
  for (let pageNumber = 1; ; pageNumber++) {
    const response = await client.describeDomainRecords({
      domainName: domain,
      pageSize: 500,
      pageNumber,
    });
    const page = response.body.domainRecords?.record ?? [];
    records.push(...page);
    if (records.length >= Number(response.body.totalCount ?? records.length))
      break;
    if (!page.length || pageNumber > 100) throw new Error("DNS 记录分页异常");
  }
  const roots = records.filter((record) => record.RR === "@");
  const addresses = roots.filter((record) => record.type === "A");
  if (
    addresses.length > 1 ||
    addresses.some((record) => record.line && record.line !== "default") ||
    roots.some((record) => ["CNAME", "AAAA"].includes(record.type))
  )
    throw new Error(
      "根域名 A/CNAME/AAAA 记录冲突，请先在阿里云控制台整理，脚本未修改记录",
    );
  const record = addresses[0];
  if (record?.status && record.status !== "ENABLE")
    throw new Error("根域名 A 记录已禁用，请先在控制台处理");
  if (record?.value === ip)
    return { action: "unchanged", recordId: record.recordId };
  const request = {
    domainName: domain,
    RR: "@",
    type: "A",
    value: ip,
    TTL: 600,
  };
  if (record) {
    await client.updateDomainRecord({ ...request, recordId: record.recordId });
    return { action: "updated", recordId: record.recordId };
  }
  const result = await client.addDomainRecord(request);
  return { action: "created", recordId: result.body.recordId };
}
export async function configureDns(config) {
  const [sdk, openapi] = await Promise.all([
    import("@alicloud/alidns20150109"),
    import("@alicloud/openapi-client"),
  ]);
  const Client = sdk.default.default ?? sdk.default;
  const client = new Client(
    new openapi.Config({
      accessKeyId: config.ALIYUN_DNS_ACCESS_KEY_ID,
      accessKeySecret: config.ALIYUN_DNS_ACCESS_KEY_SECRET,
      securityToken: config.ALIYUN_DNS_SECURITY_TOKEN || undefined,
      endpoint: "alidns.aliyuncs.com",
      connectTimeout: 15000,
      readTimeout: 30000,
    }),
  );
  // The generated SDK serializes model instances, not plain JavaScript objects.
  const adapter = {
    describeDomainRecords: (input) =>
      client.describeDomainRecords(new sdk.DescribeDomainRecordsRequest(input)),
    addDomainRecord: (input) =>
      client.addDomainRecord(new sdk.AddDomainRecordRequest(input)),
    updateDomainRecord: (input) =>
      client.updateDomainRecord(new sdk.UpdateDomainRecordRequest(input)),
  };
  try {
    return await ensureDnsRecord(
      adapter,
      config.BLOG_DOMAIN,
      config.ALIYUN_PUBLIC_IPV4,
    );
  } catch (error) {
    if (
      error.message?.startsWith("根域名") ||
      error.message?.startsWith("DNS 记录")
    )
      throw error;
    throw new Error(
      `阿里云 DNS 操作失败（${error.code ?? "请求失败"}），请检查 RAM 权限及网络。`,
    );
  }
}
