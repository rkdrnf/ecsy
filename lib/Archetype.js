"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Archetype = void 0;

class Archetype {
  constructor() {}

} // Array of component types consisting Archetype


exports.Archetype = Archetype;
Archetype.schema = {};

Archetype.getName = function () {
  return this.displayName || this.name;
};
/* Use Scenario

entity.addArchetype(ArchetypeCls, [
  {component: ComponentCls, props: props},
  {component: ComponentCls, props: props},
  {component: ComponentCls, props: props},
  ...
])

*/