"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[2049],{35974:function(e,a,o){o.d(a,{C:function(){return n}});var i=o(57437);o(2265);var t=o(77712),r=o(94508);let s=(0,t.j)("inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",{variants:{variant:{default:"border-transparent bg-primary text-primary-foreground shadow hover:bg-primary/80",secondary:"border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",destructive:"border-transparent bg-destructive text-destructive-foreground shadow hover:bg-destructive/80",outline:"text-foreground"}},defaultVariants:{variant:"default"}});function n({className:e,variant:a,...o}){return(0,i.jsx)("div",{className:(0,r.cn)(s({variant:a}),e),...o})}},62869:function(e,a,o){o.d(a,{z:function(){return c}});var i=o(57437),t=o(2265),r=o(37053),s=o(77712),n=o(94508);let d=(0,s.j)("inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",{variants:{variant:{default:"bg-primary text-primary-foreground shadow hover:bg-primary/90",destructive:"bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",outline:"border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",secondary:"bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",ghost:"hover:bg-accent hover:text-accent-foreground",link:"text-primary underline-offset-4 hover:underline"},size:{default:"h-9 px-4 py-2",sm:"h-8 rounded-md px-3 text-xs",lg:"h-10 rounded-md px-8",icon:"h-9 w-9"}},defaultVariants:{variant:"default",size:"default"}}),c=t.forwardRef(({className:e,variant:a,size:o,asChild:t=!1,...s},c)=>{let l=t?r.g7:"button";return(0,i.jsx)(l,{className:(0,n.cn)(d({variant:a,size:o,className:e})),ref:c,...s})});c.displayName="Button"},66070:function(e,a,o){o.d(a,{Ol:function(){return n},SZ:function(){return c},Zb:function(){return s},aY:function(){return l},eW:function(){return m},ll:function(){return d}});var i=o(57437),t=o(2265),r=o(94508);let s=t.forwardRef(({className:e,...a},o)=>(0,i.jsx)("div",{ref:o,className:(0,r.cn)("rounded-xl border bg-card text-card-foreground shadow",e),...a}));s.displayName="Card";let n=t.forwardRef(({className:e,...a},o)=>(0,i.jsx)("div",{ref:o,className:(0,r.cn)("flex flex-col space-y-1.5 p-6",e),...a}));n.displayName="CardHeader";let d=t.forwardRef(({className:e,...a},o)=>(0,i.jsx)("h3",{ref:o,className:(0,r.cn)("font-semibold leading-none tracking-tight",e),...a}));d.displayName="CardTitle";let c=t.forwardRef(({className:e,...a},o)=>(0,i.jsx)("p",{ref:o,className:(0,r.cn)("text-sm text-muted-foreground",e),...a}));c.displayName="CardDescription";let l=t.forwardRef(({className:e,...a},o)=>(0,i.jsx)("div",{ref:o,className:(0,r.cn)("p-6 pt-0",e),...a}));l.displayName="CardContent";let m=t.forwardRef(({className:e,...a},o)=>(0,i.jsx)("div",{ref:o,className:(0,r.cn)("flex items-center p-6 pt-0",e),...a}));m.displayName="CardFooter"},76818:function(e,a,o){o.d(a,{g:function(){return s}});var i=o(57437),t=o(2265),r=o(94508);let s=t.forwardRef(({className:e,...a},o)=>(0,i.jsx)("textarea",{className:(0,r.cn)("flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",e),ref:o,...a}));s.displayName="Textarea"},81428:function(e,a,o){o.d(a,{Qv:function(){return s},uw:function(){return r}});let i={caracterizacao_empresa:{id:"caracterizacao_empresa",title:"Caracteriza\xe7\xe3o da Empresa",description:"Apresenta\xe7\xe3o do promotor: historial, capacidade t\xe9cnica e recursos",weight:10,maxTokens:1500,requiredContext:["empresa","documentos"],promptTemplate:`
Elabora a caracteriza\xe7\xe3o da empresa promotora para uma candidatura a fundos europeus.

EMPRESA:
- Nome: {{empresa_nome}}
- NIPC: {{empresa_nipc}}
- CAE: {{empresa_cae}}
- Setor: {{empresa_setor}}
- Dimens\xe3o: {{empresa_dimensao}}
- Regi\xe3o: {{empresa_regiao}}

ESTRUTURA OBRIGAT\xd3RIA:
1. Historial e Evolu\xe7\xe3o (breve)
2. Atividade Principal
3. Recursos Humanos (quantidade, qualifica\xe7\xf5es)
4. Capacidade T\xe9cnica e Tecnol\xf3gica
5. Posicionamento no Mercado
6. Principais Clientes/Mercados

INSTRU\xc7\xd5ES:
- Tom profissional e factual
- Destacar compet\xeancias relevantes para o projeto
- M\xe1ximo 1 p\xe1gina
`,suggestedStructure:["Historial","Atividade Principal","Recursos Humanos","Capacidade T\xe9cnica","Mercados"],validationHints:["Verificar se dados est\xe3o atualizados","Confirmar n\xba trabalhadores com IES","Validar CAE com certid\xe3o permanente"]},descricao_projeto:{id:"descricao_projeto",title:"Descri\xe7\xe3o do Projeto",description:"Vis\xe3o geral do investimento, enquadramento e objetivos",weight:15,maxTokens:2e3,requiredContext:["empresa","aviso","historico"],promptTemplate:`
Escreve a descri\xe7\xe3o do projeto para a candidatura ao {{aviso_nome}}.

CONTEXTO:
- Empresa: {{empresa_nome}}
- Setor: {{empresa_setor}}
- Investimento previsto: {{investimento_total}}€

ESTRUTURA OBRIGAT\xd3RIA:
1. Enquadramento Estrat\xe9gico
   - Porqu\xea este projeto agora?
   - Como se alinha com a estrat\xe9gia da empresa?
   
2. Descri\xe7\xe3o do Investimento
   - O que vai ser feito concretamente?
   - Que equipamentos/tecnologias ser\xe3o adquiridos?
   
3. Objetivos Principais
   - Objetivos quantitativos (vendas, emprego, exporta\xe7\xf5es)
   - Objetivos qualitativos (competitividade, inova\xe7\xe3o)
   
4. Resultados Esperados
   - Impacto no neg\xf3cio
   - Prazo de implementa\xe7\xe3o

INSTRU\xc7\xd5ES:
- Alinhar com crit\xe9rios espec\xedficos do aviso
- Usar linguagem t\xe9cnica mas acess\xedvel
- Ser espec\xedfico e quantitativo quando poss\xedvel
`,suggestedStructure:["Enquadramento Estrat\xe9gico","Descri\xe7\xe3o do Investimento","Objetivos do Projeto","Resultados Esperados"],validationHints:["Verificar alinhamento com crit\xe9rios do aviso","Confirmar valores de investimento","Validar objetivos s\xe3o realistas"]},componente_inovacao:{id:"componente_inovacao",title:"Componente de Inova\xe7\xe3o",description:"Descri\xe7\xe3o do car\xe1cter inovador e diferenciador do projeto",weight:20,maxTokens:2e3,requiredContext:["empresa","aviso","rag_candidaturas"],promptTemplate:`
Descreve a componente de inova\xe7\xe3o do projeto para candidatura a fundos.

CONTEXTO:
- Projeto: {{projeto_nome}}
- Tipo de inova\xe7\xe3o pretendida: {{projeto_tipo_inovacao}}

ESTRUTURA OBRIGAT\xd3RIA:
1. Natureza da Inova\xe7\xe3o
   - Produto novo ou melhorado?
   - Processo novo ou melhorado?
   - Inova\xe7\xe3o organizacional?
   
2. Estado da Arte
   - O que existe atualmente no mercado?
   - Quais s\xe3o as limita\xe7\xf5es das solu\xe7\xf5es atuais?
   
3. Proposta Inovadora
   - Em que consiste a inova\xe7\xe3o?
   - Qual o car\xe1cter diferenciador?
   
4. Vantagem Competitiva
   - Que benef\xedcios traz vs concorr\xeancia?
   - \xc9 replic\xe1vel ou defens\xe1vel?
   
5. Propriedade Intelectual (se aplic\xe1vel)
   - Patentes existentes ou a registar
   - Segredos industriais

INSTRU\xc7\xd5ES:
- Fundamentar com dados/estudos quando poss\xedvel
- Comparar com concorr\xeancia/alternativas
- Evitar generalidades - ser espec\xedfico
`,suggestedStructure:["Natureza da Inova\xe7\xe3o","Estado da Arte","Proposta Diferenciadora","Vantagem Competitiva"],validationHints:["Verificar se inova\xe7\xe3o \xe9 real ou incremental","Confirmar n\xe3o existe igual no mercado","Validar dados de concorr\xeancia"]},analise_mercado:{id:"analise_mercado",title:"An\xe1lise de Mercado",description:"An\xe1lise do mercado-alvo, dimens\xe3o e estrat\xe9gia comercial",weight:15,maxTokens:1800,requiredContext:["empresa","documentos"],promptTemplate:`
Elabora a an\xe1lise de mercado para o projeto.

CONTEXTO:
- Setor: {{empresa_setor}}
- Mercados atuais: {{empresa_mercados}}

ESTRUTURA OBRIGAT\xd3RIA:
1. Caracteriza\xe7\xe3o do Mercado
   - Dimens\xe3o (volume, valor)
   - Tend\xeancias de crescimento
   - Principais players
   
2. Mercado-Alvo
   - Segmentos target
   - Perfil de cliente
   - Geografia (nacional/exporta\xe7\xe3o)
   
3. An\xe1lise Competitiva
   - Principais concorrentes
   - Posicionamento relativo
   - Vantagens competitivas
   
4. Estrat\xe9gia de Entrada/Crescimento
   - Canais de distribui\xe7\xe3o
   - Pricing
   - Plano de marketing

INSTRU\xc7\xd5ES:
- Incluir dados quantitativos (fontes: INE, Eurostat, estudos setor)
- Ser realista nas proje\xe7\xf5es
- Identificar riscos e como mitigar
`,suggestedStructure:["Dimens\xe3o do Mercado","Segmentos Target","An\xe1lise Competitiva","Estrat\xe9gia Comercial"],validationHints:["Verificar fontes dos dados","Confirmar proje\xe7\xf5es s\xe3o realistas","Validar conhecimento do mercado"]},equipa_tecnica:{id:"equipa_tecnica",title:"Equipa T\xe9cnica",description:"Apresenta\xe7\xe3o da equipa respons\xe1vel pelo projeto",weight:10,maxTokens:1500,requiredContext:["empresa","documentos"],promptTemplate:`
Descreve a equipa t\xe9cnica respons\xe1vel pela execu\xe7\xe3o do projeto.

ESTRUTURA OBRIGAT\xd3RIA:
1. Coordenador/Respons\xe1vel do Projeto
   - Nome e fun\xe7\xe3o
   - Qualifica\xe7\xf5es
   - Experi\xeancia relevante
   
2. Equipa T\xe9cnica
   - Perfis e compet\xeancias
   - Dedica\xe7\xe3o ao projeto (%)
   
3. Recursos a Contratar (se aplic\xe1vel)
   - Perfis necess\xe1rios
   - Justifica\xe7\xe3o

INSTRU\xc7\xd5ES:
- Destacar experi\xeancia relevante para o projeto
- Incluir forma\xe7\xe3o acad\xe9mica e profissional
- Quantificar dedica\xe7\xe3o (horas/m\xeas ou %)
`,suggestedStructure:["Coordenador do Projeto","Equipa T\xe9cnica Existente","Contrata\xe7\xf5es Previstas"],validationHints:["Confirmar pessoas existem na empresa","Verificar CVs est\xe3o atualizados","Validar disponibilidade real"]},plano_trabalhos:{id:"plano_trabalhos",title:"Plano de Trabalhos e Cronograma",description:"Estrutura temporal da execu\xe7\xe3o do projeto",weight:10,maxTokens:1500,requiredContext:["aviso"],promptTemplate:`
Elabora o plano de trabalhos para execu\xe7\xe3o do projeto em {{duracao_meses}} meses.

ESTRUTURA OBRIGAT\xd3RIA:
1. Fases/Etapas do Projeto
   Para cada fase:
   - Designa\xe7\xe3o
   - Dura\xe7\xe3o (m\xeas in\xedcio - m\xeas fim)
   - Atividades principais
   - Deliverables/Outputs
   - Respons\xe1vel

2. Marcos Principais (Milestones)
   - M\xeas X: [Marco]

3. Depend\xeancias
   - Que fases dependem de outras?

FORMATO SUGERIDO:
Fase 1: [Nome] (M1-M3)
- Atividade 1.1: ...
- Atividade 1.2: ...
- Output: ...

INSTRU\xc7\xd5ES:
- Ser realista nos prazos
- Incluir todas as atividades eleg\xedveis
- Considerar lead times de aquisi\xe7\xf5es
`,suggestedStructure:["Fase 1: Prepara\xe7\xe3o","Fase 2: Aquisi\xe7\xe3o","Fase 3: Implementa\xe7\xe3o","Fase 4: Testes","Fase 5: Comercializa\xe7\xe3o"],validationHints:["Verificar se prazos s\xe3o realistas","Confirmar alinhamento com elegibilidade","Validar depend\xeancias fazem sentido"]},objetivos_smart:{id:"objetivos_smart",title:"Objetivos e Metas (SMART)",description:"Defini\xe7\xe3o quantitativa dos objetivos do projeto",weight:10,maxTokens:1200,requiredContext:["empresa","aviso"],promptTemplate:`
Define objetivos SMART para o projeto.

SMART = Espec\xedfico, Mensur\xe1vel, Ating\xedvel, Relevante, Temporal

ESTRUTURA OBRIGAT\xd3RIA:
Para cada objetivo (3-5 no total):
- Objetivo: [Descri\xe7\xe3o]
- Indicador/M\xe9trica: [Como medir]
- Meta: [Valor quantitativo]
- Prazo: [Quando atingir]
- Baseline: [Valor atual]

EXEMPLO:
Objetivo: Aumentar volume de exporta\xe7\xf5es
Indicador: % do VN proveniente de exporta\xe7\xf5es
Baseline: 15%
Meta: 30%
Prazo: 24 meses ap\xf3s conclus\xe3o do projeto

INSTRU\xc7\xd5ES:
- Alinhar com crit\xe9rios de m\xe9rito do aviso
- Ser ambicioso mas realista
- Incluir m\xe9tricas de emprego, VN, exporta\xe7\xf5es
`,suggestedStructure:["Objetivos de Crescimento","Objetivos de Emprego","Objetivos de Internacionaliza\xe7\xe3o","Objetivos de Inova\xe7\xe3o"],validationHints:["Verificar baseline est\xe1 correto","Confirmar metas s\xe3o ating\xedveis","Validar alinhamento com crit\xe9rios"]},investimento_orcamento:{id:"investimento_orcamento",title:"Investimento e Or\xe7amento",description:"Detalhamento do investimento por rubricas eleg\xedveis",weight:10,maxTokens:1500,requiredContext:["aviso","documentos"],promptTemplate:`
Estrutura o plano de investimentos do projeto.

INVESTIMENTO TOTAL: {{investimento_total}}€

RUBRICAS T\xcdPICAS (adaptar ao aviso):
1. Constru\xe7\xe3o/Obras
2. Equipamento Produtivo
3. Equipamento Administrativo
4. Software e Licen\xe7as
5. Propriedade Industrial
6. Servi\xe7os de Consultoria
7. Outras despesas eleg\xedveis

PARA CADA RUBRICA:
- Designa\xe7\xe3o
- Valor (€)
- Justifica\xe7\xe3o/Necessidade

INSTRU\xc7\xd5ES:
- Verificar elegibilidade de cada rubrica no aviso
- Incluir apenas despesas diretamente relacionadas
- Ter or\xe7amentos de suporte quando poss\xedvel
`,suggestedStructure:["Investimentos Corp\xf3reos","Investimentos Incorp\xf3reos","Despesas de Funcionamento","Resumo por Rubrica"],validationHints:["Confirmar rubricas s\xe3o eleg\xedveis","Verificar or\xe7amentos de suporte","Validar razoabilidade dos valores"]},analise_financeira:{id:"analise_financeira",title:"An\xe1lise Financeira",description:"Viabilidade econ\xf3mico-financeira do projeto (TIR, VAL, Payback)",weight:15,maxTokens:1500,requiredContext:["empresa","documentos"],promptTemplate:`
Elabora a an\xe1lise de viabilidade financeira do projeto.

INVESTIMENTO: {{investimento_total}}€
INCENTIVO ESPERADO: {{incentivo_esperado}}€

INDICADORES OBRIGAT\xd3RIOS:
1. VAL (Valor Atual L\xedquido)
   - Taxa de desconto utilizada
   - Valor calculado
   - Interpreta\xe7\xe3o

2. TIR (Taxa Interna de Rentabilidade)
   - Valor calculado
   - Compara\xe7\xe3o com custo de capital

3. Payback Period
   - Per\xedodo de recupera\xe7\xe3o do investimento

4. Proje\xe7\xf5es Financeiras (5 anos)
   - Volume de Neg\xf3cios
   - EBITDA
   - Resultado L\xedquido

5. Fontes de Financiamento
   - Incentivo n\xe3o reembols\xe1vel
   - Capitais pr\xf3prios
   - Financiamento banc\xe1rio (se aplic\xe1vel)

INSTRU\xc7\xd5ES:
- Ser conservador nas proje\xe7\xf5es
- Justificar pressupostos
- Incluir an\xe1lise de sensibilidade se relevante
`,suggestedStructure:["Pressupostos","Proje\xe7\xf5es de Receitas","Proje\xe7\xf5es de Custos","Indicadores (VAL, TIR, Payback)","Fontes de Financiamento"],validationHints:["Verificar c\xe1lculos de VAL/TIR","Confirmar pressupostos s\xe3o realistas","Validar capacidade de capitais pr\xf3prios"]},sustentabilidade:{id:"sustentabilidade",title:"Impacto e Sustentabilidade",description:"Contributo para sustentabilidade e princ\xedpios DNSH",weight:10,maxTokens:1200,requiredContext:["empresa","aviso"],promptTemplate:`
Descreve o contributo do projeto para a sustentabilidade.

PRINC\xcdPIOS DNSH (Do No Significant Harm):
O projeto n\xe3o pode prejudicar significativamente:
1. Mitiga\xe7\xe3o das altera\xe7\xf5es clim\xe1ticas
2. Adapta\xe7\xe3o \xe0s altera\xe7\xf5es clim\xe1ticas
3. Utiliza\xe7\xe3o sustent\xe1vel da \xe1gua
4. Economia circular
5. Preven\xe7\xe3o e controlo da polui\xe7\xe3o
6. Biodiversidade e ecossistemas

ESTRUTURA OBRIGAT\xd3RIA:
1. Contributo Ambiental
   - Efici\xeancia energ\xe9tica
   - Redu\xe7\xe3o de emiss\xf5es
   - Economia circular
   
2. Contributo Social
   - Cria\xe7\xe3o de emprego
   - Igualdade de g\xe9nero
   - Inclus\xe3o
   
3. Contributo Econ\xf3mico
   - Competitividade regional
   - Cadeia de valor

4. Declara\xe7\xe3o DNSH
   - Confirmar cumprimento dos 6 princ\xedpios

INSTRU\xc7\xd5ES:
- Ser espec\xedfico sobre impactos positivos
- Quantificar quando poss\xedvel (kWh poupados, emiss\xf5es evitadas)
- N\xe3o fazer claims sem fundamento
`,suggestedStructure:["Impacto Ambiental","Impacto Social","Impacto Econ\xf3mico","Conformidade DNSH"],validationHints:["Verificar claims s\xe3o fundamentados","Confirmar cumprimento DNSH","Validar m\xe9tricas ambientais"]},estado_arte:{id:"estado_arte",title:"Estado da Arte",description:"An\xe1lise do conhecimento e tecnologia existente (para I&D)",weight:15,maxTokens:2e3,requiredContext:["aviso","rag_candidaturas"],promptTemplate:`
Elabora o estado da arte para o projeto de I&D.

ESTRUTURA OBRIGAT\xd3RIA:
1. Revis\xe3o Bibliogr\xe1fica
   - Principais publica\xe7\xf5es/estudos na \xe1rea
   - Tend\xeancias tecnol\xf3gicas
   
2. Solu\xe7\xf5es Existentes
   - O que existe no mercado?
   - Quais as limita\xe7\xf5es?
   
3. Benchmarking Tecnol\xf3gico
   - Tecnologias concorrentes
   - Compara\xe7\xe3o de caracter\xedsticas
   
4. Gaps Identificados
   - O que falta no estado atual?
   - Que problema pretendemos resolver?
   
5. Contributo do Projeto
   - Como avan\xe7a o conhecimento?
   - Que novidade traz?

INSTRU\xc7\xd5ES:
- Citar fontes (artigos, patentes, estudos)
- Ser objetivo na an\xe1lise
- Demonstrar conhecimento profundo da \xe1rea
`,suggestedStructure:["Revis\xe3o da Literatura","Tecnologias Existentes","Gaps e Oportunidades","Contributo Cient\xedfico"],validationHints:["Verificar fontes bibliogr\xe1ficas","Confirmar gaps s\xe3o reais","Validar contributo \xe9 original"]},diagnostico_digital:{id:"diagnostico_digital",title:"Diagn\xf3stico de Maturidade Digital",description:"Avalia\xe7\xe3o do estado atual de digitaliza\xe7\xe3o (para PRR)",weight:20,maxTokens:1500,requiredContext:["empresa","documentos"],promptTemplate:`
Elabora o diagn\xf3stico de maturidade digital da empresa.

DIMENS\xd5ES A AVALIAR:
1. Infraestrutura Tecnol\xf3gica
   - Hardware/Rede
   - Cloud
   - Ciberseguran\xe7a
   
2. Sistemas de Informa\xe7\xe3o
   - ERP
   - CRM
   - Business Intelligence
   
3. Processos Digitais
   - % processos digitalizados
   - Automa\xe7\xe3o
   
4. Compet\xeancias Digitais
   - N\xedvel da equipa
   - Forma\xe7\xe3o existente
   
5. Presen\xe7a Digital
   - Website
   - E-commerce
   - Redes sociais

SCORE DE MATURIDADE (1-5 por dimens\xe3o):
1 = Inexistente
2 = B\xe1sico
3 = Interm\xe9dio
4 = Avan\xe7ado
5 = Otimizado

INSTRU\xc7\xd5ES:
- Ser honesto na autoavalia\xe7\xe3o
- Identificar gaps priorit\xe1rios
- Fundamentar com evid\xeancias
`,suggestedStructure:["Infraestrutura Atual","Sistemas e Processos","Compet\xeancias","Score de Maturidade","Gaps Priorit\xe1rios"],validationHints:["Verificar score \xe9 realista","Confirmar gaps identificados","Validar com evid\xeancias"]},plano_digitalizacao:{id:"plano_digitalizacao",title:"Plano de Digitaliza\xe7\xe3o",description:"Estrat\xe9gia e a\xe7\xf5es de transforma\xe7\xe3o digital (para PRR)",weight:30,maxTokens:2e3,requiredContext:["empresa","aviso"],promptTemplate:`
Elabora o plano de digitaliza\xe7\xe3o para o projeto PRR.

ESTRUTURA OBRIGAT\xd3RIA:
1. Objetivos de Digitaliza\xe7\xe3o
   - Onde queremos estar em 2 anos?
   - Que n\xedvel de maturidade pretendemos?
   
2. A\xe7\xf5es de Transforma\xe7\xe3o
   Para cada a\xe7\xe3o:
   - Descri\xe7\xe3o
   - Tecnologia a implementar
   - Investimento
   - Prazo
   
3. Tecnologias a Implementar
   - Nome/tipo
   - Fornecedor (se conhecido)
   - Justifica\xe7\xe3o
   
4. KPIs de Sucesso
   - Como medir o sucesso?
   - Metas quantitativas
   
5. Riscos e Mitiga\xe7\xe3o
   - Principais riscos
   - Plano de mitiga\xe7\xe3o

INSTRU\xc7\xd5ES:
- Ser espec\xedfico nas tecnologias
- Alinhar com diagn\xf3stico (resolver gaps)
- Incluir forma\xe7\xe3o se necess\xe1rio
`,suggestedStructure:["Vis\xe3o Digital","A\xe7\xf5es Priorit\xe1rias","Roadmap de Implementa\xe7\xe3o","KPIs","Gest\xe3o de Riscos"],validationHints:["Verificar alinha com diagn\xf3stico","Confirmar tecnologias s\xe3o eleg\xedveis","Validar cronograma \xe9 realista"]}},t={"pt2030-inovacao":{id:"pt2030-inovacao",name:"PT2030 SI Inova\xe7\xe3o Produtiva",portal:"PT2030",description:"Template para candidaturas ao Sistema de Incentivos \xe0 Inova\xe7\xe3o Produtiva",totalWeight:100,requiredDocs:["Certid\xe3o Permanente","IES/Modelo 22 (3 anos)","Declara\xe7\xe3o Minimis","Declara\xe7\xe3o DNSH","Or\xe7amentos (3 por item)"],sections:[i.caracterizacao_empresa,i.descricao_projeto,i.componente_inovacao,i.analise_mercado,i.objetivos_smart,i.plano_trabalhos,i.investimento_orcamento,i.sustentabilidade]},"pt2030-id":{id:"pt2030-id",name:"PT2030 I&D Empresarial",portal:"PT2030",description:"Template para candidaturas a projetos de Investiga\xe7\xe3o e Desenvolvimento",totalWeight:100,requiredDocs:["Certid\xe3o Permanente","CVs da equipa t\xe9cnica","Cartas compromisso parceiros","Declara\xe7\xe3o DNSH"],sections:[i.caracterizacao_empresa,i.estado_arte,i.descricao_projeto,i.componente_inovacao,i.equipa_tecnica,i.plano_trabalhos,i.objetivos_smart,i.analise_financeira,i.sustentabilidade]},"prr-vouchers":{id:"prr-vouchers",name:"PRR Vouchers Digitaliza\xe7\xe3o",portal:"PRR",description:"Template simplificado para Vouchers de Digitaliza\xe7\xe3o",totalWeight:100,requiredDocs:["Declara\xe7\xe3o PME","Or\xe7amentos (3 por item)","IBAN"],sections:[{...i.caracterizacao_empresa,weight:15},{...i.diagnostico_digital,weight:25},{...i.plano_digitalizacao,weight:40},{...i.investimento_orcamento,weight:20}]},"prr-digital":{id:"prr-digital",name:"PRR Transi\xe7\xe3o Digital",portal:"PRR",description:"Template para projetos de Transi\xe7\xe3o Digital (mais completo)",totalWeight:100,requiredDocs:["Declara\xe7\xe3o PME","Plano de Digitaliza\xe7\xe3o","Or\xe7amentos detalhados","Declara\xe7\xe3o DNSH"],sections:[i.caracterizacao_empresa,i.diagnostico_digital,i.plano_digitalizacao,i.objetivos_smart,i.plano_trabalhos,i.investimento_orcamento,i.sustentabilidade]}};function r(e){return t[e]||null}let s=Object.values(i)},94508:function(e,a,o){o.d(a,{cn:function(){return r}});var i=o(61994),t=o(53335);function r(...e){return(0,t.m6)((0,i.W)(e))}}}]);