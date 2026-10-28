# Decisão de escopo — preencha ANTES de escrever a tool

<!--
  Isso não é burocracia. É a única parte desta semana que o agente não decide por você.
  Preencha isso, commite, e SÓ DEPOIS comece o código. Na aula 2, este documento é o
  que o seu colega recebe pra tentar atacar — ele é o alvo declarado do red team.
-->

## O projeto

- **Domínio do catálogo (semana 2):** 7. Domínio próprio do aluno — Agenda do Salão, sistema de agendamento de serviços de um salão de beleza.
- **Que dado ou sistema real esse tool vai tocar** (planilha, API, arquivo, banco):
  Arquivo JSON local de agendamentos do projeto Agenda do Salão
  (`src/data/agendamentos.json`), lido via variável de ambiente
  `AGENDA_DADOS_PATH`.

## A tool

- **Nome da tool:** `verificar_conflito_horario`
- **O que ela recebe (parâmetros):** `data` (YYYY-MM-DD), `horario`
  (HH:MM), `servico` (texto), `nomeCliente` (texto).
- **O que ela devolve:** um JSON dizendo se o horário está disponível
  ou não; se não estiver, devolve apenas o cliente e o serviço do
  agendamento conflitante (nunca o objeto bruto armazenado).

## O que ela PRECISA poder fazer

(a menor lista possível — cada item aqui é uma permissão que você está concedendo)

1. Ler o arquivo de agendamentos no caminho configurado.
2. Comparar a data e o horário recebidos com os agendamentos já existentes.

## O que ela NÃO PODE poder fazer

(mesmo que fosse conveniente. Pense em: escrever/apagar quando só devia ler, acessar
arquivo fora de uma pasta específica, expor dado sensível de outra pessoa, executar
código arbitrário, agir sem confirmação em algo irreversível)

1. Criar, alterar ou apagar qualquer agendamento (é só consulta).
2. Ler ou escrever qualquer arquivo fora do caminho fixo configurado em `AGENDA_DADOS_PATH`.
3. Executar código, comandos de shell ou consultas a partir do texto recebido em `servico`/`nomeCliente`.

## Como isso é garantido no código

(não vale "eu vou tomar cuidado". Tem que ser algo que um ataque não consegue contornar
só pedindo educadamente. Exemplos: allow-list de caminhos, validação de schema que rejeita
tipos inesperados, ausência de qualquer credencial de escrita no processo, um limite de
tamanho de entrada/saída)

1. O caminho do arquivo é fixo (variável de ambiente definida na configuração do
   servidor), nunca é um parâmetro da chamada — não há `path traversal` possível
   vindo da entrada da tool.
2. Schema de entrada (zod) exige tipos string; validação adicional por regex
   rejeita `data`/`horario` fora do formato esperado, e qualquer campo de texto
   acima de 120 caracteres é rejeitado antes de tocar no arquivo. O código não
   contém nenhuma chamada de escrita (`fs.writeFile`/`fs.unlink`) em nenhum ponto.

## Se alguém tentasse enganar o agente pra fazer o que está na lista de "NÃO PODE"

- **O que você acha que aconteceria hoje, antes de qualquer correção?**
  1. Em caso de solicitar ao agente a criação, alteração ou exclusão de algum agendamento, o agente deve informar que ele só tem permissão para vizualizar/consultar o agendamento.
  2. Bloquear o acesso desse alguém a essas informações de forma segura e notificar a tentativa de burlar o sistema.
- **Qual sinal mostraria que o ataque funcionou** (o que você olharia pra saber)?
   O arquivo de agendamentos mudou de conteúdo; 
   a resposta trouxe dados de outros clientes além do conflito; 
   a tool tentou ler um caminho diferente do configurado 