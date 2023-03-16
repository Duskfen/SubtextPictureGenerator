import Head from 'next/head'
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Article } from 'subtextPictureGenerator/model/article';
import { Picture } from 'subtextPictureGenerator/model/picture';
import { fetchStates } from 'subtextPictureGenerator/model/fetchStates';

import { toPng, toSvg, toJpeg } from 'html-to-image';
import ReactSlider from "react-slider";
import { prominent, average } from 'color.js'

import * as he from 'he';
import SubtextLogo from 'subtextPictureGenerator/components/SubtextLogo';
import Arrows from 'subtextPictureGenerator/components/Arrows';
import Switch from 'rc-switch';


export default function Home() {
  const [article, setArticle] = useState<Article | null>(null);
  const [format, setFormat] = useState("png")
  const [fetchState, setFetchState] = useState(fetchStates.Idle);

  const inputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const defaultReferenceWidth = 300;

  const [maxWidth, setMaxWidth] = useState<number>(defaultReferenceWidth);

  const [imagePreviewScale, setImagePreviewScale] = useState<number>(1);

  const [promColors, setPromColors] = useState(["#ffffff", "#000000"]);
  const [selectedBackgroundColor, setSelectedBackgroundColor] = useState(0);
  const [selectedOnBackgroundColor, setSelectedOnBackgroundColor] = useState(1);

  const [currentReferenceWidth, setCurrentReferenceWidth] = useStateCallback<number>(defaultReferenceWidth);
  // function currentReferenceWidth(): number {
  //   return defaultReferenceWidth;// * imagePreviewScale;
  // }
  const [titleSize, setTitleSize] = useState<number>(0.06);
  const [subTitleSize, setSubTitleSize] = useState<number>(0.032);
  const [isSubTitleEnabled, setIsSubTitleEnabled] = useState<boolean>(true);

  let downloadWaitTime = 500;

  useEffect(() => {
    document.documentElement.style.setProperty('--preview-on-background', promColors[selectedOnBackgroundColor]);
    document.documentElement.style.setProperty('--preview-background', promColors[selectedBackgroundColor]);
  }, [selectedBackgroundColor, selectedOnBackgroundColor])

  useEffect(() => {
    setMaxWidth(window.innerWidth);
    console.log(window.innerWidth);
    if (window.innerWidth > 1000) {
      setCurrentReferenceWidth(500)
      downloadWaitTime = 0;
    }


  }, [])

  useEffect(() => {
    setPromColors(["#ffffff", "#000000"]);
    setSelectedBackgroundColor(0);
    setSelectedOnBackgroundColor(1);

    if (article?.picture.src) {
      prominent(article.picture.src, { amount: 9, group: 60, format: 'hex' }).then((colors: any) => {
        average(article.picture.src, { format: 'hex' }).then((avgColor: any) => {
          setPromColors(["#ffffff", "#000000", avgColor].concat(colors.filter((c: string) => { return ((c != "#ffffff") && (c != "#000000")) })));

        })
      })
    }
  }, [article])

  useEffect(() => {
    document.documentElement.style.setProperty('--image-preview-reference-width', currentReferenceWidth + "px");
  }, [currentReferenceWidth])

  return (
    <>
      <Head>
        <title>Subtext Picture Generator</title>
        <meta name="description" content="Renders a image based on a Subtext article link, to fasten the process of creating a standardized social media appearance" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>
      <main onResize={(e) => console.log(e.target)}>
        {article == null ?
          <div>
            <h1>GENERATE SUBTEXT PICTURE</h1>
            <div className='input-wrapper-article-url'>
              {/* <p>Article URL:</p> */}
              <input ref={inputRef} placeholder="https://www.subtext.at/year/month/article/"></input>
            </div>
            {fetchState == fetchStates.Fetching ?
              <button>READING DATA...</button>
              :
              <>
                <button onClick={async () => {
                  setFetchState(fetchStates.Fetching);
                  let endpoint: string | undefined = process.env.NEXT_PUBLIC_BACKEND_URL
                  if (endpoint == undefined) {
                    setFetchState(fetchStates.Error);
                    console.error("Endpoint not specified. Specify Environent Variable");
                    return;
                  }
                  try {
                    endpoint += "?url=" + inputRef.current?.value;
                    let json = await (await fetch(endpoint)).json()
                    setArticle(new Article(json.title, json.categories, json.author, json.date, new Picture(json.picture.author, json.picture.link), json.subtitle))
                    setFetchState(fetchStates.Idle)
                  } catch (error) {
                    console.error(error);
                    setFetchState(fetchStates.Error)
                  }

                }}>GENERATE</button>
                {fetchState == fetchStates.Error ?
                  <div className='box' style={{ textAlign: "center", backgroundColor: "#e74c3c" }}>There was an Error</div> : null
                }
              </>
            }

          </div> :
          <>
            <div id="article-loaded-container">
              <div id="image-preview-container" >
                <div id="image-preview-border" style={{ scale: imagePreviewScale.toString() }}>
                  <div id='image-preview' ref={imageRef}>
                    <div id="image-preview-heading">
                      {/* <img src={"/img/subtext-logo.svg"}></img> */}
                      <SubtextLogo></SubtextLogo>
                      <div id="image-preview-heading-seperator"></div>
                    </div>
                    <img src={article.picture.src} alt={"FirstImage"} />
                    <div id="image-preview-sub-picture">
                      <div id="image-preview-sub-picture-categories-wrapper">
                        {article.categories?.map((item, i) => {
                          return <div key={"Picture-Category_" + i} className='image-preview-sub-picture-categories'>
                            {item?.toUpperCase()}
                          </div>
                        })}
                      </div>
                      <div id="image-preview-sub-picture-credits">
                        {article.picture?.author}
                      </div>
                    </div>
                    <div id="image-preview-link-arrow">
                      <Arrows></Arrows>
                    </div>
                    <div id="image-preview-title" style={{ fontSize: currentReferenceWidth * titleSize }}>
                      <p>{he.decode(article.title)?.toUpperCase()}</p>
                    </div>
                    {isSubTitleEnabled ?

                      <div id="image-preview-subtitle" style={{ fontSize: currentReferenceWidth * subTitleSize }}>
                        <p>{he.decode(article.subtitle??"")}</p>
                      </div> : null
                    }
                    <div id='image-preview-footer'>
                      <p>{article.date} / {article.author?.toUpperCase()}</p>
                    </div>
                  </div>
                </div>
                <button onClick={async () => {
                  if (imageRef.current == null) {
                    console.error("imageref is null; this should not happen");
                    return;
                  }
                  let oldReferencewWidth = currentReferenceWidth;
                  if (currentReferenceWidth < 500) {

                    setCurrentReferenceWidth(500, () => {
                      setTimeout(() => { //terrible solution, but have to wait that css var gets applied
                        downloadPicture();
                        setCurrentReferenceWidth(oldReferencewWidth);
                      }, downloadWaitTime)
                    })
                  }
                  else {
                    downloadPicture();
                  }

                }} style={{ marginBottom: 10 }}>DOWNLOAD</button>
              </div>
              <div id="controls">
                <button onClick={() => setArticle(null)}>back</button>

                <div className="box">
                  <p className='controls-box-headline'>General</p>
                  <div>
                    <div className='input-wrapper'>
                      <p>Preview-Scale: </p>
                      <ReactSlider
                        className="customSlider"
                        thumbClassName="customSlider-thumb"
                        trackClassName="customSlider-track"
                        min={0.5}
                        max={1}
                        step={0.005}
                        value={imagePreviewScale}
                        onChange={(newscale) => {
                          setImagePreviewScale(newscale)
                        }}
                      />
                    </div>
                    <div className='input-wrapper'>
                      <p>Download-Format: </p>
                      <div id='options-formats-wrapper'>
                        <div>
                          <input type="radio" id="options-radio-format-png" checked={format == "png"} onClick={() => setFormat("png")} />
                          <label htmlFor="options-radio-format-png">PNG</label>
                        </div>
                        <div>
                          <input type="radio" id="options-radio-format-jpeg" checked={format == "jpeg"} onClick={() => setFormat("jpeg")} />
                          <label htmlFor="options-radio-format-jpeg">JPEG</label>
                        </div>
                        <div>
                          <input type="radio" id="options-radio-format-svg" checked={format == "svg"} onClick={() => setFormat("svg")} />
                          <label htmlFor="options-radio-format-svg">SVG</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="box">
                  <p className='controls-box-headline'>Title</p>
                  <div>
                    <div className='input-wrapper'>
                      <p>Size: </p>
                      <div>
                        <div>
                          <ReactSlider
                            className="customSlider"
                            thumbClassName="customSlider-thumb"
                            trackClassName="customSlider-track"
                            min={0.02}
                            max={0.11}
                            step={0.0001}
                            value={titleSize}
                            onChange={(newscale) => {
                              setTitleSize(newscale)
                            }}
                          />
                        </div>
                        <div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="box">
                  <p className='controls-box-headline'>Sub-Title</p>
                  <div>
                    <div className='input-wrapper'>
                      <p>Enabled: </p>
                      <div>
                        <div>
                          <Switch
                          disabled={article.subtitle === null}
                            checked={isSubTitleEnabled}
                            onChange={setIsSubTitleEnabled} />
                        </div>
                        <div>
                        </div>
                      </div>
                    </div>
                    <div className='input-wrapper'>
                      <p>Size: </p>
                      <div>
                        <div>
                          <ReactSlider
                          disabled={article.subtitle === null}
                            className="customSlider"
                            thumbClassName="customSlider-thumb"
                            trackClassName="customSlider-track"
                            min={0.02}
                            max={0.05}
                            step={0.0001}
                            value={subTitleSize}
                            onChange={(newscale) => {
                              setSubTitleSize(newscale)
                            }}
                          />
                        </div>
                        <div>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
                {/* UNCOMMENT IF YOU WANT TO use custom generated colors. (is commented because it is out of customer scope) */}
                {/* <div className="box">
                  <p className='controls-box-headline'>Colors</p>
                  <div>
                    <div className='input-wrapper'>
                      <p>Accent: </p>
                      <div className='controls-colors-row'>
                        {promColors.map((color, i) => {
                          return (
                            <div key={'controls-accent-color-key' + i} className={i == selectedBackgroundColor ? "controls-colors-row-active" : ""} style={{ backgroundColor: color }} onClick={() => {
                              setSelectedBackgroundColor(i);
                            }}></div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className='input-wrapper'>
                      <p>Text: </p>
                      <div className='controls-colors-row'>
                        {promColors.map((color, i) => {
                          return (
                            <div key={'controls-on-accent-color-key' + i} className={i == selectedOnBackgroundColor ? "controls-colors-row-active" : ""} style={{ backgroundColor: color}} onClick={() => {
                              setSelectedOnBackgroundColor(i);
                            }}></div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div> */}
              </div>
            </div>
          </>
        }
      </main>
    </>
  )

  function downloadPicture() {
    if (format == "png") {
      toPng(imageRef.current!, { cacheBust: true, quality: 1, canvasHeight: 1920, canvasWidth: 1080 })
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = 'generated_subtext_image';
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.log(err);
        });
    }
    else if (format == "jpeg") {
      toJpeg(imageRef.current!, { cacheBust: true, quality: 1, canvasHeight: 1920, canvasWidth: 1080 })
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = 'generated_subtext_image.jpeg';
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.log(err);
        });
    }
    else if (format == "svg") {
      toSvg(imageRef.current!, { cacheBust: true, quality: 1, canvasHeight: 1920, canvasWidth: 1080 })
        .then((dataUrl) => {
          const link = document.createElement('a');
          link.download = 'generated_subtext_image';
          link.href = dataUrl;
          link.click();
        })
        .catch((err) => {
          console.log(err);
        });
    }
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