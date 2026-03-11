import Crop from "../model/crop.js";
import User from "../model/user.js";
import { getWeatherSummary } from "../utils/weatherService.js";
import { getCropAdvice, detectCropDisease } from "../utils/aiService.js";
import { sendEmail } from "../utils/sendEmail.js";
import { sendSMS } from "../utils/sendSms.js";

// POST /api/ai/advice

export const getAdvice = async (req, res) => {
  try {
    const { cropId, question } = req.body;

    if (!cropId) {
      return res.status(400).json({ message: "cropId is required." });
    }

    const crop = await Crop.findOne({ _id: cropId, user: req.user.id });
    if (!crop) {
      return res.status(404).json({ message: "Crop not found." });
    }

    const user = await User.findById(req.user.id);

    const weather = await getWeatherSummary(crop.location.lat, crop.location.lon);

    const { advice, updatedHistory } = await getCropAdvice({
      crop,
      weather,
      userQuestion:    question || "",
      language:        user.language || "en",
      existingHistory: crop.aiHistory || []
    });

    crop.aiHistory    = updatedHistory;
    crop.lastAdviceAt = new Date();
    await crop.save();

    notifyUser(user, crop.cropName, advice).catch(console.error);

    res.json({
      advice,
      weather: weather.current,   
      cropName: crop.cropName
    });

  } catch (error) {
    console.error("getAdvice error:", error);
    res.status(500).json({ message: error.message });
  }
};


// POST /api/ai/disease-detection
export const detectDisease = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a crop image." });
    }

    const { cropId } = req.body;
    if (!cropId) {
      return res.status(400).json({ message: "cropId is required." });
    }

    // Get crop info
    const crop = await Crop.findOne({ _id: cropId, user: req.user.id });
    if (!crop) {
      return res.status(404).json({ message: "Crop not found." });
    }

    const user = await User.findById(req.user.id);

    const diagnosis = await detectCropDisease({
      imageBuffer: req.file.buffer,
      mimeType:    req.file.mimetype,
      cropName:    crop.cropName,
      language:    user.language || "en"
    });

    crop.aiHistory.push({
      role:    "user",
      content: `[Disease Detection Request for ${crop.cropName} - image uploaded]`
    });
    crop.aiHistory.push({
      role:    "assistant",
      content: diagnosis
    });

    crop.aiHistory = crop.aiHistory.slice(-20);
    await crop.save();

    notifyUser(user, crop.cropName, diagnosis, "Disease Detection Report").catch(console.error);

    res.json({
      diagnosis,
      cropName:  crop.cropName,
      imageSize: `${(req.file.size / 1024).toFixed(1)} KB`
    });

  } catch (error) {
    console.error("detectDisease error:", error);
    res.status(500).json({ message: error.message });
  }
};

//send notification
const notifyUser = async (user, cropName, message, subject = "AgroVision Crop Update") => {
  const emailSubject = `${subject} — ${cropName}`;
  const emailBody    = `
Hello ${user.name},

Here is your AgroVision update for: ${cropName}

─────────────────────────────────────────
${message}
─────────────────────────────────────────

Stay updated with AgroVision.
Team AgroVision
`.trim();

  // Send email
  await sendEmail(user.email, emailSubject, emailBody);

  // Send SMS only if user opted in and has a phone number
  // SMS is shorter — we send only the first 300 chars
  if (user.phone) {
    const smsText = `AgroVision [${cropName}]: ${message.substring(0, 280)}...`;
    await sendSMS(user.phone, smsText);
  }
};