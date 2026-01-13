import DOMPurify from "isomorphic-dompurify";

type Props = {
  html: string;
};

export default function RenderRichText({ html }: Props) {
  const cleanHtml = DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
  });

  return (
    <div
      className="prose prose-neutral dark:prose-invert max-w-none"
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
}
