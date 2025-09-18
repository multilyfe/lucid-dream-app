'use client';

import QuestLayout from "../../../layouts/QuestLayout";
import ShameCounters from "../../components/ShameCounters";
import ConfessionLog from "../../components/ConfessionLog";
import PunishmentMeter from "../../components/PunishmentMeter";

export default function ShamePage() {
  return (
    <QuestLayout>
      <div className="p-4 md:p-8" style={{
        backgroundImage: 'radial-gradient(circle at top, rgba(255, 105, 180, 0.2) 0%, transparent 60%)',
        minHeight: '100vh',
      }}>
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-pink-300 drop-shadow-[0_0_10px_rgba(255,105,180,0.8)]">
            💦 Shame & Filth Tracker
          </h1>
        </header>
        
        <div className="space-y-8">
          <ShameCounters />
          <PunishmentMeter />
          <ConfessionLog />
        </div>
      </div>
    </QuestLayout>
  );
}
