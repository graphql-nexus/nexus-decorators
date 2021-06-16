import path from "path";
import { makeSchema } from "nexus";

// import * as models from "./models";
import { App } from "./models";

export const exampleSchema = makeSchema({
  types: [App],
  outputs: {
    typegen: path.join(__dirname, "generated/example.gen.ts"),
    schema: path.join(__dirname, "../example-schema.graphql"),
  },
});
