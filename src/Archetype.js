export class Archetype {
  constructor() {}
}

// Array of component types consisting Archetype
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
