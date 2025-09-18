import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import FarmListing from './pages/FarmListing';
import InspectionWorkflow from './pages/InspectionWorkflow';
import CertificateManagement from './pages/CertificateManagement';
import FarmerManagement from './pages/FarmerManagement';
import FieldManagement from './pages/FieldManagement';

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
      </Layout>
    </Router>
  );
}

export default App;