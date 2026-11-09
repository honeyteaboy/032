/**
 * Aetheria Anime JRPG Studio - Core Data Models & Types
 */

export type ElementType = 'Aether' | 'Pyro' | 'Hydro' | 'Aero' | 'Geo' | 'Umbra';

export type RaceType = 
  | 'Humalis (Human)'
  | 'Sylphid (High Elf)'
  | 'Therian (Beastkin)'
  | 'Draconis (Dragonkin)'
  | 'Arcanoid (Automaton)'
  | 'Aetherial (Celestial)';

export type CharacterClass = 
  | 'Aether Blade'
  | 'Star Mage'
  | 'Winged Valkyrie'
  | 'Sylph Ranger'
  | 'Rune Knight'
  | 'Alchemist';

export type EmotionType = 'neutral' | 'happy' | 'determined' | 'shocked' | 'sad';

export interface Skill {
  id: string;
  name: string;
  element: ElementType;
  mpCost: number;
  power: number;
  target: 'single_enemy' | 'all_enemies' | 'single_ally' | 'all_allies' | 'self';
  effectType: 'damage' | 'heal' | 'buff';
  animation: 'slash' | 'magic_burst' | 'holy_beam' | 'fireball' | 'starfall' | 'heal_light';
  description: string;
}

export interface Item {
  id: string;
  name: string;
  type: 'consumable' | 'weapon' | 'armor' | 'accessory' | 'key_item';
  price: number;
  description: string;
  icon: string;
  effect?: {
    hpHeal?: number;
    mpHeal?: number;
    atkBonus?: number;
    defBonus?: number;
    magBonus?: number;
    spdBonus?: number;
  };
}

export interface Character {
  id: string;
  name: string;
  race: RaceType;
  className: CharacterClass;
  title: string;
  avatarUrl: string;
  level: number;
  exp: number;
  maxExp: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  atk: number;
  def: number;
  mag: number;
  spd: number;
  critRate: number;
  skills: string[]; // skill IDs
  equipment: {
    weapon?: string; // item ID
    armor?: string;
    accessory?: string;
  };
  bio: string;
}

export interface NPC {
  id: string;
  name: string;
  race: RaceType;
  role: string;
  avatarUrl: string;
  spriteId: string;
  mapId: string;
  x: number;
  y: number;
  dialogueId: string;
  shopItems?: string[]; // item IDs
}

export interface Monster {
  id: string;
  name: string;
  race: string;
  element: ElementType;
  avatarUrl: string;
  spriteId: string;
  hp: number;
  maxHp: number;
  mp: number;
  atk: number;
  def: number;
  mag: number;
  spd: number;
  expReward: number;
  goldReward: number;
  skills: string[];
  drops: { itemId: string; chance: number }[];
  isBoss?: boolean;
  description: string;
}

export interface DialogueChoice {
  text: string;
  nextNodeId?: string;
  rewardItemId?: string;
  questTriggerId?: string;
  actionTrigger?: 'start_battle' | 'open_shop' | 'heal_party';
}

export interface DialogueNode {
  id: string;
  speakerName: string;
  avatarUrl: string;
  emotion: EmotionType;
  text: string;
  choices?: DialogueChoice[];
  nextNodeId?: string;
  actionTrigger?: 'start_battle' | 'open_shop' | 'heal_party' | 'give_quest';
  questId?: string;
}

export interface DialogueTree {
  id: string;
  title: string;
  initialNodeId: string;
  nodes: Record<string, DialogueNode>;
}

export interface QuestObjective {
  id: string;
  text: string;
  type: 'talk_npc' | 'defeat_monster' | 'collect_item' | 'reach_map';
  target: string;
  needed: number;
  current: number;
  completed: boolean;
}

export interface Quest {
  id: string;
  title: string;
  type: 'main' | 'side' | 'bounty';
  giverNpcId: string;
  summary: string;
  objectives: QuestObjective[];
  rewards: {
    exp: number;
    gold: number;
    itemId?: string;
  };
  status: 'available' | 'active' | 'completed';
}

export interface LoreEntry {
  id: string;
  category: 'world' | 'pantheon' | 'factions' | 'elements' | 'artifacts';
  title: string;
  subtitle: string;
  summary: string;
  fullText: string;
  icon: string;
}

export type MapLayerName = 'ground' | 'decoration' | 'overhead';

export interface MapEvent {
  id: string;
  x: number;
  y: number;
  type: 'teleport' | 'npc' | 'chest' | 'battle' | 'save_crystal';
  name: string;
  // Specific payload depending on type
  targetMapId?: string;
  targetX?: number;
  targetY?: number;
  npcId?: string;
  chestItemId?: string;
  chestGold?: number;
  chestOpened?: boolean;
  monsterId?: string;
  triggerOnStep?: boolean;
}

export interface GameMap {
  id: string;
  name: string;
  theme: 'village' | 'crystal_forest' | 'sky_sanctuary' | 'dragon_ruins' | 'interior';
  width: number;
  height: number;
  // Layer arrays storing tile IDs
  ground: number[][];
  decoration: number[][];
  overhead: number[][]; // rendered above player
  collision: boolean[][]; // true = impassable
  events: MapEvent[];
}

export interface ProjectData {
  version: string;
  name: string;
  description: string;
  author: string;
  lastModified: number;
  initialMapId: string;
  initialPlayerX: number;
  initialPlayerY: number;
  party: Character[];
  inventory: { itemId: string; quantity: number }[];
  gold: number;
  maps: Record<string, GameMap>;
  npcs: Record<string, NPC>;
  monsters: Record<string, Monster>;
  skills: Record<string, Skill>;
  items: Record<string, Item>;
  dialogues: Record<string, DialogueTree>;
  quests: Record<string, Quest>;
  lore: LoreEntry[];
}
