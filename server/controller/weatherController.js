
import Crop from "../model/crop.js";
import { getWeatherSummary } from "../utils/weatherService.js";

export const getWeather = async(req, res) => {
    try {
        let lat = req.query.lat;
        let lon = req.query.lon;
        
        if(req.query.cropId) {
            const crop = await Crop.findOne({
                _id: req.query.cropId,
                user: req.user.id
            });
            if(!crop) {
                return res.status(404).json({message: "crop not found!"});
            }
            lon = crop.location.lon;
            lat = crop.location.lat;
        };
        if(!lat || !lon) {
            return res.status(400).json({message: "provide lat/lon or cropId"});
        };
        const weather = await getWeatherSummary(lat,lon);
        res.json(weather);
    } catch (error) {
        console.log("weather error: ", error);
        res.status(500).json({message: error.message});
    }
};