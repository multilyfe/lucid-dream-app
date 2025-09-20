'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useSimulationEngine } from '../hooks/useSimulationEngine';
import { useCompanionScanner } from '../hooks/useCompanionScanner';

interface VoiceModeProps {
  onComplete?: (transcript: string, audioData?: Blob) => void;
  onCancel?: () => void;
  isActive?: boolean;
}

interface AudioPlaybackProps {
  audioUrl?: string;
  onEnded?: () => void;
}

const AudioPlayback: React.FC<AudioPlaybackProps> = ({ audioUrl, onEnded }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnd = () => {
      setIsPlaying(false);
      onEnded?.();
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnd);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnd);
    };
  }, [onEnded]);

  const togglePlayback = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (!audioUrl) return null;

  return (
    <div className="bg-gray-800/50 rounded-lg p-4">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      <div className="flex items-center gap-4">
        <button
          onClick={togglePlayback}
          className="w-12 h-12 bg-purple-500 hover:bg-purple-600 rounded-full flex items-center justify-center text-white transition-colors"
        >
          {isPlaying ? '⏸️' : '▶️'}
        </button>
        
        <div className="flex-1">
          <div className="flex justify-between text-sm text-gray-400 mb-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-400 to-pink-400 transition-all duration-100"
              {...({ style: { width: duration ? `${(currentTime / duration) * 100}%` : '0%' } })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export const VoiceMode: React.FC<VoiceModeProps> = ({ 
  onComplete, 
  onCancel, 
  isActive = true 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [ttsText, setTtsText] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  // Get available voices
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    const loadVoices = () => {
      // Check if speechSynthesis is available
      if (typeof window === 'undefined' || !window.speechSynthesis) {
        return;
      }
      
      const availableVoices = speechSynthesis.getVoices();
      setVoices(availableVoices);
      
      // Select a default female voice
      const femaleVoice = availableVoices.find(voice => 
        voice.name.toLowerCase().includes('female') ||
        voice.name.toLowerCase().includes('woman')
      );
      
      if (femaleVoice) {
        setSelectedVoice(femaleVoice);
      } else if (availableVoices.length > 0) {
        setSelectedVoice(availableVoices[0]);
      }
    };

    loadVoices();
    
    // Check if speechSynthesis is available before adding event listener
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      speechSynthesis.addEventListener('voiceschanged', loadVoices);
    }

    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      }
    };
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript + ' ');
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
      };
    }
  }, []);

  const startRecording = async () => {
    try {
      // Check if navigator and mediaDevices are available
      if (!navigator || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Media devices API not supported in this browser');
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(blob);
        setAudioUrl(URL.createObjectURL(blob));
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start speech recognition
      if (recognitionRef.current) {
        recognitionRef.current.start();
      }

      // Start timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      if (error instanceof Error && error.message.includes('Media devices API not supported')) {
        alert('Media recording is not supported in this browser or environment.');
      } else {
        alert('Error accessing microphone. Please check permissions and try again.');
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        if (recognitionRef.current) {
          recognitionRef.current.start();
        }
      } else {
        mediaRecorderRef.current.pause();
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      }
      setIsPaused(!isPaused);
    }
  };

  const speakText = (text: string) => {
    if (!selectedVoice || !text.trim()) return;
    
    // Check if speechSynthesis is available
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      console.warn('Speech synthesis not available');
      return;
    }

    speechSynthesis.cancel(); // Stop any current speech
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = selectedVoice;
    utterance.rate = 0.9;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    speechSynthesis.speak(utterance);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleComplete = () => {
    onComplete?.(transcript, audioBlob || undefined);
  };

  const handleXTTSIntegration = () => {
    // Placeholder for XTTS integration
    alert('XTTS Integration coming soon! This will connect to external Text-to-Speech services for ultra-realistic voice generation.');
  };

  if (!isActive) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
          🎙️ Voice Mode
        </h2>
        <p className="text-gray-400">
          Record your voice, use text-to-speech, or integrate with XTTS for immersive audio experiences
        </p>
      </div>

      {/* Recording Section */}
      <div className="bg-gray-800/30 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 text-purple-300">🎤 Voice Recording</h3>
        
        <div className="text-center mb-6">
          <div className="text-4xl mb-4">
            {isRecording ? (isPaused ? '⏸️' : '🔴') : '🎙️'}
          </div>
          
          {isRecording && (
            <div className="text-2xl font-mono text-green-400 mb-2">
              {formatTime(recordingTime)}
            </div>
          )}
          
          <div className="flex justify-center gap-4">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 rounded-lg font-bold text-white transition-colors"
              >
                Start Recording
              </button>
            ) : (
              <>
                <button
                  onClick={pauseRecording}
                  className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 rounded-lg font-bold text-white transition-colors"
                >
                  {isPaused ? 'Resume' : 'Pause'}
                </button>
                <button
                  onClick={stopRecording}
                  className="px-6 py-3 bg-gray-500 hover:bg-gray-600 rounded-lg font-bold text-white transition-colors"
                >
                  Stop
                </button>
              </>
            )}
          </div>
        </div>

        {/* Live Transcript */}
        {transcript && (
          <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
            <h4 className="font-medium mb-2 text-blue-300">Live Transcript:</h4>
            <p className="text-sm text-gray-300">{transcript}</p>
          </div>
        )}

        {/* Audio Playback */}
        {audioUrl && (
          <div className="mb-4">
            <h4 className="font-medium mb-2 text-green-300">Recorded Audio:</h4>
            <AudioPlayback audioUrl={audioUrl} />
          </div>
        )}
      </div>

      {/* Text-to-Speech Section */}
      <div className="bg-gray-800/30 rounded-lg p-6">
        <h3 className="text-lg font-bold mb-4 text-pink-300">🔊 Text-to-Speech</h3>
        
        {/* Voice Selection */}
        <div className="mb-4">
          <label htmlFor="voice-select" className="block text-sm font-medium mb-2">Select Voice:</label>
          <select
            id="voice-select"
            title="Select a voice for text-to-speech"
            value={selectedVoice?.name || ''}
            onChange={(e) => {
              const voice = voices.find(v => v.name === e.target.value);
              setSelectedVoice(voice || null);
            }}
            className="w-full p-3 bg-gray-700 rounded-lg text-white"
          >
            {voices.map((voice) => (
              <option key={voice.name} value={voice.name}>
                {voice.name} ({voice.lang})
              </option>
            ))}
          </select>
        </div>

        {/* Text Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Text to Speak:</label>
          <textarea
            value={ttsText}
            onChange={(e) => setTtsText(e.target.value)}
            placeholder="Enter text for the AI to speak..."
            className="w-full h-32 p-3 bg-gray-700 rounded-lg text-white resize-none"
          />
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => speakText(ttsText)}
            disabled={!ttsText.trim() || isPlaying}
            className="px-6 py-3 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 rounded-lg font-bold text-white transition-colors"
          >
            {isPlaying ? 'Speaking...' : 'Speak Text'}
          </button>
          
          <button
            onClick={() => {
              if (typeof window !== 'undefined' && window.speechSynthesis) {
                speechSynthesis.cancel();
              }
            }}
            className="px-6 py-3 bg-gray-500 hover:bg-gray-600 rounded-lg font-bold text-white transition-colors"
          >
            Stop Speaking
          </button>
        </div>
      </div>

      {/* XTTS Integration */}
      <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-lg p-6 border border-yellow-500/30">
        <h3 className="text-lg font-bold mb-4 text-yellow-300">⚡ XTTS Integration</h3>
        <p className="text-gray-300 mb-4">
          Connect to external Text-to-Speech services for ultra-realistic voice generation with emotion and personality.
        </p>
        <button
          onClick={handleXTTSIntegration}
          className="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 rounded-lg font-bold text-white transition-all"
        >
          Configure XTTS
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <button
          onClick={onCancel}
          className="px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg font-bold text-white transition-colors"
        >
          Cancel
        </button>
        
        <button
          onClick={handleComplete}
          disabled={!transcript.trim()}
          className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:to-gray-700 rounded-lg font-bold text-white transition-all"
        >
          Complete Voice Session
        </button>
      </div>
    </div>
  );
};