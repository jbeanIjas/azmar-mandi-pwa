"use client";

import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function Template({ children }: { children: React.ReactNode }) {
  const container = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
  }, []);

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
