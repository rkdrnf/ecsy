"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Entity = void 0;

var _Query = _interopRequireDefault(require("./Query.js"));

var _WrapImmutableComponent = _interopRequireDefault(require("./WrapImmutableComponent.js"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class Entity {
  constructor(entityManager) {
    this._entityManager = entityManager || null; // Unique ID for this entity

    this.id = entityManager._nextEntityId++;
    this._Archetype = null; // Instance of the components

    this._components = {};
    this._componentsToRemove = {}; // Queries where the entity is added

    this.queries = []; // Used for deferred removal

    this._ComponentTypesToRemove = [];
    this.alive = false; //if there are state components on a entity, it can't be removed completely

    this.numStateComponents = 0;
  } // COMPONENTS


  getComponent(Component, includeRemoved) {
    var component = this._components[Component._typeId];

    if (!component && includeRemoved === true) {
      component = this._componentsToRemove[Component._typeId];
    }

    return process.env.NODE_ENV !== "production" ? (0, _WrapImmutableComponent.default)(Component, component) : component;
  }

  getRemovedComponent(Component) {
    const component = this._componentsToRemove[Component._typeId];
    return process.env.NODE_ENV !== "production" ? (0, _WrapImmutableComponent.default)(Component, component) : component;
  }

  getComponents() {
    return this._components;
  }

  getComponentsToRemove() {
    return this._componentsToRemove;
  }

  getComponentTypes() {
    return Object.values(this._components);
  }

  getMutableComponent(Component) {
    var component = this._components[Component._typeId];

    if (!component) {
      return;
    }

    for (var i = 0; i < this.queries.length; i++) {
      var query = this.queries[i];

      if (query.reactive && query.ComponentsMask[Component._typeId] && !query.NotComponentsMask[Component._typeId]) {
        query.eventDispatcher.dispatchEvent(_Query.default.prototype.COMPONENT_CHANGED, this, component);
      }
    }

    return component;
  }

  addComponent(Component, values) {
    this._entityManager.entityAddComponent(this, Component, values);

    return this;
  }

  removeComponent(Component, forceImmediate) {
    const component = this._components[Component._typeId];
    if (!component) return;

    if (component._isArchetype) {
      throw new Error(`Component in archetype can't be removed independantly`);
    }

    this._entityManager.entityRemoveComponent(this, Component, forceImmediate);

    return this;
  }

  hasComponent(Component, includeRemoved) {
    return !!this._components[Component._typeId] || includeRemoved === true && this.hasRemovedComponent(Component);
  }

  hasRemovedComponent(Component) {
    return !!~this._ComponentTypesToRemove.indexOf(Component);
  }

  hasAllComponents(Components) {
    return Components.every(c => this._components[c._typeId]);
  }

  hasAnyComponents(Components) {
    return Components.some(c => this._components[c._typeId]);
  }

  removeAllComponents(forceImmediate) {
    return this._entityManager.entityRemoveAllComponents(this, forceImmediate);
  }

  addArchetype(Archetype, values) {
    this._entityManager.entityAddArchetype(this, Archetype, values);

    return this;
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
    this._Archetype = null;
    this.id = this._entityManager._nextEntityId++;
    this.queries.length = 0;

    for (var ecsyComponentId in this._components) {
      delete this._components[ecsyComponentId];
    }
  }

  remove(forceImmediate) {
    return this._entityManager.removeEntity(this, forceImmediate);
  }

}

exports.Entity = Entity;