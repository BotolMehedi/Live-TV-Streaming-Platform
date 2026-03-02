import NamedPlaylistPage from '@/components/NamedPlaylistPage';
import { LayoutGrid } from 'lucide-react';

const Others = () => (
  <NamedPlaylistPage
    section="others"
    title="Others"
    Icon={LayoutGrid}
    basePath="/others"
  />
);

export default Others;
