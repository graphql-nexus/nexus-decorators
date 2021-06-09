import path from "path";

import "./models/User";
import "./models/App";
import { buildSchemaWithDecorators } from "../..";

export const exampleSchema = buildSchemaWithDecorators({
  outputs: {
    typegen: path.join(__dirname, "generated/example.gen.ts"),
    schema: path.join(__dirname, "../example-schema.graphql"),
  },
});
