/**
 * ScallopPanel — the RSVP form's background panel with a "3 curve hills"
 * scalloped top, matching the Figma (which builds it from three ellipses over a
 * rounded rectangle, nodes 329:15/16/17/18 on mobile, 683:2674-77 on desktop —
 * all filled #fad2c8). Rendered as one clean SVG path instead, positioned in
 * page-percentages so it sits exactly where those shapes did. Sits low in the
 * z-stack (below the RSVP text + the form controls), like the shapes it
 * replaces, so text and inputs render on top.
 *
 * The viewBox aspect (~0.80) matches the panel box; preserveAspectRatio="none"
 * lets it stretch to each layout's box. Hill centres land at 24.2% / 51.5% /
 * 78.6% of the width, the centre hill the tallest, per the Figma.
 */
export default function ScallopPanel({ x, y, w, h, z = 13, color = '#fad2c8' }) {
  return (
    <svg
      className="fig__scallop"
      aria-hidden="true"
      viewBox="0 0 1000 1245"
      preserveAspectRatio="none"
      style={{
        position: 'absolute',
        left: `${x}%`,
        top: `${y}%`,
        width: `${w}%`,
        height: `${h}%`,
        zIndex: z,
        display: 'block',
        pointerEvents: 'none',
      }}
    >
      <path
        fill={color}
        d="M0,100
           C60,100 150,30 242,30
           C315,30 350,86 388,86
           C430,86 472,22 515,22
           C558,22 600,86 642,86
           C680,86 730,30 786,30
           C878,30 940,100 1000,100
           L1000,1205 Q1000,1245 960,1245
           L40,1245 Q0,1245 0,1205 Z"
      />
    </svg>
  )
}
