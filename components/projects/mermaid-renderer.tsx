"use client";

import React, { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { Maximize2, X, ZoomIn, ZoomOut, RotateCcw } from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
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
    .mermaid-zoomed-container svg {
      max-width: none !important;
      width: auto !important;
      height: auto !important;
    }
  `;
  document.head.appendChild(safeStyle);
}

import { logger } from "@/lib/logger";

interface MermaidProps {

  chart: string;
  onHide?: () => void;
}

const Mermaid: React.FC<MermaidProps> = ({ chart, onHide }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [isZoomed, setIsZoomed] = useState(false);
  const [svgContent, setSvgContent] = useState<string>('');

  const [currentChart, setCurrentChart] = useState(chart);

  useEffect(() => {
    setCurrentChart(chart);
  }, [chart]);

  useEffect(() => {
    let isMounted = true;

    const preprocessChart = (code: string) => {
      if (!code) return "";
      let processed = code.trim();
      return processed;
    };

    const handleRenderError = async (errorMessage?: string) => {
      if (!isMounted) return;
      logger.error("MermaidRenderer", "Render error, hiding diagram", errorMessage);
      if (onHide) onHide();
    };

    const renderChart = async () => {
      if (!currentChart) return;

      const cleanChart = preprocessChart(currentChart);

      try {
        if (ref.current) {
          ref.current.innerHTML = '<div class="flex items-center justify-center p-8 text-neutral-400 font-medium">Generowanie diagramu...</div>';
        }

        logger.info("MermaidRenderer", "Rendering chart", { chart: cleanChart });

        const elementId = 'm' + Math.random().toString(36).substring(2, 9);

        const { svg } = await mermaid.render(elementId, cleanChart);

        if (isMounted) {
          setSvgContent(svg);
          if (ref.current) {
            ref.current.innerHTML = svg;
          }

          if (svg.includes('aria-roledescription="error"') || svg.includes('Syntax error')) {
            logger.error("MermaidRenderer", "SVG contains errors after render");
            await handleRenderError("SVG contains Syntax error or aria-roledescription='error'");
          } else {
            logger.info("MermaidRenderer", "Render successful");
          }
        }
      } catch (error: any) {
        logger.error("MermaidRenderer", "Mermaid Render Exception", error);
        await handleRenderError(error?.message || String(error));
      }
    };

    renderChart();

    return () => {
      isMounted = false;
    };
  }, [currentChart, onHide]);

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
          <div className="relative w-full max-w-7xl h-[80vh] bg-white border-4 border-black shadow-[16px_16px_0px_0px_#000] overflow-hidden">
            <Button
              variant="neo"
              onClick={() => setIsZoomed(false)}
              className="absolute top-4 right-4 h-12 w-12 border-4 border-black bg-white hover:bg-red-400 text-black z-[110]"
            >
              <X className="h-6 w-6" />
            </Button>

            <TransformWrapper
              initialScale={1}
              minScale={0.1}
              maxScale={10}
              centerOnInit={true}
              limitToBounds={false}
              wheel={{ step: 0.05 }}
              zoomAnimation={{ disabled: true }}
              velocityAnimation={{ disabled: true }}
              smooth={false}
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                  <div className="absolute top-4 left-4 z-[110] flex flex-col gap-2">
                    <Button
                      variant="neo"
                      size="sm"
                      onClick={() => zoomIn()}
                      className="h-10 w-10 p-0 border-2 border-black bg-white hover:bg-neutral-100 !text-black"
                      title="Zoom In"
                    >
                      <ZoomIn className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="neo"
                      size="sm"
                      onClick={() => zoomOut()}
                      className="h-10 w-10 p-0 border-2 border-black bg-white hover:bg-neutral-100 !text-black"
                      title="Zoom Out"
                    >
                      <ZoomOut className="h-5 w-5" />
                    </Button>
                    <Button
                      variant="neo"
                      size="sm"
                      onClick={() => resetTransform()}
                      className="h-10 w-10 p-0 border-2 border-black bg-white hover:bg-neutral-100 !text-black"
                      title="Reset View"
                    >
                      <RotateCcw className="h-5 w-5" />
                    </Button>
                  </div>

                  <TransformComponent
                    wrapperStyle={{ width: "100%", height: "100%" }}
                    contentStyle={{ width: "100%", height: "100%" }}
                    wrapperClass="!w-full !h-full bg-white"
                    contentClass="!w-full !h-full flex items-center justify-center"
                  >
                    <div
                      className="mermaid-zoomed-container flex items-center justify-center cursor-grab active:cursor-grabbing"
                      style={{ padding: '100px', minWidth: '100%', minHeight: '100%' }}
                      dangerouslySetInnerHTML={{ __html: svgContent }}
                    />
                  </TransformComponent>
                </>
              )}
            </TransformWrapper>
          </div>
        </div>
      )}
    </>
  );
};

export default Mermaid;
