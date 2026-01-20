// Make the function GLOBAL so inline HTML can see it
window.toggleMapsFullscreen = function () {
  const container = document.getElementById("map-container");

  if (!container) {
    console.error("map-container not found");
    return;
  }

  container.classList.toggle("fullscreen");

  console.log("fullscreen toggled");

  // Resize Leaflet maps after layout change
  setTimeout(() => {
    if (window.map1) window.map1.invalidateSize();
    if (window.map2) window.map2.invalidateSize();
  }, 300);
};

console.log("maps.js is loaded");
