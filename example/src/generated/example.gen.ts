/**
 * This file was generated by Nexus Schema
 * Do not make changes to this file directly
 */


import type { App } from "./../models/App"
import type { Node } from "./../models/Node"
import type { User } from "./../models/User"
import type { Post } from "./../models/Post"




declare global {
  interface NexusGen extends NexusGenTypes {}
}

export interface NexusGenInputs {
}

export interface NexusGenEnums {
}

export interface NexusGenScalars {
  String: string
  Int: number
  Float: number
  Boolean: boolean
  ID: string
}

export interface NexusGenObjects {
  Comment: {};
  Post: Post;
  Query: App;
  User: User;
}

export interface NexusGenInterfaces {
  Node: Node;
}

export interface NexusGenUnions {
}

export type NexusGenRootTypes = NexusGenInterfaces & NexusGenObjects

export type NexusGenAllTypes = NexusGenRootTypes & NexusGenScalars

export interface NexusGenFieldTypes {
  Comment: { // field return type
    content: string | null; // String
  }
  Post: { // field return type
    abc: string | null; // String
    author: NexusGenRootTypes['User'] | null; // User
    comments: Array<NexusGenRootTypes['Comment'] | null> | null; // [Comment]
    contents: string | null; // String
    id: string; // ID!
    ok: boolean | null; // Boolean
    title: string | null; // String
  }
  Query: { // field return type
    node: NexusGenRootTypes['Node'] | null; // Node
    posts: NexusGenRootTypes['Post'][] | null; // [Post!]
    userByEmail: NexusGenRootTypes['User'] | null; // User
    users: Array<NexusGenRootTypes['User'] | null> | null; // [User]
  }
  User: { // field return type
    email: string | null; // String
    firstName: string | null; // String
    fullName: string | null; // String
    id: string; // ID!
    lastName: string | null; // String
    posts: Array<NexusGenRootTypes['Post'] | null>; // [Post]!
  }
  Node: { // field return type
    id: string; // ID!
  }
}

export interface NexusGenFieldTypeNames {
  Comment: { // field return type name
    content: 'String'
  }
  Post: { // field return type name
    abc: 'String'
    author: 'User'
    comments: 'Comment'
    contents: 'String'
    id: 'ID'
    ok: 'Boolean'
    title: 'String'
  }
  Query: { // field return type name
    node: 'Node'
    posts: 'Post'
    userByEmail: 'User'
    users: 'User'
  }
  User: { // field return type name
    email: 'String'
    firstName: 'String'
    fullName: 'String'
    id: 'ID'
    lastName: 'String'
    posts: 'Post'
  }
  Node: { // field return type name
    id: 'ID'
  }
}

export interface NexusGenArgTypes {
  Query: {
    node: { // args
      id: string; // ID!
    }
    userByEmail: { // args
      email?: string | null; // String
    }
  }
}

export interface NexusGenAbstractTypeMembers {
  Node: "Post" | "User"
}

export interface NexusGenTypeInterfaces {
  Post: "Node"
  User: "Node"
}

export type NexusGenObjectNames = keyof NexusGenObjects;

export type NexusGenInputNames = never;

export type NexusGenEnumNames = never;

export type NexusGenInterfaceNames = keyof NexusGenInterfaces;

export type NexusGenScalarNames = keyof NexusGenScalars;

export type NexusGenUnionNames = never;

export type NexusGenObjectsUsingAbstractStrategyIsTypeOf = never;

export type NexusGenAbstractsUsingStrategyResolveType = "Node";

export type NexusGenFeaturesConfig = {
  abstractTypeStrategies: {
    isTypeOf: false
    resolveType: true
    __typename: false
  }
}

export interface NexusGenTypes {
  context: any;
  inputTypes: NexusGenInputs;
  rootTypes: NexusGenRootTypes;
  inputTypeShapes: NexusGenInputs & NexusGenEnums & NexusGenScalars;
  argTypes: NexusGenArgTypes;
  fieldTypes: NexusGenFieldTypes;
  fieldTypeNames: NexusGenFieldTypeNames;
  allTypes: NexusGenAllTypes;
  typeInterfaces: NexusGenTypeInterfaces;
  objectNames: NexusGenObjectNames;
  inputNames: NexusGenInputNames;
  enumNames: NexusGenEnumNames;
  interfaceNames: NexusGenInterfaceNames;
  scalarNames: NexusGenScalarNames;
  unionNames: NexusGenUnionNames;
  allInputTypes: NexusGenTypes['inputNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['scalarNames'];
  allOutputTypes: NexusGenTypes['objectNames'] | NexusGenTypes['enumNames'] | NexusGenTypes['unionNames'] | NexusGenTypes['interfaceNames'] | NexusGenTypes['scalarNames'];
  allNamedTypes: NexusGenTypes['allInputTypes'] | NexusGenTypes['allOutputTypes']
  abstractTypes: NexusGenTypes['interfaceNames'] | NexusGenTypes['unionNames'];
  abstractTypeMembers: NexusGenAbstractTypeMembers;
  objectsUsingAbstractStrategyIsTypeOf: NexusGenObjectsUsingAbstractStrategyIsTypeOf;
  abstractsUsingStrategyResolveType: NexusGenAbstractsUsingStrategyResolveType;
  features: NexusGenFeaturesConfig;
}


declare global {
  interface NexusGenPluginTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginInputTypeConfig<TypeName extends string> {
  }
  interface NexusGenPluginFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginInputFieldConfig<TypeName extends string, FieldName extends string> {
  }
  interface NexusGenPluginSchemaConfig {
  }
  interface NexusGenPluginArgConfig {
  }
}