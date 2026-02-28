import Layout from '@/components/Layout';

const Terms = () => (
  <Layout>
    <div className="container mx-auto px-4 py-16 max-w-3xl">
      <h1 className="text-3xl font-display font-bold text-foreground mb-6">Terms of Service</h1>
      <div className="prose prose-sm text-muted-foreground space-y-4">
        <p><strong className="text-foreground">Last updated:</strong> {new Date().toLocaleDateString()}</p>
        <p>By using AHCL, you agree to these Terms of Service. Please read them carefully.</p>
        <h2 className="text-xl font-display font-semibold text-foreground mt-8">Use of Service</h2>
        <p>AHCL provides access to publicly available live TV streams and movie channels. The service is provided "as is" without any warranties.</p>
        <h2 className="text-xl font-display font-semibold text-foreground mt-8">Content</h2>
        <p>AHCL does not host any video content. All streams are aggregated from publicly available sources. We are not responsible for the content of third-party streams.</p>
        <h2 className="text-xl font-display font-semibold text-foreground mt-8">Limitations</h2>
        <p>We do not guarantee the availability of any channel or stream. Channels may go offline or change without notice.</p>
        <h2 className="text-xl font-display font-semibold text-foreground mt-8">Modifications</h2>
        <p>We reserve the right to modify these terms at any time. Continued use of the service constitutes acceptance of updated terms.</p>
      </div>
    </div>
  </Layout>
);

export default Terms;
