import { SkyHero } from '../components/SkyHero';
import { Intro } from '../components/Intro';
import { SelectedWork } from '../components/SelectedWork';
import { Showcase } from '../components/Showcase';
import { GalleryShowcase } from '../components/GalleryShowcase';
import { MotionLab } from '../components/MotionLab';
import { DeskTeasers } from '../components/DeskTeasers';
import { useDocTitle } from '../hooks/useDocTitle';

export default function Home({ ready, onTone }: { ready: boolean; onTone: (dark: boolean) => void }) {
  useDocTitle();
  return (
    <main id="main">
      <SkyHero ready={ready} onTone={onTone} />
      <Intro />
      <SelectedWork />
      <Showcase />
      <GalleryShowcase />
      <MotionLab />
      <DeskTeasers />
    </main>
  );
}
