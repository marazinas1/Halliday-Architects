import { useEffect, useRef } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

/** Studio location — 728 West Avenue, Ocean City, NJ 08226. */
const CENTER: [number, number] = [-74.5747193, 39.2813037];

/**
 * Muted CARTO Positron basemap. No API key, no Google Maps.
 * Single-finger drag is disabled on touch (cooperativeGestures) so a swipe
 * scrolls the page rather than panning the map.
 */
const ContactMap = () => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const map = new maplibregl.Map({
      container: ref.current,
      style: {
        version: 8,
        sources: {
          carto: {
            type: "raster",
            tiles: [
              "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
              "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
              "https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
            ],
            tileSize: 256,
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          },
        },
        layers: [{ id: "carto", type: "raster", source: "carto" }],
      },
      center: CENTER,
      zoom: 15,
      attributionControl: { compact: true },
      scrollZoom: false,
      cooperativeGestures: true,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "bottom-right");

    const el = document.createElement("div");
    el.style.width = "12px";
    el.style.height = "12px";
    el.style.borderRadius = "9999px";
    el.style.backgroundColor = "hsl(2 82% 36%)";
    el.setAttribute("aria-label", "Halliday Architects studio");
    new maplibregl.Marker({ element: el }).setLngLat(CENTER).addTo(map);

    return () => map.remove();
  }, []);

  return (
    <div
      ref={ref}
      className="w-full h-[340px] md:h-[460px] bg-sand"
      style={{ filter: "grayscale(70%) contrast(0.95)" }}
      aria-label="Map showing the Halliday Architects studio in Ocean City, New Jersey"
      role="img"
    />
  );
};

export default ContactMap;
