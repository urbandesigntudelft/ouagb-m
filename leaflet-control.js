<script>
/**
 * Global variables to store the Leaflet map instances
 */
var mapL = null;
var mapR = null;

/**
 * Function to find the Leaflet instances created by R/Htmlwidgets
 */
function findLeafletMaps() {
  if (typeof HTMLWidgets === 'undefined' || !HTMLWidgets.widgets) {
    console.log("Waiting for HTMLWidgets...");
    return false;
  }

  HTMLWidgets.widgets.forEach(function(widget) {
    if (widget.name === 'leaflet') {
      if (widget.id === 'mapL') mapL = widget.instance;
      if (widget.id === 'mapR') mapR = widget.instance;
    }
  });

  if (mapL && mapR) {
    console.log("Maps found and linked.");
    // Initial Sync
    setupSync();
    return true;
  }
  return false;
}

/**
 * Applies the synchronization between the two maps
 */
function setupSync() {
  if (mapL && mapR && typeof mapL.sync === 'function') {
    // Sync Map L to Map R
    mapL.sync(mapR, {offsetFn: L.Sync.offsetCentral});
    // Sync Map R to Map L
    mapR.sync(mapL, {offsetFn: L.Sync.offsetCentral});
  } else {
    console.warn("Leaflet.Sync library not found. Ensure leafsync is loaded in R.");
  }
}

/**
 * Triggered by the button in your .qmd
 */
function toggleMapsFullscreen() {
  const container = document.getElementById('map-container');
  if (!container) return;

  if (!document.fullscreenElement) {
    container.requestFullscreen().catch(err => {
      alert(`Error attempting to enable full-screen mode: ${err.message}`);
    });
  } else {
    document.exitFullscreen();
  }
}

/**
 * The "Magic Fix": Forces maps to redraw when the screen size changes
 */
document.addEventListener('fullscreenchange', function() {
  if (!mapL || !mapR) findLeafletMaps();

  if (mapL && mapR) {
    // We wait a moment for the browser animation to finish
    setTimeout(() => {
      // 1. Tell Leaflet the container size has changed
      mapL.invalidateSize({animate: true});
      mapR.invalidateSize({animate: true});

      // 2. Re-apply sync to ensure alignment
      setupSync();
      
      console.log("Maps resized and re-synced.");
    }, 400); 
  }
});

/**
 * Run on page load
 */
window.addEventListener('load', function() {
  // Try to find maps every 500ms until they are found (up to 5 seconds)
  let attempts = 0;
  const interval = setInterval(() => {
    const found = findLeafletMaps();
    attempts++;
    if (found || attempts > 10) clearInterval(interval);
  }, 500);
});
</script>