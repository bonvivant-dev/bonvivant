export default function SupportPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Support</h1>
          <p className="text-xl text-gray-600">
            Contact & Legal Information
          </p>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
            Contact Information
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <h3 className="text-sm font-medium text-gray-500">
                  Legal Address
                </h3>
              </div>
              <div className="md:col-span-2">
                <p className="text-base text-gray-900">
                  경상북도 청송군 부남면 부남로 961-40
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <h3 className="text-sm font-medium text-gray-500">
                  Email Address
                </h3>
              </div>
              <div className="md:col-span-2">
                <a
                  href="mailto:bonvivant09.2023@gmail.com"
                  className="text-base text-blue-600 hover:text-blue-800 hover:underline"
                >
                  bonvivant09.2023@gmail.com
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <h3 className="text-sm font-medium text-gray-500">
                  Phone Number
                </h3>
              </div>
              <div className="md:col-span-2">
                <p className="text-base text-gray-900">
                  +33 6 25 30 74 05
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Korea: 010-9798-7314
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Support Information */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
            Customer Support
          </h2>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              For any questions or issues regarding the Bonvivant app,
              purchases, or content, please contact us via email.
            </p>
            <p>
              We aim to respond to all inquiries within 1-2 business days.
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2024 Bonvivant. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
