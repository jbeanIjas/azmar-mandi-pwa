import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | Azmar Mandi',
  description: 'Terms of Service for Azmar Mandi application governing use of services, ordering, and accounts.',
};

export default function TermsOfServicePage() {
  return (
    <main style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '40px 20px 80px',
      color: '#281412',
      fontFamily: 'var(--font-poppins), system-ui, sans-serif',
      lineHeight: '1.7',
    }}>
      <header style={{ marginBottom: '32px', borderBottom: '1px solid #eadfd5', paddingBottom: '24px' }}>
        <h1 style={{ fontSize: '32px', color: '#6b0503', marginBottom: '8px' }}>Terms of Service</h1>
        <p style={{ color: '#786965', fontSize: '14px' }}>Last updated: August 14, 2026</p>
      </header>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', color: '#281412', marginBottom: '12px' }}>1. Agreement to Terms</h2>
        <p style={{ color: '#4a3f3d', fontSize: '14px' }}>
          By accessing or using the <strong>Azmar Mandi</strong> website and application (&quot;Services&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you do not agree to these Terms, please do not access or use our Services.
        </p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', color: '#281412', marginBottom: '12px' }}>2. User Accounts & Authentication</h2>
        <p style={{ color: '#4a3f3d', fontSize: '14px', marginBottom: '12px' }}>
          To access certain features, such as placing orders or viewing account details, you may sign in using Google, Facebook, Apple, Email OTP, or Mobile OTP authentication.
        </p>
        <ul style={{ paddingLeft: '24px', color: '#4a3f3d', fontSize: '14px' }}>
          <li style={{ marginBottom: '8px' }}>You are responsible for maintaining the confidentiality of your authentication details and account access.</li>
          <li style={{ marginBottom: '8px' }}>You agree to provide accurate and complete contact information for order fulfillment.</li>
          <li style={{ marginBottom: '8px' }}>You must notify us immediately of any unauthorized use of your account.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', color: '#281412', marginBottom: '12px' }}>3. Ordering & Fulfillment</h2>
        <p style={{ color: '#4a3f3d', fontSize: '14px', marginBottom: '12px' }}>
          All food orders placed through Azmar Mandi are subject to menu availability, delivery area coverage, and order confirmation.
        </p>
        <ul style={{ paddingLeft: '24px', color: '#4a3f3d', fontSize: '14px' }}>
          <li style={{ marginBottom: '8px' }}>Prices and menu availability are subject to change without prior notice.</li>
          <li style={{ marginBottom: '8px' }}>Estimated delivery times are approximations and may vary due to weather, traffic, or preparation time.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', color: '#281412', marginBottom: '12px' }}>4. Intellectual Property</h2>
        <p style={{ color: '#4a3f3d', fontSize: '14px' }}>
          All content, logos, branding, graphics, menu text, and software code related to Azmar Mandi are the intellectual property of Azmar Mandi and protected by applicable copyright, trademark, and intellectual property laws.
        </p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', color: '#281412', marginBottom: '12px' }}>5. Limitation of Liability</h2>
        <p style={{ color: '#4a3f3d', fontSize: '14px' }}>
          To the maximum extent permitted by applicable law, Azmar Mandi shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use of or inability to use the Services.
        </p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', color: '#281412', marginBottom: '12px' }}>6. Termination</h2>
        <p style={{ color: '#4a3f3d', fontSize: '14px' }}>
          We reserve the right to suspend or terminate your access to the Services at our sole discretion, without prior notice, if you breach any provision of these Terms.
        </p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', color: '#281412', marginBottom: '12px' }}>7. Contact Us</h2>
        <p style={{ color: '#4a3f3d', fontSize: '14px' }}>
          If you have any questions regarding these Terms of Service, please contact us:
        </p>
        <p style={{ color: '#4a3f3d', fontSize: '14px', marginTop: '8px' }}>
          <strong>Azmar Mandi Support</strong><br />
          Email: <a href="mailto:azmarmandi@gmail.com" style={{ color: '#6b0503', fontWeight: 'bold' }}>azmarmandi@gmail.com</a>
        </p>
      </section>
    </main>
  );
}
