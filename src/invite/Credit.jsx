import './credit.css'

/**
 * Footer credit — "Made with ❤ by Humble Solutions" with flanking flowers,
 * linking to the studio. Rendered at the very bottom on every screen size.
 */
export default function Credit() {
  return (
    <a
      className="credit"
      href="https://www.humblesolutions.in/"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Made with love by Humble Solutions"
    >
      <img className="credit__flower" src="/credit/857_571.png" alt="" aria-hidden draggable="false" />
      <span className="credit__text">
        Made with
        <img className="credit__heart" src="/credit/857_568.png" alt="love" draggable="false" />
        by <span className="credit__brand">Humble Solutions</span>
      </span>
      <img className="credit__flower credit__flower--r" src="/credit/857_572.png" alt="" aria-hidden draggable="false" />
    </a>
  )
}
