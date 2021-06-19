import * as Nexus from "nexus";
import {
  NexusInterfaceTypeConfig,
  NexusObjectTypeConfig,
  ObjectDefinitionBlock,
  NEXUS_BUILD,
  NEXUS_TYPE,
  GetGen,
  ArgsRecord,
} from "nexus/dist/core";

import StackUtils from "stack-utils";

const FIELDS = Symbol.for("@nexus-decorators/fields");

interface FieldsMeta {
  isStatic: boolean;
  fnName: string;
  fnBody: Function;
  fieldType: TypeNameOrThunk;
  wrapping: Wrapping[];
  fieldConfig: FieldConfig;
}

const ROOT_FIELDS = Symbol.for("@nexus-decorators/rootField");

interface RootFieldMeta {
  fieldMethod: "queryField" | "mutationField";
  fnName: string;
  fnBody: Function;
  options: RootFieldOptions | (() => RootFieldOptions);
}

const OUTPUT_DEFINITION = Symbol.for("@nexus-decorators/outputDefinition");

interface OutputDefinitionMeta {
  outputType: OutputTypeFn;
  inFile: string | undefined;
  config: NxsObjectTypeConfig | NxsInterfaceTypeConfig;
  className: string;
}

const INHERITED_INTERFACES = Symbol.for(
  "@nexus-decorators/inheritedInterfaces"
);

interface InhertitedInterfacesMeta {
  name: string;
  _class: Function;
}

interface MetaClass {
  name: string;
  [FIELDS]?: FieldsMeta[];
  [ROOT_FIELDS]?: RootFieldMeta[];
  [INHERITED_INTERFACES]?: InhertitedInterfacesMeta[];
  [OUTPUT_DEFINITION]?: OutputDefinitionMeta;
  [NEXUS_BUILD]?: () => any;
}

interface NxsObjectTypeConfig
  extends Omit<NexusObjectTypeConfig<any>, "definition" | "name"> {
  name?: string;
  definition?: (t: ObjectDefinitionBlock<any>) => void;
}

interface NxsInterfaceTypeConfig
  extends Omit<
    NexusInterfaceTypeConfig<any>,
    "definition" | "name" | "description"
  > {
  name?: string;
  definition?: (t: ObjectDefinitionBlock<any>) => void;
  // TODO: fix in nexus
  description?: string;
}

const stackUtils = new StackUtils({ cwd: "/" });

type OutputTypeFn = "objectType" | "interfaceType";

type Wrapping = "list" | "nonNull";

interface FieldConfig {
  name?: string;
  description?: string;
  args?: ((t: ArgsDefinitionBlock) => void) | ArgsRecord;
}

type TypeNameOrThunk = GetGen<"allOutputTypes", string> | (() => any);

interface OutputFieldChain {
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
  nonNull: OutputFieldChain;
}

interface RootFieldMeta {
  options: RootFieldOptions | (() => RootFieldOptions);
}

function makeOutputField(wrapping: Wrapping[]): OutputFieldChain {
  const outputField: Omit<OutputFieldChain, "list" | "nonNull"> = {
    int: (config) => outputField.type("Int", config),
    string: (config) => outputField.type("String", config),
    float: (config) => outputField.type("Float", config),
    boolean: (config) => outputField.type("Boolean", config),
    id: (config) => outputField.type("ID", config),
    type: (typeName: TypeNameOrThunk, config = {}) => {
      return function (_class, fnName, descriptor) {
        // TODO: Validate that its a valid GraphQL Name
        if (typeof fnName !== "string") {
          throw new Error("Cannot decorate a type on a non-string method");
        }
        const isStatic = _class.constructor === Function;
        const ctor = (isStatic ? _class : _class.constructor) as MetaClass;
        const fnBody = descriptor.value ?? descriptor.get;
        if (typeof fnBody !== "function") {
          throw new Error(
            `Expected ${fnName} to be a method / getter on ${ctor.name}.${fnName}`
          );
        }
        const fields = setOrGet(ctor, FIELDS, []);
        fields.push({
          fnName,
          fnBody,
          isStatic,
          fieldType: typeName,
          wrapping,
          fieldConfig: config,
        });
        setOrGet(ctor, NEXUS_BUILD, nexusDecoratorBuild);
      };
    },
  };
  Object.defineProperty(outputField, "list", {
    get() {
      return makeOutputField(wrapping.concat("list"));
    },
  });
  Object.defineProperty(outputField, "nonNull", {
    get() {
      return makeOutputField(wrapping.concat("nonNull"));
    },
  });
  return outputField as any;
}

function has<O extends object, K extends keyof O>(obj: O, key: K) {
  return Boolean(Object.getOwnPropertyDescriptor(obj, key));
}

function setOrGet<O extends object, K extends keyof O>(
  obj: O,
  key: K,
  value: Exclude<O[K], undefined>
): Exclude<O[K], undefined> {
  if (!has(obj, key)) {
    Object.defineProperty(obj, key, {
      enumerable: true,
      value,
    });
    return value;
  }
  return get(obj, key) as Exclude<O[K], undefined>;
}

function get<O extends object, K extends keyof O>(obj: O, key: K): O[K] {
  return Object.getOwnPropertyDescriptor(obj, key)?.value;
}

function nexusDecoratorBuild(this: MetaClass) {
  const toReturn: any[] = [];

  let outputDef = get(this, OUTPUT_DEFINITION);
  const hasFields = has(this, FIELDS);

  if (outputDef || hasFields) {
    if (!outputDef) {
      outputDef = {
        outputType: "objectType",
        className: this.name,
        inFile: undefined,
        config: {},
      };
    }
    const { outputType } = outputDef;

    // If there are no known fields, and no "definition" for these fields and nothing inherited
    if (
      !get(this, FIELDS)?.length &&
      !get(this, INHERITED_INTERFACES)?.length &&
      !outputDef.config.definition
    ) {
      const fields = setOrGet(this, FIELDS, []);
      fields.push({
        fieldType: "Boolean",
        fnName: "todo",
        fieldConfig: {
          description: `Auto-generated by nexus-decorators as the ${outputType} is missing fields`,
        },
        fnBody: () => true,
        isStatic: false,
        wrapping: [],
      });
    }
    const toSpread: Partial<OutConfig> = { ...outputDef.config };

    if (outputDef.inFile) {
      toSpread.sourceType = {
        module: outputDef.inFile,
        export: outputDef.className,
      };
    }

    Object.defineProperty(this, NEXUS_TYPE, {
      value: Nexus[outputDef.outputType]({
        name: outputDef.className,
        ...toSpread,
        definition: (t) => {
          if (typeof toSpread.definition === "function") {
            toSpread.definition(t as any);
          }
          for (const impl of this[INHERITED_INTERFACES] ?? []) {
            t.implements(impl.name);
          }
          for (const field of this[FIELDS] ?? []) {
            const name = field.fieldConfig.name ?? field.fnName;
            const fieldType =
              typeof field.fieldType === "function"
                ? field.fieldType()
                : field.fieldType;
            const args = gatherArgs(field.fieldConfig);
            let fieldChain: any = t;
            for (const wrap of field.wrapping) {
              fieldChain = fieldChain[wrap];
            }
            fieldChain.field(name, {
              ...field.fieldConfig,
              args,
              type: fieldType,
              resolve(root: any, args: any, ctx: any, info: any) {
                return field.fnBody.call(root, args, ctx, info);
              },
            });
          }
        },
      }),
    });
  }

  for (const impl of get(this, INHERITED_INTERFACES) ?? []) {
    toReturn.push(impl._class);
  }

  for (const rootField of get(this, ROOT_FIELDS) ?? []) {
    toReturn.push(
      Nexus[rootField.fieldMethod]((t) => {
        const opts = result(rootField.options);
        const args = gatherArgs(opts);
        t.field(rootField.fnName, {
          ...opts,
          args,
          resolve: (root: any, args: any, ctx: any, info: any) => {
            return rootField.fnBody.call(root, args, ctx, info);
          },
        });
      })
    );
  }

  return toReturn;
}

interface ArgsDefinitionBlock {
  int(name: string, config?: Nexus.core.ScalarArgConfig<any>): void;
  float(name: string, config?: Nexus.core.ScalarArgConfig<any>): void;
  string(name: string, config?: Nexus.core.ScalarArgConfig<any>): void;
  bool(name: string, config?: Nexus.core.ScalarArgConfig<any>): void;
  id(name: string, config?: Nexus.core.ScalarArgConfig<any>): void;
  arg(name: string, config: Nexus.core.NexusArgConfig<any>): void;
  nonNull: Omit<ArgsDefinitionBlock, "nonNull">;
  list: ArgsDefinitionBlock;
}

interface RootFieldOptions extends FieldConfig {
  type: any;
}

const rootField =
  (fieldMethod: "queryField" | "mutationField") =>
  (options: RootFieldOptions | (() => RootFieldOptions)): MethodDecorator => {
    return (_class, fnName, descriptor) => {
      const obj = _class as MetaClass;
      if (typeof fnName !== "string") {
        return;
      }
      const fnBody = descriptor.value ?? descriptor.get;
      if (obj.constructor !== Function || typeof fnBody !== "function") {
        console.error(
          `Expected ${fieldMethod} to be a static method / getter on ${_class.constructor.name}.${fnName}, skipping`
        );
        return;
      }
      const arr = setOrGet(obj, ROOT_FIELDS, []);
      arr.push({
        fieldMethod,
        fnName,
        fnBody,
        options,
      });
      setOrGet(obj, NEXUS_BUILD, nexusDecoratorBuild);
    };
  };

const queryField = rootField("queryField");
const mutationField = rootField("mutationField");

function gatherArgs(options: Pick<RootFieldOptions, "args">) {
  if (typeof options.args === "function") {
    let mutableArgs: Record<string, any> = {};
    options.args(makeArgsBlock(mutableArgs, []));
    return mutableArgs;
  }
  return options.args ?? {};
}

function wrapArg(
  wrapping: Array<"list" | "nonNull">,
  arg: Nexus.core.NexusArgDef<any>
) {
  let finalArg: any = arg;
  const reversed = [...wrapping].reverse();
  for (const wrapper of reversed) {
    if (wrapper === "list") {
      finalArg = Nexus.list(finalArg);
    } else {
      finalArg = Nexus.nonNull(finalArg);
    }
  }
  return finalArg;
}

function makeArgsBlock(
  target: Record<string, any>,
  wrapping: Array<"list" | "nonNull">
): ArgsDefinitionBlock {
  return {
    id(name, opts) {
      target[name] = wrapArg(wrapping, Nexus.idArg(opts));
    },
    float(name, opts) {
      target[name] = wrapArg(wrapping, Nexus.floatArg(opts));
    },
    bool(name, opts) {
      target[name] = wrapArg(wrapping, Nexus.booleanArg(opts));
    },
    int(name, opts) {
      target[name] = wrapArg(wrapping, Nexus.intArg(opts));
    },
    string(name, opts) {
      target[name] = wrapArg(wrapping, Nexus.stringArg(opts));
    },
    arg(name, opts) {
      target[name] = wrapArg(wrapping, Nexus.arg(opts));
    },
    get list() {
      return makeArgsBlock(target, wrapping.concat("list"));
    },
    get nonNull() {
      return makeArgsBlock(target, wrapping.concat("nonNull"));
    },
  };
}

type OutConfig = NxsObjectTypeConfig | NxsInterfaceTypeConfig;

function makeOutputType(
  outputType: OutputTypeFn,
  config: OutConfig
): ClassDecorator {
  const inFile = stackUtils.parseLine(
    new Error().stack?.split("\n")[3] ?? ""
  )?.file;
  return (_class) => {
    const obj = _class as MetaClass;

    obj[OUTPUT_DEFINITION] = {
      outputType,
      inFile,
      config,
      className: _class.name,
    };
    setOrGet(obj, FIELDS, []);
    setOrGet(obj, NEXUS_BUILD, nexusDecoratorBuild);

    let walkingProto = _class;

    while (Object.getPrototypeOf(walkingProto) !== Function.prototype) {
      walkingProto = Object.getPrototypeOf(walkingProto);

      if (Reflect.has(walkingProto, OUTPUT_DEFINITION)) {
        const def = Reflect.get(
          walkingProto,
          OUTPUT_DEFINITION
        ) as OutputDefinitionMeta;
        if (def.outputType === "interfaceType") {
          const toPush = setOrGet(obj, INHERITED_INTERFACES, []);
          toPush.push({
            name: def.config.name ?? def.className,
            _class: walkingProto,
          });
        }
      }
    }
  };
}

function result<T>(o: T | (() => T)): T {
  if (o instanceof Function) {
    return o();
  }
  return o;
}

function objectType(config: NxsObjectTypeConfig = {}) {
  return makeOutputType("objectType", config);
}

function interfaceType(config: NxsInterfaceTypeConfig = {}) {
  return makeOutputType("interfaceType", config);
}

function enumType(name: string, members: ReadonlyArray<string>) {
  return Nexus.enumType({
    name,
    members,
  });
}

function unionType(name: string, members: ReadonlyArray<string>) {
  return Nexus.unionType({
    name,
    definition(t) {
      t.members(members);
    },
  });
}

function list(val: any) {
  return Nexus.list(val);
}

function nonNull(val: any) {
  return Nexus.nonNull(val);
}

export const nxs = {
  objectType,
  interfaceType,
  field: makeOutputField([]),
  queryField,
  mutationField,
  unionType,
  enumType,
  list,
  nonNull,
  Nexus,
};

export interface BuildSchemaWithDecoratorsConfig
  extends Omit<Nexus.core.SchemaConfig, "types"> {
  types?: any[];
}
