import imageCompression from 'browser-image-compression';

export const compressImage = async (file: File, options = {}): Promise<File> => {
  const defaultOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 3000,
    useWebWorker: true,
    initialQuality: 0.85,
    ...options
  };

  try {
    console.log(`Original file size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
    
    const compressedFile = await imageCompression(file, defaultOptions);
    console.log(`Compressed file size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
    
    // Ensure we always return a proper File object
    if (compressedFile instanceof File) {
      return compressedFile;
    } else {
      const blob: Blob = compressedFile as Blob;
      return new File([blob], file.name, {
        type: blob.type || file.type,
        lastModified: Date.now()
      });
    }
  } catch (error) {
    console.error('Error compressing image:', error);
    return file; // Return original file if compression fails
  }
};

export const compressMultipleImages = async (files: File[], options = {}): Promise<File[]> => {
  const compressionPromises = files.map(file => compressImage(file, options));
  return Promise.all(compressionPromises);
};