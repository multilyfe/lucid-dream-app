import QuestLayout from "../../layouts/QuestLayout";
import RPGDashboard from "../../RPGDashboard";

export default function AnalyticsPage() {
  return (
    <QuestLayout>
      <RPGDashboard forcedTab="Analytics" />
    </QuestLayout>
  );
}
