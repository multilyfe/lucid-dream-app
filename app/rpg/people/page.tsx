import QuestLayout from "../../layouts/QuestLayout";
import RPGDashboard from "../../RPGDashboard";

export default function PeoplePage() {
  return (
    <QuestLayout>
      <RPGDashboard forcedTab="People" />
    </QuestLayout>
  );
}
