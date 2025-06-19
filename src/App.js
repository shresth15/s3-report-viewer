import React, { useState, useEffect } from 'react';
import { ChevronDown, FileText, Calendar, Folder, AlertCircle, Loader2 } from 'lucide-react';
import './App.css';

const App = () => {
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedReport, setSelectedReport] = useState('');
  const [reportUrl, setReportUrl] = useState('');

  // Configuration - Update these for your S3 bucket
  const USE_LOCAL_JSON = true; // Set to false for production S3 deployment
  const S3_BUCKET_URL = 'https://your-bucket-name.s3.amazonaws.com';
  const LOCAL_REPORTS_URL = '/reports.json'; // Place in public folder
  const REPORTS_JSON_URL = USE_LOCAL_JSON ? LOCAL_REPORTS_URL : `${S3_BUCKET_URL}/reports.json`;

  // Load reports data from S3
  useEffect(() => {
    const loadReportsData = async () => {
      try {
        setLoading(true);
        const response = await fetch(REPORTS_JSON_URL);
        
        if (!response.ok) {
          throw new Error(`Failed to load reports data: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setReportsData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error loading reports data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadReportsData();
  }, [REPORTS_JSON_URL]);

  // Handle project selection
  const handleProjectChange = (e) => {
    const project = e.target.value;
    setSelectedProject(project);
    setSelectedDate('');
    setSelectedReport('');
    setReportUrl('');
  };

  // Handle date selection - now works with date picker
  const handleDateChange = (e) => {
    const date = e.target.value;
    setSelectedDate(date);
    setSelectedReport('');
    setReportUrl('');
  };

  // Handle report selection
  const handleReportChange = (e) => {
    const report = e.target.value;
    setSelectedReport(report);
    
    if (report && selectedProject && selectedDate) {
      let url;
      if (USE_LOCAL_JSON) {
        // For local demo, use a placeholder or local path
        url = `/demo-reports/${selectedProject}/${selectedDate}/${report}`;
      } else {
        // Production S3 URL
        url = `${S3_BUCKET_URL}/${selectedProject}/${selectedDate}/${report}`;
      }
      setReportUrl(url);
    } else {
      setReportUrl('');
    }
  };

  // Get available projects
  const getProjects = () => {
    return reportsData ? Object.keys(reportsData) : [];
  };

  // Get available dates for selected project (for validation)
  const getDates = () => {
    if (!reportsData || !selectedProject) return [];
    return Object.keys(reportsData[selectedProject] || {});
  };

  // Get available reports for selected project and date
  const getReports = () => {
    if (!reportsData || !selectedProject || !selectedDate) return [];
    return reportsData[selectedProject]?.[selectedDate] || [];
  };

  // Check if selected date has reports available
  const isDateValid = () => {
    if (!selectedDate || !selectedProject) return false;
    return getDates().includes(selectedDate);
  };

  // Get min and max dates for the date picker
  const getDateRange = () => {
    const availableDates = getDates();
    if (availableDates.length === 0) return { min: '', max: '' };
    
    const sortedDates = availableDates.sort();
    return {
      min: sortedDates[0],
      max: sortedDates[sortedDates.length - 1]
    };
  };

  // Custom dropdown component
  const Dropdown = ({ 
    id, 
    value, 
    onChange, 
    options, 
    placeholder, 
    disabled, 
    icon: Icon 
  }) => (
    <div className="dropdown-container">
      <div className="dropdown-icon">
        <Icon size={18} />
      </div>
      <select
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`dropdown-select ${disabled ? 'disabled' : ''}`}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown size={18} className="dropdown-chevron" />
    </div>
  );

  // Custom date picker component
  const DatePicker = ({ 
    id, 
    value, 
    onChange, 
    disabled, 
    icon: Icon,
    min,
    max
  }) => (
    <div className="datepicker-container">
      <div className="dropdown-icon">
        <Icon size={18} />
      </div>
      <input
        type="date"
        id={id}
        value={value}
        onChange={onChange}
        disabled={disabled}
        min={min}
        max={max}
        className={`datepicker-input ${disabled ? 'disabled' : ''} ${!isDateValid() && value ? 'invalid' : ''}`}
      />
    </div>
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-content">
          <Loader2 className="loading-spinner" size={48} />
          <p className="loading-text">Loading reports data...</p>
        </div>
      </div>
    );
  }

  const dateRange = getDateRange();

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-logo">
            <div className="logo-icon">
              <FileText size={24} color="white" />
            </div>
            <div className="logo-text">
              <h1>Report Viewer</h1>
              <p>View project reports</p>
            </div>
          </div>
        </div>
      </header>

      <div className="main-content">
        {error && (
          <div className="error-container">
            <div className="error-header">
              <AlertCircle size={20} />
              <h3>Error Loading Reports</h3>
            </div>
            <p className="error-message">{error}</p>
            <p className="error-hint">
              Make sure your S3 bucket is configured with proper CORS settings and the reports.json file exists.
            </p>
          </div>
        )}

        {/* Controls Panel */}
        <div className="controls-panel">
          <h2>Select Report</h2>
          
          <div className="controls-grid">
            {/* Project Selector */}
            <div className="control-group">
              <label htmlFor="project">Project</label>
              <Dropdown
                id="project"
                value={selectedProject}
                onChange={handleProjectChange}
                options={getProjects()}
                placeholder="Choose a project"
                disabled={!reportsData}
                icon={Folder}
              />
            </div>

            {/* Date Picker */}
            <div className="control-group">
              <label htmlFor="date">Date</label>
              <DatePicker
                id="date"
                value={selectedDate}
                onChange={handleDateChange}
                disabled={!selectedProject}
                icon={Calendar}
                min={dateRange.min}
                max={dateRange.max}
              />
              {selectedDate && !isDateValid() && (
                <p className="date-warning">
                  No reports available for this date. Available dates: {getDates().join(', ')}
                </p>
              )}
            </div>

            {/* Report Selector */}
            <div className="control-group">
              <label htmlFor="report">Report</label>
              <Dropdown
                id="report"
                value={selectedReport}
                onChange={handleReportChange}
                options={getReports()}
                placeholder="Choose a report"
                disabled={!selectedDate || !isDateValid()}
                icon={FileText}
              />
            </div>
          </div>

          {/* Selected Report Info */}
          {reportUrl && (
            <div className="selected-report-info">
              <p>
                <strong>Selected Report:</strong> {selectedReport}
              </p>
              <p className="report-url">{reportUrl}</p>
            </div>
          )}
        </div>

        {/* Report Viewer */}
        {reportUrl ? (
          <div className="report-viewer">
            <div className="report-viewer-header">
              <h3>Report Content</h3>
              <p>{selectedProject} • {selectedDate} • {selectedReport}</p>
            </div>
            <div className="report-iframe-container">
              <iframe
                src={reportUrl}
                title={`Report: ${selectedReport}`}
                className="report-iframe"
                sandbox="allow-scripts allow-same-origin"
                onError={() => {
                  console.error('Failed to load report iframe');
                }}
              />
            </div>
          </div>
        ) : (
          <div className="no-report-container">
            <div className="no-report-content">
              <FileText size={64} color="#ccc" />
              <h3>No Report Selected</h3>
              <p>Please select a project, date, and report to view the content.</p>
            </div>
          </div>
        )}

        {/* Status Info */}
        <div className="status-info">
          <div className="status-grid">
            <div className="status-item">
              <div className={`status-dot ${reportsData ? 'connected' : 'disconnected'}`} />
              <span>
                Data Source: {USE_LOCAL_JSON ? 'Local JSON' : 'S3 Bucket'} ({reportsData ? 'Connected' : 'Disconnected'})
              </span>
            </div>
            <div className="status-item">
              <div className={`status-dot ${getProjects().length > 0 ? 'connected' : 'inactive'}`} />
              <span>Projects: {getProjects().length}</span>
            </div>
            <div className="status-item">
              <div className={`status-dot ${reportUrl ? 'connected' : 'inactive'}`} />
              <span>Report: {reportUrl ? 'Loaded' : 'None'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;