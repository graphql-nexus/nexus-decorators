import { nxs, NxsQueryArgs, NxsQueryResult } from "../../..";
import { posts, usersList } from "../data/data";
import { Post } from "./Post";
import { User } from "./User";

@nxs.objectType({
  name: "Query",
})
export class App {
  @nxs.queryField(() => ({
    type: "Node",
    description: "Generic node lookup",
    args(t) {
      t.nonNull.id("id");
    },
  }))
  static node(args: NxsQueryArgs<"node">): NxsQueryResult<"node"> {
    const [typeName, id] = args.id.split(":");
    if (typeName === "User") {
      const user = usersList.find((u) => u.id === parseInt(id, 10));
      return user ? new User(user) : null;
    }
    if (typeName === "Post") {
      const post = posts.find((u) => u.id === parseInt(id, 10));
      return post ? new Post(post) : null;
    }
    return null;
  }

  @nxs.field.list.type(() => User, {
    description: "A list of all users in the app",
  })
  static users(): NxsQueryResult<"users"> {
    return usersList.map((u) => new User(u));
  }

  @nxs.field.type(() => User, {
    description: "Finds a user by their email",
    args(t) {
      t.string("email");
    },
  })
  static userByEmail(args: NxsQueryArgs<"userByEmail">) {
    return usersList.find((u) => u.email === args.email);
  }

  @nxs.field.list.type(() => Post, {
    description: "A list of posts for the app",
  })
  static posts() {
    return posts.map((p) => new Post(p));
  }
}
