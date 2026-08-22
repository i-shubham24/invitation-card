/**
 * Single source of truth for the invitation.
 * Change names, dates, events, photos and copy here — every section reads
 * from this file, so re-skinning to the Figma design touches only tokens/CSS.
 */

export const couple = {
  groom: {
    first: 'Akashdeep',
    full: 'Akashdeep Singh Sehdev',
    initial: 'A',
    role: 'The Groom',
    blurb:
      'Steady, warm and quietly funny — the one who makes every room feel easier to be in.',
    photo: '/media/gallery/ph-2.jpg',
  },
  bride: {
    first: 'Harmandip',
    full: 'Harmandip Kaur',
    initial: 'H',
    role: 'The Bride',
    blurb:
      'Bright, graceful and endlessly kind — the heart that turns a house into a home.',
    photo: '/media/gallery/ph-4.jpg',
  },
  hashtag: '#AkashFoundHisQueen',
  tagline: 'our forever begins together',
}

/** Wedding day used by the countdown. Month is 0-indexed. */
export const weddingDate = new Date(2026, 8, 5, 10, 0, 0) // 5 September 2026, 10:00

export const events = [
  {
    id: 'mehendi',
    name: 'Mehendi',
    icon: '🌿',
    date: 'Thursday, 3 September 2026',
    time: '4:00 PM onwards',
    venue: 'Sehdev Residence',
    address: 'Ludhiana, Punjab',
    note: 'An afternoon of henna, colour and song.',
    mapQuery: 'Ludhiana, Punjab',
  },
  {
    id: 'sangeet',
    name: 'Sangeet & Jago',
    icon: '✨',
    date: 'Friday, 4 September 2026',
    time: '7:00 PM onwards',
    venue: 'The Grand Banquet',
    address: 'Ludhiana, Punjab',
    note: 'Dancing, dhol and a night that runs long.',
    mapQuery: 'Ludhiana, Punjab',
  },
  {
    id: 'anand-karaj',
    name: 'Anand Karaj',
    icon: '🙏',
    date: 'Saturday, 5 September 2026',
    time: '10:00 AM',
    venue: 'Gurudwara Sahib',
    address: 'Ludhiana, Punjab',
    note: 'The ceremony that binds two families as one.',
    mapQuery: 'Gurudwara Sahib Ludhiana, Punjab',
  },
  {
    id: 'reception',
    name: 'Reception',
    icon: '🥂',
    date: 'Saturday, 5 September 2026',
    time: '7:30 PM onwards',
    venue: 'The Grand Banquet',
    address: 'Ludhiana, Punjab',
    note: 'Dinner, toasts and the first dance.',
    mapQuery: 'Ludhiana, Punjab',
  },
]

export const story = [
  {
    year: '2019',
    title: 'How it began',
    text: 'A mutual friend, a crowded room, and a conversation neither of them wanted to end.',
    photo: '/media/gallery/ph-1.jpg',
  },
  {
    year: '2022',
    title: 'The first trip',
    text: 'Mountains, bad directions and far too many photographs. They came back inseparable.',
    photo: '/media/gallery/ph-3.jpg',
  },
  {
    year: '2025',
    title: 'The question',
    text: 'On a quiet evening by the water, with a ring hidden badly for three whole days.',
    photo: '/media/gallery/ph-5.jpg',
  },
  {
    year: '2026',
    title: 'Forever',
    text: 'And now, surrounded by everyone they love, the beginning of the rest of it.',
    photo: '/media/gallery/ph-6.jpg',
  },
]

/** Swap these for real photographs — drop files in /public/media/gallery/. */
export const gallery = [
  { src: '/media/gallery/ph-1.jpg', alt: 'The couple, moment one' },
  { src: '/media/gallery/ph-2.jpg', alt: 'The couple, moment two' },
  { src: '/media/gallery/ph-3.jpg', alt: 'The couple, moment three' },
  { src: '/media/gallery/ph-4.jpg', alt: 'The couple, moment four' },
  { src: '/media/gallery/ph-5.jpg', alt: 'The couple, moment five' },
  { src: '/media/gallery/ph-6.jpg', alt: 'The couple, moment six' },
]

export const navLinks = [
  { href: '#home', label: 'Home' },
  { href: '#couple', label: 'Couple' },
  { href: '#story', label: 'Story' },
  { href: '#events', label: 'Events' },
  { href: '#gallery', label: 'Gallery' },
  { href: '#rsvp', label: 'RSVP' },
]
