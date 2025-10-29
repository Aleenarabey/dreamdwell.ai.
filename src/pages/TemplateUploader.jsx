import React, { useState, useMemo, useCallback } from 'react';

// --- ENHANCED MOCK DATA WITH DETAILED TEMPLATE INFORMATION ---
const roomCategories = [
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
        id: 'northern_europe', 
        name: 'Northern Europe', 
        count: 4, 
        color: 'f3f4f6', // gray-100
        style: 'Northern Europe',
        size: '126m²',
        configuration: '2 bedrooms, 1 bathroom',
        building: 'Nordic Residence',
        rooms: [
            { name: 'Living room', placeholderColor: 'f3f4f6', text: 'Living room' },
            { name: 'Restaurant', placeholderColor: 'f3f4f6', text: 'Restaurant' },
            { name: 'Master room', placeholderColor: 'f3f4f6', text: 'Master room' },
            { name: 'Guest room', placeholderColor: 'f3f4f6', text: 'Guest room' },
        ]
    },
    { 
        id: 'modern', 
        name: 'Modern', 
        count: 6, 
        color: 'f5f5f5', // neutral-100
        style: 'Modern',
        size: '105m²',
        configuration: '2 bedrooms, 2 bathrooms',
        building: 'Contemporary Loft',
        rooms: [
            { name: 'Living room', placeholderColor: 'f5f5f5', text: 'Living room' },
            { name: 'Restaurant', placeholderColor: 'f5f5f5', text: 'Restaurant' },
            { name: 'Master room', placeholderColor: 'f5f5f5', text: 'Master room' },
            { name: 'Guest room', placeholderColor: 'f5f5f5', text: 'Guest room' },
        ]
    },
    { 
        id: 'minimalist', 
        name: 'Minimalist', 
        count: 3, 
        color: 'fafafa', // neutral-50
        style: 'Minimalist',
        size: '95m²',
        configuration: '1 bedroom, 1 bathroom',
        building: 'Urban Studio',
        rooms: [
            { name: 'Living room', placeholderColor: 'fafafa', text: 'Living room' },
            { name: 'Restaurant', placeholderColor: 'fafafa', text: 'Restaurant' },
            { name: 'Master room', placeholderColor: 'fafafa', text: 'Master room' },
            { name: 'Guest room', placeholderColor: 'fafafa', text: 'Guest room' },
        ]
    },
];

// Helper Icon components (using inline SVG for robustness)
const SearchIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
    </svg>
);

const FilterIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
    </svg>
);

const XIcon = (props) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

/**
 * Full-screen modal to display a large version of an image.
 */
const LightboxModal = ({ src, alt, onClose }) => {
    // Prevent scrolling when modal is open
    React.useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 backdrop-blur-sm transition-opacity duration-300"
            onClick={onClose} // Close on backdrop click
        >
            <div 
                className="relative w-11/12 max-w-5xl max-h-5/6 rounded-xl overflow-hidden shadow-2xl"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking the image container
            >
                <img
                    src={src}
                    alt={alt}
                    className="w-full h-full object-contain"
                />
            </div>
            
            {/* Close Button */}
            <button 
                onClick={onClose}
                className="absolute top-4 right-4 p-3 rounded-full bg-white/10 text-white hover:bg-white/30 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Close image viewer"
            >
                <XIcon className="h-6 w-6" />
            </button>
        </div>
    );
};

/**
 * Renders a compact list item for the template sidebar with enhanced information.
 * Styled to match the design in the screenshot.
 */
const TemplateListItem = ({ category, onSelect, isSelected }) => {
    // Use specific images for each template type to match the screenshot
    let templateImageSrc;
    if (category.id === 'light_luxury') {
        templateImageSrc = "https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80";
    } else if (category.id === 'northern_europe') {
        templateImageSrc = "https://images.unsplash.com/photo-1616627561950-9f746e330187?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80";
    } else if (category.id === 'modern') {
        templateImageSrc = "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80";
    } else {
        templateImageSrc = "https://images.unsplash.com/photo-1616137422495-1e9e46e2aa77?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80";
    }
    
    return (
        <div
            className={`
                h-24 mb-4 rounded-md shadow-md overflow-hidden cursor-pointer relative transition-all duration-200
                ${isSelected ? 'ring-2 ring-blue-500' : 'hover:shadow-lg'}
            `}
            onClick={() => onSelect(category.id)}
        >
            {/* Template Image */}
            <img
                src={templateImageSrc}
                alt={`${category.name} template preview`}
                className="w-full h-full object-cover"
                onError={(e) => e.target.src = `https://placehold.co/400x300/a8b5c9/FFFFFF?text=${category.name.replace(/ /g, '+')}`}
            />
            
            {/* Text Overlay with style and size */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent/20 flex flex-col justify-end p-1">
                <div className="bg-black/40 rounded p-1">
                    <p className="text-white text-xs font-semibold leading-tight">
                        {category.style} | {category.size}
                    </p>
                </div>
            </div>
        </div>
    );
};

/**
 * Renders a small, interactive thumbnail for a sub-room.
 * Sized to match the design in the screenshot.
 */
const RoomThumbnail = ({ room, isSelected, onClick, onTemplateSelect, selectedCategory }) => (
    <button
        onClick={() => {
            onClick(room.name);
            // Notify parent component of selection to clear any drawings
            if (onTemplateSelect) {
                onTemplateSelect(selectedCategory);
            }
        }}
        className={`
            flex-shrink-0 w-24 h-16 rounded-md overflow-hidden relative transition-all duration-200 
            ${isSelected 
                ? 'ring-2 ring-blue-500 shadow-md' 
                : 'hover:ring-1 hover:ring-blue-300'}
        `}
    >
        {/* Sub-room Image Placeholder */}
        <img
            src={`https://placehold.co/300x200/${room.placeholderColor}/FFFFFF?text=${room.text.replace(/ /g, '+')}`}
            alt={`${room.name} preview`}
            className="w-full h-full object-cover"
        />
        {/* Text Overlay */}
        <div 
            className={`
                absolute bottom-0 left-0 right-0 py-1 px-1 text-xs font-medium text-white text-center 
                ${isSelected ? 'bg-blue-500' : 'bg-black/50'}
            `}
        >
            {room.name}
        </div>
    </button>
);


/**
 * Renders the main, detailed preview area with a large image and room thumbnails.
 * Styled to match the design in the screenshot.
 */
const DetailPreview = ({ selectedCategory, onTemplateSelect, viewMode = '2D' }) => {
    // State to handle which sub-room tab is active
    const [activeRoom, setActiveRoom] = useState('Living room');
    
    // --- MODAL STATE ---
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalImageSrc, setModalImageSrc] = useState('');
    const [modalImageAlt, setModalImageAlt] = useState('');

    const category = useMemo(() => {
        return roomCategories.find(c => c.id === selectedCategory);
    }, [selectedCategory]);

    // Effect to reset active room when a new category is selected
    React.useEffect(() => {
        if (category && category.rooms.length > 0) {
            setActiveRoom('Living room'); 
        } else {
            setActiveRoom('');
        }
    }, [category]); 

    // Find the currently active room data
    const activeRoomData = useMemo(() => {
        if (!category) return null;
        return category.rooms.find(room => room.name === activeRoom) || category.rooms[0];
    }, [category, activeRoom]);

    // Function to handle modal opening (for the main image)
    const openModal = useCallback((src, alt) => {
        setModalImageSrc(src);
        setModalImageAlt(alt);
        setIsModalOpen(true);
    }, []);

    const closeModal = useCallback(() => {
        setIsModalOpen(false);
        setModalImageSrc('');
        setModalImageAlt('');
    }, []);

    if (!category) {
        return (
            <div className="flex items-center justify-center h-full bg-white rounded-2xl shadow-xl">
                <p className="text-gray-500 text-xl">Select a template pack from the left to view details.</p>
            </div>
        );
    }
    
    if (!activeRoomData) {
        return (
             <div className="flex items-center justify-center h-full bg-white rounded-2xl shadow-xl">
                 <p className="text-gray-500 text-xl">No specific rooms found for this template. Check room data definition.</p>
             </div>
           );
    }
    
    // Use a real interior design image for the main display
    // For the demo, we'll use a placeholder that looks more like the screenshot
    const mainImageSrc = "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80";
    const mainImageAlt = `${category.name} - ${activeRoomData.name}`;

    return (
        <div className="h-full flex flex-col bg-white rounded-lg shadow-md overflow-hidden">
            {/* Main Image Area */}
            <div 
                className="relative flex-grow bg-white overflow-hidden cursor-pointer"
                onClick={() => openModal(mainImageSrc, mainImageAlt)}
            >
                <img
                    src={mainImageSrc}
                    alt={mainImageAlt}
                    className="w-full h-full object-cover"
                    onError={(e) => e.target.src = `https://placehold.co/1200x800/f5f5f5/333333?text=Modern+Interior`}
                />
                
                {/* Size and Usage Info Overlay */}
                <div className="absolute bottom-4 right-4 text-right text-white text-shadow-md">
                    <p className="text-sm font-light">{category.size}</p>
                    <p className="text-xs font-light">Used 10001 Time</p>
                </div>
            </div>
            
            {/* Room Navigation Thumbnails */}
            <div className="flex overflow-x-auto space-x-2 p-2 bg-white border-t border-gray-200">
                {category.rooms.map((room) => {
                    // Use room-specific images that match the screenshot style
                    let roomImageSrc;
                    if (room.name === 'Living room') {
                        roomImageSrc = "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
                    } else if (room.name === 'Restaurant') {
                        roomImageSrc = "https://images.unsplash.com/photo-1594077135872-f2db2c1afc60?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
                    } else if (room.name === 'Master room') {
                        roomImageSrc = "https://images.unsplash.com/photo-1616593969747-4797dc75033e?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
                    } else if (room.name === 'Guest room') {
                        roomImageSrc = "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
                    } else {
                        roomImageSrc = "https://images.unsplash.com/photo-1616137422495-1e9e46e2aa77?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80";
                    }
                    
                    const roomImageAlt = `${category.name} - ${room.name}`;

                    return (
                        <div
                            key={room.name}
                            className={`relative flex-shrink-0 w-[110px] h-[50px] rounded overflow-hidden shadow-sm cursor-pointer 
                                ${activeRoom === room.name ? 'ring-2 ring-blue-500' : ''}`}
                            onClick={() => {
                                setActiveRoom(room.name);
                                if (onTemplateSelect) {
                                    onTemplateSelect(selectedCategory);
                                }
                            }}
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

            {/* Action Bar */}
            <div className="flex justify-between items-center p-3 text-sm">
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                    Open scheme
                </button>
                <button className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                    More actions
                </button>
            </div>
            
            {/* Modal Rendering */}
            {isModalOpen && (
                <LightboxModal 
                    src={modalImageSrc} 
                    alt={modalImageAlt} 
                    onClose={closeModal} 
                />
            )}
        </div>
    );
};


const TemplateUploader = ({ onTemplateSelect, selectedTemplate }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStyle, setSelectedStyle] = useState('style'); // Mock style filter
    const [selectedSpace, setSelectedSpace] = useState('space'); // Mock space filter
    const [viewMode, setViewMode] = useState('2D'); // View mode state (2D/3D/Roam)
    
    // Initialize selectedCategory to the first item's ID ('kitchen') for immediate preview on load.
    const initialCategory = roomCategories.length > 0 ? roomCategories[0].id : null;
    const [selectedCategory, setSelectedCategory] = useState(selectedTemplate || initialCategory); // Currently selected room pack

    // Filter categories based on search term
    const filteredCategories = useMemo(() => {
        if (!searchTerm) return roomCategories;
        const lowerCaseSearch = searchTerm.toLowerCase();
        return roomCategories.filter(cat =>
            cat.name.toLowerCase().includes(lowerCaseSearch)
        );
    }, [searchTerm]);

    const styles = ['Light luxury', 'Northern Europe', 'Modern', 'Minimalist'];

    return (
        <div className="min-h-screen bg-gray-50 font-['Inter'] flex relative">
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
                    .font-inter { font-family: 'Inter', sans-serif; }
                    /* Custom style for image overlay text */
                    .text-shadow-md {
                        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
                    }
                    /* Hide scrollbar for consistency while still allowing scroll */
                    .overflow-x-auto::-webkit-scrollbar {
                        display: none;
                    }
                    .overflow-x-auto {
                        -ms-overflow-style: none;  /* IE and Edge */
                        scrollbar-width: none;  /* Firefox */
                    }
                `}
            </style>

            {/* LEFT SIDEBAR - Template List */}
            <div 
                className="border-r border-gray-200 bg-white flex flex-col h-screen overflow-hidden flex-shrink-0 w-64"
            >
                
                {/* Top Header Section */}
                <header className="p-3 border-b border-gray-200 flex-shrink-0 relative">
                    {/* Tab Navigation */}
                    <div className="flex justify-start space-x-4 mb-3">
                        <span className="font-bold text-blue-500 border-b-2 border-blue-500 pb-1">Home decoration</span>
                        <span className="font-medium text-gray-500 hover:text-gray-700 cursor-pointer">Public</span>
                    </div>
                    
                    {/* Search Textbox */}
                    <div className="relative flex-grow mb-3">
                        <input
                            type="text"
                            placeholder="Enter content pls"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-1 focus:ring-blue-500 focus:border-blue-500 transition duration-150 text-sm"
                        />
                        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>

                    {/* Style Space Button/Selector (Filters) */}
                    <div className="flex space-x-2 items-center">
                        <div className="flex items-center">
                            <FilterIcon className="h-4 w-4 text-gray-500" />
                        </div>
                        
                        {/* Style Dropdown */}
                        <div className="relative">
                            <select
                                value={selectedStyle}
                                onChange={(e) => setSelectedStyle(e.target.value)}
                                className="appearance-none bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-lg border-none focus:ring-1 focus:ring-blue-500 cursor-pointer hover:bg-gray-200 transition-colors"
                            >
                                <option value="style">style</option>
                                {styles.map(style => (
                                    <option key={style} value={style.toLowerCase()}>{style}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Space Dropdown */}
                        <div className="relative">
                            <select
                                value={selectedSpace}
                                onChange={(e) => setSelectedSpace(e.target.value)}
                                className="appearance-none bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-lg border-none focus:ring-1 focus:ring-blue-500 cursor-pointer hover:bg-gray-200 transition-colors"
                            >
                                <option value="space">Space</option>
                                <option value="small">Small</option>
                                <option value="large">Large</option>
                            </select>
                        </div>
                    </div>
                </header>

                {/* List of Templates */}
                <div className="p-3 overflow-y-auto flex-grow">
                    {filteredCategories.length > 0 ? (
                        <div className="flex flex-col">
                            {filteredCategories.map(category => (
                                <TemplateListItem
                                    key={category.id}
                                    category={category}
                                    onSelect={(id) => {
                                        setSelectedCategory(id);
                                        // Pass the selected template ID to the parent component
                                        // This will trigger the template to be displayed on the grid canvas
                                        if (onTemplateSelect) {
                                            onTemplateSelect(id);
                                        }
                                    }}
                                    isSelected={selectedCategory === category.id}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center p-4 text-gray-500 text-sm">
                            No packs found.
                        </div>
                    )}
                </div>
            </div>

            {/* RIGHT PANEL - Detail Preview */}
            <div className="flex-1 p-4">
                <DetailPreview 
                    selectedCategory={selectedCategory} 
                    onTemplateSelect={onTemplateSelect}
                    viewMode={viewMode}
                />
            </div>
        </div>
    );
};

export default TemplateUploader;
