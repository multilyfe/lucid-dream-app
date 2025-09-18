import QuestLayout from "../../layouts/QuestLayout";
import RPGDashboard from "../../RPGDashboard";

export default function AchievementsPage() {
  return (
    <QuestLayout>
      <RPGDashboard forcedTab="Achievements" />
    </QuestLayout>
  );
}
