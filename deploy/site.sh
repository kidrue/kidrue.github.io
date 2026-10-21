#!/usr/bin/env bash
set -Eeuo pipefail
umask 077
release=${1:?缺少发布目录}
phase=${2:?缺少站点阶段}
# shellcheck source=/dev/null
source "$release/settings.env"
site=/etc/nginx/conf.d/kidrue-blog.conf
cert_name="kidrue-blog-$BLOG_DOMAIN"
test "$BLOG_DOMAIN" = kidrue.top
if [[ -f "$site" ]]; then
  grep -Fxq '# Managed by kidrue-blog.' "$site" || { echo '博客站点配置不属于本项目，拒绝覆盖。' >&2; exit 1; }
fi
# Only permit the exact apex domain in our own file, preserving all other sites.
if nginx -T 2>/dev/null | awk '
  /^# configuration file / { file=$4; sub(/:$/, "", file) }
  /^[[:space:]]*#/ { next }
  /server_name/ { collecting=1; names="" }
  collecting { names=names " " $0 }
  collecting && /;/ {
    if (names ~ /[[:space:]]kidrue[.]top([[:space:];]|$)/ && file != "/etc/nginx/conf.d/kidrue-blog.conf") conflict=1;
    collecting=0
  }
  END { exit !conflict }
'; then
  echo '已有其他 Nginx 配置使用 kidrue.top，请先确认归属。没有覆盖已有站点。' >&2
  exit 1
fi
if [[ "$phase" = check ]]; then exit 0; fi
install -d -m 755 /var/lib/kidrue-blog/acme
if [[ ! -e "$release/nginx.snapshot" ]]; then
  if [[ -f "$site" ]]; then cp -a "$site" "$release/nginx.previous"; fi
  touch "$release/nginx.snapshot"
fi
apply_site() {
  install -m 644 "$1" "$site"
  if ! nginx -t; then
    if [[ -f "$release/nginx.previous" ]]; then cp -a "$release/nginx.previous" "$site"; else rm -f -- "$site"; fi
    return 1
  fi
  systemctl reload nginx
}
if [[ "$phase" = prepare ]]; then
  if [[ -s "/etc/letsencrypt/live/$cert_name/fullchain.pem" ]]; then apply_site "$release/https.conf"; else apply_site "$release/http.conf"; fi
elif [[ "$phase" = tls ]]; then
  issue_certificate() { certbot certonly --webroot --webroot-path /var/lib/kidrue-blog/acme \
    --cert-name "$cert_name" --domain "$BLOG_DOMAIN" --email "$CERTBOT_EMAIL" \
    --agree-tos --non-interactive --keep-until-expiring < /dev/null; }
  if ! issue_certificate; then
    echo '首次证书申请未完成，等待 60 秒后仅重试一次。' >&2
    sleep 60
    issue_certificate
  fi
  apply_site "$release/https.conf"
  hook=/etc/letsencrypt/renewal-hooks/deploy/kidrue-blog-reload.sh
  install -d -m 755 "$(dirname "$hook")"
  if [[ -e "$hook" ]] && ! grep -Fxq '# Managed by kidrue-blog.' "$hook"; then echo '证书 hook 路径已被占用' >&2; exit 1; fi
  printf '%s\n' '#!/usr/bin/env bash' '# Managed by kidrue-blog.' 'set -e' 'nginx -t && systemctl reload nginx' > "$hook"
  chmod 755 "$hook"
  # Use the host's existing renewal schedule when available.
  if ! systemctl is-active --quiet certbot.timer && ! systemctl is-active --quiet snap.certbot.renew.timer; then
    certbot_bin=$(command -v certbot)
    [[ "$certbot_bin" =~ ^/[a-zA-Z0-9_/-]+$ ]]
    for unit in /etc/systemd/system/kidrue-blog-cert-renew.service /etc/systemd/system/kidrue-blog-cert-renew.timer; do
      if [[ -e "$unit" ]] && ! grep -Fxq '# Managed by kidrue-blog.' "$unit"; then echo '证书续期 unit 路径已被占用' >&2; exit 1; fi
    done
    printf '%s\n' '# Managed by kidrue-blog.' '[Unit]' 'Description=Renew kidrue blog certificate' '[Service]' 'Type=oneshot' "ExecStart=$certbot_bin renew --cert-name $cert_name --quiet" > /etc/systemd/system/kidrue-blog-cert-renew.service
    printf '%s\n' '# Managed by kidrue-blog.' '[Unit]' 'Description=Renew kidrue blog certificate daily' '[Timer]' 'OnCalendar=daily' 'RandomizedDelaySec=3600' 'Persistent=true' '[Install]' 'WantedBy=timers.target' > /etc/systemd/system/kidrue-blog-cert-renew.timer
    systemctl daemon-reload
    systemctl enable --now kidrue-blog-cert-renew.timer
  fi
else echo '未知站点阶段' >&2; exit 1; fi
