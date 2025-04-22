// src/pages/Import.js - Import and Export data page
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { FaFileImport, FaFileExport, FaFileUpload, FaDownload } from 'react-icons/fa';
import api from '../services/api';
import './Import.css';

const Import = () => {
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [file, setFile] = useState(null);
  const [importResults, setImportResults] = useState(null);
  const [templateData, setTemplateData] = useState({
    partName: "Thread Guide",
    partNumber: "TG-001",
    modelName: "Singer 1507",
    location: {
      floor: 2,
      rack: 5,
      row: 3,
      column: 2,
      boxNumber: "BX-10",
      boxColor: "Red"
    },
    price: {
      landingPrice: 150.00,
      retailPrice: 200.00
    },
    quantity: 10
  });

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setImportResults(null);
  };

  const handleImport = async () => {
    if (!file) {
      toast.error('Please select a file to import');
      return;
    }

    if (!file.name.endsWith('.json')) {
      toast.error('Only JSON files are supported for import');
      return;
    }

    try {
      setImporting(true);
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        try {
          const jsonData = JSON.parse(event.target.result);
          
          // Validate the imported data
          if (!Array.isArray(jsonData)) {
            toast.error('Invalid data format. The file should contain an array of parts');
            setImporting(false);
            return;
          }
          
          // Send to API
          const results = await api.parts.bulkImport(jsonData);
          setImportResults(results);
          toast.success(`Successfully imported ${results.success} parts`);
        } catch (parseError) {
          toast.error('Failed to parse JSON file: ' + parseError.message);
        } finally {
          setImporting(false);
        }
      };
      
      reader.readAsText(file);
    } catch (err) {
      toast.error('Import failed: ' + err.message);
      setImporting(false);
    }
  };

  const handleExport = async () => {
    try {
      setExporting(true);
      
      // Fetch all parts for export
      const response = await api.parts.getParts(1, 10000); // Get all parts with a large limit
      const parts = response.parts;
      
      // Create downloadable file
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(parts, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", "sewing_parts_export.json");
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      
      toast.success(`Successfully exported ${parts.length} parts`);
      setExporting(false);
    } catch (err) {
      toast.error('Export failed: ' + err.message);
      setExporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    // Create a template file with sample data
    const template = [templateData];
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(template, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "import_template.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    toast.success('Template downloaded successfully');
  };

  return (
    <div>
      <h1 className="page-title">Import/Export Data</h1>
      
      <div className="import-export-grid">
        {/* Import Section */}
        <div className="card">
          <div className="section-header">
            <div className="icon-container blue">
              <FaFileImport className="icon blue-icon" />
            </div>
            <h2 className="section-title">Import Parts</h2>
          </div>
          
          <p className="section-description">
            Import your sewing machine parts from a JSON file. The file should contain an array of part objects.
          </p>
          
          <div className="form-section">
            <div className="form-header">
              <label className="form-label">Upload JSON File</label>
              <button
                onClick={handleDownloadTemplate}
                className="text-button blue"
              >
                <FaDownload className="button-icon" />
                Download Template
              </button>
            </div>
            <div className="upload-container">
              <div className="upload-content">
                <FaFileUpload className="upload-icon" />
                <div className="upload-text">
                  <label
                    htmlFor="file-upload"
                    className="upload-button"
                  >
                    <span>Upload a file</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      className="sr-only"
                      accept=".json"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="upload-or">or drag and drop</p>
                </div>
                <p className="file-type-hint">JSON files only</p>
              </div>
            </div>
            {file && (
              <div className="selected-file">
                Selected file: {file.name} ({(file.size / 1024).toFixed(2)} KB)
              </div>
            )}
          </div>
          
          <button
            onClick={handleImport}
            disabled={importing || !file}
            className={`primary-button blue ${importing || !file ? 'disabled' : ''}`}
          >
            {importing ? (
              <>
                <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="spinner-track" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Importing...
              </>
            ) : (
              'Import Data'
            )}
          </button>
          
          {importResults && (
            <div className="results-container">
              <h3 className="results-title">Import Results</h3>
              <div className="results-content">
                <p className="success-text">Successfully imported: {importResults.success}</p>
                {importResults.failures > 0 && (
                  <div>
                    <p className="error-text">Failed imports: {importResults.failures}</p>
                    <div className="error-list-container">
                      <ul className="error-list">
                        {importResults.errors.map((error, index) => (
                          <li key={index}>
                            {error.partNumber}: {error.error}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Export Section */}
        <div className="card">
          <div className="section-header">
            <div className="icon-container green">
              <FaFileExport className="icon green-icon" />
            </div>
            <h2 className="section-title">Export Parts</h2>
          </div>
          
          <p className="section-description">
            Export your entire sewing machine parts inventory to a JSON file that you can backup or import into another system.
          </p>
          
          <div className="format-section">
            <h3 className="format-title">Export Format</h3>
            <div className="format-display">
              <pre className="format-code">
                {JSON.stringify([templateData], null, 2)}
              </pre>
            </div>
          </div>
          
          <button
            onClick={handleExport}
            disabled={exporting}
            className={`primary-button green ${exporting ? 'disabled' : ''}`}
          >
            {exporting ? (
              <>
                <svg className="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="spinner-track" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="spinner-path" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Exporting...
              </>
            ) : (
              'Export All Parts'
            )}
          </button>
          
          <div className="info-box">
            <h3 className="info-title">Data Backup</h3>
            <p className="info-text">
              Regularly export your inventory data for backup purposes. You can use the exported 
              JSON file to restore your data in case of data loss.
            </p>
          </div>
        </div>
      </div>
      
      {/* Schema Documentation */}
      <div className="schema-container">
        <h2 className="section-title">Data Format Documentation</h2>
        <p className="section-description">
          The import/export feature uses a specific JSON format. Each part in the JSON array should have the following structure:
        </p>
        
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Field</th>
                <th>Type</th>
                <th>Required</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="field-name">partName</td>
                <td>String</td>
                <td>Yes</td>
                <td>Name of the part</td>
              </tr>
              <tr>
                <td className="field-name">partNumber</td>
                <td>String</td>
                <td>Yes</td>
                <td>Unique identifier for the part</td>
              </tr>
              <tr>
                <td className="field-name">modelName</td>
                <td>String</td>
                <td>Yes</td>
                <td>Sewing machine model name</td>
              </tr>
              <tr>
                <td className="field-name">location</td>
                <td>Object</td>
                <td>Yes</td>
                <td>Object containing floor, rack, row, column, boxNumber, and boxColor</td>
              </tr>
              <tr>
                <td className="field-name">price</td>
                <td>Object</td>
                <td>Yes</td>
                <td>Object containing landingPrice and retailPrice</td>
              </tr>
              <tr>
                <td className="field-name">quantity</td>
                <td>Number</td>
                <td>No</td>
                <td>Quantity in stock (defaults to 0)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Import;