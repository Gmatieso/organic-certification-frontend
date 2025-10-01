import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import FarmListing from './pages/FarmListing';
import InspectionWorkflow from './pages/InspectionWorkflow';
import CertificateManagement from './pages/CertificateManagement';
import FarmerManagement from './pages/FarmerManagement';
import FieldManagement from './pages/FieldManagement';
import  {ToastContainer} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/farms" element={<FarmListing />} />
          <Route path="/inspections" element={<InspectionWorkflow />} />
          <Route path="/certificates" element={<CertificateManagement />} />
          <Route path="/farmers" element={<FarmerManagement />} />
          <Route path="/fields" element={<FieldManagement />} />
        </Routes>
          <ToastContainer
              position="top-right"
              autoClose={3000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
          />
      </Layout>
    </Router>
  );
}

export default App;