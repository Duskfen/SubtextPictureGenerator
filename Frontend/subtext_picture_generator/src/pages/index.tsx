import Head from 'next/head'
import React, { useRef, useState } from 'react';
import { Article } from 'subtextPictureGenerator/model/article';
import { Picture } from 'subtextPictureGenerator/model/picture';
import { toPng, toSvg } from 'html-to-image';

export default function Home() {
  const [article, setArticle] = useState<Article | null>(null);
  const [format, setFormat] = useState("png")
  const inputRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <Head>
        <title>Subtext Picture Generator</title>
        <meta name="description" content="Renders a image based on a Subtext article link, to fasten the process of creating a standardized social media auftritt appearance" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>
      <main>
        {article == null ?
          <div>
            <h1>GENERATE SUBTEXT SOCIAL MEDIA PICTURE</h1>
            <div className='url-input-wrapper'>
              <p>Article URL:</p>
              <input ref={inputRef}></input>
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
          <div id="article-loaded-container">
            <div id="controls">
              <p>Some Controls SAMPLE</p>
            </div>
            <div id="image-preview-container">
              <div id="image-preview-border">
                <div id='image-preview' ref={imageRef}>
                  <img src={article.picture.src} alt={"FirstImage"} />
                  <p>{article.picture.author}</p>
                  <p>{article.title?.toUpperCase()}</p>
                  <p>{article.author}</p>
                  <p>{article.date}</p>
                  <p>{article.categories}</p>
                </div>
              </div>
              <button onClick={async () => {
                if (imageRef.current == null) {
                  console.error("imageref is null; this should not happen");
                  return;
                }
                if(format == "png"){
                  toPng(imageRef.current, { cacheBust: true, quality:1, canvasHeight: 1600, canvasWidth:900 })
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
        }
      </main>
    </>
  )
}
