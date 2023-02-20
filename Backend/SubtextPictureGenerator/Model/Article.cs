﻿using Fizzler.Systems.HtmlAgilityPack;
using HtmlAgilityPack;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SubtextPictureGenerator.Model
{
    internal class Article
    {
        public string url;

        public string title;

        public string category;

        public string author;

        public string date;

        public Picture picture;

        public Article(string url)
        {
            this.url = url;
        }

        /// <summary>
        /// Scrapes the URL and populates the Article-Properties
        /// </summary>
        public void ScrapeArticleFromHtml(string rawHtml)
        {
            var html = new HtmlDocument();
            html.LoadHtml(rawHtml);

            HtmlNode mainarticle = html.DocumentNode.QuerySelector("article");

            date = mainarticle.QuerySelector(".qodef-e-info-date")?.InnerText.Trim().Replace("\t", "");
            author = mainarticle.QuerySelector(".qodef-e-info-author")?.InnerText.Trim().Replace("\t", "");
            category = mainarticle.QuerySelector(".qodef-e-info-category")?.InnerText.Trim().Replace("\t", "");
            title = mainarticle.QuerySelector(".qodef-e-title")?.InnerText.Trim().Replace("\t", "");
            picture = new Picture();
            picture.link = mainarticle.QuerySelector(".qodef-e-media-image img")?.Attributes["data-lazy-src"].Value;
            picture.author = mainarticle.QuerySelector(".qodef-e-media-image .pt-credits")?.InnerText.Trim().Replace("\t", "");
        }

    }
}