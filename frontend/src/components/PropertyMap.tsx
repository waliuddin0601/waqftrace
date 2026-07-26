import { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import type { Property } from "../lib/types";
import { categoryMeta } from "./CategoryBadge";

const HYDERABAD_CENTER: [number, number] = [78.4867, 17.385];

export default function PropertyMap({
  properties,
  onSelect,
}: {
  properties: Property[];
  onSelect: (p: Property) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    mapRef.current = new maplibregl.Map({
      container: containerRef.current,
      style: "https://tiles.openfreemap.org/styles/liberty",
      center: HYDERABAD_CENTER,
      zoom: 10,
    });
    mapRef.current.addControl(new maplibregl.NavigationControl(), "top-right");
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const geoProps = properties.filter((p) => p.lat != null && p.lon != null);
    for (const p of geoProps) {
      const meta = categoryMeta(p.category);
      const el = document.createElement("div");
      el.style.width = "14px";
      el.style.height = "14px";
      el.style.borderRadius = "50%";
      el.style.background = meta.color;
      el.style.border = "2px solid white";
      el.style.boxShadow = "0 1px 3px rgba(0,0,0,0.4)";
      el.style.cursor = "pointer";

      const popup = new maplibregl.Popup({ offset: 12, closeButton: false }).setHTML(
        `<div style="font-size:13px;max-width:220px">
           <strong>${escapeHtml(p.name)}</strong><br/>
           <span style="color:#898781">${meta.label}${p.district ? " · " + escapeHtml(p.district) : ""}</span>
         </div>`
      );

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([p.lon as number, p.lat as number])
        .setPopup(popup)
        .addTo(map);

      el.addEventListener("click", () => onSelect(p));
      markersRef.current.push(marker);
    }
  }, [properties, onSelect]);

  return <div ref={containerRef} className="h-full w-full rounded-lg" />;
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}
