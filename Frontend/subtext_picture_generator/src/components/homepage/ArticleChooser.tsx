"use client";

import React, { useRef, useState } from "react";
import { Article } from "@/model/article";
import { FetchState } from "@/model/fetchStates";

type Props = {
  setArticle: (article: Article) => void;
};

const tagBlackList = ["lead"];

function ArticleChooser({ setArticle }: Readonly<Props>) {
  const [fetchState, setFetchState] = useState(FetchState.Idle);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="chooser-screen">
      <h1>GENERATE SUBTEXT PICTURE</h1>
      <div className="input-wrapper-article-url">
        <input
          ref={inputRef}
          placeholder="https://www.subtext.at/year/month/article/"
        />
      </div>
      {fetchState === FetchState.Fetching ? (
        <button className="btn btn-primary" disabled>
          READING DATA...
        </button>
      ) : (
        <>
          <button
            className="btn btn-primary"
            onClick={async () => {
              setFetchState(FetchState.Fetching);
              const endpoint = process.env.NEXT_PUBLIC_BACKEND_URL;
              if (!endpoint) {
                setFetchState(FetchState.Error);
                console.error(
                  "Endpoint not specified. Specify Environment Variable"
                );
                return;
              }
              try {
                const response = await fetch(
                  `${endpoint}?url=${encodeURIComponent(inputRef.current?.value ?? "")}`
                );
                const json = await response.json();
                setArticle({
                  title: json.title,
                  categories: json.categories.filter(
                    (c: string) => tagBlackList.includes(c)
                  ),
                  author: json.author,
                  date: json.date,
                  picture: {
                    author: json.picture.author,
                    src: json.picture.link,
                  },
                  subtitle: json.subtitle,
                });
                setFetchState(FetchState.Idle);
              } catch (error) {
                console.error(error);
                setFetchState(FetchState.Error);
              }
            }}
          >
            GENERATE
          </button>
          {fetchState === FetchState.Error && (
            <div className="error-box">
              Something went wrong. Please check the URL and try again.
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default ArticleChooser;
