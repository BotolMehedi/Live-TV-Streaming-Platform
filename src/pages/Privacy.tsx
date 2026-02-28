import Layout from '@/components/Layout';

const Privacy = () => (
  <Layout>
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-3xl font-display font-bold text-foreground mb-6">Privacy Policy</h1>
      <div className="prose prose-sm text-muted-foreground space-y-4">
        <p><strong className="text-foreground">Last updated:</strong> {new Date().toLocaleDateString()}</p>
        <p>At AHCL, we respect your privacy and are committed to protecting your personal data. This privacy policy explains how we collect, use, and safeguard your information.</p>
        <h2 className="text-xl font-display font-semibold text-foreground mt-8">Information We Collect</h2>
        <p>We do not require user registration or collect personal information. The only data we may collect includes anonymous usage analytics such as page views and general geographic location.</p>
        <h2 className="text-xl font-display font-semibold text-foreground mt-8">Cookies</h2>
        <p>We may use essential cookies to ensure the website functions correctly. We do not use tracking cookies or share data with third parties.</p>
        <h2 className="text-xl font-display font-semibold text-foreground mt-8">Third-Party Services</h2>
        <p>AHCL streams content from publicly available IPTV playlists. We do not host any video content on our servers. All streams are sourced from third-party providers.</p>
        <h2 className="text-xl font-display font-semibold text-foreground mt-8">Changes</h2>
        <p>We may update this policy from time to time. Changes will be posted on this page.</p>
      </div>
    </div>
  </Layout>
);

export default Privacy;
