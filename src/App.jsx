// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Parts from './pages/Parts';
import AddEditPart from './pages/AddEditPart';
import ViewPart from './pages/ViewPart';
import Stats from './pages/Stats';
import Import from './pages/Import';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Sidebar />
        <div className="content-container">
          <Navbar />
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/parts" element={<Parts />} />
            <Route path="/parts/add" element={<AddEditPart />} />
            <Route path="/parts/edit/:id" element={<AddEditPart />} />
            <Route path="/parts/view/:id" element={<ViewPart />} />
            <Route path="/stats" element={<Stats />} />
            <Route path="/import" element={<Import />} />
          </Routes>
        </div>
      </div>
      <ToastContainer position="bottom-right" />
    </Router>
  );
}

export default App;