import { useState, useEffect } from 'react';
import { RefreshCw, X, MapPin } from 'lucide-react';
import { supabase } from './lib/supabase';

interface Grievance {
  id: string;
  submitted_language: string;
  submitter_name: string | null;
  submitter_contact: string | null;
  location_text: string | null;
  latitude: number | null;
  longitude: number | null;
  location_method: string | null;
  content: string;
  category: string;
  urgency: string;
  status: string;
  created_at: string;
  updated_at: string;
}

function Dashboard() {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSamples, setLoadingSamples] = useState(false);
  const [sampleMessage, setSampleMessage] = useState<string | null>(null);

  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');
  const [filterName, setFilterName] = useState('');
  const [filterLocation, setFilterLocation] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterUrgency, setFilterUrgency] = useState('');
  const [filterDescription, setFilterDescription] = useState('');

  useEffect(() => {
    fetchGrievances();
  }, []);

  const fetchGrievances = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('grievances')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setGrievances(data || []);
    } catch (error) {
      console.error('Error fetching grievances:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getLocationDisplay = (grievance: Grievance) => {
    if (grievance.location_text) {
      return grievance.location_text;
    }
    if (grievance.latitude && grievance.longitude) {
      const lat = grievance.latitude.toFixed(4);
      const lon = grievance.longitude.toFixed(4);
      return `GPS: ${lat}, ${lon}`;
    }
    return 'N/A';
  };

  const getLocationMethodTooltip = (grievance: Grievance) => {
    if (grievance.location_method === 'browser_auto') {
      return 'GPS Captured';
    }
    if (grievance.location_method === 'manual') {
      return 'Manually Entered';
    }
    return '';
  };

  const getCategoryLabel = (category: string) => {
    const categoryMap: { [key: string]: string } = {
      environmental: 'Environmental',
      land_dispute: 'Land Dispute',
      labor_issue: 'Labor Issue',
      health_safety: 'Health & Safety',
      other: 'Other',
    };
    return categoryMap[category] || category;
  };

  const getUrgencyBadge = (urgency: string) => {
    const urgencyStyles: { [key: string]: string } = {
      high: 'bg-red-100 text-red-700 border-red-300',
      medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      low: 'bg-green-100 text-green-700 border-green-300',
    };
    const style = urgencyStyles[urgency] || 'bg-gray-100 text-gray-700 border-gray-300';
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${style}`}>
        {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
      </span>
    );
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const loadSampleData = async () => {
    setLoadingSamples(true);
    setSampleMessage(null);

    try {
      const now = new Date();
      const sampleGrievances = [
        {
          submitter_name: 'Thabo M.',
          location_text: 'Site 3 Processing Plant',
          latitude: -25.7461,
          longitude: 28.1881,
          content: 'Water contamination near processing plant affecting our village water supply. Children getting sick.',
          category: 'environmental',
          urgency: 'high',
          submitted_language: 'en',
          location_method: 'browser_auto',
          status: 'new',
          created_at: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          submitter_name: 'Sarah K.',
          location_text: 'Worker Camp B',
          latitude: null,
          longitude: null,
          content: 'Safety equipment shortage in underground section. No helmets for new workers.',
          category: 'health_safety',
          urgency: 'medium',
          submitted_language: 'en',
          location_method: 'manual',
          status: 'new',
          created_at: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          submitter_name: null,
          location_text: 'Village 2',
          latitude: -25.7523,
          longitude: 28.1965,
          content: 'Land compensation not received as promised six months ago. Need urgent resolution.',
          category: 'land_dispute',
          urgency: 'high',
          submitted_language: 'en',
          location_method: 'browser_auto',
          status: 'new',
          created_at: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          submitter_name: 'Piet V.',
          location_text: 'Terrein 5',
          latitude: null,
          longitude: null,
          content: 'Stof van ontploffings beïnvloed ons gewasgeskiedenis. Verlies van oeste.',
          category: 'environmental',
          urgency: 'medium',
          submitted_language: 'af',
          location_method: 'manual',
          status: 'new',
          created_at: new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          submitter_name: 'Joseph N.',
          location_text: 'Processing Area North',
          latitude: -25.7445,
          longitude: 28.1912,
          content: 'Wage discrepancies for contract workers. Some workers paid less than agreed rates.',
          category: 'labor_issue',
          urgency: 'medium',
          submitted_language: 'en',
          location_method: 'browser_auto',
          status: 'new',
          created_at: new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          submitter_name: 'Maria S.',
          location_text: 'Residential Zone C',
          latitude: -25.7489,
          longitude: 28.1834,
          content: 'Cracked walls in houses from blasting vibrations. Need structural assessment.',
          category: 'environmental',
          urgency: 'medium',
          submitted_language: 'en',
          location_method: 'browser_auto',
          status: 'new',
          created_at: new Date(now.getTime() - 20 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          submitter_name: null,
          location_text: 'Site 7',
          latitude: null,
          longitude: null,
          content: 'Discrimination in promotion processes. Local workers overlooked for skilled positions.',
          category: 'labor_issue',
          urgency: 'low',
          submitted_language: 'en',
          location_method: 'manual',
          status: 'new',
          created_at: new Date(now.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          submitter_name: 'Sipho D.',
          location_text: 'Village 4 Sacred Site',
          latitude: -25.7556,
          longitude: 28.2001,
          content: 'Sacred site damaged by new road construction. Community elders very concerned.',
          category: 'land_dispute',
          urgency: 'high',
          submitted_language: 'en',
          location_method: 'browser_auto',
          status: 'new',
          created_at: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          submitter_name: 'Anna B.',
          location_text: 'Kamp C',
          latitude: null,
          longitude: null,
          content: 'Onvoldoende toilet fasiliteite vir vroulike werkers. Sanitasie probleme.',
          category: 'health_safety',
          urgency: 'medium',
          submitted_language: 'af',
          location_method: 'manual',
          status: 'new',
          created_at: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          submitter_name: 'John M.',
          location_text: 'Mine Office Area',
          latitude: -25.7402,
          longitude: 28.1867,
          content: 'Noise pollution from 24-hour operations affecting sleep. Community health concern.',
          category: 'environmental',
          urgency: 'low',
          submitted_language: 'en',
          location_method: 'browser_auto',
          status: 'new',
          created_at: new Date(now.getTime() - 42 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          submitter_name: 'Grace N.',
          location_text: 'Village 1 Access Road',
          latitude: null,
          longitude: null,
          content: 'Access road damaged, emergency vehicles cannot reach community. Urgent repair needed.',
          category: 'other',
          urgency: 'high',
          submitted_language: 'en',
          location_method: 'manual',
          status: 'new',
          created_at: new Date(now.getTime() - 48 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          submitter_name: 'Daniel P.',
          location_text: 'Site 9 Training Center',
          latitude: null,
          longitude: null,
          content: 'Training program promised but not delivered. Workers need skills development.',
          category: 'labor_issue',
          urgency: 'low',
          submitted_language: 'en',
          location_method: 'manual',
          status: 'new',
          created_at: new Date(now.getTime() - 55 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      const { error } = await supabase
        .from('grievances')
        .insert(sampleGrievances);

      if (error) {
        throw error;
      }

      setSampleMessage('Sample data loaded!');
      await fetchGrievances();

      setTimeout(() => setSampleMessage(null), 3000);
    } catch (error) {
      console.error('Error loading sample data:', error);
      setSampleMessage('Error loading sample data');
      setTimeout(() => setSampleMessage(null), 3000);
    } finally {
      setLoadingSamples(false);
    }
  };

  const filteredGrievances = grievances.filter((grievance) => {
    const matchesDateFrom = !filterDateFrom || new Date(grievance.created_at) >= new Date(filterDateFrom);
    const matchesDateTo = !filterDateTo || new Date(grievance.created_at) <= new Date(filterDateTo + 'T23:59:59');
    const matchesName = !filterName || (grievance.submitter_name || 'Anonymous').toLowerCase().includes(filterName.toLowerCase());
    const matchesLocation = !filterLocation || getLocationDisplay(grievance).toLowerCase().includes(filterLocation.toLowerCase());
    const matchesCategory = !filterCategory || grievance.category === filterCategory;
    const matchesUrgency = !filterUrgency || grievance.urgency === filterUrgency;
    const matchesDescription = !filterDescription || grievance.content.toLowerCase().includes(filterDescription.toLowerCase());

    return matchesDateFrom && matchesDateTo && matchesName && matchesLocation && matchesCategory && matchesUrgency && matchesDescription;
  });

  const totalGrievances = filteredGrievances.length;
  const highUrgency = filteredGrievances.filter((g) => g.urgency === 'high').length;
  const mediumUrgency = filteredGrievances.filter((g) => g.urgency === 'medium').length;
  const lowUrgency = filteredGrievances.filter((g) => g.urgency === 'low').length;

  const categories = [
    { name: 'Environmental', value: 'environmental' },
    { name: 'Land Dispute', value: 'land_dispute' },
    { name: 'Labor Issue', value: 'labor_issue' },
    { name: 'Health & Safety', value: 'health_safety' },
    { name: 'Other', value: 'other' },
  ];

  const categoryCounts = categories.map((category) => ({
    name: category.name,
    value: category.value,
    count: filteredGrievances.filter((g) => g.category === category.value).length,
    percentage: totalGrievances > 0
      ? (filteredGrievances.filter((g) => g.category === category.value).length / totalGrievances) * 100
      : 0,
  }));

  const clearFilters = () => {
    setFilterDateFrom('');
    setFilterDateTo('');
    setFilterName('');
    setFilterLocation('');
    setFilterCategory('');
    setFilterUrgency('');
    setFilterDescription('');
  };

  const hasActiveFilters = filterDateFrom || filterDateTo || filterName || filterLocation || filterCategory || filterUrgency || filterDescription;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading grievances...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Grievance Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div
            className="bg-white rounded-lg shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-200"
            onClick={() => setFilterUrgency('')}
          >
            <div className="text-4xl font-bold text-gray-800">{totalGrievances}</div>
            <div className="text-gray-600 text-sm mt-2">Total Grievances</div>
            {filterUrgency === '' && hasActiveFilters && (
              <div className="mt-2 text-xs text-blue-600 font-medium">Active Filter</div>
            )}
          </div>

          <div
            className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setFilterUrgency('high')}
          >
            <div className="text-4xl font-bold text-red-600">{highUrgency}</div>
            <div className="text-gray-600 text-sm mt-2">High Urgency</div>
            {filterUrgency === 'high' && (
              <div className="mt-2 text-xs text-blue-600 font-medium">Active Filter</div>
            )}
          </div>

          <div
            className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setFilterUrgency('medium')}
          >
            <div className="text-4xl font-bold text-yellow-600">{mediumUrgency}</div>
            <div className="text-gray-600 text-sm mt-2">Medium Urgency</div>
            {filterUrgency === 'medium' && (
              <div className="mt-2 text-xs text-blue-600 font-medium">Active Filter</div>
            )}
          </div>

          <div
            className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setFilterUrgency('low')}
          >
            <div className="text-4xl font-bold text-green-600">{lowUrgency}</div>
            <div className="text-gray-600 text-sm mt-2">Low Urgency</div>
            {filterUrgency === 'low' && (
              <div className="mt-2 text-xs text-blue-600 font-medium">Active Filter</div>
            )}
          </div>
        </div>

        <div className="mt-8 max-w-xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Grievances by Category</h2>
            <div className="space-y-3">
              {categoryCounts.map((category) => (
                <div
                  key={category.name}
                  className="cursor-pointer hover:bg-gray-50 p-2 -mx-2 rounded transition-all duration-200"
                  onClick={() => setFilterCategory(filterCategory === category.value ? '' : category.value)}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-medium text-gray-700">{category.name}</span>
                    <span className="text-sm text-gray-600">{category.count}</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-4">
                    <div
                      className={`rounded-full h-4 transition-all duration-200 ${filterCategory === category.value ? 'bg-blue-600' : 'bg-purple-600'}`}
                      style={{ width: `${category.percentage}%` }}
                    ></div>
                  </div>
                  {filterCategory === category.value && (
                    <div className="text-xs text-blue-600 font-medium mt-1">Active Filter</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Recent Grievances</h2>
              <div className="flex gap-2">
                <button
                  onClick={loadSampleData}
                  disabled={loadingSamples}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {loadingSamples ? 'Loading samples...' : 'Load Sample Data'}
                </button>
                <button
                  onClick={fetchGrievances}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
              </div>
            </div>
            {sampleMessage && (
              <div className={`mb-4 p-3 rounded-md ${
                sampleMessage.includes('Error')
                  ? 'bg-red-50 border border-red-200 text-red-800'
                  : 'bg-green-50 border border-green-200 text-green-800'
              }`}>
                {sampleMessage}
              </div>
            )}

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-bold text-gray-700">Filters</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-medium"
                  >
                    <X className="w-3 h-3" />
                    Clear All
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Date From</label>
                  <input
                    type="date"
                    value={filterDateFrom}
                    onChange={(e) => setFilterDateFrom(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Date To</label>
                  <input
                    type="date"
                    value={filterDateTo}
                    onChange={(e) => setFilterDateTo(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
                  <input
                    type="text"
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    placeholder="Search name..."
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Location</label>
                  <input
                    type="text"
                    value={filterLocation}
                    onChange={(e) => setFilterLocation(e.target.value)}
                    placeholder="Search location..."
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Category</label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">All Categories</option>
                    <option value="environmental">Environmental</option>
                    <option value="land_dispute">Land Dispute</option>
                    <option value="labor_issue">Labor Issue</option>
                    <option value="health_safety">Health & Safety</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Urgency</label>
                  <select
                    value={filterUrgency}
                    onChange={(e) => setFilterUrgency(e.target.value)}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">All Urgencies</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div className="md:col-span-2 lg:col-span-3">
                  <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                  <input
                    type="text"
                    value={filterDescription}
                    onChange={(e) => setFilterDescription(e.target.value)}
                    placeholder="Search description..."
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Name</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Location</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Category</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Urgency</th>
                    <th className="px-4 py-3 text-left text-sm font-bold text-gray-700">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGrievances.map((grievance, index) => (
                    <tr key={grievance.id} className={`${index % 2 === 1 ? 'bg-gray-50' : ''} hover:bg-gray-100 transition-all duration-200`}>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {formatDate(grievance.created_at)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {grievance.submitter_name || 'Anonymous'}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        <div className="flex items-center gap-1" title={getLocationMethodTooltip(grievance)}>
                          {(grievance.latitude && grievance.longitude) && (
                            <MapPin className="w-3 h-3 text-blue-600" />
                          )}
                          <span className={grievance.latitude && grievance.longitude ? 'text-xs text-gray-600' : ''}>
                            {getLocationDisplay(grievance)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {getCategoryLabel(grievance.category)}
                      </td>
                      <td className="px-4 py-3">
                        {getUrgencyBadge(grievance.urgency)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {truncateText(grievance.content, 50)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredGrievances.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {hasActiveFilters ? 'No grievances match the current filters' : 'No grievances found'}
                </div>
              )}
              {filteredGrievances.length > 0 && (
                <div className="mt-4 text-sm text-gray-600 text-center">
                  Showing {filteredGrievances.length} of {grievances.length} total grievances
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
