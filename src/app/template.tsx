"use client";

import React, { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function Template({ children }: { children: React.ReactNode }) {
  const container = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    gsap.from(container.current, {
      opacity: 0,
      duration: 0.25,
      ease: "power2.out",
    });
  }, { scope: container });

  return (
    <div ref={container} style={{ width: '100%', height: '100%' }}>
      {children}
    </div>
  );
}
