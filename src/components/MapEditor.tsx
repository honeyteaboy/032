/**
 * Aetheria Anime JRPG Studio - Multi-Layer Map Editor
 * Allows designing multi-layered 2D JRPG maps with ground, decoration, overhead,
 * collisions, and event triggers, with full desktop & mobile touch support.
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Layers,
  Eye,
  EyeOff,
  Paintbrush,
  Square,
  PaintBucket,
  Eraser,
  Pipette,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid,
  Plus,
  Trash2,
  MapPin,
  ShieldAlert,
  ChevronDown,
  Sparkles,
  Move
} from 'lucide-react';
import { GameMap, MapEvent, MapLayerName, ProjectData } from '../types/game';
import { TILE_CATALOG, TILE_SIZE, TileDefinition } from '../utils/tileCatalog';
import { audioManager } from '../utils/audio';

type EditorTool = 'pencil' | 'rectangle' | 'bucket' | 'eraser' | 'picker' | 'collision' | 'event' | 'pan';

interface MapEditorProps {
  project: ProjectData;
  onUpdateProject: (updater: (prev: ProjectData) => ProjectData) => void;
  onSwitchToPlaytest: () => void;
}

export const MapEditor: React.FC<MapEditorProps> = ({
  project,
  onUpdateProject,
  onSwitchToPlaytest,
}) => {
  const [currentMapId, setCurrentMapId] = useState<string>(project.initialMapId || Object.keys(project.maps)[0]);
  const [activeLayer, setActiveLayer] = useState<MapLayerName>('ground');
  const [selectedTileId, setSelectedTileId] = useState<number>(1);
  const [currentTool, setCurrentTool] = useState<EditorTool>('pencil');
  const [brushSize, setBrushSize] = useState<number>(1);
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(1.25);
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [hoverCoords, setHoverCoords] = useState<{ x: number; y: number } | null>(null);

  // Layer visibility
  const [layerVisibility, setLayerVisibility] = useState({
    ground: true,
    decoration: true,
    overhead: true,
    collision: true,
    events: true,
  });

  // Mobile tileset drawer state
  const [isTileDrawerOpen, setIsTileDrawerOpen] = useState<boolean>(false);

  // New map modal
  const [showNewMapModal, setShowNewMapModal] = useState<boolean>(false);
  const [newMapName, setNewMapName] = useState<string>('Ancient Ruins');
  const [newMapTheme, setNewMapTheme] = useState<GameMap['theme']>('crystal_forest');
  const [newMapWidth, setNewMapWidth] = useState<number>(16);
  const [newMapHeight, setNewMapHeight] = useState<number>(12);

  // Event placer modal
  const [showEventModal, setShowEventModal] = useState<boolean>(false);
  const [pendingEventCoords, setPendingEventCoords] = useState<{ x: number; y: number } | null>(null);
  const [eventType, setEventType] = useState<MapEvent['type']>('npc');
  const [eventName, setEventName] = useState<string>('New NPC');
  const [eventNpcId, setEventNpcId] = useState<string>(Object.keys(project.npcs)[0] || '');
  const [eventTargetMap, setEventTargetMap] = useState<string>(Object.keys(project.maps)[0] || '');
  const [eventChestItem, setEventChestItem] = useState<string>(Object.keys(project.items)[0] || '');
  const [eventChestGold, setEventChestGold] = useState<number>(100);
  const [eventMonsterId, setEventMonsterId] = useState<string>(Object.keys(project.monsters)[0] || '');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isPaintingRef = useRef<boolean>(false);
  const rectStartRef = useRef<{ x: number; y: number } | null>(null);
  const [animTick, setAnimTick] = useState<number>(0);

  const activeMap: GameMap = project.maps[currentMapId] || Object.values(project.maps)[0];

  // Animation ticker for shimmering water, save crystals, torches
  useEffect(() => {
    const timer = setInterval(() => {
      setAnimTick(prev => (prev + 1) % 1000);
    }, 120);
    return () => clearInterval(timer);
  }, []);

  // Redraw Canvas
  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !activeMap) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Ground Layer
    if (layerVisibility.ground) {
      for (let y = 0; y < activeMap.height; y++) {
        for (let x = 0; x < activeMap.width; x++) {
          const tId = activeMap.ground[y]?.[x] || 0;
          const def = TILE_CATALOG[tId];
          if (def && tId > 0) {
            def.render(ctx, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, animTick);
          } else {
            // Checkerboard for empty
            ctx.fillStyle = (x + y) % 2 === 0 ? '#1e293b' : '#0f172a';
            ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
          }
        }
      }
    }

    // 2. Decoration Layer
    if (layerVisibility.decoration) {
      ctx.globalAlpha = activeLayer === 'decoration' || activeLayer === 'ground' ? 1.0 : 0.85;
      for (let y = 0; y < activeMap.height; y++) {
        for (let x = 0; x < activeMap.width; x++) {
          const tId = activeMap.decoration[y]?.[x] || 0;
          const def = TILE_CATALOG[tId];
          if (def && tId > 0) {
            def.render(ctx, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, animTick);
          }
        }
      }
      ctx.globalAlpha = 1.0;
    }

    // 3. Overhead Layer
    if (layerVisibility.overhead) {
      ctx.globalAlpha = activeLayer === 'overhead' ? 1.0 : 0.75;
      for (let y = 0; y < activeMap.height; y++) {
        for (let x = 0; x < activeMap.width; x++) {
          const tId = activeMap.overhead[y]?.[x] || 0;
          const def = TILE_CATALOG[tId];
          if (def && tId > 0) {
            def.render(ctx, x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, animTick);
          }
        }
      }
      ctx.globalAlpha = 1.0;
    }

    // 4. Events Layer
    if (layerVisibility.events && activeMap.events) {
      activeMap.events.forEach(evt => {
        const ex = evt.x * TILE_SIZE;
        const ey = evt.y * TILE_SIZE;

        if (evt.type === 'npc') {
          // NPC Badge
          ctx.fillStyle = 'rgba(245, 158, 11, 0.4)';
          ctx.fillRect(ex, ey, TILE_SIZE, TILE_SIZE);
          ctx.strokeStyle = '#f59e0b';
          ctx.lineWidth = 2;
          ctx.strokeRect(ex + 1, ey + 1, TILE_SIZE - 2, TILE_SIZE - 2);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 10px sans-serif';
          ctx.fillText('NPC', ex + 6, ey + 20);
        } else if (evt.type === 'teleport') {
          ctx.fillStyle = 'rgba(192, 132, 252, 0.4)';
          ctx.fillRect(ex, ey, TILE_SIZE, TILE_SIZE);
          ctx.strokeStyle = '#c084fc';
          ctx.lineWidth = 2;
          ctx.strokeRect(ex + 1, ey + 1, TILE_SIZE - 2, TILE_SIZE - 2);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px sans-serif';
          ctx.fillText('WARP', ex + 4, ey + 20);
        } else if (evt.type === 'chest') {
          ctx.fillStyle = 'rgba(234, 179, 8, 0.4)';
          ctx.fillRect(ex, ey, TILE_SIZE, TILE_SIZE);
          ctx.strokeStyle = '#eab308';
          ctx.lineWidth = 2;
          ctx.strokeRect(ex + 1, ey + 1, TILE_SIZE - 2, TILE_SIZE - 2);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px sans-serif';
          ctx.fillText('CHEST', ex + 2, ey + 20);
        } else if (evt.type === 'battle') {
          ctx.fillStyle = 'rgba(239, 68, 68, 0.4)';
          ctx.fillRect(ex, ey, TILE_SIZE, TILE_SIZE);
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = 2;
          ctx.strokeRect(ex + 1, ey + 1, TILE_SIZE - 2, TILE_SIZE - 2);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px sans-serif';
          ctx.fillText('MOB', ex + 6, ey + 20);
        } else if (evt.type === 'save_crystal') {
          ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.fillRect(ex, ey, TILE_SIZE, TILE_SIZE);
          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.strokeRect(ex + 1, ey + 1, TILE_SIZE - 2, TILE_SIZE - 2);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 9px sans-serif';
          ctx.fillText('SAVE', ex + 4, ey + 20);
        }
      });
    }

    // 5. Collision Overlay
    if (layerVisibility.collision && activeMap.collision) {
      for (let y = 0; y < activeMap.height; y++) {
        for (let x = 0; x < activeMap.width; x++) {
          if (activeMap.collision[y]?.[x]) {
            ctx.fillStyle = 'rgba(239, 68, 68, 0.35)';
            ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.7)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x * TILE_SIZE, y * TILE_SIZE);
            ctx.lineTo((x + 1) * TILE_SIZE, (y + 1) * TILE_SIZE);
            ctx.moveTo((x + 1) * TILE_SIZE, y * TILE_SIZE);
            ctx.lineTo(x * TILE_SIZE, (y + 1) * TILE_SIZE);
            ctx.stroke();
          }
        }
      }
    }

    // 6. Grid Lines
    if (showGrid) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 1;
      for (let x = 0; x <= activeMap.width; x++) {
        ctx.beginPath();
        ctx.moveTo(x * TILE_SIZE + 0.5, 0);
        ctx.lineTo(x * TILE_SIZE + 0.5, activeMap.height * TILE_SIZE);
        ctx.stroke();
      }
      for (let y = 0; y <= activeMap.height; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * TILE_SIZE + 0.5);
        ctx.lineTo(activeMap.width * TILE_SIZE, y * TILE_SIZE + 0.5);
        ctx.stroke();
      }
    }

    // 7. Hover Cursor Indicator
    if (hoverCoords) {
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 2;
      ctx.strokeRect(
        hoverCoords.x * TILE_SIZE + 1,
        hoverCoords.y * TILE_SIZE + 1,
        TILE_SIZE * brushSize - 2,
        TILE_SIZE * brushSize - 2
      );
    }
  }, [activeMap, layerVisibility, activeLayer, showGrid, hoverCoords, brushSize, animTick]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  // Apply Paint to Cell
  const applyTile = (x: number, y: number, tileId: number) => {
    if (!activeMap) return;
    onUpdateProject(prev => {
      const targetMap = prev.maps[currentMapId];
      if (!targetMap) return prev;

      const newMap = { ...targetMap };
      const currentLayerData = newMap[activeLayer].map(row => [...row]);

      for (let dy = 0; dy < brushSize; dy++) {
        for (let dx = 0; dx < brushSize; dx++) {
          const px = x + dx;
          const py = y + dy;
          if (px >= 0 && px < newMap.width && py >= 0 && py < newMap.height) {
            currentLayerData[py][px] = tileId;
          }
        }
      }
      newMap[activeLayer] = currentLayerData;

      // Automatically update collision if placing solid structure/water
      const tileDef = TILE_CATALOG[tileId];
      if (tileDef && activeLayer !== 'overhead') {
        const newColl = newMap.collision.map(row => [...row]);
        for (let dy = 0; dy < brushSize; dy++) {
          for (let dx = 0; dx < brushSize; dx++) {
            const px = x + dx;
            const py = y + dy;
            if (px >= 0 && px < newMap.width && py >= 0 && py < newMap.height) {
              newColl[py][px] = tileDef.isSolid;
            }
          }
        }
        newMap.collision = newColl;
      }

      return {
        ...prev,
        maps: {
          ...prev.maps,
          [currentMapId]: newMap,
        },
      };
    });
  };

  // Toggle Collision
  const toggleCollision = (x: number, y: number) => {
    if (!activeMap) return;
    onUpdateProject(prev => {
      const targetMap = prev.maps[currentMapId];
      if (!targetMap) return prev;
      const newColl = targetMap.collision.map(row => [...row]);
      if (newColl[y] && newColl[y][x] !== undefined) {
        newColl[y][x] = !newColl[y][x];
      }
      return {
        ...prev,
        maps: {
          ...prev.maps,
          [currentMapId]: {
            ...targetMap,
            collision: newColl,
          },
        },
      };
    });
  };

  // Flood fill / bucket
  const floodFill = (startX: number, startY: number, fillTileId: number) => {
    if (!activeMap) return;
    const layerData = activeMap[activeLayer];
    const targetTileId = layerData[startY]?.[startX];
    if (targetTileId === undefined || targetTileId === fillTileId) return;

    const newLayer = layerData.map(r => [...r]);
    const queue: [number, number][] = [[startX, startY]];
    const visited = new Set<string>();

    while (queue.length > 0) {
      const [cx, cy] = queue.pop()!;
      const key = `${cx},${cy}`;
      if (visited.has(key)) continue;
      visited.add(key);

      if (cx < 0 || cx >= activeMap.width || cy < 0 || cy >= activeMap.height) continue;
      if (newLayer[cy][cx] !== targetTileId) continue;

      newLayer[cy][cx] = fillTileId;

      queue.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
    }

    onUpdateProject(prev => ({
      ...prev,
      maps: {
        ...prev.maps,
        [currentMapId]: {
          ...prev.maps[currentMapId],
          [activeLayer]: newLayer,
        },
      },
    }));
  };

  // Canvas Mouse & Touch Handlers
  const getCellCoords = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.floor(((clientX - rect.left) * scaleX) / TILE_SIZE);
    const y = Math.floor(((clientY - rect.top) * scaleY) / TILE_SIZE);
    if (x >= 0 && x < activeMap.width && y >= 0 && y < activeMap.height) {
      return { x, y };
    }
    return null;
  };

  const handlePointerDown = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const coords = getCellCoords(e);
    if (!coords) return;
    isPaintingRef.current = true;

    if (currentTool === 'pencil') {
      applyTile(coords.x, coords.y, selectedTileId);
      audioManager.playSfx('click');
    } else if (currentTool === 'eraser') {
      applyTile(coords.x, coords.y, 0);
      audioManager.playSfx('click');
    } else if (currentTool === 'collision') {
      toggleCollision(coords.x, coords.y);
      audioManager.playSfx('click');
    } else if (currentTool === 'bucket') {
      floodFill(coords.x, coords.y, selectedTileId);
      audioManager.playSfx('magic');
    } else if (currentTool === 'picker') {
      const picked = activeMap[activeLayer]?.[coords.y]?.[coords.x] || 0;
      if (picked > 0) setSelectedTileId(picked);
      setCurrentTool('pencil');
      audioManager.playSfx('select');
    } else if (currentTool === 'event') {
      setPendingEventCoords(coords);
      setShowEventModal(true);
      audioManager.playSfx('select');
    } else if (currentTool === 'rectangle') {
      rectStartRef.current = coords;
    }
  };

  const handlePointerMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const coords = getCellCoords(e);
    setHoverCoords(coords);

    if (!isPaintingRef.current || !coords) return;

    if (currentTool === 'pencil') {
      applyTile(coords.x, coords.y, selectedTileId);
    } else if (currentTool === 'eraser') {
      applyTile(coords.x, coords.y, 0);
    } else if (currentTool === 'collision') {
      // Don't auto-repeat toggle in move to avoid rapid flickering
    }
  };

  const handlePointerUp = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (currentTool === 'rectangle' && rectStartRef.current) {
      const endCoords = getCellCoords(e) || hoverCoords;
      if (endCoords) {
        const x1 = Math.min(rectStartRef.current.x, endCoords.x);
        const x2 = Math.max(rectStartRef.current.x, endCoords.x);
        const y1 = Math.min(rectStartRef.current.y, endCoords.y);
        const y2 = Math.max(rectStartRef.current.y, endCoords.y);

        onUpdateProject(prev => {
          const map = prev.maps[currentMapId];
          const newLayer = map[activeLayer].map(r => [...r]);
          for (let y = y1; y <= y2; y++) {
            for (let x = x1; x <= x2; x++) {
              newLayer[y][x] = selectedTileId;
            }
          }
          return {
            ...prev,
            maps: {
              ...prev.maps,
              [currentMapId]: { ...map, [activeLayer]: newLayer },
            },
          };
        });
        audioManager.playSfx('click');
      }
      rectStartRef.current = null;
    }
    isPaintingRef.current = false;
  };

  // Create New Map
  const handleCreateNewMap = () => {
    if (!newMapName.trim()) return;
    const newId = `map_${Date.now()}`;
    const w = Math.max(8, Math.min(40, newMapWidth));
    const h = Math.max(8, Math.min(40, newMapHeight));

    const groundLayer: number[][] = [];
    const decoLayer: number[][] = [];
    const overLayer: number[][] = [];
    const collLayer: boolean[][] = [];

    const defaultGroundId = newMapTheme === 'crystal_forest' ? 6 : newMapTheme === 'sky_sanctuary' ? 5 : newMapTheme === 'dragon_ruins' ? 7 : 1;

    for (let y = 0; y < h; y++) {
      const gRow: number[] = [];
      const dRow: number[] = [];
      const oRow: number[] = [];
      const cRow: boolean[] = [];
      for (let x = 0; x < w; x++) {
        gRow.push(defaultGroundId);
        dRow.push(0);
        oRow.push(0);
        cRow.push(false);
      }
      groundLayer.push(gRow);
      decoLayer.push(dRow);
      overLayer.push(oRow);
      collLayer.push(cRow);
    }

    const createdMap: GameMap = {
      id: newId,
      name: newMapName,
      theme: newMapTheme,
      width: w,
      height: h,
      ground: groundLayer,
      decoration: decoLayer,
      overhead: overLayer,
      collision: collLayer,
      events: [],
    };

    onUpdateProject(prev => ({
      ...prev,
      maps: {
        ...prev.maps,
        [newId]: createdMap,
      },
    }));

    setCurrentMapId(newId);
    setShowNewMapModal(false);
    audioManager.playSfx('magic');
  };

  // Add Event to Map
  const handleAddEvent = () => {
    if (!pendingEventCoords || !activeMap) return;
    const newEvent: MapEvent = {
      id: `evt_${Date.now()}`,
      x: pendingEventCoords.x,
      y: pendingEventCoords.y,
      type: eventType,
      name: eventName,
      npcId: eventType === 'npc' ? eventNpcId : undefined,
      targetMapId: eventType === 'teleport' ? eventTargetMap : undefined,
      targetX: eventType === 'teleport' ? 2 : undefined,
      targetY: eventType === 'teleport' ? 2 : undefined,
      chestItemId: eventType === 'chest' ? eventChestItem : undefined,
      chestGold: eventType === 'chest' ? eventChestGold : undefined,
      chestOpened: false,
      monsterId: eventType === 'battle' ? eventMonsterId : undefined,
    };

    onUpdateProject(prev => ({
      ...prev,
      maps: {
        ...prev.maps,
        [currentMapId]: {
          ...prev.maps[currentMapId],
          events: [...prev.maps[currentMapId].events, newEvent],
        },
      },
    }));

    setShowEventModal(false);
    setPendingEventCoords(null);
    audioManager.playSfx('select');
  };

  // Filter tiles
  const filteredTiles = Object.values(TILE_CATALOG).filter(t => {
    if (t.id === 0) return true;
    if (categoryFilter === 'All') return true;
    return t.category === categoryFilter;
  });

  return (
    <div className="flex flex-col h-[calc(100vh-61px)] bg-slate-950 overflow-hidden select-none">
      {/* Top Workspace Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2 border-b border-slate-800 bg-slate-900/70 text-xs">
        {/* Map Selector & Actions */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 font-medium whitespace-nowrap">Map:</span>
          <select
            value={currentMapId}
            onChange={e => {
              setCurrentMapId(e.target.value);
              audioManager.playSfx('click');
            }}
            className="bg-slate-950 border border-slate-700 text-amber-300 font-medium rounded px-2.5 py-1 text-xs focus:outline-none focus:border-amber-400"
          >
            {Object.values(project.maps).map(m => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.width}x{m.height})
              </option>
            ))}
          </select>

          <button
            onClick={() => {
              audioManager.playSfx('click');
              setShowNewMapModal(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">New Map</span>
          </button>
        </div>

        {/* Multi-Layer Selector Tabs */}
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
          {(['ground', 'decoration', 'overhead'] as MapLayerName[]).map(layer => (
            <button
              key={layer}
              onClick={() => {
                setActiveLayer(layer);
                audioManager.playSfx('click');
              }}
              className={`px-3 py-1 rounded-md text-xs font-semibold capitalize transition-all ${
                activeLayer === layer
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {layer}
            </button>
          ))}
        </div>

        {/* Tools Palette & Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => { setCurrentTool('pencil'); audioManager.playSfx('click'); }}
            title="Pencil Brush"
            className={`p-1.5 rounded transition-colors ${currentTool === 'pencil' ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <Paintbrush className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setCurrentTool('rectangle'); audioManager.playSfx('click'); }}
            title="Rectangle Fill"
            className={`p-1.5 rounded transition-colors ${currentTool === 'rectangle' ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <Square className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setCurrentTool('bucket'); audioManager.playSfx('click'); }}
            title="Flood Bucket Fill"
            className={`p-1.5 rounded transition-colors ${currentTool === 'bucket' ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <PaintBucket className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setCurrentTool('eraser'); audioManager.playSfx('click'); }}
            title="Eraser (Clear cell)"
            className={`p-1.5 rounded transition-colors ${currentTool === 'eraser' ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <Eraser className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setCurrentTool('collision'); audioManager.playSfx('click'); }}
            title="Collision Passability Brush"
            className={`p-1.5 rounded transition-colors ${currentTool === 'collision' ? 'bg-rose-500 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <ShieldAlert className="w-4 h-4" />
          </button>
          <button
            onClick={() => { setCurrentTool('event'); audioManager.playSfx('click'); }}
            title="Place Event / NPC / Chest"
            className={`p-1.5 rounded transition-colors ${currentTool === 'event' ? 'bg-indigo-500 text-white' : 'text-slate-300 hover:bg-slate-800'}`}
          >
            <MapPin className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />

          {/* Brush size */}
          <div className="hidden sm:flex items-center gap-1">
            {[1, 2, 3].map(sz => (
              <button
                key={sz}
                onClick={() => setBrushSize(sz)}
                className={`w-5 h-5 rounded text-[11px] font-bold ${brushSize === sz ? 'bg-slate-700 text-amber-400' : 'text-slate-400 hover:bg-slate-800'}`}
              >
                {sz}x
              </button>
            ))}
          </div>

          <div className="h-4 w-px bg-slate-700 mx-1" />

          {/* Zoom controls */}
          <button
            onClick={() => setZoom(z => Math.max(0.6, z - 0.2))}
            title="Zoom Out"
            className="p-1.5 rounded text-slate-300 hover:bg-slate-800"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono text-slate-400 w-8 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={() => setZoom(z => Math.min(2.5, z + 0.2))}
            title="Zoom In"
            className="p-1.5 rounded text-slate-300 hover:bg-slate-800"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowGrid(g => !g)}
            title="Toggle Grid Lines"
            className={`p-1.5 rounded ${showGrid ? 'text-amber-400 bg-slate-800' : 'text-slate-400 hover:bg-slate-800'}`}
          >
            <Grid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Studio Workspace Split: Left Canvas, Right Tile Palette */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Central Map Canvas Area */}
        <div className="flex-1 overflow-auto bg-slate-950 flex items-center justify-center p-6 relative">
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
              transition: 'transform 0.1s ease-out',
            }}
            className="shadow-2xl rounded border border-slate-800 bg-slate-900"
          >
            <canvas
              ref={canvasRef}
              width={activeMap ? activeMap.width * TILE_SIZE : 320}
              height={activeMap ? activeMap.height * TILE_SIZE : 320}
              onMouseDown={handlePointerDown}
              onMouseMove={handlePointerMove}
              onMouseUp={handlePointerUp}
              onTouchStart={handlePointerDown}
              onTouchMove={handlePointerMove}
              onTouchEnd={handlePointerUp}
              className="cursor-crosshair block"
            />
          </div>

          {/* Quick Floating Layer Inspector / Visibilities */}
          <div className="absolute top-4 left-4 bg-slate-900/90 border border-slate-800 rounded-lg p-2.5 backdrop-blur-md flex flex-col gap-1.5 shadow-lg text-xs">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">Layer Visibility</span>
            {(['ground', 'decoration', 'overhead', 'collision', 'events'] as const).map(lKey => (
              <div key={lKey} className="flex items-center justify-between gap-3">
                <span className="capitalize text-slate-300 text-[11px]">{lKey}</span>
                <button
                  onClick={() => setLayerVisibility(prev => ({ ...prev, [lKey]: !prev[lKey] }))}
                  className="text-slate-400 hover:text-amber-400"
                >
                  {layerVisibility[lKey] ? <Eye className="w-3.5 h-3.5 text-amber-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-600" />}
                </button>
              </div>
            ))}
          </div>

          {/* Bottom Coordinate Indicator */}
          <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-slate-800 rounded px-2.5 py-1 text-[11px] font-mono text-slate-400">
            {hoverCoords ? `X: ${hoverCoords.x} · Y: ${hoverCoords.y} | Tool: ${currentTool}` : 'Move cursor over map'}
          </div>

          {/* Mobile Floating Tile Drawer Toggle */}
          <button
            onClick={() => setIsTileDrawerOpen(true)}
            className="md:hidden absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-2 bg-amber-400 text-slate-950 rounded-full font-bold text-xs shadow-lg"
          >
            <Layers className="w-4 h-4" />
            <span>Tiles</span>
          </button>
        </div>

        {/* Right Tileset Palette (Desktop) */}
        <div className="hidden md:flex flex-col w-72 border-l border-slate-800 bg-slate-900/60 overflow-hidden">
          <div className="p-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-cinzel font-bold text-xs text-amber-300">Anime Tile Catalog</span>
            </div>
            <div className="text-[11px] text-slate-400 font-mono">
              Tile #{selectedTileId}
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-1 p-2 border-b border-slate-800 bg-slate-950/40 text-[11px]">
            {['All', 'Terrain', 'Nature', 'Structures', 'Interior', 'Magic'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  categoryFilter === cat ? 'bg-amber-400/20 text-amber-300 font-semibold border border-amber-500/40' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Tiles Grid */}
          <div className="flex-1 overflow-y-auto p-3 grid grid-cols-4 gap-2">
            {filteredTiles.map(t => {
              const isSelected = selectedTileId === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => {
                    setSelectedTileId(t.id);
                    if (currentTool === 'eraser') setCurrentTool('pencil');
                    audioManager.playSfx('click');
                  }}
                  title={`${t.name} (${t.category})`}
                  className={`relative p-1 rounded border flex flex-col items-center justify-center transition-all ${
                    isSelected
                      ? 'border-amber-400 bg-amber-400/10 shadow-sm shadow-amber-400/30 ring-1 ring-amber-400'
                      : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                  }`}
                >
                  <div
                    style={{ width: 36, height: 36, backgroundColor: t.color }}
                    className="rounded overflow-hidden flex items-center justify-center"
                  >
                    {t.id === 0 ? (
                      <span className="text-[10px] text-slate-500 font-bold">CLR</span>
                    ) : (
                      <span className="text-[9px] text-white/70 font-mono">#{t.id}</span>
                    )}
                  </div>
                  <span className="text-[9px] text-slate-400 truncate w-full text-center mt-1">
                    {t.name}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Current Selection Details */}
          {TILE_CATALOG[selectedTileId] && (
            <div className="p-3 border-t border-slate-800 bg-slate-950/80 text-xs">
              <div className="font-semibold text-slate-200">{TILE_CATALOG[selectedTileId].name}</div>
              <div className="text-[11px] text-slate-400 flex items-center justify-between mt-1">
                <span>Category: {TILE_CATALOG[selectedTileId].category}</span>
                <span className={TILE_CATALOG[selectedTileId].isSolid ? 'text-rose-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                  {TILE_CATALOG[selectedTileId].isSolid ? 'Solid Block' : 'Passable'}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Mobile Slide-Up Tileset Drawer */}
        {isTileDrawerOpen && (
          <div className="md:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col justify-end">
            <div className="bg-slate-900 border-t border-amber-500/40 rounded-t-2xl max-h-[70vh] flex flex-col p-4 animate-in slide-in-from-bottom duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="font-cinzel text-amber-300 font-bold text-sm">Select Tile</span>
                <button
                  onClick={() => setIsTileDrawerOpen(false)}
                  className="px-3 py-1 bg-slate-800 text-slate-300 rounded text-xs"
                >
                  Close
                </button>
              </div>
              <div className="flex-1 overflow-y-auto grid grid-cols-4 gap-2 py-4">
                {filteredTiles.map(t => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTileId(t.id);
                      setIsTileDrawerOpen(false);
                      audioManager.playSfx('click');
                    }}
                    className={`p-2 rounded border flex flex-col items-center ${selectedTileId === t.id ? 'border-amber-400 bg-amber-400/20' : 'border-slate-800 bg-slate-950'}`}
                  >
                    <div style={{ width: 40, height: 40, backgroundColor: t.color }} className="rounded" />
                    <span className="text-[10px] text-slate-300 truncate w-full text-center mt-1">{t.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Map Modal */}
      {showNewMapModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-cinzel text-lg font-bold text-amber-400 mb-4">Create New Map Zone</h3>
            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Map Name</label>
                <input
                  type="text"
                  value={newMapName}
                  onChange={e => setNewMapName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Theme Aesthetic</label>
                <select
                  value={newMapTheme}
                  onChange={e => setNewMapTheme(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                >
                  <option value="village">Lumina Floating Village (Meadows & Houses)</option>
                  <option value="crystal_forest">Crystal Hollow Caverns (Amethyst & Torches)</option>
                  <option value="sky_sanctuary">Celestial Sky Sanctuary (Flagstones & Marble)</option>
                  <option value="dragon_ruins">Dragon Citadel (Basalt & Magma)</option>
                  <option value="interior">Grand Manor / Tavern Interior</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Width (Tiles)</label>
                  <input
                    type="number"
                    min={8}
                    max={40}
                    value={newMapWidth}
                    onChange={e => setNewMapWidth(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Height (Tiles)</label>
                  <input
                    type="number"
                    min={8}
                    max={40}
                    value={newMapHeight}
                    onChange={e => setNewMapHeight(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowNewMapModal(false)}
                className="px-4 py-2 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewMap}
                className="px-4 py-2 rounded bg-amber-400 text-slate-950 hover:bg-amber-300 text-xs font-bold shadow-md shadow-amber-400/20"
              >
                Create Map
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Place Event Modal */}
      {showEventModal && pendingEventCoords && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h3 className="font-cinzel text-lg font-bold text-amber-400 mb-2">Place Map Event</h3>
            <p className="text-xs text-slate-400 mb-4">
              Coordinates: X={pendingEventCoords.x}, Y={pendingEventCoords.y}
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Event Type</label>
                <select
                  value={eventType}
                  onChange={e => setEventType(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                >
                  <option value="npc">Interactive NPC</option>
                  <option value="teleport">Portal / Map Teleport</option>
                  <option value="chest">Treasure Chest</option>
                  <option value="battle">Monster / Boss Battle</option>
                  <option value="save_crystal">Aether Save & Heal Crystal</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Event Name</label>
                <input
                  type="text"
                  value={eventName}
                  onChange={e => setEventName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                />
              </div>

              {eventType === 'npc' && (
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Select NPC</label>
                  <select
                    value={eventNpcId}
                    onChange={e => setEventNpcId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                  >
                    {Object.values(project.npcs).map(n => (
                      <option key={n.id} value={n.id}>
                        {n.name} ({n.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {eventType === 'teleport' && (
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Target Map</label>
                  <select
                    value={eventTargetMap}
                    onChange={e => setEventTargetMap(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                  >
                    {Object.values(project.maps).map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {eventType === 'chest' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Loot Item</label>
                    <select
                      value={eventChestItem}
                      onChange={e => setEventChestItem(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                    >
                      {Object.values(project.items).map(i => (
                        <option key={i.id} value={i.id}>
                          {i.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Gold Reward</label>
                    <input
                      type="number"
                      value={eventChestGold}
                      onChange={e => setEventChestGold(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                    />
                  </div>
                </div>
              )}

              {eventType === 'battle' && (
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Encounter Monster</label>
                  <select
                    value={eventMonsterId}
                    onChange={e => setEventMonsterId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-slate-100"
                  >
                    {Object.values(project.monsters).map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} (Lv.{m.hp > 500 ? 15 : 5})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => {
                  setShowEventModal(false);
                  setPendingEventCoords(null);
                }}
                className="px-4 py-2 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleAddEvent}
                className="px-4 py-2 rounded bg-amber-400 text-slate-950 hover:bg-amber-300 text-xs font-bold"
              >
                Place Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
