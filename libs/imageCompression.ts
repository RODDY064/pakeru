import imageCompression from 'browser-image-compression';

export const compressImage = async (file: File, options = {}) => {
  const defaultOptions = {
    maxSizeMB: 1, 
    maxWidthOrHeight: 1920,
    useWebWorker: true,
    fileType: 'image/jpeg',
    quality: 1, 
    ...options
  };

  try {
    console.log(`Original file size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
    
    const compressedFile = await imageCompression(file, defaultOptions);
    
    console.log(`Compressed file size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
    
    return compressedFile;
  } catch (error) {
    console.error('Error compressing image:', error);
    return file; // Return original file if compression fails
  }
};

export const compressMultipleImages = async (files: File[], options = {}) => {
  const compressionPromises = files.map(file => compressImage(file, options));
  return Promise.all(compressionPromises);
};