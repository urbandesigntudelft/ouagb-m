function toggleDualFullscreen() {
  const map1 = document.getElementById("map1");
  const map2 = document.getElementById("map2");

  if (!map1 || !map2) return;

  let wrapper = document.getElementById("dual-map-wrapper");

  if (!wrapper) {
    wrapper = document.createElement("div");
    wrapper.id = "dual-map-wrapper";
    wrapper.className = "fullscreen-dual";

    map1.parentNode.insertBefore(wrapper, map1);
    wrapper.appendChild(map1);
    wrapper.appendChild(map2);

    window.dispatchEvent(new Event("resize"));
  } else {
    const parent = document.body;
    parent.appendChild(map1);
    parent.appendChild(map2);
    wrapper.remove();

    window.dispatchEvent(new Event("resize"));
  }
}

function syncMaps() {
  const m1 = HTMLWidgets.find("#map1").getMap();
  const m2 = HTMLWidgets.find("#map2").getMap();

  m1.on("move", () => {
    m2.setView(m1.getCenter(), m1.getZoom(), { animate: false });
  });
}

document.addEventListener("DOMContentLoaded", syncMaps);
