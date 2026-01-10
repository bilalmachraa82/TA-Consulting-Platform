# Lógica de Classificação de Ficheiros - Candidaturas TA Consulting

## Visão Geral

Este documento explica a lógica utilizada para classificar e priorizar os 46.305 ficheiros do arquivo de candidaturas da TA Consulting.

---

## 1. Estrutura do Arquivo

### Hierarquia de Pastas
```
Candidaturas/
├── [PROGRAMA]           → PRR, P2030, P2020, PDR2020, etc.
│   ├── [SUB-PROGRAMA]   → VOUCHERS, IA nas PME, etc.
│   │   └── [CLIENTE]    → Nome da empresa/entidade
│   │       └── [DOCS]   → Ficheiros da candidatura
```

### Programas Identificados
| Programa | Descrição | Ficheiros |
|----------|-----------|-----------|
| **PRR** | Plano de Recuperação e Resiliência | 29.077 |
| **P2030** | Portugal 2030 | 6.729 |
| **PDR2020** | Programa Desenvolvimento Rural | 4.844 |
| **P2020** | Portugal 2020 | 3.177 |
| **IPDJ** | Instituto Português Desporto e Juventude | 777 |
| **SIFIDE** | Incentivos Fiscais I&D | ~500 |
| **PEPAC** | Plano Estratégico PAC | ~300 |
| **PARES** | Programa Apoio Rede Equipamentos Sociais | ~200 |
| **TURISMO PORTUGAL** | Fundos de Turismo | ~100 |
| **Europeus** | H2020 e outros europeus | ~50 |

---

## 2. Lógica de Priorização

### ALTA PRIORIDADE (Extrair para RAG)
Ficheiros que contêm **conhecimento reutilizável** - linguagem aprovada, estruturas, argumentos.

| Padrão de Nome | Tipo | Razão |
|----------------|------|-------|
| `memoria*descrit*` | Memória Descritiva | Núcleo da candidatura, linguagem aprovada |
| `proposta*tecnic*` | Proposta Técnica | Argumentação técnica aprovada |
| `anexo*tecnic*` | Anexo Técnico | Detalhes técnicos aprovados |
| `plano*neg*` | Plano de Negócios | Projeções e estratégias aprovadas |
| `template*` | Template | Estruturas base reutilizáveis |
| `simulador*` | Simulador | Modelos financeiros aprovados |
| `formulario*` | Formulário | Estruturas de candidatura |

**Regex utilizado:**
```javascript
const HIGH_VALUE_PATTERNS = [
  /memoria.*descrit/i,
  /proposta.*tecnic/i,
  /anexo.*tecnic/i,
  /plano.*neg[oó]c/i,
  /template/i,
  /simulador/i,
  /formul[aá]rio/i,
];
```

### MÉDIA PRIORIDADE
Ficheiros que **podem** ter valor mas não são prioritários.

| Critério | Razão |
|----------|-------|
| `.docx` sem pattern específico | Podem ser textos úteis |
| `.xlsx` sem pattern específico | Podem ser cálculos úteis |
| Orçamentos, cronogramas, relatórios | Referência estrutural |

### BAIXA PRIORIDADE (Ignorar para RAG)
Ficheiros **específicos ao cliente** - não generalizáveis.

| Padrão de Nome | Tipo | Razão para Ignorar |
|----------------|------|-------------------|
| `certid*` | Certidões | Específico do cliente |
| `fatura*` | Faturas | Financeiro específico |
| `recibo*` | Recibos | Financeiro específico |
| `comprovativ*` | Comprovativos | Específico do cliente |
| `declara*` | Declarações | Documentos legais específicos |
| `nota*liquida*` | Notas de Liquidação | Financeiro específico |
| `balan*` | Balanços | Financeiro específico |
| `extrato*` | Extratos | Financeiro específico |

**Extensões automaticamente BAIXA:**
- Imagens: `.jpg`, `.jpeg`, `.png`, `.heic`, `.gif`, `.bmp`
- CAD: `.dwg`, `.dwf`, `.dwfx`
- Arquivos: `.rar`, `.7z`

---

## 3. Tratamento de Duplicados

### Séries de ZIPs
O arquivo contém **3 séries** de ZIPs (backups em datas diferentes):

| Série | Data | ZIPs | Ficheiros |
|-------|------|------|-----------|
| 20251214T132446Z | 14 Dez 2024 | 8 | ~15.300 |
| 20251214T133130Z | 14 Dez 2024 | 7 | ~15.300 |
| 20251227T211305Z | **27 Dez 2024** | 6 | ~14.900 |

### Estratégia de Deduplicação
1. **Identificar duplicados** por: `path_completo + tamanho_bytes`
2. **Preferir série mais recente** (20251227)
3. **Fallback** para série antiga se ficheiro não existir na nova
4. **Resultado**: 16.124 ficheiros únicos (redução de 65%)

---

## 4. O Que NÃO É Perdido

### Garantias
1. ✅ **Todos os ficheiros são inventariados** - mesmo os de baixa prioridade
2. ✅ **Excel completo disponível** - `candidaturas_inventario.xlsx` tem os 46.305
3. ✅ **Duplicados preservados em backup** - série antiga mantida
4. ✅ **Prioridade pode ser revista** - alterar manualmente no Excel

### Como Recuperar Ficheiro "Ignorado"
1. Abrir `candidaturas_inventario_dedup.xlsx`
2. Filtrar pela coluna `extrair = FALSE`
3. Encontrar o ficheiro desejado
4. Marcar manualmente `extrair = TRUE`
5. Re-executar extração

---

## 5. Estatísticas Finais

| Categoria | Quantidade | % do Total |
|-----------|------------|------------|
| **Bruto (todos os ZIPs)** | 46.305 | 100% |
| **Únicos após dedup** | 16.124 | 35% |
| **Alta prioridade** | 224 | 0.5% |
| **Média prioridade** | 3.162 | 6.8% |
| **Baixa prioridade** | 12.738 | 27.5% |
| **Duplicados eliminados** | 30.181 | 65% |

---

## 6. Recomendações

> [!IMPORTANT]
> ### Para Garantir Nada Importante é Perdido
> 
> 1. **Manter TODOS os ZIPs** - não apagar séries antigas
> 2. **Rever "Alta Prioridade"** manualmente no Excel antes de processar
> 3. **Adicionar patterns** se descobrires tipos de documentos valiosos não cobertos
> 4. **Consultar "Em Falta"** no ficheiro de comparação para série nova

### Patterns a Adicionar (Sugestão)
Se encontrares padrões valiosos não cobertos, adiciona em `generate-candidaturas-inventory.ts`:

```javascript
// Exemplos de patterns adicionais
/business.*plan/i,
/analise.*merito/i,
/justifica/i,
/fundamenta/i,
```

---

## 7. Ficheiros Gerados

| Ficheiro | Conteúdo |
|----------|----------|
| `candidaturas_inventario.xlsx` | Inventário completo (46.305 ficheiros) |
| `candidaturas_inventario_dedup.xlsx` | Após deduplicação (16.124 únicos) |
| `candidaturas_comparacao.xlsx` | Diferenças entre séries |
| `candidaturas_processadas/` | Ficheiros extraídos (estrutura organizada) |

---

## 8. Scripts Disponíveis

```bash
# Regenerar inventário completo
npx tsx scripts/generate-candidaturas-inventory.ts

# Analisar duplicados
npx tsx scripts/dedup-candidaturas.ts

# Comparar séries
npx tsx scripts/compare-zip-series.ts

# Extrair ficheiros de alta prioridade
npx tsx scripts/extract-high-value.ts
```
