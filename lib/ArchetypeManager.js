"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ArchetypeManager = void 0;

class ArchetypeManager {
  constructor() {
    this.Archetypes = [];
    this._ArchetypesMap = {};
    this.numArchetypes = {};
    this.nextArchetypeId = 0;
  }

  hasArchetype(Archetype) {
    return this.Archetypes.indexOf(Archetype) !== -1;
  }

  registerArchetype(Archetype) {
    if (this.Archetypes.indexOf(Archetype) !== -1) {
      console.warn(`Archetype type: '${Archetype.getName()}' already registered.`);
      return;
    }

    const schema = Archetype.schema;
    Archetype._Components = {};
    Archetype._ComponentKeys = [];

    if (!schema) {
      throw new Error(`Archetype "${Archetype.getName()}" has no schema property.`);
    }

    for (const key of Object.keys(schema)) {
      const Component = schema[key];

      if (!Component.isComponent) {
        throw new Error(`Invalid schema for archetype "${Archetype.getName()}". "${Component}" is not a component type.`);
      }

      if (Component._typeId === undefined) {
        throw new Error(`Invalid schema for archetype "${Archetype.getName()}". "${Component}" is not registered.`);
      }

      Archetype._Components[Component._typeId] = Component;

      Archetype._ComponentKeys.push(key);
    }

    Archetype._typeId = this.nextArchetypeId++;
    this.Archetypes.push(Archetype);
    this._ArchetypesMap[Archetype._typeId] = Archetype;
    this.numArchetypes[Archetype._typeId] = 0;
  }

  archetypeAddedToEntity(Archetype) {
    this.numArchetypes[Archetype._typeId]++;
  }

  archetypeRemovedFromEntity(Component) {
    this.numArchetypes[Archetype._typeId]--;
  }

}

exports.ArchetypeManager = ArchetypeManager;