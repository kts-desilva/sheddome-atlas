import React, { useMemo } from 'react';
import * as d3 from 'd3';
import { ProteinData } from '../types';

interface PeptideMapProps {
  data: ProteinData;
  width?: number;
  height?: number;
}

const PeptideMap: React.FC<PeptideMapProps> = ({ data, width = 800, height = 350 }) => {
  const margin = { top: 60, right: 30, bottom: 50, left: 50 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Scales
  const xScale = useMemo(() => {
    return d3.scaleLinear()
      .domain([0, data.length])
      .range([0, innerWidth]);
  }, [data.length, innerWidth]);

  const getDomainColor = (type: string) => {
    switch(type) {
      case 'Extracellular': return '#f87171'; // Red-ish
      case 'Transmembrane': return '#fbbf24'; // Yellow
      case 'Intracellular': return '#60a5fa'; // Blue-ish
      default: return '#e2e8f0';
    }
  };

  const domains = data.domains.length > 0 ? data.domains : [{name: 'Unknown', start: 0, end: data.length, type: 'Extracellular'}];

  return (
    <div className="relative">
      <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
        <g transform={`translate(${margin.left},${margin.top})`}>
          
          {/* Axis Labels */}
          <text x={0} y={innerHeight + 35} className="text-xs fill-gray-400">N-terminus</text>
          <text x={innerWidth} y={innerHeight + 35} textAnchor="end" className="text-xs fill-gray-400">C-terminus</text>
          
          {/* Main Structural Backbone (Track) */}
          <g transform={`translate(0, ${innerHeight / 2})`}>
            {/* Background line */}
            <line x1={0} x2={innerWidth} y1={0} y2={0} stroke="#e2e8f0" strokeWidth={24} strokeLinecap="round" />
            
            {/* Domain Segments */}
            {domains.map((dom, i) => {
                 const x = xScale(dom.start);
                 const w = xScale(dom.end) - xScale(dom.start);
                 return (
                    <rect 
                        key={i}
                        x={x}
                        y={-12}
                        width={w}
                        height={24}
                        fill={getDomainColor(dom.type)}
                        rx={4}
                        opacity={0.9}
                    />
                 );
            })}
          </g>

          {/* Cleavage Sites Lines */}
          <g>
            {data.cleavageSites.map((site, i) => {
                const x = xScale(site.position);
                return (
                    <g key={`cut-${i}`}>
                        {/* Dashed line */}
                        <line 
                            x1={x} x2={x} 
                            y1={-30} y2={innerHeight + 10} 
                            stroke="#10b981" 
                            strokeWidth={2} 
                            strokeDasharray="4 4" 
                        />
                        {/* Scissor / Marker Label */}
                        <g transform={`translate(${x}, -35)`}>
                            <text textAnchor="middle" className="text-[10px] font-bold fill-emerald-600">
                                {site.protease}
                            </text>
                            <text textAnchor="middle" y={10} className="text-[9px] fill-emerald-500">
                                {site.position}
                            </text>
                        </g>
                    </g>
                )
            })}
          </g>

          {/* Peptides (Bars above structure) */}
          <g>
             {data.peptides.map((pep, i) => {
                 const x = xScale(pep.start);
                 const w = Math.max(2, xScale(pep.end) - xScale(pep.start));
                 const h = Math.abs(pep.log2FoldChange) * 15 + 10; 
                 const barHeight = Math.min(h, innerHeight/2 - 20);
                 
                 return (
                    <rect 
                        key={`pep-${i}`}
                        x={x}
                        y={innerHeight / 2 - 16 - barHeight}
                        width={w}
                        height={barHeight}
                        fill="#38bdf8"
                        opacity={0.7}
                        rx={1}
                        stroke="white"
                        strokeWidth={0.5}
                    >
                        <title>{`Seq: ${pep.sequence}\nLoc: ${pep.location}`}</title>
                    </rect>
                 )
             })}
          </g>

          {/* X Axis Ticks */}
          <g transform={`translate(0, ${innerHeight + 10})`}>
            <line x1={0} x2={innerWidth} stroke="#cbd5e1" />
            <path d={`M 0 0 L ${innerWidth} 0`} stroke="#94a3b8" strokeWidth={2} />
          </g>

        </g>
      </svg>
      
      {/* Legend overlay */}
      <div className="absolute top-0 right-0 flex gap-4 text-xs bg-white/80 p-2 rounded-lg backdrop-blur-sm border border-gray-100">
         <div className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-400 rounded-sm"></span> Cytoplasmic</div>
         <div className="flex items-center gap-1"><span className="w-3 h-3 bg-yellow-400 rounded-sm"></span> Transmembrane</div>
         <div className="flex items-center gap-1"><span className="w-3 h-3 bg-red-400 rounded-sm"></span> Extracellular</div>
         <div className="flex items-center gap-1"><span className="w-1 h-3 border-l-2 border-dashed border-emerald-500"></span> Cleavage Site</div>
      </div>
    </div>
  );
};

export default PeptideMap;