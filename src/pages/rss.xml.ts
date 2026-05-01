import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  if (!context.site) {
    throw new Error("Astro `site` config is required for the RSS feed.");
  }

  const posts = (await getCollection("blog"))
    .filter((p) => !p.data.draft)
    .sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());

  const base = import.meta.env.BASE_URL.replace(/\/$/, "");

  return rss({
    title: "dwa - blog",
    description:
      "Notes on infrastructure, databases, kubernetes, and how the boring middle of software actually gets built.",
    site: new URL(`${base}/`, context.site).href,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: new URL(`${base}/${post.id}/`, context.site).href,
      categories: post.data.tags,
    })),
  });
}
