import type { core } from "nexus";

type NullWrapping = "nonNull" | "nullable";

export type TypeNameOrThunk =
  | core.GetGen<"allOutputTypes", string>
  | (() => any);

export interface FieldConfig {
  name?: string;
  description?: string;
  args?: ((t: ArgsDefinitionBlock) => void) | core.ArgsRecord;
}

export interface ArgsDefinitionBlock {
  int(name: string, config?: core.ScalarArgConfig<any>): void;
  float(name: string, config?: core.ScalarArgConfig<any>): void;
  string(name: string, config?: core.ScalarArgConfig<any>): void;
  bool(name: string, config?: core.ScalarArgConfig<any>): void;
  id(name: string, config?: core.ScalarArgConfig<any>): void;
  arg(name: string, config: core.NexusArgConfig<any>): void;
  nullable: Omit<ArgsDefinitionBlock, NullWrapping>;
  nonNull: Omit<ArgsDefinitionBlock, NullWrapping>;
  list: ArgsDefinitionBlock;
}

export interface OutputFieldChain {
  int(config?: FieldConfig): MethodDecorator | PropertyDecorator;
  string(config?: FieldConfig): MethodDecorator | PropertyDecorator;
  float(config?: FieldConfig): MethodDecorator | PropertyDecorator;
  boolean(config?: FieldConfig): MethodDecorator | PropertyDecorator;
  id(config?: FieldConfig): MethodDecorator | PropertyDecorator;
  type(
    typeName: TypeNameOrThunk,
    config?: FieldConfig
  ): MethodDecorator | PropertyDecorator;
  list: OutputFieldChain;
  nonNull: Omit<OutputFieldChain, NullWrapping>;
  nullable: Omit<OutputFieldChain, NullWrapping>;
}
