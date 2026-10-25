#!/usr/bin/env bash
# Démarre le site compilé (next start) avec un secret de TEST généré à la
# volée, lance le client MCP officiel, puis arrête le serveur.
# Prérequis : `npm run build` déjà exécuté.
set -euo pipefail

PORT="${MCP_E2E_PORT:-3100}"
TOKEN="$(node -e 'console.log(require("node:crypto").randomBytes(32).toString("hex"))')"
LOG="$(mktemp)"

if curl -s -o /dev/null --noproxy '*' --max-time 2 "http://127.0.0.1:${PORT}/"; then
  echo "Le port ${PORT} est déjà utilisé : arrêtez l'autre serveur." >&2
  exit 2
fi

TOUBA_INFOS_MCP_SECRET="$TOKEN" npx next start -p "$PORT" -H 127.0.0.1 >"$LOG" 2>&1 &
SERVER_PID=$!
trap 'kill "$SERVER_PID" 2>/dev/null || true' EXIT

for _ in $(seq 1 60); do
  if curl -s -o /dev/null --noproxy '*' "http://127.0.0.1:${PORT}/"; then break; fi
  sleep 1
done

NO_PROXY="127.0.0.1,localhost" no_proxy="127.0.0.1,localhost" \
  MCP_E2E_URL="http://127.0.0.1:${PORT}" MCP_E2E_TOKEN="$TOKEN" \
  node scripts/mcp-e2e.mjs

# Le jeton ne doit jamais apparaître dans les journaux du serveur.
if grep -q "$TOKEN" "$LOG"; then
  echo "ÉCHEC : le jeton apparaît dans les journaux du serveur." >&2
  exit 1
fi
echo "Journaux du serveur : aucun jeton enregistré."
