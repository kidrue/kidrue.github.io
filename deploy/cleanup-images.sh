#!/usr/bin/env bash
set -Eeuo pipefail
deploy_path=${1:?缺少部署目录}
keep_file="$deploy_path/.deploy/keep-images"
test -s "$keep_file"
test -s "$deploy_path/.deploy/imported-images"
while IFS= read -r image; do
  [[ "$image" =~ ^kidrue-blog-(api|web|tools|postgres):[a-f0-9]{40}$ ]] || continue
  grep -Fxq "$image" "$keep_file" && continue
  docker image inspect "$image" >/dev/null 2>&1 || continue
  # All running and stopped containers are protected, including other projects.
  [[ -z "$(docker ps -aq --filter "ancestor=$image")" ]] || continue
  docker image rm --no-prune "$image" || echo "跳过无法清理的博客镜像：$image" >&2
done < <(sort -u "$deploy_path/.deploy/imported-images")
