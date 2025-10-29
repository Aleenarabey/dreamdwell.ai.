import multer from "multer";

const imageStorage = multer.memoryStorage(); // keep image in memory buffer

const imageUpload = multer({
  storage: imageStorage,
  fileFilter: (req, file, cb) => {
    const ext = file.mimetype.toLowerCase();
    if (ext === 'image/png' || ext === 'image/jpeg' || ext === 'image/jpg') {
      cb(null, true);
    } else {
      cb(new Error("Only PNG and JPG image files are allowed"));
    }
  }
});

export default imageUpload;
