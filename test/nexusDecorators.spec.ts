import { printSchema } from "graphql";
import { makeSchemaInternal } from "nexus/dist/builder";
import { nxs } from "../src";
import * as models from "../example/src/models";
import { makeSchema } from "nexus";

describe("nexus-decorators", () => {
  it("creates a schema", () => {
    const out = makeSchemaInternal({
      types: models,
    });
    expect(printSchema(out.schema)).toMatchSnapshot();
  });

  it("throws if decorating a symbol", () => {
    expect(() => {
      class DecorateSymbol {
        @nxs.field.boolean()
        [Symbol("SOMETHING")]() {
          return true;
        }
      }
    }).toThrow("Cannot decorate a type on a non-string method");
  });

  it("throws if decorating a setter", () => {
    expect(() => {
      class DecorateSetter {
        @nxs.field.boolean()
        set field(value: number) {
          //
        }
      }
    }).toThrow(
      "Expected field to be a method / getter on DecorateSetter.field"
    );
  });

  it("adds a todo field if there is no field", () => {
    @nxs.objectType()
    class A {}

    const out = makeSchemaInternal({
      types: [A],
    });
    expect(printSchema(out.schema)).toMatchSnapshot();
  });
});
