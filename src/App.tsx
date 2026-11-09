/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ProjectData } from './types/game';
import { DEFAULT_PROJECT_DATA } from './data/defaultProject';
import { Navbar, StudioTab } from './components/Navbar';
import { MobileNav } from './components/MobileNav';
import { MapEditor } from './components/MapEditor';
import { DatabaseStudio } from './components/DatabaseStudio';
import { QuestDialogueStudio } from './components/QuestDialogueStudio';
import { GamePlaytest } from './components/GamePlaytest';
import { ExportModal } from './components/ExportModal';
import { audioManager } from './utils/audio';

const STORAGE_KEY = 'aetheria_jrpg_studio_project_v2';

export default function App() {
  const [project, setProject] = useState<ProjectData>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.maps && parsed.party) return parsed;
      }
    } catch {
      // Fallback to default starter data
    }
    return DEFAULT_PROJECT_DATA;
  });

  const [activeTab, setActiveTab] = useState<StudioTab>('map');
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Autosave to localStorage on project modification
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
    } catch {
      // Quota exceeded
    }
  }, [project]);

  // Audio mute toggle
  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioManager.setMuted(nextMuted);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans pb-14 md:pb-0">
      {/* Top Bar Header */}
      <Navbar
        activeTab={activeTab}
        onTabChange={tab => setActiveTab(tab)}
        onOpenExport={() => setIsExportOpen(true)}
        onQuickPlay={() => setActiveTab('playtest')}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />

      {/* Main Studio Viewport */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'map' && (
          <MapEditor
            project={project}
            onUpdateProject={setProject}
            onSwitchToPlaytest={() => setActiveTab('playtest')}
          />
        )}

        {activeTab === 'database' && (
          <DatabaseStudio
            project={project}
            onUpdateProject={setProject}
          />
        )}

        {activeTab === 'dialogue' && (
          <QuestDialogueStudio
            project={project}
            onUpdateProject={setProject}
          />
        )}

        {activeTab === 'playtest' && (
          <GamePlaytest
            project={project}
            onUpdateProject={setProject}
            onExit={() => setActiveTab('map')}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <MobileNav
        activeTab={activeTab}
        onTabChange={tab => setActiveTab(tab)}
        onOpenExport={() => setIsExportOpen(true)}
      />

      {/* Export & Project Backup Modal */}
      <ExportModal
        project={project}
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        onUpdateProject={setProject}
      />
    </div>
  );
}
