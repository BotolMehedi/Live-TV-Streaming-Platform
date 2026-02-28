import { Play, Tv } from 'lucide-react';
import { Channel } from '@/lib/m3u-parser';
import { useNavigate } from 'react-router-dom';

interface ChannelCardProps {
  channel: Channel;
  type?: 'tv' | 'movie';
}

const ChannelCard = ({ channel, type = 'tv' }: ChannelCardProps) => {
  const navigate = useNavigate();

  const handleClick = () => {
    const path = type === 'movie' ? '/movies/watch' : '/live/watch';
    navigate(`${path}?url=${encodeURIComponent(channel.url)}&name=${encodeURIComponent(channel.name)}`);
  };

  return (
    <button
      onClick={handleClick}
      className="card-elevated rounded-lg overflow-hidden text-left w-full group cursor-pointer border border-border focus:outline-none focus:ring-2 focus:ring-ring"
    >
      <div className="aspect-video bg-accent flex items-center justify-center relative overflow-hidden">
        {channel.logo ? (
          <img
            src={channel.logo}
            alt={channel.name}
            className="w-full h-full object-contain p-4"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }}
          />
        ) : null}
        <div className={`flex flex-col items-center justify-center ${channel.logo ? 'hidden' : ''}`}>
          <Tv className="w-10 h-10 text-primary/40" />
        </div>
        <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all scale-75 group-hover:scale-100">
            <Play className="w-5 h-5 text-primary-foreground ml-0.5" />
          </div>
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-semibold text-sm text-foreground truncate">{channel.name}</h3>
        {channel.group && channel.group !== 'Uncategorized' && (
          <span className="text-xs text-muted-foreground mt-1 block truncate">{channel.group}</span>
        )}
      </div>
    </button>
  );
};

export default ChannelCard;
