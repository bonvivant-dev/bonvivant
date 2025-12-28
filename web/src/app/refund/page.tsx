export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">환불 정책</h1>
          <p className="text-xl text-gray-600">봉비방 (Bonvivant) 앱</p>
          <p className="text-sm text-gray-500 mt-2">
            시행일: 2026년 01월 05일
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              봉비방 앱에서 제공하는 디지털 매거진은 인앱결제(In-App Purchase)를
              통해 구매할 수 있으며, 결제는 Apple App Store 또는 Google Play
              Store를 통해 처리됩니다.
            </p>
            <p>
              본 환불 정책은 봉비방 앱에서 구매한 디지털 콘텐츠에 대한 환불
              기준 및 절차를 안내합니다.
            </p>
          </div>
        </div>

        {/* 디지털 콘텐츠 특성 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
            디지털 콘텐츠의 특성
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              봉비방 앱에서 판매하는 디지털 매거진은 구매 즉시 이용이 가능한
              디지털 콘텐츠입니다. 전자상거래 등에서의 소비자보호에 관한
              법률에 따라, 디지털 콘텐츠는 그 특성상 청약철회가 제한될 수
              있습니다.
            </p>
          </div>
        </div>

        {/* 환불 정책 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
            환불 정책
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              봉비방 앱의 인앱결제는 Apple App Store 및 Google Play Store의
              환불 정책을 따릅니다. 환불 요청은 각 플랫폼을 통해 신청하실 수
              있으며, 환불 승인 여부는 Apple 및 Google의 정책에 따라
              결정됩니다.
            </p>

            <p className="mt-4">
              다음의 경우 서비스 제공자에게 직접 문의하여 환불을 요청하실 수
              있습니다:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>기술적 결함:</strong> 앱의 기술적 문제로 인해 구매한
                콘텐츠를 정상적으로 이용할 수 없는 경우
              </li>
              <li>
                <strong>중복 결제:</strong> 시스템 오류로 인해 동일한 상품이
                중복으로 결제된 경우
              </li>
              <li>
                <strong>오류:</strong> 구매한 상품과 다른 매거진이 제공된
                경우
              </li>
            </ul>

            <p className="mt-4 text-sm bg-gray-50 p-4 rounded">
              <strong>참고:</strong> 디지털 콘텐츠의 특성상, 단순 변심에 의한
              환불은 Apple 및 Google의 정책에 따라 제한될 수 있습니다. 구매
              전 상품 설명 및 미리보기를 충분히 확인해 주시기 바랍니다.
            </p>
          </div>
        </div>

        {/* 환불 신청 방법 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
            환불 신청 방법
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              봉비방 앱의 인앱결제는 Apple App Store 및 Google Play Store를
              통해 처리되므로, 환불은 각 플랫폼의 환불 절차를 따라야 합니다.
            </p>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                1. Apple App Store (iOS)
              </h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  Apple 웹사이트에서 환불 요청:{' '}
                  <a
                    href="https://reportaproblem.apple.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    reportaproblem.apple.com
                  </a>
                </li>
                <li>Apple ID로 로그인</li>
                <li>환불을 원하는 구매 항목 선택</li>
                <li>&quot;문제 신고&quot; 클릭 후 환불 사유 선택</li>
                <li>Apple 고객센터에서 심사 후 환불 여부 결정</li>
              </ul>
              <p className="mt-2 text-sm text-gray-600">
                자세한 내용:{' '}
                <a
                  href="https://support.apple.com/ko-kr/HT204084"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Apple 환불 정책
                </a>
              </p>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">
                2. Google Play Store (Android)
              </h3>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  Google Play 웹사이트에서 환불 요청:{' '}
                  <a
                    href="https://play.google.com/store/account/orderhistory"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    주문 내역
                  </a>
                </li>
                <li>환불을 원하는 구매 항목 찾기</li>
                <li>&quot;환불 요청&quot; 또는 &quot;문제 신고&quot; 선택</li>
                <li>환불 사유 선택 후 제출</li>
                <li>Google 고객센터에서 심사 후 환불 여부 결정</li>
              </ul>
              <p className="mt-2 text-sm text-gray-600">
                자세한 내용:{' '}
                <a
                  href="https://support.google.com/googleplay/answer/2479637"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Google Play 환불 정책
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* 고객 지원 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
            고객 지원
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              환불 관련 문의 또는 기술적 문제로 인한 환불이 필요한 경우, 아래
              이메일로 연락해 주시기 바랍니다:
            </p>
            <p>
              <a
                href="mailto:bonvivant09.2023@gmail.com"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                bonvivant09.2023@gmail.com
              </a>
            </p>
            <p className="mt-4 text-sm text-gray-600">
              문의 시 다음 정보를 함께 보내주시면 빠른 처리가 가능합니다:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4 text-sm text-gray-600">
              <li>구매일시</li>
              <li>구매한 매거진 제목</li>
              <li>결제 영수증 (이메일 또는 스크린샷)</li>
              <li>환불 요청 사유</li>
            </ul>
          </div>
        </div>

        {/* 환불 처리 기간 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
            환불 처리 기간
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              환불 승인 후 실제 환불 처리 기간은 결제 수단 및 플랫폼에 따라
              다릅니다:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>Apple App Store:</strong> 승인 후 영업일 기준 최대
                7~10일
              </li>
              <li>
                <strong>Google Play Store:</strong> 승인 후 영업일 기준 최대
                3~5일
              </li>
            </ul>
            <p className="mt-4 text-sm text-gray-600">
              환불 처리 기간은 각 플랫폼 및 결제 수단 제공자의 정책에 따라 달라질
              수 있습니다.
            </p>
          </div>
        </div>

        {/* 환불 정책 변경 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
            환불 정책의 변경
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              본 환불 정책은 관련 법령 및 서비스 운영 상황에 따라 변경될 수
              있습니다. 변경 사항은 본 페이지에 게시되며, 중요한 변경 사항이
              있는 경우 앱을 통해 별도 안내드립니다.
            </p>
            <p className="font-medium">
              본 환불 정책은 2026년 01월 05일부터 적용됩니다.
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>© 2026 Bonvivant. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
