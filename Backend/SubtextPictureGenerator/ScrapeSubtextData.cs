using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Extensions.Http;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Newtonsoft.Json;
using SubtextPictureGenerator.Model;
using System.Net.Http;

namespace SubtextPictureGenerator
{
    public static class ScrapeSubtextData
    {
        static HttpClient client = new HttpClient();

        [FunctionName("scrape")]
        public static async Task<IActionResult> Run(
            [HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = null)] HttpRequest req,
            ILogger log)
        {
            log.LogInformation("C# HTTP trigger function processed a request.");

            #region Process Request

            string url = req.Query["url"];
            string requestBody = await new StreamReader(req.Body).ReadToEndAsync();
            dynamic body = JsonConvert.DeserializeObject(requestBody);
            url ??= body?.url;

            if (url == null || url.Trim() == "")
            {
                return new BadRequestObjectResult("Please provide a url of a Subtext article either in the query params or the request body");
            }

            log.LogInformation("got url from message: " + url);

            #endregion

            #region Scrape Subtext


            Article article = new Article(url);



            //article.headline = "test";
            //article.date = "08.05.2099";
            //article.picture = new Picture("base64string", "pictureAuthor1");
            //article.tag = "Testtag";
            //return new OkObjectResult(article);

            try
            {
                article.ScrapeArticleFromHtml(await client.GetStringAsync(article.url));
            }
            catch (HttpRequestException e)
            {
                log.LogError(e, "Exceptin while scraping/Getting raw HTML");
                return new NotFoundObjectResult("The Article could not be scraped. Check if you specified the right url");
            }

            #endregion
            return new OkObjectResult(article);


        }
    }
}
