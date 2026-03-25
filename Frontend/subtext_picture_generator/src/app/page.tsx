"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Article } from "@/model/article";
import { toSvg } from "html-to-image";
import { prominent, average } from "color.js";
import * as he from "he";
import Controls from "@/components/homepage/Controls";
import ArticleChooser from "@/components/homepage/ArticleChooser";

export default function Home() {
  const [article, setArticle] = useState<Article | null>(null);
  const [format, setFormat] = useState("png");
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  const imageRef = useRef<HTMLDivElement>(null);

  const defaultReferenceWidth = 280;

  const [imagePreviewScale, setImagePreviewScale] = useState<number>(1);

  const [promColors, setPromColors] = useState(["#ffffff", "#000000"]);
  const [selectedBackgroundColor, setSelectedBackgroundColor] = useState(0);
  const [selectedOnBackgroundColor, setSelectedOnBackgroundColor] = useState(1);

  const [currentReferenceWidth, setCurrentReferenceWidth] =
    useState<number>(defaultReferenceWidth);

  const [titleSize, setTitleSize] = useState<number>(0.08);
  const [subTitleSize, setSubTitleSize] = useState<number>(0.031);
  const [showArticleTease, setShowArticleTease] = useState(true);
  const [imagePositionX, setImagePositionX] = useState(50);
  const [imagePositionY, setImagePositionY] = useState(50);
  const [imageZoom, setImageZoom] = useState(1);

  const imageWrapperRef = useRef<HTMLDivElement>(null);
  const dragState = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number } | null>(null);
  const pinchState = useRef<{ startDist: number; startZoom: number } | null>(null);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (e.pointerType === "touch") return; // let touch handlers deal with touch
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    dragState.current = { startX: e.clientX, startY: e.clientY, startPosX: imagePositionX, startPosY: imagePositionY };
  }, [imagePositionX, imagePositionY]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragState.current) return;
    const wrapper = imageWrapperRef.current;
    if (!wrapper) return;
    const dx = ((e.clientX - dragState.current.startX) / wrapper.offsetWidth) * -100;
    const dy = ((e.clientY - dragState.current.startY) / wrapper.offsetHeight) * -100;
    setImagePositionX(Math.min(100, Math.max(0, dragState.current.startPosX + dx)));
    setImagePositionY(Math.min(100, Math.max(0, dragState.current.startPosY + dy)));
  }, []);

  const handlePointerUp = useCallback(() => {
    dragState.current = null;
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setImageZoom((z) => Math.min(3, Math.max(1, z - e.deltaY * 0.002)));
  }, []);

  const getTouchDist = (touches: React.TouchList) => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      pinchState.current = { startDist: getTouchDist(e.touches), startZoom: imageZoom };
      dragState.current = null;
    } else if (e.touches.length === 1) {
      dragState.current = {
        startX: e.touches[0].clientX,
        startY: e.touches[0].clientY,
        startPosX: imagePositionX,
        startPosY: imagePositionY,
      };
    }
  }, [imagePositionX, imagePositionY, imageZoom]);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    const wrapper = imageWrapperRef.current;
    if (!wrapper) return;

    if (e.touches.length === 2 && pinchState.current) {
      const dist = getTouchDist(e.touches);
      const scale = dist / pinchState.current.startDist;
      setImageZoom(Math.min(3, Math.max(1, pinchState.current.startZoom * scale)));
    } else if (e.touches.length === 1 && dragState.current) {
      const dx = ((e.touches[0].clientX - dragState.current.startX) / wrapper.offsetWidth) * -100;
      const dy = ((e.touches[0].clientY - dragState.current.startY) / wrapper.offsetHeight) * -100;
      setImagePositionX(Math.min(100, Math.max(0, dragState.current.startPosX + dx)));
      setImagePositionY(Math.min(100, Math.max(0, dragState.current.startPosY + dy)));
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    dragState.current = null;
    pinchState.current = null;
  }, []);

  const downloadWaitTime = useRef(500);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--preview-on-background",
      promColors[selectedOnBackgroundColor]
    );
    document.documentElement.style.setProperty(
      "--preview-background",
      promColors[selectedBackgroundColor]
    );
  }, [promColors, selectedBackgroundColor, selectedOnBackgroundColor]);

  useEffect(() => {
    if (window.innerWidth > 768) {
      setCurrentReferenceWidth(400);
      downloadWaitTime.current = 0;
    }
  }, []);

  useEffect(() => {
    setPromColors(["#ffffff", "#000000"]);
    setSelectedBackgroundColor(0);
    setSelectedOnBackgroundColor(1);

    if (article?.picture.src) {
      prominent(article.picture.src, {
        amount: 9,
        group: 60,
        format: "hex",
      }).then((colors: any) => {
        average(article.picture.src, { format: "hex" }).then(
          (avgColor: any) => {
            setPromColors(
              ["#ffffff", "#000000", avgColor].concat(
                colors.filter((c: string) => {
                  return c !== "#ffffff" && c !== "#000000";
                })
              )
            );
          }
        );
      });
    }
  }, [article]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--image-preview-reference-width",
      currentReferenceWidth + "px"
    );
  }, [currentReferenceWidth]);

  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    try {
      const testFile = new File([], "test.png", { type: "image/png" });
      const hasShareApi = navigator.canShare?.({ files: [testFile] }) === true;
      const isMobile = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      setCanShare(hasShareApi && isMobile);
    } catch {
      setCanShare(false);
    }
  }, []);

  const generateImage = useCallback(async () => {
    if (imageRef.current == null) {
      throw new Error("imageref is null; this should not happen");
    }

    const svgDataUrl = await toSvg(imageRef.current, {
      cacheBust: true,
      quality: 1,
      canvasHeight: 1920,
      canvasWidth: 1080,
      pixelRatio: 1,
    });

    const fileName = `generated_subtext_image.${format}`;

    if (format === "svg") {
      const response = await fetch(svgDataUrl);
      const blob = await response.blob();
      return new File([blob], fileName, { type: "image/svg+xml" });
    }

    // Convert SVG to raster (PNG/JPEG) via canvas
    const img = new Image();
    img.crossOrigin = "anonymous";
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = reject;
      img.src = svgDataUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, 1080, 1920);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error("Failed to create image"))),
        `image/${format}`,
        1
      );
    });
    return new File([blob], fileName, { type: `image/${format}` });
  }, [format]);

  const withResize = useCallback(async (action: () => Promise<void>) => {
    if (imageRef.current == null) return;

    const needsResize = currentReferenceWidth < 500;
    const oldWidth = currentReferenceWidth;

    if (needsResize) {
      setCurrentReferenceWidth(500);
      await new Promise((r) => setTimeout(r, downloadWaitTime.current));
    }

    setDownloadError(null);
    try {
      await action();
    } catch (e) {
      setDownloadError(e instanceof Error ? e.message : String(e));
    } finally {
      if (needsResize) {
        setCurrentReferenceWidth(oldWidth);
      }
    }
  }, [currentReferenceWidth]);

  const handleDownload = useCallback(() => withResize(async () => {
    const file = await generateImage();
    const blobUrl = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.download = file.name;
    link.href = blobUrl;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();

    setTimeout(() => {
      document.body.removeChild(link);
      setGeneratedImageUrl(blobUrl);
    }, 500);
  }), [withResize, generateImage]);

  const handleShare = useCallback(() => withResize(async () => {
    const file = await generateImage();
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file] });
    }
  }), [withResize, generateImage]);

  return (
    <main>
      {article == null ? (
        <ArticleChooser setArticle={setArticle} />
      ) : (
        <div id="article-loaded-container">
          <div id="image-preview-container">
            <div
              id="image-preview-border"
              style={{ scale: imagePreviewScale.toString() }}
            >
              <div id="image-preview" ref={imageRef}>
                <div className="text-content-wrapper">
                  <div className="image-preview-author">
                    {article.date}{" "}
                    {he
                      .decode(article.author.replaceAll("\n", " "))
                      ?.toUpperCase()}
                  </div>
                  <div
                    className="title"
                    style={{
                      fontSize: currentReferenceWidth * titleSize,
                    }}
                  >
                    {he.decode(article.title)?.toUpperCase()}
                  </div>
                  <div
                    className="lead"
                    style={{
                      fontSize: currentReferenceWidth * subTitleSize,
                    }}
                  >
                    <p>{he.decode(article.subtitle ?? "")}</p>
                  </div>
                  <div
                    className="whole-article-tease"
                    style={{ visibility: showArticleTease ? "visible" : "hidden" }}
                  >
                    DER GANZE ARTIKEL AUF
                  </div>
                  <div className="sub-infos">
                    <div className="tags-wrapper">
                      {article.categories?.map((item, i) => (
                        <div key={"Picture-Category_" + i} className="tag">
                          {item?.toUpperCase()}
                        </div>
                      ))}
                    </div>
                    <div className="image-credits">
                      <p>
                        {he.decode(
                          article.picture?.author?.replaceAll("\n", " ") ?? ""
                        )}
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  className="image-wrapper"
                  ref={imageWrapperRef}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                  onWheel={handleWheel}
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                >
                  <img
                    src={article.picture.src}
                    alt="Headline image of the Article"
                    style={{
                      objectPosition: `${imagePositionX}% ${imagePositionY}%`,
                      transform: `scale(${imageZoom})`,
                      transformOrigin: `${imagePositionX}% ${imagePositionY}%`,
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="action-buttons">
              <button className="action-link" onClick={handleDownload}>
                DOWNLOAD
              </button>
              {canShare && (
                <button className="action-link" onClick={handleShare}>
                  SHARE
                </button>
              )}
            </div>
            {downloadError && (
              <div className="error-box" style={{ maxWidth: 320 }}>
                {downloadError}
              </div>
            )}
            {generatedImageUrl && (
              <details className="generated-image-fallback">
                <summary>Download didn&apos;t start?</summary>
                <p>Long-press the image to save it:</p>
                <img src={generatedImageUrl} alt="Generated image" />
              </details>
            )}
          </div>
          <Controls
            article={article}
            format={format}
            imagePreviewScale={imagePreviewScale}
            setArticle={setArticle}
            setFormat={setFormat}
            setImagePreviewScale={setImagePreviewScale}
            setSubTitleSize={setSubTitleSize}
            setTitleSize={setTitleSize}
            subTitleSize={subTitleSize}
            titleSize={titleSize}
            showArticleTease={showArticleTease}
            setShowArticleTease={setShowArticleTease}
            imagePositionX={imagePositionX}
            setImagePositionX={setImagePositionX}
            imagePositionY={imagePositionY}
            setImagePositionY={setImagePositionY}
            imageZoom={imageZoom}
            setImageZoom={setImageZoom}
          />
        </div>
      )}
    </main>
  );
}
