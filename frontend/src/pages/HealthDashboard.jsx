import { useState } from 'react';
import axios from 'axios';

export default function HealthDashboard({ filteredItems, refreshData }) {
  const [editingId, setEditingId] = useState(null);
  const [newStockValue, setNewStockValue] = useState("");

  const handleSave = async (id) => {
    try {
      await axios.put(`https://refugee-camp-resource-allocator.onrender.com/api/resources/${id}`, {
        quantity_in_stock: Number(newStockValue)
      });
      setEditingId(null);
      refreshData(); 
    } catch (err) {
      console.error(err);
      alert("Failed to update medical stock.");
    }
  };

  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-red-500 mb-8">
        <h2 className="text-2xl font-bold text-red-600">Medical Dispensary & Staffing</h2>
        <p className="text-gray-600 mt-2">Log new shipments of medicine, supplies, and incoming medical personnel here.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.length === 0 ? (
          <p className="text-gray-500 italic col-span-3 text-center">No medical items found.</p>
        ) : (
          filteredItems.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 flex flex-col justify-between">
              
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4">{item.item_name}</h3>
                <div className="space-y-2 text-gray-700 text-sm mb-4">
                  <p className="flex justify-between"><span>Required Demand:</span> <span className="font-semibold">{item.required_amount.toLocaleString()}</span></p>
                  <p className="flex justify-between text-blue-600 font-bold"><span>Current Stock:</span> <span>{item.quantity_in_stock.toLocaleString()}</span></p>
                  <div className="border-t my-2 pt-2 flex justify-between">
                    <span className="font-bold">Calculated Gap:</span> 
                    <span className={`font-bold ${item.gap < 0 ? 'text-red-500' : 'text-green-500'}`}>{item.gap.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {editingId === item.id ? (
                <div className="mt-4 flex space-x-2">
                  <input 
                    type="number" 
                    value={newStockValue}
                    onChange={(e) => setNewStockValue(e.target.value)}
                    className="w-full border-2 border-red-400 rounded px-3 py-2 text-gray-800 font-bold focus:outline-none"
                    placeholder="New count..."
                  />
                  <button onClick={() => handleSave(item.id)} className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition">
                    Save
                  </button>
                  <button onClick={() => setEditingId(null)} className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition">
                    X
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => { setEditingId(item.id); setNewStockValue(item.quantity_in_stock); }}
                  className="w-full mt-4 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-2 px-4 rounded border border-red-200 transition"
                >
                  Update Medical Log
                </button>
              )}

            </div>
          ))
        )}
      </div>
    </div>
  );
}