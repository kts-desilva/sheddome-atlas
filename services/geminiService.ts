import { GoogleGenAI, Type } from "@google/genai";
import { ProteinData, SimulationResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Existing simulation function
export const fetchProteinData = async (query: string): Promise<SimulationResponse> => {
  const model = "gemini-2.5-flash";
  
  const systemInstruction = `
    You are an expert bioinformatics database specialized in proteomic shedding. 
    Generate realistic JSON data for the requested protein.
    
    CRITICAL SCORING LOGIC:
    1. If role is 'Substrate' or 'Sheddase', ensure 'ectoCtoRatio' is HIGH (>5.0). This indicates specific shedding (head chopped off).
    2. If role is 'Unknown' or non-shedding, ensure 'ectoCtoRatio' is LOW (~1.0).
    3. 'sheddingScore' must be calculated as: Normalized value (0-10) based on (FluidEctoAbundance / TissueAbundance) * ectoCtoRatio.
    4. Provide specific cleavage sites with amino acid positions (e.g., "Arg-560").
    5. DATA SOURCES: Cite realistic dataset names (e.g., "Human CSF Proteome (Deep Mass Spec)", "Brain Cortex Lysate (HPA)").
    
    Structure the data for log10 plotting (Abundances should be between 1,000 and 10,000,000).
  `;

  const prompt = `Generate detailed shedding data for protein: "${query}". Ensure geneSymbol is provided.`;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          data: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              geneSymbol: { type: Type.STRING },
              uniprotId: { type: Type.STRING },
              role: { type: Type.STRING, enum: ["Sheddase", "Substrate", "Both", "Unknown"] },
              knownSubstrates: { type: Type.ARRAY, items: { type: Type.STRING } },
              description: { type: Type.STRING },
              length: { type: Type.INTEGER },
              sheddingScore: { type: Type.NUMBER, description: "0.0-10.0 score" },
              fluidEctoAbundance: { type: Type.NUMBER },
              tissueAbundance: { type: Type.NUMBER },
              ectoCtoRatio: { type: Type.NUMBER },
              dataSources: {
                type: Type.OBJECT,
                properties: {
                    fluid: { type: Type.STRING, description: "e.g., Human CSF (Zhang et al.)" },
                    tissue: { type: Type.STRING, description: "e.g., Brain Cortex (PaxDb)" },
                    method: { type: Type.STRING, description: "e.g., TMT-Labeled LC-MS/MS" }
                }
              },
              domains: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    start: { type: Type.INTEGER },
                    end: { type: Type.INTEGER },
                    type: { type: Type.STRING, enum: ["Extracellular", "Transmembrane", "Intracellular"] }
                  }
                }
              },
              peptides: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sequence: { type: Type.STRING },
                    start: { type: Type.INTEGER },
                    end: { type: Type.INTEGER },
                    log2FoldChange: { type: Type.NUMBER },
                    pvalue: { type: Type.NUMBER },
                    intensity: { type: Type.NUMBER },
                    location: { type: Type.STRING, enum: ["Extracellular", "Transmembrane", "Intracellular"] }
                  }
                }
              },
              cleavageSites: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    position: { type: Type.INTEGER },
                    protease: { type: Type.STRING },
                    evidence: { type: Type.STRING }
                  }
                }
              }
            }
          },
          interpretation: { type: Type.STRING }
        }
      }
    }
  });

  if (!response.text) {
    throw new Error("Failed to generate data");
  }

  return JSON.parse(response.text) as SimulationResponse;
};

// NEW: Function to annotate user uploaded CSV data
export const annotateProteinData = async (partialData: Partial<ProteinData>): Promise<SimulationResponse> => {
    const model = "gemini-2.5-flash";
    
    // We only ask the AI for the metadata structure, we trust the user's peptides
    const prompt = `
      I have experimental peptide data for the protein: "${partialData.name || partialData.geneSymbol}".
      
      I need you to provide the BIOLOGICAL ANNOTATIONS to visualize this data.
      1. Provide the 'domains' (Signal Peptide, Extracellular, Transmembrane, Cytoplasmic) with accurate Uniprot amino acid positions.
      2. Provide the 'length' of the protein.
      3. Provide 'cleavageSites' known in literature.
      4. Provide a 'description'.
      5. Determine the 'role' (Sheddase/Substrate).
      6. Assign the 'location' (Extracellular/Transmembrane/Intracellular) to the provided peptides based on your domain knowledge and their positions.
      
      Here is a sample of the user's peptides (start/end positions):
      ${JSON.stringify(partialData.peptides?.slice(0, 5))}
    `;
  
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            // We ask for the missing fields
            metadata: {
                type: Type.OBJECT,
                properties: {
                    uniprotId: { type: Type.STRING },
                    description: { type: Type.STRING },
                    length: { type: Type.INTEGER },
                    role: { type: Type.STRING, enum: ["Sheddase", "Substrate", "Both", "Unknown"] },
                    knownSubstrates: { type: Type.ARRAY, items: { type: Type.STRING } },
                    domains: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            name: { type: Type.STRING },
                            start: { type: Type.INTEGER },
                            end: { type: Type.INTEGER },
                            type: { type: Type.STRING, enum: ["Extracellular", "Transmembrane", "Intracellular"] }
                          }
                        }
                    },
                    cleavageSites: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          properties: {
                            position: { type: Type.INTEGER },
                            protease: { type: Type.STRING },
                            evidence: { type: Type.STRING }
                          }
                        }
                    }
                }
            },
            interpretation: { type: Type.STRING }
          }
        }
      }
    });
  
    if (!response.text) {
      throw new Error("Failed to annotate data");
    }
  
    const result = JSON.parse(response.text);
    const metadata = result.metadata;
  
    // Merge User Data with AI Metadata
    const mergedData: ProteinData = {
        ...partialData as ProteinData,
        ...metadata,
        // Recalculate domain-based metrics if needed or trust user
        // We need to map the user's peptides to the AI's locations
        peptides: partialData.peptides?.map(p => {
            const domain = metadata.domains.find((d: any) => p.start >= d.start && p.start <= d.end);
            return {
                ...p,
                location: domain ? domain.type : 'Extracellular' // Default if not found
            };
        }) || []
    };
  
    return {
        data: mergedData,
        interpretation: result.interpretation
    };
};

export const getInterpretationOnly = async (data: ProteinData): Promise<string> => {
    const model = "gemini-2.5-flash";
    const prompt = `Analyze the shedding data for ${data.name}. Role: ${data.role}.`;
    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text || "No interpretation available.";
}