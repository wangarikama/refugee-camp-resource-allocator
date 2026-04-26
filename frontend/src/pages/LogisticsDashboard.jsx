import { useState } from 'react';
import axios from 'axios';

export default function LogisticsDashboard({ filteredItems, refreshData }) {
  // State to track which item is currently being edited
  const [editingId, setEditingId] = useState(null);
  const [newStockValue, setNewStockValue] = useState("");

  // Function to handle saving the new data to the database
  const handleSave = async (id) => {
    try {
      await axios.put(`https://refugee-camp-resource-allocator.onrender.com/api/resources/${id}`, {
        quantity_in_stock: Number(newStockValue)
      });
      setEditingId(null); // Close the edit mode
      refreshData();      // Tell the main dashboard to fetch the new numbers!
    } catch (err) {
      console.error(err);
      alert("Failed to update stock. Is the backend running?");
    }
  };

  return (
    <div>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h2 className="text-2xl font-bold text-blue-600">Logistics Data Entry</h2>
        <p className="text-gray-600 mt-2">Update physical inventory levels below. Changes will immediately reflect across all camp dashboards.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.length === 0 ? (
          <p className="text-gray-500 italic col-span-3 text-center">No items found.</p>
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

              {/* EDIT TOGGLE LOGIC */}
              {editingId === item.id ? (
                <div className="mt-4 flex space-x-2">
                  <input 
                    type="number" 
                    value={newStockValue}
                    onChange={(e) => setNewStockValue(e.target.value)}
                    className="w-full border-2 border-blue-500 rounded px-3 py-2 text-gray-800 font-bold focus:outline-none"
                    placeholder="New amount..."
                  />
                  <button 
                    onClick={() => handleSave(item.id)}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition"
                  >
                    Save
                  </button>
                  <button 
                    onClick={() => setEditingId(null)}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition"
                  >
                    X
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => { setEditingId(item.id); setNewStockValue(item.quantity_in_stock); }}
                  className="w-full mt-4 bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold py-2 px-4 rounded border border-blue-200 transition"
                >
                   Update Stock
                </button>
              )}

            </div>
          ))
        )}
      </div>
    </div>
  );
}