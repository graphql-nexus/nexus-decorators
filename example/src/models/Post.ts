import { nxs, NxsResult } from "../../..";
import { usersList } from "../data/data";
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
})
export class Post extends Node {
  constructor(private record: PostRecord) {
    super();
  }

  protected get _id() {
    return this.record.id;
  }

  @nxs.field.string()
  title() {
    return this.record.title;
  }

  @nxs.field.string()
  contents() {
    return this.record.contents;
  }

  @nxs.field.type(() => User)
  author(): NxsResult<"Post", "author"> {
    const user = usersList.find((u) => u.id === this.record.authorId);
    return user ? new User(user) : null;
  }
}
