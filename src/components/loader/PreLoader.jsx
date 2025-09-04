
'use client';
import { useEffect, useState } from 'react';

export default function Preloader() {
  const [animateOut, setAnimateOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimateOut(true);
    }, 5000); // 2x animation cycle (2s each)

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-white transition-all duration-1000 ${animateOut ? 'clip-hide' : ''}`}>
      <h1 className="preload-text">Blueprint</h1>
      <style jsx>{`
        .preload-text {
          font-size: 60px;
          font-weight: bold;
          font-family: system-ui, sans-serif;
          text-transform: uppercase;
          color: transparent;
          -webkit-text-stroke: 1px #2563eb;
          --g: conic-gradient(#2563eb 0 0) no-repeat text;
          background: var(--g) 0, var(--g) 100%, var(--g) 0 0, var(--g) 0 100%;
          background-clip: text;
          -webkit-background-clip: text;
          animation: l5 2s linear infinite;
        }

        @keyframes l5 {
          0%,100% {background-size: 0 100%, 0 100%, 100% 0, 100% 0;}
          50%     {background-size: 55% 100%, 55% 100%, 100% 0, 100% 0;}
          50.01%  {background-size: 0 100%, 0 100%, 100% 55%, 100% 55%;}
        }

        .clip-hide {
          clip-path: inset(0 50% 0 50%);
          opacity: 0;
        }

        .fixed {
          display: flex;
          align-items: center;
          justify-content: center;
        }
      `}</style>
    </div>
  );
}

