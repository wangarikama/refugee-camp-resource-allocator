import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register the drawing tools
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function AdminDashboard({ filteredItems, chartOptions }) {
  const chartData = {
    labels: filteredItems.map(item => item.item_name),
    datasets: [
      { label: 'Current Stock', data: filteredItems.map(item => item.quantity_in_stock), backgroundColor: '#418FDE' },
      { label: 'Required (Demand)', data: filteredItems.map(item => item.required_amount), backgroundColor: '#F59E0B' }
    ]
  };

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <Bar data={chartData} options={chartOptions} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.length === 0 ? (
          <p className="text-gray-500 italic col-span-3 text-center">No items found.</p>
        ) : (
          filteredItems.map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-blue-600 mb-4">{item.item_name}</h3>
              <div className="space-y-2 text-gray-700">
                <p className="flex justify-between"><span>Current Stock:</span> <span className="font-semibold">{item.quantity_in_stock.toLocaleString()}</span></p>
                <p className="flex justify-between"><span>Required:</span> <span className="font-semibold">{item.required_amount.toLocaleString()}</span></p>
                <div className="border-t my-2 pt-2 flex justify-between"><span className="font-bold">Gap:</span> <span className="font-bold">{item.gap.toLocaleString()}</span></div>
                <p className={`mt-4 text-center py-2 rounded font-bold ${item.status === 'Critical Shortage' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>{item.status}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}