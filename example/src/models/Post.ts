import { nxs, NxsResult } from "../../..";
import { usersList } from "../data/data";
import { proxyCall } from "../data/proxyCall";
import { Node } from "./Node";
import { User } from "./User";

export interface PostRecord {
  id: number;
  title: string;
  contents: string;
  authorId: number;
}

@nxs.objectType({
  description: "A user can have posts",
  definition(t) {
    t.string("title");
    t.string("contents");
  },
})
export class Post extends Node {
  constructor(readonly config: PostRecord) {
    super();
    return proxyCall(this);
  }

  protected get _id() {
    return this.config.id;
  }

  @nxs.field.type(() => User)
  author(): NxsResult<"Post", "author"> {
    const user = usersList.find((u) => u.id === this.config.authorId);
    return user ? new User(user) : null;
  }

  @nxs.field.boolean()
  get ok() {
    return true;
  }

  @nxs.field.string()
  abc() {
    return "abc";
  }

  @nxs.field.list.type(() => Comment)
  comments() {
    return [];
  }
}

class Comment {
  @nxs.field.string()
  content() {}
}
