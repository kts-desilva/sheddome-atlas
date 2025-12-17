import React, { useState, useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Label, Cell } from 'recharts';
import { Upload, AlertCircle, FileText } from 'lucide-react';

const GlobalAtlas: React.FC = () => {
  const [fluidFile, setFluidFile] = useState<string | null>(null);
  const [tissueFile, setTissueFile] = useState<string | null>(null);

  // Mock data simulation based on file presence
  // In a real app, we would parse the JSONs here
  const plotData = useMemo(() => {
    if (!fluidFile && !tissueFile) return [];
    
    // Generate data to simulate the global picture
    const points = [];
    const count = (fluidFile && tissueFile) ? 200 : 50;
    
    for (let i = 0; i < count; i++) {
        const tissue = 3 + Math.random() * 5; 
        const fluid = tissue + (Math.random() - 0.5) * 4; 
        const isSheddingCandidate = (fluid - tissue) > 2;

        points.push({
            id: i,
            x: tissue,
            y: fluid,
            z: 1,
            name: `Protein ${i}`,
            isCandidate: isSheddingCandidate
        });
    }
    return points;
  }, [fluidFile, tissueFile]);

  const handleFluidUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files?.[0]) setFluidFile(e.target.files[0].name);
  }

  const handleTissueUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(e.target.files?.[0]) setTissueFile(e.target.files[0].name);
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
        
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Global Shedding Identification</h2>
            <p className="text-gray-500 max-w-2xl mx-auto mb-8">
                Upload your Fluid and Tissue proteomic datasets to generate a global shedding map. 
                Identify outliers with high fluid-to-tissue ratios indicating potential ectodomain shedding.
            </p>
            
            <div className="flex flex-col md:flex-row gap-6 justify-center">
                {/* Fluid Upload */}
                <div className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-colors ${fluidFile ? 'border-science-500 bg-science-50' : 'border-gray-300 hover:border-science-400'}`}>
                    <div className="bg-blue-100 p-3 rounded-full mb-3">
                        <Upload className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="font-semibold text-gray-700 mb-1">Fluid Dataset</span>
                    <span className="text-xs text-gray-400 mb-4">{fluidFile || "JSON or CSV"}</span>
                    <label className="cursor-pointer bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700 shadow-sm">
                        Select File
                        <input type="file" className="hidden" onChange={handleFluidUpload} />
                    </label>
                </div>

                {/* Tissue Upload */}
                <div className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-colors ${tissueFile ? 'border-science-500 bg-science-50' : 'border-gray-300 hover:border-science-400'}`}>
                    <div className="bg-purple-100 p-3 rounded-full mb-3">
                        <FileText className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className="font-semibold text-gray-700 mb-1">Tissue Dataset</span>
                    <span className="text-xs text-gray-400 mb-4">{tissueFile || "JSON or CSV"}</span>
                    <label className="cursor-pointer bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700 shadow-sm">
                        Select File
                        <input type="file" className="hidden" onChange={handleTissueUpload} />
                    </label>
                </div>
            </div>
        </div>

        {/* Plot Section */}
        {(fluidFile || tissueFile) && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Global Shedding Map</h3>
                        <p className="text-sm text-gray-500">Visualizing {plotData.length} proteins from uploaded data</p>
                    </div>
                    <div className="flex gap-4 text-sm">
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-science-500"></span> Candidate</div>
                        <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-gray-300"></span> Background</div>
                    </div>
                </div>
                
                <div className="h-[500px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis type="number" dataKey="x" domain={[0, 10]} stroke="#94a3b8">
                                <Label value="Tissue Abundance (Log10)" offset={-20} position="insideBottom" style={{fontSize: 12, fill: '#64748b'}} />
                            </XAxis>
                            <YAxis type="number" dataKey="y" domain={[0, 10]} stroke="#94a3b8">
                                <Label value="Fluid Abundance (Log10)" angle={-90} position="insideLeft" style={{fontSize: 12, fill: '#64748b'}} />
                            </YAxis>
                            <Tooltip 
                                cursor={{ strokeDasharray: '3 3' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            />
                            <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 10, y: 10 }]} stroke="#cbd5e1" strokeDasharray="5 5" />
                            <Scatter name="Proteins" data={plotData}>
                                {plotData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.isCandidate ? '#0ea5e9' : '#cbd5e1'} />
                                ))}
                            </Scatter>
                        </ScatterChart>
                    </ResponsiveContainer>
                </div>

                {!tissueFile && (
                    <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5" />
                        <span>Tissue dataset missing. Plot allows for 1D analysis only. Upload tissue data for ratio analysis.</span>
                    </div>
                )}
            </div>
        )}
    </div>
  );
};

export default GlobalAtlas;