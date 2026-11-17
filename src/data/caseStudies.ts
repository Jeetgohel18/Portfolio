/**
 * Case study template + per-project content.
 *
 * - SECTION_TEMPLATE defines the 12 reusable sections and their sub-topics.
 * - CASE_STUDIES[slug] lets you hide sections and override content.
 * - Nothing here is real research or results. Placeholders say so explicitly.
 *
 * To hide a section for a project:  hiddenSections: ['research', 'prototype']
 * To fill a section with real content:
 *   content: { research: { lead: '…', items: [{ title: 'Insight', body: '…' }], images: ['images/case-studies/x/research.jpg'] } }
 */
export type SectionId =
  | 'introduction' | 'overview' | 'problem' | 'research' | 'strategy' | 'ux'
  | 'visual' | 'final' | 'prototype' | 'outcomes' | 'learnings' | 'next';

/** An image path (relative to /public) or an image with caption/alt. */
export type CaseImage = string | { src: string; caption?: string; alt?: string };

export type SectionContent = {
  lead?: string;
  /** Text for topics. `title` must match a topic title in SECTION_TEMPLATE (case-insensitive). */
  items?: { title: string; body: string }[];
  /** Image grid shown in place of the placeholder visual for this section. */
  images?: CaseImage[];
  /** 'final' section only: desktop screenshots (shown in browser frames) */
  desktop?: CaseImage[];
  /** 'final' section only: mobile screenshots (shown in phone frames) */
  mobile?: CaseImage[];
  /** 'prototype' section: Figma/Framer embed URL */
  embedUrl?: string;
  /** 'prototype' section: MP4 path relative to /public */
  video?: string;
};

export const imgSrc = (i: CaseImage) => (typeof i === 'string' ? i : i.src);
export const imgCaption = (i: CaseImage) => (typeof i === 'string' ? undefined : i.caption);
export const imgAlt = (i: CaseImage, fallback: string) => (typeof i === 'string' ? fallback : i.alt ?? i.caption ?? fallback);

export type SectionTemplate = {
  id: SectionId;
  title: string;
  nav: string;
  lead: string;
  topics: { title: string; hint: string }[];
};

export const SECTION_TEMPLATE: SectionTemplate[] = [
  { id: 'introduction', title: 'Introduction', nav: 'Intro', lead: 'Project name, category, cover and a short overview.', topics: [
    { title: 'My role', hint: 'Describe your responsibilities on this project.' },
    { title: 'Timeline', hint: 'Add the project duration.' },
    { title: 'Platform', hint: 'Web, iOS, Android, print…' },
    { title: 'Tools', hint: 'Software used.' } ] },
  { id: 'overview', title: 'Overview', nav: 'Overview', lead: 'Background and context for the project.', topics: [
    { title: 'Background', hint: 'Who is this for, and what is the story behind it?' },
    { title: 'Project context', hint: 'Constraints, team, market or business context.' },
    { title: 'Objective', hint: 'What was the project meant to achieve?' },
    { title: 'Scope', hint: 'What was in and out of scope?' } ] },
  { id: 'problem', title: 'Problem Space', nav: 'Problem', lead: 'The problem, who it affects and where the opportunity is.', topics: [
    { title: 'Problem statement', hint: 'State the problem in one or two sentences.' },
    { title: 'Existing challenges', hint: 'What is not working today?' },
    { title: 'User pain points', hint: 'Only include pain points you actually observed.' },
    { title: 'Opportunity areas', hint: 'Where could design make a difference?' } ] },
  { id: 'research', title: 'Research', nav: 'Research', lead: 'What you learned, and how. Hide this section if no research was done.', topics: [
    { title: 'Research overview', hint: 'Methods used (interviews, surveys, audits…).' },
    { title: 'User insights', hint: 'Real quotes or observations — never invented.' },
    { title: 'Competitor analysis', hint: 'Compare products you actually reviewed.' },
    { title: 'Research findings', hint: 'Summarise what changed in your thinking.' } ] },
  { id: 'strategy', title: 'Strategy', nav: 'Strategy', lead: 'Goals, principles and structure before pixels.', topics: [
    { title: 'Design goals', hint: 'What the design must achieve.' },
    { title: 'Design principles', hint: '3–4 guiding rules for decisions.' },
    { title: 'Information architecture', hint: 'Sitemap or content structure.' },
    { title: 'User journeys', hint: 'Key steps a user takes.' } ] },
  { id: 'ux', title: 'User Experience', nav: 'UX', lead: 'Flows, wireframes and the decisions behind them.', topics: [
    { title: 'User flows', hint: 'Diagram of the main task paths.' },
    { title: 'Wireframes', hint: 'Low- to mid-fidelity explorations.' },
    { title: 'Interaction decisions', hint: 'Why things behave the way they do.' },
    { title: 'Experience improvements', hint: 'What got better, and how you know.' } ] },
  { id: 'visual', title: 'Visual Design', nav: 'Visual', lead: 'The design system and visual language.', topics: [
    { title: 'Design system', hint: 'Tokens, grids, spacing.' },
    { title: 'Typography', hint: 'Typefaces, scale, usage.' },
    { title: 'Color palette', hint: 'Primary, neutral, semantic colours.' },
    { title: 'Components', hint: 'Buttons, inputs, cards, navigation…' } ] },
  { id: 'final', title: 'Final Design', nav: 'Final', lead: 'The finished interface, presented at full quality.', topics: [
    { title: 'Desktop screens', hint: 'Add high-quality desktop mockups.' },
    { title: 'Mobile screens', hint: 'Add mobile mockups.' },
    { title: 'Dashboard screens', hint: 'Add data-heavy views if relevant.' },
    { title: 'Detail close-ups', hint: 'Annotated interface details.' } ] },
  { id: 'prototype', title: 'Prototype & Interactions', nav: 'Prototype', lead: 'Interactive prototype and motion demonstrations.', topics: [
    { title: 'Interactive prototype', hint: 'Embed a Figma or Framer prototype (embedUrl).' },
    { title: 'Motion demonstrations', hint: 'Add an MP4/GIF of key transitions.' },
    { title: 'Important interactions', hint: 'Call out the moments that matter.' } ] },
  { id: 'outcomes', title: 'Outcomes', nav: 'Outcomes', lead: 'Deliverables, and validated results only if you have them.', topics: [
    { title: 'Final deliverables', hint: 'List what was handed over.' },
    { title: 'Validated results', hint: 'Only add if you have real evidence.' },
    { title: 'Project impact', hint: 'Only add if supplied and verifiable.' } ] },
  { id: 'learnings', title: 'Learnings', nav: 'Learnings', lead: 'Challenges, decisions and what you would do next.', topics: [
    { title: 'Challenges', hint: 'What was hard?' },
    { title: 'Design decisions', hint: 'Trade-offs you made.' },
    { title: 'What I learned', hint: 'Personal takeaways.' },
    { title: 'Future improvements', hint: 'What you would do with more time.' } ] },
  { id: 'next', title: 'Next Project', nav: 'Next', lead: 'Keep exploring.', topics: [] },
];

export type CaseStudyConfig = {
  hiddenSections?: SectionId[];
  /** Optional: override project cover on the case study only (path relative to /public). */
  cover?: string;
  content?: Partial<Record<SectionId, SectionContent>>;
};

export const CASE_STUDIES: Record<string, CaseStudyConfig> = {
  'website-project': { hiddenSections: ['prototype'] },
  'mobile-app-project': {},
  'saas-dashboard-project': {},
  'product-design-project': {},
  'brand-identity-project': { hiddenSections: ['research', 'ux', 'prototype'] },
  'graphic-design-project': { hiddenSections: ['research', 'strategy', 'ux', 'prototype'] },
};

export const getCaseStudy = (slug: string): CaseStudyConfig => CASE_STUDIES[slug] ?? {};
