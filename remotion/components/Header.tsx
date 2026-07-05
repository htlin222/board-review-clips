import { theme } from "../theme";

export function Header({ topic, author, position }: { topic: string; author?: string; position: "top" | "bottom" }) {
  return (
    <div
      style={{
        position: "absolute",
        [position]: theme.layout.headerMargin,
        left: theme.layout.headerMargin,
        fontFamily: theme.fonts.family,
        fontSize: theme.fonts.headerSize,
        color: theme.colors.ink,
        opacity: 0.6,
      }}
    >
      {topic}
      {author ? ` · ${author}` : ""}
    </div>
  );
}
