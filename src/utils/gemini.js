import { GoogleGenAI } from '@google/genai'

const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY })

export async function getGeminiAnalysis(inputs, results) {
  const votes     = results.reduce((acc, r) => acc + r.prediction, 0)
  const total     = results.length
  const avgProb   = Math.round(results.reduce((a, r) => a + r.probability, 0) / total)
  const bestModel = [...results].sort((a, b) => b.accuracy - a.accuracy)[0]

  const prompt = `
You are a water quality expert. Analyze this water sample and give a brief, clear assessment.

Water Sample Parameters:
- pH: ${inputs.ph || 'N/A'}
- Hardness: ${inputs.Hardness || 'N/A'} mg/L
- Solids: ${inputs.Solids || 'N/A'} ppm
- Chloramines: ${inputs.Chloramines || 'N/A'} ppm
- Sulfate: ${inputs.Sulfate || 'N/A'} mg/L
- Conductivity: ${inputs.Conductivity || 'N/A'} μS/cm
- Organic Carbon: ${inputs.Organic_carbon || 'N/A'} ppm
- Trihalomethanes: ${inputs.Trihalomethanes || 'N/A'} μg/L
- Turbidity: ${inputs.Turbidity || 'N/A'} NTU

ML Model Results:
- ${votes} out of ${total} models predict this water is safe
- Average potability probability: ${avgProb}%
- Best performing model (${bestModel.name}) accuracy: ${bestModel.accuracy}%

Give a 3-4 sentence analysis covering:
1. Overall verdict (safe or not safe)
2. Which parameters are concerning if any
3. What the model agreement tells us

Be direct and concise. No bullet points, just plain paragraphs.
`

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    })

    return response.text

  } catch (err) {
    if (err.message?.includes('429')) throw new Error('RATE_LIMIT')
    throw new Error(err.message)
  }
}