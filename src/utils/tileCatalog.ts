/**
 * Aetheria Anime JRPG Studio - Tile Catalog & Procedural Canvas Renderer
 * Provides 40+ rich anime JRPG tiles, props, structures, and nature elements.
 */

export interface TileDefinition {
  id: number;
  name: string;
  category: 'Terrain' | 'Nature' | 'Structures' | 'Interior' | 'Magic';
  defaultLayer: 'ground' | 'decoration' | 'overhead';
  isSolid: boolean; // default collision
  color: string;
  render: (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, tick?: number) => void;
}

export const TILE_SIZE = 32;

export const TILE_CATALOG: Record<number, TileDefinition> = {
  0: {
    id: 0,
    name: 'Empty (Clear)',
    category: 'Terrain',
    defaultLayer: 'ground',
    isSolid: false,
    color: 'transparent',
    render: () => {},
  },
  1: {
    id: 1,
    name: 'Meadow Grass',
    category: 'Terrain',
    defaultLayer: 'ground',
    isSolid: false,
    color: '#38a169',
    render: (ctx, x, y, s) => {
      ctx.fillStyle = '#2f855a';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#38a169';
      ctx.fillRect(x + 2, y + 2, s - 4, s - 4);
      // Grass blade highlights
      ctx.fillStyle = '#68d391';
      ctx.fillRect(x + 6, y + 6, 2, 4);
      ctx.fillRect(x + 18, y + 10, 2, 5);
      ctx.fillRect(x + 24, y + 20, 2, 4);
      ctx.fillRect(x + 10, y + 22, 2, 3);
    },
  },
  2: {
    id: 2,
    name: 'Forest Moss Grass',
    category: 'Terrain',
    defaultLayer: 'ground',
    isSolid: false,
    color: '#1b4332',
    render: (ctx, x, y, s) => {
      ctx.fillStyle = '#1b4332';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#2d6a4f';
      ctx.fillRect(x + 2, y + 2, s - 4, s - 4);
      ctx.fillStyle = '#40916c';
      ctx.fillRect(x + 4, y + 8, 3, 3);
      ctx.fillRect(x + 20, y + 14, 4, 3);
    },
  },
  3: {
    id: 3,
    name: 'Cobblestone Road',
    category: 'Terrain',
    defaultLayer: 'ground',
    isSolid: false,
    color: '#718096',
    render: (ctx, x, y, s) => {
      ctx.fillStyle = '#4a5568';
      ctx.fillRect(x, y, s, s);
      // Stones
      const stones = [
        [x + 2, y + 2, 12, 10, '#a0aec0'],
        [x + 16, y + 2, 14, 10, '#cbd5e0'],
        [x + 2, y + 14, 15, 15, '#cbd5e0'],
        [x + 19, y + 14, 11, 15, '#a0aec0'],
      ];
      stones.forEach(([sx, sy, sw, sh, col]) => {
        ctx.fillStyle = col as string;
        ctx.fillRect(sx as number, sy as number, sw as number, sh as number);
        ctx.fillStyle = '#2d3748';
        ctx.strokeRect((sx as number) + 0.5, (sy as number) + 0.5, (sw as number) - 1, (sh as number) - 1);
      });
    },
  },
  4: {
    id: 4,
    name: 'Dirt Trail',
    category: 'Terrain',
    defaultLayer: 'ground',
    isSolid: false,
    color: '#b7791f',
    render: (ctx, x, y, s) => {
      ctx.fillStyle = '#975a16';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#d69e2e';
      ctx.fillRect(x + 1, y + 1, s - 2, s - 2);
      ctx.fillStyle = '#ecc94b';
      ctx.fillRect(x + 5, y + 8, 3, 2);
      ctx.fillRect(x + 18, y + 16, 4, 2);
      ctx.fillRect(x + 9, y + 22, 2, 2);
    },
  },
  5: {
    id: 5,
    name: 'Celestial Sky Flagstone',
    category: 'Terrain',
    defaultLayer: 'ground',
    isSolid: false,
    color: '#e2e8f0',
    render: (ctx, x, y, s) => {
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#f1f5f9';
      ctx.fillRect(x + 1, y + 1, s - 2, s - 2);
      // Gold inlay rune
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 4, y + 4, s - 8, s - 8);
      ctx.fillStyle = '#67e8f9';
      ctx.fillRect(x + s / 2 - 2, y + s / 2 - 2, 4, 4);
    },
  },
  6: {
    id: 6,
    name: 'Crystal Cavern Floor',
    category: 'Terrain',
    defaultLayer: 'ground',
    isSolid: false,
    color: '#312e81',
    render: (ctx, x, y, s) => {
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#312e81';
      ctx.fillRect(x + 1, y + 1, s - 2, s - 2);
      // Purple crystal dust
      ctx.fillStyle = '#a855f7';
      ctx.fillRect(x + 8, y + 6, 2, 2);
      ctx.fillRect(x + 22, y + 14, 2, 2);
      ctx.fillRect(x + 14, y + 24, 2, 2);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(x + 4, y + 18, 2, 2);
    },
  },
  7: {
    id: 7,
    name: 'Volcanic Basalt Stone',
    category: 'Terrain',
    defaultLayer: 'ground',
    isSolid: false,
    color: '#18181b',
    render: (ctx, x, y, s) => {
      ctx.fillStyle = '#09090b';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#27272a';
      ctx.fillRect(x + 2, y + 2, s - 4, s - 4);
      // Magma cracks
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + 4, y + 10);
      ctx.lineTo(x + 14, y + 16);
      ctx.lineTo(x + 24, y + 12);
      ctx.lineTo(x + 28, y + 22);
      ctx.stroke();
      ctx.fillStyle = '#f97316';
      ctx.fillRect(x + 14, y + 15, 2, 2);
    },
  },
  8: {
    id: 8,
    name: 'Shimmering Water',
    category: 'Terrain',
    defaultLayer: 'ground',
    isSolid: true,
    color: '#0284c7',
    render: (ctx, x, y, s, tick = 0) => {
      ctx.fillStyle = '#0369a1';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#38bdf8';
      // Animated water ripple based on tick
      const offset = (Math.sin(tick * 0.05 + x * 0.1) * 3);
      ctx.fillRect(x + 4, y + 6 + offset, 10, 2);
      ctx.fillRect(x + 18, y + 18 - offset, 9, 2);
      ctx.fillStyle = '#bae6fd';
      ctx.fillRect(x + 6, y + 7 + offset, 4, 1);
      ctx.fillRect(x + 20, y + 19 - offset, 4, 1);
    },
  },
  9: {
    id: 9,
    name: 'Deep Aether Abyss',
    category: 'Terrain',
    defaultLayer: 'ground',
    isSolid: true,
    color: '#0f172a',
    render: (ctx, x, y, s) => {
      ctx.fillStyle = '#020617';
      ctx.fillRect(x, y, s, s);
      // Star particles in void
      ctx.fillStyle = '#818cf8';
      ctx.fillRect(x + 12, y + 8, 2, 2);
      ctx.fillStyle = '#c084fc';
      ctx.fillRect(x + 24, y + 20, 2, 2);
    },
  },
  10: {
    id: 10,
    name: 'Wood Floor Planks',
    category: 'Interior',
    defaultLayer: 'ground',
    isSolid: false,
    color: '#78350f',
    render: (ctx, x, y, s) => {
      ctx.fillStyle = '#451a03';
      ctx.fillRect(x, y, s, s);
      // 4 horizontal wooden planks
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = i % 2 === 0 ? '#92400e' : '#b45309';
        ctx.fillRect(x + 1, y + i * 8 + 1, s - 2, 6);
        ctx.fillStyle = '#78350f';
        ctx.fillRect(x + 6 + (i * 7) % 18, y + i * 8 + 3, 2, 2);
      }
    },
  },
  11: {
    id: 11,
    name: 'Royal Velvet Carpet',
    category: 'Interior',
    defaultLayer: 'ground',
    isSolid: false,
    color: '#991b1b',
    render: (ctx, x, y, s) => {
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(x + 2, y + 2, s - 4, s - 4);
      // Gold floral center
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(x + s / 2 - 2, y + s / 2 - 2, 4, 4);
    },
  },
  12: {
    id: 12,
    name: 'Sakura Canopy (Top)',
    category: 'Nature',
    defaultLayer: 'overhead',
    isSolid: false,
    color: '#f472b6',
    render: (ctx, x, y, s) => {
      ctx.fillStyle = '#f472b6';
      ctx.beginPath();
      ctx.arc(x + s / 2, y + s / 2, s / 2 - 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fbcfe8';
      ctx.beginPath();
      ctx.arc(x + s / 2 - 3, y + s / 2 - 4, s / 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff1f2';
      ctx.fillRect(x + 10, y + 8, 3, 3);
      ctx.fillRect(x + 18, y + 14, 3, 3);
    },
  },
  13: {
    id: 13,
    name: 'Sakura Tree Trunk',
    category: 'Nature',
    defaultLayer: 'decoration',
    isSolid: true,
    color: '#5b21b6',
    render: (ctx, x, y, s) => {
      // Base grass
      ctx.fillStyle = '#2f855a';
      ctx.fillRect(x, y, s, s);
      // Trunk
      ctx.fillStyle = '#5c2c16';
      ctx.fillRect(x + 10, y, 12, s);
      ctx.fillStyle = '#3c1808';
      ctx.fillRect(x + 8, y + s - 6, 16, 6);
      // Fallen pink petals
      ctx.fillStyle = '#f472b6';
      ctx.fillRect(x + 4, y + 22, 3, 2);
      ctx.fillRect(x + 24, y + 24, 3, 2);
      ctx.fillRect(x + 14, y + 26, 2, 2);
    },
  },
  14: {
    id: 14,
    name: 'Emerald Oak Canopy (Top)',
    category: 'Nature',
    defaultLayer: 'overhead',
    isSolid: false,
    color: '#15803d',
    render: (ctx, x, y, s) => {
      ctx.fillStyle = '#166534';
      ctx.beginPath();
      ctx.arc(x + s / 2, y + s / 2, s / 2 - 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(x + s / 2 - 4, y + s / 2 - 4, s / 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#86efac';
      ctx.fillRect(x + 12, y + 10, 4, 3);
    },
  },
  15: {
    id: 15,
    name: 'Emerald Tree Trunk',
    category: 'Nature',
    defaultLayer: 'decoration',
    isSolid: true,
    color: '#713f12',
    render: (ctx, x, y, s) => {
      ctx.fillStyle = '#2f855a';
      ctx.fillRect(x, y, s, s);
      ctx.fillStyle = '#713f12';
      ctx.fillRect(x + 11, y, 10, s);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(x + 8, y + s - 6, 16, 6);
    },
  },
  16: {
    id: 16,
    name: 'Anime Flower Field',
    category: 'Nature',
    defaultLayer: 'decoration',
    isSolid: false,
    color: '#fb7185',
    render: (ctx, x, y, s) => {
      // Grass background
      ctx.fillStyle = '#38a169';
      ctx.fillRect(x, y, s, s);
      // Flowers: pink, blue, yellow
      const flowers = [
        [x + 6, y + 8, '#f43f5e'],
        [x + 22, y + 7, '#38bdf8'],
        [x + 14, y + 18, '#fbbf24'],
        [x + 24, y + 22, '#c084fc'],
      ];
      flowers.forEach(([fx, fy, col]) => {
        ctx.fillStyle = col as string;
        ctx.fillRect(fx as number, fy as number, 4, 4);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect((fx as number) + 1, (fy as number) + 1, 2, 2);
      });
    },
  },
  17: {
    id: 17,
    name: 'Floating Lumina Crystal',
    category: 'Magic',
    defaultLayer: 'decoration',
    isSolid: true,
    color: '#38bdf8',
    render: (ctx, x, y, s, tick = 0) => {
      const floatY = Math.sin(tick * 0.08) * 3;
      // Shadow
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(x + s / 2, y + s - 6, 8, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      // Crystal diamond
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.moveTo(x + s / 2, y + 4 + floatY);
      ctx.lineTo(x + s - 6, y + s / 2 + floatY);
      ctx.lineTo(x + s / 2, y + s - 8 + floatY);
      ctx.lineTo(x + 6, y + s / 2 + floatY);
      ctx.closePath();
      ctx.fill();
      // Light facet
      ctx.fillStyle = '#7dd3fc';
      ctx.beginPath();
      ctx.moveTo(x + s / 2, y + 4 + floatY);
      ctx.lineTo(x + s / 2, y + s - 8 + floatY);
      ctx.lineTo(x + 6, y + s / 2 + floatY);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + s / 2 - 2, y + s / 2 - 4 + floatY, 3, 3);
    },
  },
  18: {
    id: 18,
    name: 'Amethyst Crystal Spire',
    category: 'Magic',
    defaultLayer: 'decoration',
    isSolid: true,
    color: '#c084fc',
    render: (ctx, x, y, s) => {
      ctx.fillStyle = '#581c87';
      ctx.beginPath();
      ctx.moveTo(x + s / 2, y + 2);
      ctx.lineTo(x + s - 8, y + s - 4);
      ctx.lineTo(x + 8, y + s - 4);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.moveTo(x + s / 2, y + 2);
      ctx.lineTo(x + s / 2, y + s - 4);
      ctx.lineTo(x + 8, y + s - 4);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#f3e8ff';
      ctx.fillRect(x + s / 2 - 2, y + 10, 2, 4);
    },
  },
  19: {
    id: 19,
    name: 'Ancient Mossy Boulder',
    category: 'Nature',
    defaultLayer: 'decoration',
    isSolid: true,
    color: '#64748b',
    render: (ctx, x, y, s) => {
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(x + s / 2, y + s / 2, s / 2 - 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(x + s / 2 - 3, y + s / 2 - 3, s / 3, 0, Math.PI * 2);
      ctx.fill();
      // Moss
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(x + 8, y + 8, 6, 4);
      ctx.fillRect(x + 18, y + 12, 5, 3);
    },
  },
  20: {
    id: 20,
    name: 'Garden Hedge Bush',
    category: 'Nature',
    defaultLayer: 'decoration',
    isSolid: true,
    color: '#16a34a',
    render: (ctx, x, y, s) => {
      ctx.fillStyle = '#14532d';
      ctx.beginPath();
      ctx.arc(x + s / 2, y + s / 2, s / 2 - 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.arc(x + s / 2 - 2, y + s / 2 - 3, s / 2 - 5, 0, Math.PI * 2);
      ctx.fill();
    },
  },
  21: {
    id: 21,
    name: 'Lotus Water Lily',
    category: 'Nature',
    defaultLayer: 'decoration',
    isSolid: false,
    color: '#f43f5e',
    render: (ctx, x, y, s) => {
      // Water background
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(x, y, s, s);
      // Lily pad
      ctx.fillStyle = '#15803d';
      ctx.beginPath();
      ctx.arc(x + s / 2, y + s / 2, s / 2 - 6, 0, Math.PI * 2);
      ctx.fill();
      // Lotus flower
      ctx.fillStyle = '#fb7185';
      ctx.fillRect(x + s / 2 - 3, y + s / 2 - 3, 6, 6);
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(x + s / 2 - 1, y + s / 2 - 1, 2, 2);
    },
  },
  22: {
    id: 22,
    name: 'Crimson Shingle Roof',
    category: 'Structures',
    defaultLayer: 'overhead',
    isSolid: false,
    color: '#991b1b',
    render: (ctx, x, y, s) => {
      ctx.fillStyle = '#7f1d1d';
      ctx.fillRect(x, y, s, s);
      // Roof shingle rows
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = '#b91c1c';
        ctx.fillRect(x, y + i * 8, s, 6);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(x, y + i * 8, s, 2);
      }
    },
  },
  23: {
    id: 23,
    name: 'Sapphire Castle Roof',
    category: 'Structures',
    defaultLayer: 'overhead',
    isSolid: false,
    color: '#1e3a8a',
    render: (ctx, x, y, s) => {
      ctx.fillStyle = '#172554';
      ctx.fillRect(x, y, s, s);
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = '#2563eb';
        ctx.fillRect(x, y + i * 8, s, 6);
        ctx.fillStyle = '#60a5fa';
        ctx.fillRect(x, y + i * 8, s, 2);
      }
    },
  },
  24: {
    id: 24,
    name: 'White Stucco Wall',
    category: 'Structures',
    defaultLayer: 'decoration',
    isSolid: true,
    color: '#f8fafc',
    render: (ctx, x, y, s) => {
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(x, y, s, s);
      // Wood timber beam frame
      ctx.fillStyle = '#78350f';
      ctx.fillRect(x, y, 4, s);
      ctx.fillRect(x + s - 4, y, 4, s);
      ctx.fillRect(x, y, s, 4);
      ctx.fillRect(x, y + s - 4, s, 4);
    },
  },
  25: {
    id: 25,
    name: 'Fortress Stone Wall',
    category: 'Structures',
    defaultLayer: 'decoration',
    isSolid: true,
    color: '#475569',
    render: (ctx, x, y, s) => {
      ctx.fillStyle = '#334155';
      ctx.fillRect(x, y, s, s);
      // Brick mortar
      ctx.fillStyle = '#64748b';
      ctx.fillRect(x + 2, y + 2, 12, 6);
      ctx.fillRect(x + 16, y + 2, 14, 6);
      ctx.fillRect(x + 2, y + 10, 28, 6);
      ctx.fillRect(x + 2, y + 18, 14, 6);
      ctx.fillRect(x + 18, y + 18, 12, 6);
      ctx.fillRect(x + 2, y + 26, 28, 4);
    },
  },
  26: {
    id: 26,
    name: 'Arch Wooden Door',
    category: 'Structures',
    defaultLayer: 'decoration',
    isSolid: false,
    color: '#b45309',
    render: (ctx, x, y, s) => {
      ctx.fillStyle = '#451a03';
      ctx.fillRect(x, y, s, s);
      // Wooden door
      ctx.fillStyle = '#92400e';
      ctx.fillRect(x + 4, y + 4, s - 8, s - 4);
      // Gold knob
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(x + 8, y + 16, 3, 3);
      // Iron bands
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + 4, y + 8, s - 8, 2);
      ctx.fillRect(x + 4, y + 24, s - 8, 2);
    },
  },
  27: {
    id: 27,
    name: 'Stained Glass Window',
    category: 'Structures',
    defaultLayer: 'decoration',
    isSolid: true,
    color: '#38bdf8',
    render: (ctx, x, y, s) => {
      ctx.fillStyle = '#475569';
      ctx.fillRect(x, y, s, s);
      // Glass
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(x + 6, y + 4, s - 12, s - 8);
      // Colorful glass panels
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(x + 8, y + 6, 6, 10);
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(x + 16, y + 6, 6, 10);
      ctx.fillStyle = '#c084fc';
      ctx.fillRect(x + 8, y + 18, 14, 4);
    },
  },
  28: {
    id: 28,
    name: 'Wood Bridge (Horizontal)',
    category: 'Structures',
    defaultLayer: 'ground',
    isSolid: false,
    color: '#92400e',
    render: (ctx, x, y, s) => {
      // Water underneath
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(x, y, s, s);
      // Planks
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = '#b45309';
        ctx.fillRect(x + i * 8, y + 2, 6, s - 4);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(x + i * 8, y + 2, 1, s - 4);
      }
      // Rails
      ctx.fillStyle = '#78350f';
      ctx.fillRect(x, y, s, 3);
      ctx.fillRect(x, y + s - 3, s, 3);
    },
  },
  29: {
    id: 29,
    name: 'Wood Bridge (Vertical)',
    category: 'Structures',
    defaultLayer: 'ground',
    isSolid: false,
    color: '#92400e',
    render: (ctx, x, y, s) => {
      ctx.fillStyle = '#0284c7';
      ctx.fillRect(x, y, s, s);
      for (let i = 0; i < 4; i++) {
        ctx.fillStyle = '#b45309';
        ctx.fillRect(x + 2, y + i * 8, s - 4, 6);
        ctx.fillStyle = '#451a03';
        ctx.fillRect(x + 2, y + i * 8, s - 4, 1);
      }
      ctx.fillStyle = '#78350f';
      ctx.fillRect(x, y, 3, s);
      ctx.fillRect(x + s - 3, y, 3, s);
    },
  },
  30: {
    id: 30,
    name: 'Greek Marble Pillar',
    category: 'Structures',
    defaultLayer: 'decoration',
    isSolid: true,
    color: '#e2e8f0',
    render: (ctx, x, y, s) => {
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(x + 8, y + 4, s - 16, s - 8);
      // Capital & base
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(x + 6, y + 2, s - 12, 4);
      ctx.fillRect(x + 6, y + s - 6, s - 12, 4);
      // Fluting
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(x + 12, y + 8, 2, s - 16);
      ctx.fillRect(x + 18, y + 8, 2, s - 16);
    },
  },
  31: {
    id: 31,
    name: 'Picket Fence',
    category: 'Structures',
    defaultLayer: 'decoration',
    isSolid: true,
    color: '#d97706',
    render: (ctx, x, y, s) => {
      // Grass background
      ctx.fillStyle = '#38a169';
      ctx.fillRect(x, y, s, s);
      // Horizontal beam
      ctx.fillStyle = '#b45309';
      ctx.fillRect(x, y + 14, s, 4);
      // Vertical pickets
      for (let i = 0; i < 3; i++) {
        ctx.fillStyle = '#fef3c7';
        ctx.fillRect(x + 4 + i * 10, y + 6, 6, 20);
        ctx.fillStyle = '#d97706';
        ctx.strokeRect(x + 4 + i * 10, y + 6, 6, 20);
      }
    },
  },
  32: {
    id: 32,
    name: 'Treasure Chest (Closed)',
    category: 'Magic',
    defaultLayer: 'decoration',
    isSolid: true,
    color: '#eab308',
    render: (ctx, x, y, s) => {
      // Wood box
      ctx.fillStyle = '#78350f';
      ctx.fillRect(x + 4, y + 10, s - 8, s - 14);
      // Gold trim
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(x + 4, y + 10, s - 8, 4);
      ctx.fillRect(x + 4, y + 22, s - 8, 3);
      ctx.fillRect(x + 4, y + 10, 3, s - 14);
      ctx.fillRect(x + s - 7, y + 10, 3, s - 14);
      // Keyhole
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(x + s / 2 - 2, y + 16, 4, 4);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(x + s / 2 - 1, y + 17, 2, 2);
    },
  },
  33: {
    id: 33,
    name: 'Treasure Chest (Opened)',
    category: 'Magic',
    defaultLayer: 'decoration',
    isSolid: true,
    color: '#92400e',
    render: (ctx, x, y, s) => {
      // Opened lid tilted back
      ctx.fillStyle = '#78350f';
      ctx.fillRect(x + 4, y + 2, s - 8, 8);
      // Box body
      ctx.fillStyle = '#451a03';
      ctx.fillRect(x + 4, y + 12, s - 8, s - 16);
      // Gold glitter inside
      ctx.fillStyle = '#fbbf24';
      ctx.fillRect(x + 8, y + 14, s - 16, 4);
      ctx.fillStyle = '#67e8f9';
      ctx.fillRect(x + 12, y + 14, 3, 3);
    },
  },
  34: {
    id: 34,
    name: 'Aether Save Crystal',
    category: 'Magic',
    defaultLayer: 'decoration',
    isSolid: true,
    color: '#38bdf8',
    render: (ctx, x, y, s, tick = 0) => {
      const floatY = Math.sin(tick * 0.1) * 3;
      // Halo ring
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x + s / 2, y + s / 2 + floatY, 12, 0, Math.PI * 2);
      ctx.stroke();
      // Crystal
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.moveTo(x + s / 2, y + 4 + floatY);
      ctx.lineTo(x + s - 6, y + s / 2 + floatY);
      ctx.lineTo(x + s / 2, y + s - 6 + floatY);
      ctx.lineTo(x + 6, y + s / 2 + floatY);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + s / 2 - 2, y + s / 2 - 4 + floatY, 4, 8);
    },
  },
  35: {
    id: 35,
    name: 'Runic Teleport Circle',
    category: 'Magic',
    defaultLayer: 'ground',
    isSolid: false,
    color: '#c084fc',
    render: (ctx, x, y, s, tick = 0) => {
      // Glow circle
      ctx.strokeStyle = '#c084fc';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x + s / 2, y + s / 2, s / 2 - 4, 0, Math.PI * 2);
      ctx.stroke();
      // Inner star
      ctx.strokeStyle = '#e9d5ff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x + s / 2, y + 6);
      ctx.lineTo(x + s - 8, y + s - 8);
      ctx.lineTo(x + 8, y + s - 8);
      ctx.closePath();
      ctx.stroke();
      // Rotating spark
      const sparkAngle = tick * 0.1;
      const sx = x + s / 2 + Math.cos(sparkAngle) * 8;
      const sy = y + s / 2 + Math.sin(sparkAngle) * 8;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(sx - 1, sy - 1, 3, 3);
    },
  },
  36: {
    id: 36,
    name: 'Dungeon Fire Torch',
    category: 'Interior',
    defaultLayer: 'decoration',
    isSolid: true,
    color: '#f97316',
    render: (ctx, x, y, s, tick = 0) => {
      // Sconce
      ctx.fillStyle = '#475569';
      ctx.fillRect(x + s / 2 - 2, y + 14, 4, 12);
      // Flame flicker
      const f = (tick % 4);
      ctx.fillStyle = '#f97316';
      ctx.beginPath();
      ctx.arc(x + s / 2, y + 10, 6 + (f % 2), 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.arc(x + s / 2, y + 10, 3, 0, Math.PI * 2);
      ctx.fill();
    },
  },
  37: {
    id: 37,
    name: 'Aether Emperor Throne',
    category: 'Interior',
    defaultLayer: 'decoration',
    isSolid: true,
    color: '#f59e0b',
    render: (ctx, x, y, s) => {
      // Gold backrest
      ctx.fillStyle = '#d97706';
      ctx.fillRect(x + 4, y + 2, s - 8, s - 10);
      // Red velvet seat
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(x + 6, y + 14, s - 12, 10);
      // Crown finial
      ctx.fillStyle = '#fef08a';
      ctx.fillRect(x + s / 2 - 3, y + 2, 6, 4);
    },
  },
  38: {
    id: 38,
    name: 'Alchemy Potions Rack',
    category: 'Interior',
    defaultLayer: 'decoration',
    isSolid: true,
    color: '#06b6d4',
    render: (ctx, x, y, s) => {
      // Wood shelf
      ctx.fillStyle = '#78350f';
      ctx.fillRect(x + 2, y + 4, s - 4, s - 8);
      ctx.fillStyle = '#451a03';
      ctx.fillRect(x + 4, y + 8, s - 8, 8);
      ctx.fillRect(x + 4, y + 18, s - 8, 8);
      // Glass bottles
      ctx.fillStyle = '#ef4444'; // Red HP potion
      ctx.fillRect(x + 6, y + 9, 4, 6);
      ctx.fillStyle = '#3b82f6'; // Blue MP potion
      ctx.fillRect(x + 14, y + 9, 4, 6);
      ctx.fillStyle = '#10b981'; // Green Elixir
      ctx.fillRect(x + 22, y + 9, 4, 6);
    },
  },
  39: {
    id: 39,
    name: 'Library Bookcase',
    category: 'Interior',
    defaultLayer: 'decoration',
    isSolid: true,
    color: '#a16207',
    render: (ctx, x, y, s) => {
      ctx.fillStyle = '#5c2b09';
      ctx.fillRect(x + 2, y + 2, s - 4, s - 4);
      // Bookshelf lines
      ctx.fillStyle = '#854d0e';
      ctx.fillRect(x + 4, y + 14, s - 8, 2);
      ctx.fillRect(x + 4, y + 26, s - 8, 2);
      // Books
      const bookColors = ['#dc2626', '#2563eb', '#16a34a', '#d97706', '#9333ea'];
      for (let i = 0; i < 5; i++) {
        ctx.fillStyle = bookColors[i];
        ctx.fillRect(x + 5 + i * 4, y + 4, 3, 9);
        ctx.fillStyle = bookColors[(i + 2) % 5];
        ctx.fillRect(x + 5 + i * 4, y + 16, 3, 9);
      }
    },
  },
  40: {
    id: 40,
    name: 'Campfire with Embers',
    category: 'Nature',
    defaultLayer: 'decoration',
    isSolid: true,
    color: '#f97316',
    render: (ctx, x, y, s, tick = 0) => {
      // Stone ring
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(x + s / 2, y + s / 2 + 4, 10, 0, Math.PI * 2);
      ctx.fill();
      // Charcoal
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.arc(x + s / 2, y + s / 2 + 4, 7, 0, Math.PI * 2);
      ctx.fill();
      // Animated fire
      const f = (tick % 3);
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(x + s / 2, y + s / 2 + 1, 5 + f, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(x + s / 2, y + s / 2 + 2, 2.5, 0, Math.PI * 2);
      ctx.fill();
    },
  },
};
