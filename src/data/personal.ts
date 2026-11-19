/**
 * Central personal information. Edit here — every page reads from this file.
 */
export const personal = {
  name: 'Jeet Gohel',
  firstName: 'Jeet',
  title: 'UI/UX Designer · Product Designer · Visual Designer',
  roles: ['UI/UX Designer', 'Product Designer', 'Visual Designer'],
  location: 'Bhavnagar, Gujarat, India',
  email: 'goheljeet563@gmail.com',
  linkedin: 'https://www.linkedin.com/in/jeet-g-59800629a/',
  behance: 'https://www.behance.net/goheljeet/projects',
  /** Add a full WhatsApp link (e.g. https://wa.me/91XXXXXXXXXX). Empty = shown as "coming soon". */
  whatsapp: '',
  /** Replace the PDF at public/resume/jeet-gohel-resume.pdf, or change this path. */
  resumePath: 'resume/jeet-gohel-resume.pdf',
  /** Portrait: drop a file at public/images/profile/ and set the path. Empty = JG monogram. */
  portrait: '' as string,
  company: 'iCode49 Technolabs',
  intro:
    'I design interfaces, products and visual systems — turning loose ideas into clear, usable and good-looking things.',
  philosophy: [
    { title: 'Clarity first', body: 'If a screen needs explaining, it is not finished. I design for the first-time user.' },
    { title: 'Systems over screens', body: 'Tokens, components and rules make good design repeatable and easier to ship.' },
    { title: 'Explore widely, decide deliberately', body: 'I use sketching, prototyping and AI-assisted workflows to explore many directions before committing.' },
  ],
  interests: ['Interface motion', 'Typography', 'Brand identity', 'AI-assisted creative workflows', 'Poster & campaign design', 'Design exploration'],
} as const;

export const education = [
  {
    degree: 'B.E. Information Technology',
    school: 'Shantilal Shah Engineering College',
    period: '2021 – 2025',
    note: 'CGPA 8.06',
  },
];

export const experience = [
  {
    company: 'iCode49 Technolabs',
    role: 'Designer',
    period: 'Present',
    current: true,
    summary: 'Currently working at iCode49 Technolabs across product, interface and visual design.',
    areas: [
      'UI/UX design',
      'Product design',
      'Website design',
      'Dashboard & SaaS design',
      'Mobile application design',
      'Branding & visual identity',
      'Graphic design & social media creatives',
      'Motion design',
      'AI-assisted creative workflows',
      'Design exploration & prototyping',
    ],
  },
];

export const skills = [
  { group: 'Design', items: ['UI/UX design', 'Product design', 'Website design', 'Dashboard & SaaS design', 'Mobile app design', 'Branding & identity', 'Graphic design', 'Motion design'] },
  { group: 'Process', items: ['Design exploration', 'Prototyping', 'AI-assisted workflows'] },
];

export const tools = [
  { name: 'Figma', use: 'Interface design & prototyping' },
  { name: 'Adobe Photoshop', use: 'Image editing & compositing' },
  { name: 'Adobe Illustrator', use: 'Vector, logo & illustration' },
  { name: 'Affinity', use: 'Layout & graphic design' },
  { name: 'Framer', use: 'Interactive websites' },
  { name: 'Claude AI', use: 'Ideation & AI-assisted workflows' },
  { name: 'ChatGPT', use: 'Ideation & AI-assisted workflows' },
  { name: 'Gemini', use: 'Ideation & AI-assisted workflows' },
];
