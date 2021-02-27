import Query from "./Query.js";
import { queryKey } from "./Utils.js";

/**
 * @private
 * @class QueryManager
 */
export default class QueryManager {
  constructor(world) {
    this._world = world;

    // Queries indexed by a unique identifier for the components it has
    this._queries = {};

    this._componentQueryMap = {};
    this._archetypeQueryMap = {};
  }

  onEntityRemoved(entity) {
    for (const query of entity.queries) {
      query.removeEntity(entity);
    }
    entity.queries = [];
  }

  onEntityArchetypeAdded(entity, Archetype) {
    if (!this._archetypeQueryMap[Archetype._typeId]) return;
    // Check each indexed query to see if we need to add this entity to the list
    for (const query of this._archetypeQueryMap[Archetype._typeId]) {
      query.addEntity(entity);
      entity.queries.push(query);
    }
  }

  /**
   * Callback when a component is added to an entity
   * @param {Entity} entity Entity that just got the new component
   * @param {Component} Component Component added to the entity
   */
  onEntityComponentAdded(entity, Component) {
    if (!this._componentQueryMap[Component._typeId]) return;
    // Check each indexed query to see if we need to add this entity to the list
    for (const query of this._componentQueryMap[Component._typeId]) {
      if (
        query.NotComponentsMask[Component._typeId] &&
        ~query.entities.indexOf(entity)
      ) {
        query.removeEntity(entity);
        const index = entity.queries.indexOf(this);
        entity.queries.splice(index, 1);
        continue;
      }

      // Add the entity only if:
      // Component is in the query
      // and Entity has ALL the components of the query
      // and Entity is not already in the query
      if (
        !query.ComponentsMask[Component._typeId] ||
        !query.match(entity) ||
        ~query.entities.indexOf(entity)
      )
        continue;

      query.addEntity(entity);
      entity.queries.push(query);
    }
  }

  /**
   * Callback when a component is removed from an entity
   * @param {Entity} entity Entity to remove the component from
   * @param {Component} Component Component to remove from the entity
   */
  onEntityComponentRemoved(entity, Component) {
    if (!this._componentQueryMap[Component._typeId]) return;

    for (const query of this._componentQueryMap[Component._typeId]) {
      if (
        query.NotComponentsMask[Component._typeId] &&
        !~query.entities.indexOf(entity) &&
        query.match(entity)
      ) {
        query.addEntity(entity);
        entity.queries.push(query);
        continue;
      }

      if (
        query.ComponentsMask[Component._typeId] &&
        !!~query.entities.indexOf(entity) &&
        !query.match(entity)
      ) {
        query.removeEntity(entity);
        const index = entity.queries.indexOf(this);
        entity.queries.splice(index, 1);
        continue;
      }
    }
  }

  /**
   * Get a query for the specified components
   * @param {Component} Components Components that the query should have
   */
  getQuery(Components) {
    var key = queryKey(Components);
    var query = this._queries[key];
    if (!query) {
      this._queries[key] = query = new Query(Components, this._world.entityManager);

      const Archetypes = this._world.archetypesManager.Archetypes.filter((a) =>
        query.matchArchetype(a)
      );

      Archetypes.forEach((a) => {
        if (!this._archetypeQueryMap[a._typeId]) {
          this._archetypeQueryMap[a._typeId] = [];
        }
        this._archetypeQueryMap[a._typeId].push(query);
      });

      Components.forEach((c) => {
        let component = typeof c === "object" ? c.Component : c;

        if (!this._componentQueryMap[component._typeId]) {
          this._componentQueryMap[component._typeId] = [];
        }
        this._componentQueryMap[component._typeId].push(query);
      });
    }
    return query;
  }

  /**
   * Return some stats from this class
   */
  stats() {
    var stats = {};
    for (var queryName in this._queries) {
      stats[queryName] = this._queries[queryName].stats();
    }
    return stats;
  }
}
