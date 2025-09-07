export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                Bonvivant 관리자
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                로그인
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96">
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  App Directory로 변경 완료!
                </h2>
                <p className="text-lg text-gray-600 mb-4">
                  이제 Next.js App Router를 사용합니다.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-md p-4 text-left">
                  <h3 className="text-sm font-medium text-green-800 mb-2">
                    변경 사항:
                  </h3>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>• Pages Router → App Router</li>
                    <li>• src/app/layout.tsx 생성</li>
                    <li>• src/app/page.tsx 생성</li>
                    <li>• Tailwind CSS 준비 완료</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
