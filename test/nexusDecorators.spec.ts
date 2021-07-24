import { lexicographicSortSchema, printSchema } from "graphql";
import { core } from "nexus";
import path from "path";

import { nxs } from "../src";
import * as models from "../example/src/models";

describe("nexus-decorators", () => {
  it("creates a schema", () => {
    const out = core.makeSchemaInternal({
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

    const out = core.makeSchemaInternal({
      types: [A],
    });
    expect(printSchema(out.schema)).toMatchSnapshot();
  });

  it("preserves sourceType if defined", async () => {
    @nxs.objectType({
      sourceType: {
        module: path.join(__dirname, "fixtures/abc-fixture.ts"),
        export: "Abc",
      },
    })
    class A {}

    const out = await core.generateSchema.withArtifacts(
      {
        types: [A],
      },
      path.join(__dirname, "fixtures/out.ts")
    );

    expect(out.tsTypes).toContain('import type { Abc } from "./abc-fixture"');
  });

  it("merges fields from inherited classes", () => {
    class BaseConnection {
      edges() {}

      @nxs.field.type(() => PageInfo)
      pageInfo() {
        return new PageInfo();
      }
    }

    @nxs.objectType()
    class PageInfo {
      @nxs.field.nonNull.boolean()
      hasNextPage() {
        return false;
      }

      @nxs.field.nonNull.boolean()
      hasPreviousPage() {
        return false;
      }

      @nxs.field.string()
      startCursor() {}

      @nxs.field.string()
      endCursor() {}
    }

    class BaseConnectionEdge {
      @nxs.field.string()
      cursor() {}
    }

    class User {
      @nxs.field.id()
      id() {}
    }

    class UserConnectionEdge extends BaseConnectionEdge {
      @nxs.field.type(() => User)
      node() {}
    }

    @nxs.objectType()
    class UserConnection extends BaseConnection {
      @nxs.field.list.type(() => UserConnectionEdge)
      edges() {
        return super.edges();
      }
    }

    class Query {
      @nxs.queryField(() => ({ type: UserConnection }))
      static users() {
        return new UserConnection();
      }
    }

    const out = core.makeSchemaInternal({
      types: [Query],
    });
    expect(printSchema(lexicographicSortSchema(out.schema))).toMatchSnapshot();
  });
});
