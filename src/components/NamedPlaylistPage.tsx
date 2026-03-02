import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Layout from '@/components/Layout';
import ChannelCard from '@/components/ChannelCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { fetchAllPlaylists, Channel } from '@/lib/m3u-parser';
import { getNamedPlaylists, NamedPlaylist } from '@/lib/store';
import { Loader2, ChevronRight, FolderOpen, Search, ChevronLeft, ArrowLeft } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

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
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
}

const ITEMS_PER_PAGE = 24;

interface NamedPlaylistPageProps {
  section: 'adult' | 'others';
  title: string;
  Icon: LucideIcon;
  basePath: string;
}

const NamedPlaylistPage = ({ section, title, Icon, basePath }: NamedPlaylistPageProps) => {
  const [playlists, setPlaylists] = useState<NamedPlaylist[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(false);
  const [search, setSearch] = useState('');
  const [view, setView] = useState<'categories' | 'channels'>('categories');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);

  // Load playlist names
  useEffect(() => {
    getNamedPlaylists(section).then((p) => {
      setPlaylists(p);
      if (p.length > 0) setActiveTab(p[0].name);
      setLoading(false);
    });
  }, [section]);

  // Load channels when tab changes
  useEffect(() => {
    if (!activeTab || playlists.length === 0) return;
    const pl = playlists.find((p) => p.name === activeTab);
    if (!pl) return;
    setLoadingChannels(true);
    setView('categories');
    setSearch('');
    setPage(1);
    fetchAllPlaylists([pl.url]).then((chs) => {
      setChannels(chs);
      setLoadingChannels(false);
    });
  }, [activeTab, playlists]);

  const groups = useMemo(() => groupChannels(channels), [channels]);
  const q = search.toLowerCase();
  const filteredGroups = useMemo(
    () => (q ? groups.filter((g) => g.name.toLowerCase().includes(q)) : groups),
    [groups, q]
  );

  const categoryChannels = useMemo(
    () => channels.filter((ch) => (ch.group || 'Uncategorized') === selectedCategory),
    [channels, selectedCategory]
  );
  const filteredCategoryChannels = useMemo(
    () => (q && view === 'channels' ? categoryChannels.filter((c) => c.name.toLowerCase().includes(q)) : categoryChannels),
    [categoryChannels, q, view]
  );
  const totalPages = Math.ceil(filteredCategoryChannels.length / ITEMS_PER_PAGE);
  const paginated = filteredCategoryChannels.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  useEffect(() => { setPage(1); }, [search]);

  const openCategory = (name: string) => {
    setSelectedCategory(name);
    setView('channels');
    setSearch('');
    setPage(1);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-32">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground text-sm">Loading...</span>
        </div>
      </Layout>
    );
  }

  if (playlists.length === 0) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 text-center">
          <Icon className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h1 className="text-2xl font-display font-bold text-foreground mb-2">{title}</h1>
          <p className="text-muted-foreground">No playlists configured yet. Ask the admin to add some.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-display font-bold text-foreground mb-6 flex items-center gap-3">
          <Icon className="w-7 h-7 text-primary" />
          {title}
        </h1>

        <Tabs value={activeTab} onValueChange={(v) => { setActiveTab(v); setView('categories'); setSearch(''); }}>
          <TabsList className="mb-6 flex-wrap h-auto gap-1">
            {playlists.map((p) => (
              <TabsTrigger key={p.name} value={p.name} className="gap-2">
                <Icon className="w-4 h-4" /> {p.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {playlists.map((p) => (
            <TabsContent key={p.name} value={p.name}>
              {view === 'channels' && (
                <button
                  onClick={() => { setView('categories'); setSearch(''); }}
                  className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-4"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Categories
                </button>
              )}

              {view === 'channels' && (
                <h2 className="text-xl font-display font-bold text-foreground mb-4 flex items-center gap-2">
                  <Icon className="w-5 h-5 text-primary" />
                  {selectedCategory}
                </h2>
              )}

              <div className="relative mb-6 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder={view === 'categories' ? 'Search categories...' : 'Search channels...'}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>

              {loadingChannels ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  <span className="ml-3 text-muted-foreground text-sm">Loading channels...</span>
                </div>
              ) : view === 'categories' ? (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    {filteredGroups.length} categories · {channels.length} total channels
                  </p>
                  {filteredGroups.length === 0 ? (
                    <div className="text-center py-16">
                      <FolderOpen className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">No categories found</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {filteredGroups.map((g) => (
                        <button
                          key={g.name}
                          onClick={() => openCategory(g.name)}
                          className="card-elevated rounded-lg border border-border p-5 flex items-center justify-between gap-3 group hover:border-primary/40 transition-colors text-left w-full"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                              <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-semibold text-sm text-foreground truncate">{g.name}</h3>
                              <p className="text-xs text-muted-foreground">{g.count} channels</p>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground mb-4">
                    {filteredCategoryChannels.length} channels available
                  </p>
                  {paginated.length === 0 ? (
                    <div className="text-center py-16">
                      <Icon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                      <p className="text-muted-foreground text-sm">No channels found</p>
                    </div>
                  ) : (
                    <>
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                        {paginated.map((ch) => (
                          <ChannelCard key={ch.id} channel={ch} type="tv" />
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
                </>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Layout>
  );
};

export default NamedPlaylistPage;
