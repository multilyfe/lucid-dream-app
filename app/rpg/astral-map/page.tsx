import ComingSoon from "../../components/ComingSoon";
import QuestLayout from "../../layouts/QuestLayout";

export default function Page() {
  return (
    <QuestLayout orbDisabled>
      <ComingSoon
        title="Astral Map 🌌"
        description="Visualize dream realms and travel nodes (WIP)."
      />
    </QuestLayout>
  );
}
