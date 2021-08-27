import type { HasGen3, GetGen3, GetGen, GetGen2 } from "nexus/dist/core";

export type NxsCtx = GetGen<"context">;

export type NxsArgs<
  TypeName extends Extract<keyof GetGen<"fieldTypes", never>, string>,
  FieldName extends Extract<
    keyof GetGen2<"fieldTypes", TypeName, never>,
    string
  >
> = HasGen3<"fieldTypes", TypeName, FieldName> extends true
  ? GetGen3<"argTypes", TypeName, FieldName, never>
  : never;

export type NxsQueryArgs<
  FieldName extends Extract<keyof GetGen2<"fieldTypes", "Query", never>, string>
> = NxsArgs<"Query", FieldName>;

export type NxsMutationArgs<
  FieldName extends Extract<
    keyof GetGen2<"fieldTypes", "Mutation", never>,
    string
  >
> = HasGen3<"fieldTypes", "Mutation", FieldName> extends true
  ? GetGen3<"argTypes", "Mutation", FieldName, never>
  : never;

export type NxsResult<
  TypeName extends Extract<keyof GetGen<"fieldTypes", never>, string>,
  FieldName extends Extract<
    keyof GetGen2<"fieldTypes", TypeName, never>,
    string
  >
> = GetGen3<"fieldTypes", TypeName, FieldName, never>;

export type NxsQueryResult<
  FieldName extends Extract<keyof GetGen2<"fieldTypes", "Query", never>, string>
> = NxsResult<"Query", FieldName>;

export type NxsMutationResult<
  FieldName extends Extract<
    keyof GetGen2<"fieldTypes", "Mutation", never>,
    string
  >
> = GetGen3<"fieldTypes", "Mutation", FieldName, never>;
