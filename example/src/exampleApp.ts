import fastify from "fastify";
import mercurius from "mercurius";
import { exampleSchema } from "./exampleSchema";

const app = fastify();

app.register(mercurius, {
  schema: exampleSchema,
  graphiql: true,
});

const PORT = 3000;

const start = async () => {
  try {
    await app.listen(PORT, () => {
      console.log(`Listening on https://localhost:${PORT}`);
    });
  } catch (err) {
    console.error(err);
    app.log.error(err);
    process.exit(1);
  }
};
start();
