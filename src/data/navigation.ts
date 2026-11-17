export type NavItem = { label: string; to: string; section?: string };

export const navigation: NavItem[] = [
  { label: 'Work', to: '/#work', section: 'work' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Resume', to: '/resume' },
];
