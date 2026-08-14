import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | Azmar Mandi',
  description: 'Privacy Policy for Azmar Mandi application, detailing data collection, authentication, usage, and user rights.',
};

export default function PrivacyPolicyPage() {
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
        <h1 style={{ fontSize: '32px', color: '#6b0503', marginBottom: '8px' }}>Privacy Policy</h1>
        <p style={{ color: '#786965', fontSize: '14px' }}>Last updated: August 14, 2026</p>
      </header>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', color: '#281412', marginBottom: '12px' }}>1. Introduction</h2>
        <p style={{ color: '#4a3f3d', fontSize: '14px' }}>
          Welcome to <strong>Azmar Mandi</strong> (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;). We respect your privacy and are committed to protecting the personal information you share with us when you use our web application and ordering services. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you sign in via Google, Facebook, Apple, Email, or Mobile OTP.
        </p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', color: '#281412', marginBottom: '12px' }}>2. Information We Collect</h2>
        <p style={{ color: '#4a3f3d', fontSize: '14px', marginBottom: '12px' }}>
          We collect information that you provide directly to us when you create an account or authenticate using third-party identity providers:
        </p>
        <ul style={{ paddingLeft: '24px', color: '#4a3f3d', fontSize: '14px' }}>
          <li style={{ marginBottom: '8px' }}>
            <strong>Google / Facebook / Apple Sign-In:</strong> Your full name, email address, profile picture, and provider user identifier provided via OAuth authentication.
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>Mobile OTP Sign-In:</strong> Your 10-digit mobile phone number for authentication and order updates.
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>Email OTP Sign-In:</strong> Your email address for verification and account access.
          </li>
          <li style={{ marginBottom: '8px' }}>
            <strong>Delivery & Order Information:</strong> Delivery addresses, order history, and contact details required to fulfill your food orders.
          </li>
        </ul>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', color: '#281412', marginBottom: '12px' }}>3. How We Use Your Information</h2>
        <p style={{ color: '#4a3f3d', fontSize: '14px', marginBottom: '12px' }}>
          We use the collected information for the following purposes:
        </p>
        <ul style={{ paddingLeft: '24px', color: '#4a3f3d', fontSize: '14px' }}>
          <li style={{ marginBottom: '8px' }}>To authenticate your identity and maintain your active session.</li>
          <li style={{ marginBottom: '8px' }}>To process, fulfill, and deliver your food orders efficiently.</li>
          <li style={{ marginBottom: '8px' }}>To communicate order updates, digital receipts, and customer support responses.</li>
          <li style={{ marginBottom: '8px' }}>To detect and prevent fraudulent transactions or security incidents.</li>
        </ul>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', color: '#281412', marginBottom: '12px' }}>4. Data Sharing & Third-Party Services</h2>
        <p style={{ color: '#4a3f3d', fontSize: '14px' }}>
          We do not sell, rent, or trade your personal information to third parties. We share data only with essential infrastructure providers required to operate our service (e.g., Supabase for secure database storage and authentication services).
        </p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', color: '#281412', marginBottom: '12px' }}>5. Security of Your Information</h2>
        <p style={{ color: '#4a3f3d', fontSize: '14px' }}>
          We employ industry-standard technical and organizational security measures, including HTTPS encryption and secure database access policies via Supabase, to protect your personal data against unauthorized access, loss, or disclosure.
        </p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', color: '#281412', marginBottom: '12px' }}>6. Data Retention & Account Deletion</h2>
        <p style={{ color: '#4a3f3d', fontSize: '14px', marginBottom: '12px' }}>
          You have the right to request access to or permanent deletion of your personal data at any time.
        </p>
        <p style={{ color: '#4a3f3d', fontSize: '14px' }}>
          To request account or data deletion, please contact us at <a href="mailto:azmarmandi@gmail.com" style={{ color: '#6b0503', fontWeight: 'bold' }}>azmarmandi@gmail.com</a>. Upon verification, your profile and associated data will be permanently removed from our active databases within 30 days.
        </p>
      </section>

      <section style={{ marginBottom: '28px' }}>
        <h2 style={{ fontSize: '20px', color: '#281412', marginBottom: '12px' }}>7. Contact Us</h2>
        <p style={{ color: '#4a3f3d', fontSize: '14px' }}>
          If you have any questions or concerns regarding this Privacy Policy or our privacy practices, please contact us:
        </p>
        <p style={{ color: '#4a3f3d', fontSize: '14px', marginTop: '8px' }}>
          <strong>Azmar Mandi Support</strong><br />
          Email: <a href="mailto:azmarmandi@gmail.com" style={{ color: '#6b0503', fontWeight: 'bold' }}>azmarmandi@gmail.com</a>
        </p>
      </section>
    </main>
  );
}
