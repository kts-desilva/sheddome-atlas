import React from 'react';

const LoadingAnimation = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12 animate-fade-in">
      <div className="relative w-32 h-32 flex items-center justify-center">
        {/* Outer Orbit */}
        <div className="absolute w-full h-full border-2 border-dashed border-gray-200 rounded-full animate-[spin_10s_linear_infinite]"></div>
        
        {/* Electron 1 */}
        <div className="absolute w-full h-full animate-spin" style={{ animationDuration: '3s' }}>
           <div className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-4 bg-science-500 rounded-full shadow-lg shadow-science-200"></div>
        </div>

        {/* Electron 2 (Reverse) */}
        <div className="absolute w-20 h-20 animate-spin" style={{ animationDuration: '4s', animationDirection: 'reverse' }}>
           <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3 h-3 bg-indigo-400 rounded-full shadow-lg shadow-indigo-200"></div>
        </div>

        {/* Central Nucleus */}
        <div className="relative z-10 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-100">
             <div className="w-6 h-6 bg-gradient-to-tr from-science-500 to-indigo-600 rounded-full animate-pulse"></div>
        </div>
      </div>

      <div className="mt-8 text-center space-y-3">
        <h3 className="text-xl font-bold text-gray-800 tracking-tight">Processing Proteome</h3>
        <div className="flex flex-col items-center gap-2">
            <p className="text-sm text-gray-500 font-medium">Querying Uniprot & Identifying Domains...</p>
            {/* Progress bar */}
            <div className="w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-science-500 w-1/3 animate-[translateX_1s_ease-in-out_infinite]" style={{ width: '30%', animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite' }}></div> 
                <div className="h-full bg-gradient-to-r from-science-400 to-indigo-500 w-full animate-pulse"></div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingAnimation;