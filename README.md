# blog

Personal blog. Built with [Astro](https://astro.build/), deployed to GitHub Pages.

## Develop

```sh
npm install
npm run dev          # localhost:4321
npm run build        # outputs to dist/
npm run preview      # preview the built site
```

Posts live in `src/content/blog/` as markdown with frontmatter (title, description, pubDate, tags). Posts with custom layouts (e.g. scrollytelling) keep their assets under `src/content/posts/<slug>/` and have a sibling page at `src/pages/blog/<slug>.astro`.
