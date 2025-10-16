// Data utilities for the application

export const imageInfo = {
  // Placeholder data - you can replace this with actual data
  default: {
    id: 'default',
    name: 'Default Image',
    description: 'Default image description',
    url: '/placeholder.jpg'
  }
};

export const getImageInfo = (id) => {
  return imageInfo[id] || imageInfo.default;
};

export const getAllImageInfo = () => {
  return Object.values(imageInfo);
};
