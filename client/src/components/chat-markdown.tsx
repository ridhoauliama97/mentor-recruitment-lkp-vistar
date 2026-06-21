import React from "react";

function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function parseInline(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  let remaining = escapeHtml(text);
  const regex = /(\*\*(.+?)\*\*)|(\*(.+?)\*)|(`([^`]+)`)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(remaining)) !== null) {
    if (match.index > lastIndex) {
      parts.push(remaining.slice(lastIndex, match.index));
    }
    if (match[1]) {
      parts.push(<strong key={`b-${match.index}`}>{match[2]}</strong>);
    } else if (match[3]) {
      parts.push(<em key={`i-${match.index}`}>{match[4]}</em>);
    } else if (match[5]) {
      parts.push(
        <code key={`c-${match.index}`} className="rounded bg-muted px-1 font-mono text-xs">
          {match[6]}
        </code>,
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < remaining.length) {
    parts.push(remaining.slice(lastIndex));
  }

  return parts.length > 0 ? parts : [remaining];
}

function isTableRow(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith("|") && trimmed.endsWith("|") && trimmed.includes("|", 1);
}

function isTableSeparator(line: string): boolean {
  return /^\|[\s:-]+\|$/.test(line.trim());
}

function parseTable(lines: string[]): React.ReactNode {
  const dataLines = lines.filter((l) => !isTableSeparator(l));
  if (dataLines.length < 1) return null;

  const rows = dataLines.map((line) =>
    line
      .trim()
      .split("|")
      .slice(1, -1)
      .map((cell) => cell.trim()),
  );

  const header = rows[0];
  const body = rows.slice(1);

  return (
    <div className="my-2 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b bg-muted/50">
            {header.map((cell, i) => (
              <th key={i} className="border px-3 py-1.5 text-left font-medium">
                {parseInline(cell)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {body.map((row, ri) => (
            <tr key={ri} className="border-b last:border-0">
              {row.map((cell, ci) => (
                <td key={ci} className="border px-3 py-1.5">
                  {parseInline(cell)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function isListItem(line: string): boolean {
  return /^\s*[-*]\s/.test(line.trim());
}

function isOrderedItem(line: string): boolean {
  return /^\s*\d+[.)]\s/.test(line.trim());
}

function parseList(lines: string[], ordered: boolean): React.ReactNode {
  const items = lines.map((line) => {
    const trimmed = line.trim();
    const cleaned = trimmed.replace(/^(\d+[.)]\s|[-*]\s)/, "");
    return <li key={line}>{parseInline(cleaned)}</li>;
  });

  const ListTag = ordered ? "ol" : "ul";
  return (
    <ListTag className={`my-2 pl-5 ${ordered ? "list-decimal" : "list-disc"} space-y-1`}>
      {items}
    </ListTag>
  );
}

export default function ChatMarkdown({ text }: { text: string }) {
  if (!text) return null;

  const blocks = text.split("\n\n");
  const elements: React.ReactNode[] = [];

  for (let bi = 0; bi < blocks.length; bi++) {
    const block = blocks[bi].trim();
    if (!block) continue;

    const lines = block.split("\n");

    // Table detection
    if (lines.some((l) => isTableRow(l))) {
      elements.push(React.cloneElement(parseTable(lines) as React.ReactElement, { key: `t-${bi}` }));
      continue;
    }

    // Unordered list detection
    if (lines.every((l) => isListItem(l))) {
      elements.push(React.cloneElement(parseList(lines, false) as React.ReactElement, { key: `ul-${bi}` }));
      continue;
    }

    // Ordered list detection
    if (lines.every((l) => isOrderedItem(l))) {
      elements.push(React.cloneElement(parseList(lines, true) as React.ReactElement, { key: `ol-${bi}` }));
      continue;
    }

    // Paragraph — split by single newline within paragraph as <br/>
    const paragraphLines = lines.map((l, li) => (
      <React.Fragment key={li}>
        {li > 0 && <br />}
        {parseInline(l)}
      </React.Fragment>
    ));

    elements.push(
      <p key={`p-${bi}`} className="my-1 leading-relaxed">
        {paragraphLines}
      </p>,
    );
  }

  return <div className="space-y-1">{elements}</div>;
}
