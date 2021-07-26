import type { HasGen3, GetGen3, GetGen } from "nexus/dist/core";

export type NxsCtx = GetGen<"context">;

export type NxsArgs<
  TypeName extends string,
  FieldName extends string
> = HasGen3<"fieldTypes", TypeName, FieldName> extends true
  ? GetGen3<"argTypes", TypeName, FieldName, never>
  : never;

export type NxsQueryArgs<FieldName extends string> = NxsArgs<
  "Query",
  FieldName
>;

export type NxsMutationArgs<FieldName extends string> = NxsArgs<
  "Mutation",
  FieldName
>;

export type NxsResult<
  TypeName extends string,
  FieldName extends string
> = GetGen3<"fieldTypes", TypeName, FieldName, never>;

export type NxsQueryResult<FieldName extends string> = NxsResult<
  "Query",
  FieldName
>;

export type NxsMutationResult<FieldName extends string> = NxsResult<
  "Mutation",
  FieldName
>;
