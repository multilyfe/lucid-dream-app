import QuestLayout from "../../layouts/QuestLayout";
import RPGDashboard from "../../RPGDashboard";

export default function PlacesPage() {
  return (
    <QuestLayout>
      <RPGDashboard forcedTab="Places" />
    </QuestLayout>
  );
}
