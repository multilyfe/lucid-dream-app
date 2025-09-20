'use client';

import { useState, useCallback, useEffect } from 'react';
import { usePersistentState } from './usePersistentState';
import { useMindfuckCathedral, type TripLog, type TripLogInsight } from './useMindfuckCathedral';

export interface VaultFile {
  filename: string;
  path: string;
  content: string;
  lastModified: number;
  size: number;
  status: 'synced' | 'pending' | 'error';
  tripId?: string; // Link to processed trip log
}

export interface VaultConfig {
  enabled: boolean;
  autoSync: boolean;
  syncInterval: number; // minutes
  vaultPath: string;
  watchedFolders: string[];
  lastSyncTime: number;
}

export interface ParsedTripReport {
  title: string;
  date: string;
  substance?: string;
  dosage?: string;
  duration?: number;
  setting?: string;
  intention?: string;
  entities: string[];
  insights: string[];
  egoDeathLevel?: number;
  tags: string[];
  content: string;
}

const DEFAULT_VAULT_CONFIG: VaultConfig = {
  enabled: false,
  autoSync: false,
  syncInterval: 30,
  vaultPath: '',
  watchedFolders: ['Mindfuck Cathedral', 'Trip Reports', 'Psychedelic Experiences'],
  lastSyncTime: 0
};

export function useVaultIntegration() {
  const [vaultConfig, setVaultConfig] = usePersistentState<VaultConfig>(
    'vaultConfig',
    () => DEFAULT_VAULT_CONFIG
  );
  
  const [vaultFiles, setVaultFiles] = usePersistentState<VaultFile[]>(
    'vaultFiles',
    () => []
  );
  
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle');
  const [syncLog, setSyncLog] = useState<string[]>([]);
  
  const { addTripLog, cathedralData } = useMindfuckCathedral();

  // Parse markdown content to extract trip report data
  const parseMarkdownTripReport = useCallback((content: string, filename: string): ParsedTripReport => {
    const lines = content.split('\n');
    const report: ParsedTripReport = {
      title: filename.replace(/\.md$/, ''),
      date: new Date().toISOString().split('T')[0],
      entities: [],
      insights: [],
      tags: [],
      content
    };

    let currentSection = '';
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Extract metadata from YAML frontmatter or structured content
      if (line.startsWith('# ') || line.startsWith('## ')) {
        currentSection = line.replace(/^#+\s*/, '').toLowerCase();
        continue;
      }
      
      // Date extraction
      const dateMatch = line.match(/(?:date|trip date|experience date):\s*(\d{4}-\d{2}-\d{2})/i);
      if (dateMatch) {
        report.date = dateMatch[1];
        continue;
      }
      
      // Substance and dosage
      const substanceMatch = line.match(/(?:substance|drug|compound):\s*(.+)/i);
      if (substanceMatch) {
        report.substance = substanceMatch[1];
        continue;
      }
      
      const dosageMatch = line.match(/(?:dosage|dose|amount):\s*(.+)/i);
      if (dosageMatch) {
        report.dosage = dosageMatch[1];
        continue;
      }
      
      // Duration
      const durationMatch = line.match(/(?:duration|length):\s*(\d+)(?:\s*(?:hours?|hrs?|h))?/i);
      if (durationMatch) {
        report.duration = parseInt(durationMatch[1]) * 60; // Convert to minutes
        continue;
      }
      
      // Setting
      const settingMatch = line.match(/(?:setting|location|environment):\s*(.+)/i);
      if (settingMatch) {
        report.setting = settingMatch[1];
        continue;
      }
      
      // Intention
      const intentionMatch = line.match(/(?:intention|purpose|goal):\s*(.+)/i);
      if (intentionMatch) {
        report.intention = intentionMatch[1];
        continue;
      }
      
      // Ego death level
      const egoMatch = line.match(/(?:ego death|dissolution):\s*(\d+)(?:\/10)?/i);
      if (egoMatch) {
        report.egoDeathLevel = parseInt(egoMatch[1]);
        continue;
      }
      
      // Tags
      const tagMatch = line.match(/(?:tags?|keywords?):\s*(.+)/i);
      if (tagMatch) {
        report.tags = tagMatch[1].split(/[,;]/).map(tag => tag.trim());
        continue;
      }
      
      // Entity encounters
      if (currentSection.includes('entit') || line.toLowerCase().includes('entity') || line.toLowerCase().includes('being')) {
        if (line.length > 10 && !line.startsWith('#')) {
          report.entities.push(line);
        }
      }
      
      // Insights
      if (currentSection.includes('insight') || currentSection.includes('lesson') || currentSection.includes('realization')) {
        if (line.length > 10 && !line.startsWith('#')) {
          report.insights.push(line);
        }
      }
      
      // Auto-detect insights from keywords
      if (line.match(/(?:realized|understood|learned|discovered|insight|epiphany)/i) && line.length > 20) {
        if (!report.insights.includes(line)) {
          report.insights.push(line);
        }
      }
    }
    
    // Auto-detect substance from content if not specified
    if (!report.substance) {
      const substanceKeywords = {
        'LSD': /\b(?:lsd|acid|lucy|tabs?)\b/i,
        'Psilocybin': /\b(?:psilocybin|mushrooms?|shrooms?|psilocybe)\b/i,
        'DMT': /\b(?:dmt|dimitri|breakthrough)\b/i,
        'MDMA': /\b(?:mdma|molly|ecstasy)\b/i,
        'Cannabis': /\b(?:cannabis|weed|marijuana|thc|edibles?)\b/i,
        'Ayahuasca': /\b(?:ayahuasca|aya|madre)\b/i,
        'Mescaline': /\b(?:mescaline|san pedro|peyote)\b/i
      };
      
      for (const [substance, regex] of Object.entries(substanceKeywords)) {
        if (regex.test(content)) {
          report.substance = substance;
          break;
        }
      }
    }
    
    return report;
  }, []);

  // Convert parsed report to TripLog format
  const convertToTripLog = useCallback((report: ParsedTripReport): Omit<TripLog, 'id' | 'xp_awarded' | 'tokens_earned'> => {
    return {
      date: report.date,
      substance: report.substance || 'Unknown',
      dosage: report.dosage || 'Not specified',
      duration: report.duration || 480, // Default 8 hours
      setting: report.setting || 'Not specified',
      intention: report.intention || 'Exploration',
      entities: report.entities.map((entityText, index) => ({
        name: `Entity ${index + 1}`,
        description: entityText,
        message: entityText,
        encountered_at: new Date().toISOString()
      })),
      insights: report.insights.map((insightText, index): TripLogInsight => ({
        id: `insight-${Date.now()}-${index}`,
        timestamp: new Date().toISOString(),
        content: insightText,
        emotional_intensity: Math.floor(Math.random() * 10) + 1, // Random for now
        type: 'personal'
      })),
      emotional_spikes: [], // Could be enhanced to parse emotional content
      ego_death_level: report.egoDeathLevel || 0,
      integration_notes: `Imported from vault: ${report.title}`,
      tags: [...report.tags, 'vault-import'],
      phase_breakdown: {
        onset: 'Not specified',
        come_up: 'Not specified', 
        peak: 'Not specified',
        plateau: 'Not specified',
        come_down: 'Not specified'
      },
      vault_file: report.title
    };
  }, []);

  // Simulate file system reading (in a real app, this would use File System Access API or Electron)
  const simulateVaultSync = useCallback(async (): Promise<VaultFile[]> => {
    setSyncStatus('syncing');
    addSyncLog('Starting vault sync simulation...');
    
    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create some example vault files
    const exampleFiles: VaultFile[] = [
      {
        filename: '2024-03-15-lsd-breakthrough.md',
        path: 'Mindfuck Cathedral/2024-03-15-lsd-breakthrough.md',
        content: `# LSD Breakthrough Experience
Date: 2024-03-15
Substance: LSD
Dosage: 200μg
Duration: 10 hours
Setting: Home, safe space with sitter
Intention: Deep healing and self-exploration
Ego Death: 8/10

## Experience Overview
Profound dissolution of self-boundaries leading to oceanic consciousness.

## Entities Encountered
- Geometric beings made of pure mathematics
- A wise feminine presence offering guidance
- Fractal elves dancing through dimensional portals

## Key Insights
- Realized the interconnectedness of all consciousness
- Understood that fear is just love inverted
- Discovered patterns of behavior rooted in childhood trauma
- Glimpsed the fundamental unity underlying apparent duality

## Integration Notes
This experience has shifted my entire worldview. Need to spend time journaling and processing these insights over the coming weeks.

Tags: breakthrough, healing, entities, geometry`,
        lastModified: Date.now() - 86400000, // Yesterday
        size: 1024,
        status: 'pending'
      },
      {
        filename: '2024-03-10-mushroom-forest-walk.md',
        path: 'Mindfuck Cathedral/2024-03-10-mushroom-forest-walk.md',
        content: `# Forest Mushroom Journey
Date: 2024-03-10
Substance: Psilocybin
Dosage: 3.5g dried
Duration: 6 hours
Setting: Forest hiking trail
Intention: Connect with nature consciousness
Ego Death: 4/10

## Experience
Beautiful communion with the forest intelligence. Trees seemed to communicate through rustling leaves.

## Insights
- Nature is far more conscious than we typically recognize
- Plants and trees have their own form of awareness
- Human civilization has forgotten our place in the web of life

Tags: nature, communion, forest, psilocybin`,
        lastModified: Date.now() - 432000000, // 5 days ago
        size: 512,
        status: 'pending'
      }
    ];
    
    addSyncLog(`Found ${exampleFiles.length} files in vault`);
    setSyncStatus('idle');
    
    return exampleFiles;
  }, []);

  const addSyncLog = useCallback((message: string) => {
    setSyncLog(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()}: ${message}`]);
  }, []);

  // Process vault files and import as trip logs
  const processVaultFiles = useCallback(async (files: VaultFile[]) => {
    let importCount = 0;
    
    for (const file of files) {
      if (file.status === 'pending' && file.filename.endsWith('.md')) {
        try {
          const parsed = parseMarkdownTripReport(file.content, file.filename);
          const tripLog = convertToTripLog(parsed);
          
          // Check if already imported
          const existingTrip = cathedralData.tripLogs.find(trip => trip.vault_file === file.filename);
          if (!existingTrip) {
            const newTrip = addTripLog(tripLog);
            file.status = 'synced';
            file.tripId = newTrip.id;
            importCount++;
            addSyncLog(`Imported: ${file.filename}`);
          } else {
            file.status = 'synced';
            addSyncLog(`Skipped (already imported): ${file.filename}`);
          }
        } catch (error) {
          file.status = 'error';
          addSyncLog(`Error processing ${file.filename}: ${error}`);
        }
      }
    }
    
    addSyncLog(`Sync complete: ${importCount} new trips imported`);
    return files;
  }, [parseMarkdownTripReport, convertToTripLog, addTripLog, cathedralData.tripLogs, addSyncLog]);

  // Manual sync function
  const syncVault = useCallback(async () => {
    if (!vaultConfig.enabled) {
      addSyncLog('Vault integration is disabled');
      return;
    }
    
    try {
      const files = await simulateVaultSync();
      const processedFiles = await processVaultFiles(files);
      setVaultFiles(processedFiles);
      
      setVaultConfig(prev => ({
        ...prev,
        lastSyncTime: Date.now()
      }));
    } catch (error) {
      setSyncStatus('error');
      addSyncLog(`Sync failed: ${error}`);
    }
  }, [vaultConfig.enabled, simulateVaultSync, processVaultFiles, addSyncLog, setVaultFiles, setVaultConfig]);

  // Auto-sync effect
  useEffect(() => {
    if (vaultConfig.enabled && vaultConfig.autoSync) {
      const interval = setInterval(() => {
        syncVault();
      }, vaultConfig.syncInterval * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [vaultConfig.enabled, vaultConfig.autoSync, vaultConfig.syncInterval, syncVault]);

  // Update vault configuration
  const updateVaultConfig = useCallback((updates: Partial<VaultConfig>) => {
    setVaultConfig(prev => ({ ...prev, ...updates }));
  }, [setVaultConfig]);

  return {
    vaultConfig,
    vaultFiles,
    syncStatus,
    syncLog,
    updateVaultConfig,
    syncVault,
    parseMarkdownTripReport,
    convertToTripLog
  };
}