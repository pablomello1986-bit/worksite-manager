const express = require("express");
const Anthropic = require("@anthropic-ai/sdk");
const { db } = require("../db/database");

const router = express.Router();

router.post("/generate-process", async (request, response) => {
  const { description, materialResponsibility, materialDescription } = request.body;

  if (!description) {
    return response.status(400).json({ error: "Descricao do item e obrigatoria." });
  }

  const keyRow = db.prepare("SELECT value FROM company_settings WHERE key = 'anthropic_api_key'").get();
  const apiKey = keyRow?.value?.trim();

  if (!apiKey) {
    return response.status(422).json({ error: "Chave API Anthropic nao configurada. Va em Configuracoes e informe sua chave." });
  }

  const client = new Anthropic({ apiKey });

  const materialInfo = materialResponsibility === "empresa" && materialDescription
    ? `\nMaterial de responsabilidade da empresa: ${materialDescription}`
    : materialResponsibility === "cliente"
    ? "\nMaterial de responsabilidade do cliente (cliente fornece os materiais)."
    : "";

  const prompt = `Voce e um especialista em construcao civil brasileiro. Gere uma descricao tecnica e objetiva de como executar o seguinte servico em uma obra:

Item: ${description}${materialInfo}

Escreva em portugues brasileiro, de forma clara e profissional, descrevendo:
- O processo de execucao passo a passo (de forma resumida)
- Cuidados importantes
- Resultado esperado

Maximo 4 linhas. Seja direto e tecnico.`;

  const message = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 400,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0]?.text || "";
  response.json({ process: text });
});

module.exports = router;
