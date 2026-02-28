import Layout from '@/components/Layout';
import { Link } from 'react-router-dom';
import { Tv, Play, Globe, Zap, Film, Radio } from 'lucide-react';

const features = [
  { icon: Tv, title: 'Live TV', desc: 'Watch thousands of live TV channels from around the world in real-time.' },
  { icon: Film, title: 'Movies', desc: 'Stream movies from a curated collection of international films.' },
  { icon: Globe, title: 'Worldwide', desc: 'Channels from Bangladesh, India, Pakistan, USA, and more.' },
  { icon: Zap, title: 'Instant Play', desc: 'No signup, no downloads. Just click and watch instantly.' },
];

const Index = () => {
  return (
    <Layout>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-hero-gradient opacity-5" />
        <div className="container mx-auto px-4 py-20 md:py-32 relative">
          <div className="max-w-3xl mx-auto text-center animate-slide-up">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-medium mb-6">
              <Radio className="w-3.5 h-3.5" />
              Live Streaming
            </div>
            <h1 className="text-4xl md:text-6xl font-display font-bold text-foreground leading-tight mb-6">
              Watch <span className="text-gradient">Live TV</span> From Anywhere in the World
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Stream thousands of live channels and movies for free. No signup required. Your gateway to global entertainment.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/live"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-hero-gradient text-primary-foreground font-semibold text-base hover:opacity-90 transition-opacity"
              >
                <Play className="w-4 h-4" />
                Watch Live TV
              </Link>
              <Link
                to="/movies"
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-secondary text-secondary-foreground font-semibold text-base hover:bg-accent transition-colors"
              >
                <Film className="w-4 h-4" />
                Browse Movies
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-center text-foreground mb-12">
          Why Choose AHCL?
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card-elevated rounded-xl p-6 border border-border text-center">
              <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mx-auto mb-4">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 py-16">
        <div className="bg-hero-gradient rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-display font-bold text-primary-foreground mb-4">
            Ready to Start Watching?
          </h2>
          <p className="text-primary-foreground/80 mb-6 max-w-md mx-auto">
            Jump into thousands of channels right now. Free, fast, and available worldwide.
          </p>
          <Link
            to="/live"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg bg-card text-primary font-semibold hover:bg-card/90 transition-colors"
          >
            <Play className="w-4 h-4" />
            Start Watching
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
