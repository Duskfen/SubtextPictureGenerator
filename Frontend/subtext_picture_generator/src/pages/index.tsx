import Head from 'next/head'
import React, { useRef, useState } from 'react';
import { Article } from 'subtextPictureGenerator/model/article';
import { Picture } from 'subtextPictureGenerator/model/picture';
import { toPng, toSvg } from 'html-to-image';
import ReactSlider from "react-slider";

import "./../styles/slider.css"

import * as he from 'he';

export default function Home() {
  const [article, setArticle] = useState<Article | null>(null);
  const [format, setFormat] = useState("png")
  const inputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  const [imagePreviewScale, setImagePreviewScale] = useState<number>(1);
  return (
    <>
      <Head>
        <title>Subtext Picture Generator</title>
        <meta name="description" content="Renders a image based on a Subtext article link, to fasten the process of creating a standardized social media appearance" />
        <meta name="viewport" content="width=1024" />
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>
      <main>
        {article == null ?
          <div>
            <h1>GENERATE SUBTEXT PICTURE</h1>
            <div className='input-wrapper'>
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
              <div id="controls">
                <p>Some Controls SAMPLE</p>

                <div className='input-wrapper'>
                  <p>Preview-Scale (0,3 - 1):</p>
                  <ReactSlider
      className="customSlider"
      thumbClassName="customSlider-thumb"
      trackClassName="customSlider-track"
      markClassName="customSlider-mark"
      marks={0.1}
      min={0.3}
      max={1}
      // defaultValue={1}
      value={imagePreviewScale}
      onChange={(newscale) => {
        if(newscale && newscale >= 0.3 && newscale <= 1){
          setImagePreviewScale(newscale)
        }
      }}
      renderMark={(props) => {
         if (props.key! < imagePreviewScale) {
           props.className = "customSlider-mark customSlider-mark-before";
         } else if (props.key === imagePreviewScale) {
           props.className = "customSlider-mark customSlider-mark-active";
         }
         return <span {...props} />;
      }}
    />

                  {/* <input placeholder={imagePreviewScale.toString()} max={1} min={0.3} step={0.1} type={'number'} onChange={(e) => {
                    let newscale = parseFloat(e.target.value)
                    console.log(newscale)
                    if(newscale && newscale >= 0.3 && newscale <= 1){
                      setImagePreviewScale(newscale)
                    }
                  }}></input> */}
                </div>
              </div>
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
                    <div id="image-preview-title">
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
                  if (format == "png") {
                    toPng(imageRef.current, { cacheBust: true, quality: 1, canvasHeight: 1600, canvasWidth: 900 })
                      .then((dataUrl) => {
                        const link = document.createElement('a')
                        link.download = 'generated_subtext_image.png'
                        link.href = dataUrl
                        link.click()
                      })
                      .catch((err) => {
                        console.log(err)
                      })
                  }
                }}>DOWNLOAD</button>
              </div>
            </div>
          </>
        }
      </main>
    </>
  )
}
