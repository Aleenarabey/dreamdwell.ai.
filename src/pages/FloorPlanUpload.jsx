import React, { useState } from "react";

function FloorplanUpload() {
  const [processedImageUrl, setProcessedImageUrl] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [file, setFile] = useState(null);

  // File validation and setup
  function handleFileChange(event) {
    const selectedFile = event.target.files[0];
    if (!selectedFile) return;

    const fileName = selectedFile.name.toLowerCase();
    if (
      !(
        fileName.endsWith(".png") ||
        fileName.endsWith(".jpg") ||
        fileName.endsWith(".jpeg")
      )
    ) {
      alert("Please select a PNG or JPG image file.");
      return;
    }
    setFile(selectedFile);
    setProcessedImageUrl(null);
    setUploadProgress(0);
  }

  // Upload with progress (useful for large images)
  function handleUploadClick() {
    if (!file) return;
    setIsUploading(true);
    setUploadProgress(0);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", "http://localhost:5000/analyze-floorplan");
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round(
          (event.loaded / event.total) * 100
        );
        setUploadProgress(percentComplete);
      }
    };
    xhr.onload = () => {
      setIsUploading(false);
      if (xhr.status === 200) {
        const blob = new Blob([xhr.response], { type: "image/jpeg" });
        const url = URL.createObjectURL(blob);
        setProcessedImageUrl(url);
      } else {
        alert("Upload failed");
      }
    };
    xhr.onerror = () => {
      setIsUploading(false);
      alert("Network error while uploading.");
    };
    xhr.responseType = "blob"; // Ensure image is returned as blob
    const formData = new FormData();
    formData.append("file", file);
    xhr.send(formData);
  }

  return (
    <div>
      <input
        type="file"
        accept=".png,.jpg,.jpeg"
        onChange={handleFileChange}
        disabled={isUploading}
      />
      <button onClick={handleUploadClick} disabled={!file || isUploading}>
        Upload & Recognize
      </button>

      {isUploading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {uploadProgress < 30
              ? "Uploading floor plan..."
              : uploadProgress < 90
              ? "Processing and recognizing..."
              : "Finalizing..."}{" "}
            ({uploadProgress}%)
          </p>
        </div>
      )}

      {processedImageUrl && (
        <div>
          <h4>Processed Floorplan:</h4>
          <img
            src={processedImageUrl}
            alt="Processed Floorplan"
            style={{ maxWidth: "100%", border: "1px solid #ccc", marginTop: "1rem" }}
          />
        </div>
      )}
    </div>
  );
}

export default FloorplanUpload;



