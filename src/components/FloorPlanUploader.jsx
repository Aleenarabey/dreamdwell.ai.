import React, { useState, useRef } from 'react';

// Helper function to split ArrayBuffer into chunks
const splitArrayBufferIntoChunks = (arrayBuffer, chunkSize = 1024 * 1024) => {
  const chunks = [];
  const totalSize = arrayBuffer.byteLength;
  let offset = 0;
  
  while (offset < totalSize) {
    const size = Math.min(chunkSize, totalSize - offset);
    chunks.push(arrayBuffer.slice(offset, offset + size));
    offset += size;
  }
  
  return chunks;
};

const FloorPlanUploader = ({ onDone, onCancel }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Check if file is a PNG or JPG image
    const fileName = file.name.toLowerCase();
    if (!(fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg'))) {
      setError('Please select a PNG or JPG image file.');
      setSelectedFile(null);
      setPreviewUrl(null);
      return;
    }

    setError(null);
    setSelectedFile(file);
    
    // Generate preview for image files
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      
      // Check if file is a PNG or JPG image
      const fileName = file.name.toLowerCase();
      if (!(fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg'))) {
        setError('Please select a PNG or JPG image file.');
        return;
      }
      
      setError(null);
      setSelectedFile(file);
      
      // Generate preview for image files
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current.click();
  };

  // Simulate smart recognition and processing - faster version
  const processWithSmartRecognition = async (file) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Simulate processing with progress updates - faster to avoid blocking
      for (let progress = 0; progress <= 100; progress += 20) {
        setUploadProgress(progress);
        // Minimal delay to show progress but not block
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      
      // Always return success to ensure the process continues
      return true;
    } catch (error) {
      console.error("Error in smart recognition processing:", error);
      return true; // Return true even on error to ensure the process continues
    } finally {
      setIsUploading(false);
    }
  };

  const handleDone = async () => {
    if (selectedFile) {
      // Skip server upload and directly pass the file to parent component
      onDone(selectedFile);
    }
  };
  
  const handleSmartRecognition = async () => {
    if (selectedFile) {
      try {
        const success = await processWithSmartRecognition(selectedFile);
        if (success) {
          // Directly pass the file to parent component without waiting for backend
          onDone(selectedFile);
        }
      } catch (error) {
        console.error("Error in smart recognition:", error);
        // Even if smart recognition fails, still pass the file to parent
        onDone(selectedFile);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl p-6">
        <h2 className="text-2xl font-semibold mb-4">Import Floor Plan Image</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        <div 
          className={`border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4 text-center ${isUploading ? 'cursor-not-allowed' : 'cursor-pointer'}`}
          onDragOver={!isUploading ? handleDragOver : undefined}
          onDrop={!isUploading ? handleDrop : undefined}
          onClick={!isUploading ? handleBrowseClick : undefined}
        >
          <input 
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".png,.jpg,.jpeg"
            className="hidden"
            disabled={isUploading}
          />
          
          {isUploading ? (
            <div>
              <div className="mb-4">
                <div className="bg-gray-100 p-4 rounded-md flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  {uploadProgress < 30 ? 'Analyzing floor plan...' : 
                   uploadProgress < 60 ? 'Recognizing room layouts...' : 
                   uploadProgress < 90 ? 'Finalizing recognition...' : 
                   'Preparing floor plan...'}
                </p>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                {uploadProgress}% complete
              </p>
            </div>
          ) : selectedFile ? (
            <div>
              <div className="mb-4">
                <div className="bg-gray-100 p-4 rounded-md flex items-center justify-center">
                  {previewUrl ? (
                    <img 
                      src={previewUrl} 
                      alt="Floor plan preview" 
                      className="max-h-48 max-w-full object-contain"
                    />
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  )}
                </div>
                <p className="mt-2 text-sm text-gray-600">{selectedFile.name}</p>
              </div>
              <p className="text-sm text-gray-500">Click to select a different file</p>
            </div>
          ) : (
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="mt-2 text-sm text-gray-600">Drag and drop a floor plan image here, or click to select a file</p>
              <p className="mt-1 text-xs text-gray-500">Supported files: .png, .jpg, .jpeg</p>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-3">
          <button 
            onClick={onCancel}
            disabled={isUploading}
            className={`px-4 py-2 border border-gray-300 rounded-md text-gray-700 ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'}`}
          >
            Cancel
          </button>
          <button 
            onClick={handleSmartRecognition}
            disabled={!selectedFile || isUploading}
            className={`px-4 py-2 rounded-md text-white ${
              !selectedFile || isUploading 
                ? 'bg-green-300 cursor-not-allowed' 
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isUploading ? 'Processing...' : 'Smart Recognition'}
          </button>
          <button 
            onClick={handleDone}
            disabled={!selectedFile || isUploading}
            className={`px-4 py-2 rounded-md text-white ${
              !selectedFile || isUploading 
                ? 'bg-blue-300 cursor-not-allowed' 
                : 'bg-blue-500 hover:bg-blue-600'
            }`}
          >
            {isUploading ? 'Uploading...' : 'Import'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FloorPlanUploader;