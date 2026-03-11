import cron from "node-cron";
import Crop from "../model/crop.js";
// import user from "../model/user.js"
import { getWeatherSummary } from "./weatherService.js";
import { getScheduledAdvice } from "./aiService.js";
import { sendEmail } from "./sendEmail.js";
import { sendSMS } from "./sendSms.js";

export const startScheduler = () => {
    cron.schedule("0 */3 * * *", async () => {
        console.log(`\n[CRON] Running scheduled advice — ${new Date().toLocaleString()}`);
        await runScheduledAdvice();
    });

    console.log("[CRON] Scheduler started — advice every 3 hours.");
};

const runScheduledAdvice = async () => {
    try {
        const crops = await Crop.find({ isActive: true }).populate("user", "name email phone language");
        console.log(`[CRON] Processing ${crops.length} crops...`);
        const BATCH_SIZE = 10;

        for (let i = 0; i < crops.length; i += BATCH_SIZE) {
            const batch = crops.slice(i, i + BATCH_SIZE);
            await Promise.allSettled(batch.map(crop => processSingleCrop(crop)));
            if (i + BATCH_SIZE < crops.length) {
                await sleep(2000);
            };
        };
        console.log("[CRON] Done");
        console.log(`[CRON] Processing ${crops.length} crops...`);
    } catch (error) {
        console.error("[CRON] Fatal error:", error.message);
    }
};

const processSingleCrop = async (crop) => {
    try {
        const user = crop.user;
        const weather = await getWeatherSummary(crop.location.lat, crop.location.lon);
        const advice = await getScheduledAdvice({ crop, weather, language: user.language || "en" });
        crop.lastAdviceAt = new Date();
        await crop.save();
        const subject = `AgroVision Update — ${crop.cropName} [${new Date().toLocaleTimeString()}]`;
        const body = `Hello ${user.name},\n\nScheduled update for: ${crop.cropName}\n\n${advice}\n\n— AgroVision AI`;
        await sendEmail(user.email, subject, body);
        if (user.phone) {
            await sendSMS(user.phone, `AgroVision [${crop.cropName}]: ${advice.substring(0, 240)}...`);
        };
        console.log(`[CRON] Sent advice for ${crop.cropName} (user: ${user.email})`);
    } catch (error) {
        console.error(`[CRON] Failed for crop ${crop._id}:`, error.message);
    }
};

const sleep = (ms) => new Promise(resolve => setTimeout(resolve,ms));