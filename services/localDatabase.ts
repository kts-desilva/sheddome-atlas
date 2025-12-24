import { ProteinData } from '../types';

/**
 * Add your curated protein data to this list.
 * The app will prioritize matches in this array over AI generation.
 */
export const LOCAL_PROTEINS: ProteinData[] = [
  {
    name: "Angiotensin-converting enzyme 2",
    geneSymbol: "ACE2",
    uniprotId: "Q9BYF1",
    role: "Substrate",
    length: 805,
    description: "Verified local record: Essential counter-regulatory carboxypeptidase. Known substrate of ADAM17 and TMPRSS2.",
    sheddingScore: 9.5,
    fluidEctoAbundance: 15000000,
    tissueAbundance: 5000000,
    ectoCtoRatio: 22.0,
    dataSources: {
      fluid: "Curated Local Database",
      tissue: "Curated Local Database",
      method: "Literature Review / Verified Exp."
    },
    domains: [
      { name: "Signal Peptide", start: 1, end: 17, type: "Extracellular" },
      { name: "Ectodomain", start: 18, end: 740, type: "Extracellular" },
      { name: "Transmembrane", start: 741, end: 761, type: "Transmembrane" },
      { name: "Cytoplasmic Tail", start: 762, end: 805, type: "Intracellular" }
    ],
    peptides: [
      { sequence: "STIEEQAKTFLDKFNHEAEDLFYQSS", start: 19, end: 45, log2FoldChange: 4.5, pvalue: 0.0001, intensity: 900000, location: "Extracellular" },
      { sequence: "IVSLCTCVFAA", start: 745, end: 755, log2FoldChange: 0.1, pvalue: 0.5, intensity: 15000, location: "Transmembrane" },
      { sequence: "KKKNKARSGEN", start: 765, end: 775, log2FoldChange: -2.1, pvalue: 0.01, intensity: 500, location: "Intracellular" }
    ],
    cleavageSites: [
      { position: 740, protease: "ADAM17", evidence: "Verified (PMID: 15194784)" }
    ]
  },
    {
    name: "CUB domain-containing protein 1",
    geneSymbol: "CDCP1",
    uniprotId: "Q9H5V8",
    role: "Substrate",
    length: 836,
    description: "Verified local record: Essential counter-regulatory carboxypeptidase. Known substrate of TMPRSS4.",
    sheddingScore: 9.5,
    fluidEctoAbundance: 15000000,
    tissueAbundance: 5000000,
    ectoCtoRatio: 22.0,
    dataSources: {
      fluid: "Curated Local Database",
      tissue: "Curated Local Database",
      method: "Literature Review / Verified Exp."
    },
    domains: [
      { name: "Signal Peptide", start: 1, end: 29, type: "Extracellular" },
      { name: "Ectodomain", start: 30, end: 667, type: "Extracellular" },
      { name: "Transmembrane", start: 668, end: 688, type: "Transmembrane" }
    ],
    peptides: [],
    cleavageSites: [
      { position: 368, protease: "TMPRSS4", evidence: "Verified (PMID: 20551327)" }
    ]
  }
  // Add more proteins here...
];
