'use client';

import { useSimulationRituals, type SimulationTemplate } from '../hooks/useSimulationRituals';

interface TemplateButtonsProps {
  onTemplateSelect: (template: SimulationTemplate) => void;
}

export default function TemplateButtons({ onTemplateSelect }: TemplateButtonsProps) {
  const { getTemplates } = useSimulationRituals();
  const templates = getTemplates();

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lucid_initiation': return 'from-blue-500 to-cyan-400';
      case 'flight': return 'from-sky-500 to-blue-400';
      case 'companion_encounter': return 'from-pink-500 to-rose-400';
      case 'self_transformation': return 'from-purple-500 to-violet-400';
      case 'erotic_simulation': return 'from-red-500 to-pink-500';
      default: return 'from-slate-500 to-slate-400';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'lucid_initiation': return '🌙';
      case 'flight': return '🕊️';
      case 'companion_encounter': return '👥';
      case 'self_transformation': return '🦋';
      case 'erotic_simulation': return '💋';
      default: return '✨';
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-2">🎭 Template Library</h3>
        <p className="text-sm text-slate-300">
          Choose a starter template to guide your simulation
        </p>
      </div>

      <div className="grid gap-3">
        {templates.map((template) => (
          <button
            key={template.id}
            onClick={() => onTemplateSelect(template)}
            className={`group p-4 rounded-xl border border-slate-600/40 bg-slate-800/40 hover:bg-gradient-to-r hover:${getTypeColor(template.type)}/10 hover:border-${getTypeColor(template.type).split(' ')[1].replace('to-', '')}/30 transition-all text-left`}
          >
            <div className="flex items-start space-x-3">
              <div className="text-2xl">{getTypeIcon(template.type)}</div>
              
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-medium text-white group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:text-transparent transition-all">
                    {template.name}
                  </h4>
                  <span className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${getTypeColor(template.type)}/20 text-white border border-${getTypeColor(template.type).split(' ')[1].replace('to-', '')}/30`}>
                    {template.type.replace('_', ' ')}
                  </span>
                </div>
                
                <p className="text-sm text-slate-400 mb-2">
                  {template.description}
                </p>
                
                {/* Preview snippet */}
                <div className="text-xs text-slate-500 italic bg-slate-700/30 rounded p-2 mt-2">
                  "{template.template.substring(0, 120)}..."
                </div>
                
                {/* Suggested scores */}
                <div className="flex items-center space-x-4 mt-2 text-xs">
                  <div className="flex items-center space-x-1">
                    <span className="text-blue-400">Realism:</span>
                    <span className="text-blue-300">{template.baseRealism}%</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-pink-400">Emotion:</span>
                    <span className="text-pink-300">{template.baseEmotion}%</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-purple-400">Duration:</span>
                    <span className="text-purple-300">15min</span>
                  </div>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Custom template option */}
      <button
        onClick={() => onTemplateSelect({
          id: 'custom',
          name: 'Custom Experience',
          type: 'custom',
          icon: '✨',
          description: 'Create your own unique lucid dream simulation',
          template: '',
          baseRealism: 50,
          baseEmotion: 50
        })}
        className="w-full p-4 rounded-xl border border-dashed border-slate-500/50 bg-slate-800/20 hover:bg-slate-700/30 hover:border-slate-400/50 transition-all text-center group"
      >
        <div className="space-y-2">
          <div className="text-2xl">✨</div>
          <div className="font-medium text-slate-300 group-hover:text-white transition-colors">
            Start from Scratch
          </div>
          <div className="text-xs text-slate-500">
            Craft your own unique experience
          </div>
        </div>
      </button>
    </div>
  );
}