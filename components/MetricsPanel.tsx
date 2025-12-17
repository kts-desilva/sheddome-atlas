import React from 'react';
import { ProteinData } from '../types';

interface MetricsPanelProps {
  data: ProteinData;
}

const MetricsPanel: React.FC<MetricsPanelProps> = ({ data }) => {
  const StatBox = ({ label, value, subLabel }: { label: string, value: string | number, subLabel: string }) => (
    <div className="flex flex-col p-4">
      <dt className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{label}</dt>
      <dd className="text-3xl font-extrabold text-gray-900 tracking-tight">{value}</dd>
      <dd className="text-xs text-gray-500 mt-1 font-medium">{subLabel}</dd>
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
      <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-gray-100">
        <StatBox 
            label="Shedding Score" 
            value={data.sheddingScore.toFixed(1)} 
            subLabel="/ 10.0 Scale" 
        />
        <StatBox 
            label="Fluid Ecto Abundance" 
            value={data.fluidEctoAbundance.toLocaleString()} 
            subLabel="Peptide Intensity Sum" 
        />
        <StatBox 
            label="Tissue Abundance" 
            value={data.tissueAbundance.toLocaleString()} 
            subLabel="Total Protein" 
        />
        <StatBox 
            label="Ecto/Cyto Ratio (Fluid)" 
            value={data.ectoCtoRatio.toFixed(1)} 
            subLabel="Enrichment Factor" 
        />
      </div>
    </div>
  );
};

export default MetricsPanel;