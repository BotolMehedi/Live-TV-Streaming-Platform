import { useState, useEffect, useMemo } from 'react';
import Layout from '@/components/Layout';
import ChannelCard from '@/components/ChannelCard';
import { fetchAllPlaylists, Channel } from '@/lib/m3u-parser';
import { getMoviePlaylists } from '@/lib/store';
import { Search, Loader2, ChevronLeft, ChevronRight, Film } from 'lucide-react';

const ITEMS_PER_PAGE = 24;

const Movies = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedGroup, setSelectedGroup] = useState('All');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const urls = await getMoviePlaylists();
      const chs = await fetchAllPlaylists(urls);
      setChannels(chs);
      setLoading(false);
    };
    load();
  }, []);

  const groups = useMemo(() => {
    const g = new Set(channels.map((c) => c.group).filter(Boolean));
    return ['All', ...Array.from(g).sort()];
  }, [channels]);

  const filtered = useMemo(() => {
    let result = channels;
    if (selectedGroup !== 'All') result = result.filter((c) => c.group === selectedGroup);
    if (search) result = result.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
    return result;
  }, [channels, search, selectedGroup]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useEffect(() => { setPage(1); }, [search, selectedGroup]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-3">
              <Film className="w-8 h-8 text-primary" />
              Movies
            </h1>
            <p className="text-muted-foreground mt-1">{filtered.length} movies available</p>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search movies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {groups.slice(0, 20).map((g) => (
            <button
              key={g}
              onClick={() => setSelectedGroup(g)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                selectedGroup === g ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-accent'
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Loading movies...</span>
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-20">
            <Film className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No movies found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {paginated.map((ch) => (
                <ChannelCard key={ch.id} channel={ch} type="movie" />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                  className="p-2 rounded-lg border border-input bg-card text-foreground hover:bg-accent disabled:opacity-40 transition-colors">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm text-muted-foreground px-4">Page {page} of {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                  className="p-2 rounded-lg border border-input bg-card text-foreground hover:bg-accent disabled:opacity-40 transition-colors">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
};

export default Movies;
