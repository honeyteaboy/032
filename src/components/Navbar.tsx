/**
 * Aetheria Anime JRPG Studio - Main Header & Navigation
 * Adheres strictly to the 3-zone Top Bar Contract from the Frontend Design constitution.
 */

import React from 'react';
import { Volume2, VolumeX, Play, Download, Sparkles } from 'lucide-react';
import { audioManager } from '../utils/audio';

export type StudioTab = 'map' | 'database' | 'dialogue' | 'playtest' | 'export';

interface NavbarProps {
  activeTab: StudioTab;
  onTabChange: (tab: StudioTab) => void;
  onOpenExport: () => void;
  onQuickPlay: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenExport,
  onQuickPlay,
  isMuted,
  onToggleMute,
}) => {
  return (
    <header className="flex items-center justify-between gap-8 px-6 py-3 border-b border-slate-800 bg-slate-950/90 backdrop-blur-md sticky top-0 z-40 select-none">
      {/* Zone 1: Single text element wordmark in display face */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-amber-500/20">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <span className="font-cinzel text-lg font-bold tracking-wider bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 bg-clip-text text-transparent whitespace-nowrap">
          AETHERIA STUDIO
        </span>
      </div>

      {/* Zone 2: 4-5 concise single-line text navigation links */}
      <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
        <button
          onClick={() => {
            audioManager.playSfx('click');
            onTabChange('map');
          }}
          className={`transition-colors whitespace-nowrap py-1 relative ${
            activeTab === 'map'
              ? 'text-amber-400 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-amber-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Map Editor
        </button>
        <button
          onClick={() => {
            audioManager.playSfx('click');
            onTabChange('database');
          }}
          className={`transition-colors whitespace-nowrap py-1 relative ${
            activeTab === 'database'
              ? 'text-amber-400 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-amber-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Database & Lore
        </button>
        <button
          onClick={() => {
            audioManager.playSfx('click');
            onTabChange('dialogue');
          }}
          className={`transition-colors whitespace-nowrap py-1 relative ${
            activeTab === 'dialogue'
              ? 'text-amber-400 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-amber-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Quests & Dialogues
        </button>
        <button
          onClick={() => {
            audioManager.playSfx('click');
            onTabChange('playtest');
          }}
          className={`transition-colors whitespace-nowrap py-1 relative ${
            activeTab === 'playtest'
              ? 'text-amber-400 font-semibold after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-amber-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Live Playtest
        </button>
        <button
          onClick={() => {
            audioManager.playSfx('click');
            onOpenExport();
          }}
          className="text-slate-400 hover:text-slate-200 transition-colors whitespace-nowrap py-1"
        >
          Export & Backup
        </button>
      </nav>

      {/* Zone 3: 1 primary action & audio toggle */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onToggleMute}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400 hover:border-amber-500/50 transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
        </button>

        <button
          onClick={() => {
            audioManager.playSfx('select');
            onQuickPlay();
          }}
          className="hidden sm:flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-950 bg-amber-400 hover:bg-amber-300 rounded-lg shadow-sm shadow-amber-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Playtest Game</span>
        </button>

        <button
          onClick={() => {
            audioManager.playSfx('click');
            onOpenExport();
          }}
          className="flex sm:hidden items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-400 border border-amber-500/40 rounded-lg bg-slate-900"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>
      </div>
    </header>
  );
};
