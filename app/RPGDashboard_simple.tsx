export default function RPGDashboard({ forcedTab }: { forcedTab?: string }) {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">🌟 Lucid Dream Temple RPG</h1>
      <div className="space-y-4">
        <p>✅ RPG Dashboard is temporarily simplified</p>
        <p>Current Tab: {forcedTab || "Dashboard"}</p>
        <div className="space-y-2">
          <a href="/rpg/journal" className="block text-blue-400 hover:text-blue-300">
            → Journal (with enhanced sliders)
          </a>
          <a href="/test" className="block text-blue-400 hover:text-blue-300">
            → Test Page
          </a>
        </div>
      </div>
    </div>
  );
}