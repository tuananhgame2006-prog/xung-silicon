import createGlobe from "cobe";
import { useEffect, useRef } from "react";

export const GlobeComponent = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let phi = 0;
    
    if (!canvasRef.current) return;
    
    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 1000,
      height: 1000,
      phi: 0,
      theta: 0.3,
      dark: 0, // 0 means Light theme (white globe)
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [0.95, 0.95, 0.95],
      markerColor: [0.02, 0.71, 0.83], // Cyan (Tailwind cyan-500)
      glowColor: [1, 1, 1],
      markers: [
        { location: [14.0583, 108.2772], size: 0.1 }, // Vietnam
        { location: [37.7749, -122.4194], size: 0.05 }, // SF / Silicon Valley
        { location: [25.0330, 121.5654], size: 0.07 }, // Taiwan / Semiconductor hub
      ],
      // @ts-ignore
      onRender: (state: Record<string, any>) => {
        state.phi = phi;
        phi += 0.003;
      }
    });
    
    return () => globe.destroy();
  }, []);

  return (
    <div className="absolute inset-0 z-0 flex items-center justify-center opacity-70 pointer-events-none mix-blend-multiply">
      <canvas
        ref={canvasRef}
        style={{
          width: 800,
          height: 800,
          maxWidth: "100%",
          aspectRatio: "1/1",
        }}
      />
    </div>
  );
};
