/**
 * Aetheria Anime JRPG Studio - Standalone HTML Game Exporter
 * Bundles the entire game project, assets, Web Audio synthesizer, canvas renderer,
 * and turn-based battle system into a single self-contained playable HTML file.
 */

import { ProjectData } from '../types/game';

export function generateStandaloneGameHtml(project: ProjectData): string {
  // Convert project data to clean JSON string safe to inject into inline script
  const serializedProject = JSON.stringify(project).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
  <title>${project.name} - Playable JRPG</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Plus+Jakarta+Sans:wght@400;600;700&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; -webkit-user-select: none; }
    body {
      background-color: #030712;
      color: #f3f4f6;
      font-family: 'Plus Jakarta Sans', sans-serif;
      overflow: hidden;
      width: 100vw;
      height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    #game-container {
      position: relative;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at center, #0f172a 0%, #020617 100%);
    }
    canvas {
      display: block;
      image-rendering: pixelated;
      image-rendering: crisp-edges;
      border-radius: 8px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.8), 0 0 20px rgba(56, 189, 248, 0.15);
      max-width: 100%;
      max-height: 100%;
      object-fit: contain;
    }
    /* HUD Overlays */
    .hud-bar {
      position: absolute;
      top: 12px;
      left: 12px;
      display: flex;
      gap: 10px;
      z-index: 20;
    }
    .hud-btn {
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(245, 158, 11, 0.4);
      color: #fef3c7;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      backdrop-filter: blur(8px);
      transition: all 0.15s ease;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .hud-btn:hover {
      background: rgba(245, 158, 11, 0.2);
      border-color: #f59e0b;
    }
    .gold-badge {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(15, 23, 42, 0.85);
      border: 1px solid rgba(245, 158, 11, 0.4);
      color: #fbbf24;
      padding: 6px 14px;
      border-radius: 6px;
      font-size: 13px;
      font-weight: 700;
      font-family: 'JetBrains Mono', monospace;
      z-index: 20;
    }

    /* Dialogue VN Box */
    #dialogue-modal {
      display: none;
      position: absolute;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      width: 92%;
      max-width: 780px;
      background: rgba(10, 15, 30, 0.94);
      border: 2px solid #d97706;
      border-radius: 12px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.8), 0 0 15px rgba(245, 158, 11, 0.25);
      padding: 16px;
      z-index: 50;
      backdrop-filter: blur(12px);
    }
    .dialogue-content {
      display: flex;
      gap: 16px;
      align-items: flex-start;
    }
    .dialogue-avatar {
      width: 72px;
      height: 72px;
      border-radius: 10px;
      border: 2px solid #f59e0b;
      object-fit: cover;
      flex-shrink: 0;
      background: #1e293b;
    }
    .dialogue-text-wrap {
      flex: 1;
    }
    .dialogue-speaker {
      font-family: 'Cinzel', serif;
      font-size: 15px;
      color: #fbbf24;
      font-weight: 700;
      margin-bottom: 6px;
    }
    .dialogue-body {
      font-size: 14px;
      line-height: 1.5;
      color: #e2e8f0;
      min-height: 48px;
    }
    .dialogue-choices {
      margin-top: 12px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .choice-btn {
      background: rgba(30, 41, 59, 0.8);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #f8fafc;
      padding: 8px 12px;
      border-radius: 6px;
      font-size: 13px;
      text-align: left;
      cursor: pointer;
      transition: all 0.15s;
    }
    .choice-btn:hover {
      background: rgba(245, 158, 11, 0.25);
      border-color: #f59e0b;
      transform: translateX(4px);
    }

    /* Battle Screen */
    #battle-modal {
      display: none;
      position: absolute;
      inset: 0;
      background: radial-gradient(circle at center, #1e1b4b 0%, #030712 100%);
      z-index: 60;
      display: flex;
      flex-direction: column;
      padding: 20px;
    }
    .battle-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
    }
    .battle-arena {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: space-around;
      position: relative;
    }
    .monster-card {
      background: rgba(15, 23, 42, 0.85);
      border: 2px solid #ef4444;
      border-radius: 12px;
      padding: 16px;
      text-align: center;
      width: 220px;
      box-shadow: 0 0 25px rgba(239, 68, 68, 0.3);
      position: relative;
    }
    .monster-avatar {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      border: 3px solid #ef4444;
      object-fit: cover;
      margin: 0 auto 10px;
      background: #0f172a;
    }
    .party-container {
      display: flex;
      gap: 12px;
    }
    .party-card {
      background: rgba(15, 23, 42, 0.85);
      border: 2px solid #38bdf8;
      border-radius: 12px;
      padding: 12px;
      width: 160px;
      text-align: center;
    }
    .party-card.active-turn {
      border-color: #f59e0b;
      box-shadow: 0 0 20px rgba(245, 158, 11, 0.5);
      transform: translateY(-6px);
    }
    .party-avatar {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      border: 2px solid #38bdf8;
      object-fit: cover;
      margin: 0 auto 6px;
      background: #0f172a;
    }
    .bar-wrap {
      background: #334155;
      height: 8px;
      border-radius: 4px;
      overflow: hidden;
      margin: 4px 0;
    }
    .hp-fill { background: #22c55e; height: 100%; transition: width 0.3s; }
    .mp-fill { background: #3b82f6; height: 100%; transition: width 0.3s; }
    .battle-command-dock {
      background: rgba(10, 15, 30, 0.95);
      border: 1px solid rgba(245, 158, 11, 0.4);
      border-radius: 12px;
      padding: 16px;
      display: flex;
      gap: 16px;
    }
    .cmd-btn {
      background: rgba(30, 41, 59, 0.8);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #f8fafc;
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s;
    }
    .cmd-btn:hover {
      background: rgba(245, 158, 11, 0.3);
      border-color: #f59e0b;
    }

    /* In-game RPG Menu Modal */
    #rpg-menu {
      display: none;
      position: absolute;
      inset: 20px;
      background: rgba(10, 15, 30, 0.96);
      border: 2px solid #d97706;
      border-radius: 14px;
      padding: 20px;
      z-index: 70;
      backdrop-filter: blur(16px);
      flex-direction: column;
    }

    /* Mobile Virtual Controls */
    #touch-controls {
      display: none;
      position: absolute;
      bottom: 20px;
      left: 0;
      right: 0;
      padding: 0 20px;
      pointer-events: none;
      z-index: 30;
      justify-content: space-between;
      align-items: flex-end;
    }
    .touch-dpad {
      position: relative;
      width: 130px;
      height: 130px;
      pointer-events: auto;
    }
    .dpad-btn {
      position: absolute;
      width: 42px;
      height: 42px;
      background: rgba(30, 41, 59, 0.85);
      border: 1px solid rgba(245, 158, 11, 0.5);
      border-radius: 8px;
      color: #fbbf24;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      font-weight: bold;
    }
    .dpad-up { top: 0; left: 44px; }
    .dpad-down { bottom: 0; left: 44px; }
    .dpad-left { top: 44px; left: 0; }
    .dpad-right { top: 44px; right: 0; }
    .touch-actions {
      display: flex;
      gap: 12px;
      pointer-events: auto;
    }
    .act-btn {
      width: 54px;
      height: 54px;
      border-radius: 50%;
      background: rgba(30, 41, 59, 0.85);
      border: 2px solid #f59e0b;
      color: #fef08a;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 16px;
    }

    @media (max-width: 768px) {
      #touch-controls { display: flex; }
      .party-container { flex-direction: column; }
      .party-card { width: 130px; padding: 6px; }
    }
  </style>
</head>
<body>
  <div id="game-container">
    <div class="hud-bar">
      <button class="hud-btn" id="btn-toggle-menu">📜 Menu</button>
      <button class="hud-btn" id="btn-toggle-audio">🔊 Audio</button>
    </div>
    <div class="gold-badge" id="hud-gold">🪙 ${project.gold} G</div>

    <canvas id="game-canvas"></canvas>

    <!-- Dialogue Box -->
    <div id="dialogue-modal">
      <div class="dialogue-content">
        <img id="dlg-avatar" class="dialogue-avatar" src="" alt="Speaker" />
        <div class="dialogue-text-wrap">
          <div id="dlg-speaker" class="dialogue-speaker">Speaker Name</div>
          <div id="dlg-body" class="dialogue-body">Speech text appears here...</div>
          <div id="dlg-choices" class="dialogue-choices"></div>
        </div>
      </div>
    </div>

    <!-- Battle Screen -->
    <div id="battle-modal">
      <div class="battle-header">
        <div style="font-family: 'Cinzel'; font-size: 20px; color: #fbbf24;">⚡ BATTLE ENCOUNTER</div>
        <div id="battle-turn-indicator" style="color: #38bdf8; font-weight: 600;">Player Turn</div>
      </div>
      <div class="battle-arena">
        <div class="party-container" id="battle-party-cards"></div>
        <div class="monster-card" id="battle-monster-card">
          <img id="battle-mob-avatar" class="monster-avatar" src="" alt="Monster" />
          <div id="battle-mob-name" style="font-weight: bold; font-size: 16px; color: #f87171;">Monster</div>
          <div class="bar-wrap"><div id="battle-mob-hp" class="hp-fill" style="width: 100%;"></div></div>
          <div id="battle-mob-hp-text" style="font-size: 12px; color: #94a3b8; font-family: monospace;">HP 100/100</div>
        </div>
      </div>
      <div class="battle-command-dock" id="battle-cmd-dock">
        <button class="cmd-btn" id="btn-battle-attack">⚔️ Attack</button>
        <button class="cmd-btn" id="btn-battle-skill">✨ Skill</button>
        <button class="cmd-btn" id="btn-battle-item">🧪 Item</button>
        <button class="cmd-btn" id="btn-battle-guard">🛡️ Guard</button>
        <button class="cmd-btn" id="btn-battle-flee">🏃 Flee</button>
      </div>
    </div>

    <!-- RPG Menu -->
    <div id="rpg-menu">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid #d97706; padding-bottom: 12px; margin-bottom: 16px;">
        <h2 style="font-family:'Cinzel'; color:#fbbf24;">Party Journal & Inventory</h2>
        <button class="hud-btn" id="btn-close-menu">✕ Close</button>
      </div>
      <div style="display: flex; gap: 20px; flex: 1; overflow: hidden;">
        <div style="flex: 1; overflow-y: auto;" id="menu-party-list"></div>
        <div style="flex: 1; border-left: 1px solid #334155; padding-left: 16px; overflow-y: auto;" id="menu-inventory-list"></div>
        <div style="flex: 1; border-left: 1px solid #334155; padding-left: 16px; overflow-y: auto;" id="menu-quest-list"></div>
      </div>
    </div>

    <!-- Mobile Virtual Controls -->
    <div id="touch-controls">
      <div class="touch-dpad">
        <div class="dpad-btn dpad-up" id="btn-dpad-up">▲</div>
        <div class="dpad-btn dpad-down" id="btn-dpad-down">▼</div>
        <div class="dpad-btn dpad-left" id="btn-dpad-left">◀</div>
        <div class="dpad-btn dpad-right" id="btn-dpad-right">▶</div>
      </div>
      <div class="touch-actions">
        <div class="act-btn" id="btn-action-a">A</div>
        <div class="act-btn" id="btn-action-b" style="border-color:#38bdf8;">B</div>
      </div>
    </div>
  </div>

  <script>
    // Embedded Project Data
    const project = ${serializedProject};

    // Synthesized Web Audio API Engine
    let audioCtx = null;
    let isMuted = false;
    let bgmInterval = null;

    function initAudio() {
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    }

    function playSfx(type) {
      if (isMuted) return;
      initAudio();
      if (!audioCtx) return;
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);

      if (type === 'slash') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.2);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      } else if (type === 'magic') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.3);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'click') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523, now);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.start(now);
        osc.stop(now + 0.08);
      }
    }

    function playBgm(theme) {
      if (isMuted) return;
      initAudio();
      if (!audioCtx) return;
      if (bgmInterval) clearInterval(bgmInterval);

      let chords = [
        [261.63, 329.63, 392.00], // C
        [349.23, 440.00, 523.25], // F
        [392.00, 493.88, 587.33], // G
        [220.00, 261.63, 329.63], // Am
      ];
      let tempo = 380;
      if (theme === 'battle') {
        chords = [
          [293.66, 349.23, 440.00], // Dm
          [233.08, 293.66, 349.23], // Bb
          [261.63, 329.63, 392.00], // C
          [220.00, 277.18, 329.63], // A
        ];
        tempo = 230;
      }

      let step = 0;
      bgmInterval = setInterval(() => {
        if (!audioCtx || isMuted) return;
        const now = audioCtx.currentTime;
        const chord = chords[Math.floor(step / 3) % chords.length];
        const freq = chord[step % 3];
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = theme === 'battle' ? 'sawtooth' : 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + (tempo / 1000) * 1.5);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start(now);
        osc.stop(now + (tempo / 1000) * 1.5);
        step++;
      }, tempo);
    }

    // Game State
    let currentMapId = project.initialMapId;
    let playerX = project.initialPlayerX;
    let playerY = project.initialPlayerY;
    let playerDirection = 'down'; // 'up', 'down', 'left', 'right'
    let isMoving = false;
    let currentDialogueTree = null;
    let currentDialogueNode = null;
    let inBattle = false;
    let currentBattleMob = null;
    let battleTurn = 0; // 0 = player 1, 1 = player 2, etc.

    const canvas = document.getElementById('game-canvas');
    const ctx = canvas.getContext('2d');
    const TILE_SIZE = 32;

    function resizeCanvas() {
      const map = project.maps[currentMapId];
      if (!map) return;
      canvas.width = map.width * TILE_SIZE;
      canvas.height = map.height * TILE_SIZE;
    }

    // Tile Renderer in standalone
    function drawTile(ctx, id, x, y, size) {
      if (!id) return;
      switch(id) {
        case 1: // Meadow grass
          ctx.fillStyle = '#2f855a'; ctx.fillRect(x, y, size, size);
          ctx.fillStyle = '#38a169'; ctx.fillRect(x+2, y+2, size-4, size-4);
          ctx.fillStyle = '#68d391'; ctx.fillRect(x+6, y+6, 2, 4); ctx.fillRect(x+18, y+10, 2, 5);
          break;
        case 3: // Cobble
          ctx.fillStyle = '#4a5568'; ctx.fillRect(x, y, size, size);
          ctx.fillStyle = '#cbd5e0'; ctx.fillRect(x+2, y+2, 12, 10); ctx.fillRect(x+16, y+2, 14, 10);
          ctx.fillRect(x+2, y+14, 15, 15); ctx.fillRect(x+19, y+14, 11, 15);
          break;
        case 8: // Water
          ctx.fillStyle = '#0284c7'; ctx.fillRect(x, y, size, size);
          ctx.fillStyle = '#38bdf8'; ctx.fillRect(x+4, y+6, 12, 2); ctx.fillRect(x+16, y+18, 10, 2);
          break;
        case 5: // Sky flagstone
          ctx.fillStyle = '#94a3b8'; ctx.fillRect(x, y, size, size);
          ctx.fillStyle = '#f1f5f9'; ctx.fillRect(x+1, y+1, size-2, size-2);
          ctx.strokeStyle = '#f59e0b'; ctx.strokeRect(x+4, y+4, size-8, size-8);
          break;
        case 6: // Cavern floor
          ctx.fillStyle = '#1e1b4b'; ctx.fillRect(x, y, size, size);
          ctx.fillStyle = '#312e81'; ctx.fillRect(x+1, y+1, size-2, size-2);
          ctx.fillStyle = '#a855f7'; ctx.fillRect(x+8, y+6, 2, 2); ctx.fillRect(x+20, y+18, 2, 2);
          break;
        case 7: // Volcanic basalt
          ctx.fillStyle = '#09090b'; ctx.fillRect(x, y, size, size);
          ctx.fillStyle = '#27272a'; ctx.fillRect(x+2, y+2, size-4, size-4);
          ctx.fillStyle = '#ef4444'; ctx.fillRect(x+10, y+12, 6, 2);
          break;
        case 12: // Sakura top
          ctx.fillStyle = '#f472b6'; ctx.beginPath(); ctx.arc(x+size/2, y+size/2, size/2-2, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = '#fbcfe8'; ctx.beginPath(); ctx.arc(x+size/2-3, y+size/2-3, size/3, 0, Math.PI*2); ctx.fill();
          break;
        case 13: // Sakura trunk
          ctx.fillStyle = '#2f855a'; ctx.fillRect(x, y, size, size);
          ctx.fillStyle = '#5c2c16'; ctx.fillRect(x+10, y, 12, size);
          ctx.fillStyle = '#f472b6'; ctx.fillRect(x+4, y+22, 3, 2); ctx.fillRect(x+22, y+24, 3, 2);
          break;
        case 14: // Oak top
          ctx.fillStyle = '#166534'; ctx.beginPath(); ctx.arc(x+size/2, y+size/2, size/2-2, 0, Math.PI*2); ctx.fill();
          ctx.fillStyle = '#22c55e'; ctx.beginPath(); ctx.arc(x+size/2-3, y+size/2-3, size/3, 0, Math.PI*2); ctx.fill();
          break;
        case 15: // Oak trunk
          ctx.fillStyle = '#2f855a'; ctx.fillRect(x, y, size, size);
          ctx.fillStyle = '#713f12'; ctx.fillRect(x+10, y, 12, size);
          break;
        case 16: // Flowers
          ctx.fillStyle = '#38a169'; ctx.fillRect(x, y, size, size);
          ctx.fillStyle = '#f43f5e'; ctx.fillRect(x+6, y+8, 4, 4);
          ctx.fillStyle = '#38bdf8'; ctx.fillRect(x+20, y+16, 4, 4);
          break;
        case 17: case 18: // Crystals
          ctx.fillStyle = '#7dd3fc';
          ctx.beginPath();
          ctx.moveTo(x+size/2, y+2); ctx.lineTo(x+size-6, y+size/2); ctx.lineTo(x+size/2, y+size-4); ctx.lineTo(x+6, y+size/2);
          ctx.closePath(); ctx.fill();
          break;
        case 22: case 23: // Roofs
          ctx.fillStyle = id === 22 ? '#b91c1c' : '#2563eb';
          ctx.fillRect(x, y, size, size);
          ctx.fillStyle = id === 22 ? '#ef4444' : '#60a5fa';
          ctx.fillRect(x, y+4, size, 4);
          break;
        case 24: case 25: // Walls
          ctx.fillStyle = id === 24 ? '#f8fafc' : '#475569';
          ctx.fillRect(x, y, size, size);
          ctx.fillStyle = '#78350f'; ctx.strokeRect(x+1, y+1, size-2, size-2);
          break;
        case 26: // Door
          ctx.fillStyle = '#92400e'; ctx.fillRect(x+4, y+4, size-8, size-4);
          ctx.fillStyle = '#fbbf24'; ctx.fillRect(x+8, y+16, 3, 3);
          break;
        case 28: // Bridge
          ctx.fillStyle = '#b45309'; ctx.fillRect(x, y+2, size, size-4);
          break;
        case 30: // Pillar
          ctx.fillStyle = '#e2e8f0'; ctx.fillRect(x+8, y+4, size-16, size-8);
          break;
        case 32: case 33: // Chest
          ctx.fillStyle = '#78350f'; ctx.fillRect(x+4, y+10, size-8, size-14);
          ctx.fillStyle = '#fbbf24'; ctx.fillRect(x+4, y+10, size-8, 4);
          break;
        case 34: // Save crystal
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(x+size/2, y+size/2, 8, 0, Math.PI*2); ctx.fill();
          break;
        case 35: // Portal
          ctx.strokeStyle = '#c084fc'; ctx.lineWidth = 2;
          ctx.beginPath(); ctx.arc(x+size/2, y+size/2, 12, 0, Math.PI*2); ctx.stroke();
          break;
        case 36: // Torch
          ctx.fillStyle = '#f97316'; ctx.beginPath(); ctx.arc(x+size/2, y+12, 5, 0, Math.PI*2); ctx.fill();
          break;
        default:
          ctx.fillStyle = '#475569'; ctx.fillRect(x, y, size, size);
          break;
      }
    }

    // Draw Character / NPC Sprite
    function drawSprite(ctx, x, y, color, isHero = false, label = '') {
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.35)';
      ctx.beginPath(); ctx.ellipse(x+16, y+28, 9, 4, 0, 0, Math.PI*2); ctx.fill();
      // Body
      ctx.fillStyle = color;
      ctx.fillRect(x+8, y+12, 16, 14);
      // Head
      ctx.fillStyle = '#ffedd5';
      ctx.beginPath(); ctx.arc(x+16, y+10, 6, 0, Math.PI*2); ctx.fill();
      // Hair/Helm
      ctx.fillStyle = isHero ? '#38bdf8' : '#f59e0b';
      ctx.fillRect(x+11, y+4, 10, 5);
      // Sword / Stave if hero
      if (isHero) {
        ctx.fillStyle = '#cbd5e1'; ctx.fillRect(x+23, y+8, 2, 12);
        ctx.fillStyle = '#38bdf8'; ctx.fillRect(x+22, y+6, 4, 2);
      }
      if (label) {
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 9px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(label, x+16, y-2);
      }
    }

    // Main Game Render Loop
    let tick = 0;
    function render() {
      tick++;
      const map = project.maps[currentMapId];
      if (!map) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Layer 1: Ground
      for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
          const t = map.ground[y][x];
          drawTile(ctx, t, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE);
        }
      }

      // Layer 2: Decoration
      for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
          const t = map.decoration[y][x];
          if (t > 0) drawTile(ctx, t, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE);
        }
      }

      // Events / NPCs
      map.events.forEach(evt => {
        if (evt.type === 'npc') {
          const npc = project.npcs[evt.npcId];
          drawSprite(ctx, evt.x * TILE_SIZE, evt.y * TILE_SIZE, '#d97706', false, npc ? npc.name : evt.name);
        } else if (evt.type === 'chest') {
          drawTile(ctx, evt.chestOpened ? 33 : 32, evt.x * TILE_SIZE, evt.y * TILE_SIZE, TILE_SIZE);
        } else if (evt.type === 'save_crystal') {
          drawTile(ctx, 34, evt.x * TILE_SIZE, evt.y * TILE_SIZE, TILE_SIZE);
        } else if (evt.type === 'battle') {
          // Floating menacing aura
          ctx.fillStyle = 'rgba(239, 68, 68, 0.6)';
          ctx.beginPath();
          ctx.arc(evt.x * TILE_SIZE + 16, evt.y * TILE_SIZE + 16, 12, 0, Math.PI*2);
          ctx.fill();
          drawSprite(ctx, evt.x * TILE_SIZE, evt.y * TILE_SIZE, '#ef4444', false, evt.name);
        }
      });

      // Player Entity
      const leadChar = project.party[0];
      drawSprite(ctx, playerX * TILE_SIZE, playerY * TILE_SIZE, '#2563eb', true, leadChar ? leadChar.name : 'Hero');

      // Layer 3: Overhead (Roofs, treetops - renders ABOVE player!)
      for (let y = 0; y < map.height; y++) {
        for (let x = 0; x < map.width; x++) {
          const t = map.overhead[y][x];
          if (t > 0) drawTile(ctx, t, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE);
        }
      }

      requestAnimationFrame(render);
    }

    // Movement & Collision Check
    function tryMove(dx, dy) {
      if (currentDialogueTree || inBattle) return;
      const map = project.maps[currentMapId];
      if (!map) return;

      const nx = playerX + dx;
      const ny = playerY + dy;

      if (dx > 0) playerDirection = 'right';
      else if (dx < 0) playerDirection = 'left';
      else if (dy > 0) playerDirection = 'down';
      else if (dy < 0) playerDirection = 'up';

      // Bounds
      if (nx < 0 || nx >= map.width || ny < 0 || ny >= map.height) return;

      // Collision
      if (map.collision[ny][nx]) {
        playSfx('click');
        return;
      }

      // Solid NPCs or events
      const blockingEvt = map.events.find(e => e.x === nx && e.y === ny && (e.type === 'npc' || (e.type === 'chest' && !e.chestOpened) || e.type === 'save_crystal'));
      if (blockingEvt) {
        // Trigger interaction immediately on touch
        interact();
        return;
      }

      playerX = nx;
      playerY = ny;

      // Check step events (teleport, wild battle)
      const stepEvt = map.events.find(e => e.x === nx && e.y === ny);
      if (stepEvt) {
        if (stepEvt.type === 'teleport' && stepEvt.targetMapId) {
          playSfx('magic');
          currentMapId = stepEvt.targetMapId;
          playerX = stepEvt.targetX || 1;
          playerY = stepEvt.targetY || 1;
          resizeCanvas();
        } else if (stepEvt.type === 'battle' && stepEvt.monsterId) {
          startBattle(stepEvt.monsterId);
        }
      }
    }

    // Interaction Action (Space / Enter / Action A)
    function interact() {
      if (currentDialogueTree) {
        advanceDialogue();
        return;
      }
      if (inBattle) return;

      const map = project.maps[currentMapId];
      if (!map) return;

      // Check adjacent cell in front or current cell
      let tx = playerX;
      let ty = playerY;
      if (playerDirection === 'up') ty--;
      else if (playerDirection === 'down') ty++;
      else if (playerDirection === 'left') tx--;
      else if (playerDirection === 'right') tx++;

      const evt = map.events.find(e => (e.x === tx && e.y === ty) || (e.x === playerX && e.y === playerY));
      if (!evt) return;

      if (evt.type === 'npc' && evt.npcId) {
        const npc = project.npcs[evt.npcId];
        if (npc && npc.dialogueId && project.dialogues[npc.dialogueId]) {
          openDialogue(project.dialogues[npc.dialogueId]);
        }
      } else if (evt.type === 'chest' && !evt.chestOpened) {
        evt.chestOpened = true;
        playSfx('magic');
        let lootMsg = '';
        if (evt.chestItemId && project.items[evt.chestItemId]) {
          lootMsg += project.items[evt.chestItemId].name + '! ';
          const inv = project.inventory.find(i => i.itemId === evt.chestItemId);
          if (inv) inv.quantity++;
          else project.inventory.push({ itemId: evt.chestItemId, quantity: 1 });
        }
        if (evt.chestGold) {
          lootMsg += evt.chestGold + ' Gold!';
          project.gold += evt.chestGold;
          document.getElementById('hud-gold').innerText = '🪙 ' + project.gold + ' G';
        }
        openSimpleModal('Chest Opened!', 'You acquired: ' + lootMsg);
      } else if (evt.type === 'save_crystal') {
        playSfx('magic');
        // Heal party
        project.party.forEach(p => { p.hp = p.maxHp; p.mp = p.maxMp; });
        try {
          localStorage.setItem('aetheria_save_' + project.name, JSON.stringify({ currentMapId, playerX, playerY, gold: project.gold, inventory: project.inventory, party: project.party }));
        } catch(e) {}
        openSimpleModal('Aether Crystal', 'Party restored to full HP and MP! Game progress has been saved.');
      } else if (evt.type === 'battle' && evt.monsterId) {
        startBattle(evt.monsterId);
      }
    }

    // Dialogue Engine
    function openDialogue(tree) {
      currentDialogueTree = tree;
      currentDialogueNode = tree.nodes[tree.initialNodeId];
      renderDialogueNode();
      document.getElementById('dialogue-modal').style.display = 'block';
      playSfx('click');
    }

    function renderDialogueNode() {
      if (!currentDialogueNode) {
        closeDialogue();
        return;
      }
      document.getElementById('dlg-speaker').innerText = currentDialogueNode.speakerName;
      document.getElementById('dlg-body').innerText = currentDialogueNode.text;
      const avatarEl = document.getElementById('dlg-avatar');
      if (currentDialogueNode.avatarUrl) {
        avatarEl.src = currentDialogueNode.avatarUrl;
        avatarEl.style.display = 'block';
      } else {
        avatarEl.style.display = 'none';
      }

      const choicesBox = document.getElementById('dlg-choices');
      choicesBox.innerHTML = '';

      if (currentDialogueNode.choices && currentDialogueNode.choices.length > 0) {
        currentDialogueNode.choices.forEach(ch => {
          const btn = document.createElement('button');
          btn.className = 'choice-btn';
          btn.innerText = '➤ ' + ch.text;
          btn.onclick = () => {
            playSfx('click');
            if (ch.actionTrigger === 'open_shop') {
              closeDialogue();
              openRpgMenu();
            } else if (ch.actionTrigger === 'heal_party') {
              project.party.forEach(p => { p.hp = p.maxHp; p.mp = p.maxMp; });
              closeDialogue();
              openSimpleModal('Radiant Fountain', 'Your party has been fully healed and refreshed!');
            } else if (ch.nextNodeId && currentDialogueTree.nodes[ch.nextNodeId]) {
              currentDialogueNode = currentDialogueTree.nodes[ch.nextNodeId];
              renderDialogueNode();
            } else {
              closeDialogue();
            }
          };
          choicesBox.appendChild(btn);
        });
      }
    }

    function advanceDialogue() {
      if (!currentDialogueNode) return;
      if (currentDialogueNode.choices && currentDialogueNode.choices.length > 0) return;

      if (currentDialogueNode.actionTrigger === 'give_quest' && currentDialogueNode.questId) {
        const q = project.quests[currentDialogueNode.questId];
        if (q) q.status = 'active';
      }

      if (currentDialogueNode.nextNodeId && currentDialogueTree.nodes[currentDialogueNode.nextNodeId]) {
        currentDialogueNode = currentDialogueTree.nodes[currentDialogueNode.nextNodeId];
        renderDialogueNode();
      } else {
        closeDialogue();
      }
    }

    function closeDialogue() {
      document.getElementById('dialogue-modal').style.display = 'none';
      currentDialogueTree = null;
      currentDialogueNode = null;
    }

    function openSimpleModal(title, msg) {
      document.getElementById('dlg-speaker').innerText = title;
      document.getElementById('dlg-body').innerText = msg;
      document.getElementById('dlg-avatar').style.display = 'none';
      document.getElementById('dlg-choices').innerHTML = '<button class="choice-btn" onclick="document.getElementById(\\'dialogue-modal\\').style.display=\\'none\\'">Understood</button>';
      document.getElementById('dialogue-modal').style.display = 'block';
    }

    // Turn-Based Anime JRPG Battle Engine
    function startBattle(monsterId) {
      const mob = project.monsters[monsterId];
      if (!mob) return;

      inBattle = true;
      currentBattleMob = { ...mob, currentHp: mob.hp };
      playBgm('battle');
      playSfx('slash');

      document.getElementById('battle-modal').style.display = 'flex';
      document.getElementById('battle-mob-name').innerText = mob.name;
      document.getElementById('battle-mob-avatar').src = mob.avatarUrl || '';
      updateBattleUI();
    }

    function updateBattleUI() {
      if (!currentBattleMob) return;
      const mobHpPercent = Math.max(0, (currentBattleMob.currentHp / currentBattleMob.hp) * 100);
      document.getElementById('battle-mob-hp').style.width = mobHpPercent + '%';
      document.getElementById('battle-mob-hp-text').innerText = 'HP ' + Math.max(0, currentBattleMob.currentHp) + '/' + currentBattleMob.hp;

      // Party cards
      const partyBox = document.getElementById('battle-party-cards');
      partyBox.innerHTML = '';
      project.party.forEach((hero, idx) => {
        const card = document.createElement('div');
        card.className = 'party-card ' + (idx === battleTurn ? 'active-turn' : '');
        card.innerHTML = \`
          <img class="party-avatar" src="\${hero.avatarUrl || ''}" alt="\${hero.name}" />
          <div style="font-weight: bold; font-size: 13px; color: #f8fafc;">\${hero.name}</div>
          <div style="font-size: 11px; color: #38bdf8;">\${hero.className} Lv.\${hero.level}</div>
          <div class="bar-wrap"><div class="hp-fill" style="width: \${(hero.hp / hero.maxHp) * 100}%"></div></div>
          <div style="font-size: 11px; color: #94a3b8;">HP \${hero.hp}/\${hero.maxHp}</div>
          <div class="bar-wrap"><div class="mp-fill" style="width: \${(hero.mp / hero.maxMp) * 100}%"></div></div>
          <div style="font-size: 11px; color: #94a3b8;">MP \${hero.mp}/\${hero.maxMp}</div>
        \`;
        partyBox.appendChild(card);
      });
    }

    function executeHeroAttack() {
      if (!inBattle || !currentBattleMob) return;
      playSfx('slash');
      const activeHero = project.party[battleTurn];
      const damage = Math.max(10, activeHero.atk * 2 - currentBattleMob.def);
      currentBattleMob.currentHp -= damage;

      updateBattleUI();

      if (currentBattleMob.currentHp <= 0) {
        winBattle();
        return;
      }

      // Next party turn or monster turn
      battleTurn++;
      if (battleTurn >= project.party.length) {
        battleTurn = 0;
        setTimeout(monsterTurn, 600);
      } else {
        updateBattleUI();
      }
    }

    function executeHeroSkill() {
      if (!inBattle || !currentBattleMob) return;
      const activeHero = project.party[battleTurn];
      if (activeHero.mp < 15) {
        alert('Not enough MP!');
        return;
      }
      activeHero.mp -= 15;
      playSfx('magic');

      const damage = Math.max(25, activeHero.mag * 3 - currentBattleMob.def);
      currentBattleMob.currentHp -= damage;

      updateBattleUI();

      if (currentBattleMob.currentHp <= 0) {
        winBattle();
        return;
      }

      battleTurn++;
      if (battleTurn >= project.party.length) {
        battleTurn = 0;
        setTimeout(monsterTurn, 600);
      } else {
        updateBattleUI();
      }
    }

    function monsterTurn() {
      if (!inBattle || !currentBattleMob) return;
      playSfx('slash');
      const targetHero = project.party[Math.floor(Math.random() * project.party.length)];
      const damage = Math.max(8, currentBattleMob.atk - targetHero.def / 2);
      targetHero.hp = Math.max(0, targetHero.hp - Math.floor(damage));

      updateBattleUI();

      // Check party wipe
      const alive = project.party.some(h => h.hp > 0);
      if (!alive) {
        alert('Your party was defeated! Returning to sanctuary...');
        project.party.forEach(h => { h.hp = Math.floor(h.maxHp * 0.5); });
        endBattle();
      }
    }

    function winBattle() {
      playSfx('magic');
      project.gold += currentBattleMob.goldReward;
      document.getElementById('hud-gold').innerText = '🪙 ' + project.gold + ' G';

      // EXP gain
      project.party.forEach(h => {
        h.exp += currentBattleMob.expReward;
        if (h.exp >= h.maxExp) {
          h.level++;
          h.exp -= h.maxExp;
          h.maxExp = Math.floor(h.maxExp * 1.5);
          h.maxHp += 25; h.hp = h.maxHp;
          h.maxMp += 10; h.mp = h.maxMp;
          h.atk += 6; h.def += 4; h.mag += 5;
        }
      });

      alert('Victory! Acquired ' + currentBattleMob.expReward + ' EXP & ' + currentBattleMob.goldReward + ' Gold!');
      endBattle();
    }

    function endBattle() {
      inBattle = false;
      currentBattleMob = null;
      battleTurn = 0;
      document.getElementById('battle-modal').style.display = 'none';
      playBgm('town');
    }

    // RPG Menu
    function openRpgMenu() {
      const menu = document.getElementById('rpg-menu');
      menu.style.display = 'flex';
      playSfx('click');

      // Party
      const pBox = document.getElementById('menu-party-list');
      pBox.innerHTML = '<h3 style="color:#fbbf24; margin-bottom:8px;">Party Status</h3>';
      project.party.forEach(hero => {
        pBox.innerHTML += \`
          <div style="background:#1e293b; padding:10px; border-radius:8px; margin-bottom:8px;">
            <div style="font-weight:bold; color:#f8fafc;">\${hero.name} (Lv.\${hero.level} \${hero.className})</div>
            <div style="font-size:12px; color:#38bdf8;">HP \${hero.hp}/\${hero.maxHp} · MP \${hero.mp}/\${hero.maxMp}</div>
            <div style="font-size:11px; color:#94a3b8;">ATK \${hero.atk} · DEF \${hero.def} · MAG \${hero.mag} · SPD \${hero.spd}</div>
          </div>
        \`;
      });

      // Inventory
      const iBox = document.getElementById('menu-inventory-list');
      iBox.innerHTML = '<h3 style="color:#fbbf24; margin-bottom:8px;">Inventory</h3>';
      project.inventory.forEach(inv => {
        const itm = project.items[inv.itemId];
        if (itm) {
          iBox.innerHTML += \`
            <div style="background:#1e293b; padding:8px; border-radius:6px; margin-bottom:6px; display:flex; justify-content:space-between; align-items:center;">
              <div>
                <span style="font-size:16px; margin-right:6px;">\${itm.icon}</span>
                <span style="font-weight:600; font-size:13px;">\${itm.name}</span>
                <div style="font-size:11px; color:#94a3b8;">\${itm.description}</div>
              </div>
              <span style="font-weight:bold; color:#f59e0b; font-size:13px;">x\${inv.quantity}</span>
            </div>
          \`;
        }
      });

      // Quests
      const qBox = document.getElementById('menu-quest-list');
      qBox.innerHTML = '<h3 style="color:#fbbf24; margin-bottom:8px;">Active Quests</h3>';
      Object.values(project.quests).forEach(q => {
        qBox.innerHTML += \`
          <div style="background:#1e293b; padding:10px; border-radius:8px; margin-bottom:8px;">
            <div style="font-weight:bold; color:#fbbf24;">\${q.title}</div>
            <div style="font-size:12px; color:#cbd5e1; margin-bottom:6px;">\${q.summary}</div>
            <div style="font-size:11px; color:#38bdf8;">Objectives:</div>
            \${q.objectives.map(o => '<div style="font-size:11px; color:#94a3b8;">• ' + o.text + '</div>').join('')}
          </div>
        \`;
      });
    }

    // Event Listeners
    window.addEventListener('keydown', e => {
      initAudio();
      if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') tryMove(0, -1);
      else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') tryMove(0, 1);
      else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') tryMove(-1, 0);
      else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') tryMove(1, 0);
      else if (e.key === ' ' || e.key === 'Enter') interact();
      else if (e.key === 'Escape' || e.key === 'm' || e.key === 'M') {
        const m = document.getElementById('rpg-menu');
        if (m.style.display === 'flex') m.style.display = 'none';
        else openRpgMenu();
      }
    });

    // Touch controls
    document.getElementById('btn-dpad-up').onclick = () => tryMove(0, -1);
    document.getElementById('btn-dpad-down').onclick = () => tryMove(0, 1);
    document.getElementById('btn-dpad-left').onclick = () => tryMove(-1, 0);
    document.getElementById('btn-dpad-right').onclick = () => tryMove(1, 0);
    document.getElementById('btn-action-a').onclick = () => interact();
    document.getElementById('btn-action-b').onclick = () => openRpgMenu();

    // UI Buttons
    document.getElementById('btn-toggle-menu').onclick = () => openRpgMenu();
    document.getElementById('btn-close-menu').onclick = () => { document.getElementById('rpg-menu').style.display = 'none'; };
    document.getElementById('btn-toggle-audio').onclick = () => {
      isMuted = !isMuted;
      document.getElementById('btn-toggle-audio').innerText = isMuted ? '🔇 Muted' : '🔊 Audio';
      if (!isMuted) playBgm('town');
      else if (bgmInterval) clearInterval(bgmInterval);
    };

    document.getElementById('btn-battle-attack').onclick = () => executeHeroAttack();
    document.getElementById('btn-battle-skill').onclick = () => executeHeroSkill();
    document.getElementById('btn-battle-item').onclick = () => {
      const pot = project.inventory.find(i => i.itemId === 'item_potion' && i.quantity > 0);
      if (pot) {
        pot.quantity--;
        const h = project.party[battleTurn];
        h.hp = Math.min(h.maxHp, h.hp + 80);
        playSfx('magic');
        updateBattleUI();
      } else alert('No Potions remaining!');
    };
    document.getElementById('btn-battle-guard').onclick = () => {
      playSfx('click');
      battleTurn++;
      if (battleTurn >= project.party.length) { battleTurn = 0; setTimeout(monsterTurn, 600); }
      else updateBattleUI();
    };
    document.getElementById('btn-battle-flee').onclick = () => {
      playSfx('click');
      endBattle();
    };

    // Start
    window.addEventListener('load', () => {
      resizeCanvas();
      playBgm('town');
      requestAnimationFrame(render);
    });
  </script>
</body>
</html>`;
}
