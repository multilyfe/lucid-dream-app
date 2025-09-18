import QuestLayout from "../../layouts/QuestLayout";
import RPGDashboard from "../../RPGDashboard";

export default function QuestsPage() {
  return (
    <QuestLayout>
      <RPGDashboard forcedTab="Quests" />
    </QuestLayout>
  );
}
