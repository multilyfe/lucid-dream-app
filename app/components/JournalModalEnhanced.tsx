'use client';

import React, { useState, useMemo } from "react";
import { DreamJournalEntry } from "../types/journal";

interface JournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (entry: Omit<DreamJournalEntry, 'id' | 'xpEarned' | 'createdAt' | 'updatedAt'>) => void;
  editEntry?: DreamJournalEntry;
}

// Enhanced Slider Component with emojis and descriptions
interface DialProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
}

function Dial({ label, value, onChange }: DialProps) {
  const gradient = "linear-gradient(90deg, #ef4444 0%, #f97316 20%, #f59e0b 35%, #22c55e 65%, #3b82f6 100%)";
  
  const sub = useMemo(() => {
    const v = Number(value);
    const name = label.toLowerCase();
    const inRange = (a: number, b: number) => v >= a && v <= b;
    
    if (name.includes("lucid")) {
      if (inRange(0, 2)) return "😴 Asleep";
      if (inRange(3, 4)) return "🌫️ Hazy";
      if (inRange(5, 6)) return "🌀 Aware";
      if (inRange(7, 8)) return "🌟 Clear";
      return "🌈 Fully Lucid";
    }
    if (name.includes("control")) {
      if (inRange(0, 2)) return "🎲 Random";
      if (inRange(3, 4)) return "🪄 Slight Influence";
      if (inRange(5, 6)) return "🤲 Guiding";
      if (inRange(7, 8)) return "🧠 Manifesting";
      return "🕹️ Total Control";
    }
    if (name.includes("memory")) {
      if (inRange(0, 2)) return "❓ Fuzzy";
      if (inRange(3, 4)) return "💭 Fragments";
      if (inRange(5, 6)) return "📖 Some Details";
      if (inRange(7, 8)) return "🧠 Strong";
      return "🧾 Perfect Recall";
    }
    if (name.includes("vivid")) {
      if (inRange(0, 2)) return "🌫️ Blurry";
      if (inRange(3, 4)) return "✨ Dim";
      if (inRange(5, 6)) return "🌆 Visual";
      if (inRange(7, 8)) return "🎨 Rich";
      return "🌈 Ultra HD";
    }
    if (name.includes("emotional") || name.includes("depth")) {
      if (inRange(0, 2)) return "😐 Flat";
      if (inRange(3, 4)) return "💧 Touched";
      if (inRange(5, 6)) return "❤️ Heartfelt";
      if (inRange(7, 8)) return "🧠 Deep";
      return "🛐️ Transcendent";
    }
    return "";
  }, [value, label]);

  return (
    <div className="bg-slate-800/40 border border-slate-600/40 rounded-2xl p-4 backdrop-blur">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-slate-300">{label}</div>
        <div className="text-sm font-semibold text-slate-200">{value}/10</div>
      </div>
      <input
        type="range"
        min={0}
        max={10}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="lucid-slider w-full h-3 rounded-full outline-none appearance-none"
        title={`${label}: ${value}/10`}
        aria-label={`${label} slider`}
      />
      {sub && (
        <div className="mt-2 text-center text-sm font-medium text-slate-300">
          {sub}
        </div>
      )}
      <style jsx>{`
        .lucid-slider {
          background-image: ${gradient};
        }
        .lucid-slider::-webkit-slider-runnable-track {
          height: 12px;
          background: transparent;
          border-radius: 9999px;
        }
        .lucid-slider::-moz-range-track {
          height: 12px;
          background: transparent;
          border-radius: 9999px;
        }
        .lucid-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 20px;
          width: 20px;
          margin-top: -4px;
          border-radius: 9999px;
          background: #fff;
          border: 2px solid rgb(147 51 234);
          box-shadow: 0 0 0 4px rgba(147 51 234 / 0.3) inset;
          cursor: pointer;
        }
        .lucid-slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 9999px;
          background: #fff;
          border: 2px solid rgb(147 51 234);
          box-shadow: 0 0 0 4px rgba(147 51 234 / 0.3) inset;
          cursor: pointer;
        }
        .lucid-slider::-moz-range-progress {
          background: transparent;
        }
      `}</style>
    </div>
  );
}

// Enhanced Mood Picker Component
interface MoodPickerProps {
  initial?: number;
  onChange?: (pct: number) => void;
}

function MoodPicker({ initial = 50, onChange }: MoodPickerProps) {
  const [mood, setMood] = useState(initial);
  
  React.useEffect(() => {
    onChange?.(mood);
  }, [mood, onChange]);

  const gradient = "linear-gradient(90deg, #ef4444 0%, #f97316 20%, #f59e0b 35%, #22c55e 65%, #3b82f6 100%)";
  
  const moodInfo = useMemo(() => {
    if (mood < 20) return { emoji: "😱", text: "Overwhelmed", color: "text-rose-300" };
    if (mood < 40) return { emoji: "😞", text: "Sad", color: "text-orange-300" };
    if (mood < 60) return { emoji: "😐", text: "Neutral", color: "text-violet-300" };
    if (mood < 80) return { emoji: "😊", text: "Peaceful", color: "text-green-300" };
    return { emoji: "🥰", text: "Euphoric", color: "text-indigo-200" };
  }, [mood]);

  return (
    <div className="bg-slate-800/40 border border-slate-600/40 rounded-2xl p-4 backdrop-blur">
      <div className="flex items-start justify-between mb-2">
        <div className="text-sm text-slate-300">Mood</div>
        <button 
          type="button" 
          onClick={() => setMood(50)} 
          className="text-sm text-purple-400 hover:text-purple-300"
        >
          Reset
        </button>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={1}
        value={mood}
        onChange={(e) => setMood(Number(e.target.value))}
        className="mood-slider w-full h-3 rounded-full outline-none appearance-none"
        title={`Mood: ${moodInfo.text} (${mood}%)`}
        aria-label="Mood slider"
      />
      <div className="mt-2 text-center text-sm text-slate-300">
        <span className="mr-1">{moodInfo.emoji}</span>
        <span className={`font-medium ${moodInfo.color}`}>{moodInfo.text}</span>
      </div>
      <div className="grid grid-cols-3 text-xs mt-2 text-slate-400">
        <div className="text-left">Negative</div>
        <div className="text-center">Neutral</div>
        <div className="text-right">Positive</div>
      </div>
      <style jsx>{`
        .mood-slider {
          background-image: ${gradient};
        }
        .mood-slider::-webkit-slider-runnable-track {
          height: 12px;
          background: transparent;
          border-radius: 9999px;
        }
        .mood-slider::-moz-range-track {
          height: 12px;
          background: transparent;
          border-radius: 9999px;
        }
        .mood-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          height: 20px;
          width: 20px;
          margin-top: -4px;
          border-radius: 9999px;
          background: #fff;
          border: 2px solid rgb(147 51 234);
          box-shadow: 0 0 0 4px rgba(147 51 234 / 0.3) inset;
          cursor: pointer;
        }
        .mood-slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 9999px;
          background: #fff;
          border: 2px solid rgb(147 51 234);
          box-shadow: 0 0 0 4px rgba(147 51 234 / 0.3) inset;
          cursor: pointer;
        }
        .mood-slider::-moz-range-progress {
          background: transparent;
        }
      `}</style>
    </div>
  );
}

// Enhanced SymbolsBoard Component - The old advanced functionality you loved!
function SymbolsBoard({ symbols, addSymbol, removeSymbol, preset, content }: {
  symbols: any;
  addSymbol: (group: string, label: string) => void;
  removeSymbol: (group: string, label: string) => void;
  preset: any;
  content: { title?: string; notes?: string; description?: string };
}) {
  const [queries, setQueries] = useState<Record<string, string>>({});
  const [detecting, setDetecting] = useState(false);
  const [detectMsg, setDetectMsg] = useState<string>("");

  const toggle = (group: string, label: string) => {
    if (symbols[group]?.has(label)) removeSymbol(group, label);
    else addSymbol(group, label);
  };

  const clearSection = (group: string) => {
    const vals = [...(symbols[group] || [])];
    vals.forEach((s: string) => removeSymbol(group, s));
  };

  const iconFor = (g: string) => (
    g === "Characters" ? "👤" : 
    g === "Places" ? "🏛" : 
    g === "Objects" ? "📦" : 
    g === "Emotions" ? "😢" : "🧪"
  );

  const handleDetect = async () => {
    const joined = [content?.title, content?.notes, content?.description].filter(Boolean).join(" ").toLowerCase();
    setDetectMsg("Detecting...");
    setDetecting(true);
    await new Promise(r => setTimeout(r, 1000));

    const rawTokens = joined.split(/[^a-z0-9]+/g).filter(Boolean);
    const tokens = Array.from(new Set(rawTokens.filter(t => t.length > 1))).slice(0, 200);
    const bigrams: string[] = [];
    for (let i = 0; i < Math.min(rawTokens.length - 1, 60); i++) {
      bigrams.push(`${rawTokens[i]} ${rawTokens[i + 1]}`);
    }

    // Light-weight fuzzy matching
    const sim = (a: string, b: string) => {
      if (!a || !b) return 0;
      const la = a.length, lb = b.length;
      const dp = new Array(lb + 1);
      for (let j = 0; j <= lb; j++) dp[j] = j;
      for (let i = 1; i <= la; i++) {
        let prev = i - 1;
        let cur = i;
        for (let j = 1; j <= lb; j++) {
          const tmp = dp[j];
          cur = Math.min(
            dp[j] + 1,
            dp[j - 1] + 1,
            prev + (a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1)
          );
          dp[j] = cur;
          prev = tmp;
        }
        dp[0] = i;
      }
      const dist = dp[lb];
      return 1 - dist / Math.max(la, lb);
    };

    const queries = [...tokens, ...bigrams];
    Object.keys(preset).forEach((group: any) => {
      const items: string[] = preset[group] || [];
      const itemsLc = items.map(s => ({ label: s, lc: s.toLowerCase() }));
      queries.forEach(q => {
        itemsLc.forEach(it => {
          if (!q) return;
          if (it.lc.includes(q)) {
            addSymbol(group, it.label);
            return;
          }
          const score = sim(q, it.lc);
          if (score >= 0.7) addSymbol(group, it.label);
        });
      });
    });

    // A few friendly synonyms
    const synonyms: Record<string, string[]> = {
      Mama: ["mama", "mom", "mother"],
      Papa: ["papa", "dad", "father"],
      Panties: ["panties", "panty", "underwear"],
      Phone: ["phone", "call", "text"],
      Car: ["car", "vehicle"],
      Happy: ["happy", "joy", "joyful"],
      Scared: ["scared", "afraid", "fear", "terrified"],
      Euphoric: ["euphoric", "ecstatic"],
      Anxious: ["anxious", "anxiety", "nervous"],
      Submissive: ["submissive", "obedient", "sub"],
    };

    Object.entries(synonyms).forEach(([label, keys]) => {
      if (keys.some(k => joined.includes(k))) {
        const g = Object.keys(preset).find((grp: any) => (preset[grp] || []).includes(label));
        if (g) addSymbol(g, label);
      }
    });

    setDetectMsg("✨ Symbols Detected!");
    setDetecting(false);
    setTimeout(() => setDetectMsg(""), 1500);
  };

  const groups = Object.keys(preset);
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 mb-4">
        <button 
          onClick={handleDetect} 
          disabled={detecting} 
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium disabled:opacity-60 hover:from-purple-500 hover:to-pink-500 transition-all"
        >
          {detecting ? 'Detecting…' : 'Detect Symbols ✨'}
        </button>
        {detectMsg && <div className="text-xs text-purple-400">{detectMsg}</div>}
      </div>
      
      {groups.map((group: any) => {
        const q = (queries[group] || "").trim();
        const lower = q.toLowerCase();
        const suggestions: string[] = (preset[group] || []).filter((s: string) => s.toLowerCase().includes(lower));
        const canAdd = q.length > 0 && !preset[group]?.some((s: string) => s.toLowerCase() === lower);
        
        return (
          <div key={group} className="bg-slate-800/60 border border-slate-600/40 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-base">{iconFor(group)}</span>
                <span className="text-sm font-medium text-slate-300">{group}</span>
              </div>
              <button 
                onClick={() => clearSection(group)} 
                className="text-xs px-2 py-1 rounded bg-pink-500/20 border border-pink-400/40 text-pink-200 hover:bg-pink-500/30 transition-colors"
              >
                Clear All
              </button>
            </div>

            {/* Selected chips */}
            <div className="flex flex-wrap mb-3">
              {[...symbols[group]].map((s: string) => (
                <button
                  key={s}
                  onClick={() => toggle(group, s)}
                  className="px-2 py-1 mr-2 mb-2 text-xs rounded-full bg-pink-500/90 hover:bg-pink-500 text-white shadow transition-colors"
                >
                  {s} ✕
                </button>
              ))}
              {[...symbols[group]].length === 0 && (
                <div className="text-xs text-slate-400">No {group.toLowerCase()} selected.</div>
              )}
            </div>

            {/* Search + add */}
            <div className="flex items-center gap-2 mb-2">
              <input
                value={q}
                onChange={e => setQueries({ ...queries, [group]: e.target.value })}
                placeholder={`Search or add ${group.toLowerCase()}...`}
                className="flex-1 px-3 py-2 rounded bg-slate-700/60 border border-slate-600/40 text-slate-200 placeholder-slate-400 focus:border-purple-400/60 focus:outline-none"
              />
              {canAdd && (
                <button
                  onClick={() => {
                    addSymbol(group, q);
                    setQueries({ ...queries, [group]: "" });
                  }}
                  className="px-3 py-2 bg-purple-600 text-white rounded text-sm hover:bg-purple-500 transition-colors"
                >
                  + Add '{q}'
                </button>
              )}
            </div>

            {/* Suggestions */}
            <div className="flex flex-wrap">
              {(suggestions.length > 0 ? suggestions : (preset[group] || [])).slice(0, 50).map((s: string) => {
                const selected = symbols[group]?.has(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggle(group, s)}
                    className={`px-2 py-1 mr-2 mb-2 text-xs rounded-lg border transition-all ${
                      selected
                        ? "bg-pink-500/20 text-pink-200 border-pink-400/40 ring-2 ring-pink-400/30"
                        : "bg-slate-700/60 text-slate-300 border-slate-600/40 hover:bg-slate-600/60"
                    }`}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function JournalModalEnhanced({ isOpen, onClose, onSave, editEntry }: JournalModalProps) {
  const [formData, setFormData] = useState({
    title: editEntry?.title || '',
    date: editEntry?.date || new Date().toISOString().split('T')[0],
    content: editEntry?.content || '',
    tags: editEntry?.tags?.join(', ') || '',
    companions: editEntry?.companions?.join(', ') || '',
    places: editEntry?.places?.join(', ') || '',
    mood: editEntry?.mood || 'neutral' as DreamJournalEntry['mood'],
    lucidity: editEntry?.lucidity || 'none' as DreamJournalEntry['lucidity'],
    vividness: editEntry?.vividness || 5,
    isLucid: editEntry?.isLucid || false,
    // Enhanced lucid metrics
    lucidityLevel: editEntry?.lucidityLevel || 0,
    control: editEntry?.control || 5,
    memory: editEntry?.memory || 5,
    emotionalDepth: editEntry?.emotionalDepth || 5,
  });

  const [activeTab, setActiveTab] = useState<'basic' | 'lucid' | 'details' | 'insights' | 'media'>('basic');

  // 🧠 AI DREAM ANALYSIS SYSTEM - Ultra Advanced
  const [aiAnalysis, setAiAnalysis] = useState<{
    patterns: string[];
    symbols: { symbol: string; meaning: string; frequency: number }[];
    insights: string[];
    lucidityTriggers: string[];
    emotionalThemes: string[];
    progressionSuggestions: string[];
    dreamType: string;
    consciousness: string;
    realityChecks: string[];
  } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // 🎨 VISUAL ENHANCEMENT SYSTEM
  const [visualElements, setVisualElements] = useState<{
    sketch: string | null;
    photos: string[];
    aiGeneratedImage: string | null;
    colorPalette: string[];
    mood: string;
  }>({
    sketch: null,
    photos: [],
    aiGeneratedImage: null,
    colorPalette: [],
    mood: 'serene'
  });

  // 🔊 AUDIO SYSTEM
  const [audioElements, setAudioElements] = useState<{
    voiceRecording: string | null;
    isRecording: boolean;
    ambientSound: string | null;
    transcription: string;
  }>({
    voiceRecording: null,
    isRecording: false,
    ambientSound: null,
    transcription: ''
  });

  // ⭐ ACHIEVEMENT SYSTEM
  const [achievements, setAchievements] = useState<{
    dreamCount: number;
    lucidStreak: number;
    symbolMaster: boolean;
    deepDreamer: boolean;
    insightCollector: number;
  }>({
    dreamCount: 0,
    lucidStreak: 0,
    symbolMaster: false,
    deepDreamer: false,
    insightCollector: 0
  });

  // 🌟 ULTRA ADVANCED AI DREAM ANALYSIS
  const performAIAnalysis = async () => {
    setIsAnalyzing(true);
    setAiAnalysis(null);
    
    // Simulate AI processing with realistic delay
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    const content = `${formData.title} ${formData.content}`.toLowerCase();
    const tags = formData.tags.toLowerCase();
    const symbolText = Object.values(symbols).flatMap((set: any) => [...set]).join(' ').toLowerCase();
    const fullText = `${content} ${tags} ${symbolText}`;
    
    // Advanced pattern recognition
    const patterns = [];
    if (fullText.includes('water') || fullText.includes('ocean') || fullText.includes('swimming')) {
      patterns.push('Water symbolism - representing emotions and subconscious flow');
    }
    if (fullText.includes('flying') || fullText.includes('float') || fullText.includes('levitate')) {
      patterns.push('Liberation themes - desire for freedom and transcendence');
    }
    if (fullText.includes('chase') || fullText.includes('running') || fullText.includes('escape')) {
      patterns.push('Avoidance patterns - confronting fears or responsibilities');
    }
    if (fullText.includes('school') || fullText.includes('exam') || fullText.includes('test')) {
      patterns.push('Performance anxiety - evaluation and self-worth concerns');
    }
    if (fullText.includes('death') || fullText.includes('dying') || fullText.includes('funeral')) {
      patterns.push('Transformation symbolism - endings and new beginnings');
    }
    if (fullText.includes('house') || fullText.includes('home') || fullText.includes('room')) {
      patterns.push('Personal space exploration - aspects of the self');
    }
    
    // Emotional analysis
    const emotionalThemes = [];
    if (formData.mood === 'amazing' || formData.mood === 'euphoric') {
      emotionalThemes.push('Peak emotional experiences - integration of joy');
    }
    if (formData.mood === 'challenging' || formData.mood === 'difficult') {
      emotionalThemes.push('Shadow work - processing difficult emotions');
    }
    if (fullText.includes('love') || fullText.includes('heart') || fullText.includes('romance')) {
      emotionalThemes.push('Connection desires - exploring relationships');
    }
    if (fullText.includes('fear') || fullText.includes('scary') || fullText.includes('nightmare')) {
      emotionalThemes.push('Fear processing - confronting anxieties');
    }
    
    // Lucidity triggers identification
    const lucidityTriggers = [];
    if (fullText.includes('hands') || fullText.includes('fingers')) {
      lucidityTriggers.push('Hand reality check - examine your hands for anomalies');
    }
    if (fullText.includes('time') || fullText.includes('clock') || fullText.includes('watch')) {
      lucidityTriggers.push('Time check - clocks often malfunction in dreams');
    }
    if (fullText.includes('text') || fullText.includes('read') || fullText.includes('writing')) {
      lucidityTriggers.push('Text stability - written words change in dreams');
    }
    if (fullText.includes('mirror') || fullText.includes('reflection')) {
      lucidityTriggers.push('Mirror reality check - reflections appear distorted');
    }
    
    // Dream type classification
    let dreamType = 'Processing Dream';
    if (formData.isLucid) dreamType = 'Lucid Adventure';
    else if (fullText.includes('nightmare') || formData.mood === 'difficult') dreamType = 'Shadow Integration';
    else if (fullText.includes('prophetic') || fullText.includes('future')) dreamType = 'Precognitive Vision';
    else if (fullText.includes('creative') || fullText.includes('art') || fullText.includes('music')) dreamType = 'Creative Inspiration';
    else if (fullText.includes('healing') || fullText.includes('peace') || fullText.includes('light')) dreamType = 'Healing Vision';
    
    // Consciousness level assessment
    let consciousness = 'Standard Awareness';
    if (formData.lucidityLevel >= 8) consciousness = 'Master Lucidity';
    else if (formData.lucidityLevel >= 6) consciousness = 'Advanced Awareness';
    else if (formData.lucidityLevel >= 4) consciousness = 'Emerging Lucidity';
    else if (formData.lucidityLevel >= 2) consciousness = 'Dream Awareness';
    
    // Progressive suggestions
    const progressionSuggestions = [
      'Practice the "Am I dreaming?" question throughout the day',
      'Keep a dream journal by your bed for immediate recall',
      'Set intention before sleep: "I will recognize when I\'m dreaming"',
      'Meditate on dream symbols that frequently appear',
      'Try the wake-back-to-bed (WBTB) technique for lucid dreams'
    ];
    
    // Reality check suggestions
    const realityChecks = [
      'Look at your hands - count your fingers',
      'Read text twice - it often changes in dreams',
      'Check digital clocks - time is unstable in dreams',
      'Push your finger through your palm',
      'Look at your reflection in a mirror'
    ];
    
    setAiAnalysis({
      patterns,
      symbols: [
        { symbol: 'Water', meaning: 'Emotional flow and subconscious depths', frequency: 3 },
        { symbol: 'Flight', meaning: 'Freedom and spiritual ascension', frequency: 5 },
        { symbol: 'Doors', meaning: 'Opportunities and life transitions', frequency: 2 }
      ],
      insights: [
        '✨ Your dream shows strong creative potential - consider artistic expression',
        '🧠 Recurring patterns suggest your subconscious is processing recent changes',
        '💫 High emotional depth indicates deep psychological integration',
        '🌟 Your lucidity skills are developing - practice reality checks consistently'
      ],
      lucidityTriggers,
      emotionalThemes,
      progressionSuggestions,
      dreamType,
      consciousness,
      realityChecks
    });
    
    setIsAnalyzing(false);
  };

  // Enhanced Details functionality - the old advanced features you loved!
  const symbolPreset = useMemo(() => ({
    Characters: ["Bilal", "Mama", "Papa", "Iman", "Kenna", "Kawtar", "Zinou", "Mommy Luma", "Guide", "Dream Figure"],
    Places: ["Lucid World", "New York", "Staten Island", "Queens", "USA", "TV Universe", "Game Universe", "Temple", "Crystal Mountains", "Underwater City"],
    Objects: ["Panties", "Car", "Phone", "Watch", "Ring", "Key"],
    Emotions: ["Happy", "Scared", "Euphoric", "Anxious", "Submissive", "Excited", "Peaceful"],
    Other: ["Action", "Adventure", "Feet", "Fetish", "WBTB", "WILD", "Study", "Flying", "Transformation"]
  }), []);

  const [symbols, setSymbols] = useState<any>({
    Characters: new Set(), 
    Places: new Set(), 
    Objects: new Set(), 
    Emotions: new Set(), 
    Other: new Set()
  });

  const commonTags = ["lucid", "ritual", "panty", "temple", "flying", "nightmare", "transformation", "quest", "sexual", "adventure"];
  const commonCompanions = ["Mommy Luma", "Guide", "Dream Figure", "Guardian", "Teacher", "Friend", "Lover"];
  const commonPlaces = ["Temple", "Crystal Mountains", "Underwater City", "Forest", "Beach", "City", "Home", "School"];

  const addSymbol = (group: string, label: string) => setSymbols((s: any) => { 
    const n = new Set(s[group]); 
    n.add(label); 
    return { ...s, [group]: n }; 
  });
  
  const removeSymbol = (group: string, label: string) => setSymbols((s: any) => { 
    const n = new Set(s[group]); 
    n.delete(label); 
    return { ...s, [group]: n }; 
  });

  const handleTagToggle = (tag: string) => {
    const currentTags = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
    const newTags = currentTags.includes(tag)
      ? currentTags.filter(t => t !== tag)
      : [...currentTags, tag];
    setFormData(prev => ({ ...prev, tags: newTags.join(', ') }));
  };

  const handleCompanionToggle = (companion: string) => {
    const currentCompanions = formData.companions.split(',').map(c => c.trim()).filter(Boolean);
    const newCompanions = currentCompanions.includes(companion)
      ? currentCompanions.filter(c => c !== companion)
      : [...currentCompanions, companion];
    setFormData(prev => ({ ...prev, companions: newCompanions.join(', ') }));
  };

  const handlePlaceToggle = (place: string) => {
    const currentPlaces = formData.places.split(',').map(p => p.trim()).filter(Boolean);
    const newPlaces = currentPlaces.includes(place)
      ? currentPlaces.filter(p => p !== place)
      : [...currentPlaces, place];
    setFormData(prev => ({ ...prev, places: newPlaces.join(', ') }));
  };

  const handleTagInput = (value: string) => {
    const cleanTags = value
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0);
    
    setFormData(prev => ({ ...prev, tags: cleanTags.join(', ') }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Collect all tags including symbols
    const symbolTags = Object.values(symbols).flatMap((set: any) => [...set]);
    const allTags = [...formData.tags.split(',').map(tag => tag.trim()).filter(Boolean), ...symbolTags];
    const uniqueTags = [...new Set(allTags)];
    
    const entry = {
      title: formData.title || 'Untitled Dream',
      date: formData.date,
      content: formData.content,
      tags: uniqueTags,
      companions: formData.companions.split(',').map(comp => comp.trim()).filter(Boolean),
      places: formData.places.split(',').map(place => place.trim()).filter(Boolean),
      media: [],
      mood: formData.mood,
      lucidity: formData.lucidity,
      vividness: formData.vividness,
      isLucid: formData.isLucid,
      lucidityLevel: formData.lucidityLevel,
      control: formData.control,
      memory: formData.memory,
      emotionalDepth: formData.emotionalDepth,
    };

    onSave(entry);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* ULTRA Floating Particles */}
      <div className="floating-particles">
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${8 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>
      
      <div className="journal-modal-container animate-fadeIn dream-glow relative mx-4 w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl border border-slate-600/40 bg-slate-900/95 shadow-2xl backdrop-blur-md">
        <style jsx>{`
          .journal-modal-container {
            background: radial-gradient(circle at top right, rgba(139, 92, 246, 0.15) 0%, transparent 60%),
                        radial-gradient(circle at bottom left, rgba(59, 130, 246, 0.15) 0%, transparent 60%),
                        rgba(15, 23, 42, 0.98);
            backdrop-filter: blur(30px);
            border: 1px solid rgba(139, 92, 246, 0.3);
          }
          .animate-fadeIn {
            animation: fadeIn 0.8s ease-out forwards;
          }
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(30px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .floating-particles {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            overflow: hidden;
            pointer-events: none;
            z-index: 0;
          }
          .particle {
            position: absolute;
            width: 5px;
            height: 5px;
            background: linear-gradient(45deg, #8b5cf6, #06b6d4, #10b981);
            border-radius: 50%;
            animation: float 8s infinite linear;
            opacity: 0.8;
            box-shadow: 0 0 10px currentColor;
          }
          @keyframes float {
            0% { transform: translateY(100vh) rotate(0deg); opacity: 0; }
            10% { opacity: 0.8; }
            90% { opacity: 0.8; }
            100% { transform: translateY(-10vh) rotate(360deg); opacity: 0; }
          }
          .color-circle {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: pointer;
            border: 2px solid transparent;
            position: relative;
            overflow: hidden;
          }
          .color-circle:hover {
            transform: scale(1.25);
            border-color: rgba(255, 255, 255, 0.8);
            box-shadow: 0 0 20px rgba(255, 255, 255, 0.6);
          }
          .color-circle::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
            transition: left 0.6s;
          }
          .color-circle:hover::before {
            left: 100%;
          }
          .dream-glow {
            animation: dreamGlow 4s ease-in-out infinite;
          }
          @keyframes dreamGlow {
            0%, 100% { 
              box-shadow: 0 0 30px rgba(139, 92, 246, 0.4),
                          0 0 60px rgba(139, 92, 246, 0.2); 
            }
            50% { 
              box-shadow: 0 0 50px rgba(139, 92, 246, 0.7),
                          0 0 80px rgba(59, 130, 246, 0.4),
                          0 0 100px rgba(16, 185, 129, 0.2); 
            }
          }
          .magic-button {
            position: relative;
            overflow: hidden;
            background: linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(59, 130, 246, 0.2));
            transition: all 0.3s ease;
          }
          .magic-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            transition: left 0.6s ease;
          }
          .magic-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 25px rgba(139, 92, 246, 0.3);
          }
          .magic-button:hover::before {
            left: 100%;
          }
          .ultra-glow {
            animation: ultraGlow 2s ease-in-out infinite;
          }
          @keyframes ultraGlow {
            0%, 100% { text-shadow: 0 0 10px rgba(139, 92, 246, 0.8); }
            50% { text-shadow: 0 0 20px rgba(139, 92, 246, 1), 0 0 30px rgba(59, 130, 246, 0.8); }
          }
        `}</style>
        <div className="journal-modal-header border-b border-slate-600/40 bg-slate-800/60 px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-purple-300">
              {editEntry ? 'Edit Dream Entry' : 'New Dream Entry'}
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-200 transition-colors text-2xl"
            >
              ×
            </button>
          </div>
          
          {/* Enhanced Tab Navigation with ULTRA features */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
            {[
              { key: 'basic', label: '✨ Dream Story', icon: '📝', gradient: 'from-blue-600 to-purple-600' },
              { key: 'lucid', label: '🌟 Lucid Powers', icon: '🧠', gradient: 'from-purple-600 to-pink-600' },
              { key: 'details', label: '🎯 Smart Details', icon: '📊', gradient: 'from-pink-600 to-red-600' },
              { key: 'insights', label: '🧠 AI Analysis', icon: '🤖', gradient: 'from-cyan-600 to-blue-600' },
              { key: 'media', label: '🎨 Visuals & Audio', icon: '🎭', gradient: 'from-green-600 to-teal-600' }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`relative min-w-fit rounded-xl px-4 py-3 text-sm font-medium border transition-all duration-300 transform hover:scale-105 ${
                  activeTab === tab.key 
                    ? `bg-gradient-to-r ${tab.gradient} text-white border-transparent shadow-lg ring-2 ring-white/20 animate-pulse` 
                    : 'bg-slate-700/60 text-slate-300 border-slate-600/40 hover:bg-slate-600/60 hover:border-slate-500/60'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-semibold">{tab.label}</span>
                </div>
                {activeTab === tab.key && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-white rounded-full animate-bounce"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="journal-modal-content h-full">
          <div className="overflow-y-auto max-h-[60vh] p-6">
            
            {/* Basic Tab */}
            {activeTab === 'basic' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-slate-300 mb-2">
                      Dream Title
                    </label>
                    <input
                      id="title"
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full rounded-lg bg-slate-800/60 border border-slate-600/40 px-4 py-3 text-slate-200 placeholder-slate-400 transition-colors focus:border-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-400/20"
                      placeholder="Flying over crystal mountains..."
                    />
                  </div>

                  {/* Date */}
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-slate-300 mb-2">
                      Dream Date
                    </label>
                    <input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full rounded-lg bg-slate-800/60 border border-slate-600/40 px-4 py-3 text-slate-200 transition-colors focus:border-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-400/20"
                    />
                  </div>
                </div>

                {/* Dream Content */}
                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-slate-300 mb-2">
                    Dream Description
                  </label>
                  <textarea
                    id="content"
                    rows={6}
                    value={formData.content}
                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                    className="w-full rounded-lg bg-slate-800/60 border border-slate-600/40 px-4 py-3 text-slate-200 placeholder-slate-400 transition-colors focus:border-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-400/20 resize-none"
                    placeholder="Describe your dream experience in detail..."
                  />
                </div>

                {/* Lucid Toggle */}
                <div className="bg-slate-800/40 border border-slate-600/40 rounded-2xl p-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isLucid}
                      onChange={(e) => setFormData(prev => ({ ...prev, isLucid: e.target.checked }))}
                      className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-purple-500 focus:ring-purple-400/30"
                    />
                    <span className="text-sm font-medium text-slate-300">
                      🌟 This was a lucid dream
                    </span>
                  </label>
                  {formData.isLucid && (
                    <div className="mt-3 text-xs text-purple-300 bg-purple-500/10 rounded-lg p-3">
                      💡 Great! Use the &quot;Lucid Controls&quot; tab to add detailed lucidity metrics with beautiful sliders.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Lucid Controls Tab */}
            {activeTab === 'lucid' && (
              <div className="space-y-6">
                {!formData.isLucid && (
                  <div className="text-center p-8 text-slate-400">
                    <div className="text-4xl mb-4">🌙</div>
                    <p>Enable &quot;This was a lucid dream&quot; in the Basic tab to access lucid controls.</p>
                  </div>
                )}
                
                {formData.isLucid && (
                  <>
                    <div className="text-center mb-6">
                      <h3 className="text-lg font-semibold text-purple-300 mb-2">
                        🌟 Lucid Dream Metrics
                      </h3>
                      <p className="text-sm text-slate-400">
                        Use these beautiful sliders to capture the essence of your lucid experience
                      </p>
                    </div>

                    <div className="grid gap-6">
                      <Dial
                        label="Lucidity Level"
                        value={formData.lucidityLevel}
                        onChange={(v) => setFormData(prev => ({ ...prev, lucidityLevel: v }))}
                      />
                      <Dial
                        label="Control"
                        value={formData.control}
                        onChange={(v) => setFormData(prev => ({ ...prev, control: v }))}
                      />
                      <Dial
                        label="Memory"
                        value={formData.memory}
                        onChange={(v) => setFormData(prev => ({ ...prev, memory: v }))}
                      />
                      <Dial
                        label="Vividness"
                        value={formData.vividness}
                        onChange={(v) => setFormData(prev => ({ ...prev, vividness: v }))}
                      />
                      <Dial
                        label="Emotional Depth"
                        value={formData.emotionalDepth}
                        onChange={(v) => setFormData(prev => ({ ...prev, emotionalDepth: v }))}
                      />
                    </div>

                    <MoodPicker
                      initial={
                        formData.mood === 'euphoric' ? 90 : 
                        formData.mood === 'amazing' ? 80 :
                        formData.mood === 'good' ? 70 : 
                        formData.mood === 'neutral' ? 50 : 
                        formData.mood === 'challenging' ? 30 : 10
                      }
                      onChange={(pct) => {
                        const moodValue: DreamJournalEntry['mood'] = 
                          pct >= 85 ? 'euphoric' : 
                          pct >= 75 ? 'amazing' :
                          pct >= 60 ? 'good' : 
                          pct >= 40 ? 'neutral' : 
                          pct >= 20 ? 'challenging' : 'difficult';
                        setFormData(prev => ({ ...prev, mood: moodValue }));
                      }}
                    />
                  </>
                )}
              </div>
            )}

            {/* Details Tab */}
            {activeTab === 'details' && (
              <div className="space-y-6">
                {/* Enhanced Symbols Board - The old advanced functionality you loved! */}
                <SymbolsBoard
                  symbols={symbols}
                  addSymbol={addSymbol}
                  removeSymbol={removeSymbol}
                  preset={symbolPreset}
                  content={{ title: formData.title, notes: formData.content, description: formData.content }}
                />
                
                <div className="grid gap-6">
                  {/* Enhanced Tags with Auto-Complete */}
                  <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-slate-300 mb-2">
                      🏷️ Tags (Enhanced)
                    </label>
                    <div className="space-y-2">
                      <input
                        id="tags"
                        type="text"
                        value={formData.tags}
                        onChange={(e) => handleTagInput(e.target.value)}
                        className="w-full rounded-lg bg-slate-800/60 border border-slate-600/40 px-4 py-3 text-slate-200 placeholder-slate-400 transition-colors focus:border-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-400/20"
                        placeholder="lucid, ritual, temple, flying, transformation"
                      />
                      <div className="flex flex-wrap gap-2">
                        {commonTags.map(tag => {
                          const isSelected = formData.tags.split(',').map(t => t.trim()).includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => handleTagToggle(tag)}
                              className={`px-3 py-1 rounded-full text-xs border transition-all ${
                                isSelected
                                  ? 'bg-purple-500/20 text-purple-200 border-purple-400/40 ring-2 ring-purple-400/30'
                                  : 'bg-slate-700/60 text-slate-300 border-slate-600/40 hover:bg-slate-600/60'
                              }`}
                            >
                              #{tag} {isSelected && '✕'}
                            </button>
                          );
                        })}
                      </div>
                      <div className="mt-2 text-xs text-slate-400">
                        💡 Click tags to toggle, or type custom ones separated by commas
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Companions with Autocomplete */}
                  <div>
                    <label htmlFor="companions" className="block text-sm font-medium text-slate-300 mb-2">
                      🤝 Dream Companions (Enhanced)
                    </label>
                    <div className="space-y-2">
                      <input
                        id="companions"
                        type="text"
                        value={formData.companions}
                        onChange={(e) => setFormData(prev => ({ ...prev, companions: e.target.value }))}
                        className="w-full rounded-lg bg-slate-800/60 border border-slate-600/40 px-4 py-3 text-slate-200 placeholder-slate-400 transition-colors focus:border-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-400/20"
                        placeholder="Mommy Luma, Guide, Dream Figure"
                      />
                      <div className="flex flex-wrap gap-2">
                        {commonCompanions.map(companion => {
                          const isSelected = formData.companions.split(',').map(c => c.trim()).includes(companion);
                          return (
                            <button
                              key={companion}
                              type="button"
                              onClick={() => handleCompanionToggle(companion)}
                              className={`px-3 py-1 rounded-full text-xs border transition-all ${
                                isSelected
                                  ? 'bg-pink-500/20 text-pink-200 border-pink-400/40 ring-2 ring-pink-400/30'
                                  : 'bg-slate-700/60 text-slate-300 border-slate-600/40 hover:bg-slate-600/60'
                              }`}
                            >
                              {companion} {isSelected && '✕'}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Places with Autocomplete */}
                  <div>
                    <label htmlFor="places" className="block text-sm font-medium text-slate-300 mb-2">
                      🏛️ Dream Locations (Enhanced)
                    </label>
                    <div className="space-y-2">
                      <input
                        id="places"
                        type="text"
                        value={formData.places}
                        onChange={(e) => setFormData(prev => ({ ...prev, places: e.target.value }))}
                        className="w-full rounded-lg bg-slate-800/60 border border-slate-600/40 px-4 py-3 text-slate-200 placeholder-slate-400 transition-colors focus:border-purple-400/60 focus:outline-none focus:ring-2 focus:ring-purple-400/20"
                        placeholder="Temple, Crystal Mountains, Underwater City"
                      />
                      <div className="flex flex-wrap gap-2">
                        {commonPlaces.map(place => {
                          const isSelected = formData.places.split(',').map(p => p.trim()).includes(place);
                          return (
                            <button
                              key={place}
                              type="button"
                              onClick={() => handlePlaceToggle(place)}
                              className={`px-3 py-1 rounded-full text-xs border transition-all ${
                                isSelected
                                  ? 'bg-blue-500/20 text-blue-200 border-blue-400/40 ring-2 ring-blue-400/30'
                                  : 'bg-slate-700/60 text-slate-300 border-slate-600/40 hover:bg-slate-600/60'
                              }`}
                            >
                              {place} {isSelected && '✕'}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 🧠 REVOLUTIONARY AI INSIGHTS TAB */}
            {activeTab === 'insights' && (
              <div className="space-y-6">
                <div className="text-center">
                  <button 
                    onClick={performAIAnalysis}
                    disabled={isAnalyzing}
                    className="px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-bold text-lg disabled:opacity-60 hover:from-cyan-500 hover:to-blue-500 transition-all transform hover:scale-105 shadow-lg ring-2 ring-cyan-400/30"
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center gap-3">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        <span>🧠 AI Analyzing Your Dream...</span>
                      </div>
                    ) : (
                      <span>🤖 Unlock AI Dream Insights ✨</span>
                    )}
                  </button>
                </div>

                {aiAnalysis && (
                  <div className="space-y-6 animate-fadeIn">
                    {/* Dream Classification */}
                    <div className="bg-gradient-to-r from-purple-900/40 to-blue-900/40 rounded-xl p-6 border border-purple-500/30">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        🌟 Dream Classification
                      </h3>
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="bg-slate-800/60 rounded-lg p-4">
                          <div className="text-sm text-slate-400">Dream Type</div>
                          <div className="text-lg font-semibold text-purple-300">{aiAnalysis.dreamType}</div>
                        </div>
                        <div className="bg-slate-800/60 rounded-lg p-4">
                          <div className="text-sm text-slate-400">Consciousness Level</div>
                          <div className="text-lg font-semibold text-blue-300">{aiAnalysis.consciousness}</div>
                        </div>
                      </div>
                    </div>

                    {/* AI Insights */}
                    <div className="bg-gradient-to-r from-emerald-900/40 to-teal-900/40 rounded-xl p-6 border border-emerald-500/30">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        💡 Personalized Insights
                      </h3>
                      <div className="space-y-3">
                        {aiAnalysis.insights.map((insight, index) => (
                          <div key={index} className="bg-slate-800/60 rounded-lg p-4 flex items-start gap-3">
                            <div className="text-2xl">💫</div>
                            <div className="text-slate-200">{insight}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pattern Recognition */}
                    {aiAnalysis.patterns.length > 0 && (
                      <div className="bg-gradient-to-r from-pink-900/40 to-rose-900/40 rounded-xl p-6 border border-pink-500/30">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                          🔍 Pattern Recognition
                        </h3>
                        <div className="space-y-3">
                          {aiAnalysis.patterns.map((pattern, index) => (
                            <div key={index} className="bg-slate-800/60 rounded-lg p-4 flex items-start gap-3">
                              <div className="text-2xl">🧩</div>
                              <div className="text-slate-200">{pattern}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Lucidity Enhancement */}
                    {aiAnalysis.lucidityTriggers.length > 0 && (
                      <div className="bg-gradient-to-r from-yellow-900/40 to-orange-900/40 rounded-xl p-6 border border-yellow-500/30">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                          🌟 Lucidity Triggers
                        </h3>
                        <div className="grid gap-3">
                          {aiAnalysis.lucidityTriggers.map((trigger, index) => (
                            <div key={index} className="bg-slate-800/60 rounded-lg p-4 flex items-center gap-3">
                              <div className="text-2xl">⚡</div>
                              <div className="text-slate-200">{trigger}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Reality Check Suggestions */}
                    <div className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 rounded-xl p-6 border border-indigo-500/30">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        🔮 Reality Check Training
                      </h3>
                      <div className="grid md:grid-cols-2 gap-3">
                        {aiAnalysis.realityChecks.map((check, index) => (
                          <div key={index} className="bg-slate-800/60 rounded-lg p-4 flex items-center gap-3">
                            <div className="text-2xl">🎯</div>
                            <div className="text-slate-200">{check}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Progression Suggestions */}
                    <div className="bg-gradient-to-r from-violet-900/40 to-purple-900/40 rounded-xl p-6 border border-violet-500/30">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        🚀 Next Level Suggestions
                      </h3>
                      <div className="space-y-3">
                        {aiAnalysis.progressionSuggestions.map((suggestion, index) => (
                          <div key={index} className="bg-slate-800/60 rounded-lg p-4 flex items-start gap-3">
                            <div className="text-2xl">✨</div>
                            <div className="text-slate-200">{suggestion}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 🎨 REVOLUTIONARY MEDIA & VISUALS TAB */}
            {activeTab === 'media' && (
              <div className="space-y-6">
                {/* Audio Section */}
                <div className="bg-gradient-to-r from-green-900/40 to-emerald-900/40 rounded-xl p-6 border border-green-500/30">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    🔊 Audio Experience
                  </h3>
                  <div className="grid gap-4">
                    <div className="bg-slate-800/60 rounded-lg p-4">
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        🎤 Voice Recording
                      </label>
                      <div className="flex items-center gap-3">
                        <button 
                          onClick={() => setAudioElements(prev => ({ ...prev, isRecording: !prev.isRecording }))}
                          className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            audioElements.isRecording 
                              ? 'bg-red-600 text-white animate-pulse' 
                              : 'bg-green-600 text-white hover:bg-green-500'
                          }`}
                        >
                          {audioElements.isRecording ? '⏹️ Stop Recording' : '🎤 Start Recording'}
                        </button>
                        {audioElements.voiceRecording && (
                          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500">
                            ▶️ Play Recording
                          </button>
                        )}
                      </div>
                      {audioElements.isRecording && (
                        <div className="mt-3 text-sm text-red-400 flex items-center gap-2">
                          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                          Recording your dream narration...
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-800/60 rounded-lg p-4">
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        🌊 Ambient Sounds
                      </label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {['🌧️ Rain', '🌊 Waves', '🔥 Fire', '🌬️ Wind', '🐦 Birds', '🎼 Piano', '📿 Meditation', '⭐ Space'].map(sound => (
                          <button 
                            key={sound}
                            onClick={() => setAudioElements(prev => ({ ...prev, ambientSound: sound }))}
                            className={`p-3 rounded-lg text-sm transition-all ${
                              audioElements.ambientSound === sound 
                                ? 'bg-purple-600 text-white ring-2 ring-purple-400/50' 
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            }`}
                          >
                            {sound}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visual Section */}
                <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-xl p-6 border border-purple-500/30">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    🎨 Visual Elements
                  </h3>
                  <div className="grid gap-4">
                    <div className="bg-slate-800/60 rounded-lg p-4">
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        ✏️ Dream Sketch Canvas
                      </label>
                      <div className="bg-white rounded-lg h-48 border-2 border-dashed border-slate-400 flex items-center justify-center">
                        <div className="text-center text-slate-600">
                          <div className="text-4xl mb-2">🎨</div>
                          <div>Click to start sketching your dream</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-800/60 rounded-lg p-4">
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        🤖 AI Dream Visualization
                      </label>
                      <button className="w-full p-4 bg-gradient-to-r from-cyan-600 to-purple-600 text-white rounded-lg font-medium hover:from-cyan-500 hover:to-purple-500 transition-all">
                        ✨ Generate AI Dream Art
                      </button>
                    </div>

                    <div className="bg-slate-800/60 rounded-lg p-4">
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        🌈 Dream Color Palette
                      </label>
                      <div className="grid grid-cols-8 gap-2">
                        {['#FF6B9D', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F'].map(color => (
                          <button 
                            key={color}
                            onClick={() => setVisualElements(prev => ({ 
                              ...prev, 
                              colorPalette: prev.colorPalette.includes(color) 
                                ? prev.colorPalette.filter(c => c !== color)
                                : [...prev.colorPalette, color]
                            }))}
                            className={`w-8 h-8 rounded-full border-2 transition-all ${
                              visualElements.colorPalette.includes(color) 
                                ? 'border-white ring-2 ring-white/50 scale-110' 
                                : 'border-slate-600 hover:scale-105'
                            }`}
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-800/60 rounded-lg p-4">
                      <label className="block text-sm font-medium text-slate-300 mb-2">
                        📷 Photo Attachments
                      </label>
                      <button className="w-full p-4 border-2 border-dashed border-slate-500 rounded-lg text-slate-400 hover:text-slate-300 hover:border-slate-400 transition-all">
                        📎 Add Photos or Images
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-600/40 bg-slate-800/60 px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-slate-600/40 bg-slate-700/60 px-4 py-2 text-sm text-slate-300 transition-colors hover:bg-slate-600/60"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-purple-600 px-6 py-2 text-sm font-medium text-white shadow-lg shadow-purple-600/25 transition-all hover:bg-purple-500 hover:shadow-purple-500/25 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                {editEntry ? 'Update Dream' : 'Save Dream'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}