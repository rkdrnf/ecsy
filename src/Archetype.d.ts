import { ComponentConstructor, Component } from "./Component";

/**
 * Base class for archetypes.
 */

export type ArchetypeSchema = {
  [propName: string]: ComponentConstructor<any>;
};

export class Archetype {
  static schema: ArchetypeSchema;
}

export interface ArchetypeConstructor<A extends Archetype> {
  schema: ArchetypeSchema;
  new (): A;
}

type ArchetypeProps<A extends Archetype> = Partial<
  { [key in keyof A]: Partial<Omit<A[key], keyof Component<any>>> }
>;
