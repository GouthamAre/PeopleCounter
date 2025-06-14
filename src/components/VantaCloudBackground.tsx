import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const VantaCloudBackground = () => {
  const vantaRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);

  useEffect(() => {
    const loadVanta = async () => {
      const CLOUDS = (await import("vanta/src/vanta.clouds"))?.default;
      if (!vantaEffect && vantaRef.current) {
        const effect = CLOUDS({
          el: vantaRef.current,
          THREE,
          mouseControls: true,
          touchControls: true,
          minHeight: 200.0,
          minWidth: 200.0,
          skyColor: 0x87ceeb,
          cloudColor: 0xffffff,
          cloudShadowColor: 0xaaaaaa,
          sunColor: 0xffdd33,
          sunGlareColor: 0xffaa33,
          sunlightColor: 0xffee88,
        });
        setVantaEffect(effect);
      }
    };

    loadVanta();

    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return <div ref={vantaRef} className="w-full h-screen" />;
};

export default VantaCloudBackground;
