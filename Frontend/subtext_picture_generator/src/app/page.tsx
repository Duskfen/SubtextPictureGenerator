"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Article } from "@/model/article";
import html2canvas from "html2canvas";
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

  const downloadPicture = useCallback(async () => {
    if (imageRef.current == null) {
      console.error("imageref is null; this should not happen");
      return;
    }

    const fileName = `generated_subtext_image.${format}`;
    let blob: Blob;

    if (format === "svg") {
      const dataurl = await toSvg(imageRef.current, {
        cacheBust: true,
        quality: 1,
        canvasHeight: 1920,
        canvasWidth: 1080,
        pixelRatio: 1,
      });
      const response = await fetch(dataurl);
      blob = await response.blob();
    } else {
      const canvas = await html2canvas(imageRef.current, {
        width: imageRef.current.offsetWidth,
        height: imageRef.current.offsetHeight,
        scale: 1080 / imageRef.current.offsetWidth,
        useCORS: true,
        allowTaint: true,
      });
      blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
          (b) => (b ? resolve(b) : reject(new Error("Failed to create image"))),
          `image/${format}`,
          1
        );
      });
    }

    const mimeType = format === "svg" ? "image/svg+xml" : `image/${format}`;
    const file = new File([blob], fileName, { type: mimeType });

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file] });
    } else {
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = fileName;
      link.href = blobUrl;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();

      // If download didn't trigger (mobile Firefox etc.), show image inline
      setTimeout(() => {
        document.body.removeChild(link);
        setGeneratedImageUrl(blobUrl);
      }, 500);
    }
  }, [format]);

  const handleDownload = useCallback(async () => {
    if (imageRef.current == null) return;

    const needsResize = currentReferenceWidth < 500;
    const oldWidth = currentReferenceWidth;

    if (needsResize) {
      setCurrentReferenceWidth(500);
      await new Promise((r) => setTimeout(r, downloadWaitTime.current));
    }

    setDownloadError(null);
    try {
      await downloadPicture();
    } catch (e) {
      setDownloadError(e instanceof Error ? e.message : String(e));
    } finally {
      if (needsResize) {
        setCurrentReferenceWidth(oldWidth);
      }
    }
  }, [currentReferenceWidth, downloadPicture]);

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
                <div className="image-wrapper">
                  <img
                    src={article.picture.src}
                    alt="Headline image of the Article"
                  />
                </div>
              </div>
            </div>
            <button className="btn btn-download" onClick={handleDownload}>
              DOWNLOAD
            </button>
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
          />
        </div>
      )}
    </main>
  );
}
