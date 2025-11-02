export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Bonvivant</h1>
          <p className="text-xl text-gray-600">
            Digital Lifestyle & Culture Magazine
          </p>
        </div>

        {/* Organization Information */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
            Organization Information
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <h3 className="text-sm font-medium text-gray-500">
                  Organization Name
                </h3>
              </div>
              <div className="md:col-span-2">
                <p className="text-base text-gray-900">Bonvivant</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <h3 className="text-sm font-medium text-gray-500">
                  Business Type
                </h3>
              </div>
              <div className="md:col-span-2">
                <p className="text-base text-gray-900">
                  Digital media & cultural content publishing
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <h3 className="text-sm font-medium text-gray-500">
                  Country of Registration
                </h3>
              </div>
              <div className="md:col-span-2">
                <p className="text-base text-gray-900">Republic of Korea</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <h3 className="text-sm font-medium text-gray-500">Address</h3>
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
                  Representative
                </h3>
              </div>
              <div className="md:col-span-2">
                <p className="text-base text-gray-900">
                  Ji Eun Lee (Founder / Editor-in-Chief)
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <h3 className="text-sm font-medium text-gray-500">
                  Contact email
                </h3>
              </div>
              <div className="md:col-span-2">
                <p className="text-base text-gray-900">
                  <a
                    href="mailto:bonvivant09.2023@gmail.com"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    bonvivant09.2023@gmail.com
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* About Bonvivant */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
            About Bonvivant
          </h2>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              Bonvivant is a digital lifestyle and culture magazine founded by
              Ji Eun Lee. It explores themes of everyday aesthetics, travel,
              gastronomy, and art through visually curated photo essays and
              stories.
            </p>
            <p>
              Since its launch, Bonvivant has published multiple seasonal issues
              in digital PDF format and collaborates with various cultural
              institutions, chefs, and designers.
            </p>
          </div>
        </div>

        {/* App Information */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
            Bonvivant App
          </h2>

          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                App name
              </h3>
              <p className="text-gray-700 leading-relaxed">Bonvivant</p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Overview
              </h3>
              <div className="text-gray-700 leading-relaxed">
                The Bonvivant App provides a mobile experience where readers can
                :
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  <li>Purchase and read digital issues</li>
                  <li>Browse archived content by season and theme</li>
                  <li>
                    Enjoy curated multimedia features connected to each magazine
                    issue
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Platform
              </h3>
              <p className="text-gray-700">Android / iOS</p>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">
                Main Features
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>In-app purchase of digital magazine issues</li>
                <li>Offline reading</li>
                <li>Curated visuals and essays</li>
                <li>Browse archived content by season and theme</li>
                <li>Korean language interface</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
            Contact Information
          </h2>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-1">
                <h3 className="text-sm font-medium text-gray-500">
                  General Inquiries
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
                  Press / Partnership
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
