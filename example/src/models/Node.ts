import { nxs, NxsResult } from "../../..";

@nxs.interfaceType({
  description: "Implements the Node id",
  resolveType(obj) {
    return obj.constructor.name;
  },
})
export abstract class Node {
  @nxs.field.nonNull.id()
  get id(): NxsResult<"Node", "id"> {
    return `${this.constructor.name}:${this._id}`;
  }

  protected abstract get _id(): string | number;
}
