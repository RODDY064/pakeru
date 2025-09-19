export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  
  productTransforms: {
    thumbnail: 'c_fill,w_300,h_400,q_auto,f_auto',
    hero: 'c_fill,w_700,h_550,q_auto,f_auto',
    small: 'c_fill,w_250,h_300,q_auto,f_auto',
  },
  
  // Quality settings
  quality: {
    low: 'q_60',
    medium: 'q_75', 
    high: 'q_90',
    auto: 'q_auto',
  },
  
  // Format optimization
  format: 'f_auto', 
};


export const buildCloudinaryUrl = (
  publicId: string,
  transforms?: string
): string => {
  const baseUrl = `https://res.cloudinary.com/${cloudinaryConfig.cloudName}/image/upload/`;
  return transforms ? `${baseUrl}${transforms}/${publicId}` : `${baseUrl}${publicId}`;
};
