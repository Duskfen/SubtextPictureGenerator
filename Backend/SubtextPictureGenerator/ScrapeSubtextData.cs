using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using SubtextPictureGenerator.Model;

namespace SubtextPictureGenerator;

public class ScrapeSubtextData
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<ScrapeSubtextData> _logger;

    public ScrapeSubtextData(IHttpClientFactory httpClientFactory, ILogger<ScrapeSubtextData> logger)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
    }

    [Function("scrape")]
    public async Task<IActionResult> Run(
        [HttpTrigger(AuthorizationLevel.Anonymous, "get")] HttpRequest req)
    {
        _logger.LogInformation("Scrape function triggered.");

        string? url = req.Query["url"];

        if (string.IsNullOrWhiteSpace(url))
        {
            return new BadRequestObjectResult(
                "Please provide a url of a Subtext article in the query params");
        }

        _logger.LogInformation("Scraping article from: {Url}", url);

        var article = new Article(url);

        try
        {
            var client = _httpClientFactory.CreateClient();
            var html = await client.GetStringAsync(article.Url);
            article.ScrapeArticleFromHtml(html);
        }
        catch (HttpRequestException e)
        {
            _logger.LogError(e, "Error while fetching article HTML");
            return new NotFoundObjectResult(
                "The article could not be scraped. Check if you specified the right url");
        }

        return new OkObjectResult(article);
    }
}
