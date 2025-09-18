export default function TestPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">🌟 Lucid Dream Temple - Test Page</h1>
      <div className="space-y-4">
        <p>✅ Server is working!</p>
        <p>✅ React is rendering!</p>
        <p>✅ TypeScript is compiling!</p>
        <a href="/rpg/journal" className="block text-blue-400 hover:text-blue-300">
          → Go to Journal (with enhanced sliders)
        </a>
        <a href="/rpg" className="block text-blue-400 hover:text-blue-300">
          → Go to Main RPG Dashboard
        </a>
      </div>
    </div>
  );
}