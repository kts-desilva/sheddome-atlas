import React from 'react';
import { Info } from 'lucide-react';
import { ProteinData } from '../types';

interface MetricsPanelProps {
  data: ProteinData;
}

const MetricsPanel: React.FC<MetricsPanelProps> = ({ data }) => {
  
  const StatBox = ({ 
    label, 
    value, 
    subLabel, 
    formula, 
    desc 
  }: { 
    label: string, 
    value: string | number, 
    subLabel: string,
    formula: string,
    desc: string
  }) => (
    <div className="flex flex-col p-4 relative group">
      <div className="flex items-center gap-1.5 mb-2">
        <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</dt>
        <Info className="w-3.5 h-3.5 text-gray-300 cursor-help hover:text-science-500 transition-colors" />
      </div>
      <dd className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</dd>
      <dd className="text-xs text-gray-500 mt-1 font-medium">{subLabel}</dd>
      
      {/* Tooltip */}
      <div className="absolute top-full left-0 mt-2 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 shadow-xl pointer-events-none">
         <div className="font-mono text-science-300 mb-1 border-b border-slate-600 pb-1">{formula}</div>
         <div className="text-slate-300 leading-relaxed">{desc}</div>
         {/* Arrow */}
         <div className="absolute -top-1 left-4 w-2 h-2 bg-slate-800 transform rotate-45"></div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm z-10 relative">
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
        <StatBox 
            label="Shedding Score" 
            value={data.sheddingScore.toFixed(1)} 
            subLabel="/ 10.0 Scale" 
            formula="Score ∝ log2(Fluid/Tissue) × E/C Ratio"
            desc="A composite confidence score. Higher scores indicate high fluid abundance relative to tissue, combined with specific ectodomain enrichment."
        />
        <StatBox 
            label="Fluid Ecto Abundance" 
            value={data.fluidEctoAbundance.toLocaleString()} 
            subLabel="Peptide Intensity Sum" 
            formula="∑ Intensity(Peptides ∈ ECD)"
            desc="Total spectral intensity of peptides mapping to the Extracellular Domain (ECD) detected in the fluid sample."
        />
        <StatBox 
            label="Tissue Abundance" 
            value={data.tissueAbundance.toLocaleString()} 
            subLabel="Total Protein" 
            formula="∑ Intensity(All Peptides)"
            desc="Total normalized protein abundance found in the control tissue lysate."
        />
        <StatBox 
            label="Ecto/Cyto Ratio (Fluid)" 
            value={data.ectoCtoRatio.toFixed(1)} 
            subLabel="Enrichment Factor" 
            formula="Intensity(ECD) / Intensity(ICD)"
            desc="Ratio of Ectodomain to Intracellular domain peptides in fluid. High values (>5) indicate shedding. Low values (~1) indicate cell lysis."
        />
      </div>
    </div>
  );
};

export default MetricsPanel;