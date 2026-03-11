import multer from "multer";
import path from "path";

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    const allowed = ["image/jpeg", "image/jpg", "image/png", "image/wepb"];
    if(allowed.includes(file.mimetype)) {
        cb(null , true);
    }else {
    cb(
      new Error("Only JPEG, PNG, and WebP images are allowed."), false
    );
  }
};

const upload = multer({
    storage, fileFilter, limits: {fileSize: 5 * 1024 * 1024, files: 1}
});

export const uploadSingle = (fieldName) => upload.single(fieldName);

export const handleUploadError = (err, req, res, next) => {
    if(err instanceof multer.MulterError) {
        if(err.code === "LIMIT_FILE_SIZE") {
            return res.status(404).json({message: "Image size is too large. Maximum size is 5mb"})
        }
        return res.status(400).json(err.message);
    };
    if(err) {
        return res.status(400).json({message: err.message});
    };
    next();
};