"use client";

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Maximize2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'loose',
  fontFamily: 'inherit',
});

if (typeof document !== 'undefined') {
  const styles = document.querySelectorAll('style');
  styles.forEach(style => {
    if (style.innerHTML.includes('.mermaid-error-container') || style.innerHTML.includes('[id^="d-mermaid"]')) {
      style.remove();
    }
  });

  const safeStyle = document.createElement('style');
  safeStyle.innerHTML = `
    svg[aria-roledescription="error"] { 
      display: none !important; 
    }
    .mermaid-svg {
      width: 100% !important;
      height: auto !important;
    }
  `;
  document.head.appendChild(safeStyle);
}

interface MermaidProps {
  chart: string;
  onHide?: () => void;
}

const Mermaid: React.FC<MermaidProps> = ({ chart, onHide }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [svgContent, setSvgContent] = useState<string>('');

  useEffect(() => {
    let isMounted = true;

    const preprocessChart = (code: string) => {
      if (!code) return "";

      let processed = code.trim();

      return processed;
    };

    const renderChart = async () => {
      if (!chart) return;

      const cleanChart = preprocessChart(chart);

      try {
        if (ref.current) {
          ref.current.innerHTML = '<div class="flex items-center justify-center p-8 text-neutral-400 font-medium">Generowanie diagramu...</div>';
        }

        const elementId = 'm' + Math.random().toString(36).substring(2, 9);
        const { svg } = await mermaid.render(elementId, cleanChart);

        if (isMounted) {
          setSvgContent(svg);
          if (ref.current) {
            ref.current.innerHTML = svg;
          }

          if (svg.includes('aria-roledescription="error"') || svg.includes('Syntax error')) {
            if (onHide) onHide();
          }
        }
      } catch (error) {
        console.error("Mermaid Render Error:", error);
        if (isMounted && onHide) {
          onHide();
        }
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [chart, onHide]);

  return (
    <>
      <div className="group relative w-full overflow-x-auto bg-neutral-900 p-4 rounded-xl border border-neutral-800 shadow-brutal min-h-[200px]">
        <div ref={ref} className="w-full flex justify-center" />

        {svgContent && (
          <Button
            variant="neo"
            size="sm"
            onClick={() => setIsZoomed(true)}
            className="absolute right-4 top-4 h-10 w-10 p-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white border-2 border-black text-black hidden md:flex items-center justify-center shadow-[2px_2px_0px_0px_black]"
          >
            <Maximize2 className="h-5 w-5" />
          </Button>
        )}
      </div>

      {isZoomed && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md">
          <div className="relative w-full max-w-7xl max-h-[90vh] overflow-auto bg-white border-4 border-black p-4 shadow-[16px_16px_0px_0px_#000]">
            <Button
              variant="neo"
              onClick={() => setIsZoomed(false)}
              className="fixed top-8 right-8 h-12 w-12 border-4 border-black bg-white hover:bg-red-400 text-black z-[110]"
            >
              <X className="h-6 w-6" />
            </Button>

            <div
              className="w-full h-full flex items-center justify-center p-8 bg-white"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default Mermaid;
