import { GoogleGenAI, Type } from "@google/genai";
import { ProteinData, SimulationResponse } from "../types";
import { LOCAL_PROTEINS } from "./localDatabase";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchProteinData = async (query: string): Promise<SimulationResponse> => {
  // 1. Check Local Knowledge Base First
  const normalizedQuery = query.trim().toLowerCase();
  const localMatch = LOCAL_PROTEINS.find(p => 
    p.name.toLowerCase() === normalizedQuery || 
    p.geneSymbol.toLowerCase() === normalizedQuery ||
    p.uniprotId?.toLowerCase() === normalizedQuery
  );

  if (localMatch) {
    return {
      data: localMatch,
      interpretation: `This record was retrieved from the internal verified knowledge base. ${localMatch.description}`
    };
  }

  // 2. Fallback to Gemini AI if no local match
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `
    You are an expert bioinformatics database specialized in proteomic shedding. 
    Generate realistic JSON data for the requested protein.
    
    CRITICAL SCORING LOGIC:
    1. If role is 'Substrate' or 'Sheddase', ensure 'ectoCtoRatio' is HIGH (>5.0).
    2. If role is 'Unknown' or non-shedding, ensure 'ectoCtoRatio' is LOW (~1.0).
    3. Provide specific cleavage sites with amino acid positions.
    4. Structure the data for log10 plotting (Abundances between 1,000 and 10,000,000).
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
              sheddingScore: { type: Type.NUMBER },
              fluidEctoAbundance: { type: Type.NUMBER },
              tissueAbundance: { type: Type.NUMBER },
              ectoCtoRatio: { type: Type.NUMBER },
              dataSources: {
                type: Type.OBJECT,
                properties: {
                    fluid: { type: Type.STRING },
                    tissue: { type: Type.STRING },
                    method: { type: Type.STRING }
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

export const annotateProteinData = async (partialData: Partial<ProteinData>): Promise<SimulationResponse> => {
    const model = "gemini-3-flash-preview";
    const prompt = `
      Annotate experimental peptide data for: "${partialData.name || partialData.geneSymbol}".
      Provide Uniprot domains, protein length, cleavage sites, and a description.
      Sample peptides: ${JSON.stringify(partialData.peptides?.slice(0, 5))}
    `;
  
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
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
  
    if (!response.text) throw new Error("Failed to annotate data");
  
    const result = JSON.parse(response.text);
    const metadata = result.metadata;
  
    const mergedData: ProteinData = {
        ...partialData as ProteinData,
        ...metadata,
        peptides: partialData.peptides?.map(p => {
            const domain = metadata.domains.find((d: any) => p.start >= d.start && p.start <= d.end);
            return { ...p, location: domain ? domain.type : 'Extracellular' };
        }) || []
    };
  
    return { data: mergedData, interpretation: result.interpretation };
};
