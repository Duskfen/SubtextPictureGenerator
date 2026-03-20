using System.Xml.Linq;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;

namespace SubtextPictureGenerator;

public class RecentArticles
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<RecentArticles> _logger;

    public RecentArticles(IHttpClientFactory httpClientFactory, ILogger<RecentArticles> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    [Function("recent")]
    public async Task<IActionResult> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequest req)
    {
        _logger.LogInformation("Recent articles function triggered.");

        try
        {
            var client = _httpClientFactory.CreateClient();
            var xml = await client.GetStringAsync("https://www.subtext.at/feed/");
            var doc = XDocument.Parse(xml);
            var items = doc.Descendants("item")
                .Take(10)
                .Select(item => new
                {
                    title = item.Element("title")?.Value,
                    link = item.Element("link")?.Value,
                    date = item.Element("pubDate")?.Value,
                })
                .ToList();

            return new OkObjectResult(items);
        }
        catch (Exception e)
        {
            _logger.LogError(e, "Error fetching RSS feed");
            return new StatusCodeResult(502);
        }
    }
}
