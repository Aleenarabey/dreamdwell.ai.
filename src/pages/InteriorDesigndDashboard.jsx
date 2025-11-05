import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { FaFile, FaSave, FaUndo, FaRedo, FaCubes, FaFolderOpen, FaCloud, FaUser, FaMagic, FaWrench, FaList, FaPencilRuler, FaQuestionCircle, FaCompass, FaCamera, FaImages, FaRegClone, FaChevronLeft, FaChevronRight, FaChevronUp, FaChevronDown, FaEye } from 'react-icons/fa';
import { IoIosCube } from "react-icons/io";
import nipplejs from 'nipplejs';
import { Stage, Layer, Line, Rect, Text, Transformer, Path, Image as KonvaImage } from 'react-konva';
import TemplateUploader from './TemplateUploader';
import FloorPlanUploader from '../components/FloorPlanUploader';
import Tesseract from 'tesseract.js';

// FloorplanImage component for handling image loading
const FloorplanImage = ({ src, width, height, opacity, listening }) => {
  const [image, setImage] = React.useState(null);
  const [dimensions, setDimensions] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    const img = new window.Image();
    img.src = src;
    img.onload = () => {
      setImage(img);
      
      // Calculate dimensions to fit the image properly on the canvas
      const maxWidth = window.innerWidth * 0.8;
      const maxHeight = window.innerHeight * 0.8;
      
      let newWidth = img.width;
      let newHeight = img.height;
      
      // Scale down if image is too large
      if (newWidth > maxWidth) {
        const scale = maxWidth / newWidth;
        newWidth = maxWidth;
        newHeight = newHeight * scale;
      }
      
      if (newHeight > maxHeight) {
        const scale = maxHeight / newHeight;
        newHeight = maxHeight;
        newWidth = newWidth * scale;
      }
      
      setDimensions({
        width: newWidth,
        height: newHeight
      });
    };
  }, [src]);

  return image ? (
    <KonvaImage
      image={image}
      width={dimensions.width || width}
      height={dimensions.height || height}
      opacity={opacity}
      listening={listening}
      x={(window.innerWidth - (dimensions.width || width)) / 2}
      y={(window.innerHeight - (dimensions.height || height)) / 2}
    />
  ) : null;
};

// Import room categories data
const roomCategories = [
    {
        id: 'northern_europe_modern_minimalist',
        name: 'Northern Europe Modern Minimalist',
        count: 5,
        color: 'f3f4f6', // gray-100
        style: 'Modern Minimalist',
        size: '28m²',
        configuration: '2 bedrooms, 1 bathroom',
        building: 'Scandinavian Apartment',
        rooms: [
            { name: 'Living room', placeholderColor: 'f3f4f6', text: 'Living room' },
            { name: 'Kitchen', placeholderColor: 'f3f4f6', text: 'Kitchen' },
            { name: 'Master room', placeholderColor: 'f3f4f6', text: 'Master room' },
            { name: 'Guest room', placeholderColor: 'f3f4f6', text: 'Guest room' },
            { name: 'Bathroom', placeholderColor: 'f3f4f6', text: 'Bathroom' },
        ]
    },
    {
        id: 'light_luxury',
        name: 'Light luxury',
        count: 5,
        color: 'e5e7eb', // gray-200
        style: 'Light luxury',
        size: '25m²',
        configuration: '1 bedroom, 1 bathroom',
        building: 'Modern Apartment',
        rooms: [
            { name: 'Living room', placeholderColor: 'e5e7eb', text: 'Living room' },
            { name: 'Restaurant', placeholderColor: 'e5e7eb', text: 'Restaurant' },
            { name: 'Master room', placeholderColor: 'e5e7eb', text: 'Master room' },
            { name: 'Guest room', placeholderColor: 'e5e7eb', text: 'Guest room' },
            { name: 'Guest room 2', placeholderColor: 'e5e7eb', text: 'Guest room 2' },
        ]
    },
    {
        id: 'kitchen',
        name: 'Kitchen',
        count: 12,
        color: 'f87171', // red-400
        rooms: [
            { name: 'Cooking Zone', placeholderColor: 'e11d48', text: 'Stove Area' },
            { name: 'Dining Nook', placeholderColor: 'facc15', text: 'Breakfast Bar' },
            { name: 'Pantry', placeholderColor: 'fb923c', text: 'Storage' },
            { name: 'Island', placeholderColor: 'a16207', text: 'Center Island' },
        ]
    },
    {
        id: 'living',
        name: 'Living Room',
        count: 8,
        color: '93c5fd', // blue-300
        rooms: [
            { name: 'Living room', placeholderColor: '22c55e', text: 'Sofa View' },
            { name: 'Restaurant', placeholderColor: '0ea5e9', text: 'Dining Area' },
            { name: 'Master room', placeholderColor: 'f472b6', text: 'Bedroom Suite' },
            { name: 'Guest room', placeholderColor: '6366f1', text: 'Spare Bed' },
            { name: 'Study', placeholderColor: '10b981', text: 'Home Office' },
            { name: 'Balcony', placeholderColor: 'fb7185', text: 'Outdoor View' },
        ]
    },
    { id: 'bathroom', name: 'Bathroom', count: 6, color: '6ee7b7', rooms: [{ name: 'Shower', placeholderColor: '14b8a6', text: 'Shower' }, { name: 'Vanity', placeholderColor: '06b6d4', text: 'Vanity' }] },
    { id: 'dressing', name: 'Dressing Room', count: 4, color: 'fcd34d', rooms: [{ name: 'Closet', placeholderColor: 'f97316', text: 'Walk-in Closet' }, { name: 'Mirror Area', placeholderColor: 'a3e635', text: 'Makeup Spot' }] },
    { id: 'washroom', name: 'Washroom', count: 5, color: 'a5b4fc', rooms: [{ name: 'Laundry', placeholderColor: '8b5cf6', text: 'Washer/Dryer' }, { name: 'Sink', placeholderColor: 'e879f9', text: 'Utility Sink' }] },
    { id: 'storeroom', name: 'Storeroom', count: 3, color: 'd8b4fe', rooms: [{ name: 'Shelves', placeholderColor: 'c026d3', text: 'Shelving' }] },
    { id: 'hall', name: 'Hallway', count: 7, color: 'fbcfe8', rooms: [{ name: 'Entrance', placeholderColor: 'be185d', text: 'Foyer' }] },
    { id: 'terrace', name: 'Terrace', count: 2, color: 'a7f3d0', rooms: [{ name: 'Patio', placeholderColor: '059669', text: 'Outdoor Dining' }] },
];

// Template on Canvas Component
const TemplateOnCanvas = ({ selectedCategory, rotation }) => {
  const [activeRoom, setActiveRoom] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [modalImageSrc, setModalImageSrc] = React.useState('');
  const [modalImageAlt, setModalImageAlt] = React.useState('');
  const [showSubTemplates, setShowSubTemplates] = React.useState(true);

  // Define sub-templates for different room types
  const subTemplates = {
    'northern_europe_modern_minimalist': [
      { id: 'living', name: 'Living Room', placeholderColor: '93c5fd' },
      { id: 'kitchen', name: 'Kitchen', placeholderColor: 'f87171' },
      { id: 'bathroom', name: 'Bathroom', placeholderColor: '6ee7b7' },
      { id: 'hall', name: 'Hall', placeholderColor: 'fbcfe8' }
    ],
    'light_luxury': [
      { id: 'living', name: 'Living Room', placeholderColor: '93c5fd' },
      { id: 'kitchen', name: 'Kitchen', placeholderColor: 'f87171' },
      { id: 'bathroom', name: 'Bathroom', placeholderColor: '6ee7b7' },
      { id: 'hall', name: 'Hall', placeholderColor: 'fbcfe8' }
    ],
    'kitchen': [
      { id: 'hall', name: 'Hall', placeholderColor: 'fbcfe8' },
      { id: 'kitchen', name: 'Kitchen', placeholderColor: 'f87171' },
      { id: 'storeroom', name: 'Storeroom', placeholderColor: 'd8b4fe' },
      { id: 'bathroom', name: 'Bathroom', placeholderColor: '6ee7b7' }
    ],
    'living': [
      { id: 'hall', name: 'Hall', placeholderColor: 'fbcfe8' },
      { id: 'kitchen', name: 'Kitchen', placeholderColor: 'f87171' },
      { id: 'storeroom', name: 'Storeroom', placeholderColor: 'd8b4fe' },
      { id: 'bathroom', name: 'Bathroom', placeholderColor: '6ee7b7' }
    ],
    'bathroom': [
      { id: 'hall', name: 'Hall', placeholderColor: 'fbcfe8' },
      { id: 'kitchen', name: 'Kitchen', placeholderColor: 'f87171' },
      { id: 'storeroom', name: 'Storeroom', placeholderColor: 'd8b4fe' }
    ],
    'dressing': [
      { id: 'hall', name: 'Hall', placeholderColor: 'fbcfe8' },
      { id: 'kitchen', name: 'Kitchen', placeholderColor: 'f87171' },
      { id: 'bathroom', name: 'Bathroom', placeholderColor: '6ee7b7' }
    ],
    'washroom': [
      { id: 'hall', name: 'Hall', placeholderColor: 'fbcfe8' },
      { id: 'kitchen', name: 'Kitchen', placeholderColor: 'f87171' },
      { id: 'storeroom', name: 'Storeroom', placeholderColor: 'd8b4fe' }
    ],
    'storeroom': [
      { id: 'hall', name: 'Hall', placeholderColor: 'fbcfe8' },
      { id: 'kitchen', name: 'Kitchen', placeholderColor: 'f87171' },
      { id: 'bathroom', name: 'Bathroom', placeholderColor: '6ee7b7' }
    ],
    'hall': [
      { id: 'kitchen', name: 'Kitchen', placeholderColor: 'f87171' },
      { id: 'storeroom', name: 'Storeroom', placeholderColor: 'd8b4fe' },
      { id: 'bathroom', name: 'Bathroom', placeholderColor: '6ee7b7' }
    ],
    'terrace': [
      { id: 'hall', name: 'Hall', placeholderColor: 'fbcfe8' },
      { id: 'kitchen', name: 'Kitchen', placeholderColor: 'f87171' },
      { id: 'storeroom', name: 'Storeroom', placeholderColor: 'd8b4fe' }
    ]
  };

  const category = React.useMemo(() => {
    return roomCategories.find(c => c.id === selectedCategory);
  }, [selectedCategory]);

  React.useEffect(() => {
    if (category && category.rooms.length > 0) {
      setActiveRoom(category.rooms[0].name);
      setShowSubTemplates(true); // Always show sub-templates when a new template is selected
    } else {
      setActiveRoom('');
    }
    
    // Prevent any scrolling when a template is selected
    const scrollableElements = document.querySelectorAll('.custom-scrollbar, .overflow-y-auto, .overflow-auto');
    scrollableElements.forEach(element => {
      element.style.overflow = 'hidden';
      element.scrollTop = 0;
    });
    
    // Also prevent body scrolling
    document.body.style.overflow = 'hidden';
    
    // Ensure the canvas container doesn't scroll
    const canvasContainer = document.querySelector('.design-canvas');
    if (canvasContainer) {
      canvasContainer.style.overflow = 'hidden';
    }
    
    return () => {
      // Restore scrolling when component unmounts
      document.body.style.overflow = '';
      scrollableElements.forEach(element => {
        element.style.overflow = '';
      });
      if (canvasContainer) {
        canvasContainer.style.overflow = '';
      }
    };
  }, [category]);

  const activeRoomData = React.useMemo(() => {
    if (!category) return null;
    return category.rooms.find(room => room.name === activeRoom) || category.rooms[0];
  }, [category, activeRoom]);

  const openModal = React.useCallback((src, alt) => {
    setModalImageSrc(src);
    setModalImageAlt(alt);
    setIsModalOpen(true);
  }, []);

  const closeModal = React.useCallback(() => {
    setIsModalOpen(false);
    setModalImageSrc('');
    setModalImageAlt('');
  }, []);

  if (!category) {
    return (
      <div className="flex items-center justify-center h-full bg-white rounded-2xl shadow-xl">
        <p className="text-gray-500 text-xl">Template not found.</p>
      </div>
    );
  }

  if (!activeRoomData) {
    return (
      <div className="flex items-center justify-center h-full bg-white rounded-2xl shadow-xl">
        <p className="text-gray-500 text-xl">No rooms found for this template.</p>
      </div>
    );
  }

  // Use realistic interior design images based on the room type
  let mainImageSrc;
  if (activeRoomData.name === 'Living room') {
    mainImageSrc = "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
  } else if (activeRoomData.name === 'Restaurant') {
    mainImageSrc = "https://images.unsplash.com/photo-1594077135872-f2db2c1afc60?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
  } else if (activeRoomData.name === 'Master room') {
    mainImageSrc = "https://images.unsplash.com/photo-1616593969747-4797dc75033e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
  } else if (activeRoomData.name === 'Guest room') {
    mainImageSrc = "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
  } else {
    // Fallback to placeholder if no matching image
    const mainImageText = `${category.name}+${activeRoomData.name.replace(/ /g, '+')}`;
    mainImageSrc = `https://placehold.co/1200x800/${activeRoomData.placeholderColor}/FFFFFF?text=${mainImageText}`;
  }
  
  const mainImageAlt = `${category.name} main view: ${activeRoomData.name}`;

  // Main template display on the grid canvas - positioned to fill the canvas without scrolling
  const renderMainTemplateOnCanvas = () => {
    // Use specific images for templates
    let displayImageSrc = mainImageSrc;
    
    // Northern Europe Modern Minimalist template
    if (category.id === 'northern_europe_modern_minimalist') {
      if (activeRoomData.name === 'Living room') {
        displayImageSrc = "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      } else if (activeRoomData.name === 'Kitchen') {
        displayImageSrc = "https://images.unsplash.com/photo-1588854337236-6889d631faa8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      } else if (activeRoomData.name === 'Master room') {
        displayImageSrc = "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      } else if (activeRoomData.name === 'Guest room') {
        displayImageSrc = "https://images.unsplash.com/photo-1616593969747-4797dc75033e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      } else if (activeRoomData.name === 'Bathroom') {
        displayImageSrc = "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      }
    } 
    // Light Luxury template
    else if (category.id === 'light_luxury') {
      if (activeRoomData.name === 'Living room') {
        displayImageSrc = "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      } else if (activeRoomData.name === 'Restaurant') {
        displayImageSrc = "https://images.unsplash.com/photo-1616627561950-9f746e330187?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      } else if (activeRoomData.name === 'Master room') {
        displayImageSrc = "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      } else if (activeRoomData.name === 'Guest room') {
        displayImageSrc = "https://images.unsplash.com/photo-1616137422495-1e9e46e2aa77?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      }
    }
    // Modern template
    else if (category.id === 'modern') {
      if (activeRoomData.name === 'Living room') {
        displayImageSrc = "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      } else if (activeRoomData.name === 'Restaurant') {
        displayImageSrc = "https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      } else if (activeRoomData.name === 'Master room') {
        displayImageSrc = "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      } else if (activeRoomData.name === 'Guest room') {
        displayImageSrc = "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      } else if (activeRoomData.name === 'Kitchen') {
        displayImageSrc = "https://images.unsplash.com/photo-1556911220-bda9f7f7597b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      } else if (activeRoomData.name === 'Bathroom') {
        displayImageSrc = "https://images.unsplash.com/photo-1600566752355-35792bedcfea?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      }
    }
    // Northern Europe template
    else if (category.id === 'northern_europe') {
      if (activeRoomData.name === 'Living room') {
        displayImageSrc = "https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      } else if (activeRoomData.name === 'Restaurant') {
        displayImageSrc = "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      } else if (activeRoomData.name === 'Master room') {
        displayImageSrc = "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      } else if (activeRoomData.name === 'Guest room') {
        displayImageSrc = "https://images.unsplash.com/photo-1551298370-9d3d53740c72?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      } else if (activeRoomData.name === 'Kitchen') {
        displayImageSrc = "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      } else if (activeRoomData.name === 'Bathroom') {
        displayImageSrc = "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      }
    }
    // Minimalist template
    else if (category.id === 'minimalist') {
      if (activeRoomData.name === 'Living room') {
        displayImageSrc = "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      } else if (activeRoomData.name === 'Restaurant') {
        displayImageSrc = "https://images.unsplash.com/photo-1494526585095-c41746248156?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      } else if (activeRoomData.name === 'Master room') {
        displayImageSrc = "https://images.unsplash.com/photo-1588046130717-0eb0c9a3ba15?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      } else if (activeRoomData.name === 'Guest room') {
        displayImageSrc = "https://images.unsplash.com/photo-1585128792020-803d29415281?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      } else if (activeRoomData.name === 'Kitchen') {
        displayImageSrc = "https://images.unsplash.com/photo-1574739782594-db4ead022697?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      } else if (activeRoomData.name === 'Bathroom') {
        displayImageSrc = "https://images.unsplash.com/photo-1600566752355-35792bedcfea?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      }
    }
    // Kitchen template
    else if (category.id === 'kitchen') {
      if (activeRoomData.name === 'Cooking Zone') {
        displayImageSrc = "https://images.unsplash.com/photo-1556911220-bda9f7f7597b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      } else if (activeRoomData.name === 'Dining Nook') {
        displayImageSrc = "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      } else if (activeRoomData.name === 'Pantry') {
        displayImageSrc = "https://images.unsplash.com/photo-1600585152220-90363fe7e115?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      } else if (activeRoomData.name === 'Island') {
        displayImageSrc = "https://images.unsplash.com/photo-1556909114-44e3e9699e2b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      }
    }
    // Living Room template
    else if (category.id === 'living') {
      if (activeRoomData.name === 'Living room') {
        displayImageSrc = "https://images.unsplash.com/photo-1615529328331-f8917597711f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      } else if (activeRoomData.name === 'Restaurant') {
        displayImageSrc = "https://images.unsplash.com/photo-1617806118233-18e1de247200?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      } else if (activeRoomData.name === 'Master room') {
        displayImageSrc = "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      } else if (activeRoomData.name === 'Guest room') {
        displayImageSrc = "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      } else if (activeRoomData.name === 'Study') {
        displayImageSrc = "https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      } else if (activeRoomData.name === 'Balcony') {
        displayImageSrc = "https://images.unsplash.com/photo-1580237072617-771c3ecc4a24?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      }
    }
    // Bathroom template
    else if (category.id === 'bathroom') {
      if (activeRoomData.name === 'Shower') {
        displayImageSrc = "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      } else if (activeRoomData.name === 'Vanity') {
        displayImageSrc = "https://images.unsplash.com/photo-1600566752355-35792bedcfea?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      }
    }
    // Dressing Room template
    else if (category.id === 'dressing') {
      if (activeRoomData.name === 'Closet') {
        displayImageSrc = "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      } else if (activeRoomData.name === 'Mirror Area') {
        displayImageSrc = "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      }
    }
    // Washroom template
    else if (category.id === 'washroom') {
      if (activeRoomData.name === 'Laundry') {
        displayImageSrc = "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      } else if (activeRoomData.name === 'Sink') {
        displayImageSrc = "https://images.unsplash.com/photo-1600566752355-35792bedcfea?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      }
    }
    // Storeroom template
    else if (category.id === 'storeroom') {
      if (activeRoomData.name === 'Shelves') {
        displayImageSrc = "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      }
    }
    // Hall template
    else if (category.id === 'hall') {
      if (activeRoomData.name === 'Entrance') {
        displayImageSrc = "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      }
    }
    // Terrace template
    else if (category.id === 'terrace') {
      if (activeRoomData.name === 'Patio') {
        displayImageSrc = "https://images.unsplash.com/photo-1580237072617-771c3ecc4a24?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
      }
    }
    
    return (
      <div className="absolute inset-0 z-10">
        <img
          src={displayImageSrc}
          alt={mainImageAlt}
          className="w-full h-full object-cover"
          style={{ transform: `rotate(${rotation}deg)` }}
          onError={(e) => e.target.src = `https://placehold.co/1200x800/94a3b8/FFFFFF?text=Error:+${activeRoomData.name.replace(/ /g, '+')}`}
        />
        <div className="absolute bottom-4 right-4 text-right text-white text-shadow-md p-2 rounded-lg bg-black/30">
          <p className="text-sm font-light">{category.size || (category.count * 105 + 'm²')}</p>
          <p className="text-xs font-light opacity-80">Used 10001 Time</p>
        </div>
      </div>
    );
  };

  // Room thumbnails at the bottom of the main image - exactly like in the screenshot
  const renderRoomThumbnails = () => {
    return (
      <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-2 z-20 pb-2">
        {category.rooms.map((room) => {
          // Use realistic room images based on room type and category
          let roomImageSrc;
          
          // Northern Europe Modern Minimalist template
          if (category.id === 'northern_europe_modern_minimalist') {
            if (room.name === 'Living room') {
              roomImageSrc = "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else if (room.name === 'Kitchen') {
              roomImageSrc = "https://images.unsplash.com/photo-1588854337236-6889d631faa8?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else if (room.name === 'Master room') {
              roomImageSrc = "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else if (room.name === 'Guest room') {
              roomImageSrc = "https://images.unsplash.com/photo-1616593969747-4797dc75033e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else if (room.name === 'Bathroom') {
              roomImageSrc = "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else {
              roomImageSrc = "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            }
          } 
          // Light Luxury template
          else if (category.id === 'light_luxury') {
            if (room.name === 'Living room') {
              roomImageSrc = "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else if (room.name === 'Restaurant') {
              roomImageSrc = "https://images.unsplash.com/photo-1616627561950-9f746e330187?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else if (room.name === 'Master room') {
              roomImageSrc = "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else if (room.name === 'Guest room') {
              roomImageSrc = "https://images.unsplash.com/photo-1616137422495-1e9e46e2aa77?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else {
              roomImageSrc = "https://images.unsplash.com/photo-1616593969747-4797dc75033e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            }
          }
          // Modern template
          else if (category.id === 'modern') {
            if (room.name === 'Living room') {
              roomImageSrc = "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else if (room.name === 'Restaurant') {
              roomImageSrc = "https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else if (room.name === 'Master room') {
              roomImageSrc = "https://images.unsplash.com/photo-1567767292278-a4f21aa2d36e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else if (room.name === 'Guest room') {
              roomImageSrc = "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else if (room.name === 'Kitchen') {
              roomImageSrc = "https://images.unsplash.com/photo-1556911220-bda9f7f7597b?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else if (room.name === 'Bathroom') {
              roomImageSrc = "https://images.unsplash.com/photo-1600566752355-35792bedcfea?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else {
              roomImageSrc = "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            }
          }
          // Northern Europe template
          else if (category.id === 'northern_europe') {
            if (room.name === 'Living room') {
              roomImageSrc = "https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else if (room.name === 'Restaurant') {
              roomImageSrc = "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else if (room.name === 'Master room') {
              roomImageSrc = "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else if (room.name === 'Guest room') {
              roomImageSrc = "https://images.unsplash.com/photo-1551298370-9d3d53740c72?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else if (room.name === 'Kitchen') {
              roomImageSrc = "https://images.unsplash.com/photo-1556909212-d5b604d0c90d?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else if (room.name === 'Bathroom') {
              roomImageSrc = "https://images.unsplash.com/photo-1584622781564-1d987f7333c1?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else {
              roomImageSrc = "https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            }
          }
          // Minimalist template
          else if (category.id === 'minimalist') {
            if (room.name === 'Living room') {
              roomImageSrc = "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else if (room.name === 'Restaurant') {
              roomImageSrc = "https://images.unsplash.com/photo-1494526585095-c41746248156?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else if (room.name === 'Master room') {
              roomImageSrc = "https://images.unsplash.com/photo-1588046130717-0eb0c9a3ba15?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else if (room.name === 'Guest room') {
              roomImageSrc = "https://images.unsplash.com/photo-1585128792020-803d29415281?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else if (room.name === 'Kitchen') {
              roomImageSrc = "https://images.unsplash.com/photo-1574739782594-db4ead022697?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else if (room.name === 'Bathroom') {
              roomImageSrc = "https://images.unsplash.com/photo-1600566752355-35792bedcfea?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else {
              roomImageSrc = "https://images.unsplash.com/photo-1519710164239-da123dc03ef4?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            }
          }
          // Kitchen template
          else if (category.id === 'kitchen') {
            if (room.name === 'Cooking Zone') {
              roomImageSrc = "https://images.unsplash.com/photo-1556911220-bda9f7f7597b?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else if (room.name === 'Dining Nook') {
              roomImageSrc = "https://images.unsplash.com/photo-1565538810643-b5bdb714032a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else if (room.name === 'Pantry') {
              roomImageSrc = "https://images.unsplash.com/photo-1600585152220-90363fe7e115?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else if (room.name === 'Island') {
              roomImageSrc = "https://images.unsplash.com/photo-1556909114-44e3e9699e2b?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else {
              roomImageSrc = "https://images.unsplash.com/photo-1556911220-bda9f7f7597b?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            }
          }
          // Living Room template
          else if (category.id === 'living') {
            if (room.name === 'Living room') {
              roomImageSrc = "https://images.unsplash.com/photo-1615529328331-f8917597711f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else if (room.name === 'Restaurant') {
              roomImageSrc = "https://images.unsplash.com/photo-1617806118233-18e1de247200?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else if (room.name === 'Master room') {
              roomImageSrc = "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else if (room.name === 'Guest room') {
              roomImageSrc = "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else if (room.name === 'Study') {
              roomImageSrc = "https://images.unsplash.com/photo-1585412727339-54e4bae3bbf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else if (room.name === 'Balcony') {
              roomImageSrc = "https://images.unsplash.com/photo-1580237072617-771c3ecc4a24?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else {
              roomImageSrc = "https://images.unsplash.com/photo-1615529328331-f8917597711f?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            }
          }
          // Bathroom template
          else if (category.id === 'bathroom') {
            if (room.name === 'Shower') {
              roomImageSrc = "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else if (room.name === 'Vanity') {
              roomImageSrc = "https://images.unsplash.com/photo-1600566752355-35792bedcfea?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else {
              roomImageSrc = "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            }
          }
          // Dressing Room template
          else if (category.id === 'dressing') {
            if (room.name === 'Closet') {
              roomImageSrc = "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else if (room.name === 'Mirror Area') {
              roomImageSrc = "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else {
              roomImageSrc = "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            }
          }
          // Washroom template
          else if (category.id === 'washroom') {
            if (room.name === 'Laundry') {
              roomImageSrc = "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else if (room.name === 'Sink') {
              roomImageSrc = "https://images.unsplash.com/photo-1600566752355-35792bedcfea?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else {
              roomImageSrc = "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            }
          }
          // Storeroom template
          else if (category.id === 'storeroom') {
            if (room.name === 'Shelves') {
              roomImageSrc = "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else {
              roomImageSrc = "https://images.unsplash.com/photo-1616594039964-ae9021a400a0?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            }
          }
          // Hall template
          else if (category.id === 'hall') {
            if (room.name === 'Entrance') {
              roomImageSrc = "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else {
              roomImageSrc = "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            }
          }
          // Terrace template
          else if (category.id === 'terrace') {
            if (room.name === 'Patio') {
              roomImageSrc = "https://images.unsplash.com/photo-1580237072617-771c3ecc4a24?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            } else {
              roomImageSrc = "https://images.unsplash.com/photo-1580237072617-771c3ecc4a24?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
            }
          }
          // Fallback for any other categories
          else {
            // Fallback to placeholder
            const roomImageText = `${category.name}+${room.name.replace(/ /g, '+')}`;
            roomImageSrc = `https://placehold.co/400x300/${room.placeholderColor}/FFFFFF?text=${roomImageText}`;
          }
          
          const roomImageAlt = `${category.name} - ${room.name} view`;

          return (
            <div
              key={room.name}
              className={`relative w-[160px] h-[80px] bg-white rounded-md overflow-hidden shadow-md cursor-pointer group 
                ${activeRoom === room.name ? 'ring-2 ring-blue-500' : ''}`}
              onClick={() => setActiveRoom(room.name)}
            >
              <img
                src={roomImageSrc}
                alt={roomImageAlt}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 py-1 px-1 text-xs font-medium text-white text-center bg-black/50">
                {room.name}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Open scheme text below the thumbnails
  const renderSubTemplates = () => {
    return (
      <div className="absolute bottom-0 left-0 right-0 z-30 flex justify-center">
        <div className="text-center">
          <h3 className="text-sm font-medium text-gray-700 bg-transparent px-4 py-1">Open scheme</h3>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Main template display on the grid canvas */}
      {renderMainTemplateOnCanvas()}
      
      {/* Room thumbnails at the bottom of the canvas */}
      {renderRoomThumbnails()}

      {/* Sub-templates section */}
      {showSubTemplates && renderSubTemplates()}

      {/* Toggle button for sub-templates - hidden since we're showing everything at once */}
      {/* Button removed to match screenshot layout */}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm" onClick={closeModal}>
          <div className="relative w-11/12 max-w-5xl max-h-5/6 rounded-xl overflow-hidden shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <img src={modalImageSrc} alt={modalImageAlt} className="w-full h-full object-contain" />
          </div>
          <button onClick={closeModal} className="absolute top-4 right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/30 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white" aria-label="Close image viewer">
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
      )}
    </>
  );
};

// --- 1. Reusable Components ---

const PrimarySidebarItem = ({ icon: Icon, label, isActive = false, onClick }) => (
  <div
    className={`relative w-full py-3 my-1 flex flex-col items-center cursor-pointer transition-colors ${
      isActive ? 'bg-[#2E3137]' : 'hover:bg-[#3A4047]'
    }`}
    title={label}
    onClick={onClick}
  >
    {isActive && <div className="absolute left-0 top-2 bottom-2 w-[4px] bg-blue-500 rounded-r" />}
    <Icon className="text-white text-lg" />
    <span className="text-[9px] text-gray-300 mt-1 truncate max-w-[40px] text-center">{label}</span>
  </div>
);

const ToolButton = ({ label, children, isBeta = false, isSmall = false }) => (
  <div className={`
    p-2 rounded-md flex flex-col items-center 
    justify-center cursor-pointer transition-colors hover:bg-gray-100 bg-white
    ${isSmall ? 'w-[104px] h-[78px]' : 'w-[128px] h-[96px]'}
  `}>
    <div className={`${isSmall ? 'mb-1' : 'mb-1'} text-gray-700`}>{children}</div>
    <span className="text-[11px] text-gray-700 font-thin text-center leading-4">
      {label}
      {isBeta && <span className="ml-1 align-top text-[10px] text-orange-500 font-normal">Beta</span>}
    </span>
  </div>
);

const HeaderItem = ({ icon: Icon, label, onClick }) => (
  <div className="flex flex-col items-center justify-center text-gray-300 hover:text-white cursor-pointer select-none" onClick={onClick}>
    <Icon className="text-base mb-0.5 opacity-90" />
    <span className="text-[10px] leading-3 tracking-tight font-extralight">{label}</span>
  </div>
);

// Compact vertical action button used on the right side
const ActionItem = ({ icon: Icon, label, active = false, onClick }) => (
  <button
    className="w-16 py-1.5 bg-white/95 border border-gray-200 rounded-md shadow flex flex-col items-center justify-center hover:bg-gray-50 transition-colors"
    onClick={onClick}
  >
    <Icon className={`${active ? 'text-blue-500' : 'text-gray-700'} text-sm mb-0.5`} />
    <span className="text-[10px] text-gray-700 font-thin">{label}</span>
  </button>
);

// Smart Recognition Functions
const detectWallsAndRooms = (imageSrc, canvasWidth, canvasHeight) => {
  return new Promise(async (resolve) => {
    // Load OpenCV if not already loaded
    if (typeof window.cv === 'undefined') {
      // Check if we're already loading OpenCV
      if (!window.loadingOpenCV) {
        window.loadingOpenCV = true;
        const script = document.createElement('script');
        script.src = 'https://docs.opencv.org/4.8.0/opencv.js';
        script.onload = () => {
          window.loadingOpenCV = false;
          processImage();
        };
        script.onerror = () => {
          window.loadingOpenCV = false;
          console.error("Failed to load OpenCV.js");
          // Continue without OpenCV
          processImage();
        };
        document.head.appendChild(script);
      } else {
        // If OpenCV is already loading, wait for it
        const checkInterval = setInterval(() => {
          if (typeof window.cv !== 'undefined') {
            clearInterval(checkInterval);
            processImage();
          } else if (!window.loadingOpenCV) {
            // If loading failed
            clearInterval(checkInterval);
            processImage();
          }
        }, 100);
      }
    } else {
      processImage();
    }

    const processImage = async () => {
      const img = new Image();
      img.onload = async () => {
        // Calculate scale to fit canvas
        const scale = Math.min(canvasWidth / img.width, canvasHeight / img.height) * 0.8; // 80% to leave some margin
        const drawWidth = img.width * scale;
        const drawHeight = img.height * scale;

        // Center the image
        const offsetX = (canvasWidth - drawWidth) / 2;
        const offsetY = (canvasHeight - drawHeight) / 2;

        // OCR to extract measurements
        let measurements = [];
        try {
          const { data: { words } } = await Tesseract.recognize(img.src, 'eng', {
            logger: m => console.log(m) // optional logging
          });
          measurements = words
            .filter(word => /\d+(\.\d+)?\s*(m|cm|ft|in|mm)/i.test(word.text))
            .map(word => ({
              x: scale * ((word.bbox.x0 + word.bbox.x1) / 2) + offsetX,
              y: scale * ((word.bbox.y0 + word.bbox.y1) / 2) + offsetY,
              text: word.text.trim()
            }));
        } catch (error) {
          console.error('OCR failed:', error);
        }

        // Use OpenCV for image processing
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        tempCtx.drawImage(img, 0, 0);

        /* eslint-disable no-undef */
        try {
          // Convert to OpenCV Mat
          const src = cv.imread(tempCanvas);
          const dst = new cv.Mat();
          
          // Enhanced image processing pipeline
          
          // Step 1: Convert to grayscale
          cv.cvtColor(src, dst, cv.COLOR_RGBA2GRAY);
          
          // Step 2: Apply adaptive thresholding to better handle lighting variations
          const thresholdMat = new cv.Mat();
          cv.adaptiveThreshold(dst, thresholdMat, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY_INV, 11, 2);
          
          // Step 3: Apply morphological operations to clean up the image
          const kernel = cv.Mat.ones(3, 3, cv.CV_8U);
          const morphMat = new cv.Mat();
          
          // Perform morphological closing to connect nearby lines (walls)
          cv.morphologyEx(thresholdMat, morphMat, cv.MORPH_CLOSE, kernel, new cv.Point(-1, -1), 2);
          
          // Step 4: Apply Gaussian blur to reduce noise
          cv.GaussianBlur(morphMat, dst, new cv.Size(5, 5), 0);
          
          // Step 5: Apply Canny edge detection with improved parameters
          cv.Canny(dst, dst, 30, 150);
          
          // Step 6: Dilate the edges to make them more prominent
          cv.dilate(dst, dst, kernel, new cv.Point(-1, -1), 1);
          
          // Create processed image from edges (for display as drawn)
          const edgeCanvas = document.createElement('canvas');
          edgeCanvas.width = img.width;
          edgeCanvas.height = img.height;
          const edgeCtx = edgeCanvas.getContext('2d');
          cv.imshow(edgeCanvas, dst);

          // Invert colors to make black lines on white background
          const imageData = edgeCtx.getImageData(0, 0, edgeCanvas.width, edgeCanvas.height);
          const data = imageData.data;
          for (let i = 0; i < data.length; i += 4) {
            data[i] = 255 - data[i];     // red
            data[i + 1] = 255 - data[i + 1]; // green
            data[i + 2] = 255 - data[i + 2]; // blue
          }
          edgeCtx.putImageData(imageData, 0, 0);

          // Get the processed image URL
          const processedImageUrl = edgeCanvas.toDataURL();

          // Clean up OpenCV objects
          src.delete();
          dst.delete();
          thresholdMat.delete();
          morphMat.delete();
          kernel.delete();

          // Return only the processed image URL - no static elements
          resolve({ 
            walls: [], 
            rooms: [], 
            measurements, 
            tracedPaths: [], 
            processedImageUrl 
          });
          /* eslint-enable no-undef */
        } catch (error) {
          console.error('OpenCV processing failed:', error);
          
          // Fallback to basic detection using canvas API
          try {
            console.log('Attempting fallback detection using canvas API...');
            
            // Create a new canvas for edge detection
            const fallbackCanvas = document.createElement('canvas');
            fallbackCanvas.width = img.width;
            fallbackCanvas.height = img.height;
            const fallbackCtx = fallbackCanvas.getContext('2d');
            
            // Draw the image
            fallbackCtx.drawImage(img, 0, 0);
            
            // Get image data
            const imageData = fallbackCtx.getImageData(0, 0, img.width, img.height);
            const data = imageData.data;
            
            // Simple edge detection using canvas
            const edgeData = new Uint8ClampedArray(data.length);
            const threshold = 30; // Threshold for edge detection
            
            for (let y = 1; y < img.height - 1; y++) {
              for (let x = 1; x < img.width - 1; x++) {
                const idx = (y * img.width + x) * 4;
                
                // Get surrounding pixels
                const left = (y * img.width + (x - 1)) * 4;
                const right = (y * img.width + (x + 1)) * 4;
                const up = ((y - 1) * img.width + x) * 4;
                const down = ((y + 1) * img.width + x) * 4;
                
                // Calculate differences
                const diffX = Math.abs(data[left] - data[right]) + 
                              Math.abs(data[left + 1] - data[right + 1]) + 
                              Math.abs(data[left + 2] - data[right + 2]);
                              
                const diffY = Math.abs(data[up] - data[down]) + 
                              Math.abs(data[up + 1] - data[down + 1]) + 
                              Math.abs(data[up + 2] - data[down + 2]);
                
                // If difference is greater than threshold, mark as edge
                if (diffX > threshold || diffY > threshold) {
                  edgeData[idx] = 255;     // White edge
                  edgeData[idx + 1] = 255;
                  edgeData[idx + 2] = 255;
                  edgeData[idx + 3] = 255; // Fully opaque
                } else {
                  edgeData[idx] = 0;       // Black background
                  edgeData[idx + 1] = 0;
                  edgeData[idx + 2] = 0;
                  edgeData[idx + 3] = 255; // Fully opaque
                }
              }
            }
            
            // Create a new ImageData object and put it back on the canvas
            const edgeImageData = new ImageData(edgeData, img.width, img.height);
            fallbackCtx.putImageData(edgeImageData, 0, 0);
            
            // Create a processed image URL
            const processedImageUrl = fallbackCanvas.toDataURL();
            
            // Return only the processed image URL - no static elements
            resolve({ 
              walls: [], 
              rooms: [], 
              measurements, 
              tracedPaths: [], 
              processedImageUrl,
              fallbackMode: true
            });
            
          } catch (fallbackError) {
            console.error('Fallback detection also failed:', fallbackError);
            // Ultimate fallback - just return the measurements
            resolve({ walls: [], rooms: [], measurements, tracedPaths: [], processedImageUrl: null });
          }
        }
      };
      img.src = imageSrc;
    };
  });
};

// Grid drawing function
const drawGrid = (ctx, canvasWidth, canvasHeight, zoom) => {
  const gridSize = 20; // Fixed grid size
  ctx.strokeStyle = '#e0e0e0';
  ctx.lineWidth = zoom * 0.5; // Thicker lines when zoomed in
  for (let x = 0; x <= canvasWidth; x += gridSize) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvasHeight);
    ctx.stroke();
  }
  for (let y = 0; y <= canvasHeight; y += gridSize) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvasWidth, y);
    ctx.stroke();
  }
};

// --- 2. Main Dashboard Component ---

const InteriorDesignDashboard = () => {
  // ALL HOOKS MUST BE CALLED FIRST (React Rules of Hooks)
  const navigate = useNavigate();
  const { isEngineer, user, loading: authLoading } = useAuth();
  const [shouldRedirect, setShouldRedirect] = React.useState(false);
  const [isToolsOpen, setIsToolsOpen] = React.useState(true);
  const [activeSection, setActiveSection] = React.useState('floorplan');
  const [fileMenuOpen, setFileMenuOpen] = React.useState(false);
  const fileMenuRef = React.useRef(null);
  const joystickRef = React.useRef(null);
  const [rotation, setRotation] = React.useState(0);
  const [floorplanImage, setFloorplanImage] = React.useState(null);
  const [processedFloorplanImage, setProcessedFloorplanImage] = React.useState(null);
  const [floorplanImageDimensions, setFloorplanImageDimensions] = React.useState({ width: 0, height: 0 });
  const [clipboardImage, setClipboardImage] = React.useState(null);
  const [contextMenu, setContextMenu] = React.useState({ visible: false, x: 0, y: 0 });
  const contextMenuRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const designCanvasRef = React.useRef(null);
  const stageRef = React.useRef(null);
  const [isUploaderOpen, setIsUploaderOpen] = React.useState(false);
  const [selectedTemplate, setSelectedTemplate] = React.useState(null);
  const [schemeLoading, setSchemeLoading] = React.useState({ loading: false, progress: 0 });
  const [templateImageSrc, setTemplateImageSrc] = React.useState(null);
  const [drawingMode, setDrawingMode] = React.useState(false);
  const [lines, setLines] = React.useState([]);
  const [currentLine, setCurrentLine] = React.useState(null);
  const [smartRecognitionActive, setSmartRecognitionActive] = React.useState(true);
  const [walls, setWalls] = React.useState([]);
  const [rooms, setRooms] = React.useState([]);
  const [tracedPaths, setTracedPaths] = React.useState([]);
  const [selectedWall, setSelectedWall] = React.useState(null);
  const [selectedRoom, setSelectedRoom] = React.useState(null);
  const [draggingWall, setDraggingWall] = React.useState(null);
  const [editingDimension, setEditingDimension] = React.useState(null);
  const [dimensionInput, setDimensionInput] = React.useState('');
  const [showMeasurements, setShowMeasurements] = React.useState(true);
  const [editableMeasurements, setEditableMeasurements] = React.useState([]);
  const [editingMeasurementIndex, setEditingMeasurementIndex] = React.useState(null);
  const [measurementInput, setMeasurementInput] = React.useState('');
  const [stageSize, setStageSize] = React.useState({ width: 800, height: 600 });

  // Zoom state (static screen)
  const [zoom, setZoom] = React.useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 }); // Static pan at center
  const [isPanning, setIsPanning] = React.useState(false);
  const [lastPanPoint, setLastPanPoint] = React.useState({ x: 0, y: 0 });

  // View mode state
  const [viewMode, setViewMode] = React.useState('2d'); // '2d', '3d', 'roam'

  // Display menu state
  const [displayMenuOpen, setDisplayMenuOpen] = React.useState(false);
  const displayMenuRef = React.useRef(null);
  const [displayLayers, setDisplayLayers] = React.useState({
    ceilingLayer: true,
    customDoorsWindows: true,
    archway: true,
    showFloorplan: true,
    showProcessedImage: false,
    lockFloorplan: false
  });

  // ⚠️ ALL HOOKS MUST BE CALLED BEFORE ANY CONDITIONAL RETURNS (React Rules of Hooks)
  // Route protection effects: Block ALL non-interior designers IMMEDIATELY
  React.useLayoutEffect(() => {
    // IMMEDIATE check from localStorage - highest priority
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        const userRole = userData?.role;
        
        console.log("🔍 Interior Dashboard useLayoutEffect - Role:", userRole);
        
        // Redirect engineers immediately - USE WINDOW.LOCATION.REPLACE FOR IMMEDIATE FORCE
        if (userRole === "engineer") {
          console.log("🚫🚫🚫 FORBIDDEN: Engineer detected in useLayoutEffect - FORCING IMMEDIATE REDIRECT");
          console.log("Engineer role detected from localStorage:", userData);
          setShouldRedirect(true);
          // Use replace to prevent back button and ensure immediate redirect
          window.location.replace("/engineer-dashboard");
          return;
        }
        
        // Redirect admins
        if (userRole === "admin") {
          console.log("🚫 FORBIDDEN: Admin detected - redirecting to /admin-dashboard");
          setShouldRedirect(true);
          window.location.replace("/admin-dashboard");
          return;
        }
        
        // Redirect customers
        if (userRole === "customer") {
          console.log("🚫 FORBIDDEN: Customer detected - redirecting to /customer-dashboard");
          setShouldRedirect(true);
          window.location.replace("/customer-dashboard");
          return;
        }
        
        // Block any role that's not interior designer
        if (userRole && userRole !== "interiorDesigner" && userRole !== "interior") {
          console.log(`🚫 FORBIDDEN: Role "${userRole}" is not allowed. Redirecting to home.`);
          setShouldRedirect(true);
          window.location.replace("/");
          return;
        }
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
    
    // Check from auth context once it's loaded
    if (!authLoading) {
      const userRole = user?.role;
      
      if (userRole === "engineer" || isEngineer()) {
        console.log("🚫 FORBIDDEN: Engineer detected via auth context - FORCING redirect");
        setShouldRedirect(true);
        window.location.replace("/engineer-dashboard"); // Force redirect - cannot be cancelled
      } else if (userRole === "admin") {
        setShouldRedirect(true);
        window.location.replace("/admin-dashboard");
      } else if (userRole === "customer") {
        setShouldRedirect(true);
        window.location.replace("/customer-dashboard");
      } else if (user && userRole && userRole !== "interiorDesigner" && userRole !== "interior") {
        setShouldRedirect(true);
        window.location.replace("/");
      }
    }
  }, [isEngineer, authLoading, navigate, user]);

  // Backup useEffect - ensure redirect happens even if layout effect misses it
  React.useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        const userRole = userData?.role;
        
        if (userRole === "engineer") {
          console.log("🚫 Backup check: Engineer detected - FORCING redirect with window.location.replace");
          window.location.replace("/engineer-dashboard"); // Force redirect - cannot be cancelled
        } else if (userRole === "admin") {
          navigate("/admin-dashboard", { replace: true });
        } else if (userRole === "customer") {
          navigate("/customer-dashboard", { replace: true });
        } else if (userRole && userRole !== "interiorDesigner" && userRole !== "interior") {
          navigate("/", { replace: true });
        }
      } catch (error) {
        // Ignore parsing errors
      }
    }
    
    if (!authLoading) {
      const userRole = user?.role;
      if (userRole === "engineer" || isEngineer()) {
        console.log("🚫 Backup check: Engineer via auth context - FORCING redirect with window.location.replace");
        window.location.replace("/engineer-dashboard"); // Force redirect - cannot be cancelled
      } else if (userRole === "admin") {
        navigate("/admin-dashboard", { replace: true });
      } else if (userRole === "customer") {
        navigate("/customer-dashboard", { replace: true });
      } else if (user && userRole && userRole !== "interiorDesigner" && userRole !== "interior") {
        navigate("/", { replace: true });
      }
    }
  }, [authLoading, isEngineer, navigate, user]);

  // Set template image source when selectedTemplate changes
  React.useEffect(() => {
    // Clear any drawing on the grid canvas when template is selected
    setDrawingMode(false);
    setCurrentLine(null);
    setLines([]); // This clears all lines
    console.log("Clearing drawing on template selection");
    
    if (selectedTemplate) {
      const category = roomCategories.find(c => c.id === selectedTemplate);
      if (category && category.rooms.length > 0) {
        const activeRoom = category.rooms[0].name;
        const activeRoomData = category.rooms.find(room => room.name === activeRoom) || category.rooms[0];
        const mainImageText = `${category.name}+${activeRoomData.name.replace(/ /g, '+')}`;
        const src = `https://placehold.co/1200x800/${activeRoomData.placeholderColor}/FFFFFF?text=${mainImageText}`;
        setTemplateImageSrc(src);

        // We're not setting any walls to avoid drawing the black lines
        setWalls([]);
        
        setFloorplanImage(null); // Hide any uploaded image
        setFloorplanImageDimensions({ width: 0, height: 0 });
      } else {
        setTemplateImageSrc(null);
        setWalls([]);
      }
    } else {
      setTemplateImageSrc(null);
      setWalls([]);
    }
  }, [selectedTemplate, stageSize]);

  // Expose setSelectedTemplate to window for sub-template selection
  React.useEffect(() => {
    // Make setSelectedTemplate available globally for sub-template selection
    window.setSelectedTemplate = setSelectedTemplate;
    
    // Listen for template selection events
    const handleTemplateSelected = (event) => {
      if (event.detail && event.detail.templateId) {
        setSelectedTemplate(event.detail.templateId);
      }
    };
    
    window.addEventListener('templateSelected', handleTemplateSelected);
    
    // Cleanup
    return () => {
      delete window.setSelectedTemplate;
      window.removeEventListener('templateSelected', handleTemplateSelected);
    };
  }, []);

  // Hide context menu on click outside
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextMenu.visible && contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        setContextMenu({ visible: false, x: 0, y: 0 });
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [contextMenu.visible]);

  // Hide display menu on click outside
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (displayMenuOpen && displayMenuRef.current && !displayMenuRef.current.contains(e.target)) {
        setDisplayMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [displayMenuOpen]);

  // Initialize joystick
  React.useEffect(() => {
    if (joystickRef.current) {
      const manager = nipplejs.create({
        zone: joystickRef.current,
        mode: 'static',
        position: { left: '50%', top: '50%' },
        color: 'gray',
        size: 96,
        threshold: 0.1,
      });

      manager.on('move', (evt, data) => {
        setRotation(data.angle.degree);
      });

      manager.on('end', () => {
        // Optionally reset or handle end
      });

      return () => manager.destroy();
    }
  }, []);

  React.useEffect(() => {
    const updateSize = () => {
      if (designCanvasRef.current) {
        setStageSize({
          width: designCanvasRef.current.offsetWidth,
          height: designCanvasRef.current.offsetHeight
        });
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Initialize stage size without loading default floorplan
  React.useEffect(() => {
    // No default floorplan loading - only DWG files will be displayed
    // This ensures the canvas is ready for user-uploaded files
    console.log('Stage size initialized:', stageSize);
  }, [stageSize]);

  React.useEffect(() => {
    if (canvasRef.current && !schemeLoading.loading) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;

      const canvasWidth = canvas.width;
      const canvasHeight = canvas.height;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw placeholder rectangle if no walls detected (fallback mode)
      if (walls.length === 0) {
        const rectWidth = canvasWidth * 0.5;
        const rectHeight = canvasHeight * 0.5;
        const x = (canvasWidth - rectWidth) / 2;
        const y = (canvasHeight - rectHeight) / 2;
        
        ctx.save();
        ctx.translate(canvasWidth / 2 + pan.x, canvasHeight / 2 + pan.y);
        ctx.rotate(rotation * Math.PI / 180);
        ctx.translate(-canvasWidth / 2, -canvasHeight / 2);
        
        // Draw placeholder rectangle
        ctx.fillStyle = '#f3f4f6';
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.rect(x, y, rectWidth, rectHeight);
        ctx.fill();
        ctx.stroke();
        
        ctx.restore();
      }

      // Draw grid if walls are present (vector mode)
      if (walls.length > 0) {
        ctx.save();
        ctx.translate(canvasWidth / 2 + pan.x, canvasHeight / 2 + pan.y);
        ctx.rotate(rotation * Math.PI / 180);
        ctx.translate(-canvasWidth / 2, -canvasHeight / 2);
        drawGrid(ctx, canvasWidth, canvasHeight, zoom);
        ctx.restore();
      }

      // Draw template if present
      if (templateImageSrc) {
        const templateImg = new Image();
        templateImg.onload = () => {
          const templateScale = Math.min(1, canvasWidth / templateImg.naturalWidth, canvasHeight / templateImg.naturalHeight);
          const templateDrawWidth = templateImg.naturalWidth * templateScale;
          const templateDrawHeight = templateImg.naturalHeight * templateScale;
          const templateX = (canvasWidth - templateDrawWidth) / 2;
          const templateY = (canvasHeight - templateDrawHeight) / 2;

          ctx.save();
          ctx.translate(canvasWidth / 2 + pan.x, canvasHeight / 2 + pan.y);
          ctx.rotate(rotation * Math.PI / 180);
          ctx.translate(-canvasWidth / 2, -canvasHeight / 2);
          ctx.drawImage(templateImg, templateX, templateY, templateDrawWidth, templateDrawHeight);
          ctx.restore();
        };
        templateImg.src = templateImageSrc;
      }

      // Draw lines with zoom
      ctx.save();
      ctx.translate(canvasWidth / 2 + pan.x, canvasHeight / 2 + pan.y);
      ctx.rotate(rotation * Math.PI / 180);
      ctx.translate(-canvasWidth / 2, -canvasHeight / 2);
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 2 * zoom;
      lines.forEach(line => {
        ctx.beginPath();
        ctx.moveTo(line.start.x, line.start.y);
        ctx.lineTo(line.end.x, line.end.y);
        ctx.stroke();
      });
      if (currentLine) {
        ctx.beginPath();
        ctx.moveTo(currentLine.start.x, currentLine.start.y);
        ctx.lineTo(currentLine.end.x, currentLine.end.y);
        ctx.stroke();
      }
      ctx.restore();

      // Draw detected walls and rooms if smart recognition was used
      if (walls.length > 0) {
        ctx.save();
        ctx.translate(canvasWidth / 2 + pan.x, canvasHeight / 2 + pan.y);
        ctx.rotate(rotation * Math.PI / 180);
        ctx.translate(-canvasWidth / 2, -canvasHeight / 2);

        // Set drawing styles
        ctx.strokeStyle = '#2D3748';
        ctx.lineWidth = 3 * zoom;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.fillStyle = '#4B5563';
        ctx.font = `${12 * zoom}px Arial`;
        ctx.textAlign = 'center';

        // Draw walls
        walls.forEach((wall, index) => {
          if (selectedWall === index) {
            ctx.strokeStyle = '#FF0000';
            ctx.lineWidth = 5 * zoom;
          } else {
            ctx.strokeStyle = '#2D3748';
            ctx.lineWidth = 3 * zoom;
          }
          ctx.beginPath();
          if (wall.type === 'horizontal') {
            ctx.moveTo(wall.start, wall.y);
            ctx.lineTo(wall.end, wall.y);
          } else {
            ctx.moveTo(wall.x, wall.start);
            ctx.lineTo(wall.x, wall.end);
          }
          ctx.stroke();

          // Draw resize handles for selected wall
          if (selectedWall === index && showMeasurements) {
            ctx.fillStyle = '#3B82F6';
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 2 / zoom;

            if (wall.type === 'horizontal') {
              ctx.beginPath();
              ctx.arc(wall.start, wall.y, 6 / zoom, 0, 2 * Math.PI);
              ctx.fill();
              ctx.stroke();
              ctx.beginPath();
              ctx.arc(wall.end, wall.y, 6 / zoom, 0, 2 * Math.PI);
              ctx.fill();
              ctx.stroke();
            } else {
              ctx.beginPath();
              ctx.arc(wall.x, wall.start, 6 / zoom, 0, 2 * Math.PI);
              ctx.fill();
              ctx.stroke();
              ctx.beginPath();
              ctx.arc(wall.x, wall.end, 6 / zoom, 0, 2 * Math.PI);
              ctx.fill();
              ctx.stroke();
            }
          }

          // Draw measurements
          if (showMeasurements) {
            const length = calculateWallLength(wall);
            ctx.fillStyle = '#FFFFFF';
            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 1 / zoom;
            ctx.font = `${10 / zoom}px Arial`;
            ctx.textAlign = 'center';

            let textX, textY;
            if (wall.type === 'horizontal') {
              textX = (wall.start + wall.end) / 2;
              textY = wall.y - 15 / zoom;
              ctx.beginPath();
              ctx.moveTo(wall.start, wall.y - 8 / zoom);
              ctx.lineTo(wall.start, wall.y - 12 / zoom);
              ctx.moveTo(wall.end, wall.y - 8 / zoom);
              ctx.lineTo(wall.end, wall.y - 12 / zoom);
              ctx.moveTo(wall.start, wall.y - 10 / zoom);
              ctx.lineTo(wall.end, wall.y - 10 / zoom);
              ctx.stroke();
            } else {
              textX = wall.x + 15 / zoom;
              textY = (wall.start + wall.end) / 2;
              ctx.beginPath();
              ctx.moveTo(wall.x + 8 / zoom, wall.start);
              ctx.lineTo(wall.x + 12 / zoom, wall.start);
              ctx.moveTo(wall.x + 8 / zoom, wall.end);
              ctx.lineTo(wall.x + 12 / zoom, wall.end);
              ctx.moveTo(wall.x + 10 / zoom, wall.start);
              ctx.lineTo(wall.x + 10 / zoom, wall.end);
              ctx.stroke();
            }

            const textWidth = ctx.measureText(`${length}m`).width;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            ctx.fillRect(textX - textWidth/2 - 2, textY - 8, textWidth + 4, 12);
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(`${length}m`, textX, textY);
          }
        });

        ctx.restore();
      }
    }
  }, [rotation, schemeLoading.loading, templateImageSrc, zoom, pan, lines, currentLine, smartRecognitionActive, walls, rooms, selectedWall, showMeasurements]);

  // ⚠️ STRICT ROUTE PROTECTION: ONLY INTERIOR DESIGNERS CAN ACCESS THIS DASHBOARD
  // Check AFTER all hooks are called - block ALL non-interior designers
  const savedUserSync = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
  if (savedUserSync) {
    try {
      const userDataSync = JSON.parse(savedUserSync);
      const userRole = userDataSync?.role;
      
      // Block engineers - redirect to engineer dashboard IMMEDIATELY AND FORCEFULLY
      if (userRole === "engineer") {
        console.log("🚫🚫🚫 FORBIDDEN: Engineer attempted to access interior dashboard. FORCING redirect to /engineer-dashboard");
        console.log("Engineer data from localStorage:", userDataSync);
        // Use window.location.replace for immediate, non-cancellable redirect
        window.location.replace("/engineer-dashboard"); 
        return null;
      }
      
      // Block admins - redirect to admin dashboard
      if (userRole === "admin") {
        console.log("🚫 FORBIDDEN: Admin attempted to access interior dashboard. FORCING redirect to /admin-dashboard");
        window.location.replace("/admin-dashboard");
        return null;
      }
      
      // Block customers - redirect to customer dashboard
      if (userRole === "customer") {
        console.log("🚫 FORBIDDEN: Customer attempted to access interior dashboard. FORCING redirect to /customer-dashboard");
        window.location.replace("/customer-dashboard");
        return null;
      }
      
      // Only allow interior designers - block if role is not interiorDesigner or undefined
      if (userRole && userRole !== "interiorDesigner" && userRole !== "interior") {
        console.log(`🚫 FORBIDDEN: User with role "${userRole}" attempted to access interior dashboard. Redirecting to home.`);
        navigate("/", { replace: true });
        return null;
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }
  
  // Check auth context synchronously (if loaded) - enforce same restrictions
  if (!authLoading) {
    const userRole = user?.role;
    
    if (userRole === "engineer" || isEngineer()) {
      console.log("🚫🚫🚫 FORBIDDEN: Engineer detected via auth context. FORCING redirect to /engineer-dashboard");
      console.log("Engineer data from auth context:", user);
      // Use window.location.replace for immediate, non-cancellable redirect
      window.location.replace("/engineer-dashboard"); 
      return null;
    }
    
    if (userRole === "admin") {
      console.log("🚫 FORBIDDEN: Admin detected via auth context. FORCING redirect to /admin-dashboard");
      window.location.replace("/admin-dashboard");
      return null;
    }
    
    if (userRole === "customer") {
      console.log("🚫 FORBIDDEN: Customer detected via auth context. FORCING redirect to /customer-dashboard");
      window.location.replace("/customer-dashboard");
      return null;
    }
    
    // Only allow interior designers - if user exists but is not interior designer, block
    if (user && userRole && userRole !== "interiorDesigner" && userRole !== "interior") {
      console.log(`🚫 FORBIDDEN: User with role "${userRole}" is not an interior designer. Redirecting to home.`);
      navigate("/", { replace: true });
      return null;
    }
  }

  // Final guard: If redirect flag is set, block rendering
  if (shouldRedirect) {
    return null; // Don't render anything while redirecting
  }
  
  // If auth is still loading, show nothing (prevents flash of content)
  if (authLoading) {
    return null;
  }
  
  // If no user is logged in, redirect to login
  if (!savedUserSync && !user && !authLoading) {
    console.log("🚫 No user logged in. Redirecting to /auth");
    navigate("/auth", { replace: true });
    return null;
  }

  // Function to update editable measurements
  const updateEditableMeasurement = (index, newText) => {
    setEditableMeasurements(prev => prev.map((m, i) => i === index ? { ...m, text: newText } : m));
  };

  // Handle measurement editing
  const handleMeasurementEdit = (index, newText) => {
    updateEditableMeasurement(index, newText);
  };

  // Set template image source when selectedTemplate changes (moved to top with other hooks)
  // Expose setSelectedTemplate to window for sub-template selection (moved to top with other hooks)

  // Handle smart recognition toggle
  const handleSmartRecognitionToggle = () => {
    setSmartRecognitionActive(!smartRecognitionActive);
  };

  const processFloorPlanWithSmartRecognition = async (imageUrl) => {
    if (!canvasRef.current) return;

    // Clear any existing walls and lines
    setWalls([]);
    setRooms([]);
    setLines([]);
    setCurrentLine(null);
    setShowMeasurements(false);
    setEditableMeasurements([]);

    try {
      // Load the image to get dimensions
      const img = new Image();
      img.onload = () => {
        // Set dimensions for proper scaling
        setFloorplanImageDimensions({
          width: img.width,
          height: img.height
        });
      };
      img.src = imageUrl;
      
      // Set the original image
      setFloorplanImage(imageUrl);
      
      // Simulate processing the image
      setTimeout(() => {
        // In a real app, this would be the result from AI processing
        setProcessedFloorplanImage(imageUrl);
      }, 1000);
      
      console.log("Smart recognition processing image:", imageUrl);
      
      // Make sure both images are visible
      setDisplayLayers(prev => ({ 
        ...prev, 
        showFloorplan: true,
        showProcessedImage: true
      }));
    } catch (error) {
      console.error('Smart recognition failed:', error);
      setDisplayLayers(prev => ({ ...prev, showFloorplan: true }));
    }
  };

  // Handle canvas mouse events for drawing and panning
  const handleMouseDown = (e) => {
    if (!stageRef.current) return;
    const stage = stageRef.current;
    const container = stage.container();
    const rect = container.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;

    // Use the adjusted coordinates directly for calculations
    const adjustedX = x;
    const adjustedY = y;

    if (drawingMode) {
      setCurrentLine({ start: { x, y }, end: { x, y } });
    } else if (walls.length > 0 && !drawingMode) {
      // Check if clicking on a resize handle first
      let clickedHandle = null;
      let handleType = null;
      walls.forEach((wall, index) => {
        const handleRadius = 6 * zoom;
        if (wall.type === 'horizontal') {
          // Check left handle
          if (Math.abs(adjustedX - wall.start) < handleRadius && Math.abs(adjustedY - wall.y) < handleRadius) {
            clickedHandle = index;
            handleType = 'left';
          }
          // Check right handle
          else if (Math.abs(adjustedX - wall.end) < handleRadius && Math.abs(adjustedY - wall.y) < handleRadius) {
            clickedHandle = index;
            handleType = 'right';
          }
        } else {
          // Check top handle
          if (Math.abs(adjustedX - wall.x) < handleRadius && Math.abs(adjustedY - wall.start) < handleRadius) {
            clickedHandle = index;
            handleType = 'top';
          }
          // Check bottom handle
          else if (Math.abs(adjustedX - wall.x) < handleRadius && Math.abs(adjustedY - wall.end) < handleRadius) {
            clickedHandle = index;
            handleType = 'bottom';
          }
        }
      });

      if (clickedHandle !== null) {
        setSelectedWall(clickedHandle);
        setDraggingWall({ wallIndex: clickedHandle, handleType });
        return;
      }

      // Check if clicking on measurement text
      let clickedMeasurement = null;
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.font = `${10 / zoom}px Arial`;
      walls.forEach((wall, index) => {
        if (showMeasurements) {
          const length = calculateWallLength(wall);
          const textWidth = tempCtx.measureText(`${length}m`).width;
          let textX, textY;

          if (wall.type === 'horizontal') {
            textX = (wall.start + wall.end) / 2;
            textY = wall.y - 15 / zoom;
          } else {
            textX = wall.x + 15 / zoom;
            textY = (wall.start + wall.end) / 2;
          }

          if (Math.abs(adjustedX - textX) < textWidth/2 + 5 && Math.abs(adjustedY - textY) < 10) {
            clickedMeasurement = index;
          }
        }
      });

      if (clickedMeasurement !== null) {
        setEditingDimension(clickedMeasurement);
        setDimensionInput(calculateWallLength(walls[clickedMeasurement]));
        return;
      }

      // Check if clicking on a wall
      let clickedWall = null;
      walls.forEach((wall, index) => {
        if (wall.type === 'horizontal') {
          if (Math.abs(adjustedY - wall.y) < 10 && adjustedX >= wall.start && adjustedX <= wall.end) {
            clickedWall = index;
          }
        } else {
          if (Math.abs(adjustedX - wall.x) < 10 && adjustedY >= wall.start && adjustedY <= wall.end) {
            clickedWall = index;
          }
        }
      });
      if (clickedWall !== null) {
        setSelectedWall(clickedWall);
        setDraggingWall(null);
      } else {
        setSelectedWall(null);
        setDraggingWall(null);
        // Start panning
        setIsPanning(true);
        setLastPanPoint({ x: e.clientX, y: e.clientY });
      }
    } else {
      // Start panning
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = (e) => {
    if (drawingMode && currentLine) {
      const stage = stageRef.current;
      const container = stage.container();
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left - pan.x) / zoom;
      const y = (e.clientY - rect.top - pan.y) / zoom;
      setCurrentLine(prev => ({ ...prev, end: { x, y } }));
    } else if (draggingWall !== null) {
      const canvas = canvasRef.current;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Adjust for zoom and pan
      const adjustedX = (x - canvas.width / 2 - pan.x) / zoom + canvas.width / 2;
      const adjustedY = (y - canvas.height / 2 - pan.y) / zoom + canvas.height / 2;

      setWalls(prev => prev.map((wall, index) => {
        if (index === draggingWall.wallIndex) {
          const wall = prev[index];
          if (draggingWall.handleType) {
            // Handle resizing
            if (wall.type === 'horizontal') {
              if (draggingWall.handleType === 'left') {
                return { ...wall, start: Math.min(adjustedX, wall.end - 20) };
              } else if (draggingWall.handleType === 'right') {
                return { ...wall, end: Math.max(adjustedX, wall.start + 20) };
              }
            } else {
              if (draggingWall.handleType === 'top') {
                return { ...wall, start: Math.min(adjustedY, wall.end - 20) };
              } else if (draggingWall.handleType === 'bottom') {
                return { ...wall, end: Math.max(adjustedY, wall.start + 20) };
              }
            }
          } else {
            // Handle moving
            if (wall.type === 'horizontal') {
              return { ...wall, y: adjustedY };
            } else {
              return { ...wall, x: adjustedX };
            }
          }
        }
        return wall;
      }));
    } else if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      setPan(prev => ({ x: prev.x + deltaX, y: prev.y + deltaY }));
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseUp = (e) => {
    if (drawingMode && currentLine) {
      // Determine if horizontal or vertical based on the drag direction
      const dx = Math.abs(currentLine.end.x - currentLine.start.x);
      const dy = Math.abs(currentLine.end.y - currentLine.start.y);
      
      // Only add a wall if the line is long enough (to prevent accidental clicks)
      if (dx > 5 || dy > 5) {
        if (dx > dy) {
          // horizontal wall
          setWalls(prev => [...prev, {
            type: 'horizontal',
            start: Math.min(currentLine.start.x, currentLine.end.x),
            end: Math.max(currentLine.start.x, currentLine.end.x),
            y: currentLine.start.y
          }]);
        } else {
          // vertical wall
          setWalls(prev => [...prev, {
            type: 'vertical',
            start: Math.min(currentLine.start.y, currentLine.end.y),
            end: Math.max(currentLine.start.y, currentLine.end.y),
            x: currentLine.start.x
          }]);
        }
      }
      
      // Always clear the current line when mouse is released
      setCurrentLine(null);
    }
    setDraggingWall(null);
    if (isPanning) {
      setIsPanning(false);
    }
  };

  // Handle wheel zoom
  const handleWheel = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(2, zoom * zoomFactor));
    setZoom(newZoom);
  };

  // Handle right-click on image
  const handleRightClick = (e) => {
    // Check if e is a valid event object with preventDefault method
    if (e && typeof e.preventDefault === 'function') {
      e.preventDefault();
    }
    // Use optional chaining for clientX and clientY to avoid errors
    setContextMenu({ 
      visible: true, 
      x: e?.clientX || 0, 
      y: e?.clientY || 0 
    });
  };

  // Hide context menu
  const hideContextMenu = () => {
    setContextMenu({ visible: false, x: 0, y: 0 });
  };

  // Handle delete
  const handleDelete = () => {
    console.log('Deleting content');
    // Keep the state variables but set them to null/empty
    setFloorplanImage(null);
    setFloorplanImageDimensions({ width: 0, height: 0 });
    setWalls([]);
    setRooms([]);
    setSelectedWall(null);
    console.log('Set to null');
    hideContextMenu();
  };

  // Handle save image
  const handleSaveImage = () => {
    if (canvasRef.current) {
      const dataURL = canvasRef.current.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = 'floorplan.png';
      link.click();
    }
    hideContextMenu();
  };

  // Handle copy
  const handleCopy = async () => {
    if (canvasRef.current) {
      try {
        const dataURL = canvasRef.current.toDataURL('image/png');
        const response = await fetch(dataURL);
        const blob = await response.blob();
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setClipboardImage(dataURL);
      } catch (err) {
        console.error('Failed to copy image:', err);
      }
    }
    hideContextMenu();
  };

  // Handle clear measurements
  const handleClearMeasurements = () => {
    setLines([]);
    hideContextMenu();
  };

  // Calculate wall length in meters (assuming 1 pixel = 1cm, so divide by 100)
  const calculateWallLength = (wall) => {
    let length;
    if (wall.type === 'horizontal') {
      length = Math.abs(wall.end - wall.start);
    } else {
      length = Math.abs(wall.end - wall.start);
    }
    return (length / 100).toFixed(2); // Convert to meters
  };

  // Handle dimension editing
  const handleDimensionEdit = (wallIndex, newLength) => {
    const lengthInPixels = parseFloat(newLength) * 100; // Convert meters to pixels
    setWalls(prev => prev.map((wall, index) => {
      if (index === wallIndex) {
        if (wall.type === 'horizontal') {
          const center = (wall.start + wall.end) / 2;
          const halfLength = lengthInPixels / 2;
          return {
            ...wall,
            start: center - halfLength,
            end: center + halfLength
          };
        } else {
          const center = (wall.start + wall.end) / 2;
          const halfLength = lengthInPixels / 2;
          return {
            ...wall,
            start: center - halfLength,
            end: center + halfLength
          };
        }
      }
      return wall;
    }));
  };

  // Handle measurement toggle
  const handleMeasurementToggle = () => {
    setShowMeasurements(!showMeasurements);
  };

  // Handle cut
  const handleCut = async () => {
    if (canvasRef.current) {
      try {
        const dataURL = canvasRef.current.toDataURL('image/png');
        const response = await fetch(dataURL);
        const blob = await response.blob();
        await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        setClipboardImage(dataURL);
        // Image references removed
        setWalls([]);
        setRooms([]);
        setSelectedWall(null);
      } catch (err) {
        console.error('Failed to cut image:', err);
      }
    }
    hideContextMenu();
  };

  // Handle paste
  const handlePaste = async () => {
    try {
      // Image loading logic removed
      console.log('Paste functionality modified - image loading removed');
    } catch (err) {
      console.error('Failed to paste image:', err);
    }
    hideContextMenu();
  };

  // Handle floor plan done
  const handleFloorPlanDone = async (imageFile) => {
    const formData = new FormData();
    formData.append("file", imageFile);
  
     try {
       // First, check if backend is running
       console.log("🔍 Checking backend health...");
       try {
         const healthCheck = await fetch("http://localhost:5000/api/floorplans");
         console.log("✅ Backend is running");
       } catch (healthError) {
         console.error("❌ Backend not accessible:", healthError);
         alert("Backend server is not running. Please start the Node.js backend on port 5000.");
         return;
       }
       
       // Step 1: Get processed image
       console.log("📤 Sending image for processing...");
       console.log("🔗 Backend URL: http://localhost:5000/analyze-floorplan");
       
       const imageResponse = await fetch("http://localhost:5000/analyze-floorplan", {
         method: "POST",
         body: formData,
       });
      
      if (!imageResponse.ok) {
        alert("Failed to process floorplan image.");
        return;
      }
      
      const blob = await imageResponse.blob();
      const imageUrl = URL.createObjectURL(blob);
      console.log("✅ Got processed image");
      
      setFloorplanImage(imageUrl);
      setDisplayLayers(prev => ({ ...prev, showFloorplan: true }));
  
      // Step 2: Get detected features (walls & rooms)
      console.log("📤 Detecting features...");
      const featureResponse = await fetch("http://localhost:5000/detect-features", {
        method: "POST",
        body: formData,
      });
      
      if (!featureResponse.ok) {
        console.error("Failed to detect features");
        return;
      }
      
      const features = await featureResponse.json();
      
      console.log("✅ Detected walls:", features.walls);
      console.log("✅ Detected rooms:", features.rooms);
      console.log(`📊 Found ${features.walls.length} walls and ${features.rooms.length} rooms`);
      
       // Store features in state
       setWalls(features.walls);
       setRooms(features.rooms);
      
      alert(`Feature detection complete!\n${features.walls.length} walls\n${features.rooms.length} rooms`);
      
    } catch (err) {
      alert("Error processing image");
      console.error("❌ Error:", err);
    }
  };
  const handleFloorPlanCancel = () => {
    setIsUploaderOpen(false);
  };

  // Toggle display layer
  const toggleDisplayLayer = (layer) => {
    setDisplayLayers(prev => ({
      ...prev,
      [layer]: !prev[layer]
    }));
  };

  // Note: All useEffect hooks for context menu, display menu, joystick, size updates, 
  // stage initialization, and canvas drawing are already defined at the top (before early returns)
  // to comply with React Rules of Hooks

  return (
    <div className="flex h-screen w-screen overflow-hidden pt-8">
      
      {/* 1. Primary Left Sidebar (Dark Blue/Gray) */}
      <div className="w-12 bg-[#1F2328] flex flex-col items-center pt-0 pb-4">
        <PrimarySidebarItem
          icon={FaFolderOpen}
          label="Floorplan"
          isActive={activeSection === 'floorplan'}
          onClick={() => { setActiveSection('floorplan'); setSelectedTemplate(null); setIsToolsOpen(true); }}
        />
        <PrimarySidebarItem
          icon={FaCubes}
          label="Templates"
          isActive={activeSection === 'Templates'}
          onClick={() => { setActiveSection('Templates'); setIsToolsOpen(true); }}
        />
        <PrimarySidebarItem
          icon={FaCloud}
          label="Cloud"
          isActive={activeSection === 'cloud'}
          onClick={() => { setActiveSection('cloud'); setSelectedTemplate(null); setIsToolsOpen(true); }}
        />
        <PrimarySidebarItem
          icon={FaUser}
          label="Custom"
          isActive={activeSection === 'custom'}
          onClick={() => { setActiveSection('custom'); setSelectedTemplate(null); setIsToolsOpen(true); }}
        />
        <PrimarySidebarItem
          icon={FaUser}
          label="My"
          isActive={activeSection === 'my'}
          onClick={() => { setActiveSection('my'); setSelectedTemplate(null); setIsToolsOpen(true); }}
        />
      </div>

      {/* 2. Secondary Left Panel (Tools) */}
      <div className={`${isToolsOpen ? 'w-72' : 'w-8'} relative bg-gray-50 shadow-xl flex flex-col overflow-y-auto custom-scrollbar border-r border-gray-200 transition-all duration-300`}>

        {/* Header/Branding for Secondary Sidebar */}
        <div className="flex items-center p-4">
          <FaMagic className="text-blue-500 mr-2" />
          <span className="text-gray-700 font-semibold">AI Design</span>
        </div>

        {/* Arrow button on the scrollbar (right edge, vertically centered) */}
        <button
          onClick={() => setIsToolsOpen(!isToolsOpen)}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 text-gray-700 hover:text-gray-900 p-1 z-10"
        >
          {isToolsOpen ? <FaChevronLeft /> : <FaChevronRight />}
        </button>

        <div className={`p-4 flex-1 ${isToolsOpen ? 'opacity-100' : 'opacity-0 pointer-events-none select-none'} transition-opacity duration-200`}>
          {activeSection === 'floorplan' && (
            <>
              {/* Import Floorplan Section */}
              <h2 className="text-sm font-thin mb-3 text-gray-700">Import floorplan</h2>
              <div className="flex space-x-2 mb-6">
                <button className="px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded font-thin hover:bg-gray-300">Floorplan Library</button>
                <button
                  className="px-2 py-1 text-xs bg-gray-200 text-gray-800 rounded font-thin hover:bg-gray-300"
                  onClick={() => setIsUploaderOpen(true)}
                >
                  Import floorplan
                </button>
              </div>

              {/* Draw Wall Section */}
              <h2 className="text-sm font-light mt-4 mb-3 text-gray-700">Draw wall</h2>
              <div className="flex space-x-2 mb-8">
                <ToolButton label="Draw wall">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 8h8v8" />
                    <path d="M12 8h8" strokeDasharray="3 3" />
                    <rect x="3" y="7" width="2.5" height="2.5" fill="#9EC5F9" stroke="#6B7280" strokeWidth="0.3" />
                    <rect x="11.5" y="15.5" width="2.5" height="2.5" fill="#9EC5F9" stroke="#6B7280" strokeWidth="0.3" />
                  </svg>
                </ToolButton>
                <ToolButton label="Draw Room">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="4" y="4" width="16" height="16" strokeDasharray="3 3" />
                    <rect x="3.5" y="3.5" width="3" height="3" fill="#9EC5F9" stroke="#6B7280" strokeWidth="0.3" />
                    <rect x="17.5" y="3.5" width="3" height="3" fill="#9EC5F9" stroke="#6B7280" strokeWidth="0.3" />
                    <rect x="3.5" y="17.5" width="3" height="3" fill="#9EC5F9" stroke="#6B7280" strokeWidth="0.3" />
                    <rect x="17.5" y="17.5" width="3" height="3" fill="#9EC5F9" stroke="#6B7280" strokeWidth="0.3" />
                  </svg>
                </ToolButton>
                <ToolButton label="Free modeling" isBeta>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2l8 4v8l-8 4-8-4V6z" />
                    <path d="M12 2v16 M4 6l8 4 M20 6l-8 4" />
                    <circle cx="12" cy="2" r="1.2" fill="#9EC5F9" stroke="#6B7280" strokeWidth="0.2" />
                    <circle cx="4" cy="6" r="1.1" fill="#9EC5F9" stroke="#6B7280" strokeWidth="0.2" />
                    <circle cx="20" cy="6" r="1.1" fill="#9EC5F9" stroke="#6B7280" strokeWidth="0.2" />
                  </svg>
                </ToolButton>
              </div>

              {/* Doors/Windows Section */}
              <h2 className="text-sm font-thin mt-4 mb-3 text-gray-700">Doors/Windows</h2>
              <div className="flex flex-wrap gap-x-2 gap-y-3 mb-4">
                <ToolButton label="Single door" isSmall>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="3" height="18" fill="#9EC5F9" stroke="#6B7280" strokeWidth="0.4" />
                    <rect x="18" y="3" width="3" height="18" fill="#9EC5F9" stroke="#6B7280" strokeWidth="0.4" />
                    <path d="M6 21h12" />
                    <path d="M6 21 A9 9 0 0 1 15 12" />
                  </svg>
                </ToolButton>
                <ToolButton label="Double door" isSmall>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="3" height="18" fill="#9EC5F9" stroke="#6B7280" strokeWidth="0.4" />
                    <rect x="18" y="3" width="3" height="18" fill="#9EC5F9" stroke="#6B7280" strokeWidth="0.4" />
                    <path d="M6 21h12" />
                    <path d="M6 21 A5 5 0 0 1 11 16" />
                    <path d="M18 21 A5 5 0 0 0 13 16" />
                  </svg>
                </ToolButton>
                <ToolButton label="Sliding doors" isSmall>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="3" height="18" fill="#9EC5F9" stroke="#6B7280" strokeWidth="0.4" />
                    <rect x="18" y="3" width="3" height="18" fill="#9EC5F9" stroke="#6B7280" strokeWidth="0.4" />
                    <path d="M6 12h12" />
                    <path d="M9 8v8 M15 8v8" />
                  </svg>
                </ToolButton>
                <ToolButton label="Rect window" isSmall>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="3" height="18" fill="#9EC5F9" stroke="#6B7280" strokeWidth="0.4" />
                    <rect x="18" y="3" width="3" height="18" fill="#9EC5F9" stroke="#6B7280" strokeWidth="0.4" />
                    <path d="M6 12h12" />
                    <path d="M12 6v12" />
                  </svg>
                </ToolButton>
                <ToolButton label="French window" isSmall>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="3" height="18" fill="#9EC5F9" stroke="#6B7280" strokeWidth="0.4" />
                    <rect x="18" y="3" width="3" height="18" fill="#9EC5F9" stroke="#6B7280" strokeWidth="0.4" />
                    <path d="M6 12h12" />
                    <path d="M12 6v12" />
                    <path d="M8.5 12h2" strokeDasharray="2 2" />
                    <path d="M13.5 12h2" strokeDasharray="2 2" />
                  </svg>
                </ToolButton>
                <ToolButton label="Bay window" isSmall>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="3" height="18" fill="#9EC5F9" stroke="#6B7280" strokeWidth="0.4" />
                    <rect x="18" y="3" width="3" height="18" fill="#9EC5F9" stroke="#6B7280" strokeWidth="0.4" />
                    <path d="M6 12h12" />
                    <path d="M8 8l4 4-4 4" />
                    <path d="M16 8l-4 4 4 4" />
                  </svg>
                </ToolButton>
              </div>

              {/* Doors & Windows Beta section */}
              <h2 className="text-sm font-light mt-4 mb-3 text-gray-700">Doors & Windows <span className="text-orange-500 text-xs font-normal">Beta</span></h2>
              <div className="flex space-x-2 mb-4">
                <ToolButton label="Single door" isSmall>
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6BA3FF" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="4" height="18" fill="#6BA3FF" />
                    <rect x="17" y="3" width="4" height="18" fill="#6BA3FF" />
                    <rect x="7" y="3" width="10" height="18" fill="#EBF4FF" fillOpacity="0.3" />
                    <path d="M7 21l10 0" />
                    <path d="M7 21 A10 10 0 0 1 17 11" />
                    <circle cx="7" cy="21" r="1" fill="#6BA3FF" />
                  </svg>
                </ToolButton>
                <ToolButton label="Double door" isSmall>
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#6BA3FF" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="4" height="18" fill="#6BA3FF" />
                    <rect x="17" y="3" width="4" height="18" fill="#6BA3FF" />
                    <rect x="7" y="3" width="10" height="18" fill="#EBF4FF" fillOpacity="0.3" />
                    <path d="M7 21l10 0" />
                    <path d="M7 21 A5 5 0 0 1 12 16" />
                    <path d="M17 21 A5 5 0 0 0 12 16" />
                    <circle cx="7" cy="21" r="1" fill="#6BA3FF" />
                    <circle cx="17" cy="21" r="1" fill="#6BA3FF" />
                  </svg>
                </ToolButton>
                <ToolButton label="Sliding doors" isSmall>
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#6BA3FF" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="4" height="18" fill="#6BA3FF" />
                    <rect x="17" y="3" width="4" height="18" fill="#6BA3FF" />
                    <rect x="7" y="3" width="10" height="18" fill="#EBF4FF" fillOpacity="0.3" />
                    <rect x="7" y="8" width="4" height="8" fill="#6BA3FF" />
                    <rect x="13" y="8" width="4" height="8" fill="#6BA3FF" />
                    <circle cx="7" cy="21" r="1" fill="#6BA3FF" />
                    <circle cx="17" cy="21" r="1" fill="#6BA3FF" />
                  </svg>
                </ToolButton>
              </div>

              {/* Scroll arrow */}
              <div className="w-full text-center mt-4">
                <div className="inline-block p-1 bg-gray-200 rounded-full cursor-pointer hover:bg-gray-300">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                    <polygon points="12,2 22,12 12,22 2,12" fill="currentColor" />
                  </svg>
                </div>
              </div>
            </>
          )}

          {activeSection === 'Templates' && (
            <TemplateUploader onTemplateSelect={setSelectedTemplate} selectedTemplate={selectedTemplate} />
          )}

          {activeSection === 'cloud' && (
            <div className="p-2">
              <h2 className="text-sm font-normal mb-3 text-gray-700">Cloud</h2>
              <p className="text-sm text-gray-600">Access projects saved to cloud.</p>
            </div>
          )}

          {activeSection === 'custom' && (
            <div className="p-2">
              <h2 className="text-sm font-normal mb-3 text-gray-700">Custom</h2>
              <p className="text-sm text-gray-600">Your custom components and assets.</p>
            </div>
          )}

          {activeSection === 'my' && (
            <div className="p-2">
              <h2 className="text-sm font-normal mb-3 text-gray-700">My Items</h2>
              <p className="text-sm text-gray-600">Quick access to your recent items.</p>
            </div>
          )}
        </div>
      </div>

      {/* 3. Main Workspace (Grid Canvas) */}
      <div className="flex-1 flex flex-col bg-gray-100 relative">

        {/* Top Header/Menu */}
        <header className="fixed top-0 left-0 right-0 z-30 bg-[#2D3137] h-12 border-b border-gray-700 flex items-center justify-between px-4">
          {/* Brand - Left side */}
          <div className="flex items-center text-white select-none">
            <span className="font-thin text-[14px] tracking-wide">dreamdwell.ai</span>
          </div>

          {/* Menu items */}
          <div className="flex items-center gap-6">
            {/* File Dropdown */}
            <div className="relative" ref={fileMenuRef}>
              <HeaderItem
                icon={FaFile}
                label="File"
                onClick={() => setFileMenuOpen((prev) => !prev)}
              />
              {fileMenuOpen && (
                <div className="absolute top-10 left-0 w-57 bg-white border border-gray-200 rounded shadow-lg text-sm z-20">
                  <ul className="py-1 text-gray-700">
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer font-thin">New Scheme</li>
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer font-thin">Open Local</li>
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer font-thin">Save As</li>
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer font-thin">Save to Local</li>
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer font-thin" onClick={() => setIsUploaderOpen(true)}>Import Floor Plan</li>
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer font-thin">Local Backup Record</li>
                    <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer font-thin">My Scheme</li>
                  </ul>
                </div>
              )}
            </div>

            <HeaderItem icon={FaSave} label="Save" />
            <HeaderItem icon={FaUndo} label="Undo" />
            <HeaderItem icon={FaRedo} label="Redo" />

            {/* Display Dropdown */}
            <div className="relative" ref={displayMenuRef}>
              <HeaderItem
                icon={FaEye}
                label="Display"
                onClick={() => setDisplayMenuOpen((prev) => !prev)}
              />
              {displayMenuOpen && (
                <div className="absolute top-10 left-0 w-64 bg-white border border-gray-200 rounded shadow-lg text-sm z-20">
                  <div className="py-2">
                    <div className="px-4 py-2">
                      <label className="flex items-center cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
                        <input
                          type="checkbox"
                          checked={displayLayers.ceilingLayer}
                          onChange={() => toggleDisplayLayer('ceilingLayer')}
                          className="mr-3"
                        />
                        <span className="text-gray-700 font-extralight">Ceiling Layer</span>
                      </label>
                    </div>
                    <div className="px-4 py-2">
                      <label className="flex items-center cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
                        <input
                          type="checkbox"
                          checked={displayLayers.customDoorsWindows}
                          onChange={() => toggleDisplayLayer('customDoorsWindows')}
                          className="mr-3"
                        />
                        <span className="text-gray-700 font-extralight">Custom Doors and Windows</span>
                      </label>
                    </div>
                    <div className="px-4 py-2">
                      <label className="flex items-center cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
                        <input
                          type="checkbox"
                          checked={displayLayers.archway}
                          onChange={() => toggleDisplayLayer('archway')}
                          className="mr-3"
                        />
                        <span className="text-gray-700 font-extralight">Archway</span>
                      </label>
                    </div>
                    <div className="px-4 py-2 border-t border-gray-100">
                      <div className="flex items-center justify-between cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
                        <span className="text-gray-700 font-extralight">Floor Plan</span>
                        <FaChevronRight className="text-gray-400 text-xs" />
                      </div>
                      <div className="ml-6 mt-2 space-y-1">
                        <label className="flex items-center cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
                          <input
                            type="checkbox"
                            checked={displayLayers.showFloorplan}
                            onChange={() => toggleDisplayLayer('showFloorplan')}
                            className="mr-3"
                          />
                          <span className="text-gray-600 font-extralight text-sm">Show Floorplan</span>
                        </label>
                        <label className="flex items-center cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
                          <input
                            type="checkbox"
                            checked={displayLayers.showProcessedImage}
                            onChange={() => toggleDisplayLayer('showProcessedImage')}
                            className="mr-3"
                          />
                          <span className="text-gray-600 font-extralight text-sm">Show Processed Image</span>
                        </label>
                        <label className="flex items-center cursor-pointer hover:bg-gray-50 px-2 py-1 rounded">
                          <input
                            type="checkbox"
                            checked={displayLayers.lockFloorplan}
                            onChange={() => toggleDisplayLayer('lockFloorplan')}
                            className="mr-3"
                          />
                          <span className="text-gray-600 font-extralight text-sm">Lock Floorplan</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Smart Template with active state */}
            <div 
              className={`flex flex-col items-center justify-center cursor-pointer select-none ${
                smartRecognitionActive ? 'text-blue-400' : 'text-gray-300 hover:text-white'
              }`}
              onClick={handleSmartRecognitionToggle}
            >
              <FaMagic className="text-base mb-0.5 opacity-90" />
              <span className="text-[10px] leading-3 tracking-tight font-extralight">Smart Template</span>
            </div>

            <HeaderItem icon={FaWrench} label="Tool" />
            <div
              className={`flex flex-col items-center justify-center cursor-pointer select-none ${
                showMeasurements ? 'text-blue-400' : 'text-gray-300 hover:text-white'
              }`}
              onClick={handleMeasurementToggle}
            >
              <FaPencilRuler className="text-base mb-0.5 opacity-90" />
              <span className="text-[10px] leading-3 tracking-tight font-extralight">Measure</span>
            </div>
            <HeaderItem icon={FaList} label="List" />
            <HeaderItem icon={FaMagic} label="AiDesign" onClick={() => navigate('/ai-design')} />
          </div>

          {/* Help and User Profile - Right side */}
          <div className="flex items-center gap-4">
            <HeaderItem icon={FaQuestionCircle} label="Help" />
            
            {(() => {
              const storedUser = (() => {
                try {
                  return JSON.parse(localStorage.getItem("user"));
                } catch {
                  return null;
                }
              })();
              
              if (storedUser) {
                // For interior designers, prioritize designerName, then name, then firstName/lastName, then email
                const displayName = storedUser.designerName || 
                                  storedUser.name || 
                                  [storedUser.firstName, storedUser.lastName].filter(Boolean).join(" ") || 
                                  storedUser.email;
                const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                
                return (
                  <div className="flex items-center gap-2 text-white">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                      {initials}
                    </div>
                    <span className="text-sm font-thin">{displayName}</span>
                  </div>
                );
              } else {
                return (
                  <div className="flex items-center gap-2 text-gray-300">
                    <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                      <FaUser className="text-white text-sm" />
                    </div>
                    <span className="text-sm font-thin">Guest</span>
                  </div>
                );
              }
            })()}
          </div>
        </header>

        {/* Grid Canvas - No scrolling */}
        <div className="flex-1 p-4 relative overflow-hidden bg-white">
          <style>{`
            .design-canvas {
              background-image:
                linear-gradient(to right, #ececec 1px, transparent 1px),
                linear-gradient(to bottom, #ececec 1px, transparent 1px);
              background-size: 20px 20px;
              overflow: hidden;
            }
          `}</style>
          
          <div ref={designCanvasRef} className="absolute inset-0 design-canvas" style={{ transform: `scale(${zoom})`, transformOrigin: 'center center' }}>
            {/* --- View Mode Controls (Top-Right) --- */}
            <div className="absolute top-4 right-4 z-30 flex flex-row gap-2">
              <button
                className={`w-10 h-10 border border-gray-300 rounded-md shadow-md hover:bg-white transition-colors flex items-center justify-center text-gray-700 font-bold text-sm ${viewMode === '2d' ? 'bg-blue-500 text-white' : 'bg-white/90'}`}
                onClick={() => setViewMode('2d')}
                title="2D View"
              >
                2D
              </button>
              <button
                className={`w-10 h-10 border border-gray-300 rounded-md shadow-md hover:bg-white transition-colors flex items-center justify-center text-gray-700 font-bold text-sm ${viewMode === '3d' ? 'bg-blue-500 text-white' : 'bg-white/90'}`}
                onClick={() => setViewMode('3d')}
                title="3D View"
              >
                3D
              </button>
              <button
                className={`w-10 h-10 border border-gray-300 rounded-md shadow-md hover:bg-white transition-colors flex items-center justify-center text-gray-700 font-bold text-sm ${viewMode === 'roam' ? 'bg-blue-500 text-white' : 'bg-white/90'}`}
                onClick={() => setViewMode('roam')}
                title="Roam Mode"
              >
                Roam
              </button>
            </div>



            {/* --- Floating 360° Joystick (Bottom-Left) --- */}
            <div ref={joystickRef} className="absolute bottom-6 left-6 z-30 w-24 h-24"></div>

            {/* Floorplan Konva Stage */}
            <Stage
              ref={stageRef}
              width={stageSize.width}
              height={stageSize.height}
              onContextMenu={handleRightClick}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
            >
              <Layer>
                {/* Background Image - Original Floor Plan */}
                {floorplanImage && displayLayers.showFloorplan && (
                  <FloorplanImage 
                    src={floorplanImage}
                    width={floorplanImageDimensions.width}
                    height={floorplanImageDimensions.height}
                    opacity={0.7}
                    listening={!displayLayers.lockFloorplan}
                  />
                )}
                
                {/* Processed Image - AI Analyzed Floor Plan */}
                {processedFloorplanImage && displayLayers.showProcessedImage && (
                  <FloorplanImage 
                    src={processedFloorplanImage}
                    width={floorplanImageDimensions.width}
                    height={floorplanImageDimensions.height}
                    opacity={0.9}
                    listening={!displayLayers.lockFloorplan}
                  />
                )}
                
                {/* Add a visual indicator when processed image is shown */}
                {processedFloorplanImage && displayLayers.showProcessedImage && (
                  <Text
                    text="AI Processed Floor Plan"
                    fontSize={14}
                    fontStyle="bold"
                    fill="#4CAF50"
                    x={10}
                    y={10}
                    padding={5}
                    background="#FFFFFF"
                    cornerRadius={3}
                  />
                )}

                {/* Grid Lines removed as requested */}

                {/* Current drawing line */}
                {currentLine && (
                  <Line
                    points={[currentLine.start.x, currentLine.start.y, currentLine.end.x, currentLine.end.y]}
                    stroke="#FF0000"
                    strokeWidth={2}
                  />
                )}

                {/* Walls */}
                {walls.map((wall, index) => (
                  <Line
                    key={`wall-${index}`}
                    points={wall.type === 'horizontal'
                      ? [wall.start, wall.y, wall.end, wall.y]
                      : [wall.x, wall.start, wall.x, wall.end]
                    }
                    stroke={selectedWall === index ? '#FF0000' : '#2D3748'}
                    strokeWidth={selectedWall === index ? 5 : 3}
                    draggable
                    onDragEnd={(e) => {
                      const newWalls = [...walls];
                      if (wall.type === 'horizontal') {
                        newWalls[index] = { ...wall, y: e.target.y() };
                      } else {
                        newWalls[index] = { ...wall, x: e.target.x() };
                      }
                      setWalls(newWalls);
                    }}
                    onClick={() => setSelectedWall(selectedWall === index ? null : index)}
                  />
                ))}

                {/* Traced Paths */}
                {tracedPaths.map((path, index) => (
                  <Path
                    key={path.id}
                    data={path.data}
                    fill={path.fill}
                    stroke={path.stroke}
                    strokeWidth={path.strokeWidth}
                    draggable={path.draggable}
                    onDragEnd={(e) => {
                      // Update path position if needed
                      const newPaths = [...tracedPaths];
                      // For simplicity, we'll just allow dragging, but position updates might need more complex handling
                      newPaths[index] = { ...path };
                      setTracedPaths(newPaths);
                    }}
                  />
                ))}

                {/* Rooms - Removed */}

                {/* Measurements */}
                {showMeasurements && editableMeasurements.map((measurement, index) => (
                  <Text
                    key={`measurement-${index}`}
                    x={measurement.x}
                    y={measurement.y}
                    text={measurement.text}
                    fontSize={12}
                    fill="#4B5563"
                    align="center"
                    onDblClick={() => {
                      setEditingMeasurementIndex(index);
                      setMeasurementInput(measurement.text);
                    }}
                  />
                ))}
              </Layer>
            </Stage>

            {/* Zoom Slider (Bottom) */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30 bg-white/90 border border-gray-300 rounded-lg shadow-md p-3 flex items-center gap-3">
              <span className="text-xs text-gray-600 font-semibold">Zoom:</span>
              <input
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={zoom}
                onChange={(e) => setZoom(parseFloat(e.target.value))}
                className="w-32"
                title="Zoom Level"
              />
              <span className="text-xs text-gray-600 font-semibold w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                className="text-xs bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600"
                onClick={() => setZoom(2)}
                title="Reset to 200% Zoom"
              >
                200%
              </button>
            </div>

            {/* Measurement Input Overlay */}
            {editingMeasurementIndex !== null && editableMeasurements[editingMeasurementIndex] && (
              <div
                className="absolute bg-white rounded shadow-lg p-2 z-50"
                style={{
                  left: (editableMeasurements[editingMeasurementIndex].x * zoom + pan.x) + 'px',
                  top: (editableMeasurements[editingMeasurementIndex].y * zoom + pan.y) + 'px',
                  transform: 'translate(-50%, -50%)'
                }}
              >
                <input
                  type="text"
                  value={measurementInput}
                  onChange={(e) => setMeasurementInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleMeasurementEdit(editingMeasurementIndex, measurementInput);
                      setEditingMeasurementIndex(null);
                      setMeasurementInput('');
                    } else if (e.key === 'Escape') {
                      setEditingMeasurementIndex(null);
                      setMeasurementInput('');
                    }
                  }}
                  className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>
            )}

            {/* Dimension Input Overlay */}
            {editingDimension !== null && (
              <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 z-40 min-w-64">
                <h3 className="text-lg font-semibold mb-3 text-gray-800">Edit Wall Dimension</h3>
                <div className="flex items-center gap-2 mb-3">
                  <label className="text-sm font-medium text-gray-700">Length:</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.1"
                    value={dimensionInput}
                    onChange={(e) => setDimensionInput(e.target.value)}
                    className="flex-1 px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <span className="text-sm text-gray-600">m</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (dimensionInput && parseFloat(dimensionInput) > 0) {
                        handleDimensionEdit(editingDimension, dimensionInput);
                      }
                      setEditingDimension(null);
                      setDimensionInput('');
                    }}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
                  >
                    Apply
                  </button>
                  <button
                    onClick={() => {
                      setEditingDimension(null);
                      setDimensionInput('');
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
            
            {schemeLoading.loading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-4 shadow-lg text-center">
                  <p className="text-lg font-semibold">
                    {schemeLoading.progress < 100 ? "Scheme Loading..." : "Scheme loaded"}
                  </p>
                  <div className="w-48 h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-200"
                      style={{ width: `${schemeLoading.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {schemeLoading.progress}%
                  </p>
                </div>
              </div>
            )}

            {selectedTemplate && (
              <TemplateOnCanvas
                selectedCategory={selectedTemplate}
                rotation={rotation}
              />
            )}

            {/* 2D/3D/Roam toggle */}
            {selectedTemplate && (
              <div className="absolute top-8 right-2 z-20">
                <div className="bg-white/95 border border-gray-200 rounded-md shadow flex">
                  <button className="px-3 py-1 text-xs bg-blue-500 text-white rounded-l-md hover:bg-blue-600">
                    2D
                  </button>
                  <button className="px-3 py-1 text-xs bg-white text-gray-700 hover:bg-gray-50">
                    3D
                  </button>
                  <button className="px-3 py-1 text-xs bg-white text-gray-700 rounded-r-md hover:bg-gray-50">
                    Roam
                  </button>
                </div>
              </div>
            )}

            {/* Arrow Buttons (Bottom-Right) */}
            {selectedTemplate && (
              <div className="absolute bottom-6 right-6 flex flex-col items-center z-30 space-y-1">
                <button 
                  className="w-6 h-6 bg-gray-100 border rounded-full flex items-center justify-center text-xs font-bold hover:bg-gray-200"
                  onClick={() => console.log("Move Up")}
                >↑</button>
                <div className="flex items-center space-x-1">
                  <button 
                    className="w-6 h-6 bg-gray-100 border rounded-full flex items-center justify-center text-xs font-bold hover:bg-gray-200"
                    onClick={() => console.log("Move Left")}
                  >←</button>
                  <div className="w-6 h-6"></div>
                  <button 
                    className="w-6 h-6 bg-gray-100 border rounded-full flex items-center justify-center text-xs font-bold hover:bg-gray-200"
                    onClick={() => console.log("Move Right")}
                  >→</button>
                </div>
                <button 
                  className="w-6 h-6 bg-gray-100 border rounded-full flex items-center justify-center text-xs font-bold hover:bg-gray-200"
                  onClick={() => console.log("Move Down")}
                >↓</button>
              </div>
            )}
            
            {/* Right floating actions (compact vertical items) */}
            <div className="absolute top-52 right-2 space-y-2 z-20">
              <ActionItem icon={FaCompass} label="Navigation" />
              <ActionItem icon={FaCamera} label="Render" active />
              <ActionItem icon={FaImages} label="Gallery" />
              <ActionItem icon={FaRegClone} label="Snapshot" />
              <ActionItem icon={FaPencilRuler} label="Measure" active={drawingMode} onClick={() => setDrawingMode(!drawingMode)} />
            </div>
          </div>

          {/* Context Menu */}
          {contextMenu.visible && (
            <div
              ref={contextMenuRef}
              className="fixed z-50 bg-white border border-gray-300 rounded shadow-lg py-1"
              style={{ top: contextMenu.y, left: contextMenu.x }}
            >
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={handleSaveImage}
              >
                Save image
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={handleCopy}
              >
                Copy
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={handleCut}
              >
                Cut
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={handlePaste}
              >
                Paste
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                onClick={handleDelete}
              >
                Delete image
              </button>
              <button
                className="w-full text-left px-4 py-2 hover:bg-gray-100"
                onClick={handleClearMeasurements}
              >
                Clear Measurements
              </button>
            </div>
          )}
        </div>
      </div>
      
      {isUploaderOpen && (
        <FloorPlanUploader
          onDone={handleFloorPlanDone}
          onCancel={handleFloorPlanCancel}
        />
      )}
    </div>
  );
};

export default InteriorDesignDashboard;