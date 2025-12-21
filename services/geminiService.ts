import { ProteinData, SimulationResponse } from "../types";
import { LOCAL_PROTEINS } from "./localDatabase";

/**
 * Checks if a protein exists in the local curated database.
 */
const findLocalProtein = (query: string): ProteinData | undefined => {
  const normalizedQuery = query.trim().toLowerCase();
  return LOCAL_PROTEINS.find(p => 
    p.name.toLowerCase() === normalizedQuery || 
    p.geneSymbol.toLowerCase() === normalizedQuery ||
    p.uniprotId?.toLowerCase() === normalizedQuery
  );
};

/**
 * Fetches protein data strictly from the local database.
 */
export const fetchProteinData = async (query: string): Promise<SimulationResponse> => {
  // Check Local Knowledge Base
  const localMatch = findLocalProtein(query);

  if (localMatch) {
    return {
      data: localMatch,
      interpretation: `[LOCAL RECORD] ${localMatch.description}`
    };
  }

  // If not found locally, we no longer fall back to AI.
  throw new Error(`Protein "${query}" not found in the verified knowledge base.`);
};

/**
 * Maps experimental CSV data to structural metadata strictly from the local database.
 */
export const annotateProteinData = async (partialData: Partial<ProteinData>): Promise<SimulationResponse> => {
    const identifier = partialData.geneSymbol || partialData.name || "";
    const localMatch = findLocalProtein(identifier);

    if (localMatch) {
      // Merge uploaded peptide data with local structural metadata
      const mergedData: ProteinData = {
        ...localMatch,
        ...partialData,
        domains: localMatch.domains, // Use verified domains from local DB
        cleavageSites: localMatch.cleavageSites, // Use verified sites from local DB
        peptides: partialData.peptides?.map(p => {
          const domain = localMatch.domains.find(d => p.start >= d.start && p.start <= d.end);
          return { ...p, location: domain ? domain.type : 'Extracellular' };
        }) || localMatch.peptides
      };

      return { 
        data: mergedData, 
        interpretation: `Experimental data for ${identifier} successfully mapped to verified structural metadata from the internal database.` 
      };
    }

    // If not found in local DB, we cannot annotate it anymore since AI is disabled.
    throw new Error(`Annotation failed: "${identifier}" is not present in the curated knowledge base. Please add it to localDatabase.ts first.`);
};
