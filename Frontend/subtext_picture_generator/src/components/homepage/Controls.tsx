import Switch from "rc-switch";
import React from "react";
import ReactSlider from "react-slider";
import { Article } from "subtextPictureGenerator/model/article";

type Props = {
  article: Article | null;
  setArticle: (aricle: Article | null) => void;
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
  setImagePreviewScale,
  imagePreviewScale,
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
      <button onClick={() => setArticle(null)}>back</button>

      <div className="box">
        <p className="controls-box-headline">General</p>
        <div>
          <div className="input-wrapper">
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
                setImagePreviewScale(newscale);
              }}
            />
          </div>
          <div className="input-wrapper">
            <p>Download-Format: </p>
            <div id="options-formats-wrapper">
              <div>
                <input
                  type="radio"
                  id="options-radio-format-png"
                  checked={format == "png"}
                  onClick={() => setFormat("png")}
                />
                <label htmlFor="options-radio-format-png">PNG</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="options-radio-format-jpeg"
                  checked={format == "jpeg"}
                  onClick={() => setFormat("jpeg")}
                />
                <label htmlFor="options-radio-format-jpeg">JPEG</label>
              </div>
              <div>
                <input
                  type="radio"
                  id="options-radio-format-svg"
                  checked={format == "svg"}
                  onClick={() => setFormat("svg")}
                />
                <label htmlFor="options-radio-format-svg">SVG</label>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="box">
        <p className="controls-box-headline">Title</p>
        <div>
          <div className="input-wrapper">
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
                    setTitleSize(newscale);
                  }}
                />
              </div>
              <div></div>
            </div>
          </div>
        </div>
      </div>
      <div className="box">
        <p className="controls-box-headline">Sub-Title</p>
        <div>

          <div className="input-wrapper">
            <p>Size: </p>
            <div>
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
                  onChange={(newscale) => {
                    setSubTitleSize(newscale);
                  }}
                />
              </div>
              <div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Controls;
