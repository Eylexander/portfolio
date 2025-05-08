"use client";

import React, { useEffect, useState } from "react";
import AnimatedCursor from "react-animated-cursor";

const DeviceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const detectDevice = () => {
      setIsMobile(/Mobi|Android/i.test(navigator.userAgent));
    };

    detectDevice();
    window.addEventListener("resize", detectDevice);

    return () => {
      window.removeEventListener("resize", detectDevice);
    };
  }, []);

  return (
    <>
      {!isMobile && (
        <AnimatedCursor
          color="253,251,212"
          innerSize={8}
          innerScale={1}
          innerStyle={{
            backgroundColor: "rgb(253,251,212)",
            mixBlendMode: "difference",
          }}
          outerSize={35}
          outerScale={2}
          outerAlpha={0}
          outerStyle={{
            border: "3px solid rgb(253,251,212)",
            mixBlendMode: "difference",
          }}
          showSystemCursor={false}
        />
      )}
      {children}
    </>
  );
};

export default DeviceProvider;
