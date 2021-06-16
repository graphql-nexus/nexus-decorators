import fastify from "fastify";
import mercurius from "mercurius";

import { exampleSchema } from "./exampleSchema";

const app = fastify();

app.register(mercurius, {
  schema: exampleSchema as any,
  graphiql: true,
});

const PORT = 3000;

const start = async () => {
  try {
    await app.listen(PORT, (err) => {
      if (err) {
        console.error(err);
      }
      console.log(`Listening on https://localhost:${PORT}`);
    });
  } catch (err) {
    console.error(err);
    app.log.error(err);
  }
};
start().catch((e) => {
  console.error(e);
});
