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
      className="prose prose-neutral dark:prose-invert max-w-none prose-ul:list-disc prose-ul:pl-5 
        prose-ol:list-decimal prose-ol:pl-5 
        prose-li:marker:text-foreground"
      dangerouslySetInnerHTML={{ __html: cleanHtml }}
    />
  );
}
