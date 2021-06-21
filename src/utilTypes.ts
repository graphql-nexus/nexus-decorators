import type { ResultValue, HasGen3, GetGen3 } from "nexus/dist/core";

export type NxsArgs<TypeName extends string, FieldName extends string> =
  HasGen3<"fieldTypes", TypeName, FieldName> extends true
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

export type NxsResult<TypeName extends string, FieldName extends string> =
  ResultValue<TypeName, FieldName>;

export type NxsQueryResult<FieldName extends string> = NxsResult<
  "Query",
  FieldName
>;

export type NxsMutationResult<FieldName extends string> = NxsResult<
  "Mutation",
  FieldName
>;
