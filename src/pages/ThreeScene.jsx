import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, useGLTF, useTexture, Sky } from '@react-three/drei';
import { Physics, usePlane, useBox } from '@react-three/cannon';
import * as THREE from 'three';

// Floor component with physics
const Floor = ({ style, roomType, ...props }) => {
  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], ...props }));
  
  // Select texture based on style and room type
  let textureUrl = 'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@latest/prototype/light/texture_08.png';
  let floorColor = "#f0f0f0";
  let textureRepeat = 10;
  
  // Adjust floor texture and color based on style
  if (style === 'Light luxury') {
    // Light luxury has marble or high-end wood textures
    if (roomType === 'Living room' || roomType === 'Restaurant') {
      textureUrl = 'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@latest/prototype/light/texture_03.png';
      floorColor = "#f5f0e6"; // Cream marble
      textureRepeat = 8;
    } else if (roomType === 'Master room' || roomType === 'Guest room') {
      textureUrl = 'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@latest/prototype/dark/texture_03.png';
      floorColor = "#e8d8c0"; // Warm wood
      textureRepeat = 12;
    } else if (roomType === 'Kitchen') {
      textureUrl = 'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@latest/prototype/light/texture_02.png';
      floorColor = "#f0f0f0"; // Light tile
      textureRepeat = 15;
    } else if (roomType === 'Bathroom') {
      textureUrl = 'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@latest/prototype/light/texture_01.png';
      floorColor = "#f8f8f8"; // White marble
      textureRepeat = 6;
    } else {
      textureUrl = 'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@latest/prototype/light/texture_03.png';
      floorColor = "#f5f0e6"; // Default luxury
      textureRepeat = 8;
    }
  } else if (style === 'Modern') {
    // Modern style has sleek, contemporary flooring
    if (roomType === 'Living room' || roomType === 'Restaurant') {
      textureUrl = 'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@latest/prototype/light/texture_07.png';
      floorColor = "#e0e0e0"; // Gray concrete
      textureRepeat = 8;
    } else if (roomType === 'Master room' || roomType === 'Guest room') {
      textureUrl = 'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@latest/prototype/light/texture_04.png';
      floorColor = "#d9d9d9"; // Dark gray
      textureRepeat = 10;
    } else if (roomType === 'Kitchen') {
      textureUrl = 'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@latest/prototype/light/texture_08.png';
      floorColor = "#e8e8e8"; // Light gray tile
      textureRepeat = 12;
    } else if (roomType === 'Bathroom') {
      textureUrl = 'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@latest/prototype/light/texture_02.png';
      floorColor = "#f0f0f0"; // White tile
      textureRepeat = 15;
    } else {
      textureUrl = 'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@latest/prototype/light/texture_07.png';
      floorColor = "#e0e0e0"; // Default modern
      textureRepeat = 8;
    }
  } else if (style === 'Northern Europe') {
    // Northern Europe style has warm, natural wood tones
    if (roomType === 'Living room' || roomType === 'Restaurant') {
      textureUrl = 'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@latest/prototype/light/texture_05.png';
      floorColor = "#e6dfd1"; // Light wood
      textureRepeat = 12;
    } else if (roomType === 'Master room' || roomType === 'Guest room') {
      textureUrl = 'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@latest/prototype/light/texture_05.png';
      floorColor = "#d8cdb8"; // Slightly darker wood for bedrooms
      textureRepeat = 10;
    } else if (roomType === 'Kitchen') {
      textureUrl = 'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@latest/prototype/light/texture_05.png';
      floorColor = "#e6dfd1"; // Light wood
      textureRepeat = 14;
    } else if (roomType === 'Bathroom') {
      textureUrl = 'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@latest/prototype/light/texture_02.png';
      floorColor = "#f0ebe0"; // Light tile with warm undertone
      textureRepeat = 16;
    } else {
      textureUrl = 'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@latest/prototype/light/texture_05.png';
      floorColor = "#e6dfd1"; // Default Nordic
      textureRepeat = 12;
    }
  } else if (style === 'Minimalist') {
    // Minimalist style has clean, simple flooring
    if (roomType === 'Living room' || roomType === 'Restaurant') {
      textureUrl = 'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@latest/prototype/light/texture_08.png';
      floorColor = "#f5f5f5"; // White
      textureRepeat = 6;
    } else if (roomType === 'Master room' || roomType === 'Guest room') {
      textureUrl = 'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@latest/prototype/light/texture_08.png';
      floorColor = "#f0f0f0"; // Slightly off-white for bedrooms
      textureRepeat = 6;
    } else if (roomType === 'Kitchen') {
      textureUrl = 'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@latest/prototype/light/texture_08.png';
      floorColor = "#f8f8f8"; // Pure white for kitchen
      textureRepeat = 8;
    } else if (roomType === 'Bathroom') {
      textureUrl = 'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@latest/prototype/light/texture_08.png';
      floorColor = "#ffffff"; // Bright white for bathroom
      textureRepeat = 10;
    } else {
      textureUrl = 'https://cdn.jsdelivr.net/gh/pmndrs/drei-assets@latest/prototype/light/texture_08.png';
      floorColor = "#f5f5f5"; // Default minimalist
      textureRepeat = 6;
    }
  }
  
  const texture = useTexture({
    map: textureUrl,
  });
  
  // Repeat the texture
  texture.map.repeat.set(textureRepeat, textureRepeat);
  texture.map.wrapS = texture.map.wrapT = THREE.RepeatWrapping;
  
  return (
    <mesh ref={ref} receiveShadow>
      <planeGeometry args={[50, 50]} />
      <meshStandardMaterial {...texture} color={floorColor} />
    </mesh>
  );
};

// Wall component
const Wall = ({ position, rotation, size = [4, 2.5, 0.1], color = "#ffffff" }) => {
  const [ref] = useBox(() => ({ 
    position, 
    rotation,
    args: size,
    type: 'static'
  }));
  
  return (
    <mesh ref={ref} castShadow receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
};

// Furniture component that loads a GLTF model
const Furniture = ({ modelPath, position, rotation, scale = [1, 1, 1], color = "#a0522d", type, style, roomType }) => {
  // This is a placeholder - in a real app, you'd load actual models
  // For now, we'll create a simple box to represent furniture
  const [ref] = useBox(() => ({ 
    position, 
    rotation,
    args: scale,
    mass: 1
  }));
  
  // Determine material properties based on style and furniture type
  let materialProps = {
    color: color,
    roughness: 0.7,
    metalness: 0.0
  };
  
  // Enhance materials for different styles
  if (style === 'Light luxury') {
    if (type === 'furniture') {
      // Gold/luxury furniture has metallic properties
      materialProps.roughness = 0.3;
      materialProps.metalness = 0.8;
    } else if (type === 'cabinet') {
      // Cabinets have a glossy finish
      materialProps.roughness = 0.2;
      materialProps.metalness = 0.1;
    }
  } else if (style === 'Modern') {
    if (type === 'furniture') {
      // Modern furniture has sleek, smooth surfaces
      materialProps.roughness = 0.3;
      materialProps.metalness = 0.4;
      
      // Room-specific adjustments
      if (roomType === 'Living room') {
        materialProps.color = "#808080"; // Gray for living room furniture
      } else if (roomType === 'Kitchen') {
        materialProps.color = "#606060"; // Darker gray for kitchen
        materialProps.metalness = 0.5; // More metallic for kitchen appliances
      } else if (roomType === 'Master room' || roomType === 'Guest room') {
        materialProps.color = "#707070"; // Medium gray for bedroom furniture
      } else if (roomType === 'Bathroom') {
        materialProps.color = "#909090"; // Light gray for bathroom
        materialProps.metalness = 0.6; // More metallic for bathroom fixtures
      }
    } else if (type === 'cabinet') {
      // Modern cabinets have very smooth, glossy surfaces
      materialProps.roughness = 0.1;
      materialProps.metalness = 0.2;
      materialProps.color = "#f0f0f0"; // White/light gray cabinets
    }
  } else if (style === 'Minimalist') {
    if (type === 'furniture') {
      // Minimalist furniture has matte, simple surfaces
      materialProps.roughness = 0.9;
      materialProps.metalness = 0.0;
      
      // Room-specific adjustments
      if (roomType === 'Living room' || roomType === 'Restaurant') {
        materialProps.color = "#f5f5f5"; // White for living areas
      } else if (roomType === 'Kitchen') {
        materialProps.color = "#f0f0f0"; // Slightly off-white for kitchen
      } else if (roomType === 'Master room' || roomType === 'Guest room') {
        materialProps.color = "#f8f8f8"; // Bright white for bedrooms
      } else if (roomType === 'Bathroom') {
        materialProps.color = "#ffffff"; // Pure white for bathroom
      }
    } else if (type === 'cabinet') {
      // Minimalist cabinets have clean, simple lines
      materialProps.roughness = 0.8;
      materialProps.metalness = 0.0;
      materialProps.color = "#e0e0e0"; // Light gray cabinets
    }
  } else if (style === 'Northern Europe') {
    if (type === 'furniture') {
      // Northern Europe furniture has natural, warm textures
      materialProps.roughness = 0.7;
      materialProps.metalness = 0.1;
      
      // Room-specific adjustments
      if (roomType === 'Living room') {
        materialProps.color = "#d8c3a5"; // Warm beige for living room
      } else if (roomType === 'Kitchen') {
        materialProps.color = "#e6dfd1"; // Light wood for kitchen
      } else if (roomType === 'Master room' || roomType === 'Guest room') {
        materialProps.color = "#d2bea0"; // Slightly darker wood for bedrooms
      } else if (roomType === 'Bathroom') {
        materialProps.color = "#e0d5c0"; // Light wood for bathroom
      } else if (roomType === 'Restaurant') {
        materialProps.color = "#cdb99e"; // Medium wood for dining
      }
    } else if (type === 'cabinet') {
      // Nordic cabinets have natural wood appearance
      materialProps.roughness = 0.6;
      materialProps.metalness = 0.0;
      materialProps.color = "#e6dfd1"; // Light wood cabinets
    }
  }
  
  return (
    <mesh ref={ref} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial {...materialProps} />
    </mesh>
  );
};

// Camera controls with first-person navigation
const CameraControls = ({ isRoamMode }) => {
  const { camera, gl } = useThree();
  const controlsRef = useRef();
  
  useEffect(() => {
    if (controlsRef.current) {
      if (isRoamMode) {
        // First-person controls for roam mode
        controlsRef.current.minPolarAngle = 0;
        controlsRef.current.maxPolarAngle = Math.PI;
        controlsRef.current.minDistance = 0;
        controlsRef.current.maxDistance = 0;
      } else {
        // Orbit controls for 3D mode
        controlsRef.current.minPolarAngle = 0;
        controlsRef.current.maxPolarAngle = Math.PI / 2;
        controlsRef.current.minDistance = 2;
        controlsRef.current.maxDistance = 10;
      }
    }
  }, [isRoamMode]);
  
  return (
    <OrbitControls
      ref={controlsRef}
      args={[camera, gl.domElement]}
      enableDamping
      dampingFactor={0.05}
      screenSpacePanning={false}
      enableZoom={!isRoamMode}
      enablePan={!isRoamMode}
    />
  );
};

// Room scene component
const RoomScene = ({ roomType, style, size, elementFilters = { all: true } }) => {
  // Room dimensions based on size
  const sizeValue = parseFloat(size);
  const width = Math.sqrt(sizeValue) * 0.8;
  const length = Math.sqrt(sizeValue) * 0.8;
  const height = 2.5;
  
  // Determine which elements to show based on filters
  const showAll = elementFilters.all;
  const showCeiling = showAll || elementFilters.ceiling;
  const showWalls = showAll || elementFilters.wall;
  const showFloor = showAll || elementFilters.floor;
  const showFurniture = showAll || elementFilters.furniture;
  const showCabinet = showAll || elementFilters.cabinet;
  
  // Determine wall and ceiling colors based on style
  let wallColor = "#f5f5f5"; // Default wall color
  let ceilingColor = "#ffffff"; // Default ceiling color
  
  // Adjust colors based on style
  if (style === 'Light luxury') {
    // Light luxury has slightly warmer, more elegant wall colors
    wallColor = "#f8f4e3"; // Warm off-white for walls
    ceilingColor = "#fffdf7"; // Bright warm white for ceiling
    
    // Room-specific adjustments for Light luxury
    if (roomType === 'Master room' || roomType === 'Guest room') {
      wallColor = "#f5efe5"; // Slightly warmer for bedrooms
    } else if (roomType === 'Bathroom') {
      wallColor = "#f9f9f9"; // Brighter white for bathroom
    } else if (roomType === 'Restaurant') {
      wallColor = "#f6f1e0"; // Warm cream for dining areas
    }
  } else if (style === 'Modern') {
    wallColor = "#f0f0f0"; // Cooler white for modern
    ceilingColor = "#ffffff"; // Pure white ceiling
    
    // Room-specific adjustments for Modern
    if (roomType === 'Living room') {
      wallColor = "#e8e8e8"; // Light gray for living room
    } else if (roomType === 'Master room' || roomType === 'Guest room') {
      wallColor = "#e0e0e0"; // Slightly darker gray for bedrooms
    } else if (roomType === 'Kitchen') {
      wallColor = "#f5f5f5"; // Brighter white for kitchen
    } else if (roomType === 'Bathroom') {
      wallColor = "#ffffff"; // Pure white for bathroom
    } else if (roomType === 'Restaurant') {
      wallColor = "#e5e5e5"; // Medium gray for dining
    }
  } else if (style === 'Northern Europe') {
    wallColor = "#f7f7f7"; // Bright white for Nordic
    ceilingColor = "#ffffff"; // Pure white ceiling
    
    // Room-specific adjustments for Northern Europe
    if (roomType === 'Living room') {
      wallColor = "#f5f5f5"; // Slightly off-white for living room
    } else if (roomType === 'Master room' || roomType === 'Guest room') {
      wallColor = "#f0f0f0"; // Light gray for bedrooms
    } else if (roomType === 'Kitchen') {
      wallColor = "#f8f8f8"; // Bright white for kitchen
    } else if (roomType === 'Bathroom') {
      wallColor = "#ffffff"; // Pure white for bathroom
    } else if (roomType === 'Restaurant') {
      wallColor = "#f2f2f2"; // Light gray for dining
    }
  } else if (style === 'Minimalist') {
    wallColor = "#ffffff"; // Pure white for minimalist
    ceilingColor = "#ffffff"; // Pure white ceiling
    
    // Room-specific adjustments for Minimalist
    if (roomType === 'Living room') {
      wallColor = "#ffffff"; // Pure white for living room
    } else if (roomType === 'Master room' || roomType === 'Guest room') {
      wallColor = "#fafafa"; // Very slight off-white for bedrooms
    } else if (roomType === 'Kitchen') {
      wallColor = "#ffffff"; // Pure white for kitchen
    } else if (roomType === 'Bathroom') {
      wallColor = "#ffffff"; // Pure white for bathroom
    } else if (roomType === 'Restaurant') {
      wallColor = "#fcfcfc"; // Almost pure white for dining
    }
  }
  
  // Wall positions
  const walls = [
    // Back wall
    { position: [0, height/2, -length/2], rotation: [0, 0, 0], size: [width, height, 0.1], color: wallColor },
    // Front wall
    { position: [0, height/2, length/2], rotation: [0, 0, 0], size: [width, height, 0.1], color: wallColor },
    // Left wall
    { position: [-width/2, height/2, 0], rotation: [0, Math.PI/2, 0], size: [length, height, 0.1], color: wallColor },
    // Right wall
    { position: [width/2, height/2, 0], rotation: [0, Math.PI/2, 0], size: [length, height, 0.1], color: wallColor },
  ];
  
  // Ceiling
  const ceiling = {
    position: [0, height, 0],
    rotation: [Math.PI/2, 0, 0],
    size: [width, length, 0.1],
    color: ceilingColor
  };
  
  // Furniture based on room type and style
  const getFurniture = () => {
    // Base furniture for each room type
    let furniture = [];
    
    switch (roomType) {
      case 'Living room':
        furniture = [
          { position: [0, 0.5, 0], rotation: [0, 0, 0], scale: [2, 1, 1], color: "#d4c4a8", type: "furniture" }, // Sofa
          { position: [0, 0.3, 1.5], rotation: [0, 0, 0], scale: [1.5, 0.3, 0.8], color: "#8b4513", type: "furniture" }, // Coffee table
          { position: [-width/2 + 0.8, 0.75, -length/2 + 0.8], rotation: [0, 0, 0], scale: [1.2, 1.5, 0.4], color: "#6b5b4b", type: "cabinet" }, // TV cabinet
          { position: [width/2 - 0.8, 0.5, 0], rotation: [0, -Math.PI/4, 0], scale: [1, 1, 1], color: "#d4c4a8", type: "furniture" }, // Armchair
        ];
        break;
      case 'Kitchen':
        furniture = [
          { position: [-width/2 + 1, 0.5, 0], rotation: [0, 0, 0], scale: [2, 1, 0.6], color: "#f0f0f0", type: "cabinet" }, // Counter
          { position: [0, 0.5, -length/2 + 0.5], rotation: [0, 0, 0], scale: [1, 1.8, 0.6], color: "#d0d0d0", type: "cabinet" }, // Fridge
          { position: [width/2 - 1, 0.5, 0], rotation: [0, 0, 0], scale: [2, 1, 0.6], color: "#f0f0f0", type: "cabinet" }, // Island
          { position: [0, 0.4, length/2 - 1], rotation: [0, Math.PI, 0], scale: [3, 0.8, 0.6], color: "#f0f0f0", type: "cabinet" }, // Sink area
        ];
        break;
      case 'Master room':
      case 'Guest room':
        furniture = [
          { position: [0, 0.3, 0], rotation: [0, Math.PI/2, 0], scale: [2, 0.5, 1.8], color: "#e6d2b5", type: "furniture" }, // Bed
          { position: [width/2 - 0.5, 0.5, -length/2 + 0.5], rotation: [0, 0, 0], scale: [0.8, 1, 0.8], color: "#8b4513", type: "furniture" }, // Nightstand
          { position: [-width/2 + 0.5, 0.5, -length/2 + 0.5], rotation: [0, 0, 0], scale: [0.8, 1, 0.8], color: "#8b4513", type: "furniture" }, // Nightstand
          { position: [-width/2 + 0.8, 1, length/2 - 0.8], rotation: [0, Math.PI/4, 0], scale: [1.5, 2, 0.4], color: "#6b5b4b", type: "cabinet" }, // Wardrobe
        ];
        break;
      case 'Restaurant':
        furniture = [
          { position: [0, 0.4, 0], rotation: [0, 0, 0], scale: [2, 0.1, 1.2], color: "#8b4513", type: "furniture" }, // Dining table
          { position: [0.7, 0.5, 0.4], rotation: [0, -Math.PI/8, 0], scale: [0.5, 1, 0.5], color: "#a0522d", type: "furniture" }, // Chair
          { position: [-0.7, 0.5, 0.4], rotation: [0, Math.PI/8, 0], scale: [0.5, 1, 0.5], color: "#a0522d", type: "furniture" }, // Chair
          { position: [0.7, 0.5, -0.4], rotation: [0, -Math.PI/8 - Math.PI, 0], scale: [0.5, 1, 0.5], color: "#a0522d", type: "furniture" }, // Chair
          { position: [-0.7, 0.5, -0.4], rotation: [0, Math.PI/8 + Math.PI, 0], scale: [0.5, 1, 0.5], color: "#a0522d", type: "furniture" }, // Chair
          { position: [width/2 - 0.6, 0.9, 0], rotation: [0, -Math.PI/2, 0], scale: [2, 1.8, 0.4], color: "#6b5b4b", type: "cabinet" }, // Sideboard
        ];
        break;
      case 'Study':
        furniture = [
          { position: [0, 0.4, -length/2 + 0.8], rotation: [0, 0, 0], scale: [2, 0.8, 0.8], color: "#5c4033", type: "furniture" }, // Desk
          { position: [0, 0.5, -length/2 + 1.5], rotation: [0, Math.PI, 0], scale: [0.6, 1, 0.6], color: "#a0522d", type: "furniture" }, // Chair
          { position: [width/2 - 0.6, 1, 0], rotation: [0, -Math.PI/2, 0], scale: [length - 1.6, 2, 0.4], color: "#6b5b4b", type: "cabinet" }, // Bookshelf
        ];
        break;
      case 'Bathroom':
        furniture = [
          { position: [-width/2 + 1, 0.4, -length/2 + 1], rotation: [0, 0, 0], scale: [1.8, 0.8, 0.6], color: "#f0f0f0", type: "cabinet" }, // Vanity
          { position: [width/2 - 0.8, 0.1, -length/2 + 1.5], rotation: [0, 0, 0], scale: [1.4, 0.2, 2.8], color: "#f5f5f5", type: "furniture" }, // Bathtub
          { position: [width/2 - 0.8, 0.1, length/2 - 0.8], rotation: [0, 0, 0], scale: [1.4, 0.2, 1.4], color: "#f5f5f5", type: "furniture" }, // Shower
        ];
        break;
      default:
        furniture = [
          { position: [0, 0.5, 0], rotation: [0, 0, 0], scale: [1, 1, 1], color: "#a0522d", type: "furniture" }, // Generic furniture
        ];
    }
    
    // Apply style variations
    return furniture.map(item => {
      let colorAdjusted = item.color;
      
      // Adjust colors based on style
      switch (style) {
        case 'Modern':
          if (item.type === 'furniture') colorAdjusted = "#808080";
          if (item.type === 'cabinet') colorAdjusted = "#f0f0f0";
          break;
        case 'Rustic':
          if (item.type === 'furniture') colorAdjusted = "#8b4513";
          if (item.type === 'cabinet') colorAdjusted = "#a0522d";
          break;
        case 'Minimalist':
          if (item.type === 'furniture') colorAdjusted = "#f5f5f5";
          if (item.type === 'cabinet') colorAdjusted = "#e0e0e0";
          break;
        case 'Boho':
          if (item.type === 'furniture') colorAdjusted = "#d4a76a";
          if (item.type === 'cabinet') colorAdjusted = "#c19a6b";
          break;
        case 'Northern Europe':
          if (item.type === 'furniture') colorAdjusted = "#d8c3a5";
          if (item.type === 'cabinet') colorAdjusted = "#e6dfd1";
          break;
        case 'Light luxury':
          if (item.type === 'furniture') {
            // Different gold tones for different furniture types
            if (roomType === 'Living room') colorAdjusted = "#d4af37"; // Classic gold
            else if (roomType === 'Master room' || roomType === 'Guest room') colorAdjusted = "#e6c200"; // Warmer gold for bedrooms
            else if (roomType === 'Restaurant') colorAdjusted = "#c5b358"; // Champagne gold for dining
            else if (roomType === 'Kitchen') colorAdjusted = "#b29600"; // Darker gold for kitchen
            else if (roomType === 'Bathroom') colorAdjusted = "#d9be6c"; // Lighter gold for bathroom
            else colorAdjusted = "#d4af37"; // Default gold
          }
          if (item.type === 'cabinet') {
            // Different white/neutral tones for cabinets
            if (roomType === 'Kitchen' || roomType === 'Bathroom') colorAdjusted = "#f8f8f8"; // Pure white for kitchen/bathroom
            else if (roomType === 'Master room' || roomType === 'Guest room') colorAdjusted = "#f0ece3"; // Warm white for bedrooms
            else colorAdjusted = "#f5f5f5"; // Default white
          }
          break;
      }
      
      return { ...item, color: colorAdjusted };
    });
  };
  
  // Get furniture based on room type and style
  const furniture = getFurniture();
  
  // Filter furniture based on element filters
  const filteredFurniture = furniture.filter(item => {
    if (item.type === 'furniture' && !showFurniture) return false;
    if (item.type === 'cabinet' && !showCabinet) return false;
    return true;
  });
  
  // Customize lighting based on style
  const getLighting = () => {
    if (style === 'Light luxury') {
      return (
        <>
          <ambientLight intensity={0.4} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={0.8}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            color="#fff6e6" // Warm light for luxury feel
          />
          {/* Add accent lights for Light Luxury style */}
          <pointLight position={[width/2 - 1, height - 0.5, length/2 - 1]} intensity={0.6} color="#ffedcc" />
          <pointLight position={[-width/2 + 1, height - 0.5, -length/2 + 1]} intensity={0.6} color="#ffedcc" />
          <spotLight
            position={[0, height - 0.5, 0]}
            angle={0.6}
            penumbra={0.5}
            intensity={0.8}
            castShadow
            color="#fff6e6"
          />
        </>
      );
    } else if (style === 'Modern') {
      return (
        <>
          <ambientLight intensity={0.6} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            color="#ffffff" // Bright white light for modern
          />
          {/* Add accent lights for Modern style */}
          <pointLight position={[width/2 - 1, height - 0.5, 0]} intensity={0.5} color="#f0f0ff" />
          <pointLight position={[-width/2 + 1, height - 0.5, 0]} intensity={0.5} color="#f0f0ff" />
          <spotLight
            position={[0, height - 0.5, 0]}
            angle={0.7}
            penumbra={0.3}
            intensity={0.7}
            castShadow
            color="#ffffff"
          />
        </>
      );
    } else if (style === 'Northern Europe') {
      return (
        <>
          <ambientLight intensity={0.7} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={0.9}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            color="#f5f9ff" // Slightly cool light for Nordic
          />
          {/* Add accent lights for Northern Europe style */}
          <pointLight position={[width/2 - 1, height - 0.5, length/2 - 1]} intensity={0.4} color="#e6f0ff" />
          <pointLight position={[-width/2 + 1, height - 0.5, -length/2 + 1]} intensity={0.4} color="#e6f0ff" />
          <spotLight
            position={[0, height - 0.5, 0]}
            angle={0.8}
            penumbra={0.4}
            intensity={0.6}
            castShadow
            color="#f0f8ff"
          />
        </>
      );
    } else if (style === 'Minimalist') {
      return (
        <>
          <ambientLight intensity={0.8} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={0.7}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
            color="#ffffff" // Clean white light
          />
          {/* Add accent lights for Minimalist style */}
          <pointLight position={[width/2 - 1, height - 0.5, 0]} intensity={0.3} color="#ffffff" />
          <pointLight position={[-width/2 + 1, height - 0.5, 0]} intensity={0.3} color="#ffffff" />
          <spotLight
            position={[0, height - 0.5, 0]}
            angle={0.9}
            penumbra={0.2}
            intensity={0.5}
            castShadow
            color="#ffffff"
          />
        </>
      );
    } else {
      // Default lighting
      return (
        <>
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[5, 5, 5]}
            intensity={1}
            castShadow
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
        </>
      );
    }
  };

  return (
    <>
      {getLighting()}
      
      <Physics>
        {/* Floor - only show if showFloor is true */}
        {showFloor && <Floor style={style} roomType={roomType} />}
        
        {/* Walls - only show if showWalls is true */}
        {showWalls && walls.map((wall, index) => (
          <Wall key={index} {...wall} />
        ))}
        
        {/* Ceiling - only show if showCeiling is true */}
        {showCeiling && <Wall {...ceiling} />}
        
        {/* Filtered Furniture */}
        {filteredFurniture.map((furniture, index) => (
          <Furniture key={index} {...furniture} style={style} roomType={roomType} />
        ))}
      </Physics>
      
      <Sky sunPosition={[100, 10, 100]} />
      <Environment preset="apartment" />
    </>
  );
};

// Main ThreeScene component
const ThreeScene = ({ roomType, style, size, viewMode, elementFilters }) => {
  const isRoamMode = viewMode === 'Roam';
  
  return (
    <div className="w-full h-full">
      <Canvas shadows>
        <PerspectiveCamera makeDefault position={[0, 1.6, 5]} fov={60} />
        <CameraControls isRoamMode={isRoamMode} />
        <RoomScene 
          roomType={roomType} 
          style={style} 
          size={size} 
          elementFilters={elementFilters} 
        />
      </Canvas>
    </div>
  );
};

export default ThreeScene;