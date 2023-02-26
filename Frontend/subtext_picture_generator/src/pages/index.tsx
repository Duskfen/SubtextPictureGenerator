import Head from 'next/head'
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Article } from 'subtextPictureGenerator/model/article';
import { Picture } from 'subtextPictureGenerator/model/picture';
import { toPng, toSvg, toJpeg } from 'html-to-image';
import ReactSlider from "react-slider";

import * as he from 'he';

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

export default function Home() {
  const [article, setArticle] = useState<Article | null>(null);
  const [format, setFormat] = useState("png")
  const inputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const defaultReferenceWidth = 300;

  const [maxWidth, setMaxWidth] = useState<number>(defaultReferenceWidth);

  const [imagePreviewScale, setImagePreviewScale] = useState<number>(1);

  const [currentReferenceWidth, setCurrentReferenceWidth] = useStateCallback<number>(defaultReferenceWidth);
  // function currentReferenceWidth(): number {
  //   return defaultReferenceWidth;// * imagePreviewScale;
  // }
  const [titleSize, setTitleSize] = useState<number>(0.06);

  let downloadWaitTime = 1500;

  useEffect(() => {
    setMaxWidth(window.innerWidth);
    console.log(window.innerWidth);
    if(window.innerWidth > 1000){
      setCurrentReferenceWidth(500)
      downloadWaitTime = 0;
    }
  }, [])

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
      <main onResize={(e) => console.log(e.target) }>
        {article == null ?
          <div>
            <h1>GENERATE SUBTEXT PICTURE</h1>
            <div className='input-wrapper-article-url'>
              {/* <p>Article URL:</p> */}
              <input ref={inputRef} placeholder="https://www.subtext.at/year/month/article/"></input>
            </div>
            <button onClick={async () => {
              let endpoint: string | undefined = process.env.NEXT_PUBLIC_BACKEND_URL
              if (endpoint == undefined) {
                console.error("Endpoint not specified. Specify Environent Variable");
                return;
              }
              endpoint += "?url=" + inputRef.current?.value;
              let json = await (await fetch(endpoint)).json()
              setArticle(new Article(json.title, json.categories, json.author, json.date, new Picture(json.picture.author, json.picture.link)))

            }}>GENERATE</button>
          </div> :
          <>
            <div id="article-loaded-container">
              <div id="image-preview-container" >
                <div id="image-preview-border" style={{ scale: imagePreviewScale.toString() }}>
                  <div id='image-preview' ref={imageRef}>
                    <div id="image-preview-heading">
                      <img src={"/img/subtext-logo.png"}></img>
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
                      <img src={"/img/arrows.png"}></img>
                    </div>
                    <div id="image-preview-title" style={{ fontSize: currentReferenceWidth * titleSize }}>
                      <p>{he.decode(article.title)?.toUpperCase()}</p>
                    </div>
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
                  setCurrentReferenceWidth(500, () => {
                    setTimeout(() => { //terrible solution, but have to wait that css var gets applied
                      if (format == "png") {
                        toPng(imageRef.current!, { cacheBust: true, quality: 1, canvasHeight: 1600, canvasWidth: 900 })
                          .then((dataUrl) => {
                            const link = document.createElement('a')
                            link.download = 'generated_subtext_image'
                            link.href = dataUrl
                            link.click()
                          })
                          .catch((err) => {
                            console.log(err)
                          })
                      }
                      else if (format == "jpeg") {
                        toJpeg(imageRef.current!, { cacheBust: true, quality: 1, canvasHeight: 1600, canvasWidth: 900 })
                          .then((dataUrl) => {
                            const link = document.createElement('a')
                            link.download = 'generated_subtext_image.jpeg'
                            link.href = dataUrl
                            link.click()
                          })
                          .catch((err) => {
                            console.log(err)
                          })
                      }
                      else if (format == "svg") {
                        toSvg(imageRef.current!, { cacheBust: true, quality: 1, canvasHeight: 1600, canvasWidth: 900 })
                          .then((dataUrl) => {
                            const link = document.createElement('a')
                            link.download = 'generated_subtext_image'
                            link.href = dataUrl
                            link.click()
                          })
                          .catch((err) => {
                            console.log(err)
                          })
                      }
                      setCurrentReferenceWidth(oldReferencewWidth);
                    }, downloadWaitTime)
                  })

                }} style={{ marginBottom: 10 }}>DOWNLOAD</button>
              </div>
              <div id="controls">
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
                        max={1} //TODO TEST THIS
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
                            // defaultValue={1}F
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
              </div>
            </div>
          </>
        }
      </main>
    </>
  )
}
