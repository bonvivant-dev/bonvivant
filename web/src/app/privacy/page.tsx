export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            개인정보 처리방침
          </h1>
          <p className="text-xl text-gray-600">봉비방 (Bonvivant) 앱</p>
          <p className="text-sm text-gray-500 mt-2">
            시행일: 2026년 01월 05일
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <p className="text-gray-700 leading-relaxed">
            본 개인정보 처리방침은 이지은(이하 &quot;서비스 제공자&quot;)이
            제작한 모바일 기기용 봉비방 앱(이하 &quot;애플리케이션&quot;)에
            적용됩니다. 본 서비스는 무료 서비스로 제공되며, 있는 그대로
            사용됩니다.
          </p>
        </div>

        {/* Information Collection and Use */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
            개인정보의 수집 및 이용
          </h2>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <h3 className="text-lg font-semibold text-gray-900 mt-4">
              1. 수집하는 개인정보 항목
            </h3>
            <p>
              서비스 제공자는 다음과 같은 개인정보를 수집합니다:
            </p>

            <div className="ml-4">
              <h4 className="font-medium text-gray-900 mt-4">
                가. 회원가입 및 서비스 이용 시
              </h4>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>필수:</strong> 이메일 주소, 비밀번호
                </li>
                <li>
                  <strong>선택:</strong> 닉네임(이름)
                </li>
              </ul>

              <h4 className="font-medium text-gray-900 mt-4">
                나. 결제 및 구매 시
              </h4>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  구매 내역 (구매한 매거진, 구매 일시, 결제 금액, 거래 고유번호)
                </li>
                <li>
                  결제 정보 (Apple/Google을 통한 인앱결제 정보, 영수증 정보)
                </li>
              </ul>

              <h4 className="font-medium text-gray-900 mt-4">
                다. 서비스 이용 과정에서 자동 수집
              </h4>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  기기 정보: 푸시 알림 토큰(Expo Push Token), 기기 유형
                  (iOS/Android)
                </li>
              </ul>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mt-6">
              2. 개인정보의 수집 및 이용 목적
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>회원 가입 및 관리, 본인 확인</li>
              <li>
                디지털 매거진 구매 및 열람 서비스 제공, 구매 내역 관리
              </li>
              <li>결제 및 환불 처리</li>
              <li>새로운 매거진 출시 및 서비스 관련 푸시 알림 발송</li>
              <li>고객 문의 대응 및 서비스 개선</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mt-6">
              3. 수집하지 않는 정보
            </h3>
            <p>
              애플리케이션은 다음 정보를 수집하지 않습니다:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>정확한 위치 정보</li>
              <li>연락처, 사진, 카메라 등 기기 내 저장된 개인정보</li>
            </ul>
          </div>
        </div>

        {/* Third Party Access */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
            제3자 제공
          </h2>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              서비스 제공자는 원칙적으로 사용자의 개인정보를 외부에 제공하지
              않습니다. 다만, 서비스 제공을 위해 다음의 제3자 서비스를
              이용하고 있으며, 각 서비스는 자체 개인정보 처리방침에 따라
              데이터를 처리합니다:
            </p>

            <div className="ml-4">
              <h4 className="font-medium text-gray-900 mt-4">
                이용 중인 제3자 서비스
              </h4>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  Expo (앱 개발 플랫폼, 푸시 알림) -{' '}
                  <a
                    href="https://expo.dev/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline"
                  >
                    개인정보 처리방침
                  </a>
                </li>
                <li>
                  Apple App Store / Google Play Store (인앱결제 처리) - 각
                  플랫폼의 개인정보 처리방침 적용
                </li>
              </ul>
            </div>

            <p className="mt-6">
              다음의 경우에는 법령에 따라 개인정보를 제공할 수 있습니다:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>법령에 특별한 규정이 있는 경우</li>
              <li>
                법원의 명령 또는 수사기관의 요청이 있는 경우 (영장 제시 시)
              </li>
            </ul>
          </div>
        </div>

        {/* Data Retention Policy */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
            개인정보 보유 및 이용기간
          </h2>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              서비스 제공자는 개인정보를 다음과 같이 보유 및 이용합니다:
            </p>

            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>회원 정보:</strong> 회원 탈퇴 시까지 보유하며, 탈퇴
                시 즉시 파기
              </li>
              <li>
                <strong>구매 및 결제 기록:</strong> 전자상거래 등에서의
                소비자보호에 관한 법률에 따라 5년간 보관
              </li>
            </ul>
          </div>
        </div>

        {/* User Rights */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
            정보주체의 권리
          </h2>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>사용자는 다음과 같은 권리를 행사할 수 있습니다:</p>

            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>개인정보 열람 요구:</strong> 본인의 개인정보 열람을
                요구할 수 있습니다
              </li>
              <li>
                <strong>개인정보 정정 요구:</strong> 잘못된 개인정보에 대한
                정정을 요구할 수 있습니다
              </li>
              <li>
                <strong>개인정보 삭제 요구:</strong> 회원 탈퇴 또는 개인정보
                삭제를 요청할 수 있습니다
              </li>
              <li>
                <strong>개인정보 처리 정지 요구:</strong> 개인정보 처리의
                정지를 요구할 수 있습니다
              </li>
            </ul>

            <p className="mt-4">
              위 권리 행사를 원하시면{' '}
              <a
                href="mailto:bonvivant09.2023@gmail.com"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                bonvivant09.2023@gmail.com
              </a>
              으로 문의해 주시기 바랍니다.
            </p>

            <p className="mt-4">
              애플리케이션을 삭제하시면 모든 정보 수집이 중단되며, 앱스토어를
              통해 언제든지 삭제하실 수 있습니다.
            </p>
          </div>
        </div>

        {/* Account Deletion */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
            계정 삭제 방법
          </h2>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p className="font-medium text-lg">
              봉비방 앱 내에서 직접 계정을 삭제할 수 있습니다.
            </p>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 my-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                계정 삭제 단계
              </h3>
              <ol className="list-decimal list-inside space-y-2 ml-2">
                <li>봉비방 앱에 로그인합니다</li>
                <li>화면 상단의 프로필 아이콘을 클릭합니다</li>
                <li>&quot;회원 탈퇴&quot; 버튼을 누릅니다</li>
                <li>확인 창에서 &quot;탈퇴&quot;를 선택하여 계정 삭제를 완료합니다</li>
              </ol>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 mt-6">
              삭제되는 데이터
            </h3>
            <p>계정 삭제 시 다음 데이터가 즉시 삭제됩니다:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>이메일 주소</li>
              <li>비밀번호</li>
              <li>닉네임(이름)</li>
              <li>찜한 매거진 목록</li>
              <li>구독 정보</li>
              <li>푸시 알림 토큰</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mt-6">
              보관되는 데이터
            </h3>
            <p>
              다음 데이터는 법령에 따라 일정 기간 보관됩니다:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>구매 및 결제 기록:</strong> 전자상거래 등에서의
                소비자보호에 관한 법률에 따라 5년간 보관
              </li>
            </ul>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 my-6">
              <p className="font-medium text-yellow-900">
                ⚠️ 중요: 계정 삭제 시 구매한 매거진을 포함한 모든 데이터가
                삭제되며 복구할 수 없습니다.
              </p>
            </div>

            <p className="mt-4">
              계정 삭제와 관련하여 문의사항이 있으시면{' '}
              <a
                href="mailto:bonvivant09.2023@gmail.com"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                bonvivant09.2023@gmail.com
              </a>
              으로 연락해 주시기 바랍니다.
            </p>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
            보안
          </h2>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              서비스 제공자는 귀하의 정보 기밀성 보호에 관심을 기울이고
              있습니다. 서비스 제공자는 처리 및 유지 관리하는 정보를 보호하기
              위해 물리적, 전자적, 절차적 보호 조치를 제공합니다.
            </p>
          </div>
        </div>

        {/* Changes */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
            개인정보 처리방침의 변경
          </h2>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              본 개인정보 처리방침은 어떤 이유로든 수시로 업데이트될 수
              있습니다. 서비스 제공자는 이 페이지를 새로운 개인정보
              처리방침으로 업데이트하여 개인정보 처리방침의 변경 사항을
              알립니다. 계속 사용하는 것은 모든 변경 사항에 대한 승인으로
              간주되므로 변경 사항이 있는지 정기적으로 본 개인정보
              처리방침을 확인하시기 바랍니다.
            </p>

            <p className="font-medium">
              본 개인정보 처리방침은 2026년 01월 05일부터 시행됩니다.
            </p>
          </div>
        </div>

        {/* Your Consent */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
            귀하의 동의
          </h2>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              애플리케이션을 사용함으로써 귀하는 본 개인정보 처리방침 및 향후
              개정될 내용에 명시된 대로 귀하의 정보 처리에 동의하는 것입니다.
            </p>
          </div>
        </div>

        {/* Contact Us */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
            문의
          </h2>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              애플리케이션 사용 중 개인정보 보호와 관련하여 질문이 있거나
              관행에 대해 궁금한 점이 있으시면 이메일로 서비스 제공자에게
              문의해 주시기 바랍니다:{' '}
              <a
                href="mailto:bonvivant09.2023@gmail.com"
                className="text-blue-600 hover:text-blue-800 hover:underline"
              >
                bonvivant09.2023@gmail.com
              </a>
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
