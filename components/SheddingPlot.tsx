import React, { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell, Label } from 'recharts';
import { ProteinData } from '../types';

interface SheddingPlotProps {
  currentProtein: ProteinData | null;
}

const SheddingPlot: React.FC<SheddingPlotProps> = ({ currentProtein }) => {
  
  // Generate mock background data to simulate a proteomics cohort
  const backgroundData = useMemo(() => {
    const points = [];
    for (let i = 0; i < 60; i++) {
        const tissue = 3 + Math.random() * 5; // Log10 scale approx 3-8
        // Correlated but with noise
        const fluid = tissue + (Math.random() - 0.5) * 4; 
        
        // Some outliers (high shedding)
        if (Math.random() > 0.9) {
             points.push({ x: tissue, y: fluid + 2, z: 1, name: 'Background' });
        } else {
             points.push({ x: tissue, y: fluid, z: 1, name: 'Background' });
        }
    }
    return points;
  }, []);

  const proteinPoint = currentProtein ? [{
      x: Math.log10(currentProtein.tissueAbundance || 10000),
      y: Math.log10(currentProtein.fluidEctoAbundance || 1000),
      z: 10,
      name: currentProtein.geneSymbol || currentProtein.name
  }] : [];

  return (
    <div className="w-full h-[400px] p-4">
      <h3 className="text-sm font-semibold text-gray-800 mb-2">Shedding Identification Plot</h3>
      <div className="h-[340px] w-full">
        <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
                type="number" 
                dataKey="x" 
                domain={[2, 9]} 
                tick={{fontSize: 11, fill: '#64748b'}}
                stroke="#cbd5e1"
            >
                <Label value="Tissue Whole Protein (Log10)" offset={-20} position="insideBottom" style={{fontSize: 12, fill: '#64748b'}} />
            </XAxis>
            <YAxis 
                type="number" 
                dataKey="y" 
                domain={[0, 9]}
                tick={{fontSize: 11, fill: '#64748b'}}
                stroke="#cbd5e1"
            >
                <Label value="Fluid Ectodomain (Log10)" angle={-90} position="insideLeft" style={{fontSize: 12, fill: '#64748b'}} />
            </YAxis>
            <Tooltip 
                cursor={{ strokeDasharray: '3 3' }} 
                contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ fontSize: '12px', color: '#334155' }}
            />
            
            {/* Diagonal Line */}
            <ReferenceLine 
                segment={[{ x: 2, y: 2 }, { x: 9, y: 9 }]} 
                stroke="#94a3b8" 
                strokeDasharray="4 4" 
            />
            <ReferenceLine y={9} stroke="none">
                <Label value="1:1 Expected" position="insideTopLeft" fill="#94a3b8" fontSize={11} offset={10} />
            </ReferenceLine>

            {/* Background Points */}
            <Scatter name="Proteins" data={backgroundData} fill="#cbd5e1" shape="circle" r={4} />
            
            {/* Current Protein Highlight */}
            {currentProtein && (
                <Scatter name="Current" data={proteinPoint} shape="circle">
                    <Cell fill="#0ea5e9" stroke="#fff" strokeWidth={2} />
                    <Label dataKey="name" position="top" offset={10} style={{ fontSize: 12, fontWeight: 'bold', fill: '#0f172a' }} />
                </Scatter>
            )}
            </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SheddingPlot;