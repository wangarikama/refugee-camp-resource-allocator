import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

// Register the drawing tools 
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function FinanceDashboard({ filteredItems, chartOptions }) {
  const chartData = {
    labels: filteredItems.map(item => item.item_name),
    datasets: [{
      label: 'Budget Deficit (USD Needed)',
      data: filteredItems.map(item => item.gap_cost),
      backgroundColor: '#EF4444', 
    }]
  };

  return (
    <>
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <Bar data={chartData} options={chartOptions} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.length === 0 ? (
          <p className="text-gray-500 italic col-span-3 text-center">No financial data found.</p>
        ) : (
          filteredItems.map((item, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-blue-600 mb-4">{item.item_name}</h3>
              <div className="space-y-2 text-gray-700">
                <p className="flex justify-between"><span>Unit Price:</span> <span className="font-semibold">${item.unit_price?.toFixed(2) || '0.00'}</span></p>
                <p className="flex justify-between"><span>Missing Items:</span> <span className="font-semibold">{Math.abs(item.gap < 0 ? item.gap : 0).toLocaleString()}</span></p>
                <div className="border-t my-2 pt-2 flex justify-between text-red-600">
                  <span className="font-bold">Budget Needed:</span> 
                  <span className="font-bold text-lg">${item.gap_cost?.toLocaleString(undefined, {minimumFractionDigits: 2}) || '0.00'}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}