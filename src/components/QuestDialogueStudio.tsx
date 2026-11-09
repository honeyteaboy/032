/**
 * Aetheria Anime JRPG Studio - Quest & Dialogue Tree Studio
 * Allows designing branching visual novel style conversations and multi-stage RPG quests.
 */

import React, { useState } from 'react';
import {
  MessageSquare,
  CheckCircle,
  Plus,
  Trash2,
  Play,
  Sparkles,
  ArrowRight,
  Smile,
  Shield,
  Coins
} from 'lucide-react';
import {
  DialogueChoice,
  DialogueNode,
  DialogueTree,
  EmotionType,
  ProjectData,
  Quest
} from '../types/game';
import { audioManager } from '../utils/audio';

interface QuestDialogueStudioProps {
  project: ProjectData;
  onUpdateProject: (updater: (prev: ProjectData) => ProjectData) => void;
}

export const QuestDialogueStudio: React.FC<QuestDialogueStudioProps> = ({
  project,
  onUpdateProject,
}) => {
  const [activeSection, setActiveSection] = useState<'dialogue' | 'quests'>('dialogue');

  // Dialogue Tree State
  const dialogueKeys = Object.keys(project.dialogues);
  const [selectedTreeId, setSelectedTreeId] = useState<string>(dialogueKeys[0] || '');
  const activeTree: DialogueTree | undefined = project.dialogues[selectedTreeId];
  const [activeNodeId, setActiveNodeId] = useState<string>(activeTree?.initialNodeId || '');

  // Dialogue Live Simulator State
  const [simNodeId, setSimNodeId] = useState<string>(activeTree?.initialNodeId || '');

  // Quest State
  const questKeys = Object.keys(project.quests);
  const [selectedQuestId, setSelectedQuestId] = useState<string>(questKeys[0] || '');
  const activeQuest: Quest | undefined = project.quests[selectedQuestId];

  const currentNode: DialogueNode | undefined = activeTree?.nodes[activeNodeId];
  const simNode: DialogueNode | undefined = activeTree?.nodes[simNodeId];

  // Update Node Field
  const updateCurrentNode = (field: keyof DialogueNode, val: any) => {
    if (!activeTree || !currentNode) return;
    onUpdateProject(prev => {
      const tree = prev.dialogues[selectedTreeId];
      if (!tree) return prev;
      return {
        ...prev,
        dialogues: {
          ...prev.dialogues,
          [selectedTreeId]: {
            ...tree,
            nodes: {
              ...tree.nodes,
              [activeNodeId]: {
                ...tree.nodes[activeNodeId],
                [field]: val,
              },
            },
          },
        },
      };
    });
  };

  // Add Choice to Current Node
  const addChoice = () => {
    if (!currentNode) return;
    const newChoices = [...(currentNode.choices || [])];
    newChoices.push({
      text: 'New choice response...',
      nextNodeId: activeNodeId,
    });
    updateCurrentNode('choices', newChoices);
    audioManager.playSfx('select');
  };

  // Create New Node in Active Tree
  const createNewNode = () => {
    if (!activeTree) return;
    const newNodeId = `node_${Date.now()}`;
    const newNode: DialogueNode = {
      id: newNodeId,
      speakerName: currentNode?.speakerName || 'Elder Zephyr',
      avatarUrl: currentNode?.avatarUrl || '/src/assets/images/anime_hero_protagonist_1794214252921.jpg',
      emotion: 'neutral',
      text: 'Write the next dialogue response here...',
    };

    onUpdateProject(prev => ({
      ...prev,
      dialogues: {
        ...prev.dialogues,
        [selectedTreeId]: {
          ...prev.dialogues[selectedTreeId],
          nodes: {
            ...prev.dialogues[selectedTreeId].nodes,
            [newNodeId]: newNode,
          },
        },
      },
    }));

    setActiveNodeId(newNodeId);
    audioManager.playSfx('click');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-61px)] bg-slate-950 overflow-hidden select-none">
      {/* Top Section Mode Toggle */}
      <div className="flex items-center justify-between px-6 py-2.5 border-b border-slate-800 bg-slate-900/60 text-xs">
        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => { setActiveSection('dialogue'); audioManager.playSfx('click'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all ${
              activeSection === 'dialogue' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Dialogue & Cutscene Editor</span>
          </button>
          <button
            onClick={() => { setActiveSection('quests'); audioManager.playSfx('click'); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all ${
              activeSection === 'quests' ? 'bg-amber-400 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>Quest Engine</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
          {activeSection === 'dialogue' ? `Loaded Trees: ${dialogueKeys.length}` : `Active Quests: ${questKeys.length}`}
        </span>
      </div>

      {/* DIALOGUE EDITOR SECTION */}
      {activeSection === 'dialogue' && (
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left Column: Dialogue Trees & Nodes Sidebar */}
          <div className="w-full md:w-64 border-r border-slate-800 bg-slate-900/40 flex flex-col p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-cinzel font-bold text-amber-400">Dialogue Trees</span>
            </div>

            <div className="space-y-1 mb-6">
              {dialogueKeys.map(dId => (
                <button
                  key={dId}
                  onClick={() => {
                    setSelectedTreeId(dId);
                    setActiveNodeId(project.dialogues[dId]?.initialNodeId || '');
                    setSimNodeId(project.dialogues[dId]?.initialNodeId || '');
                    audioManager.playSfx('click');
                  }}
                  className={`w-full text-left px-3 py-2 rounded text-xs transition-colors truncate ${
                    selectedTreeId === dId ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  {project.dialogues[dId]?.title || dId}
                </button>
              ))}
            </div>

            {activeTree && (
              <>
                <div className="flex items-center justify-between mb-2 pt-4 border-t border-slate-800">
                  <span className="text-xs font-cinzel font-bold text-slate-300">Dialogue Nodes</span>
                  <button
                    onClick={createNewNode}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-amber-400"
                    title="Add Node"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-1">
                  {Object.values(activeTree.nodes).map(node => (
                    <button
                      key={node.id}
                      onClick={() => {
                        setActiveNodeId(node.id);
                        audioManager.playSfx('click');
                      }}
                      className={`w-full text-left px-2.5 py-1.5 rounded text-[11px] font-mono transition-colors truncate ${
                        activeNodeId === node.id ? 'bg-slate-800 text-amber-300 font-semibold border border-amber-500/40' : 'text-slate-400 hover:bg-slate-800/60'
                      }`}
                    >
                      {node.id} {node.id === activeTree.initialNodeId ? '(Root)' : ''}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Center Column: Node Form Editor */}
          <div className="flex-1 overflow-y-auto p-6 bg-slate-950 border-r border-slate-800">
            {currentNode ? (
              <div className="max-w-xl mx-auto space-y-4 text-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <h3 className="font-cinzel text-base font-bold text-amber-300">
                    Editing Node: {currentNode.id}
                  </h3>
                  <button
                    onClick={() => {
                      setSimNodeId(currentNode.id);
                      audioManager.playSfx('select');
                    }}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 text-amber-400 hover:bg-slate-700 font-semibold"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Test In Simulator</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Speaker Name</label>
                    <input
                      type="text"
                      value={currentNode.speakerName}
                      onChange={e => updateCurrentNode('speakerName', e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 mb-1 font-medium">Character Emotion</label>
                    <select
                      value={currentNode.emotion}
                      onChange={e => updateCurrentNode('emotion', e.target.value as EmotionType)}
                      className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100"
                    >
                      <option value="neutral">Neutral</option>
                      <option value="happy">Happy / Smiling</option>
                      <option value="determined">Determined / Confident</option>
                      <option value="shocked">Shocked / Surprised</option>
                      <option value="sad">Sad / Sorrowful</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Dialogue Text</label>
                  <textarea
                    rows={4}
                    value={currentNode.text}
                    onChange={e => updateCurrentNode('text', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2.5 text-slate-100 font-sans focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Choices */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-slate-300 font-medium">Player Choice Responses</label>
                    <button
                      onClick={addChoice}
                      className="flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Option</span>
                    </button>
                  </div>

                  {currentNode.choices && currentNode.choices.length > 0 ? (
                    <div className="space-y-2">
                      {currentNode.choices.map((choice, cIdx) => (
                        <div key={cIdx} className="p-2.5 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
                          <input
                            type="text"
                            value={choice.text}
                            onChange={e => {
                              const newChoices = [...currentNode.choices!];
                              newChoices[cIdx].text = e.target.value;
                              updateCurrentNode('choices', newChoices);
                            }}
                            className="w-full bg-slate-950 border border-slate-700 rounded p-1.5 text-slate-100"
                            placeholder="Choice option text..."
                          />
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-400">Leads to:</span>
                            <select
                              value={choice.nextNodeId || ''}
                              onChange={e => {
                                const newChoices = [...currentNode.choices!];
                                newChoices[cIdx].nextNodeId = e.target.value;
                                updateCurrentNode('choices', newChoices);
                              }}
                              className="bg-slate-950 border border-slate-700 rounded p-1 text-[11px] text-amber-300"
                            >
                              <option value="">(End Conversation)</option>
                              {activeTree &&
                                Object.keys(activeTree.nodes).map(nKey => (
                                  <option key={nKey} value={nKey}>
                                    {nKey}
                                  </option>
                                ))}
                            </select>

                            <button
                              onClick={() => {
                                const newChoices = currentNode.choices!.filter((_, i) => i !== cIdx);
                                updateCurrentNode('choices', newChoices);
                              }}
                              className="text-rose-400 hover:text-rose-300 ml-auto p-1"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-900/60 rounded border border-dashed border-slate-800 text-slate-500 text-center">
                      No branching choices (Conversation advances linearly or ends).
                    </div>
                  )}
                </div>

                {/* Event Trigger Hook */}
                <div className="pt-3 border-t border-slate-800">
                  <label className="block text-slate-300 mb-1 font-medium">Action Trigger Upon Node Completion</label>
                  <select
                    value={currentNode.actionTrigger || ''}
                    onChange={e => updateCurrentNode('actionTrigger', e.target.value || undefined)}
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-slate-100"
                  >
                    <option value="">None (Standard Speech)</option>
                    <option value="give_quest">Grant Quest to Player</option>
                    <option value="open_shop">Open Merchant Trade Shop</option>
                    <option value="heal_party">Fully Heal Party HP & MP</option>
                    <option value="start_battle">Trigger Boss / Monster Encounter</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-500">
                Select or create a node to edit.
              </div>
            )}
          </div>

          {/* Right Column: Visual Novel Live Dialogue Simulator */}
          <div className="w-full md:w-96 bg-slate-950/80 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-3">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="font-cinzel font-bold text-xs text-amber-300">Live Dialogue VN Preview</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-4">
                Interactive preview of how this conversation renders in-game for the player.
              </p>
            </div>

            {/* Anime Visual Novel Dialogue Box Simulation */}
            <div className="bg-slate-900/95 border-2 border-amber-500/60 rounded-xl p-4 shadow-2xl relative my-auto">
              <div className="flex gap-3 items-start">
                {simNode?.avatarUrl && (
                  <img
                    src={simNode.avatarUrl}
                    alt={simNode.speakerName}
                    className="w-16 h-16 rounded-lg object-cover border-2 border-amber-400 bg-slate-950 shrink-0 shadow-md"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-cinzel text-amber-400 font-bold text-sm mb-1">
                    {simNode?.speakerName || 'Speaker'}
                  </div>
                  <div className="text-xs text-slate-200 leading-relaxed min-h-[50px]">
                    {simNode?.text || 'No text available.'}
                  </div>
                </div>
              </div>

              {/* Choices in Simulator */}
              {simNode?.choices && simNode.choices.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-800 space-y-1.5">
                  {simNode.choices.map((choice, cIdx) => (
                    <button
                      key={cIdx}
                      onClick={() => {
                        audioManager.playSfx('click');
                        if (choice.nextNodeId && activeTree?.nodes[choice.nextNodeId]) {
                          setSimNodeId(choice.nextNodeId);
                        } else {
                          setSimNodeId(activeTree?.initialNodeId || '');
                        }
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded bg-slate-800 hover:bg-amber-400/20 hover:border-amber-400/50 border border-slate-700 text-xs text-slate-100 transition-all flex items-center justify-between"
                    >
                      <span>➤ {choice.text}</span>
                      <ArrowRight className="w-3 h-3 text-amber-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-800 text-[11px] text-slate-500">
              <span>Preview Node: {simNodeId}</span>
              <button
                onClick={() => {
                  setSimNodeId(activeTree?.initialNodeId || '');
                  audioManager.playSfx('click');
                }}
                className="text-amber-400 hover:underline"
              >
                Reset Conversation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUEST ENGINE SECTION */}
      {activeSection === 'quests' && (
        <div className="flex-1 overflow-y-auto p-6 max-w-5xl mx-auto w-full space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-cinzel text-xl font-bold text-amber-300">Quest Registry & Objectives</h2>
              <p className="text-xs text-slate-400">Design main storyline quests, side quests, and bounty hunter tasks.</p>
            </div>
            <button
              onClick={() => {
                const newQId = `quest_${Date.now()}`;
                const newQ: Quest = {
                  id: newQId,
                  title: 'Bounty: The Woodland Slimes',
                  type: 'side',
                  giverNpcId: 'npc_zephyr',
                  summary: 'Purge the wandering starlight slimes threatening the forest paths.',
                  status: 'available',
                  objectives: [
                    {
                      id: 'obj_1',
                      text: 'Defeat 3 Starlight Slimes in the hollow',
                      type: 'defeat_monster',
                      target: 'mob_slime',
                      needed: 3,
                      current: 0,
                      completed: false,
                    },
                  ],
                  rewards: {
                    exp: 300,
                    gold: 200,
                    itemId: 'item_potion',
                  },
                };
                onUpdateProject(prev => ({
                  ...prev,
                  quests: { ...prev.quests, [newQId]: newQ },
                }));
                setSelectedQuestId(newQId);
                audioManager.playSfx('select');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>New Quest</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.values(project.quests).map(quest => (
              <div
                key={quest.id}
                className="p-5 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between shadow-lg"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-cinzel text-base font-bold text-slate-100">{quest.title}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                        quest.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : quest.status === 'active'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}
                    >
                      {quest.status}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 mb-4">{quest.summary}</p>

                  <div className="space-y-2 mb-4">
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Objectives</span>
                    {quest.objectives.map(obj => (
                      <div
                        key={obj.id}
                        className="p-2 rounded bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                      >
                        <span className="text-slate-300">• {obj.text}</span>
                        <span className="font-mono text-slate-500 text-[11px]">
                          {obj.current} / {obj.needed}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-3">
                    <span className="text-sky-400">+{quest.rewards.exp} EXP</span>
                    <span className="text-amber-400">+{quest.rewards.gold} Gold</span>
                  </div>
                  {quest.rewards.itemId && project.items[quest.rewards.itemId] && (
                    <span className="text-slate-300">Reward: {project.items[quest.rewards.itemId].name}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
