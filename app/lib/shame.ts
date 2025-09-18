export type FilthThreshold = {
  level: number;
  name: string;
  threshold: number;
};

export type PunishmentTier = {
  tier: number;
  name: string;
  filthRequired: number;
};

export type ShameSettings = {
  filthThresholds: FilthThreshold[];
  punishmentTiers: PunishmentTier[];
};
