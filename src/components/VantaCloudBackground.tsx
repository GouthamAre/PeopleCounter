// src/components/VantaCloudBackground.tsx
import { useEffect, useRef, useState } from "react";
import CLOUDS from "vanta/dist/vanta.clouds.min";
import * as THREE from "three";

const VantaCloudBackground = () => {
  const vantaRef = useRef(null);
  const [vantaEffect, setVantaEffect] = useState<any>(null);

  useEffect(() => {
    if (!vantaEffect) {
      setVantaEffect(
        CLOUDS({
          el: vantaRef.current,
          THREE,
          mouseControls: true,
          touchControls: true,
          minHeight: 200.0,
          minWidth: 200.0,
          skyColor: 0xcceeff,
          cloudColor: 0xffffff,
          cloudShadowColor: 0x999999,
          sunColor: 0xffddcc,
          sunGlareColor: 0xffaa33,
          sunlightColor: 0xffee88,
          speed: 1.0,
        })
      );
    }
    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, [vantaEffect]);

  return <div ref={vantaRef} className="absolute inset-0 -z-10" />;
};

export default VantaCloudBackground;
