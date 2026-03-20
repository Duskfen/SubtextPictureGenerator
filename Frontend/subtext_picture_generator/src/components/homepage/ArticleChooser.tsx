"use client";

import React, { useEffect, useRef, useState } from "react";
import { Article } from "@/model/article";
import { FetchState } from "@/model/fetchStates";

type Props = {
  setArticle: (article: Article) => void;
};

type RecentArticle = {
  title: string;
  link: string;
  date: string;
};

const tagBlackList = ["lead"];

function ArticleChooser({ setArticle }: Readonly<Props>) {
  const [fetchState, setFetchState] = useState(FetchState.Idle);
  const [recentArticles, setRecentArticles] = useState<RecentArticle[] | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL?.replace(
      /\/scrape$/,
      ""
    );
    if (!backendBase) return;

    fetch(`${backendBase}/recent`)
      .then((res) => res.json())
      .then((data) => setRecentArticles(data))
      .catch(() => setRecentArticles([]));
  }, []);

  const generateFromUrl = async (url: string) => {
    setFetchState(FetchState.Fetching);
    const endpoint = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!endpoint) {
      setFetchState(FetchState.Error);
      console.error("Endpoint not specified. Specify Environment Variable");
      return;
    }
    try {
      const response = await fetch(
        `${endpoint}?url=${encodeURIComponent(url)}`
      );
      const json = await response.json();
      setArticle({
        title: json.title,
        categories: json.categories.filter((c: string) =>
          tagBlackList.includes(c)
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
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("de-AT", {
        day: "numeric",
        month: "short",
      });
    } catch {
      return "";
    }
  };

  return (
    <div className="chooser-screen">
      <h1>GENERATE SUBTEXT PICTURE</h1>
      <div className="input-wrapper-article-url">
        <input
          ref={inputRef}
          placeholder="https://www.subtext.at/year/month/article/"
          onKeyDown={(e) => {
            if (e.key === "Enter" && inputRef.current?.value) {
              generateFromUrl(inputRef.current.value);
            }
          }}
        />
      </div>
      {fetchState === FetchState.Fetching ? (
        <button className="btn btn-primary" disabled>
          <span className="spinner" /> READING DATA...
        </button>
      ) : (
        <>
          <button
            className="btn btn-primary"
            onClick={() => {
              if (inputRef.current?.value) {
                generateFromUrl(inputRef.current.value);
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

      <div className="recent-articles">
        <p className="recent-articles-label">Recent articles</p>
        <div className="recent-articles-list">
          {recentArticles === null
            ? Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="recent-article-card skeleton">
                  <span className="skeleton-text" style={{ width: `${60 + (i * 13) % 30}%` }} />
                  <span className="skeleton-text skeleton-date" />
                </div>
              ))
            : recentArticles.map((item) => (
                <button
                  key={item.link}
                  className="recent-article-card"
                  disabled={fetchState === FetchState.Fetching}
                  onClick={() => generateFromUrl(item.link)}
                >
                  <span className="recent-article-title">{item.title}</span>
                  <span className="recent-article-date">
                    {formatDate(item.date)}
                  </span>
                </button>
              ))}
        </div>
      </div>
    </div>
  );
}

export default ArticleChooser;
