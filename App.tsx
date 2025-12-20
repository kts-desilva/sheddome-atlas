import React, { useState } from 'react';
import { Layers, Activity, Database, Scissors, Tag, ChevronRight, ArrowLeft, FlaskConical, Upload, Search as SearchIcon, Loader2, CheckCircle } from 'lucide-react';
import SearchBar from './components/SearchBar';
import PeptideMap from './components/PeptideMap';
import MetricsPanel from './components/MetricsPanel';
import GlobalAtlas from './components/GlobalAtlas';
import LoadingAnimation from './components/LoadingAnimation';
import DataUploader from './components/DataUploader';
import { fetchProteinData, annotateProteinData } from './services/geminiService';
import { ProteinData } from './types';

type ViewMode = 'home' | 'dashboard' | 'global';
type DataSourceMode = 'ai' | 'upload';

const App: React.FC = () => {
  const [view, setView] = useState<ViewMode>('home');
  const [sourceMode, setSourceMode] = useState<DataSourceMode>('ai');
  const [data, setData] = useState<ProteinData | null>(null);
  const [interpretation, setInterpretation] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [annotating, setAnnotating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchProteinData(query);
      setData(result.data);
      setInterpretation(result.interpretation);
      setView('dashboard');
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUserUpload = async (uploadedData: Partial<ProteinData>, needsAnnotation: boolean) => {
      if (needsAnnotation) {
          setAnnotating(true);
          setError(null);
          try {
              const result = await annotateProteinData(uploadedData);
              setData(result.data);
              setInterpretation(result.interpretation);
              setView('dashboard');
          } catch (err) {
              console.error(err);
              setError("Failed to annotate CSV data using AI.");
          } finally {
              setAnnotating(false);
          }
      } else {
          setData(uploadedData as ProteinData);
          setInterpretation("Data uploaded by user. Interpretation requires external analysis.");
          setView('dashboard');
      }
  };

  const NavItem = ({ mode, label, icon: Icon }: { mode: ViewMode, label: string, icon: any }) => (
    <button 
        onClick={() => setView(mode)}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            view === mode 
            ? 'bg-science-50 text-science-700' 
            : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
        }`}
    >
        <Icon className="w-4 h-4" />
        {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('home')}>
            <div className="bg-science-600 p-1.5 rounded-lg shadow-lg shadow-science-500/30">
               <Layers className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              Shedding<span className="text-science-600">Atlas</span>
            </span>
          </div>
          
          <div className="flex items-center gap-2">
             <NavItem mode="home" label="Start" icon={ArrowLeft} />
             <div className="h-6 w-px bg-gray-200 mx-2"></div>
             <NavItem mode="dashboard" label="Protein Dashboard" icon={Activity} />
             <NavItem mode="global" label="Global Atlas" icon={Database} />
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="container mx-auto px-6 py-8">
        
        {/* VIEW: HOME */}
        {view === 'home' && (
            <div className="max-w-3xl mx-auto pt-16 animate-fade-in-up">
                
                <div className="text-center mb-10">
                    <div className="mb-6 inline-flex items-center justify-center p-3 bg-science-50 rounded-2xl">
                        <Scissors className="w-8 h-8 text-science-500" />
                    </div>
                    <h1 className="text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
                        Decode the <span className="text-transparent bg-clip-text bg-gradient-to-r from-science-600 to-indigo-600">Ectodomain</span>
                    </h1>
                    <p className="text-xl text-slate-500 leading-relaxed">
                        Visualize ectodomain shedding events across tissues and fluids.
                    </p>
                </div>

                {/* Source Toggle */}
                <div className="flex justify-center mb-8">
                    <div className="bg-gray-100 p-1 rounded-xl flex">
                        <button 
                            onClick={() => setSourceMode('ai')}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                                sourceMode === 'ai' 
                                ? 'bg-white text-science-600 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            <FlaskConical className="w-4 h-4" />
                            Knowledge Base
                        </button>
                        <button 
                             onClick={() => setSourceMode('upload')}
                             className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
                                sourceMode === 'upload' 
                                ? 'bg-white text-science-600 shadow-sm' 
                                : 'text-gray-500 hover:text-gray-900'
                            }`}
                        >
                            <Upload className="w-4 h-4" />
                            Upload Data
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="mt-8 bg-white p-8 rounded-3xl shadow-xl border border-science-100">
                        <LoadingAnimation />
                    </div>
                ) : annotating ? (
                    <div className="mt-8 bg-white p-12 rounded-3xl shadow-xl border border-science-100 text-center">
                        <div className="flex justify-center mb-6">
                            <Loader2 className="w-12 h-12 text-science-600 animate-spin" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Annotating Experimental Data</h3>
                        <p className="text-gray-500">Mapping your CSV peptides to Uniprot domains using curated intelligence...</p>
                    </div>
                ) : (
                    <>
                        {sourceMode === 'ai' ? (
                            <div className="bg-white p-2 rounded-2xl shadow-xl border border-gray-100 transform transition-all hover:scale-[1.01]">
                                <SearchBar onSearch={handleSearch} loading={loading} />
                            </div>
                        ) : (
                            <DataUploader onDataLoaded={handleUserUpload} />
                        )}

                        {sourceMode === 'ai' && (
                            <div className="mt-12 flex gap-4 justify-center text-sm text-gray-400">
                                <span>Try:</span>
                                <button onClick={() => handleSearch('ACE2')} className="hover:text-science-600 underline font-semibold">ACE2 (Local)</button>
                                <button onClick={() => handleSearch('EGFR')} className="hover:text-science-600 underline">EGFR</button>
                                <button onClick={() => handleSearch('ADAM10')} className="hover:text-science-600 underline">ADAM10</button>
                            </div>
                        )}
                    </>
                )}
                
                {error && <div className="mt-6 text-red-500 bg-red-50 p-3 rounded-lg inline-block">{error}</div>}
            </div>
        )}

        {/* VIEW: GLOBAL ATLAS */}
        {view === 'global' && <GlobalAtlas />}

        {/* VIEW: DASHBOARD */}
        {view === 'dashboard' && (
            <div className="animate-fade-in">
                {!data && !loading ? (
                    <div className="text-center py-20 text-gray-400">
                        <Activity className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        <p>No protein data loaded.</p>
                        <button onClick={() => setView('home')} className="mt-4 text-science-600 font-medium">Go to Search</button>
                    </div>
                ) : loading ? (
                    <div className="flex flex-col items-center justify-center py-40">
                         <LoadingAnimation />
                    </div>
                ) : data ? (
                    <div className="space-y-8">
                        {/* Protein Header */}
                        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between gap-6">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-4xl font-bold text-gray-900">{data.name}</h1>
                                    <span className="px-3 py-1 bg-gray-100 text-gray-600 font-mono text-sm rounded-md border border-gray-200">
                                        {data.geneSymbol}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3 mb-4 flex-wrap">
                                     {/* Local Badge */}
                                     {data.dataSources.fluid === 'Curated Local Database' && (
                                         <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200 shadow-sm">
                                            <CheckCircle className="w-3 h-3" /> Verified Record
                                         </span>
                                     )}

                                     {/* Role Badge */}
                                     {data.role === 'Sheddase' && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                                            <Scissors className="w-3 h-3" /> Sheddase
                                        </span>
                                     )}
                                     {data.role === 'Substrate' && (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800 border border-teal-200">
                                            <Tag className="w-3 h-3" /> Substrate
                                        </span>
                                     )}
                                     {data.dataSources.method.includes('CSV') && (
                                         <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                                            <FlaskConical className="w-3 h-3" /> Hybrid (CSV + AI)
                                         </span>
                                     )}
                                </div>
                                <p className="text-gray-500 max-w-2xl">{data.description}</p>
                            </div>

                            {/* Known Substrates / Sheddases Panel */}
                            {data.role === 'Sheddase' && data.knownSubstrates && (
                                <div className="md:w-1/3 bg-purple-50 rounded-xl p-4 border border-purple-100">
                                    <h3 className="text-xs font-bold text-purple-800 uppercase tracking-wide mb-2">Reported Substrates</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {data.knownSubstrates.map((sub, i) => (
                                            <span key={i} className="bg-white text-purple-700 px-2 py-1 rounded shadow-sm text-xs font-semibold cursor-pointer hover:bg-purple-100 transition-colors" onClick={() => handleSearch(sub)}>
                                                {sub}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <MetricsPanel data={data} />

                        <div className="grid grid-cols-12 gap-8">
                            <div className="col-span-12 lg:col-span-8 space-y-8">
                                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
                                    <div className="flex items-center justify-between mb-6">
                                        <h3 className="font-bold text-lg text-gray-900">Peptide Map & Cleavage Sites</h3>
                                        <div className="text-xs text-gray-400">Interactive Visualization</div>
                                    </div>
                                    <PeptideMap data={data} width={800} height={350} />
                                </div>

                                <div className="bg-slate-900 p-8 rounded-2xl shadow-lg text-slate-300">
                                    <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                        Interpretation & Context
                                    </h3>
                                    <div className="prose prose-invert max-w-none leading-relaxed">
                                        {interpretation}
                                    </div>
                                </div>
                            </div>

                            <div className="col-span-12 lg:col-span-4 space-y-8">
                                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm sticky top-24">
                                    <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center gap-2">
                                        <Scissors className="w-5 h-5 text-emerald-500" />
                                        Cleavage Sites
                                    </h3>
                                    {data.cleavageSites.length > 0 ? (
                                        <ul className="space-y-3">
                                            {data.cleavageSites.map((site, idx) => (
                                                <li key={idx} className="group flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200">
                                                    <div className="bg-emerald-100 text-emerald-700 font-mono text-xs p-1.5 rounded-lg min-w-[3rem] text-center font-bold">
                                                        {site.position}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-800 text-sm">{site.protease}</div>
                                                        <div className="text-xs text-gray-500 mt-0.5 line-clamp-2">{site.evidence}</div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-xl border border-gray-100">
                                            No cleavage sites annotated.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {data.dataSources && (
                            <div className="bg-science-50 rounded-xl p-4 border border-science-100 flex flex-col md:flex-row items-center gap-4 text-sm text-science-800">
                                <FlaskConical className="w-5 h-5 flex-shrink-0" />
                                <div className="flex-1 text-center md:text-left">
                                    <span className="font-bold">Provenance:</span> 
                                    {data.dataSources.fluid === 'Curated Local Database' ? (
                                        <span> Curated internally in <strong>services/localDatabase.ts</strong>.</span>
                                    ) : data.dataSources.method.includes('CSV') ? (
                                        <span> Experimental CSV + AI Annotation.</span>
                                    ) : (
                                        <span> {data.dataSources.method} ({data.dataSources.fluid} vs {data.dataSources.tissue}).</span>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>
        )}

      </main>
    </div>
  );
};

export default App;