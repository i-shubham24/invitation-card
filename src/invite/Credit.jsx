import './credit.css'

/**
 * Footer credit — small "Made with ❤ by [Humble Solutions logo]" with flanking
 * flowers, linking to the studio. Kept small, on the same footer background.
 */
export default function Credit() {
  return (
    <div className="credit">
      <img className="credit__flower" src="/credit/857_571.png" alt="" aria-hidden draggable="false" />
      <a
        className="credit__link"
        href="https://www.humblesolutions.in/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Made with love by Humble Solutions"
      >
        <span className="credit__made">
          Made with
          <img className="credit__heart" src="/credit/857_568.png" alt="love" draggable="false" />
          by
        </span>
        <img className="credit__logo" src="/credit/857_569.png" alt="Humble Solutions" draggable="false" />
      </a>
      <img className="credit__flower credit__flower--r" src="/credit/857_572.png" alt="" aria-hidden draggable="false" />
    </div>
  )
}
