import { useState, useEffect } from 'react';
import { FileText, Plus, Trash2, Download, Printer, Save, Building, User, Mail, Phone, MapPin, Calendar, DollarSign, Hash, Edit3 } from 'lucide-react';

const InvoiceGenerator = () => {
  const [invoice, setInvoice] = useState({
    invoiceNumber: 'INV-001',
    issueDate: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'pending',
    currency: 'USD'
  });
  
  const [sender, setSender] = useState({
    companyName: 'Your Company Name',
    address: '123 Business Street\nCity, State 12345',
    email: 'billing@yourcompany.com',
    phone: '+1 (555) 123-4567',
    website: 'www.yourcompany.com'
  });
  
  const [client, setClient] = useState({
    name: 'Client Company Name',
    address: '456 Client Avenue\nCity, State 67890',
    email: 'accounts@clientcompany.com',
    phone: '+1 (555) 987-6543'
  });
  
  const [items, setItems] = useState([
    { id: 1, description: 'Web Development Services', quantity: 10, rate: 75, tax: 0 },
    { id: 2, description: 'UI/UX Design', quantity: 5, rate: 60, tax: 0 },
    { id: 3, description: 'Consulting Hours', quantity: 8, rate: 100, tax: 0 }
  ]);
  
  const [taxRate, setTaxRate] = useState(10);
  const [notes, setNotes] = useState('Thank you for your business! Payment is due within 30 days.');
  const [savedInvoices, setSavedInvoices] = useState([]);
  const [isEditingSender, setIsEditingSender] = useState(false);
  const [editSenderData, setEditSenderData] = useState({});

  // Sample saved invoices
  const sampleInvoices = [
    {
      id: 1,
      invoiceNumber: 'INV-2024-001',
      clientName: 'ABC Corporation',
      amount: 1850,
      issueDate: '2024-01-15',
      dueDate: '2024-02-14',
      status: 'paid'
    },
    {
      id: 2,
      invoiceNumber: 'INV-2024-002',
      clientName: 'XYZ Ltd',
      amount: 3200,
      issueDate: '2024-01-20',
      dueDate: '2024-02-19',
      status: 'pending'
    }
  ];

  // Initialize data
  useEffect(() => {
    const savedInvoiceData = localStorage.getItem('invoiceData');
    const savedInvoicesData = localStorage.getItem('savedInvoices');
    
    if (savedInvoiceData) {
      const data = JSON.parse(savedInvoiceData);
      setInvoice(data.invoice);
      setSender(data.sender);
      setClient(data.client);
      setItems(data.items);
      setTaxRate(data.taxRate);
      setNotes(data.notes);
    }
    
    if (savedInvoicesData) {
      setSavedInvoices(JSON.parse(savedInvoicesData));
    } else {
      setSavedInvoices(sampleInvoices);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    const invoiceData = {
      invoice,
      sender,
      client,
      items,
      taxRate,
      notes
    };
    localStorage.setItem('invoiceData', JSON.stringify(invoiceData));
    localStorage.setItem('savedInvoices', JSON.stringify(savedInvoices));
  }, [invoice, sender, client, items, taxRate, notes, savedInvoices]);

  // Calculations
  const calculateSubtotal = () => {
    return items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  };

  const calculateTax = () => {
    return (calculateSubtotal() * taxRate) / 100;
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  // Item management
  const addItem = () => {
    const newItem = {
      id: Date.now(),
      description: 'New Item',
      quantity: 1,
      rate: 0,
      tax: 0
    };
    setItems(prev => [...prev, newItem]);
  };

  const updateItem = (id, field, value) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: field === 'description' ? value : parseFloat(value) || 0 } : item
    ));
  };

  const removeItem = (id) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  // Save current invoice
  const saveInvoice = () => {
    const newSavedInvoice = {
      id: Date.now(),
      invoiceNumber: invoice.invoiceNumber,
      clientName: client.name,
      amount: calculateTotal(),
      issueDate: invoice.issueDate,
      dueDate: invoice.dueDate,
      status: invoice.status
    };
    
    setSavedInvoices(prev => [newSavedInvoice, ...prev]);
    alert('Invoice saved successfully!');
  };

  // Load saved invoice
  const loadInvoice = (savedInvoice) => {
    // In a real app, you would load the full invoice data
    setInvoice(prev => ({
      ...prev,
      invoiceNumber: savedInvoice.invoiceNumber,
      issueDate: savedInvoice.issueDate,
      dueDate: savedInvoice.dueDate,
      status: savedInvoice.status
    }));
    alert(`Loaded invoice ${savedInvoice.invoiceNumber}`);
  };

  // Delete saved invoice
  const deleteSavedInvoice = (id) => {
    setSavedInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  // Generate PDF (mock implementation)
  const generatePDF = () => {
    // In a real app, you would use a library like jsPDF or html2pdf
    const invoiceContent = document.getElementById('invoice-preview');
    alert('PDF generation would be implemented here. This is a preview of your invoice.');
    
    // Print functionality
    const originalContents = document.body.innerHTML;
    const printContents = invoiceContent.innerHTML;
    
    document.body.innerHTML = printContents;
    window.print();
    document.body.innerHTML = originalContents;
    window.location.reload();
  };

  // Start editing sender info
  const startEditingSender = () => {
    setIsEditingSender(true);
    setEditSenderData({ ...sender });
  };

  // Save sender info
  const saveSenderInfo = () => {
    setSender(editSenderData);
    setIsEditingSender(false);
  };

  // Cancel editing sender info
  const cancelEditSender = () => {
    setIsEditingSender(false);
    setEditSenderData({});
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: invoice.currency
    }).format(amount);
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      paid: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      overdue: 'bg-red-100 text-red-800',
      draft: 'bg-gray-100 text-gray-800'
    };
    return colors[status] || colors.draft;
  };

  return (
    <div className="max-w-7xl mx-auto bg-white p-8 rounded-xl shadow-2xl">
      <div className="flex items-center gap-3 mb-8">
        <FileText className="text-blue-600" size={32} />
        <h2 className="text-3xl font-bold text-gray-800">Invoice Generator</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Invoice Header */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Invoice Number
                </label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    value={invoice.invoiceNumber}
                    onChange={(e) => setInvoice(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Issue Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="date"
                      value={invoice.issueDate}
                      onChange={(e) => setInvoice(prev => ({ ...prev, issueDate: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Due Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="date"
                      value={invoice.dueDate}
                      onChange={(e) => setInvoice(prev => ({ ...prev, dueDate: e.target.value }))}
                      className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={invoice.status}
                  onChange={(e) => setInvoice(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  value={invoice.currency}
                  onChange={(e) => setInvoice(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD (C$)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sender & Client Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sender Information */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <Building className="text-blue-600" />
                  From
                </h3>
                <button
                  onClick={startEditingSender}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  <Edit3 size={16} />
                </button>
              </div>

              {isEditingSender ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editSenderData.companyName}
                    onChange={(e) => setEditSenderData(prev => ({ ...prev, companyName: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                    placeholder="Company Name"
                  />
                  <textarea
                    value={editSenderData.address}
                    onChange={(e) => setEditSenderData(prev => ({ ...prev, address: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                    placeholder="Address"
                  />
                  <input
                    type="email"
                    value={editSenderData.email}
                    onChange={(e) => setEditSenderData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                    placeholder="Email"
                  />
                  <input
                    type="text"
                    value={editSenderData.phone}
                    onChange={(e) => setEditSenderData(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                    placeholder="Phone"
                  />
                  <input
                    type="text"
                    value={editSenderData.website}
                    onChange={(e) => setEditSenderData(prev => ({ ...prev, website: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                    placeholder="Website"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={saveSenderInfo}
                      className="flex-1 px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                    >
                      Save
                    </button>
                    <button
                      onClick={cancelEditSender}
                      className="flex-1 px-3 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <div className="font-semibold text-gray-800">{sender.companyName}</div>
                  <div className="text-gray-600 whitespace-pre-line">{sender.address}</div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Mail size={14} />
                    {sender.email}
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <Phone size={14} />
                    {sender.phone}
                  </div>
                  {sender.website && (
                    <div className="text-blue-600">{sender.website}</div>
                  )}
                </div>
              )}
            </div>

            {/* Client Information */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User className="text-green-600" />
                Bill To
              </h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={client.name}
                  onChange={(e) => setClient(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Client Name"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                />
                <textarea
                  value={client.address}
                  onChange={(e) => setClient(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  placeholder="Client Address"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                />
                <input
                  type="email"
                  value={client.email}
                  onChange={(e) => setClient(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Client Email"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                />
                <input
                  type="text"
                  value={client.phone}
                  onChange={(e) => setClient(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="Client Phone"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="bg-white border-2 border-gray-200 rounded-xl">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-lg font-bold text-gray-800">Items & Services</h3>
              <button
                onClick={addItem}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
              >
                <Plus size={16} />
                Add Item
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Description</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Quantity</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Rate</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Amount</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', e.target.value)}
                          min="0"
                          step="1"
                          className="w-20 px-2 py-1 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <span className="text-gray-500 mr-1">{invoice.currency === 'USD' ? '$' : invoice.currency}</span>
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => updateItem(item.id, 'rate', e.target.value)}
                            min="0"
                            step="0.01"
                            className="w-24 px-2 py-1 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-800">
                        {formatCurrency(item.quantity * item.rate)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals and Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tax and Totals */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">{formatCurrency(calculateSubtotal())}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Tax:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      value={taxRate}
                      onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-20 px-2 py-1 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                    />
                    <span>%</span>
                    <span className="font-semibold">{formatCurrency(calculateTax())}</span>
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-bold text-gray-800">
                    <span>Total:</span>
                    <span>{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Notes</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                placeholder="Add any additional notes or terms..."
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={saveInvoice}
              className="flex-1 py-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition text-lg shadow-lg flex items-center justify-center gap-3"
            >
              <Save size={24} />
              Save Invoice
            </button>
            <button
              onClick={generatePDF}
              className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition text-lg shadow-lg flex items-center justify-center gap-3"
            >
              <Download size={24} />
              Download PDF
            </button>
            <button
              onClick={generatePDF}
              className="flex-1 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition text-lg shadow-lg flex items-center justify-center gap-3"
            >
              <Printer size={24} />
              Print
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Invoice Preview */}
          <div id="invoice-preview" className="bg-white border-2 border-gray-200 rounded-xl p-6">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Invoice Preview</h3>
            
            {/* Header */}
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-800">INVOICE</h2>
              <div className="flex justify-between items-center mt-2">
                <span className="text-gray-600">#{invoice.invoiceNumber}</span>
                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(invoice.status)}`}>
                  {invoice.status.toUpperCase()}
                </span>
              </div>
            </div>

            {/* From/To */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <div className="font-semibold text-gray-800 mb-1">From:</div>
                <div className="text-gray-600">{sender.companyName}</div>
                <div className="text-gray-600 whitespace-pre-line">{sender.address}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-800 mb-1">To:</div>
                <div className="text-gray-600">{client.name}</div>
                <div className="text-gray-600 whitespace-pre-line">{client.address}</div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
              <div>
                <div className="font-semibold text-gray-800">Issue Date:</div>
                <div className="text-gray-600">{new Date(invoice.issueDate).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="font-semibold text-gray-800">Due Date:</div>
                <div className="text-gray-600">{new Date(invoice.dueDate).toLocaleDateString()}</div>
              </div>
            </div>

            {/* Items Preview */}
            <div className="mb-6">
              <div className="font-semibold text-gray-800 mb-2">Items:</div>
              <div className="space-y-2 text-sm">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between">
                    <span>{item.description}</span>
                    <span>{formatCurrency(item.quantity * item.rate)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Totals */}
            <div className="border-t border-gray-200 pt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(calculateSubtotal())}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax ({taxRate}%):</span>
                <span>{formatCurrency(calculateTax())}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t border-gray-200 pt-2">
                <span>Total:</span>
                <span>{formatCurrency(calculateTotal())}</span>
              </div>
            </div>
          </div>

          {/* Saved Invoices */}
          <div className="bg-blue-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FileText className="text-blue-600" />
              Saved Invoices
            </h3>
            <div className="space-y-3">
              {savedInvoices.map(savedInv => (
                <div key={savedInv.id} className="bg-white p-3 rounded-lg border border-blue-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold text-gray-800">{savedInv.invoiceNumber}</div>
                      <div className="text-sm text-gray-600">{savedInv.clientName}</div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(savedInv.status)}`}>
                      {savedInv.status}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">
                      {new Date(savedInv.issueDate).toLocaleDateString()}
                    </span>
                    <span className="font-semibold text-gray-800">
                      {formatCurrency(savedInv.amount)}
                    </span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => loadInvoice(savedInv)}
                      className="flex-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition"
                    >
                      Load
                    </button>
                    <button
                      onClick={() => deleteSavedInvoice(savedInv.id)}
                      className="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-green-50 p-6 rounded-xl">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => {
                  setInvoice(prev => ({
                    ...prev,
                    invoiceNumber: `INV-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                    issueDate: new Date().toISOString().split('T')[0],
                    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    status: 'draft'
                  }));
                }}
                className="w-full p-3 bg-white hover:bg-green-100 border border-green-200 rounded-lg transition text-left"
              >
                <div className="font-semibold text-gray-800">New Invoice</div>
                <div className="text-sm text-gray-600">Create a fresh invoice template</div>
              </button>
              <button
                onClick={() => {
                  const itemsString = items.map(item => 
                    `${item.description}: ${item.quantity} × ${formatCurrency(item.rate)} = ${formatCurrency(item.quantity * item.rate)}`
                  ).join('\n');
                  const summary = `Subtotal: ${formatCurrency(calculateSubtotal())}\nTax: ${formatCurrency(calculateTax())}\nTotal: ${formatCurrency(calculateTotal())}`;
                  alert(`Invoice Summary:\n\n${itemsString}\n\n${summary}`);
                }}
                className="w-full p-3 bg-white hover:bg-green-100 border border-green-200 rounded-lg transition text-left"
              >
                <div className="font-semibold text-gray-800">View Summary</div>
                <div className="text-sm text-gray-600">See invoice calculations</div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="text-center p-4">
          <FileText className="mx-auto text-blue-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Professional Invoices</div>
          <div className="text-sm text-gray-600">Create polished invoices</div>
        </div>
        <div className="text-center p-4">
          <Save className="mx-auto text-green-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Save Templates</div>
          <div className="text-sm text-gray-600">Store and reuse invoices</div>
        </div>
        <div className="text-center p-4">
          <Download className="mx-auto text-purple-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Export PDF</div>
          <div className="text-sm text-gray-600">Download and print</div>
        </div>
        <div className="text-center p-4">
          <DollarSign className="mx-auto text-orange-600 mb-2" size={32} />
          <div className="font-semibold text-gray-800">Auto Calculations</div>
          <div className="text-sm text-gray-600">Automatic totals and tax</div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-8 p-6 bg-blue-50 rounded-lg">
        <h4 className="font-bold text-blue-900 mb-2">💡 Invoice Generation Tips:</h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Use clear, descriptive item names to avoid confusion</li>
          <li>• Set appropriate due dates based on your payment terms</li>
          <li>• Save invoice templates for recurring clients to save time</li>
          <li>• Include detailed notes about payment methods and terms</li>
          <li>• Regularly back up your saved invoices by exporting them</li>
        </ul>
      </div>
    </div>
  );
};

export default InvoiceGenerator;