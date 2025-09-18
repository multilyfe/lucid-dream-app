import defaultQuestlines from "../../data/questlines.json";

export type QuestReward = {
  xp?: number;
  item?: string;
  title?: string;
  buff?: string;
  description?: string;
};

export type QuestBranch = {
  id: string;
  title: string;
  description?: string;
  reward?: QuestReward;
};

export type QuestStage = {
  id: string;
  title: string;
  description?: string;
  xp: number;
  completed: boolean;
  branchChoices?: QuestBranch[];
  chosenBranchId?: string | null;
  reward?: QuestReward;
  deadline?: string | null;
  deadlineNote?: string | null;
};

export type Questline = {
  id: string;
  name: string;
  description?: string;
  realm?: string;
  companionId?: string;
  branching?: boolean;
  stages: QuestStage[];
  reward?: QuestReward;
  completed?: boolean;
  activeStageId?: string | null;
};

export function cloneQuestline(questline: Questline): Questline {
  return {
    ...questline,
    stages: questline.stages.map((stage) => ({
      ...stage,
      branchChoices: stage.branchChoices?.map((branch) => ({ ...branch })),
    })),
  };
}

const DEFAULT_QUESTLINES = (defaultQuestlines as Questline[]).map((questline) =>
  cloneQuestline(questline)
);

export function cloneDefaultQuestlines(): Questline[] {
  return DEFAULT_QUESTLINES.map((questline) => cloneQuestline(questline));
}

export function getQuestlineProgress(questline: Questline) {
  const total = questline.stages.length;
  const completed = questline.stages.filter((stage) => stage.completed).length;
  return {
    total,
    completed,
    percent: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

export function getActiveStage(questline: Questline): QuestStage | undefined {
  return questline.stages.find((stage) => !stage.completed);
}

export function findStage(
  questline: Questline,
  stageId: string
): { stage: QuestStage; index: number } | undefined {
  const index = questline.stages.findIndex((stage) => stage.id === stageId);
  if (index === -1) return undefined;
  return { stage: questline.stages[index], index };
}

export function isQuestlineComplete(questline: Questline): boolean {
  return questline.stages.every((stage) => stage.completed);
}
