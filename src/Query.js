import EventDispatcher from "./EventDispatcher.js";
import { queryKey } from "./Utils.js";

export default class Query {
  /**
   * @param {Array(Component)} Components List of types of components to query
   */
  constructor(Components, manager) {
    this.ComponentsMask = 0n;
    this.NotComponentsMask = 0n;
    this.highestBit = 0;

    Components.forEach((component) => {
      if (typeof component === "object") {
        this.NotComponentsMask |= component.Component._typeBit;
      } else {
        this.ComponentsMask |= component._typeBit;
      }
      this.highestBit = Math.max(this.highestBit, component._typeId);
    });

    if (this.ComponentsMask === 0n) {
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
  addEntity(entity) {
    entity.queries.push(this);
    this.entities.push(entity);

    this.eventDispatcher.dispatchEvent(Query.prototype.ENTITY_ADDED, entity);
  }

  /**
   * Remove entity from this query
   * @param {Entity} entity
   */
  removeEntity(entity) {
    let index = this.entities.indexOf(entity);
    if (~index) {
      this.entities.splice(index, 1);

      index = entity.queries.indexOf(this);
      entity.queries.splice(index, 1);

      this.eventDispatcher.dispatchEvent(
        Query.prototype.ENTITY_REMOVED,
        entity
      );
    }
  }

  match(entity) {
    return (
      (entity._ComponentBits & this.ComponentsMask) === this.ComponentsMask &&
      !(entity._ComponentBits & this.NotComponentsMask)
    );
  }

  toJSON() {
    return {
      key: this.key,
      reactive: this.reactive,
      components: {
        included: this.ComponentsMask.map((C) => C.name),
        not: this.NotComponentsMask.map((C) => C.name),
      },
      numEntities: this.entities.length,
    };
  }

  /**
   * Return stats for this query
   */
  stats() {
    let mask = this.ComponentsMask;
    let num = 0;
    for (let i = 0; i <= this.highestBit; i++) {
      if (mask & 1n) num++;
      mask = mask >> 1n;
      if (mask === 0) {
        break;
      }
    }

    return {
      numComponents: num,
      numEntities: this.entities.length,
    };
  }
}

Query.prototype.ENTITY_ADDED = "Query#ENTITY_ADDED";
Query.prototype.ENTITY_REMOVED = "Query#ENTITY_REMOVED";
Query.prototype.COMPONENT_CHANGED = "Query#COMPONENT_CHANGED";
