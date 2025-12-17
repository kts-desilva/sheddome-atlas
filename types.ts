export interface Domain {
  name: string;
  start: number;
  end: number;
  type: 'Extracellular' | 'Transmembrane' | 'Intracellular';
}

export interface Peptide {
  sequence: string;
  start: number;
  end: number;
  log2FoldChange: number; // Disease vs Control
  pvalue: number;
  intensity: number;
  location: 'Extracellular' | 'Intracellular' | 'Transmembrane'; // Mapped location
}

export interface CleavageSite {
  position: number;
  protease: string;
  evidence: string;
  sequenceContext?: string;
}

export interface DataSources {
  fluid: string;
  tissue: string;
  method: string;
}

export interface ProteinData {
  name: string;
  geneSymbol: string;
  uniprotId: string;
  role: 'Sheddase' | 'Substrate' | 'Both' | 'Unknown';
  knownSubstrates?: string[]; // If role is Sheddase
  length: number;
  description: string;
  sheddingScore: number;
  fluidEctoAbundance: number; // Normalized intensity
  tissueAbundance: number;
  ectoCtoRatio: number;
  domains: Domain[];
  peptides: Peptide[];
  cleavageSites: CleavageSite[];
  dataSources: DataSources;
}

export interface SimulationResponse {
  data: ProteinData;
  interpretation: string;
}

export interface UploadedDataset {
  name: string;
  type: 'Fluid' | 'Tissue';
  entries: { id: string; abundance: number }[];
}