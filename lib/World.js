"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.World = void 0;

var _SystemManager = require("./SystemManager.js");

var _EntityManager = require("./EntityManager.js");

var _ComponentManager = require("./ComponentManager.js");

var _ArchetypeManager = require("./ArchetypeManager.js");

var _Version = require("./Version.js");

var _Utils = require("./Utils.js");

var _Entity = require("./Entity.js");

const DEFAULT_OPTIONS = {
  entityPoolSize: 0,
  entityClass: _Entity.Entity
};

class World {
  constructor(options = {}) {
    this.options = Object.assign({}, DEFAULT_OPTIONS, options);
    this.componentsManager = new _ComponentManager.ComponentManager(this);
    this.archetypesManager = new _ArchetypeManager.ArchetypeManager(this);
    this.entityManager = new _EntityManager.EntityManager(this);
    this.systemManager = new _SystemManager.SystemManager(this);
    this.enabled = true;
    this.eventQueues = {};

    if (_Utils.hasWindow && typeof CustomEvent !== "undefined") {
      var event = new CustomEvent("ecsy-world-created", {
        detail: {
          world: this,
          version: _Version.Version
        }
      });
      window.dispatchEvent(event);
    }

    this.lastTime = (0, _Utils.now)() / 1000;
  }

  registerComponent(Component, objectPool) {
    this.componentsManager.registerComponent(Component, objectPool);
    return this;
  }

  registerArchetype(Archetype) {
    this.archetypesManager.registerArchetype(Archetype);
    return this;
  }

  registerSystem(System, attributes) {
    this.systemManager.registerSystem(System, attributes);
    return this;
  }

  hasRegisteredComponent(Component) {
    return this.componentsManager.hasComponent(Component);
  }

  hasRegisteredArchetype(Archetype) {
    return this.archetypesManager.hasArchetype(Archetype);
  }

  unregisterSystem(System) {
    this.systemManager.unregisterSystem(System);
    return this;
  }

  getSystem(SystemClass) {
    return this.systemManager.getSystem(SystemClass);
  }

  getSystems() {
    return this.systemManager.getSystems();
  }

  execute(delta, time) {
    if (!delta) {
      time = (0, _Utils.now)() / 1000;
      delta = time - this.lastTime;
      this.lastTime = time;
    }

    if (this.enabled) {
      this.systemManager.execute(delta, time);
      this.entityManager.processDeferredRemoval();
    }
  }

  stop() {
    this.enabled = false;
  }

  play() {
    this.enabled = true;
  }

  createEntity(name) {
    return this.entityManager.createEntity(name);
  }

  stats() {
    var stats = {
      entities: this.entityManager.stats(),
      system: this.systemManager.stats()
    };
    return stats;
  }

}

exports.World = World;