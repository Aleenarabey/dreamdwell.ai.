import React, { useState, useRef } from 'react';

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
 * DirectRenderingUploader - A component for direct 3D rendering of interior designs
 * without the template selection sidebar.
 */
const DirectRenderingUploader = ({ onTemplateSelect }) => {
    // State for room configuration
    const [roomSize, setRoomSize] = useState('105'); // Default size in m²
    const [roomStyle, setRoomStyle] = useState('Modern'); // Default style
    const [roomType, setRoomType] = useState('Living room'); // Default room type
    const [activeRoom, setActiveRoom] = useState('Living room'); // Currently active room view
    
    // State for view mode (2D/3D/Roam)
    const [viewMode, setViewMode] = useState('3D');
    
    // State for element filtering
    const [elementFilters, setElementFilters] = useState({
        all: true,
        ceiling: false,
        wall: false,
        floor: false,
        furniture: false,
        cabinet: false
    });
    
    // Available room styles
    const styles = ['Modern', 'Rustic', 'Minimalist', 'Boho', 'Northern Europe', 'Light luxury'];
    
    // Available room types
    const roomTypes = [
        { id: 'living', name: 'Living room' },
        { id: 'restaurant', name: 'Restaurant' },
        { id: 'master', name: 'Master room' },
        { id: 'guest', name: 'Guest room' },
        { id: 'tatami', name: 'Tatami room' },
        { id: 'bathroom', name: 'Bathroom' },
        { id: 'kitchen', name: 'Kitchen' },
        { id: 'study', name: 'Study room' },
        { id: 'hallway', name: 'Hallway' }
    ];
    
    // Room views for the selected room type
    const roomViews = [
        { id: 'main', name: 'Living room', color: '93c5fd' },
        { id: 'dining', name: 'Restaurant', color: 'f87171' },
        { id: 'master', name: 'Master room', color: 'f472b6' },
        { id: 'guest', name: 'Guest room', color: '6366f1' },
        { id: 'study', name: 'Study', color: '10b981' }
    ];
    
    // Function to toggle element filters
    const toggleFilter = (filter) => {
        if (filter === 'all') {
            // If 'all' is clicked, turn off all other filters
            setElementFilters({
                all: true,
                ceiling: false,
                wall: false,
                floor: false,
                furniture: false,
                cabinet: false
            });
        } else {
            // If any other filter is clicked, turn off 'all'
            setElementFilters({
                ...elementFilters,
                all: false,
                [filter]: !elementFilters[filter]
            });
        }
    };
    
    // Import ThreeScene component
    const ThreeScene = React.lazy(() => import('./ThreeScene'));
    
    return (
        <div className="min-h-screen bg-gray-50 font-['Inter'] flex flex-col relative">
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
                        -ms-overflow-style: none;  /* IE and Edge */
                        scrollbar-width: none;  /* Firefox */
                    }
                `}
            </style>

            {/* Top Header Bar */}
            <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold">Home decoration</h2>
                    <p className="text-sm text-gray-300">Public</p>
                </div>
                
                {/* View Mode Toggle */}
                <div className="flex space-x-2">
                    <button 
                        className={`px-4 py-1 rounded ${viewMode === '2D' ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-200'}`}
                        onClick={() => setViewMode('2D')}
                    >
                        2D
                    </button>
                    <button 
                        className={`px-4 py-1 rounded ${viewMode === '3D' ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-200'}`}
                        onClick={() => setViewMode('3D')}
                    >
                        3D
                    </button>
                    <button 
                        className={`px-4 py-1 rounded ${viewMode === 'Roam' ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-200'}`}
                        onClick={() => setViewMode('Roam')}
                    >
                        Roam
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex flex-grow">
                {/* Left Configuration Panel */}
                <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
                    <h3 className="font-semibold mb-4">Room Configuration</h3>
                    
                    {/* Room Type Selection */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Room Type</label>
                        <select
                            value={roomType}
                            onChange={(e) => setRoomType(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {roomTypes.map(type => (
                                <option key={type.id} value={type.name}>{type.name}</option>
                            ))}
                        </select>
                    </div>
                    
                    {/* Room Style Selection */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Style</label>
                        <select
                            value={roomStyle}
                            onChange={(e) => setRoomStyle(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            {styles.map(style => (
                                <option key={style} value={style}>{style}</option>
                            ))}
                        </select>
                    </div>
                    
                    {/* Room Size Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Size (m²)</label>
                        <input
                            type="number"
                            value={roomSize}
                            onChange={(e) => setRoomSize(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                            min="10"
                            max="300"
                        />
                    </div>
                    
                    {/* Element Filtering */}
                    <div className="mt-6">
                        <h3 className="font-semibold mb-2">Element Filters</h3>
                        <div className="space-y-2">
                            <label className="flex items-center space-x-2">
                                <input 
                                    type="checkbox" 
                                    checked={elementFilters.all} 
                                    onChange={() => toggleFilter('all')}
                                    className="form-checkbox h-4 w-4 text-blue-500"
                                />
                                <span className="text-sm">All</span>
                            </label>
                            
                            <label className="flex items-center space-x-2">
                                <input 
                                    type="checkbox" 
                                    checked={elementFilters.ceiling} 
                                    onChange={() => toggleFilter('ceiling')}
                                    className="form-checkbox h-4 w-4 text-blue-500"
                                />
                                <span className="text-sm">Ceiling</span>
                            </label>
                            
                            <label className="flex items-center space-x-2">
                                <input 
                                    type="checkbox" 
                                    checked={elementFilters.wall} 
                                    onChange={() => toggleFilter('wall')}
                                    className="form-checkbox h-4 w-4 text-blue-500"
                                />
                                <span className="text-sm">Wall</span>
                            </label>
                            
                            <label className="flex items-center space-x-2">
                                <input 
                                    type="checkbox" 
                                    checked={elementFilters.floor} 
                                    onChange={() => toggleFilter('floor')}
                                    className="form-checkbox h-4 w-4 text-blue-500"
                                />
                                <span className="text-sm">Floor</span>
                            </label>
                            
                            <label className="flex items-center space-x-2">
                                <input 
                                    type="checkbox" 
                                    checked={elementFilters.furniture} 
                                    onChange={() => toggleFilter('furniture')}
                                    className="form-checkbox h-4 w-4 text-blue-500"
                                />
                                <span className="text-sm">Finished furniture</span>
                            </label>
                            
                            <label className="flex items-center space-x-2">
                                <input 
                                    type="checkbox" 
                                    checked={elementFilters.cabinet} 
                                    onChange={() => toggleFilter('cabinet')}
                                    className="form-checkbox h-4 w-4 text-blue-500"
                                />
                                <span className="text-sm">Custom cabinet</span>
                            </label>
                        </div>
                    </div>
                    
                    {/* Apply Button */}
                    <button className="mt-auto w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                        Apply Changes
                    </button>
                </div>

                {/* Right Rendering Area */}
                <div className="flex-grow p-4 bg-gray-100">
                    {/* 3D Rendering Area */}
                    <div className="relative bg-white rounded-2xl shadow-2xl overflow-hidden h-[calc(100vh-8rem)] mb-4">
                        {viewMode === '3D' || viewMode === 'Roam' ? (
                            <React.Suspense fallback={
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <p className="text-gray-500 text-xl">Loading 3D view...</p>
                                </div>
                            }>
                                <ThreeScene 
                                    roomType={roomType}
                                    style={roomStyle}
                                    size={roomSize}
                                    viewMode={viewMode}
                                    elementFilters={elementFilters}
                                />
                            </React.Suspense>
                        ) : (
                            <div className="flex items-center justify-center h-full">
                                <p className="text-gray-500 text-xl">2D view is currently in development</p>
                            </div>
                        )}
                        
                        {/* Overlay details at bottom-right */}
                        <div className="absolute bottom-4 right-4 text-right text-white text-shadow-md p-2 rounded-lg bg-black/30">
                            <p className="text-sm font-light">{roomSize}m²</p>
                            <p className="text-xs font-light opacity-80">{roomStyle} | {roomType}</p>
                        </div>
                    </div>
                    
                    {/* Room View Thumbnails */}
                    <div className="flex overflow-x-auto space-x-2 p-2 bg-white rounded-xl">
                        {roomViews.map((view) => (
                            <div 
                                key={view.id}
                                className={`flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden relative cursor-pointer ${
                                    activeRoom === view.name ? 'border-2 border-blue-500' : ''
                                }`}
                                onClick={() => setActiveRoom(view.name)}
                            >
                                <img 
                                    src={`https://placehold.co/300x200/${view.color}/FFFFFF?text=${view.name.replace(/ /g, '+')}`} 
                                    alt={view.name} 
                                    className="w-full h-full object-cover" 
                                />
                                <div className={`absolute bottom-0 left-0 right-0 py-1 px-2 text-xs font-medium text-white text-center ${
                                    activeRoom === view.name ? 'bg-blue-600' : 'bg-black/50'
                                }`}>
                                    {view.name}
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    {/* Action Bar */}
                    <div className="flex justify-between items-center mt-4 text-sm">
                        <button className="text-indigo-600 hover:text-indigo-800 font-medium">Open scheme</button>
                        <div className="text-gray-500">105m² | Used 10001 Time</div>
                        <button className="text-indigo-600 hover:text-indigo-800 font-medium">More actions</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DirectRenderingUploader;