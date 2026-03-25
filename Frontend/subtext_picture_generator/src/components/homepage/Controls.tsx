"use client";

import React from "react";
import Switch from "rc-switch";
import ReactSlider from "react-slider";
import { Article } from "@/model/article";

type Props = {
  article: Article | null;
  setArticle: (article: Article | null) => void;
  imagePreviewScale: number;
  setImagePreviewScale: (newscale: number) => void;
  format: string;
  setFormat: (newstring: string) => void;
  titleSize: number;
  setTitleSize: (newNumber: number) => void;
  subTitleSize: number;
  setSubTitleSize: (newNumber: number) => void;
  showArticleTease: boolean;
  setShowArticleTease: (show: boolean) => void;
  imagePositionX: number;
  setImagePositionX: (val: number) => void;
  imagePositionY: number;
  setImagePositionY: (val: number) => void;
};

function Controls({
  setArticle,
  article,
  format,
  setFormat,
  titleSize,
  setTitleSize,
  subTitleSize,
  setSubTitleSize,
  showArticleTease,
  setShowArticleTease,
  imagePositionX,
  setImagePositionX,
  imagePositionY,
  setImagePositionY,
}: Readonly<Props>) {
  return (
    <div id="controls">
      <div className="controls-header">
        <button className="action-link action-link-dark" onClick={() => setArticle(null)}>
          &larr; BACK
        </button>
      </div>

      <div className="box">
        <p className="controls-box-headline">Export</p>
        <div className="input-wrapper">
          <p>Format</p>
          <div id="options-formats-wrapper">
            <div>
              <input
                type="radio"
                id="options-radio-format-png"
                name="format"
                checked={format === "png"}
                onChange={() => setFormat("png")}
              />
              <label htmlFor="options-radio-format-png">PNG</label>
            </div>
            <div>
              <input
                type="radio"
                id="options-radio-format-jpeg"
                name="format"
                checked={format === "jpeg"}
                onChange={() => setFormat("jpeg")}
              />
              <label htmlFor="options-radio-format-jpeg">JPEG</label>
            </div>
            <div>
              <input
                type="radio"
                id="options-radio-format-svg"
                name="format"
                checked={format === "svg"}
                onChange={() => setFormat("svg")}
              />
              <label htmlFor="options-radio-format-svg">SVG</label>
            </div>
          </div>
        </div>
      </div>

      <div className="box">
        <p className="controls-box-headline">Title</p>
        <div className="input-wrapper">
          <p>Size</p>
          <div onDoubleClick={() => setTitleSize(0.08)}>
            <ReactSlider
              className="customSlider"
              thumbClassName="customSlider-thumb"
              trackClassName="customSlider-track"
              min={0.02}
              max={0.11}
              step={0.0001}
              value={titleSize}
              onChange={(newscale) => setTitleSize(newscale)}
            />
          </div>
        </div>
      </div>

      <div className="box">
        <p className="controls-box-headline">Subtitle</p>
        <div className="input-wrapper">
          <p>Size</p>
          <div onDoubleClick={() => setSubTitleSize(0.031)}>
            <ReactSlider
              disabled={article?.subtitle === null}
              className="customSlider"
              thumbClassName="customSlider-thumb"
              trackClassName="customSlider-track"
              min={0.02}
              max={0.05}
              step={0.0001}
              value={subTitleSize}
              onChange={(newscale) => setSubTitleSize(newscale)}
            />
          </div>
        </div>
      </div>

      <div className="box">
        <p className="controls-box-headline">Image</p>
        <div className="input-wrapper">
          <p>Horizontal</p>
          <div onDoubleClick={() => setImagePositionX(50)}>
            <ReactSlider
              className="customSlider"
              thumbClassName="customSlider-thumb"
              trackClassName="customSlider-track"
              min={0}
              max={100}
              step={1}
              value={imagePositionX}
              onChange={(val) => setImagePositionX(val)}
            />
          </div>
        </div>
        <div className="input-wrapper">
          <p>Vertical</p>
          <div onDoubleClick={() => setImagePositionY(50)}>
            <ReactSlider
              className="customSlider"
              thumbClassName="customSlider-thumb"
              trackClassName="customSlider-track"
              min={0}
              max={100}
              step={1}
              value={imagePositionY}
              onChange={(val) => setImagePositionY(val)}
            />
          </div>
        </div>
      </div>

      <div className="box">
        <p className="controls-box-headline">Elements</p>
        <div className="input-wrapper">
          <p>Article tease</p>
          <Switch
            checked={showArticleTease}
            onChange={setShowArticleTease}
          />
        </div>
      </div>
    </div>
  );
}

export default Controls;
