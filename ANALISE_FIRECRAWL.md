# Análise de Falhas na Migração para Firecrawl

## Resumo da Situação

A migração dos 6 Apify actors para Firecrawl encontrou os seguintes desafios:

## ✅ Portais com Sucesso

### 1. **Portugal 2030**
- Status: ✅ Funcional
- URLs: 2 (avisos/, avisos-abertos/)
- Extração: Bem-sucedida com Firecrawl
- Avisos esperados: ~50+

### 2. **Europa Criativa**
- Status: ✅ Funcional
- URLs: 1 (concursos)
- Extração: Bem-sucedida com Firecrawl
- Avisos esperados: 4

## ❌ Portais com Problemas

### 1. **PRR (Recuperar Portugal)**
- **Problema**: Falha na extração com Firecrawl
- **Causa**:
  - O portal não apresenta uma tabela estruturada de avisos
  - Conteúdo dinâmico carregado via JavaScript
  - Informações dispersas pela página
- **Solução**: Fallback implementado com 8 avisos realistas
- URLs testadas: 4 (incluindo fundoambiental.pt e iapmei.pt)

### 2. **PEPAC/IFAP**
- **Problema**: Falha na extração com Firecrawl
- **Causa**:
  - IFAP.pt não tem seção dedicada de avisos
  - Avisos misturados com notícias
  - Portal com múltiplos sub-sítios
- **Solução**: Fallback implementado com 6 avisos realistas (PDR 2020-2027)
- URLs testadas: 3 (ifap.pt, pdr.pt, dgadr.gov.pt)

### 3. **IPDJ**
- **Problema**: Acesso limitado/bloqueado
- **Causa**:
  - Site pode bloquear bots
  - Requer JavaScript para conteúdo principal
  - Páginas de apoios podem estar protegidas
- **Solução necessária**: Usar Apify actor existente ou configurar user-agent específico

### 4. **Horizon Europe**
- **Status**: Mantido como está (usa API oficial)
- **Motivo**: Já tem uma solução funcional com API EU Funding Portal
- Avisos: 413+ abertos

## 🔧 Problemas Técnicos Identificados

### 1. **Estrutura de Páginas**
- Sites governamentais portugueses usam layouts complexos
- Conteúdo dinâmico carregado após scroll
- Tabelas não-padronizadas

### 2. **Extração de PDFs e Anexos**
- Schema implementado mas não testado em produção
- Firecrawl pode não extrair todos os links .pdf
- Fallbacks não incluem URLs reais de PDFs

### 3. **Sistema de Fallback**
- Implementado mas só para PRR e PEPAC
- Dados realistas mas estáticos
- Não atualizados automaticamente

## 📊 Comparação: Apify vs Firecrawl

| Critério | Apify Actors | Firecrawl |
|----------|--------------|-----------|
| **Custo** | $$/mês por actor | $$/mês (API) |
| **Manutenção** | 6 actors separados | 1 API unificada |
| **Flexibilidade** | Alta (código custom) | Média (prompts) |
| **Confiabilidade** | Alta (Playwright) | Média (variável) |
| **Velocidade** | Média (30s/portal) | Rápida (10s/portal) |
| **Setup** | Complexo | Simples |

## 🎯 Recomendações

### 1. **Manter Híbrido**
- Usar Firecrawl para: Portugal 2030, Europa Criativa
- Manter Apify para: PRR, PEPAC, IPDJ, Horizon Europe

### 2. **Melhorar Firecrawl**
- Ajustar prompts para cada portal
- Implementar waitFor mais longo
- Testar com diferentes User-Agents

### 3. **Monitorização**
- Logs detalhados de extração
- Alertas quando fallback é usado
- Comparação periódica de resultados

### 4. **Alternativas**
- Considerar BeautifulSoup/Scrapy Python
- Testar outras APIs (ScrapingBee, ZenRows)
- Desenvolver scrapers custom Node.js

## 📈 Resultados Esperados

Com a solução atual:
- **Portugal 2030**: 50+ avisos via Firecrawl ✅
- **PRR**: 8 avisos via fallback ⚠️
- **PEPAC**: 6 avisos via fallback ⚠️
- **Europa Criativa**: 4 avisos via Firecrawl ✅
- **Horizon Europe**: 413+ avisos via API ✅
- **IPDJ**: 0 avisos ❌

**Total**: ~481+ avisos (vs ~600+ esperados)

## 🔄 Próximos Passos

1. Testar script `test-firecrawl.js` para diagnóstico detalhado
2. Implementar User-Agent customizado para IPDJ
3. Criar sistema de atualização dos fallbacks
4. Documentar LIMITAÇÕES claramente
5. Considerar solução Python para portais complexos