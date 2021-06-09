## nexus-decorators

**WIP / Prototype (do not use in production)**

Experimental support for using Nexus schema construction with decorator syntax. Currently requires TypeScript & `experimentalDecorators: true`.

### Goals

Provide a syntax to use the core of Nexus in decorator format, to de-duplicate domain models.

### Limitations

- Unable to auto-check / infer types - must be manually added

### Features:

- Interfaces via inheritance
- Mix & match w/ regular nexus

### Open Questions:

- Guarding / auto-creating classes if we don't have that object type
- Auto isTypeOf for interfaces
- General construction

### Example:

```ts
import { nxs } from "nexus-decorators";

@nxs.objectType({
  name: "Query",
})
class App {
  constructor() {}

  @nxs.field.list.type(() => User)
  users() {}
}

interface UserShape {
  id: number;
  firstName: string;
  lastName: string;
}

@nxs.objectType()
class User {
  constructor(record: UserShape) {
    this.record = record;
  }

  @nxs.queryField(() => ({
    type: User,
    args(t) {
      t.nonNull.string("name");
    },
  }))
  static userByName(args, ctx) {
    return ctx.findUserByName();
  }

  @nxs.field.id()
  get id() {
    return `User:${this.record.id}`;
  }

  @nxs.field.string()
  get name() {
    return `${this.record.firstName} ${this.record.lastName}`;
  }
}
```

Prints:

```graphql
type User {
  id: String
  name: String
}

type Query {
  users(): [User]
  userByName(name: String!): User
}
```

### License

MIT
