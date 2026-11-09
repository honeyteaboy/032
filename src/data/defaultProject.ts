/**
 * Aetheria Anime JRPG Studio - Default Starter Project Data
 * "The Legend of the Star Shard"
 */

import { ProjectData, GameMap } from '../types/game';

// Helper to generate empty layers
function createLayer(w: number, h: number, fill: number = 0): number[][] {
  const layer: number[][] = [];
  for (let y = 0; y < h; y++) {
    const row: number[] = [];
    for (let x = 0; x < w; x++) {
      row.push(fill);
    }
    layer.push(row);
  }
  return layer;
}

function createCollision(w: number, h: number, fill: boolean = false): boolean[][] {
  const layer: boolean[][] = [];
  for (let y = 0; y < h; y++) {
    const row: boolean[] = [];
    for (let x = 0; x < w; x++) {
      row.push(fill);
    }
    layer.push(row);
  }
  return layer;
}

// 1. Lumina Village Map (20 x 15)
const map1W = 20;
const map1H = 15;
const map1Ground = createLayer(map1W, map1H, 1); // Meadow Grass
const map1Deco = createLayer(map1W, map1H, 0);
const map1Over = createLayer(map1W, map1H, 0);
const map1Coll = createCollision(map1W, map1H, false);

// River running vertically on column 10
for (let y = 0; y < map1H; y++) {
  map1Ground[y][10] = 8; // Water
  map1Coll[y][10] = true;
}
// Wooden bridge over water at y = 7
map1Ground[7][10] = 28; // Wooden bridge
map1Coll[7][10] = false;

// Cobblestone path
for (let x = 3; x <= 16; x++) {
  map1Ground[7][x] = 3;
}
for (let y = 4; y <= 11; y++) {
  map1Ground[y][6] = 3;
}

// Houses (West side)
// House 1: (3, 3) to (5, 5)
map1Over[2][3] = 22; map1Over[2][4] = 22; map1Over[2][5] = 22; // Roof
map1Deco[3][3] = 24; map1Deco[3][4] = 27; map1Deco[3][5] = 24; // Wall with window
map1Deco[4][3] = 24; map1Deco[4][4] = 26; map1Deco[4][5] = 24; // Wall with door
map1Coll[3][3] = true; map1Coll[3][4] = true; map1Coll[3][5] = true;
map1Coll[4][3] = true; map1Coll[4][5] = true;

// House 2: (13, 3) to (15, 5) (East side)
map1Over[2][13] = 23; map1Over[2][14] = 23; map1Over[2][15] = 23; // Sapphire roof
map1Deco[3][13] = 25; map1Deco[3][14] = 27; map1Deco[3][15] = 25;
map1Deco[4][13] = 25; map1Deco[4][14] = 26; map1Deco[4][15] = 25;
map1Coll[3][13] = true; map1Coll[3][14] = true; map1Coll[3][15] = true;
map1Coll[4][13] = true; map1Coll[4][15] = true;

// Trees & Nature
map1Over[1][1] = 12; map1Deco[2][1] = 13; map1Coll[2][1] = true; // Sakura tree
map1Over[10][2] = 12; map1Deco[11][2] = 13; map1Coll[11][2] = true; // Sakura tree
map1Over[1][18] = 14; map1Deco[2][18] = 15; map1Coll[2][18] = true; // Oak tree
map1Over[11][17] = 14; map1Deco[12][17] = 15; map1Coll[12][17] = true; // Oak tree

// Flowers & details
map1Deco[6][2] = 16;
map1Deco[8][2] = 16;
map1Deco[6][14] = 16;
map1Deco[8][14] = 16;
map1Deco[9][6] = 40; // Campfire near center
map1Coll[9][6] = true;

// Save Crystal near village center
map1Deco[5][8] = 34;
map1Coll[5][8] = true;

// Portal to Crystal Cavern at east path (19, 7)
map1Ground[7][19] = 35; // Runic teleport

// Perimeter fence/water boundary
for (let x = 0; x < map1W; x++) {
  map1Coll[0][x] = true;
  map1Deco[0][x] = 20;
  map1Coll[map1H - 1][x] = true;
  map1Deco[map1H - 1][x] = 20;
}
for (let y = 0; y < map1H; y++) {
  if (y !== 7) {
    map1Coll[y][0] = true;
    map1Deco[y][0] = 20;
    map1Coll[y][map1W - 1] = true;
    map1Deco[y][map1W - 1] = 20;
  }
}

const mapLumina: GameMap = {
  id: 'map_lumina',
  name: 'Lumina Haven Village',
  theme: 'village',
  width: map1W,
  height: map1H,
  ground: map1Ground,
  decoration: map1Deco,
  overhead: map1Over,
  collision: map1Coll,
  events: [
    {
      id: 'evt_save_lumina',
      name: 'Aether Save Crystal',
      type: 'save_crystal',
      x: 8,
      y: 5,
    },
    {
      id: 'evt_npc_zephyr',
      name: 'Elder Zephyr',
      type: 'npc',
      x: 6,
      y: 5,
      npcId: 'npc_zephyr',
    },
    {
      id: 'evt_npc_lyra',
      name: 'Lyra the Astrologer',
      type: 'npc',
      x: 14,
      y: 6,
      npcId: 'npc_lyra',
    },
    {
      id: 'evt_chest_lumina',
      name: 'Elder Stash Chest',
      type: 'chest',
      x: 2,
      y: 4,
      chestItemId: 'item_potion',
      chestGold: 150,
      chestOpened: false,
    },
    {
      id: 'evt_portal_cavern',
      name: 'Teleport to Crystal Hollow',
      type: 'teleport',
      x: 19,
      y: 7,
      targetMapId: 'map_crystal_cavern',
      targetX: 1,
      targetY: 6,
    },
  ],
};

// 2. Crystal Hollow Cavern (16 x 12)
const map2W = 16;
const map2H = 12;
const map2Ground = createLayer(map2W, map2H, 6); // Crystal cavern floor
const map2Deco = createLayer(map2W, map2H, 0);
const map2Over = createLayer(map2W, map2H, 0);
const map2Coll = createCollision(map2W, map2H, false);

// Cavern walls
for (let x = 0; x < map2W; x++) {
  map2Deco[0][x] = 18; map2Coll[0][x] = true;
  map2Deco[map2H - 1][x] = 18; map2Coll[map2H - 1][x] = true;
}
for (let y = 0; y < map2H; y++) {
  if (y !== 6) {
    map2Deco[y][0] = 18; map2Coll[y][0] = true;
    map2Deco[y][map2W - 1] = 18; map2Coll[y][map2W - 1] = true;
  }
}

// Crystals and boulders
map2Deco[3][4] = 17; map2Coll[3][4] = true;
map2Deco[7][5] = 17; map2Coll[7][5] = true;
map2Deco[4][10] = 18; map2Coll[4][10] = true;
map2Deco[8][11] = 17; map2Coll[8][11] = true;
map2Deco[2][8] = 19; map2Coll[2][8] = true;

// Portals
map2Ground[6][0] = 35; // Return to Lumina Village
map2Ground[6][15] = 35; // Advance to Sky Sanctuary

const mapCrystalCavern: GameMap = {
  id: 'map_crystal_cavern',
  name: 'Crystal Hollow Caverns',
  theme: 'crystal_forest',
  width: map2W,
  height: map2H,
  ground: map2Ground,
  decoration: map2Deco,
  overhead: map2Over,
  collision: map2Coll,
  events: [
    {
      id: 'evt_portal_back_village',
      name: 'Portal to Lumina Village',
      type: 'teleport',
      x: 0,
      y: 6,
      targetMapId: 'map_lumina',
      targetX: 18,
      targetY: 7,
    },
    {
      id: 'evt_chest_star_shard',
      name: 'Ancient Crystal Relic',
      type: 'chest',
      x: 8,
      y: 3,
      chestItemId: 'item_star_shard',
      chestGold: 300,
      chestOpened: false,
    },
    {
      id: 'evt_mob_wolf',
      name: 'Aether Wolf Ambush',
      type: 'battle',
      x: 6,
      y: 6,
      monsterId: 'mob_wolf',
    },
    {
      id: 'evt_portal_sky',
      name: 'Portal to Sky Sanctuary',
      type: 'teleport',
      x: 15,
      y: 6,
      targetMapId: 'map_sky_sanctuary',
      targetX: 1,
      targetY: 6,
    },
  ],
};

// 3. Sky Sanctuary (15 x 12)
const map3W = 15;
const map3H = 12;
const map3Ground = createLayer(map3W, map3H, 5); // Celestial Flagstones
const map3Deco = createLayer(map3W, map3H, 0);
const map3Over = createLayer(map3W, map3H, 0);
const map3Coll = createCollision(map3W, map3H, false);

// Void boundaries with deep abyss
for (let x = 0; x < map3W; x++) {
  map3Ground[0][x] = 9; map3Coll[0][x] = true;
  map3Ground[map3H - 1][x] = 9; map3Coll[map3H - 1][x] = true;
}
for (let y = 0; y < map3H; y++) {
  if (y !== 6) {
    map3Ground[y][0] = 9; map3Coll[y][0] = true;
    map3Ground[y][map3W - 1] = 9; map3Coll[y][map3W - 1] = true;
  }
}

// Marble pillars
map3Deco[3][3] = 30; map3Coll[3][3] = true;
map3Deco[3][11] = 30; map3Coll[3][11] = true;
map3Deco[8][3] = 30; map3Coll[8][3] = true;
map3Deco[8][11] = 30; map3Coll[8][11] = true;

// Throne in back
map3Deco[2][7] = 37; map3Coll[2][7] = true;
map3Ground[6][0] = 35; // Back to cavern
map3Ground[6][14] = 35; // To Dragon's Volcano

const mapSkySanctuary: GameMap = {
  id: 'map_sky_sanctuary',
  name: 'Sky Sanctuary of Lumina',
  theme: 'sky_sanctuary',
  width: map3W,
  height: map3H,
  ground: map3Ground,
  decoration: map3Deco,
  overhead: map3Over,
  collision: map3Coll,
  events: [
    {
      id: 'evt_portal_sanct_back',
      name: 'Portal to Crystal Cavern',
      type: 'teleport',
      x: 0,
      y: 6,
      targetMapId: 'map_crystal_cavern',
      targetX: 14,
      targetY: 6,
    },
    {
      id: 'evt_npc_valkyrie',
      name: 'Lady Elara, Holy Knight',
      type: 'npc',
      x: 7,
      y: 4,
      npcId: 'npc_elara',
    },
    {
      id: 'evt_portal_dragon',
      name: 'Portal to Dragon Spire',
      type: 'teleport',
      x: 14,
      y: 6,
      targetMapId: 'map_dragon_spire',
      targetX: 1,
      targetY: 6,
    },
  ],
};

// 4. Dragon Spire (14 x 12)
const map4W = 14;
const map4H = 12;
const map4Ground = createLayer(map4W, map4H, 7); // Basalt
const map4Deco = createLayer(map4W, map4H, 0);
const map4Over = createLayer(map4W, map4H, 0);
const map4Coll = createCollision(map4W, map4H, false);

// Magma boundary
for (let x = 0; x < map4W; x++) {
  map4Coll[0][x] = true; map4Deco[0][x] = 19;
  map4Coll[map4H - 1][x] = true; map4Deco[map4H - 1][x] = 19;
}
for (let y = 0; y < map4H; y++) {
  if (y !== 6) {
    map4Coll[y][0] = true; map4Deco[y][0] = 19;
    map4Coll[y][map4W - 1] = true; map4Deco[y][map4W - 1] = 19;
  }
}

// Torches
map4Deco[3][4] = 36; map4Coll[3][4] = true;
map4Deco[3][9] = 36; map4Coll[3][9] = true;
map4Deco[8][4] = 36; map4Coll[8][4] = true;
map4Deco[8][9] = 36; map4Coll[8][9] = true;

map4Ground[6][0] = 35; // Back to sanctuary

const mapDragonSpire: GameMap = {
  id: 'map_dragon_spire',
  name: 'Infernal Dragon Citadel',
  theme: 'dragon_ruins',
  width: map4W,
  height: map4H,
  ground: map4Ground,
  decoration: map4Deco,
  overhead: map4Over,
  collision: map4Coll,
  events: [
    {
      id: 'evt_portal_drag_back',
      name: 'Portal to Sky Sanctuary',
      type: 'teleport',
      x: 0,
      y: 6,
      targetMapId: 'map_sky_sanctuary',
      targetX: 13,
      targetY: 6,
    },
    {
      id: 'evt_boss_dragon',
      name: 'Ignis, Dragon Sovereign',
      type: 'battle',
      x: 9,
      y: 6,
      monsterId: 'mob_dragon',
    },
  ],
};

export const DEFAULT_PROJECT_DATA: ProjectData = {
  version: '2.0.0',
  name: 'The Legend of the Star Shard',
  description: 'An anime fantasy JRPG adventure across the floating continents of Aetheria.',
  author: 'Aetheria Studio Creator',
  lastModified: Date.now(),
  initialMapId: 'map_lumina',
  initialPlayerX: 6,
  initialPlayerY: 7,
  gold: 250,
  inventory: [
    { itemId: 'item_potion', quantity: 5 },
    { itemId: 'item_ether', quantity: 3 },
    { itemId: 'item_feather', quantity: 1 },
  ],
  party: [
    {
      id: 'char_kaito',
      name: 'Kaito Aeloria',
      race: 'Humalis (Human)',
      className: 'Aether Blade',
      title: 'Blade of the Dawn',
      avatarUrl: '/src/assets/images/anime_hero_protagonist_1794214252921.jpg',
      level: 5,
      exp: 120,
      maxExp: 300,
      hp: 220,
      maxHp: 220,
      mp: 60,
      maxMp: 60,
      atk: 48,
      def: 32,
      mag: 24,
      spd: 38,
      critRate: 15,
      skills: ['skill_slash', 'skill_aether_burst'],
      equipment: {
        weapon: 'item_sword',
        armor: 'item_leather_coat',
      },
      bio: 'A spirited swordsman gifted with resonant affinity to the ancient Aether crystals.',
    },
    {
      id: 'char_selene',
      name: 'Selene Starlight',
      race: 'Sylphid (High Elf)',
      className: 'Star Mage',
      title: 'Stargazer of the Hollow',
      avatarUrl: '/src/assets/images/anime_heroine_mage_1794214252515.jpg',
      level: 5,
      exp: 100,
      maxExp: 300,
      hp: 160,
      maxHp: 160,
      mp: 130,
      maxMp: 130,
      atk: 22,
      def: 20,
      mag: 58,
      spd: 34,
      critRate: 12,
      skills: ['skill_starfall', 'skill_celestial_heal'],
      equipment: {
        weapon: 'item_staff',
        armor: 'item_astral_robe',
      },
      bio: 'An elven prodigy who communes with constellation spirits to manifest radiant magic.',
    },
  ],
  maps: {
    map_lumina: mapLumina,
    map_crystal_cavern: mapCrystalCavern,
    map_sky_sanctuary: mapSkySanctuary,
    map_dragon_spire: mapDragonSpire,
  },
  skills: {
    skill_slash: {
      id: 'skill_slash',
      name: 'Aether Cross Slash',
      element: 'Aether',
      mpCost: 12,
      power: 65,
      target: 'single_enemy',
      effectType: 'damage',
      animation: 'slash',
      description: 'Strikes an enemy with cross-cutting runic blades.',
    },
    skill_aether_burst: {
      id: 'skill_aether_burst',
      name: 'Radiant Resonance',
      element: 'Aether',
      mpCost: 24,
      power: 110,
      target: 'all_enemies',
      effectType: 'damage',
      animation: 'magic_burst',
      description: 'Releases a wide-area wave of pure stellar energy.',
    },
    skill_starfall: {
      id: 'skill_starfall',
      name: 'Astral Starfall',
      element: 'Aero',
      mpCost: 20,
      power: 95,
      target: 'all_enemies',
      effectType: 'damage',
      animation: 'starfall',
      description: 'Summons falling starlight comets upon all foes.',
    },
    skill_celestial_heal: {
      id: 'skill_celestial_heal',
      name: 'Grace of Lumina',
      element: 'Aether',
      mpCost: 15,
      power: 100,
      target: 'single_ally',
      effectType: 'heal',
      animation: 'heal_light',
      description: 'Restores 100 HP to a party member.',
    },
    skill_flame_breath: {
      id: 'skill_flame_breath',
      name: 'Infernal Cataclysm',
      element: 'Pyro',
      mpCost: 30,
      power: 140,
      target: 'all_enemies',
      effectType: 'damage',
      animation: 'fireball',
      description: 'Engulfs the entire party in draconic hellfire.',
    },
  },
  items: {
    item_potion: {
      id: 'item_potion',
      name: 'Lumina Herb Potion',
      type: 'consumable',
      price: 40,
      description: 'Restores 80 HP to one hero.',
      icon: '🧪',
      effect: { hpHeal: 80 },
    },
    item_ether: {
      id: 'item_ether',
      name: 'Aether Crystal Draught',
      type: 'consumable',
      price: 80,
      description: 'Restores 50 MP to one hero.',
      icon: '💧',
      effect: { mpHeal: 50 },
    },
    item_feather: {
      id: 'item_feather',
      name: 'Phoenix Down',
      type: 'consumable',
      price: 200,
      description: 'Revives a fallen ally with 50% HP.',
      icon: '🪶',
      effect: { hpHeal: 120 },
    },
    item_sword: {
      id: 'item_sword',
      name: 'Rune Silver Blade',
      type: 'weapon',
      price: 350,
      description: 'Forged from enchanted meteoric iron. ATK +22.',
      icon: '⚔️',
      effect: { atkBonus: 22 },
    },
    item_staff: {
      id: 'item_staff',
      name: 'Starlight Scepter',
      type: 'weapon',
      price: 380,
      description: 'Channeling conduit crafted from moonstone. MAG +28.',
      icon: '🪄',
      effect: { magBonus: 28 },
    },
    item_leather_coat: {
      id: 'item_leather_coat',
      name: 'Traveler Leather Coat',
      type: 'armor',
      price: 180,
      description: 'Flexible protective gear for adventurers. DEF +14.',
      icon: '🛡️',
      effect: { defBonus: 14 },
    },
    item_astral_robe: {
      id: 'item_astral_robe',
      name: 'Astral Silk Robe',
      type: 'armor',
      price: 240,
      description: 'Woven with threads of celestial starlight. DEF +10, MAG +12.',
      icon: '👘',
      effect: { defBonus: 10, magBonus: 12 },
    },
    item_star_shard: {
      id: 'item_star_shard',
      name: 'Primordial Star Shard',
      type: 'key_item',
      price: 0,
      description: 'A pulsing crystal shard fallen from the upper celestial realm.',
      icon: '✨',
    },
  },
  npcs: {
    npc_zephyr: {
      id: 'npc_zephyr',
      name: 'Elder Zephyr',
      race: 'Humalis (Human)',
      role: 'Village Chief & Scholar',
      avatarUrl: '/src/assets/images/anime_hero_protagonist_1794214252921.jpg',
      spriteId: 'sprite_elder',
      mapId: 'map_lumina',
      x: 6,
      y: 5,
      dialogueId: 'dlg_zephyr',
    },
    npc_lyra: {
      id: 'npc_lyra',
      name: 'Lyra the Astrologer',
      race: 'Sylphid (High Elf)',
      role: 'Shopkeeper & Oracle',
      avatarUrl: '/src/assets/images/anime_heroine_mage_1794214252515.jpg',
      spriteId: 'sprite_astrologer',
      mapId: 'map_lumina',
      x: 14,
      y: 6,
      dialogueId: 'dlg_lyra',
      shopItems: ['item_potion', 'item_ether', 'item_feather', 'item_sword', 'item_staff'],
    },
    npc_elara: {
      id: 'npc_elara',
      name: 'Lady Elara',
      race: 'Aetherial (Celestial)',
      role: 'Holy Knight Commander',
      avatarUrl: '/src/assets/images/anime_valkyrie_knight_1794214253332.jpg',
      spriteId: 'sprite_valkyrie',
      mapId: 'map_sky_sanctuary',
      x: 7,
      y: 4,
      dialogueId: 'dlg_elara',
    },
  },
  monsters: {
    mob_slime: {
      id: 'mob_slime',
      name: 'Starlight Slime',
      race: 'Ooze',
      element: 'Hydro',
      avatarUrl: '/src/assets/images/anime_heroine_mage_1794214252515.jpg',
      spriteId: 'sprite_slime',
      hp: 95,
      maxHp: 95,
      mp: 20,
      atk: 22,
      def: 12,
      mag: 18,
      spd: 20,
      expReward: 45,
      goldReward: 25,
      skills: ['skill_slash'],
      drops: [{ itemId: 'item_potion', chance: 0.6 }],
      description: 'A jelly-like creature imbued with luminous liquid mana.',
    },
    mob_wolf: {
      id: 'mob_wolf',
      name: 'Aether Wolf',
      race: 'Beast',
      element: 'Aero',
      avatarUrl: '/src/assets/images/anime_hero_protagonist_1794214252921.jpg',
      spriteId: 'sprite_wolf',
      hp: 175,
      maxHp: 175,
      mp: 35,
      atk: 36,
      def: 22,
      mag: 20,
      spd: 42,
      expReward: 90,
      goldReward: 60,
      skills: ['skill_slash'],
      drops: [{ itemId: 'item_potion', chance: 0.8 }],
      description: 'A swift predator that slips between gusts of magical winds.',
    },
    mob_dragon: {
      id: 'mob_dragon',
      name: 'Ignis, Dragon Sovereign',
      race: 'Draconis',
      element: 'Pyro',
      avatarUrl: '/src/assets/images/anime_boss_dragon_lord_1794214253718.jpg',
      spriteId: 'sprite_dragon',
      isBoss: true,
      hp: 1100,
      maxHp: 1100,
      mp: 200,
      atk: 68,
      def: 45,
      mag: 72,
      spd: 35,
      expReward: 650,
      goldReward: 800,
      skills: ['skill_slash', 'skill_flame_breath'],
      drops: [
        { itemId: 'item_sword', chance: 1.0 },
        { itemId: 'item_feather', chance: 1.0 },
      ],
      description: 'Ancient titan of the molten core, guarding the celestial rift with blazing scales.',
    },
  },
  dialogues: {
    dlg_zephyr: {
      id: 'dlg_zephyr',
      title: 'Elder Zephyr - The Star Falls',
      initialNodeId: 'node_1',
      nodes: {
        node_1: {
          id: 'node_1',
          speakerName: 'Elder Zephyr',
          avatarUrl: '/src/assets/images/anime_hero_protagonist_1794214252921.jpg',
          emotion: 'shocked',
          text: 'Kaito! Thank the heavens you are here. Last night, a celestial star plummeted straight into the Crystal Hollow!',
          choices: [
            {
              text: 'I felt the earth tremble. Did it harm anyone?',
              nextNodeId: 'node_2',
            },
            {
              text: 'A Star Shard? That must hold immense Aether power!',
              nextNodeId: 'node_3',
            },
          ],
        },
        node_2: {
          id: 'node_2',
          speakerName: 'Elder Zephyr',
          avatarUrl: '/src/assets/images/anime_hero_protagonist_1794214252921.jpg',
          emotion: 'neutral',
          text: 'The villagers are safe, but the crystal resonance has agitated wild beasts. Please journey east through the portal and recover the Primordial Star Shard!',
          nextNodeId: 'node_quest',
        },
        node_3: {
          id: 'node_3',
          speakerName: 'Elder Zephyr',
          avatarUrl: '/src/assets/images/anime_hero_protagonist_1794214252921.jpg',
          emotion: 'determined',
          text: 'Indeed. If Ignis the Dragon Sovereign reaches it first, his hellfire could incinerate all of Aetheria. You must secure it!',
          nextNodeId: 'node_quest',
        },
        node_quest: {
          id: 'node_quest',
          speakerName: 'Elder Zephyr',
          avatarUrl: '/src/assets/images/anime_hero_protagonist_1794214252921.jpg',
          emotion: 'happy',
          text: 'Take these traveling potions with you. Lady Elara at the Sky Sanctuary will aid you if you cross the caverns!',
          actionTrigger: 'give_quest',
          questId: 'quest_star_shard',
        },
      },
    },
    dlg_lyra: {
      id: 'dlg_lyra',
      title: 'Lyra - Astrologer & Emporium',
      initialNodeId: 'node_shop',
      nodes: {
        node_shop: {
          id: 'node_shop',
          speakerName: 'Lyra the Astrologer',
          avatarUrl: '/src/assets/images/anime_heroine_mage_1794214252515.jpg',
          emotion: 'happy',
          text: 'Welcome, brave travelers! The stars forecast great peril—and great glory. Would you like to inspect my magical goods or rest your spirits?',
          choices: [
            {
              text: 'Show me your wares! (Open Shop)',
              actionTrigger: 'open_shop',
            },
            {
              text: 'Please heal our wounds (Rest at Fountain)',
              actionTrigger: 'heal_party',
            },
          ],
        },
      },
    },
    dlg_elara: {
      id: 'dlg_elara',
      title: 'Lady Elara - Valkyrie of Radiance',
      initialNodeId: 'node_valk_1',
      nodes: {
        node_valk_1: {
          id: 'node_valk_1',
          speakerName: 'Lady Elara',
          avatarUrl: '/src/assets/images/anime_valkyrie_knight_1794214253332.jpg',
          emotion: 'determined',
          text: 'Halt, travelers! I am Lady Elara, guardian of the Sky Sanctuary. I sense the Primordial Shard in your possession!',
          choices: [
            {
              text: 'We seek to stop the Dragon Sovereign Ignis!',
              nextNodeId: 'node_valk_join',
            },
          ],
        },
        node_valk_join: {
          id: 'node_valk_join',
          speakerName: 'Lady Elara',
          avatarUrl: '/src/assets/images/anime_valkyrie_knight_1794214253332.jpg',
          emotion: 'happy',
          text: 'Then our blades share a destiny! The eastern portal leads directly into the molten citadel. Steel yourselves!',
        },
      },
    },
  },
  quests: {
    quest_star_shard: {
      id: 'quest_star_shard',
      title: 'The Fallen Star of Aetheria',
      type: 'main',
      giverNpcId: 'npc_zephyr',
      summary: 'Investigate the Crystal Hollow Caverns, recover the Star Shard, and vanquish the Dragon Sovereign.',
      status: 'active',
      objectives: [
        {
          id: 'obj_1',
          text: 'Explore Crystal Hollow and retrieve the Star Shard chest',
          type: 'collect_item',
          target: 'item_star_shard',
          needed: 1,
          current: 0,
          completed: false,
        },
        {
          id: 'obj_2',
          text: 'Ascend to the Sky Sanctuary and consult Lady Elara',
          type: 'talk_npc',
          target: 'npc_elara',
          needed: 1,
          current: 0,
          completed: false,
        },
        {
          id: 'obj_3',
          text: 'Defeat Ignis the Dragon Sovereign in the Infernal Citadel',
          type: 'defeat_monster',
          target: 'mob_dragon',
          needed: 1,
          current: 0,
          completed: false,
        },
      ],
      rewards: {
        exp: 1000,
        gold: 1500,
        itemId: 'item_sword',
      },
    },
  },
  lore: [
    {
      id: 'lore_sundering',
      category: 'world',
      title: 'The Great Celestial Sundering',
      subtitle: 'The Age of Floating Continents',
      summary: 'Centuries ago, the ancient continent of Aetheria shattered into floating sky isles sustained by crystal mana.',
      fullText: 'Before recorded memory, the world below was consumed by the Void Abyss. In their final act of salvation, the ancient Archmages anchored the remaining continents to colossal floating Aether crystals. Now, ships with solar sails navigate the sky seas between the floating islands.',
      icon: '🌌',
    },
    {
      id: 'lore_elements',
      category: 'elements',
      title: 'The Six Primordial Elements',
      subtitle: 'Aether, Pyro, Hydro, Aero, Geo, Umbra',
      summary: 'Elemental harmony governs the flow of magic across all mortal spells and magical creatures.',
      fullText: 'Every spell in Aetheria originates from one of six primordial currents: Aether (Pure Light & Spirit), Pyro (Flames & Energy), Hydro (Water & Restoration), Aero (Wind & Lightning), Geo (Earth & Metal), and Umbra (Shadow & Entropy). Mastery over elemental affinities allows warriors to exploit the vulnerabilities of their foes.',
      icon: '✨',
    },
    {
      id: 'lore_pantheon',
      category: 'pantheon',
      title: 'Lumina and the Twin Moons',
      subtitle: 'Deities of Celestial Light',
      summary: 'Lumina, the radiant dawn goddess, watches over the sky sanctuaries and guides heroes through starlight.',
      fullText: 'The twin celestial moons visible in the evening skies are said to be the resting places of the ancient goddesses Lumina and Noctis. Knights of the Silver Wing swear eternal loyalty to Lumina’s beacon, protecting the floating havens against draconic corruption.',
      icon: '🌙',
    },
    {
      id: 'lore_factions',
      category: 'factions',
      title: 'The Order of the Silver Wing',
      subtitle: 'Guardians of the Sky Realm',
      summary: 'An elite cadre of winged paladins and astral knights sworn to protect the sacred crystals.',
      fullText: 'Headquartered at the high Sanctuary, the Order patrols the cloud ridges. Equipped with winged armor and runic greatswords, they stand as the first line of defense against the ancient dragons.',
      icon: '🛡️',
    },
  ],
};
