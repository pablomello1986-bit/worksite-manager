# WorkSite Manager

Sistema web para gerenciamento de obras de construcao civil com cadastro de obras, funcionarios, materiais, lancamentos de mao de obra, controle de custos e relatorios.

## Tecnologias

- Node.js
- Express
- SQLite nativo do Node.js (`node:sqlite`)
- HTML, CSS e JavaScript puros no frontend

## Funcionalidades

- Cadastro e acompanhamento de obras
- Dados completos da obra: cliente, telefone, endereco, tipo, responsavel, recebimentos, forma de pagamento e observacoes
- Cadastro de funcionarios e valor de diaria
- Dados completos do funcionario: telefone, documento, pix, valor por hora e status ativo/inativo
- Vinculo de funcionarios em obras em andamento
- Registro de mao de obra por obra e por periodo
- Controle de materiais por obra com fornecedor, categoria, nota fiscal, unidade, preco unitario e status de pagamento
- Aba separada para despesas extras como gasolina, comida, transporte e outros gastos indiretos
- Cadastro de clientes com telefone, email, endereco e logo por URL
- Aba de estimates com itens, desconto, taxa, preview e conversao em obra
- Upload de logo/imagem para cliente e estimate
- Exportacao do estimate em layout pronto para salvar como PDF
- Indicadores de estimates no dashboard com status e taxa de conversao
- Edicao e exclusao de obras, funcionarios, pagamentos, recebimentos, materiais e previsoes
- Historico automatico das ultimas alteracoes no sistema
- Calculo automatico de custo de mao de obra, custo de materiais e lucro
- Dashboard inicial com resumo financeiro e indicadores
- Resumo de despesas extras no dashboard com impacto no lucro
- Alertas financeiros de saldo recebido, orcamento estourado e obras vencidas
- Relatorio semanal de pagamentos por funcionario, obra e materiais
- Relatorio com filtro por status
- Exportacao de relatorio de obras e fluxo de caixa em CSV
- Ficha detalhada da obra
- Interface reorganizada em modulos: Dashboard, Obras, Equipe, Operacao, Previsoes e Relatorios
- Interface responsiva para celular e desktop

## Como rodar localmente

1. Instale as dependencias:

```bash
npm install
```

No PowerShell do Windows, se houver bloqueio de script para `npm`, use:

```bash
cmd /c npm install
```

2. Inicie o servidor:

```bash
npm start
```

Ou no PowerShell:

```bash
cmd /c npm start
```

3. Abra no navegador:

```text
http://localhost:3000
```

## Estrutura

- `src/server.js`: inicializacao do servidor
- `src/app.js`: configuracao principal da API e arquivos estaticos
- `src/db/database.js`: conexao SQLite e criacao do schema
- `src/routes/`: rotas da aplicacao
- `src/services/projectMetrics.js`: calculos de custos e lucro
- `src/services/auditLog.js`: registro automatico das alteracoes
- `public/`: interface web

## Regras de negocio principais

- Cada obra possui cliente, descricao, valor total, data de inicio, prazo estimado e status.
- O custo total da obra considera mao de obra + materiais.
- O lucro final e calculado como `valor total da obra - custo de mao de obra - custo de materiais`.
- Ao dar baixa em uma obra, o status muda para `concluido`.
