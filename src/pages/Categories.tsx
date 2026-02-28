import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { fetchAllPlaylists, Channel } from '@/lib/m3u-parser';
import { getTVPlaylists, getMoviePlaylists } from '@/lib/store';
import { Loader2, Tv, Film, ChevronRight, FolderOpen, Search } from 'lucide-react';

interface CategoryGroup {
  name: string;
  count: number;
}

function groupChannels(channels: Channel[]): CategoryGroup[] {
  const map = new Map<string, number>();

  for (const ch of channels) {
    const g = ch.group || 'Uncategorized';
    map.set(g, (map.get(g) || 0) + 1);
  }

  return Array.from(map.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => {
      const aStartsWithNumber = /^[0-9]/.test(a.name);
      const bStartsWithNumber = /^[0-9]/.test(b.name);

      // If one starts with number and the other doesn't
      if (aStartsWithNumber && !bStartsWithNumber) return -1;
      if (!aStartsWithNumber && bStartsWithNumber) return 1;

      // Otherwise sort alphabetically (case-insensitive)
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });
}

const CategoryList = ({ groups, type }: { groups: CategoryGroup[]; type: 'tv' | 'movie' }) => {
  if (groups.length === 0) {
    return (
      <div className="text-center py-16">
        <FolderOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-muted-foreground text-sm">No categories found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {groups.map((g) => (
        <Link
          key={g.name}
          to={`/categories/${type}/${encodeURIComponent(g.name)}`}
          className="card-elevated rounded-lg border border-border p-5 flex items-center justify-between gap-3 group hover:border-primary/40 transition-colors"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              {type === 'tv' ? <Tv className="w-5 h-5 text-primary" /> : <Film className="w-5 h-5 text-primary" />}
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm text-foreground truncate">{g.name}</h3>
              <p className="text-xs text-muted-foreground">{g.count} {type === 'tv' ? 'channels' : 'movies'}</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
        </Link>
      ))}
    </div>
  );
};

const Categories = () => {
  const [tvChannels, setTvChannels] = useState<Channel[]>([]);
  const [movieChannels, setMovieChannels] = useState<Channel[]>([]);
  const [loadingTv, setLoadingTv] = useState(true);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [activeTab, setActiveTab] = useState('tv');
  const [search, setSearch] = useState('');

  useEffect(() => {
    getTVPlaylists().then((urls) => fetchAllPlaylists(urls)).then((chs) => { setTvChannels(chs); setLoadingTv(false); });
    getMoviePlaylists().then((urls) => fetchAllPlaylists(urls)).then((chs) => { setMovieChannels(chs); setLoadingMovies(false); });
  }, []);

  const tvGroups = useMemo(() => groupChannels(tvChannels), [tvChannels]);
  const movieGroups = useMemo(() => groupChannels(movieChannels), [movieChannels]);

  const q = search.toLowerCase();
  const filteredTv = useMemo(() => q ? tvGroups.filter(g => g.name.toLowerCase().includes(q)) : tvGroups, [tvGroups, q]);
  const filteredMovies = useMemo(() => q ? movieGroups.filter(g => g.name.toLowerCase().includes(q)) : movieGroups, [movieGroups, q]);

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold text-foreground mb-6">Categories</h1>

        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="tv" className="gap-2">
              <Tv className="w-4 h-4" /> TV Channels
            </TabsTrigger>
            <TabsTrigger value="movies" className="gap-2">
              <Film className="w-4 h-4" /> Movies
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tv">
            {loadingTv ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground text-sm">Loading TV categories...</span>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-4">{filteredTv.length} categories · {tvChannels.length} total channels</p>
                <CategoryList groups={filteredTv} type="tv" />
              </>
            )}
          </TabsContent>

          <TabsContent value="movies">
            {loadingMovies ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground text-sm">Loading movie categories...</span>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-4">{filteredMovies.length} categories · {movieChannels.length} total movies</p>
                <CategoryList groups={filteredMovies} type="movie" />
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Categories;
