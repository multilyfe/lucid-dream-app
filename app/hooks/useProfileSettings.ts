'use client';

import { useCallback } from 'react';
import { usePersistentState } from './usePersistentState';
import { cloneDefaultProfile, normaliseProfile, type ProfileSettings } from '../lib/profile';

export function useProfileSettings() {
  const [settings, setSettings] = usePersistentState<ProfileSettings>(
    'profileSettings',
    cloneDefaultProfile
  );

  const updateSettings = useCallback(
    (patch: Partial<ProfileSettings>) => {
      setSettings((previous) => normaliseProfile({ ...previous, ...patch }));
    },
    [setSettings]
  );

  const resetSettings = useCallback(() => {
    setSettings(cloneDefaultProfile());
  }, [setSettings]);

  return {
    settings,
    updateSettings,
    resetSettings,
  } as const;
}
