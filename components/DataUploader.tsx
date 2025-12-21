import React, { useState } from 'react';
import { Upload, FileJson, FileSpreadsheet, AlertCircle, Download, PlayCircle } from 'lucide-react';
import { ProteinData } from '../types';

interface DataUploaderProps {
  onDataLoaded: (data: Partial<ProteinData>, needsAnnotation: boolean) => void;
}

const DataUploader: React.FC<DataUploaderProps> = ({ onDataLoaded }) => {
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setError(null);

    if (!file) return;

    const reader = new FileReader();
    
    if (file.name.endsWith('.json')) {
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                processJsonData(json);
            } catch (err) {
                setError("Error parsing JSON.");
            }
        };
        reader.readAsText(file);
    } else if (file.name.endsWith('.csv')) {
        reader.onload = (event) => {
            try {
                const csv = event.target?.result as string;
                processCsvData(csv);
            } catch (err) {
                setError("Error parsing CSV.");
            }
        };
        reader.readAsText(file);
    } else {
        setError("Unsupported file format. Please use .json or .csv");
    }
  };

  const processJsonData = (json: any) => {
    if (!json.name || !Array.isArray(json.peptides)) {
      setError("Invalid JSON Format.");
      return;
    }
    // Assume JSON is fully complete if it has domains
    const needsAnnotation = !json.domains || json.domains.length === 0;
    
    const normalizedData: Partial<ProteinData> = {
        ...json,
        dataSources: json.dataSources || { fluid: 'User JSON', tissue: 'User JSON', method: 'Uploaded' }
    };
    onDataLoaded(normalizedData, needsAnnotation);
  };

  const processCsvData = (csvText: string) => {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
        setError("CSV is empty or missing header.");
        return;
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    // Basic CSV Mapping
    const idxName = headers.findIndex(h => h.includes('protein') || h.includes('gene'));
    const idxSeq = headers.findIndex(h => h.includes('sequence') || h.includes('peptide'));
    const idxStart = headers.findIndex(h => h.includes('start'));
    const idxEnd = headers.findIndex(h => h.includes('end'));
    const idxFluid = headers.findIndex(h => h.includes('fluid') || h.includes('cond'));
    const idxTissue = headers.findIndex(h => h.includes('tissue') || h.includes('control'));

    if (idxSeq === -1 || idxFluid === -1) {
        setError("CSV must contain columns for: Sequence, Start, End, FluidIntensity, TissueIntensity");
        return;
    }

    const peptides: any[] = [];
    let proteinName = "Unknown Protein";
    let proteinGene = "Unknown";
    let totalFluid = 0;
    let totalTissue = 0;

    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim());
        if (cols.length < headers.length) continue;

        if (idxName !== -1 && i === 1) {
            proteinName = cols[idxName];
            proteinGene = cols[idxName]; 
        }

        if (idxName !== -1 && cols[idxName] !== proteinName) continue;

        const start = parseInt(cols[idxStart]) || 0;
        const end = parseInt(cols[idxEnd]) || 0;
        const fluid = parseFloat(cols[idxFluid]) || 1;
        const tissue = parseFloat(cols[idxTissue]) || 1;

        totalFluid += fluid;
        totalTissue += tissue;

        const log2FoldChange = Math.log2(fluid / tissue);
        
        peptides.push({
            sequence: cols[idxSeq],
            start,
            end,
            log2FoldChange,
            pvalue: 0.05,
            intensity: fluid,
            location: 'Extracellular' 
        });
    }

    const partialData: Partial<ProteinData> = {
        name: proteinName,
        geneSymbol: proteinGene,
        peptides: peptides,
        fluidEctoAbundance: totalFluid,
        tissueAbundance: totalTissue,
        sheddingScore: 5.0, 
        ectoCtoRatio: 1.0, 
        domains: [], 
        dataSources: {
            fluid: 'Experimental Upload',
            tissue: 'Experimental Upload',
            method: 'CSV Import'
        }
    };

    // CSV data needs structural annotation from the curated database
    onDataLoaded(partialData, true);
  };

  const loadDemoJson = () => {
      const demoData = {
        "name": "Angiotensin-converting enzyme 2",
        "geneSymbol": "ACE2",
        "length": 805,
        "description": "Curated Demo: Essential counter-regulatory carboxypeptidase.",
        "role": "Substrate",
        "sheddingScore": 9.2,
        "fluidEctoAbundance": 12500000,
        "tissueAbundance": 4500000,
        "ectoCtoRatio": 18.5,
        "domains": [
            { "name": "Signal Peptide", "start": 1, "end": 17, "type": "Extracellular" },
            { "name": "Ectodomain", "start": 18, "end": 740, "type": "Extracellular" },
            { "name": "Transmembrane", "start": 741, "end": 761, "type": "Transmembrane" },
            { "name": "Cytoplasmic Tail", "start": 762, "end": 805, "type": "Intracellular" }
        ],
        "peptides": [
            { "sequence": "STIEEQAKTFLDKFNHEAEDLFYQSS", "start": 19, "end": 45, "log2FoldChange": 4.2, "intensity": 850000, "location": "Extracellular" },
            { "sequence": "KKKNKARSGEN", "start": 765, "end": 775, "log2FoldChange": -1.5, "intensity": 1000, "location": "Intracellular" }
        ],
        "cleavageSites": [
            { "position": 740, "protease": "ADAM17", "evidence": "Verified" }
        ]
      };
      onDataLoaded(demoData as unknown as ProteinData, false);
  };

  const loadDemoCsv = () => {
    const csvContent = `ProteinId,PeptideSequence,Start,End,Intensity_Fluid,Intensity_Tissue
ACE2,STIEEQAKTFLDKFNHEAEDLFYQSS,19,45,850000,20000
ACE2,GLTTEPHKSNAT,100,112,720000,15000
ACE2,MYPGIQVSNNKY,250,262,900000,18000
ACE2,AWDLGKGDFRI,400,411,680000,14000
ACE2,VVEKLNQLGT,600,610,750000,16000
ACE2,LGANQGFEA,720,729,500000,12000
ACE2,IVSLCTCVFAA,745,755,20000,80000
ACE2,KKKNKARSGEN,765,775,1000,95000
ACE2,PYNASRIRK,780,788,500,98000`;
    
    processCsvData(csvContent);
  };

  const downloadTemplate = () => {
    const csvContent = `ProteinId,PeptideSequence,Start,End,Intensity_Fluid,Intensity_Tissue
ACE2,SAMPLE_PEPTIDE_SEQ,20,35,50000,1000`;
    const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", "shedding_template.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-200 animate-fade-in">
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Experimental Data</h3>
        <p className="text-gray-500 text-sm">Upload CSV files containing raw peptides. They will be mapped to structure using the curated database.</p>
      </div>

      <div className="flex flex-col gap-6 items-center">
        {/* Drop Zone */}
        <label className="w-full flex flex-col items-center justify-center h-48 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 hover:border-science-400 transition-all group">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <div className="bg-science-50 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform flex gap-2">
                    <FileJson className="w-6 h-6 text-science-500" />
                    <FileSpreadsheet className="w-6 h-6 text-emerald-500" />
                </div>
                <p className="mb-2 text-sm text-gray-700 font-semibold">Click to upload JSON or CSV</p>
                <p className="text-xs text-gray-400">Supported: .json, .csv</p>
            </div>
            <input type="file" accept=".json,.csv" className="hidden" onChange={handleFileUpload} />
        </label>

        <div className="flex gap-2 w-full flex-wrap justify-center">
             <button 
                onClick={loadDemoJson}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-science-600 text-white hover:bg-science-700 text-sm font-bold shadow-md transition-colors"
            >
                <PlayCircle className="w-4 h-4" />
                Demo JSON
            </button>
            <button 
                onClick={loadDemoCsv}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-bold shadow-md transition-colors"
            >
                <PlayCircle className="w-4 h-4" />
                Demo CSV (Mapping)
            </button>
            <button 
                onClick={downloadTemplate}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-sm font-medium transition-colors"
            >
                <Download className="w-4 h-4" />
                CSV Template
            </button>
        </div>

        {error && (
            <div className="w-full flex items-center gap-2 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
            </div>
        )}
      </div>
    </div>
  );
};

export default DataUploader;
