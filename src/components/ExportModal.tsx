/**
 * Aetheria Anime JRPG Studio - Export, Backup & Deployment Modal
 * Handles 1-click Standalone Playable HTML generation, JSON project backup & restore, and deploy instructions.
 */

import React, { useRef, useState } from 'react';
import {
  Download,
  Upload,
  RotateCcw,
  FileCode,
  FileJson,
  CheckCircle,
  Sparkles,
  X,
  Server,
  ExternalLink
} from 'lucide-react';
import { ProjectData } from '../types/game';
import { generateStandaloneGameHtml } from '../utils/gameExporter';
import { DEFAULT_PROJECT_DATA } from '../data/defaultProject';
import { audioManager } from '../utils/audio';

interface ExportModalProps {
  project: ProjectData;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProject: (updater: (prev: ProjectData) => ProjectData) => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  project,
  isOpen,
  onClose,
  onUpdateProject,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);
  const [jsonSuccess, setJsonSuccess] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // 1. Download Standalone Playable HTML Game
  const handleExportHtml = () => {
    audioManager.playSfx('magic');
    const htmlContent = generateStandaloneGameHtml(project);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/\s+/g, '_')}_standalone.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 3000);
  };

  // 2. Download JSON Project File
  const handleExportJson = () => {
    audioManager.playSfx('select');
    const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.toLowerCase().replace(/\s+/g, '_')}.aetheria.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setJsonSuccess(true);
    setTimeout(() => setJsonSuccess(false), 3000);
  };

  // 3. Import JSON Project File
  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (parsed.maps && parsed.party) {
          onUpdateProject(() => parsed);
          audioManager.playSfx('levelup');
          alert('Project imported successfully!');
          onClose();
        } else {
          alert('Invalid project file format.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  // 4. Reset to Starter Template
  const handleResetTemplate = () => {
    if (window.confirm('Reset project back to default "The Legend of the Star Shard" template? Unsaved changes will be replaced.')) {
      onUpdateProject(() => DEFAULT_PROJECT_DATA);
      audioManager.playSfx('magic');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="bg-slate-900 border border-amber-500/50 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h2 className="font-cinzel text-xl font-bold text-amber-300">
              Export Game & Project Backup
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options Grid */}
        <div className="space-y-6 flex-1">
          {/* Option 1: Standalone HTML Export */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-amber-950/30 via-slate-900 to-slate-900 border border-amber-500/40 shadow-lg">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-amber-400 text-slate-950 font-bold">
                  <FileCode className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-cinzel text-base font-bold text-slate-100">
                    Standalone Playable HTML Game
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    100% self-contained single-file game. Anyone can open it in any desktop or mobile browser without any server or dependencies!
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
              <span className="text-[11px] text-amber-400/90 font-mono">
                Includes Multi-layer Canvas, Audio Synthesizer, Dialogue VN & Battles
              </span>
              <button
                onClick={handleExportHtml}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-md shadow-amber-400/20 transition-all hover:scale-105 active:scale-95"
              >
                {downloadSuccess ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-800" />
                    <span>Exported!</span>
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    <span>Download .HTML Game</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Option 2: Project JSON Backup & Restore */}
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                <FileJson className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-cinzel text-base font-bold text-slate-100">
                  Project Workspace Backup
                </h3>
                <p className="text-xs text-slate-400">
                  Save your complete project data (all maps, heroes, NPCs, quests, and lore) or import an existing save file.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={handleExportJson}
                className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs transition-colors"
              >
                <Download className="w-4 h-4 text-indigo-400" />
                <span>{jsonSuccess ? 'Saved JSON!' : 'Export Project JSON'}</span>
              </button>

              <label className="flex items-center gap-2 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-xs cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Import Project JSON</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.aetheria"
                  onChange={handleImportJson}
                  className="hidden"
                />
              </label>

              <button
                onClick={handleResetTemplate}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 font-medium text-xs ml-auto transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Template</span>
              </button>
            </div>
          </div>

          {/* Deployment Guidance */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
              <Server className="w-4 h-4" />
              <span>Deployment & Sharing Guidelines</span>
            </div>
            <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
              <li>
                <strong className="text-slate-200">Standalone Game:</strong> Send the downloaded <code className="text-amber-300">.html</code> file to friends via Discord, email, or upload it directly to itch.io as an HTML5 web game!
              </li>
              <li>
                <strong className="text-slate-200">Studio Hosting:</strong> Run <code className="text-amber-300">npm run build</code> and deploy the generated <code className="text-amber-300">dist</code> folder to Vercel, Netlify, or GitHub Pages.
              </li>
              <li>
                <strong className="text-slate-200">Cross-Device:</strong> Works seamlessly on mobile touchscreens with automatic on-screen D-Pad and action buttons.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
