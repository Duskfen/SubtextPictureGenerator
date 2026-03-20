using System.Net;
using System.Text.Json.Serialization;
using Fizzler.Systems.HtmlAgilityPack;
using HtmlAgilityPack;

namespace SubtextPictureGenerator.Model;

public class Article
{
    [JsonIgnore]
    public string Url { get; set; }

    public string? Title { get; set; }

    public string? Subtitle { get; set; }

    public List<string> Categories { get; set; } = [];

    public string? Author { get; set; }

    public string? Date { get; set; }

    public Picture? Picture { get; set; }

    public Article(string url)
    {
        Url = url;
    }

    public void ScrapeArticleFromHtml(string rawHtml)
    {
        var html = new HtmlDocument();
        html.LoadHtml(rawHtml);

        var mainArticle = html.DocumentNode.QuerySelector("article");

        Date = mainArticle.QuerySelector(".qodef-e-info-date")?.InnerText.Trim().Replace("\t", "");
        Author = mainArticle.QuerySelector(".qodef-e-info-author")?.InnerText.Trim().Replace("\t", "");

        var categoryLinks = mainArticle.QuerySelector(".qodef-e-info-category")?.QuerySelectorAll("a");
        if (categoryLinks != null)
        {
            Categories.AddRange(categoryLinks.Select(e => e.InnerText.Trim().Replace("\t", "")));
        }

        Title = mainArticle.QuerySelector(".qodef-e-title")?.InnerText.Trim().Replace("\t", "");
        Subtitle = mainArticle.QuerySelector(".qodef-e-title + p")?.InnerText.Trim().Replace("\t", "");

        var rawImageUrl = mainArticle.QuerySelector(".qodef-e-media-image img")?.Attributes["data-lazy-src"]?.Value
                         ?? mainArticle.QuerySelector(".qodef-e-media-image img")?.Attributes["data-src-img"]?.Value;

        Picture = new Picture
        {
            Link = rawImageUrl != null ? WebUtility.HtmlDecode(rawImageUrl) : null,
            Author = mainArticle.QuerySelector(".qodef-e-media-image .pt-credits")?.InnerText.Trim().Replace("\t", "")
        };
    }
}
