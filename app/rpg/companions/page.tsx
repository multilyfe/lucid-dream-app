"use client";

import { useState } from "react";
import QuestLayout from "../../layouts/QuestLayout";
import { useCompanions } from "../../hooks/useCompanions";
import CompanionCard from "../../components/CompanionCard";
import CompanionDetail from "../../components/CompanionDetail";
import EvolutionPath from "../../components/EvolutionPath";
import { type Companion } from "../../lib/companions";

export default function CompanionsPage() {
  const { companions } = useCompanions();
  const [selectedCompanion, setSelectedCompanion] = useState<Companion | null>(
    companions.length > 0 ? companions[0] : null
  );

  return (
    <QuestLayout>
      <div className="p-4 md:p-8">
        <header className="text-center mb-12">
          <h1 className="text-5xl font-bold text-amber-300 text-shadow-amber">
            🐉 Companions
          </h1>
          <p className="text-amber-200/80 mt-2 text-lg">
            Your allies in the dreamscape, growing stronger with you.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-4">
            {companions.map((c) => (
              <CompanionCard
                key={c.id}
                companion={c}
                onSelect={setSelectedCompanion}
                isSelected={selectedCompanion?.id === c.id}
              />
            ))}
          </div>
          <div className="lg:col-span-2 space-y-8">
            {selectedCompanion ? (
              <>
                <CompanionDetail companion={selectedCompanion} />
                <EvolutionPath companion={selectedCompanion} />
              </>
            ) : (
              <div className="flex items-center justify-center h-full themed-card">
                <p className="text-xl text-slate-400">
                  Select a companion to view their details.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </QuestLayout>
  );
}
