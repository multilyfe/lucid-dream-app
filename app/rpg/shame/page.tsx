'use client';

import QuestLayout from "../../layouts/QuestLayout";
import ShameCounters from "../../components/ShameCounters";
import ConfessionLog from "../../components/ConfessionLog";
import PunishmentMeter from "../../components/PunishmentMeter";
import PunishmentManager from "../../components/PunishmentManager";

export default function ShamePage() {
  return (
    <QuestLayout>
      <div className="p-4 md:p-8 shame-page-background">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-pink-300 font-['Rune_Sans'] tracking-widest" style={{ textShadow: '0 0 15px #ff007f, 0 0 25px #ff007f' }}>
            Shame & Filth Tracker
          </h1>
          <p className="text-pink-200/80 mt-2 text-lg">A record of your delightful degradation.</p>
        </header>
        
        <div className="space-y-8">
          <ShameCounters />
          <PunishmentMeter />
          <PunishmentManager />
          <ConfessionLog />
        </div>
      </div>
    </QuestLayout>
  );
}
