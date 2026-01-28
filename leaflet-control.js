// Make the function GLOBAL so inline HTML can see it
window.toggleMapsFullscreen = function () {
  const container = document.getElementById("map-container");
  
  if (!container) {
    console.error("map-container not found");
    return;
  }

  // Check if currently fullscreen
  const isEnteringFullscreen = !container.classList.contains("fullscreen");
  
  // Toggle the class
  container.classList.toggle("fullscreen");
  
  // Update UI state
  updateFullscreenButton(isEnteringFullscreen);
  
  // Handle body scroll locking
  if (isEnteringFullscreen) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }

  console.log(`Fullscreen ${isEnteringFullscreen ? 'enabled' : 'disabled'}`);

  // Resize maps with a more robust approach
  resizeMaps();
  
  // Dispatch custom event for other components to respond
  const event = new CustomEvent('mapsFullscreenChange', {
    detail: { isFullscreen: isEnteringFullscreen }
  });
  document.dispatchEvent(event);
};

function resizeMaps() {
  // Small delay to ensure CSS transition completes
  setTimeout(() => {
    const maps = [window.map1, window.map2].filter(map => map);
    
    maps.forEach(map => {
      try {
        map.invalidateSize();
        // Reset view if needed
        //map.fitBounds(map.getBounds(), { padding: [20, 20] });
      } catch (error) {
        console.warn('Error resizing map:', error);
      }
    });
    
    // If no maps found, check for any Leaflet maps on the page
    if (maps.length === 0) {
      console.warn('No window.map1 or map2 found. Looking for other maps...');
      document.querySelectorAll('.leaflet-map').forEach(container => {
        const map = container._leaflet_map;
        if (map) map.invalidateSize();
      });
    }
  }, 300);
}

function updateFullscreenButton(isFullscreen) {
  // Update button text/icons if you have a specific button
  const buttons = document.querySelectorAll('[data-toggle-fullscreen]');
  
  buttons.forEach(button => {
    if (isFullscreen) {
      button.classList.add('active');
      button.setAttribute('aria-pressed', 'true');
      button.title = 'Exit fullscreen';
    } else {
      button.classList.remove('active');
      button.setAttribute('aria-pressed', 'false');
      button.title = 'Enter fullscreen';
    }
  });
}

// Optional: Keyboard support for exiting fullscreen with Escape key
document.addEventListener('keydown', function(event) {
  const container = document.getElementById("map-container");
  
  if (container && container.classList.contains("fullscreen") && event.key === "Escape") {
    window.toggleMapsFullscreen();
  }
});

// Optional: Resize maps on window resize when in fullscreen
let resizeTimeout;
window.addEventListener('resize', function() {
  const container = document.getElementById("map-container");
  
  if (container && container.classList.contains("fullscreen")) {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(resizeMaps, 150);
  }
});

document.addEventListener('DOMContentLoaded', function() {
  console.log("JS loaded successfully!");
  
  // Check for Leaflet
  if (typeof L !== 'undefined') {
    console.log("Leaflet is available");
    
    // Initialize any fullscreen buttons
    const fullscreenButtons = document.querySelectorAll('[data-toggle-fullscreen]');
    fullscreenButtons.forEach(button => {
      button.addEventListener('click', window.toggleMapsFullscreen);
    });
  }
  
  // Check if any maps exist on load
  if (window.map1 || window.map2) {
    console.log('Maps found on window object');
  }
});
