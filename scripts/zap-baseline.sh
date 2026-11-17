#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="${ZAP_TARGET:-http://host.docker.internal:5173}"
HEALTH_URL="${ZAP_HEALTH_URL:-http://127.0.0.1:5173}"
REPORT_DIR="$ROOT/docs/seguridad"

if ! command -v docker >/dev/null 2>&1; then
  echo "Error: Docker no está instalado o no está en PATH." >&2
  exit 127
fi
if ! command -v curl >/dev/null 2>&1; then
  echo "Error: se necesita curl para comprobar que el frontend está disponible." >&2
  exit 127
fi

mkdir -p "$REPORT_DIR"
if ! curl --fail --silent --show-error "$HEALTH_URL" >/dev/null; then
  echo "Error: no responde el frontend en $HEALTH_URL. Arrancá TaskFlow con 'npm run dev' y volvé a ejecutar." >&2
  exit 1
fi

DOCKER_ARGS=(--rm)
if [[ "$(uname -s)" == "Linux" ]]; then
  DOCKER_ARGS+=(--add-host=host.docker.internal:host-gateway)
fi

printf 'Ejecutando OWASP ZAP Baseline contra %s\n' "$TARGET"
printf 'Los reportes se guardarán en docs/seguridad/.\n'
set +e
docker run "${DOCKER_ARGS[@]}" \
  -v "$ROOT:/zap/wrk/:rw" \
  ghcr.io/zaproxy/zaproxy:stable \
  zap-baseline.py \
    -t "$TARGET" \
    -r docs/seguridad/zap-baseline-report.html \
    -J docs/seguridad/zap-baseline-report.json
STATUS=$?
set -e

case "$STATUS" in
  0) echo "ZAP terminó sin alertas que hagan fallar el baseline." ;;
  1) echo "ZAP terminó con advertencias. Revisá el HTML/JSON y validá falsos positivos." ;;
  2) echo "ZAP encontró alertas de fallo. Revisá el HTML/JSON y priorizá la remediación." ;;
  3) echo "ZAP no pudo completar el escaneo. Revisá el log de Docker y la conectividad." ;;
  *) echo "ZAP terminó con código $STATUS. Revisá el log y los reportes generados." ;;
esac
exit "$STATUS"
