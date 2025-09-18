import QuestLayout from "../../layouts/QuestLayout";
import RPGDashboard from "../../RPGDashboard_simple";

export default function DashboardPage() {
  return (
    <QuestLayout>
      <RPGDashboard forcedTab="Dashboard" />
    </QuestLayout>
  );
}
