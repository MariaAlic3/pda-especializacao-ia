#!/usr/bin/env node
/**
 * meu-mcp-server
 *
 * RECONSTRUCAO MINHA a partir da descricao do README do esqueleto.
 * Eu nao vi o arquivo original do curso - confira contra ele antes
 * de entregar. O pacote usado aqui e @modelcontextprotocol/sdk (o
 * nome publicado no npm); se o pacote real do curso tiver outro
 * nome/API, ajuste os imports abaixo.
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const server = new McpServer({
  name: "meu-mcp-server",
  version: "1.0.0",
});

// --- Tool de exemplo (vem pronta no esqueleto, segundo o README) ---
// Deixe-a aqui so para confirmar que o server conecta de ponta a
// ponta; remova antes da entrega final se o enunciado pedir "uma
// tool so, que serve pra algo real".
server.registerTool(
  "ping",
  {
    title: "Ping",
    description: "Tool de exemplo: responde pong para confirmar que o server esta funcionando.",
    inputSchema: {},
  },
  async () => {
    return {
      content: [{ type: "text", text: "pong" }],
    };
  }
);

// --- TODO: preencha aqui a sua tool real -----------------------------------
// TODO: nome da tool
// TODO: descricao da tool
// TODO: schema de input da tool
// TODO: logica da tool, respeitando o que DECISAO-ESCOPO.md diz que ela
//       NAO pode fazer
//
// Abaixo, o preenchimento que eu fiz para o projeto Agenda do Salao:
// tool verificar_conflito_horario, que consulta (NUNCA grava) se um
// horario ja esta ocupado.

const MAX_STR_LEN = 120;
const DATA_REGEX = /^\d{4}-\d{2}-\d{2}$/; // YYYY-MM-DD
const HORA_REGEX = /^([01]\d|2[0-3]):([0-5]\d)$/; // HH:MM

function validarTexto(valor: string, nomeCampo: string): string {
  if (typeof valor !== "string" || valor.trim().length === 0) {
    throw new Error(`Campo "${nomeCampo}" nao pode ser vazio.`);
  }
  if (valor.length > MAX_STR_LEN) {
    throw new Error(
      `Campo "${nomeCampo}" excede o limite de ${MAX_STR_LEN} caracteres (recebido: ${valor.length}).`
    );
  }
  // O valor e tratado so como texto de comparacao/exibicao, nunca
  // interpretado como comando, nem usado em eval/shell/SQL.
  return valor.trim();
}

function validarData(valor: string): string {
  const v = validarTexto(valor, "data");
  if (!DATA_REGEX.test(v)) {
    throw new Error('Campo "data" deve estar no formato YYYY-MM-DD.');
  }
  return v;
}

function validarHorario(valor: string): string {
  const v = validarTexto(valor, "horario");
  if (!HORA_REGEX.test(v)) {
    throw new Error('Campo "horario" deve estar no formato HH:MM (24h).');
  }
  return v;
}

type Agendamento = {
  cliente?: string;
  servico?: string;
  data: string;
  horario: string;
};

// Caminho fixo: o projeto Agenda do Salao vive em outro repositorio,
// entao o caminho real vem de uma variavel de ambiente. Sem ela, usa
// o arquivo de exemplo deste repositorio, so para teste/demo.
const AGENDAMENTOS_PATH =
  process.env.AGENDA_DADOS_PATH ??
  path.join(__dirname, "..", "agendamentos-exemplo.json");

async function carregarAgendamentos(): Promise<Agendamento[]> {
  try {
    const raw = await fs.readFile(AGENDAMENTOS_PATH, "utf-8");
    const dados = JSON.parse(raw);
    if (!Array.isArray(dados)) {
      throw new Error("Arquivo de agendamentos corrompido: esperado um array.");
    }
    return dados as Agendamento[];
  } catch (err: any) {
    if (err.code === "ENOENT") {
      return [];
    }
    throw err;
  }
}

server.registerTool(
  "verificar_conflito_horario",
  {
    title: "Verificar conflito de horario",
    description:
      "Verifica se ja existe um agendamento no mesmo dia e horario no " +
      "Agenda do Salao. Somente consulta: nunca cria, altera ou remove " +
      "agendamentos.",
    inputSchema: {
      data: z.string().describe("Data no formato YYYY-MM-DD"),
      horario: z.string().describe("Horario no formato HH:MM (24h)"),
      servico: z.string().describe("Nome do servico solicitado"),
      nomeCliente: z.string().describe("Nome da cliente ou cliente"),
    },
  },
  async ({ data, horario, servico, nomeCliente }) => {
    try {
      const dataValidada = validarData(data);
      const horarioValidado = validarHorario(horario);
      const servicoValidado = validarTexto(servico, "servico");
      const nomeValidado = validarTexto(nomeCliente, "nomeCliente");

      const agendamentos = await carregarAgendamentos();

      const conflito = agendamentos.find(
        (ag) => ag.data === dataValidada && ag.horario === horarioValidado
      );

      if (conflito) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  disponivel: false,
                  motivo: "Ja existe um agendamento neste dia e horario.",
                  conflitoCom: {
                    cliente: String(conflito.cliente ?? "nao informado"),
                    servico: String(conflito.servico ?? "nao informado"),
                  },
                  consultadoPor: nomeValidado,
                  servicoSolicitado: servicoValidado,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                disponivel: true,
                data: dataValidada,
                horario: horarioValidado,
                servicoSolicitado: servicoValidado,
                consultadoPor: nomeValidado,
              },
              null,
              2
            ),
          },
        ],
      };
    } catch (err: any) {
      return {
        isError: true,
        content: [{ type: "text", text: `Entrada invalida: ${err.message}` }],
      };
    }
  }
);

const transport = new StdioServerTransport();
await server.connect(transport);
