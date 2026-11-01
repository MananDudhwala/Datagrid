import './App.css';
import { VirtualDataGrid } from './components/DataGrid';
import { generateMockLogs } from './Utility/generateRows';
const App = () => {
  const data = generateMockLogs();
  console.log(data)
  return (
    <div className="content">
      <VirtualDataGrid data={data} height={500} rowHeight={44} />
    </div>
  );
};

export default App;
