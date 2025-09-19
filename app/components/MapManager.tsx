'use client';

import { useState } from 'react';
import { useMap } from '../hooks/useMap';
import { type MapNode, type MapLink } from '../lib/map';

export default function MapManager() {
  const { mapData, setMapData } = useMap();
  const [editingNode, setEditingNode] = useState<MapNode | null>(null);

  const handleNodeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!editingNode) return;
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const isNumber = type === 'number';
  
    setEditingNode(prev => {
      if (!prev) return null;
      
      if (name.startsWith('coords.')) {
        const coordIndex = parseInt(name.split('.')[1], 10);
        const newCoords: [number, number] = [...prev.coords];
        newCoords[coordIndex] = parseInt(value, 10);
        return { ...prev, coords: newCoords };
      }

      return {
        ...prev,
        [name]: isCheckbox ? (e.target as HTMLInputElement).checked : isNumber ? parseInt(value, 10) : value,
      };
    });
  };

  const saveNodeChanges = () => {
    if (!editingNode) return;
    setMapData(prev => ({
      ...prev,
      nodes: prev.nodes.map(n => n.id === editingNode.id ? editingNode : n),
    }));
    setEditingNode(null);
  };

  const addNode = () => {
    const newNode: MapNode = {
      id: `node_${Date.now()}`,
      name: 'New Node',
      type: 'realm',
      unlocked: false,
      coords: [Math.random() * 800, Math.random() * 600],
      lore: 'A new discovery in the dreamscape.',
    };
    setMapData(prev => ({ ...prev, nodes: [...prev.nodes, newNode] }));
  };

  const deleteNode = (nodeId: string) => {
    setMapData(prev => ({
      nodes: prev.nodes.filter(n => n.id !== nodeId),
      links: prev.links.filter(l => l.from !== nodeId && l.to !== nodeId),
    }));
  };

  const exportMap = () => {
    const dataStr = JSON.stringify(mapData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'map_data.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="p-4 bg-slate-800/50 rounded-lg">
      <h3 className="text-xl font-bold text-purple-300 mb-4">Map Manager</h3>
      <div className="flex gap-4 mb-4">
        <button onClick={addNode} className="themed-button-sm">Add Node</button>
        <button onClick={exportMap} className="themed-button-sm">Export Map JSON</button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Node List */}
        <div className="space-y-2">
          <h4 className="text-lg font-semibold">Nodes</h4>
          {mapData.nodes.map(node => (
            <div key={node.id} className="flex items-center justify-between bg-slate-700/50 p-2 rounded">
              <span>{node.name} ({node.type})</span>
              <div>
                <button onClick={() => setEditingNode(node)} className="text-sm text-blue-400 hover:text-blue-300 mr-2">Edit</button>
                <button onClick={() => deleteNode(node.id)} className="text-sm text-red-400 hover:text-red-300">Delete</button>
              </div>
            </div>
          ))}
        </div>

        {/* Node Editor */}
        {editingNode && (
          <div className="bg-slate-900 p-4 rounded-lg space-y-3">
            <h4 className="text-lg font-semibold">Editing: {editingNode.name}</h4>
            <div>
              <label className="block text-sm font-medium">ID</label>
              <input type="text" name="id" value={editingNode.id} onChange={handleNodeChange} className="themed-input" readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input type="text" name="name" value={editingNode.name} onChange={handleNodeChange} className="themed-input" />
            </div>
            <div>
              <label className="block text-sm font-medium">Type</label>
              <select name="type" value={editingNode.type} onChange={handleNodeChange} className="themed-input">
                <option value="realm">Realm</option>
                <option value="temple">Temple</option>
                <option value="dungeon">Dungeon</option>
                <option value="panty">Panty</option>
              </select>
            </div>
            <div className="flex items-center">
              <input type="checkbox" name="unlocked" checked={editingNode.unlocked} onChange={handleNodeChange} className="mr-2" />
              <label>Unlocked</label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium">Coord X</label>
                <input type="number" name="coords.0" value={editingNode.coords[0]} onChange={handleNodeChange} className="themed-input" />
              </div>
              <div>
                <label className="block text-sm font-medium">Coord Y</label>
                <input type="number" name="coords.1" value={editingNode.coords[1]} onChange={handleNodeChange} className="themed-input" />
              </div>
            </div>
            <button onClick={saveNodeChanges} className="themed-button w-full">Save Changes</button>
          </div>
        )}
      </div>
    </div>
  );
}
