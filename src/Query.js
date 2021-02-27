import EventDispatcher from "./EventDispatcher.js";
import { queryKey } from "./Utils.js";

export default class Query {
  /**
   * @param {Array(Component)} Components List of types of components to query
   */
  constructor(Components, manager) {
    this.ComponentsMask = {};
    this.NotComponentsMask = {};
    this.Components = [];
    this.NotComponents = [];
    this.ArchetypesMask = {};

    Components.forEach((component) => {
      if (typeof component === "object") {
        this.NotComponentsMask[component.Component._typeId] = true;
        this.NotComponents.push(component.Component);
      } else {
        this.ComponentsMask[component._typeId] = true;
        this.Components.push(component);
      }
    });

    if (this.Components.length === 0) {
      throw new Error("Can't create a query without components");
    }

    this.entities = [];

    this.eventDispatcher = new EventDispatcher();

    // This query is being used by a reactive system
    this.reactive = false;

    this.key = queryKey(Components);

    // Fill the query with the existing entities
    for (var i = 0; i < manager._entities.length; i++) {
      var entity = manager._entities[i];
      if (this.match(entity)) {
        // @todo ??? this.addEntity(entity); => preventing the event to be generated
        entity.queries.push(this);
        this.entities.push(entity);
      }
    }
  }

  /**
   * Add entity to this query
   * @param {Entity} entity
   */
  addEntity(entity, nocheck = false) {
    this.entities.push(entity);

    this.eventDispatcher.dispatchEvent(
      Query.prototype.ENTITY_ADDED,
      entity,
      null,
      {
        nocheck,
      }
    );
  }

  /**
   * Remove entity from this query
   * @param {Entity} entity
   */
  removeEntity(entity, nocheck = false) {
    let index = this.entities.indexOf(entity);
    if (~index) {
      this.entities.splice(index, 1);

      this.eventDispatcher.dispatchEvent(
        Query.prototype.ENTITY_REMOVED,
        entity,
        null,
        { nocheck }
      );
    }
  }

  match(entity) {
    return (
      this.Components.every((c) => entity._components[c._typeId]) &&
      !this.NotComponents.some((c) => entity._components[c._typeId])
    );
  }

  matchArchetype(Archetype) {
    return (
      this.Components.every((c) => Archetype._Components[c._typeId]) &&
      !this.NotComponents.some((c) => Archetype._Components[c._typeId])
    );
  }

  toJSON() {
    return {
      key: this.key,
      reactive: this.reactive,
      components: {
        included: this.Components.map((C) => C.name),
        not: this.NotComponents.map((C) => C.name),
      },
      numEntities: this.entities.length,
    };
  }

  /**
   * Return stats for this query
   */
  stats() {
    return {
      numComponents: this.Components.length,
      numEntities: this.entities.length,
    };
  }
}

Query.prototype.ENTITY_ADDED = "Query#ENTITY_ADDED";
Query.prototype.ENTITY_REMOVED = "Query#ENTITY_REMOVED";
Query.prototype.COMPONENT_CHANGED = "Query#COMPONENT_CHANGED";
