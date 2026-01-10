#!/bin/bash

# 1. Create Company
echo "Creating Test Company..."
COMPANY_ID=$(curl -s -X POST http://localhost:3000/api/empresas \
  -H "Content-Type: application/json" \
  -d '{
    "nome": "Turismo Algarve Teste",
    "nipc": "999999990",
    "email": "teste@algarve.pt",
    "cae": "55121",
    "setor": "Turismo",
    "dimensao": "PEQUENA",
    "regiao": "Algarve",
    "localidade": "Faro"
  }' | sed -n 's/.*"id":"\([^"]*\)".*/\1/p')

echo "Created Company ID: $COMPANY_ID"

if [ -z "$COMPANY_ID" ]; then
  echo "Failed to create company"
  exit 1
fi

# 2. Test Matching
echo -e "\nTesting Matching Logic..."
curl -s "http://localhost:3000/api/empresas/matching?empresaId=$COMPANY_ID" | jq '.matches[0:3] | .[] | {codigo: .avisoCodigo, nome: .avisoNome, score: .score, reasons: .reasons}'
