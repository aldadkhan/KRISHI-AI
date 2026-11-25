import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import './i18n';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const DISTRICTS = [
  'Alappuzha', 'Ernakulam', 'Idukki', 'Kannur', 'Kasaragod', 'Kollam', 'Kottayam',
  'Kozhikode', 'Malappuram', 'Palakkad', 'Pathanamthitta', 'Thiruvananthapuram',
  'Thrissur', 'Wayanad'
];

const WEATHER_CODES = {
  0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
  45: 'Fog', 48: 'Depositing rime fog', 51: 'Light drizzle', 53: 'Drizzle',
  55: 'Dense drizzle', 56: 'Freezing drizzle', 57: 'Heavy freezing drizzle',
  61: 'Light rain', 63: 'Rain', 65: 'Heavy rain', 66: 'Freezing rain',
  67: 'Heavy freezing rain', 71: 'Light snowfall', 73: 'Snowfall',
  75: 'Heavy snowfall', 77: 'Snow grains', 80: 'Rain showers',
  81: 'Rain showers', 82: 'Heavy rain showers', 85: 'Snow showers',
  86: 'Heavy snow showers', 95: 'Thunderstorm', 96: 'Thunderstorm with hail',
  99: 'Thunderstorm with heavy hail'
};

function weatherDescription(code) {
  return WEATHER_CODES[code] || 'Forecast unavailable';
}

function App() {
  const { t, i18n } = useTranslation();
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [userRole, setUserRole] = useState(localStorage.getItem('role') || 'farmer');
  const [screen, setScreen] = useState('dashboard');
  const [returnScreen, setReturnScreen] = useState('dashboard');
  const [authMode, setAuthMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [registrationKey, setRegistrationKey] = useState('');
  const [message, setMessage] = useState('');
  const [question, setQuestion] = useState('');
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState('Banana');
  const [district, setDistrict] = useState('Ernakulam');
  const [advisory, setAdvisory] = useState(null);
  const [history, setHistory] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [schemeSearch, setSchemeSearch] = useState('');
  const [schemeScope, setSchemeScope] = useState('all');
  const [stats, setStats] = useState(null);
  const [weather, setWeather] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(true);
  const [weatherError, setWeatherError] = useState('');
  const [communityStats, setCommunityStats] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem('krishi-theme') || 'system');
  const [fontScale, setFontScale] = useState(localStorage.getItem('krishi-font-scale') || 'normal');

  useEffect(() => {
    axios.get(`${API}/public/stats`).then(({ data }) => setCommunityStats(data)).catch(() => {});
  }, [token]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.fontScale = fontScale;
    localStorage.setItem('krishi-theme', theme);
    localStorage.setItem('krishi-font-scale', fontScale);
  }, [theme, fontScale]);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('krishi-language');
    if (savedLanguage) i18n.changeLanguage(savedLanguage);
    const persistLanguage = language => localStorage.setItem('krishi-language', language);
    i18n.on('languageChanged', persistLanguage);
    return () => i18n.off('languageChanged', persistLanguage);
  }, [i18n]);

  useEffect(() => {
    let active = true;
    setWeatherLoading(true);
    setWeatherError('');

    axios.get(`${API}/weather`, { params: { district } })
      .then(({ data }) => {
        if (active) setWeather(data);
      })
      .catch(error => {
        if (active) {
          setWeatherError(error.response?.data?.message || 'Weather forecast is temporarily unavailable.');
        }
      })
      .finally(() => {
        if (active) setWeatherLoading(false);
      });

    return () => { active = false; };
  }, [district]);

  const requestLogin = (nextScreen, mode = 'login') => {
    setReturnScreen(nextScreen);
    setAuthMode(mode);
    setMessage('');
    setScreen('auth');
  };

  const requestAdvice = async authToken => {
    try {
      const payload = image ? new FormData() : { question, language: i18n.language, crop, district };
      if (image) {
        payload.append('question', question);
        payload.append('language', i18n.language);
        payload.append('crop', crop);
        payload.append('district', district);
        payload.append('image', image);
      }
      const { data } = await axios.post(
        `${API}/ai/query`,
        payload,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      setAdvisory(data);
      setMessage('');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to get an advisory right now.');
    }
  };

  const handleAuth = async event => {
    event.preventDefault();
    setMessage('');
    try {
      const endpoint = authMode === 'admin-register' ? 'admin/register' : authMode === 'register' ? 'register' : 'login';
      const payload = authMode === 'admin-register'
        ? { name, email, password, registrationKey }
        : authMode === 'register' ? { name, email, password } : { email, password };
      const { data } = await axios.post(`${API}/auth/${endpoint}`, payload);
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.farmer.role || 'farmer');
      setToken(data.token);
      setUserRole(data.farmer.role || 'farmer');
      setScreen(returnScreen);
      setPassword('');
      setRegistrationKey('');

      if (returnScreen === 'ask') await requestAdvice(data.token);
      if (returnScreen === 'history') await loadHistory(data.token);
      if (returnScreen === 'admin') await loadStats(data.token);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to sign in. Please try again.');
    }
  };

  const ask = async () => {
    if (!question.trim()) {
      setMessage('Describe your farming question before continuing.');
      return;
    }
    if (!token) {
      requestLogin('ask');
      return;
    }
    setScreen('ask');
    await requestAdvice(token);
  };

  const loadHistory = async (authToken = token) => {
    if (!authToken) {
      requestLogin('history');
      return;
    }
    try {
      const { data } = await axios.get(`${API}/ai/history`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setHistory(data);
      setScreen('history');
      setMessage('');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to load your query history.');
    }
  };

  const loadSchemes = async () => {
    setScreen('schemes');
    setSchemeSearch('');
    setSchemeScope('all');
    try {
      const { data } = await axios.get(`${API}/schemes`);
      setSchemes(data);
      setMessage('');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to load scheme information.');
    }
  };

  const loadStats = async (authToken = token) => {
    if (!authToken) {
      requestLogin('admin');
      return;
    }
    try {
      const { data } = await axios.get(`${API}/admin/stats`, {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      setStats(data);
      setScreen('admin');
      setMessage('');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to load analytics.');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
    setUserRole('farmer');
    setAdvisory(null);
    setScreen('dashboard');
    setMessage('You have been signed out.');
  };

  const navigate = id => {
    if (id === 'schemes') return loadSchemes();
    if (id === 'history') return loadHistory();
    if (id === 'admin') return loadStats();
    setScreen(id);
    setMessage('');
  };

  const visibleSchemes = useMemo(() => {
    const query = schemeSearch.trim().toLowerCase();
    return schemes.filter(scheme => {
      const matchesScope = schemeScope === 'all' || scheme.scope === schemeScope;
      const matchesQuery = `${scheme.scheme_name} ${scheme.department} ${scheme.description}`.toLowerCase().includes(query);
      return matchesScope && matchesQuery;
    });
  }, [schemes, schemeSearch, schemeScope]);

  if (screen === 'auth') {
    return (
      <AuthPage
        t={t}
        mode={authMode}
        setMode={setAuthMode}
        name={name}
        setName={setName}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        registrationKey={registrationKey}
        setRegistrationKey={setRegistrationKey}
        onSubmit={handleAuth}
        onBack={() => setScreen('dashboard')}
        message={message}
      />
    );
  }

  const navItems = [
    ['dashboard', '⌂', t('dashboard')],
    ['ask', '✳', t('ask')],
    ['weather', '☼', t('weather')],
    ['schemes', '▤', t('schemes')],
    ['history', '◷', t('history')],
    ...(userRole === 'admin' ? [['admin', '▥', 'Analytics']] : []),
    ['settings', '⚙', 'Settings']
  ];

  return (
    <div className="app-shell">
      <header className="topbar">
        <button className="brand-lockup" onClick={() => setScreen('dashboard')} aria-label="Krishi AI home">
          <span className="brand-mark">🌾</span>
          <span><strong>KRISHI AI</strong><small>Government Farmer Support Portal</small></span>
        </button>
        <div className="topbar-actions">
          <label className="language-picker" aria-label="Language">
            <span>◎</span>
            <select value={i18n.language} onChange={event => i18n.changeLanguage(event.target.value)}>
              <option value="en">English</option>
              <option value="ml">മലയാളം</option>
              <option value="kn">ಕನ್ನಡ</option>
            </select>
          </label>
          {token
            ? <button className="button button-outline top-auth" onClick={logout}>{t('logout')}</button>
            : <><button className="button button-quiet top-auth" onClick={() => requestLogin('dashboard')}>{t('login')}</button><button className="button button-dark top-auth" onClick={() => requestLogin('dashboard', 'register')}>Create farmer account <span>↗</span></button></>}
        </div>
      </header>

      <div className="workspace">
        <aside className="sidebar">
          <div className="sidebar-label">YOUR FARM DESK</div>
          <nav>
            {navItems.map(([id, icon, label]) => (
              <button key={id} className={`nav-item ${screen === id ? 'selected' : ''}`} onClick={() => navigate(id)}>
                <span className="nav-icon">{icon}</span><span>{label}</span>
                {id === 'schemes' && <span className="nav-arrow">↗</span>}
              </button>
            ))}
          </nav>
          <div className="sidebar-spacer" />
          <div className="help-card">
            <span className="help-icon">?</span>
            <strong>Need a hand?</strong>
            <p>Your local Agriculture Officer can help with crop-specific questions.</p>
            <a href="https://aims.kerala.gov.in/" target="_blank" rel="noreferrer">Find support <span>↗</span></a>
          </div>
          <div className="sidebar-foot"><span className="online-dot" /> Kerala Agriculture · Digital services</div>
        </aside>

        <main className="main-content">
          {screen === 'dashboard' && <Dashboard t={t} setScreen={setScreen} weather={weather} weatherLoading={weatherLoading} district={district} onSchemes={loadSchemes} farmers={communityStats?.registeredFarmers ?? '—'} question={question} setQuestion={setQuestion} ask={ask}/>}
          {screen === 'ask' && <Ask t={t} question={question} setQuestion={setQuestion} crop={crop} setCrop={setCrop} district={district} setDistrict={setDistrict} ask={ask} advisory={advisory} message={message} image={image} setImage={setImage} language={i18n.language}/>}
          {screen === 'weather' && <Weather district={district} setDistrict={setDistrict} weather={weather} loading={weatherLoading} error={weatherError}/>}
          {screen === 'schemes' && <Schemes schemes={visibleSchemes} search={schemeSearch} setSearch={setSchemeSearch} scope={schemeScope} setScope={setSchemeScope}/>}
          {screen === 'history' && <History history={history}/>}
          {screen === 'admin' && userRole === 'admin' && <Admin stats={stats}/>}
          {screen === 'settings' && <Settings theme={theme} setTheme={setTheme} fontScale={fontScale} setFontScale={setFontScale} language={i18n.language} setLanguage={i18n.changeLanguage}/>}
          {message && <div className="toast" role="status">{message}<button aria-label="Dismiss" onClick={() => setMessage('')}>×</button></div>}
        </main>
      </div>
    </div>
  );
}

function PageIntro({eyebrow, title, description, children}) {
  return (
    <div className="page-intro">
      <div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>
      {children}
    </div>
  );
}

function Dashboard({t, setScreen, weather, weatherLoading, district, onSchemes, farmers, question, setQuestion, ask}) {
  const current = weather?.current;
  return (
    <div className="page dashboard-page">
      <PageIntro eyebrow="KERALA FARMER SUPPORT" title="Ask Krishi AI" description="What is happening on your farm today? Get a practical, crop-aware starting point." />
      <section className="home-ask content-card">
        <label className="field" htmlFor="home-question"><span className="sr-only">Describe your farming question</span><textarea id="home-question" rows="3" value={question} onChange={event => setQuestion(event.target.value)} placeholder="Describe a crop issue, pest, soil concern or farming decision…" /></label>
        <div className="home-ask-footer"><span>Choose a crop and district for a more relevant advisory.</span><button className="button button-dark" onClick={ask}>Get started <span>↗</span></button></div>
      </section>
      <div className="section-heading"><div><span className="eyebrow">AT A GLANCE</span><h2>Today on your farm</h2></div><span className="updated-note">District forecast · {district}</span></div>
      <div className="overview-grid">
        <article className="overview-card farmer-count-card">
          <div className="overview-top"><span className="overview-icon farmer-icon">♧</span><span className="mini-label">KRISHI AI COMMUNITY</span></div>
          <div className="overview-value">{farmers}</div>
          <div className="overview-label">Farmer accounts on this platform</div>
          <small>Live Krishi AI registrations, not a statewide census.</small>
        </article>
        <article className="overview-card weather-summary">
          <div className="overview-top"><span className="overview-icon weather-icon">☀</span><span className="live-tag"><i/> LIVE</span></div>
          <div className="overview-value">{weatherLoading ? '—' : current ? `${Math.round(current.temperature_2m)}°` : '—'}</div>
          <div className="overview-label">{weatherLoading ? 'Loading forecast' : current ? weatherDescription(current.weather_code) : 'Forecast unavailable'}</div>
          <button className="text-link" onClick={() => setScreen('weather')}>Five-day forecast <span>→</span></button>
        </article>
        <article className="overview-card">
          <div className="overview-top"><span className="overview-icon crop-icon">✿</span><span className="mini-label">CROP GUIDANCE</span></div>
          <h3>Advice for your crops</h3><p>Get a practical starting point for the issue you are seeing in the field.</p>
          <button className="text-link" onClick={() => setScreen('ask')}>Ask a question <span>→</span></button>
        </article>
        <article className="overview-card">
          <div className="overview-top"><span className="overview-icon scheme-icon">▤</span><span className="mini-label">FARMER SUPPORT</span></div>
          <h3>Schemes & benefits</h3><p>Browse Kerala and central agriculture programmes with official links.</p>
          <button className="text-link" onClick={onSchemes}>Explore schemes <span>→</span></button>
        </article>
      </div>
      <div className="bottom-note"><span className="note-icon">✳</span><p><strong>Grounded in local conditions.</strong> Forecasts are for district centres; check your local advisory before making time-sensitive farm decisions.</p></div>
    </div>
  );
}

function Ask({t, question, setQuestion, crop, setCrop, district, setDistrict, ask, advisory, message, image, setImage, language}) {
  const [listening, setListening] = useState(false);
  const [voiceMessage, setVoiceMessage] = useState('');
  const recognitionRef = useRef(null);
  const imagePreview = useMemo(() => image ? URL.createObjectURL(image) : null, [image]);

  useEffect(() => () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
  }, [imagePreview]);

  const startVoiceInput = () => {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceMessage('Voice input is not supported by this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = language === 'ml' ? 'ml-IN' : language === 'kn' ? 'kn-IN' : 'en-IN';
    recognition.onresult = event => setQuestion(previous => `${previous}${previous ? ' ' : ''}${event.results[0][0].transcript}`);
    recognition.onerror = () => setVoiceMessage('Could not hear that clearly. Try again or type your question.');
    recognition.onend = () => {
      recognitionRef.current = null;
      setListening(false);
    };
    setVoiceMessage('');
    setListening(true);
    recognition.start();
  };

  const readAdvisory = () => {
    if (!advisory?.answer || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(advisory.answer);
    utterance.lang = language === 'ml' ? 'ml-IN' : language === 'kn' ? 'kn-IN' : 'en-IN';
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="page">
      <PageIntro eyebrow="CROP & FARM SUPPORT" title={t('ask')} description="Describe what you notice. Add your crop and district for a more relevant starting point."/>
      <div className="ask-layout">
        <section className="content-card ask-card">
          <div className="form-grid">
            <div className="field"><label htmlFor="crop">{t('crop')}</label><select id="crop" value={crop} onChange={event => setCrop(event.target.value)}>{['Banana','Rice','Coconut','Pepper','Rubber','Tomato'].map(item => <option key={item}>{item}</option>)}</select></div>
            <div className="field"><label htmlFor="district">{t('district')}</label><select id="district" value={district} onChange={event => setDistrict(event.target.value)}>{DISTRICTS.map(item => <option key={item}>{item}</option>)}</select></div>
          </div>
          <div className="field question-field"><label htmlFor="question">What is happening in your field?</label><textarea id="question" rows="6" value={question} onChange={event => setQuestion(event.target.value)} placeholder={t('question')}/><span className="field-hint">Share when it started and which part of the plant is affected.</span></div>
          <div className="ask-tools"><button type="button" className="button button-outline" onClick={startVoiceInput} aria-pressed={listening}>{listening ? '■ Stop listening' : '🎙 Speak question'}</button><label className="button button-outline upload-control">▧ Add photo<input type="file" accept="image/jpeg,image/png,image/webp" onChange={event => setImage(event.target.files?.[0] || null)} /></label>{image && <span className="image-name">{image.name}<button type="button" aria-label="Remove photo" onClick={() => setImage(null)}>×</button></span>}</div>
          {voiceMessage && <div className="field-hint" role="status">{voiceMessage}</div>}
          {image && <div className="image-preview"><img src={imagePreview} alt="Selected crop issue"/><span>Image attached. The demo AI does not diagnose images.</span></div>}
          <div className="ask-footer"><span className="privacy-note">🔒 Your question is saved to your account.</span><button className="button button-dark" onClick={ask}>{t('getAdvice')} <span>↗</span></button></div>
          {message && <div className="inline-message" role="alert">{message}</div>}
        </section>
        {advisory
          ? <section className="content-card advisory-card"><div className="advisory-heading"><span className="overview-icon crop-icon">✳</span><div><span className="eyebrow">YOUR ADVISORY</span><h2>Suggested next steps</h2></div><button className="button button-outline speak-button" onClick={readAdvisory} title="Read advisory aloud" aria-label="Read advisory aloud">🔊</button></div><p>{advisory.answer}</p>{advisory.imageNote && <div className="field-hint">{advisory.imageNote}</div>}<div className="confidence-line">AI confidence <strong>{advisory.confidence}%</strong></div>{advisory.needsOfficer && <div className="officer-note">For crop-specific diagnosis, please speak with your local Agriculture Officer.</div>}<small>Sources: {advisory.sources?.join(' ')}</small></section>
          : <aside className="guidance-card"><span className="guide-spark">✳</span><h3>A useful question includes</h3><ul><li>The crop and its growth stage</li><li>When the problem first appeared</li><li>Recent weather or field changes</li></ul><div className="guide-disclaimer">AI responses are general guidance, not a confirmed diagnosis or pesticide prescription.</div></aside>}
      </div>
    </div>
  );
}

function Weather({district, setDistrict, weather, loading, error}) {
  const daily = weather?.daily;
  return (
    <div className="page">
      <PageIntro eyebrow="LOCAL CONDITIONS" title="Weather for your district" description="A live forecast to help plan field work. Conditions can vary across the district.">
        <div className="district-picker"><label htmlFor="weather-district">DISTRICT</label><select id="weather-district" value={district} onChange={event => setDistrict(event.target.value)}>{DISTRICTS.map(item => <option key={item}>{item}</option>)}</select></div>
      </PageIntro>
      {error && <div className="inline-message" role="alert">{error}</div>}
      {loading && <div className="content-card loading-card">Getting the latest forecast for {district}…</div>}
      {!loading && weather && (
        <>
          <section className="forecast-hero">
            <div><span className="banner-kicker">CURRENT CONDITIONS · {district.toUpperCase()}</span><div className="current-temp">{Math.round(weather.current.temperature_2m)}<span>°C</span></div><h2>{weatherDescription(weather.current.weather_code)}</h2><p>Feels like {Math.round(weather.current.apparent_temperature)}° · Updated {new Date(weather.current.time).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'})}</p></div>
            <div className="weather-metrics"><div><span>HUMIDITY</span><strong>{weather.current.relative_humidity_2m}%</strong></div><div><span>WIND</span><strong>{Math.round(weather.current.wind_speed_10m)} <small>km/h</small></strong></div><div><span>RAINFALL NOW</span><strong>{weather.current.precipitation} <small>mm</small></strong></div></div>
            <div className="forecast-sun" aria-hidden="true">☼</div>
          </section>
          <div className="section-heading forecast-heading"><div><span className="eyebrow">THE DAYS AHEAD</span><h2>Five-day outlook</h2></div><span className="updated-note">Forecast · {weather.source}</span></div>
          <div className="forecast-grid">{daily.time.map((day,index)=><article className={`forecast-day ${index===0?'today':''}`} key={day}><span className="forecast-date">{index===0?'TODAY':new Date(`${day}T12:00:00`).toLocaleDateString('en-IN',{weekday:'short'})}</span><span className="forecast-symbol">{weatherSymbol(daily.weather_code[index])}</span><strong className="forecast-description">{weatherDescription(daily.weather_code[index])}</strong><div className="temp-range"><b>{Math.round(daily.temperature_2m_max[index])}°</b><span>{Math.round(daily.temperature_2m_min[index])}°</span></div><div className="rain-chance">☂ &nbsp;{daily.precipitation_probability_max[index] ?? 0}% rain chance</div></article>)}</div>
          <div className="bottom-note"><span className="note-icon">ⓘ</span><p>Forecast data from Open-Meteo. District-centre forecasts may differ from conditions at your farm. Check local IMD alerts before pesticide spraying or other weather-sensitive work.</p></div>
        </>
      )}
      {!loading && !weather && !error && <div className="content-card">No forecast is available at the moment.</div>}
    </div>
  );
}

function weatherSymbol(code) {
  if (code >= 95) return 'ϟ';
  if ([51,53,55,56,57,61,63,65,66,67,80,81,82].includes(code)) return '☂';
  if ([45,48,1,2,3].includes(code)) return '☁';
  return '☀';
}

function Schemes({schemes, search, setSearch, scope, setScope}) {
  return (
    <div className="page">
      <PageIntro eyebrow="KERALA & NATIONAL SUPPORT" title="Schemes for farmers" description="Explore agriculture support programmes and follow the official link for current eligibility and application dates."/>
      <div className="scheme-toolbar"><div><strong>{schemes.length}</strong><span> programmes & services</span></div><div className="scheme-filters"><select aria-label="Filter by government" value={scope} onChange={event => setScope(event.target.value)}><option value="all">All programmes</option><option value="kerala">Kerala Government</option><option value="central">Central Government</option></select><label className="search-box"><span>⌕</span><input aria-label="Search schemes" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search schemes"/></label></div></div>
      {schemes.length === 0
        ? <div className="empty-state">No schemes match that search. Try another name or crop.</div>
        : <div className="scheme-grid">{schemes.map((scheme,index)=><article className="scheme-card" key={scheme.id}><div className="scheme-card-top"><span className="scheme-number">{String(index+1).padStart(2,'0')}</span><span className={`scheme-scope ${scheme.scope==='kerala'?'state-scope':'national-scope'}`}>{scheme.scope==='kerala'?'KERALA GOVERNMENT':'CENTRAL GOVERNMENT'}</span></div><h2>{scheme.scheme_name}</h2><p>{scheme.description}</p><div className="scheme-detail"><strong>Who can apply</strong><span>{scheme.eligibility}</span></div><div className="scheme-detail"><strong>Support</strong><span>{scheme.benefits}</span></div><div className="scheme-source">{scheme.department}</div><a className="scheme-link" href={scheme.application_url} target="_blank" rel="noreferrer">Check official details <span>↗</span></a></article>)}</div>}
      <div className="bottom-note"><span className="note-icon">ⓘ</span><p>Scheme eligibility, covered crops, funding and application windows can change. Confirm the latest details with the official portal or your local Agriculture Office before applying.</p></div>
    </div>
  );
}

function AuthPage({t, mode, setMode, name, setName, email, setEmail, password, setPassword, registrationKey, setRegistrationKey, onSubmit, onBack, message}) {
  const isRegister = mode === 'register' || mode === 'admin-register';
  const isAdminRegister = mode === 'admin-register';
  return (
    <div className="auth-page">
      <button className="auth-back" onClick={onBack}>← <span>Back to Krishi AI</span></button>
      <div className="auth-layout">
        <section className="auth-story"><div className="brand-lockup auth-brand"><span className="brand-mark">🌾</span><span><strong>KRISHI AI</strong><small>Government Farmer Support Portal</small></span></div><div className="auth-story-copy"><span className="banner-kicker">ROOTED IN YOUR COMMUNITY</span><h1>Better farming<br/>starts with <em>good support.</em></h1><p>Local weather, helpful crop guidance and trusted links to farmer support — all in one place.</p></div><div className="auth-story-foot"><span className="online-dot"/>Built for farmers across Kerala</div><div className="auth-orbit orbit-one"/><div className="auth-orbit orbit-two"/></section>
        <section className="auth-panel"><div className="auth-form-wrap"><span className="eyebrow">{isAdminRegister?'ADMINISTRATION':isRegister?'GET STARTED':'WELCOME BACK'}</span><h2>{isAdminRegister?'Create administrator account':isRegister?'Create farmer account':'Sign in to your account'}</h2><p>{isAdminRegister?'Administrator access requires the setup key.':isRegister?'Join the Krishi AI farmer community.':'Pick up where you left off on your farm desk.'}</p><div className="auth-switch"><button type="button" className={!isRegister?'active':''} onClick={() => setMode('login')}>{t('login')}</button><button type="button" className={mode==='register'?'active':''} onClick={() => setMode('register')}>Create farmer account</button></div>{mode!=='admin-register'&&<button type="button" className="text-link admin-register-link" onClick={() => setMode('admin-register')}>Register administrator</button>}<form onSubmit={onSubmit} className="auth-form">{isRegister&&<div className="field"><label htmlFor="auth-name">{t('yourName')}</label><input id="auth-name" autoComplete="name" value={name} onChange={event => setName(event.target.value)} placeholder="e.g. Anjali Krishnan" required minLength={2} maxLength={150}/></div>}<div className="field"><label htmlFor="auth-email">{t('email')}</label><input id="auth-email" type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" required maxLength={150}/></div><div className="field"><label htmlFor="auth-password">{t('password')}</label><input id="auth-password" type="password" autoComplete={isRegister?'new-password':'current-password'} value={password} onChange={event => setPassword(event.target.value)} placeholder={isRegister?'At least 8 characters':'Enter your password'} required minLength={isRegister?8:1} maxLength={72}/></div>{isAdminRegister&&<div className="field"><label htmlFor="admin-key">Administrator setup key</label><input id="admin-key" type="password" autoComplete="off" value={registrationKey} onChange={event => setRegistrationKey(event.target.value)} required/></div>}{message&&<div className="inline-message" role="alert">{message}</div>}<button className="button button-dark auth-submit" type="submit">{isAdminRegister?'Create administrator':isRegister?'Create farmer account':t('login')} <span>↗</span></button></form><div className="auth-assurance">🔒 &nbsp;Your account and farm questions stay private.</div></div><div className="auth-mobile-foot">An agricultural information service · Kerala</div></section>
      </div>
    </div>
  );
}

function History({history}) {
  return <div className="page"><PageIntro eyebrow="YOUR FARM DESK" title="Query history" description="Questions and advisories you've saved."/><div className="history-list">{history.length===0?<div className="empty-state">Your saved questions will appear here after you request an advisory.</div>:history.map(item=><article className="history-card" key={item.id}><span className="history-date">{new Date(item.created_at).toLocaleString()}</span><strong>{item.crop} · {item.district}</strong><p>{item.query_text}</p><div className="history-answer">{item.ai_response}</div></article>)}</div></div>;
}

function Admin({stats}) {
  const [reportSearch, setReportSearch] = useState('');
  const [reportDistrict, setReportDistrict] = useState('all');
  if (!stats) return <div className="page"><div className="content-card loading-card">Loading analytics…</div></div>;
  const query = reportSearch.trim().toLowerCase();
  const reports = stats.queryRecords.filter(record => {
    const matchesDistrict = reportDistrict === 'all' || record.district === reportDistrict;
    const searchable = [record.farmer_name, record.identifier, record.crop, record.district, record.query_text, record.ai_response, record.status].join(' ').toLowerCase();
    return matchesDistrict && searchable.includes(query);
  });
  const data = stats.districts.map(item => ({name:item.district,queries:item.count}));
  const exportReports = () => {
    const columns = ['Date', 'Farmer', 'Email', 'Crop', 'District', 'Status', 'Confidence', 'Question', 'AI suggestion'];
    const quote = value => {
      const text = String(value ?? '');
      const safeText = /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
      return `"${safeText.replace(/"/g, '""')}"`;
    };
    const rows = reports.map(record => [
      record.created_at,
      record.farmer_name,
      record.identifier,
      record.crop,
      record.district,
      record.status,
      record.confidence,
      record.query_text,
      record.ai_response
    ]);
    const csv = [columns, ...rows].map(row => row.map(quote).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], {type: 'text/csv;charset=utf-8'}));
    const link = document.createElement('a');
    link.href = url;
    link.download = `krishi-ngo-reports-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const districts = [...new Set(stats.queryRecords.map(record => record.district).filter(Boolean))].sort();
  return <div className="page"><PageIntro eyebrow="DEMO NGO · REPORTING" title="Community impact reports" description="Review farmer activity, advisory outcomes and district-level reports across the demo programme."/><div className="stat-grid"><StatCard label="Farmers" value={stats.farmers}/><StatCard label="Queries" value={stats.queries}/><StatCard label="Answered" value={stats.answered}/><StatCard label="Referred for follow-up" value={stats.escalated}/></div><section className="content-card chart-card"><h2>Questions by district</h2><ResponsiveContainer width="100%" height={320}><BarChart data={data}><XAxis dataKey="name"/><YAxis/><Tooltip/><Bar dataKey="queries" fill="#28714f" radius={[5,5,0,0]}/></BarChart></ResponsiveContainer></section><section className="admin-data-section"><div className="section-heading"><div><span className="eyebrow">REGISTERED USERS</span><h2>Farmer accounts</h2></div><span className="updated-note">{stats.farmerAccounts.length} accounts</span></div><div className="table-wrap"><table className="data-table"><thead><tr><th>Farmer</th><th>Email / identifier</th><th>District</th><th>Joined</th></tr></thead><tbody>{stats.farmerAccounts.map(farmer=><tr key={farmer.id}><td>{farmer.name || 'OTP farmer'}</td><td>{farmer.email || farmer.identifier}</td><td>{farmer.district || '—'}</td><td>{new Date(farmer.created_at).toLocaleString()}</td></tr>)}</tbody></table>{stats.farmerAccounts.length===0&&<div className="empty-state">No farmer accounts yet.</div>}</div></section><section className="admin-data-section"><div className="section-heading report-heading"><div><span className="eyebrow">ADVISORY RECORDS</span><h2>Questions and suggestions</h2><span className="updated-note">{reports.length} of {stats.queryRecords.length} reports</span></div><button className="button button-dark" onClick={exportReports} disabled={reports.length===0}>Export reports <span>↓</span></button></div><div className="report-filters"><label className="search-box"><span>⌕</span><input aria-label="Search reports" value={reportSearch} onChange={event => setReportSearch(event.target.value)} placeholder="Search reports, crops, farmers…"/></label><select aria-label="Filter reports by district" value={reportDistrict} onChange={event => setReportDistrict(event.target.value)}><option value="all">All districts</option>{districts.map(district=><option key={district} value={district}>{district}</option>)}</select></div><div className="admin-query-list">{reports.map(record=><article className="admin-query" key={record.id}><div className="admin-query-meta"><strong>{record.farmer_name || record.identifier}</strong><span>{record.crop || 'Crop not set'} · {record.district || 'District not set'} · {new Date(record.created_at).toLocaleString()}</span></div><div className="report-status-row"><span className={`report-status ${record.status === 'answered' ? 'status-answered' : 'status-followup'}`}>{record.status === 'answered' ? 'Answered' : 'Follow-up recommended'}</span><span>{record.confidence}% confidence</span></div><div className="admin-query-problem"><span>QUESTION</span><p>{record.query_text}</p></div><div className="admin-query-answer"><span>AI SUGGESTION</span><p>{record.ai_response}</p></div></article>)}{reports.length===0&&<div className="empty-state">No reports match your search. Clear the search or choose another district.</div>}</div></section></div>;
}

function StatCard({label,value}) { return <article className="stat-card"><span>{label}</span><strong>{value}</strong></article>; }

function Settings({theme, setTheme, fontScale, setFontScale, language, setLanguage}) {
  return <div className="page"><PageIntro eyebrow="PREFERENCES & SUPPORT" title="Settings" description="Adjust how Krishi AI appears and find farmer support contacts."/><section className="content-card settings-card"><div className="setting-row"><div><h2>Appearance</h2><p>Choose light, dark or follow your device setting.</p></div><div className="segmented-control" role="group" aria-label="Color theme">{[['light','Light'],['dark','Dark'],['system','Default']].map(([value,label])=><button type="button" key={value} className={theme===value?'selected':''} aria-pressed={theme===value} onClick={()=>setTheme(value)}>{label}</button>)}</div></div><div className="setting-row"><div><h2>Text size</h2><p>Make labels and reading areas easier to see.</p></div><div className="segmented-control" role="group" aria-label="Text size"><button type="button" className={fontScale==='normal'?'selected':''} aria-pressed={fontScale==='normal'} onClick={()=>setFontScale('normal')}>Standard</button><button type="button" className={fontScale==='large'?'selected':''} aria-pressed={fontScale==='large'} onClick={()=>setFontScale('large')}>Large</button></div></div><div className="setting-row"><div><h2>Language</h2><p>Choose the language used for AI responses and voice support.</p></div><select className="settings-select" aria-label="Language" value={language} onChange={event=>setLanguage(event.target.value)}><option value="en">English</option><option value="ml">മലയാളം</option><option value="kn">ಕನ್ನಡ</option></select></div><div className="setting-row helpline-row"><div><span className="eyebrow">GOVERNMENT HELPLINE</span><h2>Kisan Call Centre</h2><p>Central Government farmer support by telephone.</p></div><a className="helpline-number" href="tel:18001801551">1800-180-1551 <span>↗</span></a></div><div className="settings-links"><a href="https://aims.kerala.gov.in/" target="_blank" rel="noreferrer">Kerala Agriculture Information Management System ↗</a><a href="https://www.keralaagriculture.gov.in/" target="_blank" rel="noreferrer">Kerala Agriculture Department ↗</a></div></section></div>;
}

export default App;
