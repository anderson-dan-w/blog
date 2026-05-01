import hcl from "highlight-hcl";
import dockerfile from "highlight.js/lib/languages/dockerfile";
import shellSession from "highlight.js/lib/languages/shell";
import { common } from "lowlight";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

/**
 * Renders a scene's prose. Full GitHub-Flavored Markdown is supported —
 * headings, bold, italic, links, bullet/numbered lists, blockquotes, tables,
 * fenced code blocks (with syntax highlighting), inline code, task lists,
 * strikethrough.
 *
 * Authoring lives in `src/content/posts/<slug>/prose/*.md`. No inline HTML needed.
 *
 * Syntax highlighting uses highlight.js via rehype-highlight. The default
 * "common" bundle covers Python, SQL, YAML, JSON, JS/TS, plain bash. We
 * register the rest explicitly here:
 *   - dockerfile: Dockerfile syntax (FROM, RUN, COPY, ENV, ...)
 *   - hcl:        Terraform / HCL (resource blocks, attribute = value)
 *   - shellsession: copy-paste $-prompted command output, much better than
 *                   plain `bash` for our snippets
 * Token colors live under `.hljs-*` in `global.css`.
 */
// Merge the common bundle (Python, YAML, SQL, JSON, JS/TS, plain bash, ...)
// with extras we register explicitly. Passing `languages` to rehypeHighlight
// REPLACES the default — so we always need to spread `common` in.
const languages = {
  ...common,
  dockerfile,
  hcl,
  shellsession: shellSession,
};

export function Prose({ text }: { text: string }) {
  return (
    <div className="prose">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, { languages }]]}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}
