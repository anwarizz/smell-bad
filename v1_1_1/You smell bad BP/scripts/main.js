import { world, system, ItemStack } from "@minecraft/server";

function posTag(loc) {
  return `at_${loc.x}_${loc.y}_${loc.z}`;
}

const activeGrinders = new Set();

const prevPositions = new Map();

// Ensure the scoreboard objective exists (harmless if already present)
// world
//   .getDimension("overworld")
//   .runCommandAsync("scoreboard objectives add stink_level dummy")
//   .catch(() => {});

world.afterEvents.playerSpawn.subscribe(({ initialSpawn, player }) => {
  if (initialSpawn) {
    if (player?.getDynamicProperty("stink_lvc") == undefined) {
      player?.setDynamicProperty("stink_lvc", 1);
      player.onScreenDisplay.setTitle(`          `);
    } else {
      const stink_lv = player.getDynamicProperty("stink_lv");

      if (stink_lv <= 100) {
        player.onScreenDisplay.setTitle(`          `);
        player.setDynamicProperty("stink_lvc", 2);
      } else if (stink_lv > 100 && stink_lv <= 200) {
        player.onScreenDisplay.setTitle(`         `);
        player.setDynamicProperty("stink_lvc", 3);
      } else if (stink_lv > 200 && stink_lv <= 300) {
        player.onScreenDisplay.setTitle(`        `);
        player.setDynamicProperty("stink_lvc", 4);
      } else if (stink_lv > 300 && stink_lv <= 400) {
        player.onScreenDisplay.setTitle(`       `);
        player.setDynamicProperty("stink_lvc", 5);
      } else if (stink_lv > 400 && stink_lv <= 500) {
        player.onScreenDisplay.setTitle(`      `);
        player.setDynamicProperty("stink_lvc", 6);
      } else if (stink_lv > 500 && stink_lv <= 600) {
        player.onScreenDisplay.setTitle(`     `);
        player.setDynamicProperty("stink_lvc", 7);
      } else if (stink_lv > 600 && stink_lv <= 700) {
        player.onScreenDisplay.setTitle(`    `);
        player.setDynamicProperty("stink_lvc", 8);
      } else if (stink_lv > 700 && stink_lv <= 800) {
        player.onScreenDisplay.setTitle(`   `);
        player.setDynamicProperty("stink_lvc", 9);
      } else if (stink_lv > 800 && stink_lv <= 900) {
        player.onScreenDisplay.setTitle(`  `);
        player.setDynamicProperty("stink_lvc", 10);
      } else if (stink_lv > 900 && stink_lv <= 1000) {
        player.onScreenDisplay.setTitle(` `);
        player.setDynamicProperty("stink_lvc", 11);
      } else if (stink_lv >= 1000) {
        player.onScreenDisplay.setTitle(`           `);
        const cmd = `effect @e[family=!poison_counter,name=!${player.name},r=5] poison 5 0`;
        const cmd2 = `event entity ${player.name} stink`;
        const cmd3 = `title ${player.name} actionbar §cYou smell bad.`;
        player.runCommandAsync(cmd);
        player.runCommandAsync(cmd2);
        player.runCommandAsync(cmd3);
        player.setDynamicProperty("stink_lvc", 11);
      }
    }
  }
});

system.runInterval(() => {
  try {
    const dim = world.getDimension("overworld");
    for (const player of world.getPlayers()) {
      try {
        const name = player.name;
        const pos = player.location;
        const prev = prevPositions.get(name);

        // hitung perpindahan horizontal (blocks per second kira-kira)
        let horizSpeed = 0;
        let vertDelta = 0;
        if (prev) {
          const dx = pos.x - prev.x;
          const dz = pos.z - prev.z;
          const dy = pos.y - prev.y;
          horizSpeed = Math.sqrt(dx * dx + dz * dz); // horiz distance per second (interval = 1s)
          vertDelta = dy;
        }

        // simpan posisi untuk ronde berikutnya
        prevPositions.set(name, { x: pos.x, y: pos.y, z: pos.z });

        // tentukan increment berdasarkan aktivitas
        let increment = 0;

        // prioritas: jika pemain sprint atau kecepatan tinggi => sprint
        if (player.isSprinting || horizSpeed >= 1.5) {
          increment += 5;
        } else if (horizSpeed >= 0.08) {
          // berjalan (threshold bisa disesuaikan)
          increment += 1;
        }

        // deteksi lompat (isJumping tersedia; vertical delta juga membantu)
        if (player.isJumping || vertDelta > 0.45) {
          increment += 3;
        }

        if (increment > 0) {
          if (player?.getDynamicProperty("stink_lv") >= 1) {
            player?.setDynamicProperty(
              "stink_lv",
              player?.getDynamicProperty("stink_lv") + increment
            );
          } else {
            player?.setDynamicProperty("stink_lv", 1);
          }
        }
      } catch (e) {
        // ignore per-player errors
      }
    }
  } catch (e) {
    // ignore loop errors
  }
}, 20);

// Jika stink level mencapai 5 atau lebih, maka setiap entity disekitar player dari jarak 5 block akan mendapat damage
// Run every 20 ticks (~1 second) and apply damage to nearby entities when stink_level >= 5
system.runInterval(() => {
  // world.sendMessage("Checking stink damage...");
  try {
    for (const player of world.getPlayers()) {
      try {
        const name = player.name;

        const stink_lv = player.getDynamicProperty("stink_lv");

        const stink_lvc = player.getDynamicProperty("stink_lvc");

        if (stink_lv <= 100 && stink_lvc == 1) {
          player.onScreenDisplay.setTitle(`          `);
          player.setDynamicProperty("stink_lvc", 2);
        } else if (stink_lv > 100 && stink_lv <= 200 && stink_lvc == 2) {
          player.onScreenDisplay.setTitle(`         `);
          player.setDynamicProperty("stink_lvc", 3);
        } else if (stink_lv > 200 && stink_lv <= 300 && stink_lvc == 3) {
          player.onScreenDisplay.setTitle(`        `);
          player.setDynamicProperty("stink_lvc", 4);
        } else if (stink_lv > 300 && stink_lv <= 400 && stink_lvc == 4) {
          player.onScreenDisplay.setTitle(`       `);
          player.setDynamicProperty("stink_lvc", 5);
        } else if (stink_lv > 400 && stink_lv <= 500 && stink_lvc == 5) {
          player.onScreenDisplay.setTitle(`      `);
          player.setDynamicProperty("stink_lvc", 6);
        } else if (stink_lv > 500 && stink_lv <= 600 && stink_lvc == 6) {
          player.onScreenDisplay.setTitle(`     `);
          player.setDynamicProperty("stink_lvc", 7);
        } else if (stink_lv > 600 && stink_lv <= 700 && stink_lvc == 7) {
          player.onScreenDisplay.setTitle(`    `);
          player.setDynamicProperty("stink_lvc", 8);
        } else if (stink_lv > 700 && stink_lv <= 800 && stink_lvc == 8) {
          player.onScreenDisplay.setTitle(`   `);
          player.setDynamicProperty("stink_lvc", 9);
        } else if (stink_lv > 800 && stink_lv <= 900 && stink_lvc == 9) {
          player.onScreenDisplay.setTitle(`  `);
          player.setDynamicProperty("stink_lvc", 10);
        } else if (stink_lv > 900 && stink_lv <= 1000 && stink_lvc == 10) {
          player.onScreenDisplay.setTitle(` `);
          player.setDynamicProperty("stink_lvc", 11);
        } else if (stink_lv >= 1000) {
          if (stink_lvc == 11) {
            player.onScreenDisplay.setTitle(`           `);
          }

          const cmd = `effect @e[family=!poison_counter,name=!${name},r=5] poison 5 0`;
          const cmd2 = `event entity ${name} stink`;
          const cmd3 = `title ${name} actionbar §cYou smell bad.`;
          player.runCommandAsync(cmd);
          player.runCommandAsync(cmd2);
          player.runCommandAsync(cmd3);
          player.setDynamicProperty("stink_lvc", 12);
        }
      } catch (e) {
        // ignore per-player errors
      }
    }
  } catch (e) {
    // ignore errors in the stink damage loop
  }
});

system.runInterval(() => {
  for (const player of world.getPlayers()) {
    try {
      const stink_lv = player.getDynamicProperty("stink_lv");

      if (stink_lv >= 1000) {
        const particleCmd = `particle minecraft:mobspell_emitter ~ ~1.3 ~`;
        player.runCommandAsync(particleCmd).catch(() => {});
      }
    } catch (e) {
      // ignore per-player errors
    }
  }
}, 4);

// smelled_2 entity effect application
system.runInterval(() => {
  try {
    const dim = world.getDimension("overworld");
    const smelled2Entities = dim.getEntities({ type: "sobs:smelled_2" });
    for (const ent of smelled2Entities) {
      const nearbyPlayers = dim.getEntities({
        type: "minecraft:player",
        location: ent.location,
        maxDistance: 10,
      });
      for (const player of nearbyPlayers) {
        // jalankan sebagai player sehingga @s merujuk ke pemain itu
        player.runCommandAsync("effect @s poison 5 0").catch(() => {});
        player.runCommandAsync("effect @s slowness 5 1").catch(() => {});
      }
    }
  } catch (e) {
    // ignore
  }
}, 20);

world.afterEvents.entityHitEntity.subscribe((event) => {
  const { damagingEntity, hitEntity } = event;

  if (hitEntity.typeId != "minecraft:player") return;

  if (damagingEntity.typeId === "sobs:smelled_3") {
    world
      .getDimension("overworld")
      .spawnEntity("sobs:smelled_3", hitEntity.location);
  }

  if (
    damagingEntity.typeId === "sobs:smelled_1" ||
    damagingEntity.typeId === "sobs:smelled_1_2" ||
    damagingEntity.typeId === "sobs:smelled_2" ||
    damagingEntity.typeId === "sobs:smelled_3"
  ) {
    hitEntity.runCommandAsync("effect @s poison 5 0").catch(() => {});
  }

  if (damagingEntity.typeId === "sobs:smelled_1") {
    if (hitEntity?.getDynamicProperty("stink_lv") >= 1) {
      hitEntity?.setDynamicProperty(
        "stink_lv",
        hitEntity?.getDynamicProperty("stink_lv") + 100
      );

      const stink_lv = hitEntity?.getDynamicProperty("stink_lv");
      const player = hitEntity;
      const name = hitEntity.name;

      if (stink_lv <= 100) {
        player.onScreenDisplay.setTitle(`          `);
        player.setDynamicProperty("stink_lvc", 2);
      } else if (stink_lv > 100 && stink_lv <= 200) {
        player.onScreenDisplay.setTitle(`         `);
        player.setDynamicProperty("stink_lvc", 3);
      } else if (stink_lv > 200 && stink_lv <= 300) {
        player.onScreenDisplay.setTitle(`        `);
        player.setDynamicProperty("stink_lvc", 4);
      } else if (stink_lv > 300 && stink_lv <= 400) {
        player.onScreenDisplay.setTitle(`       `);
        player.setDynamicProperty("stink_lvc", 5);
      } else if (stink_lv > 400 && stink_lv <= 500) {
        player.onScreenDisplay.setTitle(`      `);
        player.setDynamicProperty("stink_lvc", 6);
      } else if (stink_lv > 500 && stink_lv <= 600) {
        player.onScreenDisplay.setTitle(`     `);
        player.setDynamicProperty("stink_lvc", 7);
      } else if (stink_lv > 600 && stink_lv <= 700) {
        player.onScreenDisplay.setTitle(`    `);
        player.setDynamicProperty("stink_lvc", 8);
      } else if (stink_lv > 700 && stink_lv <= 800) {
        player.onScreenDisplay.setTitle(`   `);
        player.setDynamicProperty("stink_lvc", 9);
      } else if (stink_lv > 800 && stink_lv <= 900) {
        player.onScreenDisplay.setTitle(`  `);
        player.setDynamicProperty("stink_lvc", 10);
      } else if (stink_lv > 900 && stink_lv <= 1000) {
        player.onScreenDisplay.setTitle(` `);
        player.setDynamicProperty("stink_lvc", 11);
      } else if (stink_lv >= 1000) {
        player.onScreenDisplay.setTitle(`           `);

        const cmd = `effect @e[family=!poison_counter,name=!${name},r=5] poison 5 0`;
        const cmd2 = `event entity ${name} stink`;
        const cmd3 = `title ${name} actionbar §cYou smell bad.`;
        player.runCommandAsync(cmd);
        player.runCommandAsync(cmd2);
        player.runCommandAsync(cmd3);
        player.setDynamicProperty("stink_lvc", 12);
      }
    } else {
      hitEntity?.setDynamicProperty("stink_lv", 1);
    }
  }

  if (damagingEntity.typeId === "sobs:smelled_2") {
    if (hitEntity?.getDynamicProperty("stink_lv") >= 1) {
      hitEntity?.setDynamicProperty(
        "stink_lv",
        hitEntity?.getDynamicProperty("stink_lv") + 200
      );

      const stink_lv = hitEntity?.getDynamicProperty("stink_lv");
      const player = hitEntity;
      const name = hitEntity.name;

      if (stink_lv <= 100) {
        player.onScreenDisplay.setTitle(`          `);
        player.setDynamicProperty("stink_lvc", 2);
      } else if (stink_lv > 100 && stink_lv <= 200) {
        player.onScreenDisplay.setTitle(`         `);
        player.setDynamicProperty("stink_lvc", 3);
      } else if (stink_lv > 200 && stink_lv <= 300) {
        player.onScreenDisplay.setTitle(`        `);
        player.setDynamicProperty("stink_lvc", 4);
      } else if (stink_lv > 300 && stink_lv <= 400) {
        player.onScreenDisplay.setTitle(`       `);
        player.setDynamicProperty("stink_lvc", 5);
      } else if (stink_lv > 400 && stink_lv <= 500) {
        player.onScreenDisplay.setTitle(`      `);
        player.setDynamicProperty("stink_lvc", 6);
      } else if (stink_lv > 500 && stink_lv <= 600) {
        player.onScreenDisplay.setTitle(`     `);
        player.setDynamicProperty("stink_lvc", 7);
      } else if (stink_lv > 600 && stink_lv <= 700) {
        player.onScreenDisplay.setTitle(`    `);
        player.setDynamicProperty("stink_lvc", 8);
      } else if (stink_lv > 700 && stink_lv <= 800) {
        player.onScreenDisplay.setTitle(`   `);
        player.setDynamicProperty("stink_lvc", 9);
      } else if (stink_lv > 800 && stink_lv <= 900) {
        player.onScreenDisplay.setTitle(`  `);
        player.setDynamicProperty("stink_lvc", 10);
      } else if (stink_lv > 900 && stink_lv <= 1000) {
        player.onScreenDisplay.setTitle(` `);
        player.setDynamicProperty("stink_lvc", 11);
      } else if (stink_lv >= 1000) {
        player.onScreenDisplay.setTitle(`           `);
        const cmd = `effect @e[family=!poison_counter,name=!${name},r=5] poison 5 0`;
        const cmd2 = `event entity ${name} stink`;
        const cmd3 = `title ${name} actionbar §cYou smell bad.`;
        player.runCommandAsync(cmd);
        player.runCommandAsync(cmd2);
        player.runCommandAsync(cmd3);
        player.setDynamicProperty("stink_lvc", 12);
      }
    } else {
      hitEntity?.setDynamicProperty("stink_lv", 1);
    }
  }

  if (damagingEntity.typeId === "sobs:smelled_3") {
    if (hitEntity?.getDynamicProperty("stink_lv") >= 1) {
      hitEntity?.setDynamicProperty(
        "stink_lv",
        hitEntity?.getDynamicProperty("stink_lv") + 500
      );

      const stink_lv = hitEntity?.getDynamicProperty("stink_lv");
      const player = hitEntity;
      const name = hitEntity.name;

      if (hitEntity?.getDynamicProperty("stink_lvc") >= 11)
        return hitEntity?.setDynamicProperty("stink_lvc", 11);

      if (stink_lv <= 100) {
        player.onScreenDisplay.setTitle(`          `);
        player.setDynamicProperty("stink_lvc", 2);
      } else if (stink_lv > 100 && stink_lv <= 200) {
        player.onScreenDisplay.setTitle(`         `);
        player.setDynamicProperty("stink_lvc", 3);
      } else if (stink_lv > 200 && stink_lv <= 300) {
        player.onScreenDisplay.setTitle(`        `);
        player.setDynamicProperty("stink_lvc", 4);
      } else if (stink_lv > 300 && stink_lv <= 400) {
        player.onScreenDisplay.setTitle(`       `);
        player.setDynamicProperty("stink_lvc", 5);
      } else if (stink_lv > 400 && stink_lv <= 500) {
        player.onScreenDisplay.setTitle(`      `);
        player.setDynamicProperty("stink_lvc", 6);
      } else if (stink_lv > 500 && stink_lv <= 600) {
        player.onScreenDisplay.setTitle(`     `);
        player.setDynamicProperty("stink_lvc", 7);
      } else if (stink_lv > 600 && stink_lv <= 700) {
        player.onScreenDisplay.setTitle(`    `);
        player.setDynamicProperty("stink_lvc", 8);
      } else if (stink_lv > 700 && stink_lv <= 800) {
        player.onScreenDisplay.setTitle(`   `);
        player.setDynamicProperty("stink_lvc", 9);
      } else if (stink_lv > 800 && stink_lv <= 900) {
        player.onScreenDisplay.setTitle(`  `);
        player.setDynamicProperty("stink_lvc", 10);
      } else if (stink_lv > 900 && stink_lv <= 1000) {
        player.onScreenDisplay.setTitle(` `);
        player.setDynamicProperty("stink_lvc", 11);
      } else if (stink_lv >= 1000) {
        player.onScreenDisplay.setTitle(`           `);
        const cmd = `effect @e[family=!poison_counter,name=!${name},r=5] poison 5 0`;
        const cmd2 = `event entity ${name} stink`;
        const cmd3 = `title ${name} actionbar §cYou smell bad.`;
        player.runCommandAsync(cmd);
        player.runCommandAsync(cmd2);
        player.runCommandAsync(cmd3);
        player.setDynamicProperty("stink_lvc", 12);
      }
    } else {
      hitEntity?.setDynamicProperty("stink_lv", 1);
    }
  }
});

world.afterEvents.projectileHitEntity.subscribe((event) => {
  const { projectile } = event;

  if (projectile.typeId != "sobs:robot_projectile") return;

  const target = event.getEntityHit().entity;

  if (
    target.typeId == "sobs:smelled_1" ||
    target.typeId == "sobs:smelled_1_2" ||
    target.typeId == "sobs:smelled_2" ||
    target.typeId == "sobs:smelled_3"
  ) {
    target.kill();
  }
  // world.sendMessage(`projectile hit entity: ${projectile.typeId}`);
  // world.sendMessage(`hit entity: ${event.getEntityHit().entity?.typeId}`);
});

world.afterEvents.entitySpawn.subscribe((event) => {
  const { cause, entity } = event;

  if (entity.typeId === "sobs:robot_projectile") {
    const dim = entity.dimension;

    dim.playSound("mob.allay.item_thrown", entity.location);

    const robots = dim.getEntities({
      type: "sobs:filtering_robot",
      maxDistance: 2,
      location: entity.location,
    });
    if (robots && robots.length > 0) {
      const shooter = robots[0];

      shooter.playAnimation("animation.sand_filter_robot.fire");
      // world.sendMessage("Robot projectile spawned near robot, removing projectile");
    }
  }
});

world.afterEvents.entityDie.subscribe((event) => {
  const { damageSource, deadEntity } = event;

  if (deadEntity.typeId == "sobs:smelled_1") {
    world.getDimension("overworld").spawnEntity("sobs:smelled_1_2", {
      x: deadEntity.location.x - 0.3,
      y: deadEntity.location.y,
      z: deadEntity.location.z,
    });
    world.getDimension("overworld").spawnEntity("sobs:smelled_1_2", {
      x: deadEntity.location.x + 0.3,
      y: deadEntity.location.y,
      z: deadEntity.location.z - 0.3,
    });
  }
});

world.afterEvents.itemUse.subscribe((event) => {
  const { source, itemStack } = event;

  if (!itemStack) return;

  // When a player uses the deodorant, reset their stink_level scoreboard to 0
  const deodorantMap = {
    "sobs:deodorant": "sobs_to_deo_2",
    "sobs:deodorant_2": "sobs_to_deo_3",
    "sobs:deodorant_3": "sobs_to_deo_4",
    "sobs:deodorant_4": "sobs_to_deo_5",
    "sobs:deodorant_5": "sobs_to_deo_6",
    "sobs:deodorant_6": "sobs_to_deo_7",
    "sobs:deodorant_7": "sobs_to_deo_8",
    "sobs:deodorant_8": "sobs_to_deo_9",
    "sobs:deodorant_9": "sobs_to_deo_10",
    "sobs:deodorant_10": "sobs_to_air",
  };

  const id = itemStack.typeId;
  if (id in deodorantMap) {
    // common cooldown check + start
    if (source.getItemCooldown("deo_cd") > 0) return;
    source.startItemCooldown("deo_cd", 40);

    const fnName = deodorantMap[id];
    try {
      const player = source;
      const name = player.name;

      // run function that handles variant swap on the data side (kept from original)
      player.runCommandAsync(`function ${fnName}`).catch(() => {});

      // common feedback / actions
      try {
        player.playAnimation("animation.player.usedeo");
      } catch (e) {}
      player
        .runCommandAsync("title @a actionbar §aUsing deo...")
        .catch(() => {});
      player
        .runCommandAsync(`event entity ${name} remove_stink`)
        .catch(() => {});

      player?.setDynamicProperty("stink_lv", 0);

      player?.setDynamicProperty("stink_lvc", 1);

      // final-variant extra: play break sound when last variant used
      if (id === "sobs:deodorant_10") {
        player.runCommandAsync("playsound random.break @s").catch(() => {});
      }
    } catch (e) {
      // ignore errors
    }
    return; // deodorant handled, skip other item checks
  }

  if (itemStack?.typeId == "sobs:robot_gun") {
    if (source.getItemCooldown("starman_void") > 0) {
      return;
    }
    source.startItemCooldown("starman_void", 15);
    const score = 0;
    const viewDirection = source.getViewDirection();

    const multiplier = Math.max(score, 1) * 1.5;
    const dx = viewDirection.x * multiplier;
    const dy = viewDirection.y * multiplier;
    const dz = viewDirection.z * multiplier;

    const spawnX = source.location.x + viewDirection.x;
    const spawnY = source.location.y + 1.5 + viewDirection.y;
    const spawnZ = source.location.z + viewDirection.z;

    const arrow = world
      .getDimension("overworld")
      .spawnEntity("sobs:robot_projectile", {
        x: spawnX,
        y: spawnY,
        z: spawnZ,
      });

    arrow.applyImpulse({ x: dx, y: dy, z: dz });
  }

  // if (itemStack?.typeId == "minecraft:stick") {
  //   const stink_lv = source.getDynamicProperty("stink_lv");
  //   world.sendMessage(`Stink LV: ${stink_lv}`);
  // }

  // if (itemStack?.typeId == "minecraft:bone") {
  //   const stink_lv = source.getDynamicProperty("stink_lvc");
  //   world.sendMessage(`Stink LVC: ${stink_lv}`);
  // }
});

world.beforeEvents.worldInitialize.subscribe(({ blockComponentRegistry }) => {
  blockComponentRegistry.registerCustomComponent("sobs:filter", {
    onPlayerInteract(event) {
      const { player, dimension, block } = event;

      const blockBelow = dimension.getBlock({
        x: block.location.x,
        y: block.location.y - 1,
        z: block.location.z,
      });

      const inv = player.getComponent("minecraft:inventory").container;
      const heldItem = inv.getItem(player.selectedSlotIndex);

      if (!heldItem) return;

      if (heldItem.typeId != "minecraft:water_bucket") return;

      if (blockBelow.typeId != "minecraft:sand") return;

      block.setPermutation(block.permutation.withState("sobs:wet", 1));

      const center = {
        x: block.location.x + 0.5,
        y: block.location.y,
        z: block.location.z + 0.5,
      };

      const tag = posTag(block.location);

      for (const e of dimension.getEntities({
        type: "sobs:sand_entity",
        tags: [tag],
      })) {
        if (e) return;
      }

      const ent = dimension.spawnEntity("sobs:sand_entity", center);

      ent.addTag(posTag(block.location));

      player.runCommandAsync("function sobs_empty_bucket");
      // const sandBucket = new ItemStack("sobs:sand_bucket", 1);
      // inv.addItem(sandBucket);

      // player.runCommandAsync("clear @s bucket 0 1");

      dimension.playSound("bucket.empty_water", block.location);
    },
  });

  blockComponentRegistry.registerCustomComponent("sobs:grinder", {
    onPlayerInteract(event) {
      const { player, dimension, block } = event;
      const tag = posTag(block.location);

      // jika sedang grinding, tolak interaksi
      if (activeGrinders.has(tag)) {
        player
          .runCommandAsync("title @s actionbar §cGrinding in progress...")
          .catch(() => {});
        return;
      }

      
      const inv = player.getComponent("minecraft:inventory").container;
      const heldItem = inv.getItem(player.selectedSlotIndex);
      
      if (!heldItem) return;
      if (heldItem.typeId != "sobs:plastic_item") return;
      
      dimension.playSound("block.lantern.place", block.location);
      
      // kunci proses sebelum memulai
      activeGrinders.add(tag);

      player.runCommandAsync(`clear @s ${heldItem.typeId} 0 1`).catch(() => {});

      block.setPermutation(block.permutation.withState("sobs:progress", 1));

      system.runTimeout(() => {
        try {
          const itemStack = new ItemStack("sobs:plastic_dust", 1);

          const pos = {
            x: block.location.x + 0.5,
            y: block.location.y + 0.5,
            z: block.location.z + 0.5,
          };

          for (let i = 0; i < 4; i++) {
            dimension.spawnParticle("minecraft:basic_smoke_particle", pos);
          }

          block.setPermutation(block.permutation.withState("sobs:progress", 0));
          dimension.spawnItem(itemStack, pos);

          dimension.playSound("random.click", block.location);
        } finally {
          // lepas kunci walau terjadi error
          activeGrinders.delete(tag);
        }
      }, 60);
    },
  });

  blockComponentRegistry.registerCustomComponent("sobs:plastic_world", {
    onPlayerInteract(event) {
      const { player, dimension, block } = event;
      try {
        dimension.playSound("random.pop", block.location);

        const { x, y, z } = block.location;

        // Hapus block (set ke air)
        dimension
          .runCommandAsync(`setblock ${x} ${y} ${z} air`)
          .catch(() => {});

        // Beri item langsung ke inventory pemain (menghindari output dari perintah /give)
        try {
          const inv = player.getComponent("minecraft:inventory").container;
          const stack = new ItemStack("sobs:plastic_item", 1);
          inv.addItem(stack);
        } catch (err) {
          // fallback: gunakan command tapi jangan biarkan pesan muncul ke chat
          player.runCommandAsync("give @s sobs:plastic_item 1").catch(() => {});
        }
      } catch (e) {
        // ignore errors
      }
    },
  });

  blockComponentRegistry.registerCustomComponent("sobs:plastic_world_2", {
    onPlayerInteract(event) {
      const { player, dimension, block } = event;
      try {
        dimension.playSound("random.pop", block.location);

        const { x, y, z } = block.location;

        // Hapus block (set ke air)
        dimension
          .runCommandAsync(`setblock ${x} ${y} ${z} air`)
          .catch(() => {});

        // Beri item langsung ke inventory pemain (menghindari output dari perintah /give)
        try {
          const inv = player.getComponent("minecraft:inventory").container;
          const stack = new ItemStack("sobs:plastic_item", 2);
          inv.addItem(stack);
        } catch (err) {
          // fallback: gunakan command tapi jangan biarkan pesan muncul ke chat
          player.runCommandAsync("give @s sobs:plastic_item 1").catch(() => {});
        }
      } catch (e) {
        // ignore errors
      }
    },
  });

  blockComponentRegistry.registerCustomComponent("sobs:plastic_world_3", {
    onPlayerInteract(event) {
      const { player, dimension, block } = event;
      try {
        dimension.playSound("random.pop", block.location);

        const { x, y, z } = block.location;

        // Hapus block (set ke air)
        dimension
          .runCommandAsync(`setblock ${x} ${y} ${z} air`)
          .catch(() => {});

        // Beri item langsung ke inventory pemain (menghindari output dari perintah /give)
        try {
          const inv = player.getComponent("minecraft:inventory").container;
          const stack = new ItemStack("sobs:plastic_item", 3);
          inv.addItem(stack);
        } catch (err) {
          // fallback: gunakan command tapi jangan biarkan pesan muncul ke chat
          player.runCommandAsync("give @s sobs:plastic_item 1").catch(() => {});
        }
      } catch (e) {
        // ignore errors
      }
    },
  });
});

world.afterEvents.playerBreakBlock.subscribe((event) => {
  const { block, dimension } = event;
  const tag = posTag(block.location);

  // world.sendMessage("broken block: " + block.typeId)
  for (const e of dimension.getEntities({
    type: "sobs:sand_entity",
    tags: [tag],
  })) {
    e.remove();
    break;
  }
});

world.afterEvents.playerInteractWithEntity.subscribe((event) => {
  const { target, itemStack, player } = event;

  if (!target || !itemStack) return;

  if (target.typeId != "sobs:sand_entity") return;

  if (itemStack.typeId != "minecraft:bucket") {
    player.runCommandAsync("title @s actionbar §cYou need a bucket.");
    return;
  }

  const inv = player.getComponent("minecraft:inventory").container;

  const sandBucket = new ItemStack("sobs:sand_bucket", 1);
  inv.addItem(sandBucket);

  player.runCommandAsync("clear @s bucket 0 1");

  target.dimension.playSound("dig.sand", target.location);

  const block = target.dimension.getBlock(target.location);

  block.setPermutation(block.permutation.withState("sobs:wet", 0));

  target.remove();
});
