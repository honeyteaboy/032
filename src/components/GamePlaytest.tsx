/**
 * Aetheria Anime JRPG Studio - Live Playtest Engine
 * Playable directly inside the studio with keyboard & touch controls, multi-layer rendering,
 * NPC dialogue with visual novel portraits, and turn-based battle engine.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Volume2,
  VolumeX,
  RotateCcw,
  Menu,
  X,
  Swords,
  Sparkles,
  Shield,
  Heart,
  Zap,
  ArrowRight
} from 'lucide-react';
import {
  Character,
  DialogueNode,
  DialogueTree,
  GameMap,
  Monster,
  ProjectData
} from '../types/game';
import { TILE_CATALOG, TILE_SIZE } from '../utils/tileCatalog';
import { audioManager } from '../utils/audio';

interface GamePlaytestProps {
  project: ProjectData;
  onUpdateProject: (updater: (prev: ProjectData) => ProjectData) => void;
  onExit: () => void;
}

export const GamePlaytest: React.FC<GamePlaytestProps> = ({
  project,
  onUpdateProject,
  onExit,
}) => {
  const [currentMapId, setCurrentMapId] = useState<string>(project.initialMapId || Object.keys(project.maps)[0]);
  const [playerX, setPlayerX] = useState<number>(project.initialPlayerX || 5);
  const [playerY, setPlayerY] = useState<number>(project.initialPlayerY || 5);
  const [playerDir, setPlayerDir] = useState<'up' | 'down' | 'left' | 'right'>('down');

  // Dialogue VN Modal state
  const [currentDialogueTree, setCurrentDialogueTree] = useState<DialogueTree | null>(null);
  const [currentDialogueNode, setCurrentDialogueNode] = useState<DialogueNode | null>(null);

  // In-game RPG Menu Modal state
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [menuTab, setMenuTab] = useState<'party' | 'items' | 'quests'>('party');

  // Battle State
  const [inBattle, setInBattle] = useState<boolean>(false);
  const [battleMob, setBattleMob] = useState<(Monster & { currentHp: number }) | null>(null);
  const [battleTurn, setBattleTurn] = useState<number>(0);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [damageNumber, setDamageNumber] = useState<{ val: number; isCrit?: boolean } | null>(null);

  // Simple Notification Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tick, setTick] = useState<number>(0);

  const activeMap: GameMap = project.maps[currentMapId] || Object.values(project.maps)[0];

  // Start peaceful town BGM upon playtest entry
  useEffect(() => {
    audioManager.playBgm('town');
    return () => {
      audioManager.stopBgm();
    };
  }, []);

  // Animation loop
  useEffect(() => {
    const timer = setInterval(() => {
      setTick(t => (t + 1) % 1000);
    }, 100);
    return () => clearInterval(timer);
  }, []);

  // Show Toast Notification
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  // Render Playtest Canvas
  const renderFrame = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeMap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Layer 1: Ground
    for (let y = 0; y < activeMap.height; y++) {
      for (let x = 0; x < activeMap.width; x++) {
        const tId = activeMap.ground[y]?.[x] || 0;
        const def = TILE_CATALOG[tId];
        if (def && tId > 0) {
          def.render(ctx, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, tick);
        } else {
          ctx.fillStyle = '#0f172a';
          ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        }
      }
    }

    // 2. Layer 2: Decoration
    for (let y = 0; y < activeMap.height; y++) {
      for (let x = 0; x < activeMap.width; x++) {
        const tId = activeMap.decoration[y]?.[x] || 0;
        const def = TILE_CATALOG[tId];
        if (def && tId > 0) {
          def.render(ctx, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, tick);
        }
      }
    }

    // 3. Draw Events & NPCs
    if (activeMap.events) {
      activeMap.events.forEach(evt => {
        const ex = evt.x * TILE_SIZE;
        const ey = evt.y * TILE_SIZE;

        if (evt.type === 'npc') {
          const npc = project.npcs[evt.npcId || ''];
          // Shadow
          ctx.fillStyle = 'rgba(0,0,0,0.35)';
          ctx.beginPath(); ctx.ellipse(ex + 16, ey + 28, 9, 4, 0, 0, Math.PI * 2); ctx.fill();
          // Sprite body
          ctx.fillStyle = '#d97706';
          ctx.fillRect(ex + 8, ey + 12, 16, 14);
          // Head
          ctx.fillStyle = '#ffedd5';
          ctx.beginPath(); ctx.arc(ex + 16, ey + 10, 6, 0, Math.PI * 2); ctx.fill();
          // Hair
          ctx.fillStyle = '#b45309';
          ctx.fillRect(ex + 11, ey + 4, 10, 5);
          // Name tag
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(npc?.name || evt.name, ex + 16, ey - 2);
        } else if (evt.type === 'chest') {
          const tId = evt.chestOpened ? 33 : 32;
          TILE_CATALOG[tId]?.render(ctx, ex, ey, TILE_SIZE, tick);
        } else if (evt.type === 'save_crystal') {
          TILE_CATALOG[34]?.render(ctx, ex, ey, TILE_SIZE, tick);
        } else if (evt.type === 'battle') {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
          ctx.beginPath(); ctx.arc(ex + 16, ey + 16, 12, 0, Math.PI * 2); ctx.fill();
          // Monster icon
          ctx.fillStyle = '#ef4444';
          ctx.fillRect(ex + 9, ey + 12, 14, 12);
        }
      });
    }

    // 4. Draw Player Hero Entity
    const px = playerX * TILE_SIZE;
    const py = playerY * TILE_SIZE;
    const hero = project.party[0];

    // Shadow
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.beginPath(); ctx.ellipse(px + 16, py + 28, 9, 4, 0, 0, Math.PI * 2); ctx.fill();

    // Body (Blue adventurer coat)
    ctx.fillStyle = '#2563eb';
    ctx.fillRect(px + 8, py + 12, 16, 14);
    // Face
    ctx.fillStyle = '#ffedd5';
    ctx.beginPath(); ctx.arc(px + 16, py + 10, 6, 0, Math.PI * 2); ctx.fill();
    // Silver-blue anime hair
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(px + 10, py + 4, 12, 6);
    // Rune blade on back/hand
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(px + 23, py + 8, 2, 12);
    ctx.fillStyle = '#67e8f9';
    ctx.fillRect(px + 22, py + 6, 4, 2);

    // Direction indicator
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(hero?.name || 'Kaito', px + 16, py - 3);

    // 5. Layer 3: Overhead (Roofs, Treetops - Renders ABOVE player!)
    for (let y = 0; y < activeMap.height; y++) {
      for (let x = 0; x < activeMap.width; x++) {
        const tId = activeMap.overhead[y]?.[x] || 0;
        const def = TILE_CATALOG[tId];
        if (def && tId > 0) {
          def.render(ctx, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, tick);
        }
      }
    }
  }, [activeMap, playerX, playerY, project, tick]);

  useEffect(() => {
    renderFrame();
  }, [renderFrame]);

  // Movement & Interaction Logic
  const tryMove = useCallback((dx: number, dy: number) => {
    if (currentDialogueTree || inBattle || isMenuOpen) return;
    if (!activeMap) return;

    if (dx > 0) setPlayerDir('right');
    else if (dx < 0) setPlayerDir('left');
    else if (dy > 0) setPlayerDir('down');
    else if (dy < 0) setPlayerDir('up');

    const nx = playerX + dx;
    const ny = playerY + dy;

    // Bounds check
    if (nx < 0 || nx >= activeMap.width || ny < 0 || ny >= activeMap.height) return;

    // Collision check
    if (activeMap.collision[ny]?.[nx]) {
      audioManager.playSfx('click');
      return;
    }

    // Check solid event blocks (NPCs or unopened chests)
    const blockingEvt = activeMap.events?.find(
      e => e.x === nx && e.y === ny && (e.type === 'npc' || (e.type === 'chest' && !e.chestOpened) || e.type === 'save_crystal')
    );
    if (blockingEvt) {
      handleInteract(nx, ny);
      return;
    }

    setPlayerX(nx);
    setPlayerY(ny);

    // Check step triggers (teleport portals, monster ambush)
    const stepEvt = activeMap.events?.find(e => e.x === nx && e.y === ny);
    if (stepEvt) {
      if (stepEvt.type === 'teleport' && stepEvt.targetMapId) {
        audioManager.playSfx('magic');
        setCurrentMapId(stepEvt.targetMapId);
        setPlayerX(stepEvt.targetX || 1);
        setPlayerY(stepEvt.targetY || 1);
        showToast(`Entered ${project.maps[stepEvt.targetMapId]?.name || 'New Map'}`);
      } else if (stepEvt.type === 'battle' && stepEvt.monsterId) {
        startCombat(stepEvt.monsterId);
      }
    }
  }, [currentDialogueTree, inBattle, isMenuOpen, activeMap, playerX, playerY, project]);

  // Handle Player Interaction
  const handleInteract = (targetX?: number, targetY?: number) => {
    if (currentDialogueTree) {
      advanceDialogue();
      return;
    }
    if (inBattle || isMenuOpen) return;

    let tx = targetX !== undefined ? targetX : playerX;
    let ty = targetY !== undefined ? targetY : playerY;

    if (targetX === undefined && targetY === undefined) {
      if (playerDir === 'up') ty--;
      else if (playerDir === 'down') ty++;
      else if (playerDir === 'left') tx--;
      else if (playerDir === 'right') tx++;
    }

    const evt = activeMap.events?.find(
      e => (e.x === tx && e.y === ty) || (e.x === playerX && e.y === playerY)
    );

    if (!evt) return;

    if (evt.type === 'npc' && evt.npcId) {
      const npc = project.npcs[evt.npcId];
      if (npc?.dialogueId && project.dialogues[npc.dialogueId]) {
        const tree = project.dialogues[npc.dialogueId];
        setCurrentDialogueTree(tree);
        setCurrentDialogueNode(tree.nodes[tree.initialNodeId]);
        audioManager.playSfx('select');
      }
    } else if (evt.type === 'chest' && !evt.chestOpened) {
      onUpdateProject(prev => {
        const map = prev.maps[currentMapId];
        const updatedEvts = map.events.map(e => e.id === evt.id ? { ...e, chestOpened: true } : e);
        let newGold = prev.gold + (evt.chestGold || 0);
        let newInv = [...prev.inventory];
        if (evt.chestItemId) {
          const existing = newInv.find(i => i.itemId === evt.chestItemId);
          if (existing) existing.quantity++;
          else newInv.push({ itemId: evt.chestItemId, quantity: 1 });
        }
        return {
          ...prev,
          gold: newGold,
          inventory: newInv,
          maps: { ...prev.maps, [currentMapId]: { ...map, events: updatedEvts } },
        };
      });
      audioManager.playSfx('chest');
      showToast(`Chest opened! Acquired ${evt.chestGold || 0} G & ${project.items[evt.chestItemId || '']?.name || 'Item'}`);
    } else if (evt.type === 'save_crystal') {
      audioManager.playSfx('heal');
      onUpdateProject(prev => ({
        ...prev,
        party: prev.party.map(h => ({ ...h, hp: h.maxHp, mp: h.maxMp })),
      }));
      showToast('Aether Crystal: Full party HP & MP restored!');
    } else if (evt.type === 'battle' && evt.monsterId) {
      startCombat(evt.monsterId);
    }
  };

  // Dialogue Node Advance
  const advanceDialogue = () => {
    if (!currentDialogueNode || !currentDialogueTree) return;
    if (currentDialogueNode.choices && currentDialogueNode.choices.length > 0) return;

    if (currentDialogueNode.actionTrigger === 'give_quest' && currentDialogueNode.questId) {
      onUpdateProject(prev => ({
        ...prev,
        quests: {
          ...prev.quests,
          [currentDialogueNode.questId!]: {
            ...prev.quests[currentDialogueNode.questId!],
            status: 'active',
          },
        },
      }));
      showToast(`Quest Accepted: ${project.quests[currentDialogueNode.questId]?.title}`);
    }

    if (currentDialogueNode.nextNodeId && currentDialogueTree.nodes[currentDialogueNode.nextNodeId]) {
      setCurrentDialogueNode(currentDialogueTree.nodes[currentDialogueNode.nextNodeId]);
      audioManager.playSfx('click');
    } else {
      setCurrentDialogueTree(null);
      setCurrentDialogueNode(null);
    }
  };

  // Keyboard Event Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') tryMove(0, -1);
      else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') tryMove(0, 1);
      else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') tryMove(-1, 0);
      else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') tryMove(1, 0);
      else if (e.key === ' ' || e.key === 'Enter') handleInteract();
      else if (e.key === 'Escape' || e.key === 'm' || e.key === 'M') {
        setIsMenuOpen(prev => !prev);
        audioManager.playSfx('click');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [tryMove, handleInteract]);

  // Turn-Based JRPG Combat Logic
  const startCombat = (monsterId: string) => {
    const mob = project.monsters[monsterId];
    if (!mob) return;
    setBattleMob({ ...mob, currentHp: mob.hp });
    setInBattle(true);
    setBattleTurn(0);
    setBattleLog([`Ambushed by ${mob.name}!`]);
    audioManager.playBgm('battle');
    audioManager.playSfx('slash');
  };

  const handleHeroAttack = () => {
    if (!battleMob) return;
    const hero = project.party[battleTurn];
    const dmg = Math.max(12, Math.floor(hero.atk * 1.8 - battleMob.def * 0.8));
    const newMobHp = Math.max(0, battleMob.currentHp - dmg);

    audioManager.playSfx('slash');
    setDamageNumber({ val: dmg, isCrit: Math.random() < (hero.critRate / 100) });
    setTimeout(() => setDamageNumber(null), 800);

    setBattleMob({ ...battleMob, currentHp: newMobHp });
    setBattleLog(prev => [`${hero.name} attacks ${battleMob.name} for ${dmg} DMG!`, ...prev.slice(0, 4)]);

    if (newMobHp <= 0) {
      handleBattleVictory();
      return;
    }

    // Advance to next hero or enemy turn
    advanceBattleTurn();
  };

  const handleHeroSkill = () => {
    if (!battleMob) return;
    const hero = project.party[battleTurn];
    if (hero.mp < 15) {
      showToast('Not enough MP!');
      return;
    }

    onUpdateProject(prev => ({
      ...prev,
      party: prev.party.map((h, i) => i === battleTurn ? { ...h, mp: h.mp - 15 } : h),
    }));

    audioManager.playSfx('magic');
    const dmg = Math.max(28, Math.floor(hero.mag * 2.5 - battleMob.def * 0.5));
    const newMobHp = Math.max(0, battleMob.currentHp - dmg);

    setDamageNumber({ val: dmg, isCrit: true });
    setTimeout(() => setDamageNumber(null), 800);

    setBattleMob({ ...battleMob, currentHp: newMobHp });
    setBattleLog(prev => [`${hero.name} cast Stellar Burst for ${dmg} DMG!`, ...prev.slice(0, 4)]);

    if (newMobHp <= 0) {
      handleBattleVictory();
      return;
    }

    advanceBattleTurn();
  };

  const advanceBattleTurn = () => {
    if (battleTurn + 1 < project.party.length) {
      setBattleTurn(t => t + 1);
    } else {
      // Enemy turn
      setBattleTurn(0);
      setTimeout(enemyTurn, 600);
    }
  };

  const enemyTurn = () => {
    if (!battleMob || battleMob.currentHp <= 0) return;
    const targetIdx = Math.floor(Math.random() * project.party.length);
    const targetHero = project.party[targetIdx];
    const dmg = Math.max(8, Math.floor(battleMob.atk - targetHero.def * 0.4));

    audioManager.playSfx('slash');
    onUpdateProject(prev => ({
      ...prev,
      party: prev.party.map((h, i) => i === targetIdx ? { ...h, hp: Math.max(0, h.hp - dmg) } : h),
    }));

    setBattleLog(prev => [`${battleMob.name} strikes ${targetHero.name} for ${dmg} DMG!`, ...prev.slice(0, 4)]);

    // Check party defeat
    const anyAlive = project.party.some((h, i) => i === targetIdx ? (h.hp - dmg) > 0 : h.hp > 0);
    if (!anyAlive) {
      showToast('Party defeated! Resting at crystal...');
      onUpdateProject(prev => ({
        ...prev,
        party: prev.party.map(h => ({ ...h, hp: Math.floor(h.maxHp * 0.5) })),
      }));
      setInBattle(false);
      audioManager.playBgm('town');
    }
  };

  const handleBattleVictory = () => {
    if (!battleMob) return;
    audioManager.playSfx('levelup');
    onUpdateProject(prev => ({
      ...prev,
      gold: prev.gold + battleMob.goldReward,
      party: prev.party.map(h => {
        const nextExp = h.exp + battleMob.expReward;
        if (nextExp >= h.maxExp) {
          return {
            ...h,
            level: h.level + 1,
            exp: nextExp - h.maxExp,
            maxExp: Math.floor(h.maxExp * 1.5),
            maxHp: h.maxHp + 25,
            hp: h.maxHp + 25,
            maxMp: h.maxMp + 12,
            mp: h.maxMp + 12,
            atk: h.atk + 6,
            def: h.def + 4,
            mag: h.mag + 5,
          };
        }
        return { ...h, exp: nextExp };
      }),
    }));

    showToast(`Victory! +${battleMob.expReward} EXP · +${battleMob.goldReward} Gold!`);
    setTimeout(() => {
      setInBattle(false);
      setBattleMob(null);
      audioManager.playBgm('town');
    }, 1200);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-61px)] bg-slate-950 overflow-hidden relative select-none">
      {/* HUD Header */}
      <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => {
              setIsMenuOpen(true);
              audioManager.playSfx('click');
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-amber-500/40 text-amber-300 font-semibold text-xs backdrop-blur-md shadow-lg hover:bg-slate-800"
          >
            <Menu className="w-4 h-4" />
            <span>Party Menu</span>
          </button>
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-800 text-slate-300 text-xs backdrop-blur-md font-mono">
            {activeMap?.name}
          </div>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="px-3 py-1.5 rounded-lg bg-slate-900/90 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold backdrop-blur-md">
            🪙 {project.gold} G
          </div>
          <button
            onClick={onExit}
            className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:text-white text-xs font-medium"
          >
            Exit Playtest
          </button>
        </div>
      </div>

      {/* Main Playtest Canvas */}
      <div className="flex-1 flex items-center justify-center p-4 bg-slate-950 overflow-auto">
        <div className="shadow-2xl rounded-xl border border-slate-800 overflow-hidden relative bg-slate-900">
          <canvas
            ref={canvasRef}
            width={activeMap ? activeMap.width * TILE_SIZE : 320}
            height={activeMap ? activeMap.height * TILE_SIZE : 320}
            className="block"
          />
        </div>
      </div>

      {/* Toast Notification */}
      {toastMsg && (
        <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-full shadow-2xl animate-bounce">
          {toastMsg}
        </div>
      )}

      {/* Anime Visual Novel Dialogue Box */}
      {currentDialogueTree && currentDialogueNode && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[94%] max-w-2xl z-40 bg-slate-950/95 border-2 border-amber-500/70 rounded-xl p-4 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom duration-200">
          <div className="flex gap-4 items-start">
            {currentDialogueNode.avatarUrl && (
              <img
                src={currentDialogueNode.avatarUrl}
                alt={currentDialogueNode.speakerName}
                className="w-16 h-16 rounded-lg object-cover border-2 border-amber-400 bg-slate-900 shrink-0 shadow-md"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="font-cinzel text-amber-400 font-bold text-sm mb-1">
                {currentDialogueNode.speakerName}
              </div>
              <p className="text-xs text-slate-200 leading-relaxed min-h-[44px]">
                {currentDialogueNode.text}
              </p>
            </div>
          </div>

          {/* Branching choices */}
          {currentDialogueNode.choices && currentDialogueNode.choices.length > 0 ? (
            <div className="mt-3 pt-3 border-t border-slate-800 space-y-1.5">
              {currentDialogueNode.choices.map((ch, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    audioManager.playSfx('click');
                    if (ch.actionTrigger === 'open_shop') {
                      setCurrentDialogueTree(null);
                      setIsMenuOpen(true);
                      setMenuTab('items');
                    } else if (ch.actionTrigger === 'heal_party') {
                      audioManager.playSfx('heal');
                      onUpdateProject(prev => ({
                        ...prev,
                        party: prev.party.map(h => ({ ...h, hp: h.maxHp, mp: h.maxMp })),
                      }));
                      showToast('Party fully restored!');
                      setCurrentDialogueTree(null);
                    } else if (ch.nextNodeId && currentDialogueTree.nodes[ch.nextNodeId]) {
                      setCurrentDialogueNode(currentDialogueTree.nodes[ch.nextNodeId]);
                    } else {
                      setCurrentDialogueTree(null);
                    }
                  }}
                  className="w-full text-left px-3 py-2 rounded bg-slate-900 hover:bg-amber-400/20 hover:border-amber-400/60 border border-slate-800 text-xs text-slate-100 flex items-center justify-between transition-colors"
                >
                  <span>➤ {ch.text}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-2 text-right">
              <button
                onClick={advanceDialogue}
                className="px-3 py-1 bg-amber-400 text-slate-950 font-bold rounded text-xs hover:bg-amber-300"
              >
                Next ▶
              </button>
            </div>
          )}
        </div>
      )}

      {/* Turn-Based Battle Overlay Screen */}
      {inBattle && battleMob && (
        <div className="absolute inset-0 z-50 bg-slate-950/95 flex flex-col p-6 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Swords className="w-5 h-5 text-rose-500 animate-pulse" />
              <span className="font-cinzel text-lg font-bold text-amber-400">Battle Encounter</span>
            </div>
            <div className="text-xs font-mono text-sky-400">
              Active: {project.party[battleTurn]?.name} (Turn {battleTurn + 1})
            </div>
          </div>

          {/* Arena: Monster vs Party */}
          <div className="flex-1 flex flex-col md:flex-row items-center justify-around gap-6 my-4 relative">
            {/* Monster Card */}
            <div className="p-4 rounded-xl bg-slate-900 border-2 border-rose-500/50 text-center w-64 shadow-2xl relative">
              <img
                src={battleMob.avatarUrl}
                alt={battleMob.name}
                className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-rose-500 mb-2 bg-slate-950 shadow-md"
              />
              <div className="font-cinzel font-bold text-slate-100 text-base">{battleMob.name}</div>
              <div className="text-xs text-rose-400 font-semibold mb-2">{battleMob.element} Affinity</div>
              <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mb-1">
                <div
                  style={{ width: `${(battleMob.currentHp / battleMob.hp) * 100}%` }}
                  className="bg-rose-500 h-full transition-all duration-300"
                />
              </div>
              <div className="text-[11px] font-mono text-slate-400">
                HP {battleMob.currentHp} / {battleMob.hp}
              </div>

              {/* Floating Damage Popup */}
              {damageNumber && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-cinzel font-black text-2xl text-amber-300 drop-shadow-[0_2px_10px_rgba(245,158,11,0.8)] animate-bounce">
                  -{damageNumber.val} {damageNumber.isCrit ? 'CRIT!' : ''}
                </div>
              )}
            </div>

            {/* Party Cards */}
            <div className="flex flex-wrap md:flex-nowrap gap-3">
              {project.party.map((hero, idx) => (
                <div
                  key={hero.id}
                  className={`p-3 rounded-xl border text-center w-36 transition-all ${
                    idx === battleTurn
                      ? 'border-amber-400 bg-amber-400/10 shadow-lg shadow-amber-400/20 scale-105'
                      : 'border-slate-800 bg-slate-900 opacity-80'
                  }`}
                >
                  <img
                    src={hero.avatarUrl}
                    alt={hero.name}
                    className="w-14 h-14 rounded-full mx-auto object-cover border border-amber-400/60 mb-1.5"
                  />
                  <div className="font-bold text-xs text-slate-100 truncate">{hero.name}</div>
                  <div className="text-[10px] text-amber-400 font-mono">Lv.{hero.level} {hero.className}</div>

                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-2 mb-0.5">
                    <div style={{ width: `${(hero.hp / hero.maxHp) * 100}%` }} className="bg-emerald-500 h-full" />
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400">HP {hero.hp}/{hero.maxHp}</div>

                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-1 mb-0.5">
                    <div style={{ width: `${(hero.mp / hero.maxMp) * 100}%` }} className="bg-sky-500 h-full" />
                  </div>
                  <div className="text-[10px] font-mono text-sky-400">MP {hero.mp}/{hero.maxMp}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Battle Action Commands & Log */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="flex items-center gap-2">
              <button
                onClick={handleHeroAttack}
                className="px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-md shadow-rose-600/30 flex items-center gap-1.5"
              >
                <Swords className="w-4 h-4" />
                <span>Attack</span>
              </button>
              <button
                onClick={handleHeroSkill}
                className="px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4" />
                <span>Skill (15 MP)</span>
              </button>
              <button
                onClick={() => {
                  const pot = project.inventory.find(i => i.itemId === 'item_potion' && i.quantity > 0);
                  if (pot) {
                    pot.quantity--;
                    const h = project.party[battleTurn];
                    h.hp = Math.min(h.maxHp, h.hp + 80);
                    audioManager.playSfx('heal');
                    advanceBattleTurn();
                  } else showToast('No Potions left!');
                }}
                className="px-3 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
              >
                Potion
              </button>
              <button
                onClick={() => {
                  audioManager.playSfx('select');
                  advanceBattleTurn();
                }}
                className="px-3 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Guard
              </button>
              <button
                onClick={() => {
                  audioManager.playSfx('cancel');
                  setInBattle(false);
                  audioManager.playBgm('town');
                }}
                className="px-3 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs"
              >
                Flee
              </button>
            </div>

            {/* Combat Log */}
            <div className="text-xs font-mono text-slate-300 max-w-xs text-right">
              {battleLog[0] || 'Awaiting command...'}
            </div>
          </div>
        </div>
      )}

      {/* In-Game RPG Menu Modal */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/50 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <span className="font-cinzel text-lg font-bold text-amber-400">Party Journal</span>
                <span className="text-xs text-slate-400 font-mono">🪙 {project.gold} G</span>
              </div>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Menu Tabs */}
            <div className="flex items-center gap-2 mb-4">
              {(['party', 'items', 'quests'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setMenuTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                    menuTab === tab ? 'bg-amber-400 text-slate-950' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto space-y-3">
              {menuTab === 'party' && (
                <div className="space-y-3">
                  {project.party.map(hero => (
                    <div key={hero.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-3">
                      <img src={hero.avatarUrl} alt={hero.name} className="w-14 h-14 rounded-lg object-cover border border-amber-400/50" />
                      <div className="flex-1">
                        <div className="font-bold text-sm text-slate-100">{hero.name} (Lv.{hero.level})</div>
                        <div className="text-xs text-amber-400">{hero.className} · {hero.race}</div>
                        <div className="flex gap-4 text-xs font-mono mt-1 text-slate-300">
                          <span className="text-emerald-400">HP {hero.hp}/{hero.maxHp}</span>
                          <span className="text-sky-400">MP {hero.mp}/{hero.maxMp}</span>
                          <span>ATK {hero.atk}</span>
                          <span>DEF {hero.def}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {menuTab === 'items' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {project.inventory.map(inv => {
                    const itm = project.items[inv.itemId];
                    if (!itm) return null;
                    return (
                      <div key={inv.itemId} className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="font-bold text-xs text-slate-100">{itm.icon} {itm.name}</div>
                          <div className="text-[11px] text-slate-400">{itm.description}</div>
                        </div>
                        <span className="text-xs font-bold font-mono text-amber-400">x{inv.quantity}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {menuTab === 'quests' && (
                <div className="space-y-3">
                  {Object.values(project.quests).map(q => (
                    <div key={q.id} className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-amber-300">{q.title}</span>
                        <span className="text-[10px] font-mono capitalize text-slate-400">{q.status}</span>
                      </div>
                      <p className="text-xs text-slate-300 mb-2">{q.summary}</p>
                      {q.objectives.map(o => (
                        <div key={o.id} className="text-[11px] text-slate-400">• {o.text}</div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile Virtual Controls */}
      <div className="md:hidden fixed bottom-14 left-0 right-0 z-30 px-6 py-2 flex items-end justify-between pointer-events-none">
        {/* Virtual D-Pad */}
        <div className="relative w-32 h-32 pointer-events-auto">
          <button
            onClick={() => tryMove(0, -1)}
            className="absolute top-0 left-11 w-10 h-10 rounded-lg bg-slate-900/90 border border-amber-500/50 text-amber-300 font-bold active:bg-amber-400 active:text-slate-950 flex items-center justify-center shadow-lg"
          >
            ▲
          </button>
          <button
            onClick={() => tryMove(0, 1)}
            className="absolute bottom-0 left-11 w-10 h-10 rounded-lg bg-slate-900/90 border border-amber-500/50 text-amber-300 font-bold active:bg-amber-400 active:text-slate-950 flex items-center justify-center shadow-lg"
          >
            ▼
          </button>
          <button
            onClick={() => tryMove(-1, 0)}
            className="absolute top-11 left-0 w-10 h-10 rounded-lg bg-slate-900/90 border border-amber-500/50 text-amber-300 font-bold active:bg-amber-400 active:text-slate-950 flex items-center justify-center shadow-lg"
          >
            ◀
          </button>
          <button
            onClick={() => tryMove(1, 0)}
            className="absolute top-11 right-0 w-10 h-10 rounded-lg bg-slate-900/90 border border-amber-500/50 text-amber-300 font-bold active:bg-amber-400 active:text-slate-950 flex items-center justify-center shadow-lg"
          >
            ▶
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pointer-events-auto">
          <button
            onClick={() => handleInteract()}
            className="w-14 h-14 rounded-full bg-amber-400 text-slate-950 font-black text-base flex items-center justify-center shadow-xl active:scale-95"
          >
            A
          </button>
          <button
            onClick={() => setIsMenuOpen(prev => !prev)}
            className="w-14 h-14 rounded-full bg-slate-900/90 border-2 border-sky-400 text-sky-300 font-black text-base flex items-center justify-center shadow-xl active:scale-95"
          >
            B
          </button>
        </div>
      </div>
    </div>
  );
};
