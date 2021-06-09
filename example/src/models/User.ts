import { nxs, NxsResult } from "../../..";
import { posts } from "../data/data";
import { Node } from "./Node";
import { Post } from "./Post";

export interface UserRecord {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

@nxs.objectType({
  name: "User",
  description: "A single user in the app",
})
export class User extends Node {
  constructor(private record: UserRecord) {
    super();
  }

  private get pk() {
    return this.record.id;
  }

  protected get _id() {
    return this.pk;
  }

  @nxs.field.string()
  get fullName() {
    return `${this.record.firstName} ${this.record.lastName}`;
  }

  @nxs.field.string()
  get email() {
    return this.record.email;
  }

  @nxs.field.string()
  get firstName() {
    return this.record.firstName;
  }

  @nxs.field.string()
  get lastName() {
    return this.record.lastName;
  }

  @nxs.field.nonNull.list.type(() => Post, {
    description: "A list of posts for a user",
  })
  posts(): NxsResult<"User", "posts"> {
    return posts.filter((p) => p.authorId === this.pk).map((p) => new Post(p));
  }
}
