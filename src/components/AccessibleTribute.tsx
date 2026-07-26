import { tribute } from "../content/tribute";

export function AccessibleTribute() {
  return (
    <article className="sr-only" aria-label={`A tribute to ${tribute.recipient}`}>
      <h1>{tribute.openingMessage}</h1>
      {tribute.poemLines.map((line) => (
        <p key={line.text}>{line.text}</p>
      ))}
      <p>{tribute.finalLine}</p>
      <p>{tribute.dedication}</p>
      <p>{tribute.signature}</p>
    </article>
  );
}
