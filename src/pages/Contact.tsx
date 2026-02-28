import Layout from '@/components/Layout';
import { Mail, MapPin } from 'lucide-react';

const Contact = () => (
  <Layout>
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-3xl font-display font-bold text-foreground mb-6">Contact Us</h1>
      <p className="text-muted-foreground mb-8">Have questions, feedback, or concerns? We'd love to hear from you.</p>
      <div className="grid gap-6 md:grid-cols-2 mb-10">
        <div className="card-elevated rounded-xl border border-border p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Email</h3>
            <p className="text-sm text-muted-foreground">contact@ahcl.com</p>
          </div>
        </div>
        <div className="card-elevated rounded-xl border border-border p-6 flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
            <MapPin className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground mb-1">Location</h3>
            <p className="text-sm text-muted-foreground">Worldwide — Available Everywhere</p>
          </div>
        </div>
      </div>
      <div className="card-elevated rounded-xl border border-border p-6">
        <h2 className="font-display font-semibold text-foreground mb-4">Send a Message</h2>
        <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
          <input placeholder="Your Name" className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm" />
          <input placeholder="Your Email" type="email" className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm" />
          <textarea placeholder="Your Message" rows={5} className="w-full px-4 py-2.5 rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring text-sm resize-none" />
          <button className="px-6 py-2.5 rounded-lg bg-hero-gradient text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
            Send Message
          </button>
        </form>
      </div>
    </div>
  </Layout>
);

export default Contact;
