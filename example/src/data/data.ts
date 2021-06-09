import type { PostRecord } from "../models/Post";
import type { UserRecord } from "../models/User";

export const usersList: UserRecord[] = [
  {
    id: 1,
    firstName: "Joe",
    lastName: "User",
    email: "joe@example.com",
  },
  {
    id: 2,
    firstName: "Jane",
    lastName: "User",
    email: "jane@example.com",
  },
];

export const posts: PostRecord[] = [
  {
    id: 1,
    title: "Some post",
    contents: "Lorem ipsum",
    authorId: 1,
  },
  {
    id: 2,
    title: "Some post",
    contents: "Lorem ipsum",
    authorId: 2,
  },
  {
    id: 3,
    title: "Another post",
    contents: "Lorem ipsum",
    authorId: 1,
  },
];
