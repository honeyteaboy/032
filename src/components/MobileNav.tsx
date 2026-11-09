/**
 * Aetheria Anime JRPG Studio - Mobile Bottom Navigation Bar
 * Designed specifically for smartphones and small tablets with touch-friendly targets.
 */

import React from 'react';
import { Map, Database, MessageSquare, Play, Download } from 'lucide-react';
import { StudioTab } from './Navbar';
import { audioManager } from '../utils/audio';

interface MobileNavProps {
  activeTab: StudioTab;
  onTabChange: (tab: StudioTab) => void;
  onOpenExport: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  activeTab,
  onTabChange,
  onOpenExport,
}) => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 border-t border-slate-800 backdrop-blur-lg px-2 py-1.5 flex items-center justify-around select-none">
      <button
        onClick={() => {
          audioManager.playSfx('click');
          onTabChange('map');
        }}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors ${
          activeTab === 'map' ? 'text-amber-400 bg-amber-400/10' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Map className="w-5 h-5" />
        <span className="text-[10px] font-medium mt-0.5 whitespace-nowrap">Map</span>
      </button>

      <button
        onClick={() => {
          audioManager.playSfx('click');
          onTabChange('database');
        }}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors ${
          activeTab === 'database' ? 'text-amber-400 bg-amber-400/10' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Database className="w-5 h-5" />
        <span className="text-[10px] font-medium mt-0.5 whitespace-nowrap">Data</span>
      </button>

      <button
        onClick={() => {
          audioManager.playSfx('click');
          onTabChange('dialogue');
        }}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors ${
          activeTab === 'dialogue' ? 'text-amber-400 bg-amber-400/10' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <MessageSquare className="w-5 h-5" />
        <span className="text-[10px] font-medium mt-0.5 whitespace-nowrap">Quests</span>
      </button>

      <button
        onClick={() => {
          audioManager.playSfx('select');
          onTabChange('playtest');
        }}
        className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors ${
          activeTab === 'playtest' ? 'text-amber-400 bg-amber-400/10' : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Play className="w-5 h-5 fill-current" />
        <span className="text-[10px] font-medium mt-0.5 whitespace-nowrap">Play</span>
      </button>

      <button
        onClick={() => {
          audioManager.playSfx('click');
          onOpenExport();
        }}
        className="flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-slate-400 hover:text-slate-200 transition-colors"
      >
        <Download className="w-5 h-5" />
        <span className="text-[10px] font-medium mt-0.5 whitespace-nowrap">Export</span>
      </button>
    </div>
  );
};
