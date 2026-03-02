import NamedPlaylistPage from '@/components/NamedPlaylistPage';
import { Heart } from 'lucide-react';

const AdultZone = () => (
  <NamedPlaylistPage
    section="adult"
    title="Adult Zone"
    Icon={Heart}
    basePath="/adult-zone"
  />
);

export default AdultZone;
