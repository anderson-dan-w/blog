import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    /**
     * If set, the post is rendered by a hand-written `src/pages/blog/<slug>.astro`
     * page rather than the generic markdown renderer. The dynamic `[...slug].astro`
     * route skips entries that have a `customLayout`.
     *
     * Current values: "scrolly".
     */
    customLayout: z.string().optional(),
  }),
});

export const collections = { blog };
