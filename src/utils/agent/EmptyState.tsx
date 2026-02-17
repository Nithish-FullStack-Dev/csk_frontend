export function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-10 text-center text-muted-foreground">
      <div className="text-3xl mb-2">📭</div>
      <p className="text-sm">{text}</p>
    </div>
  );
}
