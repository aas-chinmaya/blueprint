'use client';

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';

export default function Spinner() {
  const barsRef = useRef([]);

  useEffect(() => {
    barsRef.current.forEach((bar, i) => {
      gsap.to(bar, {
        opacity: 0.25,
        repeat: -1,
        yoyo: true,
        duration: 1,
        ease: 'power1.inOut',
        delay: i * 0.08,
      });
    });
  }, []);

  return (
    <div style={styles.loader}>
      {Array.from({ length: 12 }).map((_, i) => (
        <div
          key={i}
          ref={(el) => (barsRef.current[i] = el)}
          style={{
            ...styles.bar,
            transform: `rotate(${i * 30}deg) translate(0, -130%)`,
          }}
        />
      ))}
    </div>
  );
}

const styles = {
  loader: {
    position: 'relative',
    width: '54px',
    height: '54px',
    borderRadius: '10px',
    margin: 'auto',
  },
  bar: {
    width: '8%',
    height: '24%',
    background: 'gray',
    position: 'absolute',
    left: '50%',
    top: '30%',
    opacity: 0.5,
    borderRadius: '50px',
    boxShadow: '0 0 3px rgba(0,0,0,0.2)',
  },
};
