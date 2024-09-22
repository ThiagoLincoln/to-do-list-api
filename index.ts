import fastify from "fastify";
import fastifyCors from "@fastify/cors"; // Plugin para CORS
import fastifyFormBody from "@fastify/formbody"; // Plugin para body parser (form data)
const connection = require("./database/database") // importando a database
const Tarefa = require("./database/Tarefas")
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import fs from 'fs';
import path from 'path';

const server = fastify();

// Configurando CORS
server.register(fastifyCors);

// Configurando body parser para formulários
server.register(fastifyFormBody);

// Lendo o arquivo swagger.json
const swaggerJson = JSON.parse(fs.readFileSync(path.join(__dirname, 'swagger.json'), 'utf-8'));

// Configurando Swagger
server.register(fastifySwagger, { swagger: swaggerJson });

// Configurando Swagger UI
server.register(fastifySwaggerUi, {
  prefix: '/documentação',
});

connection
    .authenticate()
    .then(() => {
        console.log("Conexão com banco de dados realizada com sucesso!")
    }).catch((err: any) => {
        console.log(err)
    })

// Definindo a rota de tarefas
server.get("/tarefas", async (req, res) => {
  try {
    const tarefas = await Tarefa.findAll(); // Pega todas as tarefas do banco
    res.send(tarefas); // Envia as tarefas como resposta
  } catch (err) {
    res.status(500).send({ error: "Erro ao buscar tarefas" });
  }
});

// Definindo a rota de somente uma tarefa pelo o id
interface TarefaIdParams {
  id: string; // ID como string
}

server.get<{ Params: TarefaIdParams }>("/tarefas/:id", async (req, res) => {
  try {
    const { id } = req.params; // Pega o ID dos parâmetros da URL

    // Busca a tarefa pelo ID, convertendo para número se necessário
    const tarefa = await Tarefa.findByPk(Number(id));

    // Verifica se a tarefa foi encontrada
    if (!tarefa) {
      return res.status(404).send({ error: "Tarefa não encontrada." });
    }

    // Retorna a tarefa encontrada
    res.send(tarefa);
  } catch (err) {
    res.status(500).send({ error: "Erro ao buscar tarefa." });
  }
});


//  Definindo a rota de criar tarefa
interface TarefaRequest {
  task: string;
  completed: boolean;
}


server.post<{ Body: TarefaRequest }>("/tarefas", async (req, res) => {
  try {
    const { task, completed } = req.body;

    // Valida se os campos foram passados corretamente
    if (!task || typeof completed !== "boolean") {
      return res.status(400).send({ error: "Campos 'task' e 'completed' são obrigatórios." });
    }

    // Cria uma nova tarefa no banco de dados
    const novaTarefa = await Tarefa.create({
      task,
      completed,
    });

    // Retorna a nova tarefa criada
    res.status(201).send(novaTarefa);
  } catch (err) {
    res.status(500).send({ error: "Erro ao criar tarefa" });
  }
});


// Definindo a rota de atualizar tarefa
server.put<{ Params: TarefaIdParams, Body: TarefaRequest }>("/tarefas/:id", async (req, res) => {
  const { id } = req.params;
  const { task, completed } = req.body;

  try {
    // Busca a tarefa pelo ID
    const tarefa = await Tarefa.findByPk(Number(id));

    // Verifica se a tarefa foi encontrada
    if (!tarefa) {
      return res.status(404).send({ error: "Tarefa não encontrada." });
    }

    // Atualiza os campos da tarefa
    if (task !== undefined) {
      tarefa.task = task;
    }
    if (completed !== undefined) {
      tarefa.completed = completed;
    }

    // Salva as alterações no banco de dados
    await tarefa.save();

    // Retorna a tarefa atualizada
    res.send(tarefa);
  } catch (err) {
    res.status(500).send({ error: "Erro ao atualizar tarefa." });
  }
});

// Definindo  a rota de deletar tarefa

server.delete<{ Params: TarefaIdParams }>("/tarefas/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await Tarefa.destroy({
      where: { id: Number(id) }, // Convertendo para número se necessário
    });
  
    if (resultado === 0) {
      return res.status(404).send({ error: "Tarefa não encontrada." });
    }
  
    res.send({ message: "Tarefa deletada com sucesso! "})
  } catch (err) {
    res.status(500).send({ error: `Erro ao deletar tarefa ${err}` });
  }
})


// Inicializando o servidor na porta 8080
server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }
  console.log(`Server listening on ${address}`);
});
