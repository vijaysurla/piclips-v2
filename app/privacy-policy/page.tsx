import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy - 22/7Clips',
  description: 'Privacy Policy for 22/7Clips - Learn how we collect, use, and protect your personal information within our community.',
}

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">22/7Clips Privacy Policy</h1>
      <div className="prose max-w-none">
        <p>Effective Date: [Jan 01, 2025]</p>
        <p>
          This Privacy Policy explains how 22/7Clips (www.piclips.com) collects, uses, and discloses your information when you access or use our website and services ("Services"). As a platform designed for our community, we are committed to protecting your privacy while providing a seamless experience for our users.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">1. Information We Collect</h2>
        
        <h3 className="text-xl font-semibold mt-4 mb-2">Information You Provide:</h3>
        <ul className="list-disc pl-6 mb-4">
          <li><strong>Account Information:</strong> When you create an account, we may collect information such as your username, email address, and password.</li>
          <li><strong>Video Uploads:</strong> If you upload videos, we collect the video file itself, any metadata associated with the video (e.g., title, description, tags), and any comments or messages you post.</li>
          <li><strong>Profile Information:</strong> You may choose to provide additional information in your profile, such as your name, location, and a profile picture.</li>
        </ul>

        <h3 className="text-xl font-semibold mt-4 mb-2">Information We Automatically Collect:</h3>
        <ul className="list-disc pl-6 mb-4">
          <li><strong>Usage Information:</strong> When you use our Services, we automatically collect information about your interactions with our website, such as your IP address, browser type, device information, and the pages you visit.</li>
          <li><strong>Cookies and Similar Technologies:</strong> We use cookies and similar technologies to collect information about your browsing behavior and preferences.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-4">2. How We Use Your Information</h2>
        <p>We may use your information for the following purposes:</p>
        <ul className="list-disc pl-6 mb-4">
          <li><strong>Provide and Improve our Services:</strong> To provide, maintain, and improve our Services, including to process and deliver videos, respond to your requests, and personalize your experience within our community.</li>
          <li><strong>Communicate with You:</strong> To send you notifications, updates, and marketing communications related to 22/7Clips and our ecosystem.</li>
          <li><strong>Analyze and Improve our Services:</strong> To analyze user behavior and improve the functionality and performance of our Services for our users.</li>
          <li><strong>Protect our Rights and Interests:</strong> To detect, prevent, and address fraud, security, and technical issues within the 22/7Clips platform.</li>
          <li><strong>Comply with Legal Obligations:</strong> To comply with applicable laws and regulations.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-4">3. Sharing Your Information</h2>
        <p>We may share your information with the following third parties:</p>
        <ul className="list-disc pl-6 mb-4">
          <li><strong>Service Providers:</strong> We may share your information with third-party service providers who assist us in providing our Services, such as hosting providers, payment processors, and customer support providers.</li>
          <li><strong>Business Partners:</strong> We may share your information with business partners within our ecosystem who offer complementary products or services.</li>
          <li><strong>Legal and Safety:</strong> We may disclose your information to law enforcement or other authorities if we believe it is necessary to comply with a legal obligation, to protect and defend our rights or property, or to protect the safety of our users or the public.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-4">4. Data Security</h2>
        <p>
          We take reasonable measures to protect your information from unauthorized access, use, and disclosure. However, no method of transmission over the internet or method of electronic storage is completely secure.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">5. Your Choices</h2>
        <p>You have certain choices regarding your information:</p>
        <ul className="list-disc pl-6 mb-4">
          <li><strong>Account Settings:</strong> You can access and update your account information and privacy settings in your account settings.</li>
          <li><strong>Cookies:</strong> You can control cookies through your browser settings.</li>
          <li><strong>Opt-Out:</strong> You can opt-out of receiving marketing communications from us by following the instructions in the communication.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-4">6. Children's Privacy</h2>
        <p>
          Our Services are not intended for children under the age of 13. We do not knowingly collect personal information from children under 13.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">7. Changes to this Privacy Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the updated policy on our website.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">8. Decentralization and Data Handling</h2>
        <p>
          22/7Clips aims to leverage decentralized technologies where possible. This may affect how your data is stored and processed. We are committed to transparency in our data handling practices and will update this policy as our use of decentralized technologies evolves.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">9. Community Guidelines</h2>
        <p>
          This Privacy Policy should be read in conjunction with our Community Guidelines, which outline acceptable use of the 22/7Clips platform and user conduct within our community. Adherence to these guidelines is essential for maintaining a safe and positive environment for all users.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">10. Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, please contact us at foaksolutions@gmail.com.
        </p>

        <p className="mt-6 text-sm text-gray-600">
          <em>Disclaimer: This privacy policy is tailored for 22/7Clips and our community. While we strive to ensure its accuracy and compliance, you should consult with an attorney to ensure that this privacy policy complies with all applicable laws and regulations.</em>
        </p>
      </div>
    </div>
  )
}



