import React, { useRef, useState } from "react";
import { Article } from "subtextPictureGenerator/model/article";
import { fetchStates } from "subtextPictureGenerator/model/fetchStates";
import { Picture } from "subtextPictureGenerator/model/picture";

type Props = {
  setArticle: (article: Article) => void;
};

const tagBlackList = ["lead"];

function ArticleChooser({ setArticle }: Readonly<Props>) {
  const [fetchState, setFetchState] = useState(fetchStates.Idle);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <h1>GENERATE SUBTEXT PICTURE</h1>
      <div className="input-wrapper-article-url">
        {/* <p>Article URL:</p> */}
        <input
          ref={inputRef}
          placeholder="https://www.subtext.at/year/month/article/"
        ></input>
      </div>
      {fetchState == fetchStates.Fetching ? (
        <button>READING DATA...</button>
      ) : (
        <>
          <button
            onClick={async () => {
              setFetchState(fetchStates.Fetching);
              let endpoint: string | undefined =
                process.env.NEXT_PUBLIC_BACKEND_URL;
              if (endpoint == undefined) {
                setFetchState(fetchStates.Error);
                console.error(
                  "Endpoint not specified. Specify Environent Variable"
                );
                return;
              }
              try {
                endpoint += "?url=" + inputRef.current?.value;
                let json = await (await fetch(endpoint)).json();
                setArticle(
                  new Article(
                    json.title,
                    json.categories.filter((c:string) => tagBlackList.includes(c)),
                    json.author,
                    json.date,
                    new Picture(json.picture.author, json.picture.link),
                    json.subtitle
                  )
                );
                setFetchState(fetchStates.Idle);
              } catch (error) {
                console.error(error);
                setFetchState(fetchStates.Error);
              }
            }}
          >
            GENERATE
          </button>
          {fetchState == fetchStates.Error ? (
            <div
              className="box"
              style={{ textAlign: "center", backgroundColor: "#e74c3c" }}
            >
              There was an Error
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}

export default ArticleChooser;
