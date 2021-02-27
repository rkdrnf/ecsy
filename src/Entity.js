import Query from "./Query.js";
import wrapImmutableComponent from "./WrapImmutableComponent.js";

export class Entity {
  constructor(entityManager) {
    this._entityManager = entityManager || null;

    // Unique ID for this entity
    this.id = entityManager._nextEntityId++;

    // List of components types the entity has
    this._ComponentTypes = [];
    this._ComponentBits = {};

    // Instance of the components
    this._components = {};

    this._componentsToRemove = {};

    // Queries where the entity is added
    this.queries = [];

    // Used for deferred removal
    this._ComponentTypesToRemove = [];

    this.alive = false;

    //if there are state components on a entity, it can't be removed completely
    this.numStateComponents = 0;
  }

  // COMPONENTS

  getComponent(Component, includeRemoved) {
    var component = this._components[Component._typeId];

    if (!component && includeRemoved === true) {
      component = this._componentsToRemove[Component._typeId];
    }

    return process.env.NODE_ENV !== "production"
      ? wrapImmutableComponent(Component, component)
      : component;
  }

  getRemovedComponent(Component) {
    const component = this._componentsToRemove[Component._typeId];

    return process.env.NODE_ENV !== "production"
      ? wrapImmutableComponent(Component, component)
      : component;
  }

  getComponents() {
    return this._components;
  }

  getComponentsToRemove() {
    return this._componentsToRemove;
  }

  getComponentTypes() {
    return this._ComponentTypes;
  }

  getMutableComponent(Component) {
    var component = this._components[Component._typeId];

    if (!component) {
      return;
    }

    for (var i = 0; i < this.queries.length; i++) {
      var query = this.queries[i];
      if (
        query.reactive &&
        query.ComponentsMask[Component._typeId] &&
        !query.NotComponentsMask[Component._typeId]
      ) {
        query.eventDispatcher.dispatchEvent(
          Query.prototype.COMPONENT_CHANGED,
          this,
          component
        );
      }
    }
    return component;
  }

  addComponent(Component, values) {
    this._entityManager.entityAddComponent(this, Component, values);
    return this;
  }

  removeComponent(Component, forceImmediate) {
    this._entityManager.entityRemoveComponent(this, Component, forceImmediate);
    return this;
  }

  hasComponent(Component, includeRemoved) {
    return (
      !!(this._ComponentBits[Component._typeId]) ||
      (includeRemoved === true && this.hasRemovedComponent(Component))
    );
  }

  hasRemovedComponent(Component) {
    return !!~this._ComponentTypesToRemove.indexOf(Component);
  }

  hasAllComponents(Components) {
    return Components.every(c => this._ComponentBits[c._typeId]);
  }

  hasAnyComponents(Components) {
    return Components.some(c => this._ComponentBits[c._typeId]);
  }

  removeAllComponents(forceImmediate) {
    return this._entityManager.entityRemoveAllComponents(this, forceImmediate);
  }

  copy(src) {
    // TODO: This can definitely be optimized
    for (var ecsyComponentId in src._components) {
      var srcComponent = src._components[ecsyComponentId];
      this.addComponent(srcComponent.constructor);
      var component = this.getComponent(srcComponent.constructor);
      component.copy(srcComponent);
    }

    return this;
  }

  clone() {
    return new Entity(this._entityManager).copy(this);
  }

  reset() {
    this.id = this._entityManager._nextEntityId++;
    this._ComponentTypes.length = 0;
    this._ComponentBits = 0n;
    this.queries.length = 0;

    for (var ecsyComponentId in this._components) {
      delete this._components[ecsyComponentId];
    }
  }

  remove(forceImmediate) {
    return this._entityManager.removeEntity(this, forceImmediate);
  }
}
