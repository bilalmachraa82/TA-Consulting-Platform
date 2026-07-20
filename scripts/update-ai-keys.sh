#!/usr/bin/env bash
# Distribui uma chave de API nova para todos os sítios onde é precisa:
# .env local, Vercel (production/preview/development) e GitHub Actions secrets.
#
# Uso:
#   bash scripts/update-ai-keys.sh GEMINI_API_KEY "AIza..."
#   bash scripts/update-ai-keys.sh OPENROUTER_API_KEY "sk-or-..."
#   bash scripts/update-ai-keys.sh ANTHROPIC_API_KEY "sk-ant-..."
#
# Valida a chave contra a API respetiva ANTES de a distribuir.

set -euo pipefail

KEY_NAME="${1:-}"
KEY_VALUE="${2:-}"

if [ -z "$KEY_NAME" ] || [ -z "$KEY_VALUE" ]; then
    echo "Uso: bash scripts/update-ai-keys.sh <NOME_DA_CHAVE> <valor>"
    echo "Nomes suportados: GEMINI_API_KEY, OPENROUTER_API_KEY, ANTHROPIC_API_KEY"
    exit 1
fi

echo "1/4 A validar a chave contra a API..."
case "$KEY_NAME" in
    GEMINI_API_KEY)
        HTTP=$(curl -s -o /dev/null -w '%{http_code}' -m 20 \
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=$KEY_VALUE" \
            -H 'Content-Type: application/json' -d '{"contents":[{"parts":[{"text":"OK?"}]}]}')
        ;;
    OPENROUTER_API_KEY)
        HTTP=$(curl -s -o /dev/null -w '%{http_code}' -m 30 "https://openrouter.ai/api/v1/chat/completions" \
            -H "Authorization: Bearer $KEY_VALUE" -H 'Content-Type: application/json' \
            -d '{"model":"google/gemini-2.5-flash","messages":[{"role":"user","content":"OK?"}],"max_tokens":5}')
        ;;
    ANTHROPIC_API_KEY)
        HTTP=$(curl -s -o /dev/null -w '%{http_code}' -m 20 https://api.anthropic.com/v1/messages \
            -H "x-api-key: $KEY_VALUE" -H "anthropic-version: 2023-06-01" -H "content-type: application/json" \
            -d '{"model":"claude-haiku-4-5-20251001","max_tokens":5,"messages":[{"role":"user","content":"OK?"}]}')
        ;;
    *)
        echo "Nome de chave não suportado: $KEY_NAME"
        exit 1
        ;;
esac

if [ "$HTTP" != "200" ]; then
    echo "❌ A chave respondeu HTTP $HTTP — NÃO foi distribuída. Confirma que copiaste bem."
    exit 1
fi
echo "   ✅ chave válida (HTTP 200)"

echo "2/4 A atualizar .env local..."
if grep -q "^$KEY_NAME=" .env 2>/dev/null; then
    # BSD sed (macOS) — cria backup .env.bak e substitui a linha
    sed -i.bak "s|^$KEY_NAME=.*|$KEY_NAME='$KEY_VALUE'|" .env
else
    printf "%s='%s'\n" "$KEY_NAME" "$KEY_VALUE" >> .env
fi
echo "   ✅ .env atualizado (backup em .env.bak)"

echo "3/4 A atualizar Vercel (production, preview, development)..."
for ENV_TARGET in production preview development; do
    vercel env rm "$KEY_NAME" "$ENV_TARGET" --yes >/dev/null 2>&1 || true
    printf '%s' "$KEY_VALUE" | vercel env add "$KEY_NAME" "$ENV_TARGET" >/dev/null
done
echo "   ✅ Vercel atualizado nos 3 ambientes"

echo "4/4 A atualizar GitHub Actions secret..."
printf '%s' "$KEY_VALUE" | gh secret set "$KEY_NAME"
echo "   ✅ GitHub secret definido"

echo ""
echo "🎉 $KEY_NAME distribuída e validada. Sugestões:"
echo "   - redeploy do Vercel para produção apanhar a chave: vercel --prod"
echo "   - testar o enriquecimento: yarn tsx scripts/enrich-avisos.ts --limit 3"
