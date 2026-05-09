import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },

  fileFilter: (_req, file, cb) => {
    const allowed = [
      "audio/webm",
      "audio/wav",
      "audio/mpeg",
      "audio/mp4",
      "audio/ogg",
    ];

    if (!allowed.includes(file.mimetype)) {
      return cb(new Error("Invalid audio type"));
    }

    cb(null, true);
  },
});

export default upload;
