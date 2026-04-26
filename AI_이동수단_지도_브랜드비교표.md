# AI 이동수단 지도 브랜드 비교표

기준일: 2026-04-07

## 이 표의 목적

이 표는 `어떤 AI 툴이 제일 좋다`를 말하려는 표가 아니다.  
먼저 `왜 AI를 쓰는가`, `진짜 필요한 결과는 무엇인가`를 분명히 한 뒤, 그 목적에 맞는 이동수단을 고르기 위한 강의용 비교표다.

이 문서에서 `릴리스`는 우선 `LilysAI`로 이해하고 반영했다.

즉, 비교의 기준은 기능 나열이 아니라 아래 네 가지다.

1. 지금 내 출발지점은 어디인가
2. 내가 진짜 도달해야 할 목표는 무엇인가
3. 이 목표에는 어떤 이동수단이 맞는가
4. 어디까지 AI에 맡기고 어디서 사람이 판단해야 하는가

## 먼저 보는 판단 프레임

| 질문 | 봐야 할 것 |
| --- | --- |
| 왜 AI를 쓰는가 | 속도, 품질, 판단, 협업, 자동화 중 무엇이 목적인가 |
| 진짜 필요한 결과는 무엇인가 | 문서 1개인지, 더 나은 판단인지, 더 빠른 실행인지 |
| 어떤 이동수단이 맞는가 | 일반 LLM, 소스 기반 AI, 딥리서치, Agentic AI, 생성 서비스 중 무엇인가 |
| 사람이 잡아야 할 것은 무엇인가 | 목표 설정, 검증, 보안, 최종 선택, 책임 |

## 브랜드별 이동수단 비교표

아래 표의 `공식 확인 포인트`는 공식 문서 기준이고, `강점/주의점`은 그 기능을 실제 강의와 실무 맥락에 놓고 해석한 내용이다.

| 이동수단 유형 | 대표 브랜드/서비스 | 공식 확인 포인트 | 강점 | 주의점 / 한계 | 가장 잘 맞는 목적 |
| --- | --- | --- | --- | --- | --- |
| 일반 LLM | ChatGPT | 표준 채팅 외에 파일, 앱, deep research 같은 흐름으로 확장 가능 | 구조화, 초안 작성, 질문 다듬기, 범용성 | 근거를 강하게 통제하지 않으면 그럴듯한 답으로 흘러갈 수 있음 | 생각 정리, 초안, 질문 설계, 아이디어 구조화 |
| 일반 LLM | Claude | 웹 검색과 웹 fetch를 통해 최신 정보 접근 가능, citations 제공 | 긴 글 정리, 문서 해석, 차분한 분석형 대화에 강점이 있다는 인상이 강함 | 소스 기반 강제 구조나 사내 협업 연결은 환경에 따라 편차가 큼 | 긴 문서 읽기, 사고 정리, 분석 메모 작성 |
| 일반 LLM | Gemini | Google 생태계와 연결된 활용, Deep Research 및 Workspace 계열 확장 | 검색/웹 흐름과의 연결감, 멀티모달, Workspace 연계 | Google 환경 밖의 업무 체계에서는 체감 차이가 있을 수 있음 | 검색-요약-초안 연결, Google 중심 업무 흐름 |
| 업무형 LLM | Microsoft 365 Copilot Chat | 라이선스가 있으면 web뿐 아니라 work data에도 grounding 가능 | Outlook, Teams, Word, 파일, 회의 맥락과 연결될 때 강함 | Microsoft 365 환경 의존도가 높고, 라이선스/관리자 설정 영향이 큼 | 사내 문서/메일/회의 기반 생산성 향상 |
| 소스 기반 AI | NotebookLM | 사용자가 넣은 소스에 grounded, 인용/브리핑/FAQ/Audio Overview 지원, 웹 소스 발견 기능 존재 | 자료 기반 이해, 출처 추적, 여러 소스 비교, 학습형 활용에 매우 적합 | 소스 품질 이상으로 똑똑해지지 않음, 전략적 최종 판단은 사람이 해야 함 | 기술자료 이해, 교육자료 정리, 회의자료/기사/논문 비교 |
| 딥리서치 | ChatGPT Deep Research | 연구 계획 제안, 웹/업로드 파일/앱 사용, 진행 중 수정 가능, 구조화된 보고서와 citations 제공 | 멀티소스 조사, 보고서형 결과, 조사 과정을 통제하기 좋음 | 빠른 답이 필요할 때는 과할 수 있고, 시간/쿼터/소스 통제가 필요 | 산업 동향 조사, 경쟁사 분석, 기술/시장 리서치 |
| 딥리서치 | Gemini Deep Research | Google 검색 기반으로 상세 보고서 생성에 초점 | 웹 기반 조사와 Google 검색 품질 활용에 유리 | 내부 문서 맥락까지 자연스럽게 묶는 건 별도 환경/연계에 따라 달라짐 | 외부 리서치, 초반 정보 탐색, 폭넓은 자료 수집 |
| 리서치형 LLM | Claude Research / Web Search | 공식 도움말 기준, web search와 research를 구분하며 research는 여러 소스를 종합한 긴 보고서 지향 | 검색과 분석을 대화 흐름 안에서 부드럽게 이어가기 좋음 | 사용 환경과 플랜에 따라 접근성과 체감이 달라질 수 있음 | 최신 정보가 필요한 분석, 링크 기반 검토 |
| 에이전트형 | ChatGPT Agent / Agent Mode 계열 | deep research가 agent mode와 연결되며, 여러 단계 수행과 앱/MCP 연결 확장 | 리서치, 파일, 도구 사용, 단계 실행을 묶기 좋음 | 잘못 설계하면 과자동화 위험, 승인 포인트 설계가 중요 | 여러 단계를 이어야 하는 조사-정리-초안 흐름 |
| 에이전트형 | Microsoft 365 Copilot Agents | 조직 지식/데이터 연결, 반복 업무 자동화, 프로세스 실행 강조 | 사내 업무 프로세스와 연결될 때 설득력이 큼 | 관리자/라이선스/권한 설계가 중요, Microsoft 스택 의존 | 사내 업무 자동화, 팀 생산성, 부서별 보조 에이전트 |
| 에이전트형 | Google Workspace Studio | Workspace 안에서 에이전트를 설계·관리·공유, 자연어로 생성 가능, Workspace 앱과 연결 | 비개발자도 워크플로우형 에이전트를 만들기 쉬운 방향 | Workspace 맥락이 강할수록 유리, 범용 엔터프라이즈 자동화 전체를 대체하진 않음 | Gmail/Drive/Chat 중심 반복 업무 자동화 |
| 생성 서비스 | Stitch | 이 작업 환경 기준으로 화면 생성, 화면 편집, 변형 생성, 디자인 시스템 적용에 초점 | UI 아이디어를 빠르게 시각화하고 방향을 비교하기 좋음 | 제품 전략, 정보 구조, 실제 운영 로직까지 자동으로 해결해주진 않음 | 화면 초안, UI 실험, 빠른 프로토타입 |

## 확장 서비스 포함 비교표

아래 표는 강의 현장에서 자주 질문이 나오는 서비스들을 더 넓게 넣은 버전이다.  
핵심은 여전히 같다. 서비스 이름을 외우는 것이 아니라, `무슨 목적에 어떤 이동수단이 맞는가`를 보는 것이다.

| 서비스 | 범주 | 공식 확인 포인트 | 강한 장면 | 약한 장면 / 주의점 | 강의에서의 한 줄 정의 |
| --- | --- | --- | --- | --- | --- |
| ChatGPT | 범용 LLM + 리서치 + 에이전트 확장 | 채팅, 파일, deep research, 앱 연결 확장 | 범용성, 질문 설계, 초안, 구조화 | 근거 통제가 약하면 그럴듯한 답 소비로 흐를 수 있음 | 가장 넓게 쓸 수 있는 기본 이동수단 |
| Claude | 범용 LLM + 리서치형 | 웹 검색, research, 긴 문서 분석 흐름 | 긴 글 읽기, 문서 해석, 분석 메모 | 워크스페이스 연결성은 환경에 따라 편차 | 차분하게 읽고 생각을 정리하는 분석형 이동수단 |
| Gemini | 범용 LLM + Google 연계 | Google 생태계, Deep Research, Workspace 확장 | 검색-요약-초안 연결, Google 환경 | Google 바깥 업무 체계에서는 체감 차이 가능 | 검색과 작업공간 연결이 강한 이동수단 |
| Microsoft 365 Copilot | 업무형 LLM | 문서, 메일, 회의, 조직 데이터 grounding | Outlook, Teams, Word, 회의 후속 작업 | 라이선스, 권한, 관리자 설정 영향 큼 | Microsoft 조직 안에서 강한 업무형 이동수단 |
| NotebookLM | 소스 기반 AI | 소스 grounded, 인용, 브리핑, FAQ, Audio Overview | 기사, 회의자료, 논문, 기술자료 이해와 비교 | 내가 넣은 자료 이상으로 좋아지진 않음 | 자료를 넣고 생각하게 만드는 선로형 이동수단 |
| LilysAI | 요약 특화 소스 기반 서비스 | YouTube, PDF, 웹 요약, 출처 연결, 다양한 요약 템플릿과 내보내기 | 긴 영상/문서 빠른 이해, 인사이트 노트화 | 깊은 전략 판단이나 복합 워크플로우 설계에는 한계 | 길고 복잡한 자료를 빠르게 읽기 위한 요약형 이동수단 |
| ChatGPT Deep Research | 딥리서치 | 다단계 조사, 파일/웹/앱 사용, 보고서형 결과 | 산업 동향, 경쟁사, 기술·시장 조사 | 빠른 답이 필요한 일엔 과할 수 있음 | 문서화된 조사 결과를 만드는 장거리 이동수단 |
| Gemini Deep Research | 딥리서치 | Google 검색 기반 상세 리서치 보고서 | 외부 정보 탐색과 초반 정리 | 내부 문맥 통합은 별도 환경에 좌우 | 검색 기반 탐사형 이동수단 |
| Notion AI | 워크스페이스형 AI | Enterprise Search, Research Mode, AI Meeting Notes, connectors, 모델 선택 | 조직 지식 검색, 회의 요약, 위키/프로젝트 연결 | Notion 안에 지식이 쌓일수록 강함, 외부 단발 작업엔 과할 수 있음 | 팀 지식을 찾고 연결하는 업무 허브형 이동수단 |
| Canva AI / Magic Studio | 디자인·문서·프레젠테이션 통합 | Magic Studio, design/code/website/video 생성, Brand/Enterprise 제어 | 비디자이너의 빠른 시각화, 브랜드 콘텐츠 생산 | 예쁘게 빨리 만들기 쉬워도 메시지 본질은 사람이 잡아야 함 | 누구나 빨리 만들게 해주는 디자인형 이동수단 |
| Gamma | 프레젠테이션/문서 생성 | 웹 기반 생성, API, 자동 생성 후 편집, 공식 웹 중심 제공 | 빠른 덱 초안, 문서-슬라이드 전환, 가벼운 공유 | 디테일한 브랜드 통제나 고난도 설득 구조는 손이 더 필요 | 빠르게 이야기 구조를 슬라이드로 만드는 덱 생성형 이동수단 |
| Genspark | 프레젠테이션 + 에이전트형 제작 | AI Slides, Docs, Designer, Agentic Engine, .pptx/PDF/Google Slides export | 자료를 넣고 조사-아웃라인-슬라이드까지 한 번에 가기 좋음 | 생성 범위가 넓은 만큼 결과 편차 관리가 필요 | 조사와 슬라이드 생성을 한 흐름으로 묶는 발표형 이동수단 |
| Stitch | 화면/UI 생성 서비스 | 화면 생성, 편집, 변형, 디자인 시스템 적용 | 앱/웹 화면 초안, 인터페이스 방향 탐색 | 서비스 전략과 운영 로직까지 자동 해결하진 않음 | 생각을 빠르게 화면으로 옮기는 UI 이동수단 |
| Midjourney | 이미지 생성 | 웹/Discord 기반, V7, editor, style reference, raw mode, privacy mode | 비주얼 무드, 스타일 탐색, 강한 이미지 퀄리티 | 텍스트 정확성, 문서형 협업, 구조 설계에는 부적합 | 강한 비주얼 감도를 만드는 이미지 창작형 이동수단 |
| Seedance | 영상 생성 | ByteDance Seedance 1.0/2.0, 멀티모달 입력, 멀티샷, 높은 motion 안정성 | 짧은 영상 콘셉트, 모션 중심 데모, 스토리보드형 영상 실험 | 업무 문서나 지식정리에는 맞지 않음, 영상 목적이 분명해야 함 | 움직임과 장면 전환이 중요한 영상형 이동수단 |

## 강의에서 이렇게 설명하면 좋다

### 1. 일반 LLM

- 가장 접근이 쉽다.
- 빠르게 묻고 정리하고 초안을 만드는 데 좋다.
- 하지만 출발지점과 목표가 흐리면 가장 쉽게 `그럴듯한 답변 소비`로 흐른다.

### 2. 소스 기반 AI

- 내가 준 자료를 바탕으로 사고하게 만든다.
- 기술자료, 기사, 회의자료, 논문, 사내 문서처럼 근거가 중요한 환경에서 강하다.
- 반도체·소재·장비 업종에는 특히 중요하다.

### 3. 딥리서치

- 외부 정보를 넓고 깊게 조사할 때 적합하다.
- 빠른 답보다 `문서화된 조사 결과`가 필요할 때 맞다.
- 따라서 짧은 질의응답보다 `보고서형 과제`에 강하다.

### 4. 에이전트형 AI

- 여러 단계를 연결해 수행한다는 점이 핵심이다.
- 단일 답변보다 `리서치 → 비교 → 초안 → 검토` 같은 흐름을 다루는 데 의미가 있다.
- 하지만 목표 정의와 승인 지점이 없으면 과신과 과자동화 위험이 커진다.

### 5. 생성 서비스

- Stitch 같은 서비스는 생각을 빠르게 시각화하는 데 강하다.
- 그러나 시각화가 곧 문제 해결은 아니다.
- 따라서 화면 생성은 빠르게 하되, 목표와 정보 구조, 실제 사용자 행동 설계는 사람이 잡아야 한다.

### 6. 프레젠테이션 생성 서비스

- Gamma와 Genspark는 둘 다 `빨리 발표자료를 만든다`는 점에서는 비슷해 보인다.
- 하지만 Gamma는 빠른 덱 구조화와 웹 기반 편집의 감각이 강하고, Genspark는 조사-아웃라인-슬라이드 생성 흐름을 더 강하게 묶는 방향으로 보인다.
- 따라서 발표자료가 필요한 이유가 `빠른 초안`인지, `자료를 엮은 설득형 덱`인지 먼저 봐야 한다.

### 7. 요약 특화 서비스

- LilysAI 같은 서비스는 범용 LLM과 경쟁한다기보다, `길고 복잡한 소스를 빠르게 이해하는 특화 이동수단`에 가깝다.
- 특히 긴 유튜브, PDF, 웹자료를 빠르게 노트화하고 싶을 때 강하다.
- 다만 이 요약을 바로 의사결정으로 착각하면 안 되고, 중요한 판단은 다시 검토가 필요하다.

### 8. 이미지·영상 생성 서비스

- Midjourney와 Seedance는 둘 다 창작형 생성 서비스지만 목적이 다르다.
- Midjourney는 강한 정지 이미지와 스타일 감도에, Seedance는 움직임과 장면 전환에 더 적합하다.
- 따라서 시각 설득이 필요한지, 영상 모션이 필요한지 먼저 분리해서 봐야 한다.

### 9. 워크스페이스형 AI

- Notion AI와 Canva AI는 단일 모델이라기보다 `일이 이루어지는 공간 안에 AI가 들어간 경우`에 가깝다.
- 이 유형은 개별 답변 품질보다도, 기존 작업 흐름과 얼마나 자연스럽게 붙는지가 훨씬 중요하다.
- 따라서 툴의 똑똑함만 볼 게 아니라 `우리 팀의 일하는 자리 안에 붙는가`를 봐야 한다.

## 강의용 핵심 한 문장

AI를 잘 쓴다는 것은 툴을 많이 아는 것이 아니라,  
출발지점과 목표를 분명히 한 뒤 그 목적에 맞는 이동수단을 적절히 배치할 줄 아는 것이다.

## 강의에서 던지면 좋은 질문

- 지금 이 일에서 진짜 필요한 결과는 무엇입니까
- 이건 문서 하나가 필요한 일입니까, 더 나은 판단이 필요한 일입니까
- 지금은 일반 LLM이면 충분합니까, 아니면 자료 기반 접근이 필요합니까
- 이 일은 딥리서치가 맞습니까, 아니면 빠른 대화형 정리가 맞습니까
- 이 일은 에이전트형으로 연결할 가치가 있습니까, 아니면 사람이 직접 끊어가며 검토하는 편이 더 낫습니까
- 이 일은 덱 생성 서비스가 필요한 일입니까, 아니면 메시지 구조를 먼저 잡아야 하는 일입니까
- 이 일은 이미지/영상이 핵심입니까, 아니면 문서와 판단이 핵심입니까

## 메모

- 위 표의 기능 확인은 2026년 4월 7일 기준 공식 문서와 공식 블로그를 우선 참고했다.
- `강점`, `주의점`, `가장 잘 맞는 목적`은 공식 기능 설명 위에 강의 설계 관점에서 해석한 내용이다.

## 참고 링크

- OpenAI Deep Research: https://openai.com/index/introducing-deep-research/
- OpenAI Help - Deep research in ChatGPT: https://help.openai.com/articles/10500283
- Google Workspace Studio: https://workspace.google.com/blog/product-announcements/introducing-google-workspace-studio-agents-for-everyday-work
- Gemini Deep Research: https://workspace.google.com/blog/ai-and-machine-learning/meet-deep-research-your-new-ai-research-assistant
- NotebookLM 소개: https://blog.google/technology/ai/notebooklm-google-ai/
- NotebookLM Discover Sources: https://blog.google/technology/google-labs/notebooklm-discover-sources/
- Microsoft 365 Copilot Chat grounding: https://support.microsoft.com/en-us/topic/what-can-i-do-with-microsoft-365-copilot-chat-61033adf-484d-45f5-a8c3-b89876963bd8
- Microsoft 365 Copilot agents: https://support.microsoft.com/en-us/topic/using-agents-for-microsoft-365-copilot-169469d7-328d-4d37-9090-bfc2058a39bd
- Microsoft Agent Mode in Word: https://support.microsoft.com/en-us/office/agent-mode-in-word-frontier-647d5d14-eaec-4e8a-a574-7cefffa7f8f0
- Anthropic web search: https://support.anthropic.com/en/articles/10684626-enabling-and-using-web-search
- Anthropic when to use web search, extended thinking, and research: https://support.anthropic.com/en/articles/11095361-when-should-i-use-web-search-extended-thinking-and-research
- LilysAI: https://get.lilys.ai/ko/
- Gamma official access/help: https://help.gamma.app/en/articles/11016450-does-gamma-have-a-mobile-app
- Gamma API docs: https://developers.gamma.app/
- Genspark AI Slides: https://www.genspark.ai/tools/ai-presentation-maker
- Genspark Agentic Engine overview: https://www.genspark.ai/genspark-and-slack
- Canva Magic Studio: https://www.canva.com/magic/
- Notion Enterprise Search: https://www.notion.com/product/enterprise-search
- Notion AI Meeting Notes: https://www.notion.com/help/ai-meeting-notes
- Midjourney docs: https://docs.midjourney.com/hc
- Midjourney Editor: https://docs.midjourney.com/hc/en-us/articles/32764383466893-Full-Editor
- Midjourney Style Reference: https://docs.midjourney.com/hc/en-us/articles/32180011136653-Style-Reference
- Midjourney Privacy: https://docs.midjourney.com/hc/en-us/articles/32019750070669-Stealth-Mode
- ByteDance Seedance: https://seed.bytedance.com/en/seedance
- ByteDance Seedance 2.0 launch: https://seed.bytedance.com/en/blog/official-launch-of-seedance-2-0
