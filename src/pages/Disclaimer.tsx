import Layout from '@/components/Layout';

const Disclaimer = () => (
  <Layout>
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-3xl font-display font-bold text-foreground mb-6">Disclaimer</h1>
      <div className="prose prose-sm text-muted-foreground space-y-4">
        <p>The information and content provided by AHCL is for general entertainment purposes only.</p>
        <h2 className="text-xl font-display font-semibold text-foreground mt-8">No Hosting</h2>
        <p>AHCL does not host, store, or distribute any video content. All streams are sourced from publicly available M3U playlists found on the internet. We act solely as an aggregator.</p>
        <h2 className="text-xl font-display font-semibold text-foreground mt-8">No Warranty</h2>
        <p>The service is provided "as is" without any warranty of any kind. We do not guarantee that streams will be available, accurate, or uninterrupted.</p>
        <h2 className="text-xl font-display font-semibold text-foreground mt-8">Copyright</h2>
        <p>If you believe that any content accessible through AHCL infringes your copyright, please contact us immediately and we will take appropriate action.</p>
        <h2 className="text-xl font-display font-semibold text-foreground mt-8">Liability</h2>
        <p>AHCL shall not be held liable for any damages arising from the use of this service. Users access streams at their own risk.</p>
      </div>
    </div>
  </Layout>
);

export default Disclaimer;
