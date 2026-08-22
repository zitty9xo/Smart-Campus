import { Report } from './types';

// Helper to create clean inline SVG placeholder images for realistic rendering
function createSvgImage(title: string, color1: string, color2: string, iconType: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <defs>
      <linearGradient id="grad-${title.replace(/[^a-zA-Z0-9]/g, '')}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color1}" />
        <stop offset="100%" stop-color="${color2}" />
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="10" stdDeviation="15" flood-color="#000000" flood-opacity="0.3"/>
      </filter>
    </defs>
    <rect width="600" height="400" fill="url(#grad-${title.replace(/[^a-zA-Z0-9]/g, '')})"/>
    <circle cx="300" cy="180" r="90" fill="rgba(255,255,255,0.15)" />
    <g filter="url(#shadow)" transform="translate(300, 180) scale(1.5)">
      ${iconType === 'headphones' ? `
        <path d="M-30,-10 C-30,-45 30,-45 30,-10 L30,20 C30,30 20,30 15,20 L15,0 L25,0 L25,-10 C25,-35 -25,-35 -25,-10 L-25,0 L-15,0 L-15,20 C-20,30 -30,30 -30,20 Z" fill="#ffffff" />
        <rect x="-32" y="0" width="12" height="25" rx="4" fill="#ffffff"/>
        <rect x="20" y="0" width="12" height="25" rx="4" fill="#ffffff"/>
      ` : iconType === 'waterbottle' ? `
        <rect x="-15" y="-45" width="30" height="12" rx="3" fill="#ffffff"/>
        <rect x="-22" y="-30" width="44" height="75" rx="10" fill="#ffffff"/>
        <rect x="-18" y="-15" width="36" height="4" rx="2" fill="rgba(0,0,0,0.1)"/>
        <circle cx="0" cy="10" r="8" fill="rgba(0,0,0,0.15)"/>
      ` : iconType === 'wallet' ? `
        <rect x="-35" y="-25" width="70" height="50" rx="6" fill="#ffffff"/>
        <path d="M-35,-10 L35,-10" stroke="rgba(0,0,0,0.15)" stroke-width="4"/>
        <rect x="15" y="-5" width="15" height="12" rx="3" fill="rgba(0,0,0,0.2)"/>
        <circle cx="22.5" cy="1" r="3" fill="#ffffff"/>
      ` : iconType === 'charger' ? `
        <rect x="-25" y="-25" width="50" height="50" rx="8" fill="#ffffff"/>
        <rect x="-12" y="-40" width="6" height="15" rx="2" fill="#ffffff"/>
        <rect x="6" y="-40" width="6" height="15" rx="2" fill="#ffffff"/>
        <circle cx="0" cy="10" r="6" fill="rgba(0,0,0,0.15)"/>
      ` : iconType === 'keys' ? `
        <circle cx="-10" cy="-10" r="18" fill="none" stroke="#ffffff" stroke-width="8"/>
        <path d="M2,-2 L30,26 L22,34 L16,28 L10,34 L-2,22 L10,10 Z" fill="#ffffff"/>
      ` : `
        <rect x="-30" y="-20" width="60" height="40" rx="6" fill="#ffffff"/>
        <circle cx="0" cy="0" r="12" fill="rgba(0,0,0,0.2)"/>
      `}
    </g>
    <text x="300" y="320" font-family="Inter, sans-serif" font-weight="700" font-size="22" fill="#ffffff" text-anchor="middle" letter-spacing="0.5">${title}</text>
    <text x="300" y="350" font-family="Inter, sans-serif" font-size="14" fill="rgba(255,255,255,0.8)" text-anchor="middle">Smart Campus Verification Image</text>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

export const INITIAL_SEED_REPORTS: Report[] = [
  {
    id: 'r_found_1',
    type: 'found',
    title: 'Sony Over-Ear Noise Canceling Headphones',
    category: 'Electronics',
    description: 'Found a pair of black Sony WH-1000XM4 noise-canceling headphones sitting on a desk near the back entrance of Science Library 2nd floor. Has a small white scratch mark on the left ear cup. Found in a dark matte zipper case.',
    location: 'Science Library, 2nd Floor Study Desk',
    time: '2026-08-22T08:15:00.000Z',
    imageBase64: createSvgImage('Sony Headphones (Black)', '#1e293b', '#0f172a', 'headphones'),
    status: 'open',
    matchedWith: null,
    contactInfo: 'Held at Science Library Info Desk',
    createdAt: '2026-08-22T08:20:00.000Z'
  },
  {
    id: 'r_lost_1',
    type: 'lost',
    title: 'Black Wireless Sony Headphones',
    category: 'Electronics',
    description: 'Lost my black Sony bluetooth headphones around 8 AM while studying near the quiet zone in Science Library. The left ear cup has a tiny scuff scratch on it. Stored in a black travel case.',
    location: 'Science Library Quiet Study Area',
    time: '2026-08-22T08:00:00.000Z',
    imageBase64: createSvgImage('Black Sony Bluetooth Headphones', '#334155', '#1e293b', 'headphones'),
    status: 'open',
    matchedWith: null,
    contactInfo: 'student.alex@campus.edu',
    createdAt: '2026-08-22T08:30:00.000Z'
  },
  {
    id: 'r_found_2',
    type: 'found',
    title: 'Navy Blue Hydro Flask Water Bottle',
    category: 'Water Bottle',
    description: '32oz Navy blue insulated flask with flex cap strap. Has stickers on it: "Google Developers", "Hackathon 2026", and a green pine tree sticker. Found on the wooden bench outside Student Union.',
    location: 'Student Union Courtyard Benches',
    time: '2026-08-21T16:30:00.000Z',
    imageBase64: createSvgImage('Navy Hydro Flask Bottle', '#0369a1', '#075985', 'waterbottle'),
    status: 'open',
    matchedWith: null,
    contactInfo: 'Student Union Desk',
    createdAt: '2026-08-21T16:45:00.000Z'
  },
  {
    id: 'r_lost_2',
    type: 'lost',
    title: 'Dark Blue Metal Water Bottle with Tech Stickers',
    category: 'Water Bottle',
    description: 'Left my deep blue stainless steel insulated water bottle near the outdoor tables outside Student Union cafe. It is covered in developer and tech stickers. High emotional value!',
    location: 'Student Union Outdoor Patio',
    time: '2026-08-21T16:00:00.000Z',
    imageBase64: createSvgImage('Dark Blue Metal Water Bottle', '#0284c7', '#0369a1', 'waterbottle'),
    status: 'open',
    matchedWith: null,
    contactInfo: 'maya.tech@campus.edu',
    createdAt: '2026-08-21T16:15:00.000Z'
  },
  {
    id: 'r_found_3',
    type: 'found',
    title: 'Brown Leather Bifold Wallet with Student ID',
    category: 'Wallet/ID',
    description: 'Dark brown leather wallet found under row 3 seat 14 in Engineering Auditorium B. Contains student ID card with initials "D.W.", campus dining card, and bus pass.',
    location: 'Engineering Auditorium B, Seat 14',
    time: '2026-08-22T09:45:00.000Z',
    imageBase64: createSvgImage('Brown Leather Bifold Wallet', '#78350f', '#451a03', 'wallet'),
    status: 'open',
    matchedWith: null,
    contactInfo: 'Engineering Security Desk',
    createdAt: '2026-08-22T10:00:00.000Z'
  },
  {
    id: 'r_lost_3',
    type: 'lost',
    title: 'Lost Brown Leather Wallet after Lecture',
    category: 'Wallet/ID',
    description: 'Dropped my dark brown leather folding wallet right after 9 AM lecture in Engineering Hall. Contains my campus student ID card, driver license, and debit card.',
    location: 'Engineering Hall / Auditorium Area',
    time: '2026-08-22T09:00:00.000Z',
    imageBase64: createSvgImage('Lost Leather Wallet', '#92400e', '#78350f', 'wallet'),
    status: 'open',
    matchedWith: null,
    contactInfo: 'delwin.code@campus.edu',
    createdAt: '2026-08-22T09:15:00.000Z'
  },
  {
    id: 'r_found_4',
    type: 'found',
    title: 'White Apple MacBook 67W USB-C Power Charger',
    category: 'Electronics',
    description: 'Original Apple 67W USB-C wall charger with 2-meter white braided cable plugged into the power lounge outlet next to blue couch.',
    location: 'Campus Center Student Lounge',
    time: '2026-08-20T19:00:00.000Z',
    imageBase64: createSvgImage('Apple USB-C 67W Charger', '#475569', '#334155', 'charger'),
    status: 'open',
    matchedWith: null,
    contactInfo: 'Campus Center Lost & Found',
    createdAt: '2026-08-20T19:30:00.000Z'
  },
  {
    id: 'r_lost_4',
    type: 'lost',
    title: 'Car Key Fob with Blue Woven Lanyard',
    category: 'Keys',
    description: 'Smart key fob for Toyota with a blue woven fabric lanyard and two brass keys attached. Dropped while running between Campus Gym and Parking Lot A.',
    location: 'Campus Gym / Parking Lot A',
    time: '2026-08-21T18:20:00.000Z',
    imageBase64: createSvgImage('Toyota Key Fob & Blue Lanyard', '#2563eb', '#1d4ed8', 'keys'),
    status: 'open',
    matchedWith: null,
    contactInfo: 'samuel.k@campus.edu',
    createdAt: '2026-08-21T18:40:00.000Z'
  }
];
