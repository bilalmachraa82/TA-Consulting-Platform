# Benchmark: File Search

Criado: 2025-12-12T23:05:06.364Z

## Setup

- Modelos: gemini-2.5-flash, gemini-2.5-pro, gemini-3-pro-preview
- Test cases: 14

## Resultados (por modelo)

| Modelo | Score (médio) | Citations | Leakage | Latência (avg) | Custo (estim.) |
|---|---:|---:|---:|---:|---:|
| gemini-2.5-flash | 7.2 | 93% | 0% | 5.0s | $0.0089 |
| gemini-2.5-pro | 7.9 | 86% | 0% | 11.2s | $0.0660 |
| gemini-3-pro-preview | 5.0 | 21% | 0% | 22.3s | $0.0397 |

## Notas e Best Practices (anti-alucinações)

- Usar sempre `metadata_filter` (por portal +, idealmente, programa/região) para evitar mistura de fontes.
- Guardar `customMetadata` rica: portal, avisoCodigo, fonte/url, tipo de doc.
- Temperatura baixa (0.0–0.2) e instrução explícita: “se não encontrares, diz que não encontras”.
- Perguntas de consultor: separar “matching/recomendação” (heurístico) de “factos do aviso” (tem de estar citado).
- PDFs scan: considerar OCR antes de upload.

## Exemplos (top 3 por score)

### gemini-2.5-flash / open-01 (9.4/10)

**Pergunta**: Quais são os avisos que estão abertos para candidatura AGORA? Lista os mais relevantes e indica o prazo (quando fecha).

**Resposta**:

Com base na informação disponível, seguem os avisos que se encontram abertos para candidatura, com os respetivos prazos de fecho:

**Avisos com prazos de fecho definidos:**

*   **PT2030:**
    *   **Mobilidade Sustentável (FA0114/2025)**: Fecha a 19 de dezembro de 2025.
    *   **Proteção e conservação da natureza e biodiversidade (FA0113/2025)**: Fecha a 19 de dezembro de 2025.
    *   **Capacitação da rede nacional de acolhimento de requerentes e beneficiários de proteção internacional (FA0943/2024)**: Fecha a 30 de abril de 2026.
    *   **Proteção civil e gestão integrada de riscos – Prevenção e mitigação de riscos associados a derrocada de taludes ou para suporte de terras (FA0036/2025)**: Fecha a 29 de maio de 2026.
    *   **Medidas de adaptação às alterações climáticas (FA0154/2025)**: Fecha a 31 de agosto de 2026.

*   **PEPAC:**
    *   **Investimento produtivo agrícola – Mode

**Citações**: 3

### gemini-2.5-flash / ipdj-01 (9.4/10)

**Pergunta**: No programa IPDJ-apoio-e-financiamento-jovem, qual o tipo de apoio e como aceder/submeter pedido?

**Resposta**:

Não encontrei essa informação nas fontes disponíveis para este filtro. As fontes indicam a existência do programa "IPDJ-apoio-e-financiamento-jovem" e o seu status como "Aberto", com o URL `https://ipdj.gov.pt/apoio-e-financiamento-jovem`. No entanto, não detalham o tipo específico de apoio oferecido nem o processo para aceder ou submeter um pedido.

**Próximos passos práticos para o consultor:**

1.  **Aceder ao URL oficial:** Recomenda-se visitar diretamente o website `https://ipdj.gov.pt/apoio-e-financiamento-jovem` para obter informações detalhadas sobre o tipo de apoio e os procedimentos de candidatura.
2.  **Contactar o IPDJ:** Caso a informação não seja clara no website, o consultor poderá contactar diretamente o IPDJ através dos contactos disponíveis no portal para esclarecer dúvidas sobre o programa.

**Citações**: 5

### gemini-2.5-pro / crea-01 (9.4/10)

**Pergunta**: Na call CREA-CULT-2025-COOP-UA-1, qual é o deadline e qual o tema do aviso?

**Resposta**:

Com base na informação disponível, aqui estão os detalhes sobre a call **CREA-CULT-2025-COOP-UA-1**:

*   **Tema do Aviso:** O título do aviso é "ZMINA: Finanțarea semințelor de reziliență".
*   **Deadline:** A data de fecho para submissão de candidaturas é **5 de dezembro de 2025**.

Este aviso insere-se no programa Europa Criativa e a sua data de abertura está prevista para 6 de outubro de 2025.

### Próximos Passos (Checklist para o Consultor)

1.  **Análise de Elegibilidade:** Validar se o perfil do seu cliente e a natureza do projeto se enquadram nos objetivos específicos do

**Citações**: 4

