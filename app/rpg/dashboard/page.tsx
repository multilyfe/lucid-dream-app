import QuestLayout from "../../layouts/QuestLayout";
import RPGDashboard from "../../RPGDashboard";

export default function DashboardPage() {
  return (
    <QuestLayout>
      <RPGDashboard forcedTab="Dashboard" />
    </QuestLayout>
  );
}
