import { GoogleGenAI, Type } from "@google/genai";
import { ProteinData, SimulationResponse } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchProteinData = async (query: string): Promise<SimulationResponse> => {
  const model = "gemini-2.5-flash";
  
  const systemInstruction = `
    You are an expert bioinformatics database specialized in proteomic shedding. 
    Generate realistic JSON data for the requested protein.
    Determine if the protein is primarily a 'Sheddase' (e.g., ADAM10, BACE1) or a 'Substrate' (e.g., APP, NOTCH1).
    If it is a Sheddase, provide a list of 3-5 known substrates.
    Include specific cleavage sites with amino acid positions.
    Provide realistic abundance values suitable for log10 plotting.
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

export const getInterpretationOnly = async (data: ProteinData): Promise<string> => {
    const model = "gemini-2.5-flash";
    const prompt = `Analyze the shedding data for ${data.name}. Role: ${data.role}.`;
    const response = await ai.models.generateContent({ model, contents: prompt });
    return response.text || "No interpretation available.";
}