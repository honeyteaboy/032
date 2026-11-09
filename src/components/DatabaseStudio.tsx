/**
 * Aetheria Anime JRPG Studio - Lore & Character Database Studio
 * Manages playable party members, races, NPCs, bestiary monsters, skills, equipment, and lore codex.
 */

import React, { useState } from 'react';
import {
  Users,
  Shield,
  Sword,
  BookOpen,
  Sparkles,
  Package,
  Plus,
  Trash2,
  Edit2,
  Check,
  Flame,
  Droplets,
  Wind,
  Globe,
  Sun,
  Moon
} from 'lucide-react';
import {
  Character,
  CharacterClass,
  ElementType,
  Item,
  Monster,
  NPC,
  ProjectData,
  RaceType,
  Skill,
  LoreEntry
} from '../types/game';
import { audioManager } from '../utils/audio';

type DatabaseTab = 'party' | 'npcs' | 'monsters' | 'skills' | 'items' | 'lore';

interface DatabaseStudioProps {
  project: ProjectData;
  onUpdateProject: (updater: (prev: ProjectData) => ProjectData) => void;
}

const RACES: RaceType[] = [
  'Humalis (Human)',
  'Sylphid (High Elf)',
  'Therian (Beastkin)',
  'Draconis (Dragonkin)',
  'Arcanoid (Automaton)',
  'Aetherial (Celestial)',
];

const CLASSES: CharacterClass[] = [
  'Aether Blade',
  'Star Mage',
  'Winged Valkyrie',
  'Sylph Ranger',
  'Rune Knight',
  'Alchemist',
];

const ELEMENTS: ElementType[] = ['Aether', 'Pyro', 'Hydro', 'Aero', 'Geo', 'Umbra'];

export const DatabaseStudio: React.FC<DatabaseStudioProps> = ({
  project,
  onUpdateProject,
}) => {
  const [activeTab, setActiveTab] = useState<DatabaseTab>('party');
  const [selectedId, setSelectedId] = useState<string>('');

  // Editing state for active entity
  const partyList = project.party;
  const npcList = Object.values(project.npcs);
  const monsterList = Object.values(project.monsters);
  const skillList = Object.values(project.skills);
  const itemList = Object.values(project.items);
  const loreList = project.lore;

  const getElementColor = (el: ElementType) => {
    switch (el) {
      case 'Pyro': return 'text-rose-400 bg-rose-500/10 border-rose-500/30';
      case 'Hydro': return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
      case 'Aero': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'Geo': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'Aether': return 'text-indigo-300 bg-indigo-500/10 border-indigo-500/30';
      case 'Umbra': return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      default: return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-61px)] bg-slate-950 overflow-hidden select-none">
      {/* Sub-navigation Tabs */}
      <div className="flex items-center gap-1 px-6 py-2.5 border-b border-slate-800 bg-slate-900/60 overflow-x-auto text-xs">
        <button
          onClick={() => { setActiveTab('party'); setSelectedId(''); audioManager.playSfx('click'); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'party' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Party Heroes ({partyList.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('npcs'); setSelectedId(''); audioManager.playSfx('click'); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'npcs' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>NPCs ({npcList.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('monsters'); setSelectedId(''); audioManager.playSfx('click'); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'monsters' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sword className="w-4 h-4" />
          <span>Bestiary & Bosses ({monsterList.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('skills'); setSelectedId(''); audioManager.playSfx('click'); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'skills' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Skills & Magic ({skillList.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('items'); setSelectedId(''); audioManager.playSfx('click'); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'items' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Items & Gear ({itemList.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('lore'); setSelectedId(''); audioManager.playSfx('click'); }}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
            activeTab === 'lore' ? 'bg-amber-400 text-slate-950 font-bold shadow-sm' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Lore Codex ({loreList.length})</span>
        </button>
      </div>

      {/* Main Database Content Area */}
      <div className="flex-1 overflow-y-auto p-6 max-w-7xl mx-auto w-full">
        {/* 1. PARTY HEROES */}
        {activeTab === 'party' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-cinzel text-xl font-bold text-amber-300">Playable Party Members</h2>
                <p className="text-xs text-slate-400">Configure hero classes, racial affinities, combat statistics, and anime avatars.</p>
              </div>
              <button
                onClick={() => {
                  const newHero: Character = {
                    id: `char_${Date.now()}`,
                    name: 'Aria Silverfang',
                    race: 'Therian (Beastkin)',
                    className: 'Sylph Ranger',
                    title: 'Swift Wind Hunter',
                    avatarUrl: '/src/assets/images/anime_heroine_mage_1794214252515.jpg',
                    level: 5,
                    exp: 0,
                    maxExp: 300,
                    hp: 190,
                    maxHp: 190,
                    mp: 75,
                    maxMp: 75,
                    atk: 44,
                    def: 26,
                    mag: 28,
                    spd: 46,
                    critRate: 18,
                    skills: ['skill_slash'],
                    equipment: {},
                    bio: 'A keen-eyed scout possessing feline senses and swift wind daggers.',
                  };
                  onUpdateProject(prev => ({ ...prev, party: [...prev.party, newHero] }));
                  audioManager.playSfx('select');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Hero</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {partyList.map((hero, idx) => (
                <div
                  key={hero.id}
                  className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden hover:border-amber-500/40 transition-all flex flex-col group shadow-lg"
                >
                  <div className="relative h-44 w-full bg-slate-950 overflow-hidden">
                    <img
                      src={hero.avatarUrl}
                      alt={hero.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3 bg-slate-950/80 backdrop-blur-md px-2.5 py-1 rounded border border-amber-500/30 text-[11px] font-mono text-amber-300">
                      Lv.{hero.level} {hero.className}
                    </div>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="font-cinzel text-lg font-bold text-slate-100">{hero.name}</div>
                      <div className="text-xs text-amber-400/90 font-medium mb-1">{hero.title}</div>
                      <div className="text-xs text-slate-400 mb-3">{hero.race}</div>

                      {/* Stat Bars */}
                      <div className="grid grid-cols-2 gap-2 text-[11px] font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 mb-3">
                        <div className="text-emerald-400">HP: {hero.hp}/{hero.maxHp}</div>
                        <div className="text-sky-400">MP: {hero.mp}/{hero.maxMp}</div>
                        <div className="text-rose-400">ATK: {hero.atk}</div>
                        <div className="text-amber-400">DEF: {hero.def}</div>
                        <div className="text-purple-400">MAG: {hero.mag}</div>
                        <div className="text-teal-400">SPD: {hero.spd}</div>
                      </div>

                      <p className="text-xs text-slate-400 line-clamp-2 italic mb-3">"{hero.bio}"</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                      <span className="text-[11px] text-slate-500 font-mono">Skills: {hero.skills.length}</span>
                      {partyList.length > 1 && (
                        <button
                          onClick={() => {
                            onUpdateProject(prev => ({
                              ...prev,
                              party: prev.party.filter(p => p.id !== hero.id),
                            }));
                            audioManager.playSfx('cancel');
                          }}
                          className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Remove</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. NPCS */}
        {activeTab === 'npcs' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-cinzel text-xl font-bold text-amber-300">NPC Directory</h2>
                <p className="text-xs text-slate-400">Manage town inhabitants, shopkeepers, quest guides, and dialogue triggers.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {npcList.map(npc => {
                const mapName = project.maps[npc.mapId]?.name || npc.mapId;
                return (
                  <div
                    key={npc.id}
                    className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/30 transition-all flex gap-3 shadow-md"
                  >
                    <img
                      src={npc.avatarUrl}
                      alt={npc.name}
                      className="w-16 h-16 rounded-lg object-cover border border-amber-500/40 bg-slate-950 shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-slate-100 truncate">{npc.name}</div>
                      <div className="text-xs text-amber-400 font-medium">{npc.role}</div>
                      <div className="text-[11px] text-slate-400 mt-1">{npc.race}</div>
                      <div className="text-[11px] text-slate-500 font-mono mt-1">
                        Location: {mapName} (X:{npc.x}, Y:{npc.y})
                      </div>
                      {npc.shopItems && (
                        <div className="text-[10px] text-emerald-400 mt-1 font-semibold">
                          Merchant: Sells {npc.shopItems.length} goods
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. MONSTERS & BOSSES */}
        {activeTab === 'monsters' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-cinzel text-xl font-bold text-amber-300">Bestiary & Boss Database</h2>
                <p className="text-xs text-slate-400">Elemental affinities, combat statistics, rewards, and AI battle drops.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {monsterList.map(mob => (
                <div
                  key={mob.id}
                  className={`rounded-xl overflow-hidden border transition-all ${
                    mob.isBoss
                      ? 'border-rose-500/50 bg-slate-900 shadow-xl shadow-rose-950/40 ring-1 ring-rose-500/30'
                      : 'border-slate-800 bg-slate-900 shadow-md'
                  }`}
                >
                  <div className="relative h-40 w-full bg-slate-950 overflow-hidden">
                    <img
                      src={mob.avatarUrl}
                      alt={mob.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                    {mob.isBoss && (
                      <div className="absolute top-3 left-3 bg-rose-600 text-white font-cinzel font-bold text-[10px] px-2 py-0.5 rounded shadow">
                        SOVEREIGN BOSS
                      </div>
                    )}
                    <div className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded border ${getElementColor(mob.element)}`}>
                      {mob.element}
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="font-cinzel text-base font-bold text-slate-100">{mob.name}</div>
                    <div className="text-xs text-slate-400 mb-2">Race: {mob.race}</div>

                    <div className="grid grid-cols-3 gap-1.5 text-[11px] font-mono bg-slate-950 p-2 rounded border border-slate-800 mb-3 text-center">
                      <div className="text-rose-400">HP {mob.hp}</div>
                      <div className="text-amber-400">ATK {mob.atk}</div>
                      <div className="text-sky-400">DEF {mob.def}</div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                      <span>EXP: +{mob.expReward}</span>
                      <span className="text-amber-300">Gold: +{mob.goldReward} G</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. SKILLS & MAGIC */}
        {activeTab === 'skills' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-cinzel text-xl font-bold text-amber-300">Grimoire of Skills & Spells</h2>
                <p className="text-xs text-slate-400">Magical abilities, power scaling, mana costs, and anime VFX animations.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {skillList.map(skill => (
                <div
                  key={skill.id}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/30 transition-all flex flex-col justify-between shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-sm text-slate-100">{skill.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${getElementColor(skill.element)}`}>
                        {skill.element}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mb-3">{skill.description}</div>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px] font-mono bg-slate-950 p-2 rounded border border-slate-800 text-center">
                    <div className="text-sky-400">MP: {skill.mpCost}</div>
                    <div className="text-amber-400">Power: {skill.power}</div>
                    <div className="text-slate-400 capitalize">{skill.effectType}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. ITEMS & GEAR */}
        {activeTab === 'items' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-cinzel text-xl font-bold text-amber-300">Armory, Potions & Relics</h2>
                <p className="text-xs text-slate-400">Consumables, weapons, enchanted robes, and key quest items.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {itemList.map(item => (
                <div
                  key={item.id}
                  className="p-4 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/30 transition-all flex flex-col justify-between shadow-md"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{item.icon}</span>
                      <div>
                        <div className="font-bold text-xs text-slate-100">{item.name}</div>
                        <div className="text-[10px] text-amber-400 capitalize">{item.type.replace('_', ' ')}</div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 mb-3">{item.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs font-mono">
                    <span className="text-slate-400">Value:</span>
                    <span className="text-amber-400 font-bold">{item.price > 0 ? `${item.price} G` : 'Priceless'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. LORE CODEX */}
        {activeTab === 'lore' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-cinzel text-xl font-bold text-amber-300">Aetheria Lore Codex</h2>
                <p className="text-xs text-slate-400">Ancient chronicles, elemental philosophies, divine pantheons, and legendary factions.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loreList.map(entry => (
                <div
                  key={entry.id}
                  className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all shadow-lg flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2.5 mb-2">
                      <span className="text-2xl">{entry.icon}</span>
                      <div>
                        <h3 className="font-cinzel text-base font-bold text-slate-100">{entry.title}</h3>
                        <p className="text-xs text-amber-400 font-medium">{entry.subtitle}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-300 leading-relaxed my-3 font-serif">
                      {entry.fullText}
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-500 font-mono capitalize">
                    Category: {entry.category}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
