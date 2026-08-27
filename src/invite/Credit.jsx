import './credit.css'

/**
 * Footer credit — small "Made with ❤ by [Humble Solutions logo]" on a dark
 * band, linking to the studio. (The flowers flank the date up in the footer.)
 */
export default function Credit() {
  return (
    <div className="credit">
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
    </div>
  )
}
