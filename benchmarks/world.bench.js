import { Archetype, System } from "../src/index.js";
import { World } from "../src/World.js";
import {
  Component1,
  Component2,
  Component3,
  Component4,
  Component5,
  Component6,
  TestArchetype,
} from "./helpers/components.js";

export function init(benchmarks) {
  benchmarks
    .group("world")
    .add({
      name: "new World({ entityPoolSize: 100k })",
      execute: () => {
        new World({ entityPoolSize: 100000 });
      },
      iterations: 10,
    })
    .add({
      name: "World::createEntity (100k empty, recreating world)",
      execute: () => {
        let world = new World();
        for (let i = 0; i < 100000; i++) {
          world.createEntity();
        }
      },
      iterations: 10,
    })
    .add({
      name:
        "World::createEntity (100k empty, recreating world (poolSize: 100k))",
      execute: () => {
        let world = new World({ entityPoolSize: 100000 });
        for (let i = 0; i < 100000; i++) {
          world.createEntity();
        }
      },
      iterations: 10,
    })
    .add({
      name:
        "World::createEntity (100k empty, recreating world (not measured), entityPoolSize = 100k)",
      prepare: (ctx) => {
        ctx.world = new World({ entityPoolSize: 100000 });
      },
      execute: (ctx) => {
        for (let i = 0; i < 100000; i++) {
          ctx.world.createEntity();
        }
      },
      iterations: 10,
    })
    .add({
      name:
        "World::createEntity(name) (100k empty, recreating world (not measured), entityPoolSize = 100k)",
      prepare: (ctx) => {
        ctx.world = new World({ entityPoolSize: 100000 });
      },
      execute: (ctx) => {
        for (let i = 0; i < 100000; i++) {
          ctx.world.createEntity("name" + i);
        }
      },
      iterations: 10,
    })
    .add({
      name:
        "World::createEntity (100k empty, reuse world, entityPoolSize = 100k * 10)",
      prepareGlobal: (ctx) => {
        ctx.world = new World({ entityPoolSize: 100000 * 10 });
      },
      execute: (ctx) => {
        for (let i = 0; i < 100000; i++) {
          ctx.world.createEntity();
        }
      },
      iterations: 10,
    })
    .add({
      name: "addComponent 6 components",
      prepare: (ctx) => {
        ctx.world = new World();
        ctx.world.registerComponent(Component1);
        ctx.world.registerComponent(Component2);
        ctx.world.registerComponent(Component3);
        ctx.world.registerComponent(Component4);
        ctx.world.registerComponent(Component5);
        ctx.world.registerComponent(Component6);

        class TestSystem1 extends System {
          execute() {}
        }

        TestSystem1.queries = {
          targets: {
            components: [Component1],
          },
        };

        class TestSystem2 extends System {
          execute() {}
        }

        TestSystem2.queries = {
          targets: {
            components: [Component2],
          },
        };

        class TestSystem3 extends System {
          execute() {}
        }

        TestSystem3.queries = {
          targets: {
            components: [Component3],
          },
        };

        class TestSystem4 extends System {
          execute() {}
        }

        TestSystem4.queries = {
          targets: {
            components: [Component4],
          },
        };

        class TestSystem5 extends System {
          execute() {}
        }

        TestSystem5.queries = {
          targets: {
            components: [Component5],
          },
        };

        class TestSystem6 extends System {
          execute() {}
        }

        TestSystem6.queries = {
          targets: {
            components: [Component6],
          },
        };

        ctx.world.registerSystem(TestSystem1);
        ctx.world.registerSystem(TestSystem2);
        ctx.world.registerSystem(TestSystem3);
        ctx.world.registerSystem(TestSystem4);
        ctx.world.registerSystem(TestSystem5);
        ctx.world.registerSystem(TestSystem6);

        for (let i = 0; i < 1000; i++) {
          ctx.world.createEntity();
        }
      },
      execute: (ctx) => {
        for (let i = 0; i < 1000; i++) {
          ctx.world.entityManager._entities[i]
            .addComponent(Component1)
            .addComponent(Component2)
            .addComponent(Component3)
            .addComponent(Component4)
            .addComponent(Component5)
            .addComponent(Component6);
        }
      },
      iterations: 100,
    })
    .add({
      name: "addArchetype of 6 components",
      prepare: (ctx) => {
        ctx.world = new World();
        ctx.world.registerComponent(Component1);
        ctx.world.registerComponent(Component2);
        ctx.world.registerComponent(Component3);
        ctx.world.registerComponent(Component4);
        ctx.world.registerComponent(Component5);
        ctx.world.registerComponent(Component6);

        ctx.world.registerArchetype(TestArchetype);

        class TestSystem1 extends System {
          execute() {}
        }

        TestSystem1.queries = {
          targets: {
            components: [Component1],
          },
        };

        class TestSystem2 extends System {
          execute() {}
        }

        TestSystem2.queries = {
          targets: {
            components: [Component2],
          },
        };

        class TestSystem3 extends System {
          execute() {}
        }

        TestSystem3.queries = {
          targets: {
            components: [Component3],
          },
        };

        class TestSystem4 extends System {
          execute() {}
        }

        TestSystem4.queries = {
          targets: {
            components: [Component4],
          },
        };

        class TestSystem5 extends System {
          execute() {}
        }

        TestSystem5.queries = {
          targets: {
            components: [Component5],
          },
        };

        class TestSystem6 extends System {
          execute() {}
        }

        TestSystem6.queries = {
          targets: {
            components: [Component6],
          },
        };

        ctx.world.registerSystem(TestSystem1);
        ctx.world.registerSystem(TestSystem2);
        ctx.world.registerSystem(TestSystem3);
        ctx.world.registerSystem(TestSystem4);
        ctx.world.registerSystem(TestSystem5);
        ctx.world.registerSystem(TestSystem6);

        for (let i = 0; i < 1000; i++) {
          ctx.world.createEntity();
        }
      },
      execute: (ctx) => {
        for (let i = 0; i < 1000; i++) {
          ctx.world.entityManager._entities[i].addArchetype(TestArchetype);
        }
      },
      iterations: 100,
    });
}
