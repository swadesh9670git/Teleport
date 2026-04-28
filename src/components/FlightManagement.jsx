import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Checkbox,
  Snackbar,
  Alert,
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Search as SearchIcon,
  Flight as FlightIcon,
  KeyboardArrowDown as ArrowDownIcon,
  CalendarToday as CalendarIcon,
  FilterAlt as FilterIcon,
} from '@mui/icons-material';
import { FixedSizeList as List, areEqual } from 'react-window';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import flightsData from '../data/flights.json';

dayjs.extend(isBetween);

const DAYS = [
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
  { label: 'Sun', value: 7 },
];

const BODY_TYPES = [
  { label: 'Narrow Body', value: 'narrow_body' },
  { label: 'Wide Body', value: 'wide_body' },
];
const STATUSES = ['Active', 'Inactive'];

// Optimized Row Component
const FlightRow = React.memo(({ data, index, style }) => {
  const {
    filteredFlights,
    selectedIds,
    handleSelect,
    editingId,
    savingId,
    failedId,
    editValues,
    setEditValues,
    saveEditing,
    cancelEditing,
    startEditing,
    handleDelete,
    handleToggleStatus
  } = data;

  const flight = filteredFlights[index];
  if (!flight) return null;

  const isEditing = editingId === flight.id;
  const isSaving = savingId === flight.id;
  const isFailed = failedId === flight.id;
  const isSelected = selectedIds.has(flight.id);

  // Day letters for the indicator
  const dayLetters = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <div
      style={{ ...style }}
      className={`d-flex align-items-center border-bottom px-3 transition-all gap-4 ${isSelected ? 'bg-light' : isFailed ? 'bg-danger bg-opacity-10' : ''
        }`}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = isSelected ? '#f1f5f9' : '#f8fafc'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isSelected ? '#f1f5f9' : 'transparent'}
    >
      <div style={{ width: '40px' }} className="ps-2 flex-shrink-0">
        <Checkbox
          size="small"
          checked={isSelected}
          onChange={() => handleSelect(flight.id)}
          disabled={isEditing || isSaving}
          sx={{ color: '#cbd5e1' }}
        />
      </div>

      <div style={{ width: '100px' }} className="flex-shrink-0">
        <span className="text-secondary small" style={{ fontSize: '0.8rem' }}>{flight.id}</span>
      </div>

      <div style={{ width: '105px' }} className="flex-shrink-0">
        <div className="badge rounded-pill border bg-white text-dark fw-bold" style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
          {flight.aoc}
        </div>
      </div>

      <div style={{ width: '80px' }} className="flex-shrink-0">
        <span className="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>{flight.flightNumber}</span>
      </div>

      <div style={{ width: '140px' }} className="flex-shrink-0">
        <span className="d-flex align-items-center gap-1 fw-medium" style={{ fontSize: '0.85rem' }}>
          {flight.origin} <FlightIcon sx={{ fontSize: 14, transform: 'rotate(90deg)', color: '#3b82f6' }} /> {flight.destination}
        </span>
      </div>

      <div style={{ width: '140px' }} className="flex-shrink-0">
        {isEditing ? (
          <div className="d-flex gap-1">
            <input
              className="form-control form-control-sm"
              style={{ width: '60px' }}
              value={editValues.std}
              onChange={(e) => setEditValues({ ...editValues, std: e.target.value })}
            />
            <input
              className="form-control form-control-sm"
              style={{ width: '60px' }}
              value={editValues.sta}
              onChange={(e) => setEditValues({ ...editValues, sta: e.target.value })}
            />
          </div>
        ) : (
          <span className="fw-semibold text-dark" style={{ fontSize: '0.8rem' }}>
            {flight.std} ➔ {flight.sta}
          </span>
        )}
      </div>

      <div style={{ width: '180px' }} className="flex-shrink-0">
        {isEditing ? (
          <div className="d-flex gap-1">
            <input
              type="date"
              className="form-control form-control-sm"
              style={{ width: '85px', fontSize: '0.7rem' }}
              value={editValues.startDate}
              onChange={(e) => setEditValues({ ...editValues, startDate: e.target.value })}
            />
            <input
              type="date"
              className="form-control form-control-sm"
              style={{ width: '85px', fontSize: '0.7rem' }}
              value={editValues.endDate}
              onChange={(e) => setEditValues({ ...editValues, endDate: e.target.value })}
            />
          </div>
        ) : (
          <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
            {flight.startDate} — {flight.endDate}
          </span>
        )}
      </div>

      <div style={{ width: '180px' }} className="d-flex gap-1 flex-shrink-0">
        {dayLetters.map((letter, i) => {
          const isActive = flight.daysOfOperation.includes(i + 1);
          return (
            <div
              key={i}
              className={`rounded-circle d-flex align-items-center justify-content-center fw-bold border ${isActive ? 'bg-primary text-white border-primary' : 'bg-light text-muted border-light-subtle'
                }`}
              style={{
                width: '20px',
                height: '20px',
                fontSize: '0.65rem'
              }}
            >
              {letter}
            </div>
          );
        })}
      </div>

      <div style={{ width: '100px' }} className="flex-shrink-0">
        <span className="text-muted small" style={{ fontSize: '0.8rem' }}>
          {flight.bodyType === 'wide_body' ? 'Wide' : 'Narrow'}
        </span>
      </div>

      <div className="flex-grow-1 d-flex align-items-center justify-content-end gap-4 pe-4">
        {isSaving ? (
          <div className="spinner-border spinner-border-sm text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        ) : isEditing ? (
          <div className="d-flex gap-2">
            <button className="btn btn-sm btn-link p-1 text-primary" onClick={() => saveEditing(flight.id)} title="Save">
              <SaveIcon style={{ fontSize: '18px' }} />
            </button>
            <button className="btn btn-sm btn-link p-1 text-danger" onClick={cancelEditing} title="Cancel">
              <CancelIcon style={{ fontSize: '18px' }} />
            </button>
          </div>
        ) : (
          <div className="d-flex align-items-center gap-4">
            <div className="d-flex align-items-center gap-2" style={{ minWidth: '100px' }}>
              <div className="form-check form-switch mb-0">
                <input
                  className="form-check-input cursor-pointer"
                  type="checkbox"
                  role="switch"
                  checked={flight.status === 'Active'}
                  onChange={() => handleToggleStatus(flight.id)}
                />
              </div>
              <span className={`fw-bold small ${flight.status === 'Active' ? 'text-success' : 'text-muted'}`} style={{ fontSize: '0.8rem' }}>
                {flight.status}
              </span>
            </div>
            <div className="d-flex align-items-center gap-1">
              <button className="btn btn-sm btn-link p-1 text-secondary" onClick={() => startEditing(flight)} title="Edit">
                <EditIcon style={{ fontSize: '16px' }} />
              </button>
              <button className="btn btn-sm btn-link p-1 text-danger" onClick={() => handleDelete(flight.id)} title="Delete">
                <DeleteIcon style={{ fontSize: '16px' }} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}, areEqual);

const FlightManagement = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [selectedDays, setSelectedDays] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [aocFilter, setAocFilter] = useState('');
  const [bodyTypeFilter, setBodyTypeFilter] = useState('');

  // Selection and Editing State
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [savingId, setSavingId] = useState(null);
  const [failedId, setFailedId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setFlights(flightsData.flights);
      setLoading(false);
    }, 800);
  }, []);

  const aocs = useMemo(() => {
    const uniqueAocs = [...new Set(flights.map(f => f.aoc))];
    return uniqueAocs.sort();
  }, [flights]);

  const filteredFlights = useMemo(() => {
    return flights.filter(flight => {
      // Search (AND logic starts here)
      const searchMatch = !search ||
        flight.flightNumber.toLowerCase().includes(search.toLowerCase()) ||
        flight.origin.toLowerCase().includes(search.toLowerCase()) ||
        flight.destination.toLowerCase().includes(search.toLowerCase());

      if (!searchMatch) return false;

      // Date Range Overlap
      if (fromDate || toDate) {
        const flightStart = dayjs(flight.startDate);
        const flightEnd = dayjs(flight.endDate);
        const rangeStart = fromDate ? dayjs(fromDate) : flightStart;
        const rangeEnd = toDate ? dayjs(toDate) : flightEnd;

        const overlaps = (flightStart.isBefore(rangeEnd) || flightStart.isSame(rangeEnd)) &&
          (flightEnd.isAfter(rangeStart) || flightEnd.isSame(rangeStart));
        if (!overlaps) return false;
      }

      // Days of Operation
      if (selectedDays.length > 0) {
        const hasDay = flight.daysOfOperation.some(day => selectedDays.includes(day));
        if (!hasDay) return false;
      }

      // Status
      if (statusFilter && flight.status !== statusFilter) return false;

      // AOC
      if (aocFilter && flight.aoc !== aocFilter) return false;

      // Body Type
      if (bodyTypeFilter && flight.bodyType !== bodyTypeFilter) return false;

      return true;
    });
  }, [flights, search, fromDate, toDate, selectedDays, statusFilter, aocFilter, bodyTypeFilter]);

  const handleClearFilters = () => {
    setSearch('');
    setFromDate(null);
    setToDate(null);
    setSelectedDays([]);
    setStatusFilter('');
    setAocFilter('');
    setBodyTypeFilter('');
  };

  const handleToggleStatus = useCallback((id) => {
    setFlights(prev => prev.map(f =>
      f.id === id ? { ...f, status: f.status === 'Active' ? 'Inactive' : 'Active' } : f
    ));
  }, []);

  const handleDelete = useCallback((id) => {
    setFlights(prev => prev.filter(f => f.id !== id));
    setSnackbar({ open: true, message: `Flight ${id} deleted`, severity: 'success' });
  }, []);

  const handleBulkDelete = () => {
    setFlights(prev => prev.filter(f => !selectedIds.has(f.id)));
    setSnackbar({ open: true, message: `${selectedIds.size} flights deleted`, severity: 'success' });
    setSelectedIds(new Set());
  };

  const handleSelect = useCallback((id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(new Set(filteredFlights.map(f => f.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const startEditing = useCallback((flight) => {
    setEditingId(flight.id);
    setEditValues({
      startDate: flight.startDate,
      endDate: flight.endDate,
      std: flight.std,
      sta: flight.sta,
      status: flight.status,
    });
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingId(null);
    setEditValues({});
  }, []);

  const saveEditing = useCallback(async (id) => {
    setSavingId(id);
    setFailedId(null);
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simulate random failure (10% chance)
    if (Math.random() < 0.1) {
      setSnackbar({ open: true, message: 'Server error: Failed to save flight changes.', severity: 'error' });
      setSavingId(null);
      setFailedId(id);
      return;
    }

    setFlights(prev => prev.map(f =>
      f.id === id ? { ...f, ...editValues } : f
    ));
    setEditingId(null);
    setSavingId(null);
    setFailedId(null);
    setSnackbar({ open: true, message: 'Flight updated successfully', severity: 'success' });
  }, [editValues]);

  // Pass necessary props to Row through data prop of react-window
  const itemData = useMemo(() => ({
    filteredFlights,
    selectedIds,
    handleSelect,
    editingId,
    savingId,
    failedId,
    editValues,
    setEditValues,
    saveEditing,
    cancelEditing,
    startEditing,
    handleDelete,
    handleToggleStatus
  }), [
    filteredFlights,
    selectedIds,
    handleSelect,
    editingId,
    savingId,
    failedId,
    editValues,
    saveEditing,
    cancelEditing,
    startEditing,
    handleDelete,
    handleToggleStatus
  ]);

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center min-vh-100 bg-light">
        <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <h6 className="text-secondary fw-medium">Loading Flight Data...</h6>
      </div>
    );
  }
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="container-fluid p-4 bg-light min-vh-100">
        <div className="card border-0 bg-transparent mb-4">
          {/* Header Section */}
          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-3">
                <div style={{
                  width: '40px',
                  height: '40px',
                  backgroundColor: '#3b82f6',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff'
                }}>
                  <FlightIcon sx={{ transform: 'rotate(90deg)' }} />
                </div>
                <div>
                  <h5 className="fw-bold mb-0 text-dark" style={{ lineHeight: 1.2 }}>
                    Teleport Ops
                  </h5>
                  <p className="text-muted small mb-0 fw-medium">
                    Flight Schedule Management
                  </p>
                </div>
              </div>

              <div className="d-flex align-items-center ms-auto">
                <div className="bg-white px-3 py-2 rounded-3 border d-flex align-items-center gap-2">
                  <span className="fw-bold text-dark small">
                    {filteredFlights.length}
                  </span>
                  <span className="text-muted small fw-medium">
                    Flights
                  </span>
                </div>
                {selectedIds.size > 0 && (
                  <button
                    className="btn btn-danger ms-3 rounded-3 fw-semibold shadow-sm"
                    onClick={handleBulkDelete}
                  >
                    <DeleteIcon className="me-2" style={{ fontSize: '18px' }} />
                    Delete ({selectedIds.size})
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Filter ,Search Section */}
          <div className="card border rounded-4 p-4 mb-4 bg-white"
            style={{ borderColor: "#d1d5db" }}>
            <div className="d-flex flex-column gap-4">
              {/* Top Row: Search and Filters */}
              <div className="d-flex align-items-center gap-3">
                <div style={{ width: '400px' }}>
                  <div className="input-group input-group-sm rounded-3 overflow-hidden border">
                    <span className="input-group-text bg-light border-0">
                      <SearchIcon sx={{ color: '#94a3b8', fontSize: 20 }} />
                    </span>
                    <input
                      type="text"
                      className="form-control border-0 bg-light py-2 text-secondary"
                      placeholder="Search flight #, origin, destination..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      style={{ fontSize: '16px' }}
                    />
                  </div>
                </div>

                <div className="flex-grow-1" />

                <div className="d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center gap-2">
                    <DatePicker
                      value={fromDate}
                      onChange={setFromDate}
                      slotProps={{
                        textField: {
                          size: 'small',
                          placeholder: 'From',
                          sx: {
                            width: 140,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '10px',
                              bgcolor: '#f8fafc',
                              height: '40px',
                              '& fieldset': { borderColor: '#e2e8f0' },
                            }
                          }
                        }
                      }}
                    />
                    <DatePicker
                      value={toDate}
                      onChange={setToDate}
                      slotProps={{
                        textField: {
                          size: 'small',
                          placeholder: 'To',
                          sx: {
                            width: 140,
                            '& .MuiOutlinedInput-root': {
                              borderRadius: '10px',
                              bgcolor: '#f8fafc',
                              height: '40px',
                              '& fieldset': { borderColor: '#e2e8f0' },
                            }
                          }
                        }
                      }}
                    />
                  </div>

                  <div className="d-flex align-items-center gap-2">
                    <select
                      className="form-select form-select-sm rounded-3 border-light-subtle bg-light text-secondary"
                      style={{ width: '130px', height: '40px', fontSize: '17px' }}
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="">All status</option>
                      {STATUSES.map(status => <option key={status} value={status}>{status}</option>)}
                    </select>

                    <select
                      className="form-select form-select-sm rounded-3 border-light-subtle bg-light text-secondary"
                      style={{ width: '120px', height: '40px', fontSize: '17px' }}
                      value={aocFilter}
                      onChange={(e) => setAocFilter(e.target.value)}
                    >
                      <option value="">All AOC</option>
                      {aocs.map(aoc => <option key={aoc} value={aoc}>{aoc}</option>)}
                    </select>

                    <select
                      className="form-select form-select-sm rounded-3 border-light-subtle bg-light text-secondary"
                      style={{ width: '130px', height: '40px', fontSize: '17px' }}
                      value={bodyTypeFilter}
                      onChange={(e) => setBodyTypeFilter(e.target.value)}
                    >
                      <option value="">All body</option>
                      {BODY_TYPES.map(type => <option key={type.value} value={type.value}>{type.label}</option>)}
                    </select>
                  </div>

                  <button
                    className="btn btn-link text-decoration-none text-secondary fw-medium d-flex align-items-center gap-2 p-0 px-2 small"
                    onClick={handleClearFilters}
                    style={{ fontSize: '17px' }}
                  >
                    <FilterIcon style={{ fontSize: '18px' }} />
                    Clear all
                  </button>
                </div>
              </div>

              {/* Bottom Row: Days of Operation */}
              <div className="d-flex align-items-center gap-3">
                <span className="text-secondary" style={{ fontSize: "17px", fontWeight: 500 }}>
                  Days of operation:
                </span>
                <div className="d-flex gap-2">
                  {DAYS.map((day) => {
                    const isActive = selectedDays.includes(day.value);
                    return (
                      <div
                        key={day.value}
                        onClick={() => {
                          setSelectedDays(prev =>
                            prev.includes(day.value)
                              ? prev.filter(d => d !== day.value)
                              : [...prev, day.value]
                          );
                        }}
                        className={`rounded-pill d-flex align-items-center justify-content-center fw-bold border transition-all cursor-pointer`}
                        style={{
                          padding: '4px 16px',
                          fontSize: '15px',
                          backgroundColor: isActive ? '#3b82f6' : '#fff',
                          color: isActive ? '#fff' : '#64748b',
                          borderColor: isActive ? '#3b82f6' : '#e2e8f0',
                          cursor: 'pointer'
                        }}
                      >
                        {day.label}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="card border rounded-4 p-4 mb-4 bg-white"
            style={{ borderColor: "#d1d5db" }}>
            {/* Header */}
            <div className="d-flex align-items-center px-3 py-3 bg-light border-bottom gap-4">
              <div style={{ width: '40px', marginLeft: '16px' }} className="flex-shrink-0">
                <div className="form-check mb-0">
                  <input
                    className="form-check-input cursor-pointer"
                    type="checkbox"
                    checked={filteredFlights.length > 0 && selectedIds.size === filteredFlights.length}
                    ref={el => {
                      if (el) el.indeterminate = selectedIds.size > 0 && selectedIds.size < filteredFlights.length;
                    }}
                    onChange={handleSelectAll}
                  />
                </div>
              </div>
              <div style={{ width: '100px' }} className="flex-shrink-0"><span className="small fw-bold text-secondary text-uppercase" style={{ fontSize: '14px' }}>ID</span></div>
              <div style={{ width: '80px' }} className="flex-shrink-0"><span className="small fw-bold text-secondary text-uppercase" style={{ fontSize: '14px' }}>AOC</span></div>
              <div style={{ width: '80px' }} className="flex-shrink-0"><span className="small fw-bold text-secondary text-uppercase" style={{ fontSize: '14px' }}>Flight</span></div>
              <div style={{ width: '140px' }} className="flex-shrink-0"><span className="small fw-bold text-secondary text-uppercase" style={{ fontSize: '14px' }}>Route</span></div>
              <div style={{ width: '140px' }} className="flex-shrink-0"><span className="small fw-bold text-secondary text-uppercase" style={{ fontSize: '14px' }}>STD ➔ STA</span></div>
              <div style={{ width: '180px' }} className="flex-shrink-0"><span className="small fw-bold text-secondary text-uppercase" style={{ fontSize: '14px' }}>Operational Period</span></div>
              <div style={{ width: '180px' }} className="flex-shrink-0"><span className="small fw-bold text-secondary text-uppercase" style={{ fontSize: '14px' }}>Days</span></div>
              <div style={{ width: '100px' }} className="flex-shrink-0"><span className="small fw-bold text-secondary text-uppercase" style={{ fontSize: '14px' }}>Body</span></div>
              <div className="flex-grow-1 d-flex align-items-center justify-content-end gap-4 pe-4">
                <div style={{ minWidth: '100px' }} className="text-start">
                  <span className="small fw-bold text-secondary text-uppercase" style={{ fontSize: '14px' }}>Status</span>
                </div>
                <div>
                  <span className="small fw-bold text-secondary text-uppercase" style={{ fontSize: '14px' }}>Action</span>
                </div>
              </div>
            </div>

            {filteredFlights.length === 0 ? (
              <div className="py-5 text-center">
                <h6 className="text-secondary mb-2">No Results Found</h6>
                <p className="text-muted small mb-0">Try adjusting your filters or search terms</p>
              </div>
            ) : (
              <List
                height={600}
                itemCount={filteredFlights.length}
                itemSize={64}
                width="100%"
                itemData={itemData}
              >
                {FlightRow}
              </List>
            )}

            {/* Footer Info */}
            <div className="p-4 border-top bg-light d-flex justify-content-end align-items-center">
              <span className="text-secondary">
                Showing {filteredFlights.length} of {flights.length} total flights
              </span>
            </div>
          </div>
        </div>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            variant="filled"
            sx={{ width: '100%', boxShadow: 3 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </LocalizationProvider>
  );
};

export default FlightManagement;
