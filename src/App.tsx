import { useState } from 'react';
import { MapPin, AlertCircle } from 'lucide-react';
import { supabase } from './lib/supabase';
import Dashboard from './Dashboard';

console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL)
console.log('Supabase key:', import.meta.env.VITE_SUPABASE_ANON_KEY?.slice(0,10) + '...')

interface Submission {
  name: string;
  contact: string;
  location_text: string;
  latitude: number | null;
  longitude: number | null;
  description: string;
  category: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
}

const translations = {
  English: {
    languageLabel: 'Language / Taal',
    name: 'Name',
    contact: 'Contact Information',
    location: 'Location',
    useLocation: 'Use My Current Location',
    description: 'Grievance Description',
    category: 'Category',
    submit: 'Submit Grievance',
    gettingLocation: 'Getting location...',
    locationCaptured: 'Location captured',
    locationDenied: 'Location access denied. Please enter manually.',
    optional: 'Optional',
    required: '*',
    selectCategory: 'Select a category',
    validationMessage: 'Please enter a grievance description',
    successMessage: 'Grievance submitted! Reference:',
    submitting: 'Submitting...',
    submitError: 'Error submitting grievance. Please try again.',
  },
  Afrikaans: {
    languageLabel: 'Language / Taal',
    name: 'Naam',
    contact: 'Kontakinligting',
    location: 'Ligging',
    useLocation: 'Gebruik My Huidige Ligging',
    description: 'Griewe Beskrywing',
    category: 'Kategorie',
    submit: 'Dien Griewe In',
    gettingLocation: 'Kry ligging...',
    locationCaptured: 'Ligging vasgevang',
    locationDenied: 'Ligging toegang geweier. Voer asseblief handmatig in.',
    optional: 'Opsioneel',
    required: '*',
    selectCategory: 'Kies \'n kategorie',
    validationMessage: 'Voer asseblief \'n griewe beskrywing in',
    successMessage: 'Griewe ingedien! Verwysing:',
    submitting: 'Dien in...',
    submitError: 'Fout met indiening van griewe. Probeer asseblief weer.',
  },
};

function App() {
  const [currentPage, setCurrentPage] = useState<'form' | 'dashboard'>('form');
  const [language, setLanguage] = useState<'English' | 'Afrikaans'>('English');
  const [name, setName] = useState('');
  const [contact, setContact] = useState('');
  const [locationText, setLocationText] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [locationStatus, setLocationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null);

  const t = translations[language];

  const detectUrgency = (text: string): 'LOW' | 'MEDIUM' | 'HIGH' => {
    const lowercaseText = text.toLowerCase();

    const highKeywords = ['urgent', 'emergency', 'danger', 'critical', 'immediate', 'sick', 'death', 'injury', 'dringend', 'noodgeval', 'gevaar'];
    const mediumKeywords = ['serious', 'problem', 'issue', 'concern', 'worried', 'ernstig', 'probleem', 'bekommerd'];

    if (highKeywords.some(keyword => lowercaseText.includes(keyword))) {
      return 'HIGH';
    }

    if (mediumKeywords.some(keyword => lowercaseText.includes(keyword))) {
      return 'MEDIUM';
    }

    return 'LOW';
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error');
      return;
    }

    setLocationStatus('loading');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = Number(position.coords.latitude.toFixed(4));
        const lon = Number(position.coords.longitude.toFixed(4));
        setLatitude(lat);
        setLongitude(lon);
        setLocationText(`GPS: ${lat}, ${lon}`);
        setLocationStatus('success');
        setTimeout(() => setLocationStatus('idle'), 3000);
      },
      () => {
        setLocationStatus('error');
        setTimeout(() => setLocationStatus('idle'), 3000);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      alert(t.validationMessage);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(null);

    try {
      const urgency = detectUrgency(description);

      let locationMethod: string | null = null;
      if (latitude !== null && longitude !== null) {
        locationMethod = 'browser_auto';
      } else if (locationText.trim()) {
        locationMethod = 'manual';
      }

      const { data, error } = await supabase
        .from('grievances')
        .insert([
          {
            submitted_language: language,
            submitter_name: name || null,
            submitter_contact: contact || null,
            location_text: locationText || null,
            latitude: latitude,
            longitude: longitude,
            location_method: locationMethod,
            content: description,
            category: category || 'other',
            urgency: urgency.toLowerCase(),
            status: 'new',
          },
        ])
        .select();

      if (error) {
        throw error;
      }

      const submittedId = data[0]?.id || 'UNKNOWN';
      setSubmitSuccess(`${t.successMessage} ${submittedId}`);

      const submission: Submission = {
        name,
        contact,
        location_text: locationText,
        latitude,
        longitude,
        description,
        category,
        urgency,
      };
      setSubmissions([...submissions, submission]);

      setName('');
      setContact('');
      setLocationText('');
      setLatitude(null);
      setLongitude(null);
      setDescription('');
      setCategory('');
      setLocationStatus('idle');

      setTimeout(() => setSubmitSuccess(null), 5000);
    } catch (error) {
      console.error('Error submitting grievance:', error);
      setSubmitError(t.submitError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <header className="bg-gradient-to-r from-purple-600 to-purple-800 text-white p-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <MapPin className="w-7 h-7" />
              Community Voice
            </h1>
            <p className="text-purple-100 text-sm mt-1">ESG Grievance Management</p>
          </div>
          <nav className="flex gap-2">
            <button
              onClick={() => setCurrentPage('form')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentPage === 'form'
                  ? 'bg-white text-purple-600 shadow-md'
                  : 'text-white hover:bg-purple-700 transition-all duration-200'
              }`}
            >
              Submit Grievance
            </button>
            <button
              onClick={() => setCurrentPage('dashboard')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                currentPage === 'dashboard'
                  ? 'bg-white text-purple-600 shadow-md'
                  : 'text-white hover:bg-purple-700 transition-all duration-200'
              }`}
            >
              Dashboard
            </button>
          </nav>
        </div>
      </header>

      {currentPage === 'dashboard' ? (
        <Dashboard />
      ) : (
        <div className="py-8 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Submit a Grievance</h2>
              <p className="text-gray-600 mb-6">Share your concerns confidentially and securely</p>

              {submitSuccess && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-800">
                  {submitSuccess}
                </div>
              )}

              {submitError && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
                  {submitError}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="language" className="block text-sm font-medium text-gray-700 mb-1">
                {t.languageLabel}
              </label>
              <select
                id="language"
                value={language}
                onChange={(e) => setLanguage(e.target.value as 'English' | 'Afrikaans')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
              >
                <option value="English">English</option>
                <option value="Afrikaans">Afrikaans</option>
              </select>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                {t.name} ({t.optional})
              </label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="contact" className="block text-sm font-medium text-gray-700 mb-1">
                {t.contact} ({t.optional})
              </label>
              <input
                type="text"
                id="contact"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                placeholder="Phone or email"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                {t.location} ({t.optional})
              </label>
              <input
                type="text"
                id="location"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
                placeholder="e.g., Site 3, Worker Camp, Village 2"
              />
              <p className="text-xs text-gray-500 mt-1">Share your precise location or describe the area</p>
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleGetLocation}
                  disabled={locationStatus === 'loading'}
                  className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-all duration-200 font-medium shadow-md"
                >
                  <MapPin className="w-5 h-5" />
                  {locationStatus === 'loading' ? t.gettingLocation : t.useLocation}
                </button>
                {locationStatus === 'success' && (
                  <span className="text-green-600 text-sm flex items-center gap-1">
                    ✓ {t.locationCaptured}
                  </span>
                )}
                {locationStatus === 'error' && (
                  <span className="text-red-600 text-sm flex items-center gap-1">
                    <AlertCircle size={16} />
                    {t.locationDenied}
                  </span>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                {t.description} <span className="text-red-500">{t.required}</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 resize-y"
                placeholder="Please describe your grievance in detail..."
              />
            </div>

            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                {t.category} ({t.optional})
              </label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all duration-200"
              >
                <option value="">{t.selectCategory}</option>
                <option value="Environmental">Environmental / Omgewing</option>
                <option value="Land Dispute">Land Dispute / Grondgeskil</option>
                <option value="Resettlement">Resettlement / Hervestiging</option>
                <option value="Labor Issue">Labor Issue / Arbeidskwessie</option>
                <option value="Health & Safety">Health & Safety / Gesondheid & Veiligheid</option>
                <option value="Asset Damage/Loss">Asset Damage/Loss / Bate Skade/Verlies</option>
                <option value="Access">Access / Toegang</option>
                <option value="Traffic">Traffic / Verkeer</option>
                <option value="Noise">Noise / Geraas</option>
                <option value="Other">Other / Ander</option>
              </select>
            </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:bg-purple-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                >
                  {isSubmitting ? t.submitting : t.submit}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <footer className="bg-gray-800 text-white text-center py-4 text-sm mt-8">
        <p>Community Voice &copy; 2025 - ESG Grievance Management for African Mining</p>
      </footer>
    </div>
  );
}

export default App;
