import * as Nexus from "nexus";
import {
  connectionPlugin,
  NexusInterfaceTypeConfig,
  NexusObjectTypeConfig,
  ObjectDefinitionBlock,
} from "nexus/dist/core";
import StackUtils from "stack-utils";

const stackUtils = new StackUtils({ cwd: "/" });

type OutputTypeFn = "objectType" | "interfaceType";

// When we build the app, we gather all of the types into this array
const allTypes: any[] = [];

interface FieldDecoratorMeta {
  type: TypeNameOrThunk;
  fnName: string;
  fnValue: Function;
  isStatic: boolean;
  wrapping: Wrapping[];
  fieldConfig: FieldConfig;
}

interface TypeLookupMeta {
  typeFn: OutputTypeFn;
  _class: Function;
  inFile: string | undefined;
}

// Keep a mapping of the object "type" to the
export const typeLookup = new Map<string, TypeLookupMeta>();
export const classLookup = new Map<Function, any>();
export const fieldLookup = new Map<Object, FieldDecoratorMeta[]>();
export const fieldLookupByName = new Map<string, FieldDecoratorMeta[]>();

type Wrapping = "list" | "nonNull";

interface FieldConfig {
  name?: string;
  description?: string;
  args?(t: ArgsDefinitionBlock): void;
}

type TypeNameOrThunk = string | (() => any);

interface OutputFieldChain {
  nonNull: OutputFieldChain;
  list: OutputFieldChain;
  int(config?: FieldConfig): MethodDecorator | PropertyDecorator;
  string(config?: FieldConfig): MethodDecorator | PropertyDecorator;
  float(config?: FieldConfig): MethodDecorator | PropertyDecorator;
  boolean(config?: FieldConfig): MethodDecorator | PropertyDecorator;
  id(config?: FieldConfig): MethodDecorator | PropertyDecorator;
  type(
    typeName: TypeNameOrThunk,
    config?: FieldConfig
  ): MethodDecorator | PropertyDecorator;
}

function makeOutputField(wrapping: Wrapping[]): OutputFieldChain {
  const outputField: Omit<OutputFieldChain, "list" | "nonNull"> = {
    int: (config) => outputField.type("Int", config),
    string: (config) => outputField.type("String", config),
    float: (config) => outputField.type("Float", config),
    boolean: (config) => outputField.type("Boolean", config),
    id: (config) => outputField.type("ID", config),
    type: (typeName: TypeNameOrThunk, config = {}) => {
      return function (_class, key, descriptor) {
        if (typeof key !== "string") {
          return;
        }
        const ctor =
          _class.constructor === Function ? _class : _class.constructor;
        if (!fieldLookup.has(ctor)) {
          fieldLookup.set(ctor, []);
        }
        const targetArr = fieldLookup.get(ctor);
        if (!targetArr) {
          throw new Error("Internal");
        }
        targetArr.push({
          fnName: key,
          // @ts-expect-error
          fnValue: descriptor.value,
          type: typeName,
          fieldConfig: config,
          wrapping,
          isStatic: _class.constructor === Function,
        });
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

interface ArgsDefinitionBlock {
  int(name: string, config?: Nexus.core.ScalarArgConfig<any>): void;
  float(name: string, config?: Nexus.core.ScalarArgConfig<any>): void;
  string(name: string, config?: Nexus.core.ScalarArgConfig<any>): void;
  bool(name: string, config?: Nexus.core.ScalarArgConfig<any>): void;
  id(name: string, config?: Nexus.core.ScalarArgConfig<any>): void;
  field(name: string, config?: Nexus.core.ScalarArgConfig<any>): void;
  nonNull: Omit<ArgsDefinitionBlock, "nonNull">;
  list: ArgsDefinitionBlock;
}

interface RootFieldOptions {
  type: any;
  name?: string;
  args?(t: ArgsDefinitionBlock): void;
  description?: string;
}

const rootField =
  (fieldMethod: "queryField" | "mutationField") =>
  (options: RootFieldOptions | (() => RootFieldOptions)): MethodDecorator => {
    return (_class, key, descriptor) => {
      if (typeof key !== "string") {
        return;
      }
      if (
        _class.constructor !== Function ||
        typeof descriptor.value !== "function"
      ) {
        console.error(
          `Expected ${fieldMethod} on static function for ${_class.constructor.name}.${key}`
        );
        return;
      }
      allTypes.push(
        Nexus[fieldMethod]((t) => {
          const opts = typeof options === "function" ? options() : options;
          const args = gatherArgs(opts);
          t.field(opts.name ?? key, {
            args,
            type: opts.type,
            resolve(root: any, args, ctx, info) {
              // @ts-expect-error
              return descriptor.value(args, ctx, info);
            },
          });
        })
      );
    };
  };

const queryField = rootField("queryField");
const mutationField = rootField("mutationField");

function gatherArgs(options: Pick<RootFieldOptions, "args">) {
  let args: Record<string, any> = {};
  if (options.args) {
    options.args(makeArgsBlock(args, []));
  }
  return args;
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
    field(name, opts) {
      // target[name] = Nexus.stringArg(opts)
    },
    get list() {
      return makeArgsBlock(target, wrapping.concat("list"));
    },
    get nonNull() {
      return makeArgsBlock(target, wrapping.concat("nonNull"));
    },
  };
}

function makeOutputType(
  makeType: OutputTypeFn,
  config: NxsObjectTypeConfig | NxsInterfaceTypeConfig
): ClassDecorator {
  const inFile = stackUtils.parseLine(
    new Error().stack?.split("\n")[3] ?? ""
  )?.file;
  return (_class) => {
    const name = config?.name ?? _class.name;
    if (typeLookup.has(name) || classLookup.has(_class)) {
      console.error(new Error(`Already saw registered ${name}`));
      return;
    }
    typeLookup.set(name, { typeFn: makeType, _class, inFile });
    classLookup.set(_class, config || {});
    let walkingProto = _class;
    // @ts-expect-error
    while (walkingProto.__proto__ !== Function.prototype) {
      // @ts-expect-error
      walkingProto = walkingProto.__proto__;
      if (classLookup.has(walkingProto)) {
        const configVal = classLookup.get(walkingProto);
        const lookupName = configVal.name ?? walkingProto.name;
        allTypes.push(
          Nexus.extendType({
            type: name,
            definition(t) {
              t.implements(lookupName);
            },
          })
        );
      }
    }
  };
}

interface NxsObjectTypeConfig
  extends Omit<NexusObjectTypeConfig<any>, "definition" | "name"> {
  name?: string;
  definition?: (t: ObjectDefinitionBlock<any>) => void;
}

interface NxsInterfaceTypeConfig
  extends Omit<NexusInterfaceTypeConfig<any>, "definition" | "name"> {
  name?: string;
  definition?: (t: ObjectDefinitionBlock<any>) => void;
}

function objectType(config: NxsObjectTypeConfig = {}) {
  return makeOutputType("objectType", config);
}

function interfaceType(config: NxsInterfaceTypeConfig = {}) {
  return makeOutputType("interfaceType", config);
}

function enumType(name: string, members: ReadonlyArray<string>) {
  const e = Nexus.enumType({
    name,
    members,
  });
  allTypes.push(e);
  return e;
}

function unionType(name: string, members: ReadonlyArray<string>) {
  const u = Nexus.unionType({
    name,
    definition(t) {
      t.members(members);
    },
  });
  allTypes.push(u);
  return u;
}

function getNameFor(_class: Function) {
  return _class.name;
}

function list(val: string | Function) {
  return Nexus.list(typeof val === "string" ? val : getNameFor(val));
}

function nonNull(val: string | Function) {
  return Nexus.nonNull(typeof val === "string" ? val : getNameFor(val));
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
  args: {
    int: Nexus.intArg,
    string: Nexus.stringArg,
    float: Nexus.floatArg,
    boolean: Nexus.booleanArg,
    id: Nexus.idArg,
  },
  Nexus,
};

export interface BuildSchemaWithDecoratorsConfig
  extends Omit<Nexus.core.SchemaConfig, "types"> {
  types?: any[];
}

/**
 * Creates a new GraphQL schema
 */
export function buildSchemaWithDecorators(
  schemaConfig: BuildSchemaWithDecoratorsConfig
) {
  for (const [name, meta] of typeLookup.entries()) {
    const { _class, inFile, typeFn } = meta;
    const config = classLookup.get(_class);
    let firstPass = true;
    allTypes.push(
      Nexus[typeFn]({
        name,
        ...config,
        definition(t: any) {
          const fields = fieldLookup.get(_class) ?? [];
          if (fields.length > 0) {
            for (const field of fields) {
              const {
                isStatic,
                wrapping,
                fnName,
                fnValue,
                type,
                fieldConfig: config,
              } = field;

              if ((name === "Query" || name === "Mutation") && !isStatic) {
                if (firstPass) {
                  console.error(
                    `Root field ${_class.name}.${fnName} should be static, skipping`
                  );
                }
                continue;
              }

              let builder = t;
              for (const call of wrapping) {
                builder = t[call] as any;
              }
              const args = gatherArgs(config);
              let resolve = undefined;
              if (typeof fnValue === "function" && isStatic) {
                resolve = (root: any, args: any, ctx: any, info: any) => {
                  return fnValue(args, ctx, info);
                };
              }

              //
              builder.field(fnName, {
                type: typeof type === "function" ? type().name : type,
                ...config,
                args,
                resolve,
              });
            }
          } else {
            t.id("todo");
          }
          firstPass = false;
        },
        sourceType: {
          module: inFile,
          export: _class.name,
        },
      })
    );
  }
  return Nexus.makeSchema({
    ...schemaConfig,
    types: [schemaConfig.types, allTypes],
    plugins: [
      connectionPlugin({
        //
        nexusFieldName: "connection",
      }),
    ],
  });
}
