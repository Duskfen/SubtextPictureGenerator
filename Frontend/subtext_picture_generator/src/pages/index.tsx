import Head from "next/head";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Article } from "subtextPictureGenerator/model/article";

import { toPng, toSvg, toJpeg } from "html-to-image";
import { prominent, average } from "color.js";

import * as he from "he";
import Controls from "subtextPictureGenerator/components/homepage/Controls";
import ArticleChooser from "subtextPictureGenerator/components/homepage/ArticleChooser";

export default function Home() {
  const [article, setArticle] = useState<Article | null>(null);
  const [format, setFormat] = useState("png");

  const imageRef = useRef<HTMLDivElement>(null);

  const defaultReferenceWidth = 300;

  const [imagePreviewScale, setImagePreviewScale] = useState<number>(1);

  const [promColors, setPromColors] = useState(["#ffffff", "#000000"]);
  const [selectedBackgroundColor, setSelectedBackgroundColor] = useState(0);
  const [selectedOnBackgroundColor, setSelectedOnBackgroundColor] = useState(1);

  const [currentReferenceWidth, setCurrentReferenceWidth] =
    useStateCallback<number>(defaultReferenceWidth);

  const [titleSize, setTitleSize] = useState<number>(0.06);
  const [subTitleSize, setSubTitleSize] = useState<number>(0.03);

  let downloadWaitTime = 500;

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--preview-on-background",
      promColors[selectedOnBackgroundColor]
    );
    document.documentElement.style.setProperty(
      "--preview-background",
      promColors[selectedBackgroundColor]
    );
  }, [selectedBackgroundColor, selectedOnBackgroundColor]);

  useEffect(() => {
    if (window.innerWidth > 1000) {
      setCurrentReferenceWidth(500);
      downloadWaitTime = 0;
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
                  return c != "#ffffff" && c != "#000000";
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

  return (
    <>
      <Head>
        <title>Subtext Picture Generator</title>
        <meta
          name="description"
          content="Renders a image based on a Subtext article link, to fasten the process of creating a standardized social media appearance"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      <main>
        {article == null ? (
          <ArticleChooser setArticle={setArticle} />
        ) : (
          <>
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
                        {article.author.replaceAll("\n", " ")?.toUpperCase()}
                      </div>
                      <div
                        className="title"
                        style={{ fontSize: currentReferenceWidth * titleSize }}
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
                      <div className="whole-article-tease">
                        DER GANZE ARTIKEL AUF
                      </div>
                      <div className="sub-infos">
                        <div className="tags-wrapper">
                          {article.categories?.map((item, i) => {
                            return (
                              <div
                                key={"Picture-Category_" + i}
                                className="tag"
                              >
                                {item?.toUpperCase()}
                              </div>
                            );
                          })}
                        </div>
                        <div className="image-credits">
                          {article.picture?.author?.replaceAll("\n", " ")}
                        </div>
                      </div>
                    </div>
                    <div className="image-wrapper">
                      <img
                        src={article.picture.src}
                        alt={"Headline image of the Article"}
                      />
                    </div>
                  </div>
                </div>
                <button
                  onClick={async () => {
                    if (imageRef.current == null) {
                      console.error("imageref is null; this should not happen");
                      return;
                    }
                    let oldReferencewWidth = currentReferenceWidth;
                    if (currentReferenceWidth < 500) {
                      setCurrentReferenceWidth(500, () => {
                        setTimeout(() => {
                          //terrible solution, but have to wait that css var gets applied
                          downloadPicture();
                          setCurrentReferenceWidth(oldReferencewWidth);
                        }, downloadWaitTime);
                      });
                    } else {
                      downloadPicture();
                    }
                  }}
                  style={{ marginBottom: 10 }}
                >
                  DOWNLOAD
                </button>
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
              />
            </div>
          </>
        )}
      </main>
    </>
  );

  async function downloadPicture() {
    let dataurl: string = "";
    if (format == "png") {
      dataurl = await toPng(imageRef.current!, {
        cacheBust: true,
        quality: 1,
        canvasHeight: 1920,
        canvasWidth: 1080,
      });
    } else if (format == "jpeg") {
      dataurl = await toJpeg(imageRef.current!, {
        cacheBust: true,
        quality: 1,
        canvasHeight: 1920,
        canvasWidth: 1080,
      });
    } else if (format == "svg") {
      dataurl = await toSvg(imageRef.current!, {
        cacheBust: true,
        quality: 1,
        canvasHeight: 1920,
        canvasWidth: 1080,
      });
    }

    const link = document.createElement("a");
    link.download = `generated_subtext_image.${format}`;
    link.href = dataurl;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

function useStateCallback<T>(
  initialState: T
): [T, (state: T, cb?: (state: T) => void) => void] {
  const [state, setState] = useState(initialState);
  const cbRef = useRef<((state: T) => void) | undefined>(undefined); // init mutable ref container for callbacks

  const setStateCallback = useCallback((state: T, cb?: (state: T) => void) => {
    cbRef.current = cb; // store current, passed callback in ref
    setState(state);
  }, []); // keep object reference stable, exactly like `useState`

  useEffect(() => {
    // cb.current is `undefined` on initial render,
    // so we only invoke callback on state *updates*
    if (cbRef.current) {
      cbRef.current(state);
      cbRef.current = undefined; // reset callback after execution
    }
  }, [state]);

  return [state, setStateCallback];
}
