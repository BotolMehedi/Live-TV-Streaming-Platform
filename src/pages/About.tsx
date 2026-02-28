import Layout from '@/components/Layout';

const About = () => (
  <Layout>
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-3xl font-display font-bold text-foreground mb-6">About Us</h1>
      <div className="prose prose-sm text-muted-foreground space-y-4">
        <p>AHCL is a free live TV streaming platform that brings you thousands of channels from around the world. Our mission is to make live television accessible to everyone, everywhere.</p>
        <p>We aggregate publicly available IPTV playlists and present them in a clean, easy-to-use interface. Whether you're looking for news, sports, entertainment, or movies, AHCL has something for you.</p>
        <h2 className="text-xl font-display font-semibold text-foreground mt-8">Our Vision</h2>
        <p>We believe that access to information and entertainment should be universal. AHCL is built with this vision in mind — providing a seamless streaming experience without signups, subscriptions, or hidden fees.</p>
        <h2 className="text-xl font-display font-semibold text-foreground mt-8">Technology</h2>
        <p>AHCL is built with modern web technologies to ensure fast loading times, smooth playback, and a responsive experience across all devices — from smartphones to smart TVs.</p>
      </div>
    </div>
  </Layout>
);

export default About;
