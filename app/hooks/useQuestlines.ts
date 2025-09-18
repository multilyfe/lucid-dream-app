'use client';

import { useCallback, useMemo } from "react";
import { usePersistentState } from "./usePersistentState";
import { useBuffs } from "./useBuffs";
import { useInventory } from "./useInventory";
import { useCompanions } from "./useCompanions";
import { useNpcs } from "./useNpcs";
import {
  cloneDefaultQuestlines,
  cloneQuestline,
  findStage,
  getActiveStage,
  getQuestlineProgress,
  isQuestlineComplete,
  type QuestBranch,
  type QuestReward,
  type QuestStage,
  type Questline,
} from "../lib/questlines";

export type StageCompletionResult =
  | "completed"
  | "already-completed"
  | "branch-required"
  | "questline-completed";

const TITLES_STORAGE_KEY = "titlesUnlocked";

function cloneStage(stage: QuestStage): QuestStage {
  return {
    ...stage,
    branchChoices: stage.branchChoices?.map((branch) => ({ ...branch })) ?? undefined,
  };
}

export function useQuestlines() {
  const [questlines, setQuestlines] = usePersistentState<Questline[]>(
    "questlines",
    cloneDefaultQuestlines
  );
  const [xp, setXp] = usePersistentState<number>("xpTotal", () => 3400);
  const [titles, setTitles] = usePersistentState<string[]>(TITLES_STORAGE_KEY, () => []);
  const { applyEvent, triggerBuffBySource } = useBuffs();
  const { gainItem } = useInventory();
  const { companions, gainXpForCompanions } = useCompanions();
  const { npcs, adjustTrust: adjustNpcTrust } = useNpcs();

  const awardTitle = useCallback(
    (title?: string) => {
      if (!title || title.trim().length === 0) return;
      setTitles((prev) => (prev.includes(title) ? prev : [...prev, title]));
    },
    [setTitles]
  );

  const awardReward = useCallback(
    (reward?: QuestReward) => {
      if (!reward) return;
      if (reward.xp && reward.xp > 0) {
        const rewarded = applyEvent("xp", reward.xp);
        if (rewarded > 0) {
          setXp((prev) => prev + rewarded);
        }
      }
      if (reward.item) {
        gainItem(reward.item, 1);
      }
      if (reward.buff) {
        triggerBuffBySource(reward.buff);
      }
      if (reward.title) {
        awardTitle(reward.title);
      }
    },
    [applyEvent, awardTitle, gainItem, setXp, triggerBuffBySource]
  );

  const updateQuestline = useCallback(
    (questlineId: string, updater: (questline: Questline) => Questline) => {
      setQuestlines((previous) =>
        previous.map((questline) =>
          questline.id === questlineId ? updater(cloneQuestline(questline)) : questline
        )
      );
    },
    [setQuestlines]
  );

  const mutateStage = useCallback(
    (
      questlineId: string,
      stageId: string,
      mutator: (stage: QuestStage) => QuestStage
    ) => {
      updateQuestline(questlineId, (questline) => ({
        ...questline,
        stages: questline.stages.map((stage) =>
          stage.id === stageId ? mutator(cloneStage(stage)) : stage
        ),
      }));
    },
    [updateQuestline]
  );

  const completeStage = useCallback(
    (questlineId: string, stageId: string, branchId?: string): StageCompletionResult => {
      let completion: StageCompletionResult = "completed";

      setQuestlines((previous) =>
        previous.map((questline) => {
          if (questline.id !== questlineId) {
            return questline;
          }

          const working = cloneQuestline(questline);
          const located = findStage(working, stageId);
          if (!located) {
            return questline;
          }

          const { stage, index } = located;

          if (stage.completed) {
            completion = "already-completed";
            return questline;
          }

          if (stage.branchChoices && stage.branchChoices.length > 0) {
            const chosen = branchId ?? stage.chosenBranchId ?? undefined;
            if (!chosen) {
              completion = "branch-required";
              return questline;
            }
            stage.chosenBranchId = chosen;
            const branch = stage.branchChoices.find((option) => option.id === chosen);
            if (branch?.reward) {
              awardReward(branch.reward);
              if (branch.reward.xp) {
                gainXpForCompanions("quest", branch.reward.xp);
              }
            }
          }

          stage.completed = true;
          const stageReward = { xp: stage.xp, ...stage.reward };
          awardReward(stageReward);
          if (stageReward.xp) {
            gainXpForCompanions("quest", stageReward.xp);
          }

          const stageText = `${stage.title ?? ''} ${stage.description ?? ''} ${questline.name ?? ''}`.toLowerCase();
          npcs.forEach((npc) => {
            if (stageText.includes(npc.name.toLowerCase())) {
              adjustNpcTrust(npc.id, 5);
            }
          });

          working.stages[index] = stage;

          if (isQuestlineComplete(working)) {
            working.completed = true;
            if (working.reward) {
              awardReward(working.reward);
              if (working.reward.xp) {
                gainXpForCompanions("quest", working.reward.xp);
              }
            }
            completion = "questline-completed";
          }

          return working;
        })
      );

      return completion;
    },
    [adjustNpcTrust, awardReward, gainXpForCompanions, npcs, setQuestlines]
  );

  const chooseBranch = useCallback(
    (questlineId: string, stageId: string, branchId: string) => {
      mutateStage(questlineId, stageId, (stage) => ({
        ...stage,
        chosenBranchId: branchId,
      }));
    },
    [mutateStage]
  );

  const resetQuestline = useCallback(
    (questlineId: string) => {
      updateQuestline(questlineId, (questline) => ({
        ...questline,
        completed: false,
        stages: questline.stages.map((stage) => ({
          ...stage,
          completed: false,
          chosenBranchId: stage.branchChoices ? null : stage.chosenBranchId,
        })),
      }));
    },
    [updateQuestline]
  );

  const addQuestline = useCallback(
    (questline: Questline) => {
      setQuestlines((previous) => [...previous, cloneQuestline(questline)]);
    },
    [setQuestlines]
  );

  const removeQuestline = useCallback(
    (questlineId: string) => {
      setQuestlines((previous) => previous.filter((questline) => questline.id !== questlineId));
    },
    [setQuestlines]
  );

  const addStage = useCallback(
    (questlineId: string, stage: QuestStage) => {
      updateQuestline(questlineId, (questline) => ({
        ...questline,
        stages: [...questline.stages, cloneStage(stage)],
      }));
    },
    [updateQuestline]
  );

  const updateStageFields = useCallback(
    (questlineId: string, stageId: string, patch: Partial<QuestStage>) => {
      mutateStage(questlineId, stageId, (stage) => ({
        ...stage,
        ...patch,
      }));
    },
    [mutateStage]
  );

  const removeStage = useCallback(
    (questlineId: string, stageId: string) => {
      updateQuestline(questlineId, (questline) => ({
        ...questline,
        stages: questline.stages.filter((stage) => stage.id !== stageId),
      }));
    },
    [updateQuestline]
  );

  const questlineSummaries = useMemo(
    () =>
      questlines.map((questline) => ({
        questline,
        progress: getQuestlineProgress(questline),
        activeStage: getActiveStage(questline),
      })),
    [questlines]
  );

  return {
    questlines,
    questlineSummaries,
    completeStage,
    chooseBranch,
    resetQuestline,
    addQuestline,
    updateQuestline,
    removeQuestline,
    addStage,
    updateStage: updateStageFields,
    removeStage,
    mutateStage,
  };
}
