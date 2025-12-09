import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import News from './pages/News';
import Sermons from './pages/Sermons';
import Login from './pages/Login';
import Admin from './pages/Admin';
import AdminStats from './pages/AdminStats';
import { initGA, trackPageView } from './lib/analytics';

// Component to track page views
function PageTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname + location.search);
  }, [location]);

  return null;
}

function App() {
  useEffect(() => {
    // Initialize GA4 on app mount
    initGA();
  }, []);

  return (
    <Router>
      <PageTracker />
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/news" element={<News />} />
            <Route path="/sermons" element={<Sermons />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/stats" element={<AdminStats />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
