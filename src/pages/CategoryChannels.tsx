import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import ChannelCard from '@/components/ChannelCard';
import { fetchAllPlaylists, Channel } from '@/lib/m3u-parser';
import { getTVPlaylists, getMoviePlaylists } from '@/lib/store';
import { ArrowLeft, ChevronLeft, ChevronRight, Search, Loader2, Tv, Film } from 'lucide-react';

const ITEMS_PER_PAGE = 24;

const CategoryChannels = () => {
  const { type, category } = useParams<{ type: string; category: string }>();
  const isMovie = type === 'movie';
  const categoryName = decodeURIComponent(category || '');

  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const urls = isMovie ? await getMoviePlaylists() : await getTVPlaylists();
      const all = await fetchAllPlaylists(urls);
      setChannels(all.filter((ch) => ch.group === categoryName));
      setLoading(false);
    };
    load();
  }, [isMovie, categoryName]);

  const filtered = useMemo(() => {
    if (!search) return channels;
    return channels.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [channels, search]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useEffect(() => { setPage(1); }, [search]);

  const Icon = isMovie ? Film : Tv;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <Link
          to="/categories"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Categories
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
              <Icon className="w-6 h-6 text-primary" />
              {categoryName}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">{filtered.length} {isMovie ? 'movies' : 'channels'} available</p>
          </div>
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={`Search ${isMovie ? 'movies' : 'channels'}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground text-sm">Loading...</span>
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-16">
            <Icon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">No {isMovie ? 'movies' : 'channels'} found</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {paginated.map((ch) => (
                <ChannelCard key={ch.id} channel={ch} type={isMovie ? 'movie' : 'tv'} />
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

export default CategoryChannels;
