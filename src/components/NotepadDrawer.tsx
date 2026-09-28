import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  NotebookTabs,
  X,
  Trash2,
  Calendar,
  Clock,
  ArrowDownLeft,
  Copy,
  Check,
  Search,
  ChevronRight,
  ArrowLeft,
  FileText,
  BookmarkCheck,
} from 'lucide-react';
import { NoteEntry } from '../types';
import { LanguageNumeralSystem, localizeNumber } from '../utils/languages';
import { sound } from '../utils/sound';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  notes: NoteEntry[];
  onUpdateNote: (id: string, updates: Partial<NoteEntry>) => void;
  onDeleteNote: (id: string) => void;
  onDeleteMultipleNotes?: (ids: string[]) => void;
  onClearAllNotes: () => void;
  onSelectResult: (result: string) => void;
  language: LanguageNumeralSystem;
}

export const NotepadDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  notes,
  onUpdateNote,
  onDeleteNote,
  onDeleteMultipleNotes,
  onClearAllNotes,
  onSelectResult,
  language,
}) => {
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Multi-select delete mode states
  const [isSelectionMode, setIsSelectionMode] = useState<boolean>(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Auto-reset selection mode if notes are emptied or drawer closes
  useEffect(() => {
    if (!isOpen || notes.length === 0) {
      setIsSelectionMode(false);
      setSelectedIds(new Set());
    }
  }, [isOpen, notes.length]);

  const selectedNote = notes.find((n) => n.id === selectedNoteId);

  const handleCopyNote = (note: NoteEntry) => {
    if (!navigator.clipboard) return;
    const text = `${note.title ? `[${note.title}]\n` : ''}${note.fullCalculation}\n${
      note.content ? `Notes: ${note.content}\n` : ''
    }${note.dateStr} ${note.timeStr}`;
    navigator.clipboard.writeText(text);
    sound.playGlassTap(1400, 0.06, 0.15);
    setCopiedId(note.id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const filteredNotes = notes.filter((n) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      n.title.toLowerCase().includes(q) ||
      n.fullCalculation.toLowerCase().includes(q) ||
      (n.content && n.content.toLowerCase().includes(q)) ||
      n.dateStr.toLowerCase().includes(q) ||
      n.timeStr.toLowerCase().includes(q)
    );
  });

  const isAllSelected = notes.length > 0 && selectedIds.size === notes.length;
  const isPartiallySelected = selectedIds.size > 0 && selectedIds.size < notes.length;

  // Toggle select-all / deselect-all with the top large radio button
  const handleToggleSelectAll = () => {
    sound.triggerHaptic(12);
    sound.playGlassTap(1200, 0.03, 0.1);
    if (isAllSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(notes.map((n) => n.id)));
    }
  };

  // Toggle selection for an individual note
  const handleToggleSelectNote = (id: string) => {
    sound.triggerHaptic(8);
    sound.playGlassTap(1150, 0.03, 0.1);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Top Delete icon click action
  const handleDeleteAction = () => {
    if (!isSelectionMode) {
      // Enter selection mode and show circular radio buttons
      sound.triggerHaptic(12);
      sound.playGlassTap(1100, 0.04, 0.12);
      setIsSelectionMode(true);
      return;
    }

    // In selection mode: if items are selected, execute deletion
    if (selectedIds.size === 0) {
      sound.playGlassTap(900, 0.04, 0.1);
      setIsSelectionMode(false);
      return;
    }

    sound.triggerHaptic(25);
    sound.playClearSound();

    if (selectedIds.size === notes.length) {
      onClearAllNotes();
    } else if (onDeleteMultipleNotes) {
      onDeleteMultipleNotes(Array.from(selectedIds));
    } else {
      selectedIds.forEach((id) => onDeleteNote(id));
    }

    setSelectedIds(new Set());
    setIsSelectionMode(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 z-40 flex flex-col backdrop-blur-3xl bg-white/[0.08] dark:bg-black/[0.22] border border-white/20 text-white overflow-hidden rounded-[44px] shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-white/10 bg-white/[0.02]">
            {selectedNote ? (
              // Detail Header with Back Button
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    sound.playGlassTap(1100, 0.04, 0.1);
                    setSelectedNoteId(null);
                  }}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Notes</span>
                </button>
              </div>
            ) : (
              // List Header
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.35)]">
                  <NotebookTabs className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold tracking-tight flex items-center gap-2">
                    Calculation Notes
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-white/70 font-mono">
                      {notes.length}
                    </span>
                  </h2>
                  <p className="text-[11px] text-white/50">
                    {isSelectionMode
                      ? 'Select notes to delete'
                      : 'Saved calculation drafts & memos'}
                  </p>
                </div>
              </div>
            )}

            {/* Header Right Actions */}
            <div className="flex items-center gap-1.5">
              {selectedNote ? (
                <>
                  <button
                    onClick={() => handleCopyNote(selectedNote)}
                    className="p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer"
                    title="Copy note"
                  >
                    {copiedId === selectedNote.id ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  <button
                    onClick={() => {
                      sound.playClearSound();
                      onDeleteNote(selectedNote.id);
                      setSelectedNoteId(null);
                    }}
                    className="p-2 rounded-full hover:bg-white/10 text-rose-400/80 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Delete note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </>
              ) : (
                notes.length > 0 && (
                  <>
                    {/* Top Delete Button */}
                    {isSelectionMode ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={handleDeleteAction}
                          disabled={selectedIds.size === 0}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                            selectedIds.size > 0
                              ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-[0_0_15px_rgba(244,63,94,0.55)] border border-rose-400/60 active:scale-95'
                              : 'bg-white/[0.05] text-white/30 border border-white/10 cursor-not-allowed'
                          }`}
                          title={
                            selectedIds.size > 0
                              ? isAllSelected
                                ? 'Delete all notes'
                                : `Delete ${selectedIds.size} selected note(s)`
                              : 'Select notes below to delete'
                          }
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>
                            {isAllSelected
                              ? 'Delete All'
                              : selectedIds.size > 0
                              ? `Delete (${selectedIds.size})`
                              : 'Delete'}
                          </span>
                        </button>

                        <button
                          onClick={() => {
                            sound.playGlassTap(1000, 0.04, 0.1);
                            setIsSelectionMode(false);
                            setSelectedIds(new Set());
                          }}
                          className="px-2.5 py-1.5 rounded-full text-xs text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleDeleteAction}
                        className="p-2 rounded-full hover:bg-white/10 text-rose-400/80 hover:text-rose-400 transition-colors cursor-pointer"
                        title="Select & Delete Notes"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </>
                )
              )}

              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/15 text-white/70 hover:text-white transition-colors cursor-pointer ml-1"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body: Either Note Detail View or Clean Note List View */}
          {selectedNote ? (
            /* ================= DETAIL VIEW ================= */
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Auto-saving Title Input */}
              <div>
                <input
                  type="text"
                  placeholder="Note Title (Tap to edit)..."
                  value={selectedNote.title}
                  onChange={(e) => {
                    onUpdateNote(selectedNote.id, { title: e.target.value });
                  }}
                  className="w-full text-base sm:text-lg font-semibold bg-transparent text-white placeholder-white/40 border-b border-white/15 pb-2 focus:outline-none focus:border-cyan-400 transition-colors"
                />
                <div className="text-[10px] text-cyan-300/80 mt-1 flex items-center gap-1">
                  <BookmarkCheck className="w-3 h-3" />
                  <span>Auto-saved</span>
                </div>
              </div>

              {/* Full Calculation Display Box */}
              <div className="p-3.5 rounded-2xl bg-white/[0.06] border border-white/15 backdrop-blur-md space-y-2">
                <div className="text-[10px] uppercase font-semibold text-white/50 tracking-wider">
                  Calculation Draft
                </div>
                <div className="font-mono text-base text-cyan-200 tracking-wide break-all">
                  {localizeNumber(selectedNote.fullCalculation, language)}
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/10">
                  <div className="text-[11px] text-white/50">Result:</div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold text-white">
                      {localizeNumber(selectedNote.result, language)}
                    </span>
                    <button
                      onClick={() => {
                        sound.playGlassTap(1300, 0.04, 0.15);
                        onSelectResult(selectedNote.result);
                        onClose();
                      }}
                      className="px-2 py-0.5 rounded-full bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-300 text-[10px] font-medium border border-cyan-400/30 flex items-center gap-1 transition-colors cursor-pointer"
                      title="Load result into calculator"
                    >
                      <ArrowDownLeft className="w-3 h-3" />
                      <span>Use</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* User Notes Textarea */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-medium text-white/60">
                  Notes & Annotations:
                </label>
                <textarea
                  rows={6}
                  placeholder="Add context, remarks, or client names for this calculation..."
                  value={selectedNote.content}
                  onChange={(e) => {
                    onUpdateNote(selectedNote.id, { content: e.target.value });
                  }}
                  className="w-full p-3 rounded-2xl bg-white/[0.06] border border-white/15 text-white placeholder-white/30 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 transition-colors backdrop-blur-md resize-none"
                />
              </div>

              {/* Timestamp Footer */}
              <div className="pt-2 text-[11px] text-white/40 flex items-center justify-between border-t border-white/10">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-cyan-400/70" />
                  <span>{selectedNote.dateStr}</span>
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400/70" />
                  <span>{selectedNote.timeStr}</span>
                </span>
              </div>
            </div>
          ) : (
            /* ================= CLEAN NOTE LIST VIEW ================= */
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* TOP SELECT-ALL CONTROL BAR (Prominent Large Radio Button) */}
              <AnimatePresence>
                {isSelectionMode && notes.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.18 }}
                    className="px-4 py-2.5 bg-rose-500/[0.12] border-b border-rose-500/25 backdrop-blur-md flex items-center justify-between"
                  >
                    {/* Top Large Circular Radio Button */}
                    <button
                      type="button"
                      onClick={handleToggleSelectAll}
                      className="flex items-center gap-3 group cursor-pointer select-none text-left"
                    >
                      <div
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                          isAllSelected
                            ? 'bg-rose-500 border-rose-400 text-white shadow-[0_0_12px_rgba(244,63,94,0.65)] scale-105'
                            : isPartiallySelected
                            ? 'bg-rose-500/30 border-rose-400 text-rose-300'
                            : 'bg-white/[0.06] border-white/40 group-hover:border-white/70'
                        }`}
                      >
                        {isAllSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        {isPartiallySelected && (
                          <div className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                        )}
                      </div>

                      <div>
                        <div className="text-xs font-semibold text-white group-hover:text-rose-200 flex items-center gap-1.5 transition-colors">
                          <span>Select All Notes</span>
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/10 text-white/90 font-mono">
                            {selectedIds.size}/{notes.length}
                          </span>
                        </div>
                        <p className="text-[10px] text-white/50">
                          {isAllSelected
                            ? 'All notes selected · Tap delete icon above to wipe all'
                            : 'Tap to select all notes below'}
                        </p>
                      </div>
                    </button>

                    {/* Deselect All action */}
                    {selectedIds.size > 0 && !isAllSelected && (
                      <button
                        onClick={() => {
                          sound.playGlassTap(1000, 0.03, 0.1);
                          setSelectedIds(new Set());
                        }}
                        className="text-[10.5px] text-white/60 hover:text-white px-2 py-0.5 rounded-md hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        Deselect
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Search Bar if notes exist and not selecting */}
              {notes.length > 2 && !isSelectionMode && (
                <div className="px-4 pt-3 pb-2">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                    <input
                      type="text"
                      placeholder="Search notes..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white/[0.06] border border-white/15 text-white placeholder-white/40 focus:outline-none focus:border-cyan-300 transition-colors backdrop-blur-md"
                    />
                  </div>
                </div>
              )}

              {/* Notes List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {notes.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 text-white/40">
                    <div className="p-4 rounded-3xl mb-3 border bg-white/5 border-white/10 text-white/30">
                      <FileText className="w-10 h-10 stroke-[1.4]" />
                    </div>
                    <p className="text-sm font-medium text-white/70">No notes saved yet</p>
                    <p className="text-xs text-white/40 mt-1 max-w-[260px] leading-relaxed">
                      Tap the small <span className="text-cyan-300 font-semibold">Save icon</span> on
                      the calculator display after calculating to save drafts here.
                    </p>
                  </div>
                ) : (
                  filteredNotes.map((note, index) => {
                    const localizedCalc = localizeNumber(note.fullCalculation, language);
                    const isSelected = selectedIds.has(note.id);

                    return (
                      <motion.div
                        key={note.id}
                        layout
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={() => {
                          if (isSelectionMode) {
                            handleToggleSelectNote(note.id);
                          } else {
                            sound.playGlassTap(1150, 0.04, 0.12);
                            setSelectedNoteId(note.id);
                          }
                        }}
                        className={`group p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 backdrop-blur-md select-none ${
                          isSelectionMode && isSelected
                            ? 'bg-rose-500/[0.15] border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.25)]'
                            : 'bg-white/[0.06] hover:bg-white/[0.12] border-white/10 hover:border-white/20'
                        }`}
                      >
                        {/* Circular Radio Button in front of each note */}
                        {isSelectionMode && (
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-150 ${
                              isSelected
                                ? 'bg-rose-500 border-rose-400 text-white shadow-[0_0_8px_rgba(244,63,94,0.5)] scale-105'
                                : 'bg-white/[0.04] border-white/30 group-hover:border-white/50'
                            }`}
                          >
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        )}

                        {/* Note Summary */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-xs font-semibold transition-colors truncate ${
                                isSelected ? 'text-rose-200' : 'text-white group-hover:text-cyan-200'
                              }`}
                            >
                              {note.title || `Draft #${notes.length - index}`}
                            </span>
                            <span className="text-[10px] text-white/40 shrink-0">
                              {note.dateStr} · {note.timeStr}
                            </span>
                          </div>

                          <div
                            className={`font-mono text-xs truncate ${
                              isSelected ? 'text-rose-300/90' : 'text-cyan-300/80'
                            }`}
                          >
                            {localizedCalc}
                          </div>

                          {note.content && (
                            <div className="text-[11px] text-white/50 truncate italic">
                              "{note.content}"
                            </div>
                          )}
                        </div>

                        {/* Right Indicator (Chevron when not selecting) */}
                        {!isSelectionMode && (
                          <div className="flex items-center gap-1 shrink-0 text-white/40 group-hover:text-white transition-colors">
                            <ChevronRight className="w-4 h-4" />
                          </div>
                        )}
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
