import { tribute, type TributeLine } from "../content/tribute";

function LineContent({ line }: { line: TributeLine }) {
  if (!line.keyWord) return line.text;

  const start = line.text.toLowerCase().indexOf(line.keyWord.toLowerCase());
  if (start < 0) return line.text;

  const before = line.text.slice(0, start);
  const word = line.text.slice(start, start + line.keyWord.length);
  const after = line.text.slice(start + line.keyWord.length);

  return (
    <>
      <span className="poem-line__support">{before}</span>
      <span
        className="poem-line__key"
        data-poem-key={line.keyWord}
        data-emphasis={line.emphasis}
      >
        {word}
      </span>
      <span className="poem-line__support">{after}</span>
    </>
  );
}

export function PoemStage() {
  return (
    <div className="poem-stage" aria-hidden="true">
      <div className="poem-stage__lines">
        {tribute.poemLines.map((line, index) => (
          <p
            className="poem-line"
            data-poem-line={index}
            data-reveal={line.reveal}
            key={`${line.text}-${index}`}
          >
            <LineContent line={line} />
          </p>
        ))}
      </div>
    </div>
  );
}
