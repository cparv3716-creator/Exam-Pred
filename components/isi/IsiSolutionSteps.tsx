import { IsiMathRenderer } from "@/components/isi/IsiMathRenderer";

export function IsiSolutionSteps({ content }: { content: string }) {
  const lines = splitSolutionLines(content);

  return (
    <ol className="mt-4 space-y-3">
      {lines.map((line, index) => (
        <li key={`${index}-${line.slice(0, 20)}`} className="grid gap-3 rounded-2xl border bg-white/80 p-4 sm:grid-cols-[2.25rem_minmax(0,1fr)]" style={{ borderColor: "var(--aurora-border-soft)" }}>
          <span className="grid h-8 w-8 place-items-center rounded-full text-xs font-extrabold" style={{ background: "var(--aurora-background-soft)", color: "var(--aurora-primary)" }}>
            {index + 1}
          </span>
          <IsiMathRenderer content={line} className="min-w-0" />
        </li>
      ))}
    </ol>
  );
}

function splitSolutionLines(content: string): string[] {
  const lines: string[] = [];
  const normalized = normalizeDisplayMath(content.replace(/\r\n/g, "\n").trim());
  const displayMathPattern = /\$\$[\s\S]*?\$\$/g;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = displayMathPattern.exec(normalized)) !== null) {
    pushTextLines(normalized.slice(cursor, match.index), lines);
    lines.push(match[0].trim());
    cursor = match.index + match[0].length;
  }

  pushTextLines(normalized.slice(cursor), lines);
  return lines.length ? lines : [content];
}

function normalizeDisplayMath(content: string): string {
  const sourceLines = content.split("\n");
  const normalizedLines: string[] = [];
  for (let index = 0; index < sourceLines.length; index += 1) {
    const line = sourceLines[index].trim();
    if (line === "$") {
      const mathLines: string[] = [];
      index += 1;
      while (index < sourceLines.length && sourceLines[index].trim() !== "$") {
        mathLines.push(sourceLines[index]);
        index += 1;
      }
      normalizedLines.push(`$$\n${mathLines.join("\n").trim()}\n$$`);
    } else {
      normalizedLines.push(sourceLines[index]);
    }
  }
  return normalizedLines.join("\n");
}

function pushTextLines(text: string, lines: string[]) {
  for (const line of text.split(/\n+/)) {
    const trimmed = line.trim();
    if (trimmed) lines.push(trimmed);
  }
}
