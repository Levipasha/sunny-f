import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RecordsTable from './RecordsTable';
import InventoryRecordService from '../services/inventoryRecordService';
import './MonthRecordsPage.css';

const MonthRecordsPage = () => {
  const navigate = useNavigate();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize with current month by default
  React.useEffect(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    setStartDate(firstDayOfMonth.toISOString().split('T')[0]);
    setEndDate(lastDayOfMonth.toISOString().split('T')[0]);
    
    console.log('🔍 Initialized with current month:', {
      startDate: firstDayOfMonth.toISOString().split('T')[0],
      endDate: lastDayOfMonth.toISOString().split('T')[0]
    });
  }, []);

  // Auto-fetch data when dates are set
  React.useEffect(() => {
    if (startDate && endDate && startDate !== endDate) {
      console.log('🔍 Auto-fetching data for initialized date range');
      fetchData();
    }
  }, [startDate, endDate]);

  const fetchData = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date cannot be after end date');
      return;
    }

    // Check if dates are the same
    if (startDate === endDate) {
      setError('Start date and end date cannot be the same. Please select a date range.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('🔍 Fetching records for date range:', startDate, 'to', endDate);
      
      // Ensure proper date formatting for the API
      const formattedStartDate = new Date(startDate);
      formattedStartDate.setHours(0, 0, 0, 0);
      
      const formattedEndDate = new Date(endDate);
      formattedEndDate.setHours(23, 59, 59, 999);
      
      console.log('🔍 Formatted dates for API:', {
        startDate: formattedStartDate.toISOString(),
        endDate: formattedEndDate.toISOString()
      });
      
      // Log the exact parameters being sent
      const apiParams = {
        startDate: formattedStartDate.toISOString(),
        endDate: formattedEndDate.toISOString(),
        limit: 10000
      };
      console.log('🔍 API Parameters:', apiParams);
      
      const response = await InventoryRecordService.getRecords(apiParams);
      
      console.log('🔍 API Response:', response);
      
      if (response.success) {
        setRecords(response.data || []);
        console.log(`✅ Successfully fetched ${response.data?.length || 0} records`);
      } else {
        setError(response.message || 'Failed to fetch records');
        console.error('❌ API returned error:', response);
      }
    } catch (err) {
      console.error('🔍 Fetch error:', err);
      setError('Error fetching records: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackClick = () => {
    navigate('/inventory-records');
  };

  const setQuickRange = (range) => {
    const today = new Date();
    const start = new Date();
    
    switch (range) {
      case 'week':
        start.setDate(today.getDate() - 7);
        break;
      case 'month':
        start.setMonth(today.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(today.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(today.getFullYear() - 1);
        break;
      default:
        return;
    }
    
    // Ensure we have different dates
    const startDateStr = start.toISOString().split('T')[0];
    const endDateStr = today.toISOString().split('T')[0];
    
    console.log('🔍 Setting quick range:', {
      range,
      startDate: startDateStr,
      endDate: endDateStr,
      startDateObj: start,
      endDateObj: today
    });
    
    setStartDate(startDateStr);
    setEndDate(endDateStr);
  };

  return (
    <div className="month-records-page">
      <div className="page-header">
        <button className="back-button" onClick={handleBackClick}>
          <i className="fas fa-arrow-left"></i>
          Back to Records
        </button>
        <h2 className="page-title">Month Wise Records</h2>
      </div>

      <div className="page-content">
        <div className="controls-section">
          <div className="date-controls">
            <div className="input-group">
              <label htmlFor="start-date">Start Date:</label>
              <input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="date-input"
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="end-date">End Date:</label>
              <input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="date-input"
              />
            </div>
            
            <button 
              onClick={fetchData} 
              className="show-button"
              disabled={loading || !startDate || !endDate}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  Loading...
                </>
              ) : (
                <>
                  <i className="fas fa-search"></i>
                  Show Records
                </>
              )}
            </button>
          </div>
          
          <div className="quick-ranges">
            <label>Quick Ranges:</label>
            <div className="range-buttons">
              <button onClick={() => setQuickRange('week')} className="range-btn">
                Last 7 Days
              </button>
              <button onClick={() => setQuickRange('month')} className="range-btn">
                Last Month
              </button>
              <button onClick={() => setQuickRange('quarter')} className="range-btn">
                Last 3 Months
              </button>
              <button onClick={() => setQuickRange('year')} className="range-btn">
                Last Year
              </button>
              <button 
                onClick={() => {
                  const today = new Date();
                  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                  setStartDate(firstDayOfMonth.toISOString().split('T')[0]);
                  setEndDate(lastDayOfMonth.toISOString().split('T')[0]);
                }} 
                className="range-btn current-month-btn"
              >
                Current Month
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <i className="fas fa-exclamation-triangle"></i>
            {error}
          </div>
        )}

        {records.length > 0 && (
          <div className="results-section">
            <div className="results-header">
              <h3>
                Records from {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}
              </h3>
              <span className="record-count">{records.length} records found</span>
            </div>
            <RecordsTable view="month" data={records} />
          </div>
        )}

        {!loading && startDate && endDate && records.length === 0 && !error && (
          <div className="no-records">
            <i className="fas fa-inbox"></i>
            <h3>No Records Found</h3>
            <p>No inventory records found for the selected date range.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MonthRecordsPage;
