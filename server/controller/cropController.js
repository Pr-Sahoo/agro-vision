import Crop from "../model/crop.js";

export const createCrop = async(req, res) => {    //post /api/crops
    try {
        const {cropName, cropType, variety, area, areaUnit, soilType, plantingDate, harvestTarget, location, notifyEmail, notifySMS} = req.body;
        if (!cropName || !location?.lat || !location?.lon) {
      return res.status(400).json({
        message: "cropName and location (lat, lon) are required."
      });
    };
    const newCrop = await Crop.create({
        user: req.user.id,
        cropName,
        cropType,
        variety,
        area,
        areaUnit: areaUnit || "acres",
        soilType,
        plantingDate: plantingDate ? new Date(plantingDate) : null,
        harvestTarget: harvestTarget ? new Date(harvestTarget) : null,
        location:  {
            lat: parseFloat(location.lat),
            lon: parseFloat(location.lon),
            city: location.city || ""
        },
        notifyEmail: notifyEmail !== undefined ? notifyEmail : true,
        notifySMS: notifySMS !== undefined ? notifySMS : false
    });
    res.status(201).json({message: "crop created successfully", crop:newCrop});
    } catch (error) {
        console.log("create crop error ", error);
        res.status(500).json({message: error.message});
    };
};

//get/api/crops

export const getCrops = async(req, res) =>{
    try {
        const crops = await Crop.find({
        user: req.user.id,
        isActive: true
    }).select("-aiHistory").sort({createdAt: -1});
    res.json(crops);
    } catch (error) {
        return res.status(500).json({message: error.message})
    }
};

// GET /api/crops/:id
// Get single crop WITH its AI history (for the detail/chat page)

export const getCropById = async(req, res) => {
    try {
        const crop = await Crop.findOne({
            _id: req.params.id,
            user: req.user.id
        });
        if(!crop) {
            return res.status(404).json({message: "crop not found"});
        };
        res.json(crop);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
};

// DELETE /api/crops/:id
// Soft delete — sets isActive=false instead of removing from DB

export const deleteCrop = async(req,res) => {
    try {
        const crop = await Crop.findOneAndUpdate(
            {_id: req.params.id, user: req.user.id},
            {isActive: false},
            {new: true}
        );

        if(!crop) {
            return res.status(404).json({message: "Crop not found"});
        };
        res.json({message: "crop removed successfully"});
    } catch (error) {
        return res.status(500).json({message: error.message});
    };
};

