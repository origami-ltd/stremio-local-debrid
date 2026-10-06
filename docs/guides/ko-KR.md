# Stremio Local Debrid — 한국어

컴퓨터가 Stremio 애드온의 토렌트를 다운로드하고 저장한 뒤 로컬 네트워크로 TV에 영상을 전송합니다.

## 이 프로젝트의 목적

느린 TV는 토렌트 다운로드와 영상 재생을 동시에 처리하기 어려울 수 있습니다. Stremio Local Debrid는 다운로드와 저장을 컴퓨터로 옮깁니다. TV는 홈 네트워크에서 HTTP 영상을 받습니다. 유료 클라우드 debrid 계정 없이 직접 캐시를 관리합니다.

## 작동 방식

서버는 설치된 호환 애드온의 설정된 주소를 유지하며 재생 소스를 요청합니다. 토렌트 해시, magnet, .torrent 링크를 로컬 캐시 소스로 바꿉니다. 소스를 선택하면 컴퓨터에서 다운로드가 시작됩니다. 중복 파일은 캐시를 공유하며 트래커를 합칩니다. 직접 영상 링크나 외부 서비스는 변환하지 않습니다.

## 요구 사항

Node.js 24 이상, 충분한 디스크 공간, 같은 연결 가능한 네트워크의 컴퓨터와 TV가 필요합니다. 계정 자동 검색은 macOS의 Stremio 5를 지원합니다. Linux와 Windows는 애드온 목록을 수동으로 지정합니다. Android TV, Google TV, Fire TV가 주 대상입니다. 다른 클라이언트에는 HTTPS와 호환 코덱이 필요할 수 있습니다.

## 서버 설정

npm run setup을 실행하면 config.json을 생성하고 macOS, Linux 또는 Windows에서 시작을 설정합니다. macOS에서는 TV 계정으로 Stremio 5에 로그인하고, Linux/Windows에서는 마법사에 애드온 URL을 입력하세요. --yes는 기본값을 적용하고, --no-service는 설정만 저장하며, --lang은 언어를 선택합니다. 기존 토큰과 다운로드는 유지됩니다.

```sh
git clone https://github.com/origami-ltd/stremio-local-debrid.git
cd stremio-local-debrid
npm ci
npm run setup
```

```sh
npm run setup -- --no-service
npm start
```

## TV 연결

state/status-url.txt의 주소를 열고 언어를 선택하여 Stremio에 설치를 누르거나, 애드온 설치 입력란에 주소를 붙여 넣습니다. 같은 계정의 TV에서 애드온을 새로 고치거나 Stremio를 다시 엽니다. 영화나 에피소드의 로컬 캐시 소스를 선택합니다. 원래 소스는 해당 소스를 여는 기기에서 실행됩니다. 계정 애드온은 60초마다 동기화됩니다.

## 캐시와 재생

플레이어를 닫아도 다운로드는 계속되고 서버를 다시 시작하면 재개됩니다. 선택한 파일만 다운로드합니다. 기본 캐시는 100 GiB이고 10 GiB를 비워 둡니다. 공간이 필요하면 사용 빈도가 낮은 완료된 토렌트부터 삭제합니다. 시작 시간은 피어와 네트워크에 따라 달라집니다. TV가 영상을 디코딩하며 트랜스코딩은 없습니다. 컴퓨터를 켜 두고 연결 가능하게 유지하세요. IP가 바뀌면 baseUrl을 수정하고 애드온을 다시 설치하세요.

## 개인정보와 라이선스

애드온 URL에는 접근 토큰이 있으므로 비공개로 유지하세요. 계정 검색은 기존 로컬 Stremio 프로필을 읽고 세션 키를 공식 API로만 보내며 복사본을 저장하지 않습니다. 애드온 주소는 비공개로 저장됩니다. 미디어 목록이나 원격 측정은 없습니다. BitTorrent 피어는 컴퓨터 IP를 볼 수 있습니다. 이용 권한이 있는 콘텐츠를 사용하세요. MIT-PoU는 자동화 시스템에 사용 기록과 출처 표시를 요구합니다.

[Origami · GitHub](https://github.com/origami-ltd/stremio-local-debrid) · [MIT-PoU](../../LICENSE.md)
