import {GoogleGenerativeAI} from "@google/generative-ai";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
const genAI = new GoogleGenerativeAI("AIzaSyCrQlfPlBMOeGA07KiRvRy6-XtlyADVD9I");
const model = genAI.getGenerativeModel({model: "gemini-2.5-flash"});

const LANGUAGE_MAP = {
  en:    "English",
  hi:    "Hindi",
  te:    "Telugu",
  ta:    "Tamil",
  kn:    "Kannada",
  mr:    "Marathi",
  bn:    "Bengali",
  gu:    "Gujarati",
  pa:    "Punjabi",
  or:    "Odia",
  ml:    "Malayalam",
  ur:    "Urdu"
};

export const getCropAdvice = async({crop, weather, userQuestion="", language = "en", existingHistory}) => {
    const lang = LANGUAGE_MAP[language] || "English";
    const userPrompt = buildCropPrompt({crop, weather, userQuestion, lang});

    const geminiHistory = existingHistory.map(h=> ({
        role:  h.role === "assistant" ? "model" : "user",
        parts: [{text: h.content}]
    }));
    const chat = model.startChat({
        history: geminiHistory,
        generationConfig: {
            maxOutputTokens: 1024,
            temperature: 0.7
        }
    });
    const result = await chat.sendMessage(userPrompt);
    const advice = result.response.text();

    const updatedHistory = [...existingHistory, {role: "user", content: userPrompt}, {role: "assistant" , content: advice}];
    const trimmedHistory = updatedHistory.slice(-20);

    return {advice, updatedHistory: trimmedHistory};
};

export const detectCropDisease = async ({ imageBuffer, mimeType, cropName, language = "en" }) => {
  const lang = LANGUAGE_MAP[language] || "English";

  const prompt = `
You are an expert agricultural plant pathologist with 20+ years of experience.

Analyze this image of a "${cropName}" crop carefully.

Respond ONLY in ${lang} language.

Provide your analysis in this exact structure:

1. DISEASE/CONDITION IDENTIFIED:
   - Name of disease or condition (or "Healthy" if no disease)
   - Confidence level: High/Medium/Low

2. SYMPTOMS OBSERVED:
   - What you can see in the image

3. CAUSE:
   - Fungal / Bacterial / Viral / Pest / Nutritional deficiency / Environmental

4. SEVERITY:
   - Mild / Moderate / Severe

5. IMMEDIATE ACTION (next 24-48 hours):
   - Specific steps the farmer must take NOW

6. TREATMENT:
   - Recommended pesticide/fungicide (generic names, not brands)
   - Application method and dosage

7. PREVENTION (for future):
   - How to prevent recurrence

8. ESTIMATED YIELD IMPACT:
   - Likely crop loss % if untreated

If the image is not a plant/crop, say: "Please upload a clear image of the affected crop plant."
`.trim();
const result = await model.generateContent([
    {
      inlineData: {
        data:     imageBuffer.toString("base64"),  
        mimeType: mimeType                         
      }
    },
    { text: prompt }
  ]);

  return result.response.text();
};


export const getScheduledAdvice = async ({ crop, weather, language = "en" }) => {
  const lang = LANGUAGE_MAP[language] || "English";

  const prompt = `
You are AgroVision AI, monitoring crops for farmers.

This is a SCHEDULED UPDATE (${new Date().toLocaleString()}).

Crop: ${crop.cropName} | Area: ${crop.area} ${crop.areaUnit} | Soil: ${crop.soilType}

CURRENT WEATHER RIGHT NOW:
- Temperature: ${weather.current.temp}°C (feels like ${weather.current.feelsLike}°C)
- Humidity: ${weather.current.humidity}%
- Conditions: ${weather.current.description}
- Wind: ${weather.current.windSpeed} m/s
- Rain last 1h: ${weather.current.rain1h}mm

NEXT 3 DAYS FORECAST:
${weather.forecast.slice(0, 3).map(d =>
  `${d.date}: ${d.tempMin}°C–${d.tempMax}°C, Rain: ${d.totalRain}mm, ${d.condition}`
).join("\n")}

Based on THIS WEATHER UPDATE, what should the farmer do in the NEXT 3 HOURS?
Focus on: irrigation, pest risk, disease risk, urgent actions.
Keep it short and actionable (under 150 words).
Respond in ${lang}.
`.trim();

  const result = await model.generateContent(prompt);
  return result.response.text();
};


const buildCropPrompt = ({ crop, weather, userQuestion, lang }) => `
You are AgroVision AI — an expert agricultural advisor for Indian farmers.

Respond ONLY in ${lang} language. Be practical, specific, and farmer-friendly.

═══ FARMER'S CROP DETAILS ═══
Crop:          ${crop.cropName} (${crop.variety || "standard variety"})
Type:          ${crop.cropType || "Not specified"}
Area:          ${crop.area} ${crop.areaUnit}
Soil Type:     ${crop.soilType}
Planted On:    ${crop.plantingDate ? new Date(crop.plantingDate).toDateString() : "Not specified"}
Target Harvest:${crop.harvestTarget ? new Date(crop.harvestTarget).toDateString() : "Not specified"}
Location:      ${crop.location.city || `Lat ${crop.location.lat}, Lon ${crop.location.lon}`}

═══ CURRENT WEATHER ═══
Temperature:   ${weather.current.temp}°C (feels like ${weather.current.feelsLike}°C)
Humidity:      ${weather.current.humidity}%
Condition:     ${weather.current.description}
Wind Speed:    ${weather.current.windSpeed} m/s
Rain (last 1h):${weather.current.rain1h} mm
Cloud Cover:   ${weather.current.clouds}%

═══ 5-DAY FORECAST ═══
${weather.forecast.map(d =>
  `${d.date}: ${d.tempMin}°C–${d.tempMax}°C | Humidity: ${d.humidityAvg}% | Rain: ${d.totalRain}mm | ${d.condition}`
).join("\n")}

${userQuestion ? `═══ FARMER'S QUESTION ═══\n${userQuestion}\n` : ""}

Please provide:
1. Current crop condition assessment
2. Immediate actions needed (next 24 hours)
3. Weather-based risks this week
4. Irrigation recommendation
5. Pest/disease watch alerts based on weather
6. Weekly action plan

Be specific with quantities and timings.
`.trim();