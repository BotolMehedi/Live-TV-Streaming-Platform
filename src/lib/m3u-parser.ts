export interface Channel {
  id: string;
  name: string;
  logo: string;
  group: string;
  url: string;
  tvgId?: string;
  tvgName?: string;
}

export function parseM3U(content: string): Channel[] {
  const lines = content.split('\n').map(l => l.trim()).filter(Boolean);
  const channels: Channel[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('#EXTINF:')) {
      const infoLine = lines[i];
      let streamUrl = '';
      
      // Find the next non-comment line as the URL
      for (let j = i + 1; j < lines.length; j++) {
        if (!lines[j].startsWith('#')) {
          streamUrl = lines[j];
          i = j;
          break;
        }
      }
      
      if (!streamUrl) continue;
      
      const name = infoLine.split(',').pop()?.trim() || 'Unknown';
      const logoMatch = infoLine.match(/tvg-logo="([^"]*)"/);
      const groupMatch = infoLine.match(/group-title="([^"]*)"/);
      const tvgIdMatch = infoLine.match(/tvg-id="([^"]*)"/);
      const tvgNameMatch = infoLine.match(/tvg-name="([^"]*)"/);
      
      channels.push({
        id: `${name}-${channels.length}`.replace(/\s+/g, '-').toLowerCase(),
        name,
        logo: logoMatch?.[1] || '',
        group: groupMatch?.[1] || 'Uncategorized',
        url: streamUrl,
        tvgId: tvgIdMatch?.[1] || '',
        tvgName: tvgNameMatch?.[1] || '',
      });
    }
  }
  
  return channels;
}

export async function fetchAndParsePlaylist(url: string): Promise<Channel[]> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Failed to fetch: ${url}`);
    const text = await response.text();
    return parseM3U(text);
  } catch (error) {
    console.error(`Error fetching playlist ${url}:`, error);
    return [];
  }
}

export async function fetchAllPlaylists(urls: string[]): Promise<Channel[]> {
  const results = await Promise.allSettled(urls.map(fetchAndParsePlaylist));
  const allChannels: Channel[] = [];
  const seen = new Set<string>();
  
  for (const result of results) {
    if (result.status === 'fulfilled') {
      for (const ch of result.value) {
        const key = `${ch.name}-${ch.url}`;
        if (!seen.has(key)) {
          seen.add(key);
          allChannels.push(ch);
        }
      }
    }
  }
  
  return allChannels;
}
