"use client";

import React from "react";
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
}: Readonly<Props>) {
  return (
    <div id="controls">
      <div className="controls-header">
        <button className="btn btn-secondary" onClick={() => setArticle(null)}>
          &larr; Back
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
          <div>
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
          <div>
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
    </div>
  );
}

export default Controls;
