import React, { useState, useCallback, useRef } from 'react';
import { Upload, Download, FileText, Fuel, Truck, Plus, Trash2, Edit3, Save, X, Camera, Image, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import * as XLSX from 'xlsx';

const TruckingSlipManager = () => {
  const [slips, setSlips] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadModal, setUploadModal] = useState(false);
  const [selectedSlipType, setSelectedSlipType] = useState('loading');
  const [ocrLoading, setOcrLoading] = useState(false);
  const [ocrResults, setOcrResults] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

  const slipTypes = [
    { value: 'loading', label: 'Loading Slip', icon: Truck, color: 'bg-blue-500' },
    { value: 'offloading', label: 'Offloading Slip', icon: FileText, color: 'bg-green-500' },
    { value: 'fuel', label: 'Fuel Slip', icon: Fuel, color: 'bg-orange-500' }
  ];

  // Mock OCR function - In real implementation, this would call an OCR service
  const performOCR = async (imageFile) => {
    setOcrLoading(true);
    
    // Simulate OCR processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock OCR results based on slip type
    const mockResults = {
      loading: {
        tripNumber: 'TRP-2024-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
        vehicleNumber: 'GP ' + Math.floor(Math.random() * 900 + 100) + ' ABC',
        driverName: ['John Doe', 'Mike Smith', 'Sarah Johnson', 'David Wilson'][Math.floor(Math.random() * 4)],
        amount: Math.floor(Math.random() * 5000 + 1000),
        quantity: Math.floor(Math.random() * 50 + 10),
        location: ['Johannesburg', 'Cape Town', 'Durban', 'Port Elizabeth'][Math.floor(Math.random() * 4)],
        date: new Date().toISOString().split('T')[0],
        confidence: Math.floor(Math.random() * 20 + 80)
      },
      offloading: {
        tripNumber: 'TRP-2024-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
        vehicleNumber: 'GP ' + Math.floor(Math.random() * 900 + 100) + ' XYZ',
        driverName: ['Peter Brown', 'Lisa White', 'Tom Green', 'Anna Black'][Math.floor(Math.random() * 4)],
        amount: Math.floor(Math.random() * 3000 + 500),
        quantity: Math.floor(Math.random() * 30 + 5),
        location: ['Pretoria', 'Bloemfontein', 'Kimberley', 'Nelspruit'][Math.floor(Math.random() * 4)],
        date: new Date().toISOString().split('T')[0],
        confidence: Math.floor(Math.random() * 20 + 85)
      },
      fuel: {
        tripNumber: 'TRP-2024-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
        vehicleNumber: 'GP ' + Math.floor(Math.random() * 900 + 100) + ' DEF',
        driverName: ['Chris Taylor', 'Emma Davis', 'Ryan Miller', 'Sophie Clark'][Math.floor(Math.random() * 4)],
        amount: Math.floor(Math.random() * 2000 + 300),
        quantity: Math.floor(Math.random() * 100 + 20),
        location: ['Shell Station', 'BP Garage', 'Engen Stop', 'Total Fuel'][Math.floor(Math.random() * 4)],
        date: new Date().toISOString().split('T')[0],
        confidence: Math.floor(Math.random() * 15 + 85)
      }
    };
    
    setOcrLoading(false);
    return mockResults[selectedSlipType];
  };

  const handleImageUpload = useCallback(async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => setPreviewImage(e.target.result);
    reader.readAsDataURL(file);

    try {
      const ocrData = await performOCR(file);
      setOcrResults(ocrData);
    } catch (error) {
      console.error('OCR failed:', error);
      alert('Failed to process image. Please try again.');
    }
    
    event.target.value = '';
  }, [selectedSlipType]);

  const confirmOCRResults = () => {
    if (!ocrResults) return;
    
    // Validate required fields
    if (!ocrResults.tripNumber.trim() || !ocrResults.vehicleNumber.trim()) {
      alert('Please fill in at least the Trip Number and Vehicle Number before saving.');
      return;
    }
    
    const newSlip = {
      id: Date.now(),
      type: selectedSlipType,
      date: ocrResults.date,
      tripNumber: ocrResults.tripNumber.trim(),
      vehicleNumber: ocrResults.vehicleNumber.trim(),
      driverName: ocrResults.driverName.trim(),
      amount: ocrResults.amount,
      quantity: ocrResults.quantity,
      location: ocrResults.location.trim(),
      notes: ocrResults.notes || `OCR Confidence: ${ocrResults.confidence}%`,
      createdAt: new Date().toISOString(),
      ocrProcessed: true
    };
    
    setSlips([...slips, newSlip]);
    resetUploadModal();
    
    // Show success message
    alert(`${slipTypes.find(t => t.value === selectedSlipType)?.label} saved successfully!`);
  };

  const resetUploadModal = () => {
    setUploadModal(false);
    setOcrResults(null);
    setPreviewImage(null);
    setOcrLoading(false);
  };

  const addSlip = (type) => {
    const newSlip = {
      id: Date.now(),
      type,
      date: new Date().toISOString().split('T')[0],
      tripNumber: '',
      vehicleNumber: '',
      driverName: '',
      amount: 0,
      quantity: 0,
      location: '',
      notes: '',
      createdAt: new Date().toISOString()
    };
    setSlips([...slips, newSlip]);
    setEditingId(newSlip.id);
    setEditForm(newSlip);
  };

  const handleFileUpload = useCallback((event) => {
    const files = Array.from(event.target.files);
    
    files.forEach(file => {
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file.type === 'application/vnd.ms-excel') {
        
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const workbook = XLSX.read(e.target.result, { type: 'binary' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet);
            
            const importedSlips = data.map((row, index) => ({
              id: Date.now() + index,
              type: row.Type?.toLowerCase() || 'loading',
              date: row.Date || new Date().toISOString().split('T')[0],
              tripNumber: row['Trip Number'] || row.TripNumber || '',
              vehicleNumber: row['Vehicle Number'] || row.VehicleNumber || '',
              driverName: row['Driver Name'] || row.DriverName || '',
              amount: parseFloat(row.Amount) || 0,
              quantity: parseFloat(row.Quantity) || 0,
              location: row.Location || '',
              notes: row.Notes || '',
              createdAt: new Date().toISOString()
            }));
            
            setSlips(prev => [...prev, ...importedSlips]);
          } catch (error) {
            alert('Error reading Excel file. Please check the format.');
          }
        };
        reader.readAsBinaryString(file);
      }
    });
    
    event.target.value = '';
  }, []);

  const exportToExcel = () => {
    const exportData = slips.map(slip => ({
      'Slip Type': slipTypes.find(t => t.value === slip.type)?.label || slip.type,
      'Date': slip.date,
      'Trip Number': slip.tripNumber,
      'Vehicle Number': slip.vehicleNumber,
      'Driver Name': slip.driverName,
      'Amount': slip.amount,
      'Quantity': slip.quantity,
      'Location': slip.location,
      'Notes': slip.notes,
      'OCR Processed': slip.ocrProcessed ? 'Yes' : 'No',
      'Created At': new Date(slip.createdAt).toLocaleDateString()
    }));

    const summary = slipTypes.map(type => {
      const typeSlips = slips.filter(slip => slip.type === type.value);
      return {
        'Slip Type': type.label,
        'Total Count': typeSlips.length,
        'OCR Processed': typeSlips.filter(s => s.ocrProcessed).length,
        'Manual Entry': typeSlips.filter(s => !s.ocrProcessed).length,
        'Total Amount': typeSlips.reduce((sum, slip) => sum + slip.amount, 0),
        'Total Quantity': typeSlips.reduce((sum, slip) => sum + slip.quantity, 0)
      };
    });

    const workbook = XLSX.utils.book_new();
    
    const detailSheet = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(workbook, detailSheet, 'Slip Details');
    
    const summarySheet = XLSX.utils.json_to_sheet(summary);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
    
    const fileName = `Trucking_Slips_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const deleteSlip = (id) => {
    setSlips(slips.filter(slip => slip.id !== id));
  };

  const startEdit = (slip) => {
    setEditingId(slip.id);
    setEditForm({ ...slip });
  };

  const saveEdit = () => {
    setSlips(slips.map(slip => slip.id === editingId ? editForm : slip));
    setEditingId(null);
    setEditForm({});
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const filteredSlips = slips.filter(slip => {
    const matchesType = filterType === 'all' || slip.type === filterType;
    const matchesSearch = searchTerm === '' || 
      slip.tripNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slip.vehicleNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slip.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      slip.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const totalAmount = filteredSlips.reduce((sum, slip) => sum + slip.amount, 0);
  const totalQuantity = filteredSlips.reduce((sum, slip) => sum + slip.quantity, 0);
  const ocrProcessedCount = filteredSlips.filter(slip => slip.ocrProcessed).length;

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Trucking Slip Manager with OCR</h1>
          <p className="text-gray-600">Upload slip images for automatic scanning or manage entries manually</p>
        </div>

        {/* Actions Bar */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setUploadModal(true)}
                className="bg-indigo-500 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-600 transition-colors"
              >
                <Camera size={16} />
                Scan Slip Image
              </button>
              
              {slipTypes.map(type => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    onClick={() => addSlip(type.value)}
                    className={`${type.color} text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:opacity-90 transition-opacity`}
                  >
                    <Icon size={16} />
                    Add {type.label}
                  </button>
                );
              })}
            </div>
            
            <div className="flex gap-3">
              <label className="bg-purple-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-purple-600 transition-colors flex items-center gap-2">
                <Upload size={16} />
                Import Excel
                <input
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                  className="hidden"
                  multiple
                />
              </label>
              
              <button
                onClick={exportToExcel}
                disabled={slips.length === 0}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <Download size={16} />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* OCR Upload Modal */}
        {uploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">Scan Slip Image</h2>
                  <button
                    onClick={resetUploadModal}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Step 1: Select Slip Type */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    1. Select slip type:
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {slipTypes.map(type => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          onClick={() => setSelectedSlipType(type.value)}
                          className={`p-3 rounded-lg border-2 flex flex-col items-center gap-2 transition-colors ${
                            selectedSlipType === type.value
                              ? `${type.color} text-white border-transparent`
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <Icon size={20} />
                          <span className="text-sm font-medium">{type.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2: Upload Image */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    2. Upload slip image:
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Image size={48} className="mx-auto text-gray-400 mb-4" />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={ocrLoading}
                      className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-400 flex items-center gap-2 mx-auto"
                    >
                      {ocrLoading ? <Loader size={16} className="animate-spin" /> : <Upload size={16} />}
                      {ocrLoading ? 'Processing...' : 'Choose Image'}
                    </button>
                    <p className="text-sm text-gray-500 mt-2">
                      Supports JPG, PNG, HEIC formats
                    </p>
                  </div>
                </div>

                {/* Image Preview */}
                {previewImage && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Image preview:
                    </label>
                    <img
                      src={previewImage}
                      alt="Slip preview"
                      className="max-w-full h-48 object-contain rounded-lg border"
                    />
                  </div>
                )}

                {/* OCR Results */}
                {ocrResults && (
                  <div className="mb-6">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle size={16} className="text-green-500" />
                      <label className="block text-sm font-medium text-gray-700">
                        OCR Results (Confidence: {ocrResults.confidence}%) - Edit if needed:
                      </label>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium text-gray-600">Date:</label>
                          <input
                            type="date"
                            value={ocrResults.date}
                            onChange={(e) => setOcrResults({...ocrResults, date: e.target.value})}
                            className="w-full border rounded px-2 py-1 text-sm mt-1"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Trip Number:</label>
                          <input
                            type="text"
                            value={ocrResults.tripNumber}
                            onChange={(e) => setOcrResults({...ocrResults, tripNumber: e.target.value})}
                            className="w-full border rounded px-2 py-1 text-sm mt-1"
                            placeholder="Enter trip number"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Vehicle Number:</label>
                          <input
                            type="text"
                            value={ocrResults.vehicleNumber}
                            onChange={(e) => setOcrResults({...ocrResults, vehicleNumber: e.target.value})}
                            className="w-full border rounded px-2 py-1 text-sm mt-1"
                            placeholder="Enter vehicle number"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Driver Name:</label>
                          <input
                            type="text"
                            value={ocrResults.driverName}
                            onChange={(e) => setOcrResults({...ocrResults, driverName: e.target.value})}
                            className="w-full border rounded px-2 py-1 text-sm mt-1"
                            placeholder="Enter driver name"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Location:</label>
                          <input
                            type="text"
                            value={ocrResults.location}
                            onChange={(e) => setOcrResults({...ocrResults, location: e.target.value})}
                            className="w-full border rounded px-2 py-1 text-sm mt-1"
                            placeholder="Enter location"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Amount (R):</label>
                          <input
                            type="number"
                            value={ocrResults.amount}
                            onChange={(e) => setOcrResults({...ocrResults, amount: parseFloat(e.target.value) || 0})}
                            className="w-full border rounded px-2 py-1 text-sm mt-1"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium text-gray-600">Quantity:</label>
                          <input
                            type="number"
                            value={ocrResults.quantity}
                            onChange={(e) => setOcrResults({...ocrResults, quantity: parseFloat(e.target.value) || 0})}
                            className="w-full border rounded px-2 py-1 text-sm mt-1"
                            placeholder="0"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="text-sm font-medium text-gray-600">Notes:</label>
                          <textarea
                            value={ocrResults.notes || `OCR Confidence: ${ocrResults.confidence}%`}
                            onChange={(e) => setOcrResults({...ocrResults, notes: e.target.value})}
                            className="w-full border rounded px-2 py-1 text-sm mt-1"
                            rows="2"
                            placeholder="Additional notes..."
                          />
                        </div>
                      </div>
                      
                      {ocrResults.confidence < 90 && (
                        <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <AlertCircle size={16} className="text-yellow-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-yellow-800">Low Confidence Warning</p>
                            <p className="text-sm text-yellow-700">Please review the extracted data carefully before saving.</p>
                          </div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex gap-3 mt-4">
                      <button
                        onClick={confirmOCRResults}
                        className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                      >
                        <CheckCircle size={16} />
                        Save Entry
                      </button>
                      <button
                        onClick={() => {
                          setOcrResults(null);
                          setPreviewImage(null);
                        }}
                        className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Rescan Image
                      </button>
                      <button
                        onClick={resetUploadModal}
                        className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="font-medium text-gray-700">Filter:</label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                {slipTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-2 flex-1 max-w-md">
              <label className="font-medium text-gray-700">Search:</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Trip, Vehicle, Driver, Location..."
                className="border rounded-lg px-3 py-2 flex-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {slips.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="text-sm font-medium text-gray-600">Total Slips</h3>
              <p className="text-2xl font-bold text-gray-900">{filteredSlips.length}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="text-sm font-medium text-gray-600">OCR Processed</h3>
              <p className="text-2xl font-bold text-indigo-600">{ocrProcessedCount}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="text-sm font-medium text-gray-600">Total Amount</h3>
              <p className="text-2xl font-bold text-green-600">R {totalAmount.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="text-sm font-medium text-gray-600">Total Quantity</h3>
              <p className="text-2xl font-bold text-blue-600">{totalQuantity.toLocaleString()}</p>
            </div>
            <div className="bg-white rounded-lg shadow-sm border p-4">
              <h3 className="text-sm font-medium text-gray-600">Avg Amount</h3>
              <p className="text-2xl font-bold text-orange-600">
                R {filteredSlips.length > 0 ? Math.round(totalAmount / filteredSlips.length).toLocaleString() : 0}
              </p>
            </div>
          </div>
        )}

        {/* Slips Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {filteredSlips.length === 0 ? (
            <div className="p-12 text-center">
              <Camera size={48} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No slips found</h3>
              <p className="text-gray-500 mb-4">
                {slips.length === 0 
                  ? "Start by scanning a slip image or adding entries manually"
                  : "Try adjusting your filters or search terms"
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left p-4 font-medium text-gray-700">Type</th>
                    <th className="text-left p-4 font-medium text-gray-700">Date</th>
                    <th className="text-left p-4 font-medium text-gray-700">Trip #</th>
                    <th className="text-left p-4 font-medium text-gray-700">Vehicle</th>
                    <th className="text-left p-4 font-medium text-gray-700">Driver</th>
                    <th className="text-left p-4 font-medium text-gray-700">Amount</th>
                    <th className="text-left p-4 font-medium text-gray-700">Quantity</th>
                    <th className="text-left p-4 font-medium text-gray-700">Location</th>
                    <th className="text-left p-4 font-medium text-gray-700">Source</th>
                    <th className="text-left p-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSlips.map((slip) => {
                    const slipType = slipTypes.find(t => t.value === slip.type);
                    const Icon = slipType?.icon || FileText;
                    const isEditing = editingId === slip.id;
                    
                    return (
                      <tr key={slip.id} className="border-b hover:bg-gray-50">
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className={`p-1 rounded ${slipType?.color || 'bg-gray-500'}`}>
                              <Icon size={16} className="text-white" />
                            </div>
                            <span className="text-sm font-medium">{slipType?.label || slip.type}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          {isEditing ? (
                            <input
                              type="date"
                              value={editForm.date}
                              onChange={(e) => setEditForm({...editForm, date: e.target.value})}
                              className="w-full border rounded px-2 py-1 text-sm"
                            />
                          ) : (
                            slip.date
                          )}
                        </td>
                        <td className="p-4">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.tripNumber}
                              onChange={(e) => setEditForm({...editForm, tripNumber: e.target.value})}
                              className="w-full border rounded px-2 py-1 text-sm"
                              placeholder="Trip number"
                            />
                          ) : (
                            slip.tripNumber || '-'
                          )}
                        </td>
                        <td className="p-4">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.vehicleNumber}
                              onChange={(e) => setEditForm({...editForm, vehicleNumber: e.target.value})}
                              className="w-full border rounded px-2 py-1 text-sm"
                              placeholder="Vehicle number"
                            />
                          ) : (
                            slip.vehicleNumber || '-'
                          )}
                        </td>
                        <td className="p-4">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.driverName}
                              onChange={(e) => setEditForm({...editForm, driverName: e.target.value})}
                              className="w-full border rounded px-2 py-1 text-sm"
                              placeholder="Driver name"
                            />
                          ) : (
                            slip.driverName || '-'
                          )}
                        </td>
                        <td className="p-4">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editForm.amount}
                              onChange={(e) => setEditForm({...editForm, amount: parseFloat(e.target.value) || 0})}
                              className="w-full border rounded px-2 py-1 text-sm"
                              placeholder="0"
                            />
                          ) : (
                            `R ${slip.amount.toLocaleString()}`
                          )}
                        </td>
                        <td className="p-4">
                          {isEditing ? (
                            <input
                              type="number"
                              value={editForm.quantity}
                              onChange={(e) => setEditForm({...editForm, quantity: parseFloat(e.target.value) || 0})}
                              className="w-full border rounded px-2 py-1 text-sm"
                              placeholder="0"
                            />
                          ) : (
                            slip.quantity.toLocaleString()
                          )}
                        </td>
                        <td className="p-4">
                          {isEditing ? (
                            <input
                              type="text"
                              value={editForm.location}
                              onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                              className="w-full border rounded px-2 py-1 text-sm"
                              placeholder="Location"
                            />
                          ) : (
                            slip.location || '-'
                          )}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            {slip.ocrProcessed ? (
                              <>
                                <Camera size={14} className="text-indigo-500" />
                                <span className="text-xs text-indigo-600 font-medium">OCR</span>
                              </>
                            ) : (
                              <>
                                <Edit3 size={14} className="text-gray-500" />
                                <span className="text-xs text-gray-600 font-medium">Manual</span>
                              </>
                            )}
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-1">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={saveEdit}
                                  className="p-1 text-green-600 hover:bg-green-50 rounded"
                                  title="Save"
                                >
                                  <Save size={16} />
                                </button>
                                <button
                                  onClick={cancelEdit}
                                  className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                                  title="Cancel"
                                >
                                  <X size={16} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEdit(slip)}
                                  className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                                  title="Edit"
                                >
                                  <Edit3 size={16} />
                                </button>
                                <button
                                  onClick={() => deleteSlip(slip.id)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                  title="Delete"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TruckingSlipManager;