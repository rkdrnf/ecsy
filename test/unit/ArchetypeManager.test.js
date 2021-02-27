import test from "ava";
import { World, Component, Archetype } from "../../src/index.js";
import { FooComponent, BarComponent } from "../helpers/components";

test("registerArchetypes", (t) => {
  var world = new World();

  world.registerComponent(FooComponent);
  world.registerComponent(BarComponent);

  class FooArchetype extends Archetype {}
  FooArchetype.schema = {
    foo: FooComponent,
    bar: BarComponent,
  };

  // Can't register the same component twice
  world.registerArchetype(FooArchetype);
  world.registerArchetype(FooArchetype);
  t.is(Object.keys(world.archetypesManager.Archetypes).length, 1);
});

test("Register two archetype with the same name", (t) => {
  var world = new World();

  world.registerComponent(FooComponent);
  world.registerComponent(BarComponent);

  {
    class ArchetypeA extends Archetype {}
    ArchetypeA.schema = {
      foo: FooComponent,
      bar: BarComponent,
    };
    world.registerArchetype(ArchetypeA);
  }

  {
    class ArchetypeA extends Archetype {}
    ArchetypeA.schema = {
      foo: FooComponent,
      bar: BarComponent,
    };
    world.registerArchetype(ArchetypeA);
  }

  t.is(Object.keys(world.archetypesManager.Archetypes).length, 2);
});
