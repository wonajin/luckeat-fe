import React from 'react'

function MapController({ onZoomIn, onZoomOut }) {
  return (
    <div className="absolute right-4 top-1/3 -translate-y-1/2 flex flex-col gap-2 z-10">
      <button
        className="w-10 h-10 bg-white rounded-lg shadow flex items-center justify-center text-xl font-bold"
        onClick={onZoomIn}
      >
        +
      </button>
      <button
        className="w-10 h-10 bg-white rounded-lg shadow flex items-center justify-center text-xl font-bold"
        onClick={onZoomOut}
      >
        -
      </button>
    </div>
  )
}

export default MapController
