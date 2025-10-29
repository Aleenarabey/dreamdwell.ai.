import React, { useState } from 'react';

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

const FloorPlanImageUpload = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Limit to PNG and JPG files
    const fileName = file.name.toLowerCase();
    if (!(fileName.endsWith('.png') || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg'))) {
      alert('Please select a PNG or JPG image file.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Read file as ArrayBuffer
      const arrayBuffer = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
      });
      
      // Split into chunks (default 1MB chunks)
      const chunks = splitArrayBufferIntoChunks(arrayBuffer);
      const totalChunks = chunks.length;
      
      // Upload metadata first
      const metadataResponse = await fetch('http://localhost:5000/upload/init', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filename: file.name,
          fileSize: file.size,
          totalChunks,
          mimeType: file.type || 'application/octet-stream'
        }),
      });
      
      if (!metadataResponse.ok) {
        throw new Error('Failed to initialize upload');
      }
      
      const { uploadId } = await metadataResponse.json();
      
      // Upload each chunk
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const formData = new FormData();
        formData.append('chunk', new Blob([chunk]));
        formData.append('uploadId', uploadId);
        formData.append('chunkIndex', i);
        
        const chunkResponse = await fetch('http://localhost:5000/upload/chunk', {
          method: 'POST',
          body: formData,
        });
        
        if (!chunkResponse.ok) {
          throw new Error(`Failed to upload chunk ${i}`);
        }
        
        // Update progress
        setUploadProgress(Math.round(((i + 1) / totalChunks) * 100));
      }
      
      // Finalize upload
      const finalizeResponse = await fetch('http://localhost:5000/upload/finalize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uploadId,
        }),
      });
      
      if (!finalizeResponse.ok) {
        throw new Error('Failed to finalize upload');
      }
      
      alert('Upload complete!');
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Error during upload: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <input 
        type="file" 
        accept=".png,.jpg,.jpeg" 
        onChange={handleFileChange} 
        disabled={isUploading}
      />
      
      {isUploading && (
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-1">
            Uploading: {uploadProgress}%
          </p>
        </div>
      )}
    </div>
  );
};

export default FloorPlanImageUpload;

