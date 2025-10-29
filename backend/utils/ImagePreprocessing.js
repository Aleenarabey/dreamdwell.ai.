import cv from 'opencv4nodejs-prebuilt-install';
import fs from 'fs';
import path from 'path';

/**
 * Image preprocessing utility functions for DreamDwell AI
 */
class ImagePreprocessor {
  /**
   * Helper method to read image from buffer or path
   * @param {Buffer|string} inputImage - Image buffer or path
   * @returns {cv.Mat} - OpenCV Mat object
   * @private
   */
  static _readImage(inputImage) {
    if (Buffer.isBuffer(inputImage)) {
      return cv.imdecode(inputImage);
    } else if (typeof inputImage === 'string') {
      return cv.imread(inputImage);
    } else {
      throw new Error('Input must be a Buffer or a file path string');
    }
  }

  /**
   * Helper method to convert Mat to Buffer
   * @param {cv.Mat} mat - OpenCV Mat object
   * @param {string} extension - Image extension (jpg, png)
   * @returns {Buffer} - Image buffer
   * @private
   */
  static _matToBuffer(mat, extension = '.jpg') {
    const encodedImage = cv.imencode(extension, mat);
    return Buffer.from(encodedImage);
  }

  /**
   * Resize an image to specified dimensions
   * @param {Buffer|string} inputImage - Image buffer or path
   * @param {number} width - Target width
   * @param {number} height - Target height
   * @returns {Promise<Buffer>} - Processed image buffer
   */
  static async resize(inputImage, width, height) {
    try {
      const mat = this._readImage(inputImage);
      const resized = mat.resize(height, width); // OpenCV uses (height, width) order
      return this._matToBuffer(resized);
    } catch (error) {
      console.error('Error in resize:', error);
      throw error;
    }
  }

  /**
   * Enhance image contrast and brightness
   * @param {Buffer|string} inputImage - Image buffer or path
   * @returns {Promise<Buffer>} - Processed image buffer
   */
  static async enhance(inputImage) {
    try {
      const mat = this._readImage(inputImage);
      
      // Convert to Lab color space for better enhancement
      const labMat = mat.cvtColor(cv.COLOR_BGR2Lab);
      
      // Split the Lab image into L, a, b channels
      const channels = labMat.split();
      
      // Apply CLAHE (Contrast Limited Adaptive Histogram Equalization) to L channel
      const clahe = new cv.CLAHE(2.0, new cv.Size(8, 8));
      const enhancedL = clahe.apply(channels[0]);
      
      // Merge the channels back
      channels[0] = enhancedL;
      const enhancedLab = new cv.Mat(channels);
      
      // Convert back to BGR
      const enhanced = enhancedLab.cvtColor(cv.COLOR_Lab2BGR);
      
      // Sharpen the image
      const kernel = new cv.Mat(3, 3, cv.CV_32F, [
        0, -1, 0,
        -1, 5, -1,
        0, -1, 0
      ]);
      const sharpened = enhanced.filter2D(cv.CV_8U, kernel);
      
      return this._matToBuffer(sharpened);
    } catch (error) {
      console.error('Error in enhance:', error);
      throw error;
    }
  }

  /**
   * Convert image to grayscale
   * @param {Buffer|string} inputImage - Image buffer or path
   * @returns {Promise<Buffer>} - Processed image buffer
   */
  static async toGrayscale(inputImage) {
    try {
      const mat = this._readImage(inputImage);
      const gray = mat.cvtColor(cv.COLOR_BGR2GRAY);
      return this._matToBuffer(gray);
    } catch (error) {
      console.error('Error in toGrayscale:', error);
      throw error;
    }
  }

  /**
   * Apply threshold to create binary image (useful for floor plan processing)
   * @param {Buffer|string} inputImage - Image buffer or path
   * @param {number} threshold - Threshold value (0-255)
   * @returns {Promise<Buffer>} - Processed image buffer
   */
  static async threshold(inputImage, threshold = 128) {
    try {
      const mat = this._readImage(inputImage);
      const gray = mat.cvtColor(cv.COLOR_BGR2GRAY);
      
      // Apply adaptive threshold for better results with floor plans
      const thresholded = gray.adaptiveThreshold(
        255,
        cv.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv.THRESH_BINARY,
        11,
        2
      );
      
      return this._matToBuffer(thresholded);
    } catch (error) {
      console.error('Error in threshold:', error);
      throw error;
    }
  }

  /**
   * Extract edges from an image (useful for floor plan processing)
   * @param {Buffer|string} inputImage - Image buffer or path
   * @returns {Promise<Buffer>} - Processed image buffer
   */
  static async extractEdges(inputImage) {
    try {
      const mat = this._readImage(inputImage);
      const gray = mat.cvtColor(cv.COLOR_BGR2GRAY);
      
      // Apply Gaussian blur to reduce noise
      const blurred = gray.gaussianBlur(new cv.Size(5, 5), 0);
      
      // Apply Canny edge detection
      const edges = blurred.canny(50, 150);
      
      return this._matToBuffer(edges);
    } catch (error) {
      console.error('Error in extractEdges:', error);
      throw error;
    }
  }

  /**
   * Crop image to specified region
   * @param {Buffer|string} inputImage - Image buffer or path
   * @param {number} left - Left position
   * @param {number} top - Top position
   * @param {number} width - Width of crop region
   * @param {number} height - Height of crop region
   * @returns {Promise<Buffer>} - Processed image buffer
   */
  static async crop(inputImage, left, top, width, height) {
    try {
      const mat = this._readImage(inputImage);
      const rect = new cv.Rect(left, top, width, height);
      const cropped = mat.getRegion(rect);
      return this._matToBuffer(cropped);
    } catch (error) {
      console.error('Error in crop:', error);
      throw error;
    }
  }
  
  /**
   * Detect lines in an image (useful for floor plan analysis)
   * @param {Buffer|string} inputImage - Image buffer or path
   * @returns {Promise<Object>} - Processed image buffer and detected lines
   */
  static async detectLines(inputImage) {
    try {
      const mat = this._readImage(inputImage);
      const gray = mat.cvtColor(cv.COLOR_BGR2GRAY);
      
      // Apply Gaussian blur and Canny edge detection
      const blurred = gray.gaussianBlur(new cv.Size(5, 5), 0);
      const edges = blurred.canny(50, 150);
      
      // Apply Hough Line Transform
      const lines = edges.houghLinesP(1, Math.PI / 180, 50, 50, 10);
      
      // Draw the lines on a copy of the original image
      const result = mat.copy();
      for (const line of lines) {
        const { x1, y1, x2, y2 } = line;
        result.drawLine(
          new cv.Point2(x1, y1),
          new cv.Point2(x2, y2),
          new cv.Vec3(0, 0, 255), // Red color in BGR
          2 // Line thickness
        );
      }
      
      return {
        image: this._matToBuffer(result),
        lines: lines.map(line => ({
          x1: line.x1,
          y1: line.y1,
          x2: line.x2,
          y2: line.y2
        }))
      };
    } catch (error) {
      console.error('Error in detectLines:', error);
      throw error;
    }
  }
  
  /**
   * Detect contours in an image (useful for room detection in floor plans)
   * @param {Buffer|string} inputImage - Image buffer or path
   * @returns {Promise<Object>} - Processed image buffer and detected contours
   */
  static async detectContours(inputImage) {
    try {
      const mat = this._readImage(inputImage);
      const gray = mat.cvtColor(cv.COLOR_BGR2GRAY);
      
      // Apply threshold to get binary image
      const thresholded = gray.adaptiveThreshold(
        255,
        cv.ADAPTIVE_THRESH_GAUSSIAN_C,
        cv.THRESH_BINARY_INV, // Invert to get white contours on black background
        11,
        2
      );
      
      // Find contours
      const contours = thresholded.findContours(
        cv.RETR_EXTERNAL,
        cv.CHAIN_APPROX_SIMPLE
      );
      
      // Filter contours by area to remove noise
      const significantContours = contours.filter(
        contour => contour.area > 500
      );
      
      // Draw contours on a copy of the original image
      const result = mat.copy();
      result.drawContours(
        significantContours,
        -1, // Draw all contours
        new cv.Vec3(0, 255, 0), // Green color in BGR
        2 // Thickness
      );
      
      return {
        image: this._matToBuffer(result),
        contours: significantContours.map(contour => ({
          area: contour.area,
          perimeter: contour.arcLength(true),
          points: contour.getPoints().map(point => ({
            x: point.x,
            y: point.y
          }))
        }))
      };
    } catch (error) {
      console.error('Error in detectContours:', error);
      throw error;
    }
  }
}

export default ImagePreprocessor;