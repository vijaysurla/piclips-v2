import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Terms and Conditions - 22/7Clips',
  description: 'Terms and Conditions for using 22/7Clips - Please read these terms carefully before using our service.',
}

export default function TermsAndConditions() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">22/7Clips Terms and Conditions</h1>
      <div className="prose max-w-none">
        <p>Effective Date: [Jan 01, 2025]</p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">1. Introduction</h2>
        <p>
          These Terms and Conditions ("Terms") govern your access to and use of the www.piclips.com website and services ("Services"), including any content, features, and functionality offered on or through the Services. By accessing or using the Services, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use the Services.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">2. Use of Services</h2>
        <ul className="list-disc pl-6 mb-4">
          <li><strong>Eligibility:</strong> You must be at least 18 years old to use the Services.</li>
          <li><strong>Account Creation:</strong> You are responsible for maintaining the confidentiality of your account and password. You agree to notify us immediately of any unauthorized use of your account or any other breach of security.</li>
          <li><strong>Acceptable Use:</strong> You agree to use the Services only for lawful purposes and in accordance with these Terms. You may not use the Services:
            <ul className="list-disc pl-6 mt-2">
              <li>To upload, transmit, or distribute any content that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, libelous, invasive of another's privacy, hateful, or racially, ethnically, or otherwise objectionable.</li>
              <li>To upload, transmit, or distribute any content that infringes any intellectual property right, including copyright, patent, trademark, or trade secret.</li>
              <li>To upload, transmit, or distribute any content that contains viruses, malware, or other harmful code.</li>
              <li>To interfere with or disrupt the integrity or performance of the Services.</li>
              <li>To impersonate any person or entity, or falsely claim an affiliation with any person or entity.</li>
              <li>To collect personally identifiable information about other users without their consent.</li>
            </ul>
          </li>
          <li><strong>Third-Party Services:</strong> The Services may contain links to third-party websites and services that are not owned or controlled by us. We are not responsible for the content or availability of any third-party websites or services.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-4">3. Content</h2>
        <ul className="list-disc pl-6 mb-4">
          <li><strong>User Content:</strong> You are solely responsible for the content that you upload, transmit, or distribute through the Services. You grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, adapt, publish, translate, create derivative works from, distribute, and display such content.</li>
          <li><strong>Removal of Content:</strong> We reserve the right to remove any content that violates these Terms or that we believe is objectionable.</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-6 mb-4">4. Intellectual Property</h2>
        <p>
          The Services and all content on the Services, including but not limited to text, images, logos, and software, are protected by copyright, trademark, and other intellectual property laws. You may not use any of our trademarks or logos without our prior written consent.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">5. Disclaimer of Warranties</h2>
        <p>
          THE SERVICES ARE PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE SERVICES WILL BE UNINTERRUPTED, ERROR-FREE, OR SECURE.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">6. Limitation of Liability</h2>
        <p>
          IN NO EVENT SHALL WE BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATING TO YOUR USE OF THE SERVICES, WHETHER BASED ON CONTRACT, TORT (INCLUDING NEGLIGENCE), OR ANY OTHER LEGAL THEORY, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">7. Indemnification</h2>
        <p>
          You agree to indemnify and hold us harmless from any claims, liabilities, damages, and expenses (including attorneys' fees) arising out of or relating to your use of the Services or your violation of these Terms.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">8. Governing Law</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of California.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">9. Dispute Resolution</h2>
        <p>
        Any dispute arising out of or relating to these Terms shall be resolved through 

binding arbitration in accordance with the rules of the American Arbitration Association ("AAA"). The arbitration shall be conducted in Fremont, CA or another mutually agreed-upon location. The arbitrator shall have the power to award any relief that could be awarded in a court of law. The judgment on the award rendered by the arbitrator may be entered in any court of competent jurisdiction.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">10. Changes to these Terms</h2>
        <p>
          We may update these Terms from time to time. We will notify you of any material changes by posting the updated Terms on our website.
        </p>

        <h2 className="text-2xl font-semibold mt-6 mb-4">11. Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us at foaksolutions@gmail.com.
        </p>

        <p className="mt-6 text-sm text-gray-600">
          <em>Disclaimer: These Terms and Conditions are tailored for 22/7Clips. While we strive to ensure their accuracy and compliance, you should consult with an attorney to ensure that these Terms and Conditions comply with all applicable laws and regulations.</em>
        </p>
      </div>
    </div>
  )
}



