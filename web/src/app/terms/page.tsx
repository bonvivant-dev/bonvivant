export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            이용약관
          </h1>
          <p className="text-xl text-gray-600">봉비방 (Bonvivant) 앱</p>
          <p className="text-sm text-gray-500 mt-2">
            시행일: 2026년 01월 05일
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              본 이용약관은 이지은(이하 &quot;서비스 제공자&quot;)이(가)
              제공하는 모바일 애플리케이션 봉비방(이하
              &quot;애플리케이션&quot;)에 적용됩니다. 본 애플리케이션은 무료
              서비스로 제공됩니다.
            </p>
            <p>
              애플리케이션을 다운로드하거나 이용함으로써, 사용자는 본
              이용약관에 동의한 것으로 간주됩니다. 애플리케이션을 이용하시기
              전에 본 약관의 내용을 주의 깊게 읽고 충분히 이해하시기를
              권장드립니다.
            </p>
          </div>
        </div>

        {/* 애플리케이션 사용에 관한 제한 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
            애플리케이션 사용에 관한 제한
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              애플리케이션 또는 그 일부, 상표에 대한 무단 복제, 수정은 엄격히
              금지됩니다. 또한 애플리케이션의 소스 코드를 추출하거나, 다른
              언어로 번역하거나, 파생 버전을 제작하는 행위는 허용되지 않습니다.
            </p>
            <p>
              애플리케이션과 관련된 모든 상표권, 저작권, 데이터베이스 권리 및
              기타 지식재산권은 서비스 제공자에게 귀속됩니다.
            </p>
          </div>
        </div>

        {/* 서비스 변경 및 요금 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
            서비스 변경 및 요금
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              서비스 제공자는 애플리케이션을 보다 유익하고 효율적으로 제공하기
              위해, 필요에 따라 애플리케이션을 수정하거나 서비스에 대해 요금을
              부과할 수 있는 권리를 보유합니다. 단, 애플리케이션 또는 서비스
              이용에 요금이 부과되는 경우, 해당 내용은 사용자에게 명확히
              안내됩니다.
            </p>
          </div>
        </div>

        {/* 개인정보 및 보안 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
            개인정보 및 보안
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              본 애플리케이션은 서비스 제공을 위해 사용자가 제공한 개인정보를
              저장 및 처리합니다. 사용자는 본인의 기기 및 애플리케이션 접근에
              대한 보안을 유지할 책임이 있습니다.
            </p>
            <p>
              서비스 제공자는 운영체제에서 허용되지 않은 방식으로 기기를
              변경하는 탈옥(jailbreak) 또는 루팅(rooting)을 권장하지 않습니다.
              이러한 행위는 보안 취약점을 발생시킬 수 있으며, 악성 코드 감염,
              보안 기능 손상 또는 애플리케이션의 정상적인 작동 불가를 초래할 수
              있습니다.
            </p>
          </div>
        </div>

        {/* 제3자 서비스 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
            제3자 서비스
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              본 애플리케이션은 자체적인 이용약관을 가진 제3자 서비스를
              사용합니다. 애플리케이션에서 사용 중인 제3자 서비스는 다음과
              같습니다.
            </p>
            <ul className="list-disc list-inside ml-4">
              <li>
                <a
                  href="https://expo.dev/terms"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Expo
                </a>
              </li>
            </ul>
            <p className="mt-4">
              해당 제3자 서비스의 이용약관은 각 서비스 제공자의 정책을
              따릅니다.
            </p>
          </div>
        </div>

        {/* 인터넷 연결 및 데이터 사용 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
            인터넷 연결 및 데이터 사용
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              애플리케이션의 일부 기능은 Wi-Fi 또는 이동통신 네트워크를 통한
              인터넷 연결이 필요합니다. 서비스 제공자는 인터넷 연결이
              불가능하거나 데이터 사용량 초과로 인해 애플리케이션이 정상적으로
              작동하지 않는 경우에 대해 책임을 지지 않습니다.
            </p>
            <p>
              Wi-Fi 환경이 아닌 곳에서 애플리케이션을 사용할 경우,
              이동통신사와의 계약 조건이 적용되며 데이터 요금 또는 기타 비용이
              발생할 수 있습니다. 해외에서 데이터 로밍을 활성화한 상태로
              애플리케이션을 이용하는 경우 발생하는 요금 역시 사용자의
              책임입니다.
            </p>
            <p>
              기기의 요금 납부자가 사용자가 아닌 경우, 사용자는 요금
              납부자로부터 사용에 대한 허가를 받은 것으로 간주합니다.
            </p>
          </div>
        </div>

        {/* 기기 사용에 대한 책임 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
            기기 사용에 대한 책임
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              서비스 제공자는 사용자의 기기 사용 전반에 대해 책임을 지지
              않습니다. 예를 들어, 기기의 배터리가 방전되어 서비스에 접근할 수
              없는 경우, 이에 대한 책임은 사용자에게 있습니다.
            </p>
          </div>
        </div>

        {/* 서비스 정보의 정확성 및 책임 제한 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
            서비스 정보의 정확성 및 책임 제한
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              서비스 제공자는 애플리케이션의 정보가 항상 최신이고 정확하도록
              노력하지만, 일부 정보는 제3자로부터 제공받아 사용자에게
              전달됩니다. 이로 인해 발생하는 직접적 또는 간접적인 손해에
              대해서 서비스 제공자는 책임을 지지 않습니다.
            </p>
          </div>
        </div>

        {/* 애플리케이션 업데이트 및 서비스 종료 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
            애플리케이션 업데이트 및 서비스 종료
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              서비스 제공자는 필요에 따라 애플리케이션을 업데이트할 수
              있습니다. 운영체제 요구사항이 변경될 수 있으며, 애플리케이션을
              계속 이용하기 위해서는 업데이트가 필요할 수 있습니다.
            </p>
            <p>
              서비스 제공자는 애플리케이션이 항상 특정 운영체제 버전과
              호환되거나 지속적으로 제공될 것을 보장하지 않습니다. 또한, 사전
              고지 없이 애플리케이션 제공을 중단할 수 있습니다.
            </p>
            <p>서비스가 종료되는 경우:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                본 약관에 따라 부여된 모든 권리와 라이선스는 종료되며
              </li>
              <li>
                사용자는 애플리케이션 이용을 중단하고 필요 시 기기에서
                삭제해야 합니다.
              </li>
            </ul>
          </div>
        </div>

        {/* 이용약관의 변경 */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
            이용약관의 변경
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              서비스 제공자는 본 이용약관을 수시로 변경할 수 있습니다. 변경
              사항은 본 페이지에 게시되며, 사용자는 정기적으로 약관을 확인할
              책임이 있습니다.
            </p>
            <p className="font-medium">
              본 이용약관은 2026년 01월 05일부터 적용됩니다.
            </p>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 pb-3 border-b border-gray-200">
            문의하기
          </h2>
          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p>
              이용약관과 관련하여 문의 사항이나 의견이 있으신 경우, 아래
              이메일로 연락해 주시기 바랍니다.
            </p>
            <p>
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
