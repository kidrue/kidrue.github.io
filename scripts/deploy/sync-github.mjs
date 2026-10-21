import { spawnSync } from "node:child_process";
import { dirname, resolve } from "node:path";
import { githubConfiguration, loadLocal } from "./config.mjs";

const file = resolve("env.local");
try {
  const input = await loadLocal(file);
  const config = await githubConfiguration(input, dirname(file));
  console.log(`目标：${input.GITHUB_REPOSITORY} / production`);
  console.table(config.status);
  if (process.argv.includes("--apply")) {
    const gh = (args, body) => {
      const result = spawnSync("gh", args, {
        input: body,
        encoding: "utf8",
        windowsHide: true,
      });
      if (result.error || result.status !== 0)
        throw new Error(
          "GitHub 配置同步失败；请检查 gh 登录、仓库权限及 production 环境支持情况。未打印敏感值。",
        );
    };
    const environment = spawnSync(
      "gh",
      ["api", `repos/${input.GITHUB_REPOSITORY}/environments/production`],
      { encoding: "utf8", windowsHide: true },
    );
    if (environment.status === 0) {
      const protection = JSON.parse(environment.stdout).protection_rules ?? [];
      if (
        protection.some(
          (rule) =>
            rule.type === "required_reviewers" ||
            (rule.type === "wait_timer" && rule.wait_timer > 0),
        )
      )
        throw new Error(
          "production 已有人工审批或等待策略。请先核对该环境归属，脚本未修改它的保护规则。",
        );
    } else if (!/404|not found/i.test(environment.stderr))
      throw new Error(
        "无法检查 GitHub production 环境，请检查登录及仓库管理权限。",
      );
    gh(
      [
        "api",
        "--method",
        "PUT",
        `repos/${input.GITHUB_REPOSITORY}/environments/production`,
        "--input",
        "-",
      ],
      JSON.stringify({
        deployment_branch_policy: {
          protected_branches: false,
          custom_branch_policies: true,
        },
      }),
    );
    const existing = spawnSync(
      "gh",
      [
        "api",
        `repos/${input.GITHUB_REPOSITORY}/environments/production/deployment-branch-policies`,
      ],
      { encoding: "utf8", windowsHide: true },
    );
    if (existing.status !== 0)
      throw new Error("无法检查 production 环境分支限制");
    if (
      !JSON.parse(existing.stdout).branch_policies.some(
        (policy) => policy.name === "main" && policy.type === "branch",
      )
    ) {
      gh(
        [
          "api",
          "--method",
          "POST",
          `repos/${input.GITHUB_REPOSITORY}/environments/production/deployment-branch-policies`,
          "--input",
          "-",
        ],
        JSON.stringify({ name: "main", type: "branch" }),
      );
    }
    for (const [key, value] of Object.entries(config.secrets)) {
      // Empty optional secrets deliberately clear a previous value.
      if (value)
        gh(
          [
            "secret",
            "set",
            key,
            "--repo",
            input.GITHUB_REPOSITORY,
            "--env",
            "production",
          ],
          value,
        );
      else {
        const result = spawnSync(
          "gh",
          [
            "secret",
            "delete",
            key,
            "--repo",
            input.GITHUB_REPOSITORY,
            "--env",
            "production",
          ],
          { encoding: "utf8", windowsHide: true },
        );
        if (result.status !== 0 && !/404|not found/i.test(result.stderr))
          throw new Error(`清理可选 Secret 失败：${key}`);
      }
    }
    for (const [key, value] of Object.entries(config.variables))
      gh(
        [
          "variable",
          "set",
          key,
          "--repo",
          input.GITHUB_REPOSITORY,
          "--env",
          "production",
        ],
        value,
      );
    console.log("GitHub production 配置已同步。后续推送 main 将自动部署。");
  } else
    console.log("当前仅检查配置；执行 npm run deploy:sync 才会同步到 GitHub。");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
