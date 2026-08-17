import type { LangCode } from "@/lib/i18n";

// Translated copy for the sections the user asked to localize: the
// manifesto, the three chapter banner titles, and the three slider
// description paragraphs (their smallest-font body text). Everything else
// (nav labels, "CHAPTER" label, page numbers, the SVG particle effect, the
// English motto under paragraph 3) stays fixed across languages on purpose
// — same convention as the sibling AS studio homepage, which keeps a few
// fixed English/decorative strings untranslated. zh-Hans/en/ja/ko are
// AI-translated from the original zh-Hant copy; "原型" is rendered as
// "プロトタイプ"/"프로토타입" in ja/ko to match that sibling site's existing
// translation convention for the studio's name.
type Localized = Record<LangCode, string>;

export const manifestoHeadlineLines: Record<LangCode, [string, string]> = {
  "zh-Hant": ["如果可以，我們希望把建築與結構都當作設計；", "我們設計建築，也設計它如何站立。"],
  "zh-Hans": ["如果可以，我们希望把建筑与结构都当作设计；", "我们设计建筑，也设计它如何站立。"],
  en: ["If we could, we'd treat both architecture and structure as design;", "we design buildings, and we design how they stand."],
  ja: ["できることなら、建築も構造も、ともにデザインとして捉えたい。", "私たちは建築をデザインし、その立ち方もデザインする。"],
  ko: ["가능하다면, 우리는 건축과 구조를 모두 디자인으로 다루고 싶습니다;", "우리는 건축을 디자인하고, 그것이 어떻게 서 있을지도 디자인합니다."],
};

// Paragraph 3's trailing English motto is fixed across all languages.
export const manifestoMotto = "Architecture is Structure.  Structure is Design.";

export const manifestoParagraphs: Record<LangCode, [string, string, string, string]> = {
  "zh-Hant": [
    "我們相信，建築不只是空間的形塑美學，結構也不只是支撐的技術工學。",
    "建築元素是從一個細部、一根柱、一道牆或屋頂，所形成的點、線、面，乃至整體空間的尺度，原型建築探索材料與構造，更努力創造結構的可能，我們試圖讓每一個必要的工程條件，都成為設計的一部分。",
    "原型建築以建築與結構的交會為起點，從設計思考、材料實驗到構造實踐，重新理解建築如何被創造、被建造，也如何回應真實的生活。",
    "我們不把建築與結構分開思考，因為建築與結構本來就在一起。",
  ],
  "zh-Hans": [
    "我们相信，建筑不只是空间的形塑美学，结构也不只是支撑的技术工学。",
    "建筑元素是从一个细部、一根柱、一道墙或屋顶，所形成的点、线、面，乃至整体空间的尺度，原型建筑探索材料与构造，更努力创造结构的可能，我们试图让每一个必要的工程条件，都成为设计的一部分。",
    "原型建筑以建筑与结构的交会为起点，从设计思考、材料实验到构造实践，重新理解建筑如何被创造、被建造，也如何回应真实的生活。",
    "我们不把建筑与结构分开思考，因为建筑与结构本来就在一起。",
  ],
  en: [
    "We believe architecture is not only the aesthetics of shaping space, and structure is not only the technical engineering of support.",
    "Architectural elements emerge from a single detail — a column, a wall, a roof — forming points, lines, and planes, and ultimately the scale of the whole space. Prototype Architecture explores material and construction, and works to create structural possibility, striving to make every necessary engineering condition part of the design.",
    "Prototype Architecture begins where architecture and structure meet — from design thinking to material experiments to construction, rethinking how buildings are made, built, and lived in.",
    "We don't think of architecture and structure as separate, because architecture and structure were always together.",
  ],
  ja: [
    "私たちは、建築が空間を形づくる美学だけではなく、構造も支持のための技術工学だけではないと信じています。",
    "建築の要素は、一つのディテール、一本の柱、一枚の壁、あるいは屋根から生まれる点・線・面、そして空間全体のスケールへとつながっていきます。プロトタイプ建築は素材と構法を探求し、構造の可能性を創り出そうと努め、必要なあらゆる工学的条件をデザインの一部にしようとしています。",
    "プロトタイプ建築は、建築と構造が出会う地点を出発点とし、デザイン思考から素材実験、構法の実践へと至りながら、建築がどのように創られ、建てられ、そして本当の生活にどう応えるのかを、あらためて理解し直します。",
    "私たちは建築と構造を切り離して考えません。なぜなら、建築と構造は、もともと一つだからです。",
  ],
  ko: [
    "우리는 건축이 공간을 빚어내는 미학만이 아니며, 구조 또한 지탱을 위한 기술 공학만이 아니라고 믿습니다.",
    "건축의 요소는 하나의 디테일, 하나의 기둥, 하나의 벽 또는 지붕에서 시작되어 점·선·면을, 나아가 공간 전체의 스케일을 이룹니다. 프로토타입 건축은 재료와 구법을 탐구하며 구조의 가능성을 만들어내고자 하며, 모든 필수적인 공학적 조건이 디자인의 일부가 되도록 노력합니다.",
    "프로토타입 건축은 건축과 구조가 만나는 지점을 출발점으로 삼아, 디자인 사고에서 재료 실험, 구법 실천에 이르기까지, 건축이 어떻게 창조되고 지어지는지, 그리고 진짜 삶에 어떻게 응답하는지를 다시금 이해합니다.",
    "우리는 건축과 구조를 따로 떼어 생각하지 않습니다. 건축과 구조는 본래부터 함께였기 때문입니다.",
  ],
};

export const chapter01Title: Localized = {
  "zh-Hant": "原型修復",
  "zh-Hans": "原型修复",
  en: "Restoration",
  ja: "プロトタイプ修復",
  ko: "프로토타입 복원",
};

export const chapter02Title: Localized = {
  "zh-Hant": "原型細部",
  "zh-Hans": "原型细部",
  en: "Detail",
  ja: "プロトタイプ細部",
  ko: "프로토타입 세부",
};

export const chapter03Title: Localized = {
  "zh-Hant": "原型展覽",
  "zh-Hans": "原型展览",
  en: "Exhibition",
  ja: "プロトタイプ展覧会",
  ko: "프로토타입 전시",
};

// Slider headings (e.g. "原型修復｜Restoration") already mix Chinese and
// English by design, so only the Chinese half gets translated — and for the
// "en" language specifically, per explicit request, the Chinese half stays
// untranslated (same as zh-Hant) rather than becoming "Restoration｜
// Restoration". The "｜Restoration" suffix itself is fixed English text,
// appended in the markup rather than stored here.
export const restoreSliderLabel: Localized = {
  "zh-Hant": "原型修復",
  "zh-Hans": "原型修复",
  en: "原型修復",
  ja: "プロトタイプ修復",
  ko: "프로토타입 복원",
};

export const detailSliderLabel: Localized = {
  "zh-Hant": "原型細部",
  "zh-Hans": "原型细部",
  en: "原型細部",
  ja: "プロトタイプ細部",
  ko: "프로토타입 세부",
};

export const exhibitSliderLabel: Localized = {
  "zh-Hant": "原型展覽",
  "zh-Hans": "原型展览",
  en: "原型展覽",
  ja: "プロトタイプ展覧会",
  ko: "프로토타입 전시",
};

export const restoreDescription: Localized = {
  "zh-Hant":
    "修復不是把建築恢復成過去，而是理解記憶與時間的意義。從材料、構造、歷史與使用痕跡出發，閱讀留下的時間證據，在保存與更新之間尋找新的可能。不追求表面的「做舊」，而尊重原有構造邏輯，以當代技術回應既有建築的問題。讓老屋不只被保存，而是重新進入生活，讓時間成為設計的一部分。",
  "zh-Hans":
    "修复不是把建筑恢复成过去，而是理解记忆与时间的意义。从材料、构造、历史与使用痕迹出发，阅读留下的时间证据，在保存与更新之间寻找新的可能。不追求表面的「做旧」，而尊重原有构造逻辑，以当代技术回应既有建筑的问题。让老屋不只被保存，而是重新进入生活，让时间成为设计的一部分。",
  en:
    "Restoration isn't about returning a building to its past, but understanding memory and time. From material, construction, and traces of use, we read the time left behind, seeking new possibilities between preservation and renewal — respecting original logic rather than faking age, answering real problems with contemporary technique. An old house should be preserved by re-entering life, so time itself becomes part of the design.",
  ja:
    "修復とは、建築を過去の姿に戻すことではなく、記憶と時間の意味を理解することです。素材・構法・歴史・使用の痕跡から時間の証を読み取り、保存と更新のあいだに新たな可能性を探ります。表面的な「古びた風合い」ではなく、もとの構法の論理を尊重し、現代の技術で既存建築の課題に応えます。古い建物はただ保存されるのではなく、ふたたび生活のなかへ戻り、時間そのものがデザインの一部となるのです。",
  ko:
    "복원은 건축을 과거로 되돌리는 것이 아니라, 기억과 시간의 의미를 이해하는 일입니다. 재료, 구법, 역사, 사용의 흔적에서 시간의 증거를 읽어내고, 보존과 갱신 사이에서 새로운 가능성을 찾습니다. 표면적인 '낡음의 연출' 대신 원래의 구법 논리를 존중하며, 현대적 기술로 기존 건축의 진짜 문제에 응답합니다. 오래된 집은 보존에 그치지 않고 다시 삶 속으로 들어가, 시간 자체가 디자인의 일부가 됩니다.",
};

export const detailDescription: Localized = {
  "zh-Hant":
    "建築真正精華與實踐的地方，往往藏在細部。原型細部關注材料的相接、構件的工作、施工的發生，以及設計如何經得起現場的考驗。從結構、材料、工法與施工順序出發，把微小的節點視為建築設計的重要尺度。以設計方法反覆推敲、現場驗證與工法實驗，讓每一個接點都同時具備性能、邏輯與美感。",
  "zh-Hans":
    "建筑真正精华与实践的地方，往往藏在细部。原型细部关注材料的相接、构件的工作、施工的发生，以及设计如何经得起现场的考验。从结构、材料、工法与施工顺序出发，把微小的节点视为建筑设计的重要尺度。以设计方法反复推敲、现场验证与工法实验，让每一个接点都同时具备性能、逻辑与美感。",
  en:
    "Architecture's true essence often hides in its details. Prototype Detail focuses on how materials meet, how components work, and how design holds up on site. Treating the smallest joint as a key scale of design, we refine it through iteration, on-site verification, and construction experiments — until each joint carries performance, logic, and beauty together.",
  ja:
    "建築の真髄と実践は、しばしばディテールのなかに宿っています。プロトタイプ細部は、素材の取り合い、部材の働き、施工の実際、そしてデザインが現場の試練にどう耐えうるかに注目します。構造・素材・工法・施工の順序から出発し、小さな接合部を建築デザインの重要なスケールとして捉えます。デザイン手法による検討の繰り返し、現場での検証、そして工法の実験を通じて、それぞれの接合部が性能・論理・美しさを同時に備えることを目指します。",
  ko:
    "건축의 진정한 정수와 실천은 종종 디테일 속에 숨어 있습니다. 프로토타입 세부는 재료가 만나는 방식, 부재의 작동, 시공의 실제 과정, 그리고 디자인이 현장의 시험을 어떻게 견뎌내는지에 주목합니다. 구조, 재료, 공법, 시공 순서에서 출발해 작은 접합부를 건축 디자인의 중요한 스케일로 다룹니다. 디자인 방법의 반복적인 검토, 현장 검증, 공법 실험을 통해 모든 접합부가 성능과 논리, 그리고 아름다움을 동시에 갖추도록 합니다.",
};

export const exhibitDescription: Localized = {
  "zh-Hant":
    "展覽是建築離開建築物之後，與更多人對話的方法甚至是無邊界的場域。原型展覽將建築、結構、材料、施工與研究轉化為可以被觀看、理解與參與的內容。我們不只展示完成的作品，也展示設計如何發生、問題如何被解決，以及建築背後那些通常不被看見的工作。透過展覽、出版、講座、模型與空間實驗，將專業知識轉化成公共語言，讓建築不只被建造，也能被討論、被理解，甚至成為下一個設計的原型。",
  "zh-Hans":
    "展览是建筑离开建筑物之后，与更多人对话的方法甚至是无边界的场域。原型展览将建筑、结构、材料、施工与研究转化为可以被观看、理解与参与的内容。我们不只展示完成的作品，也展示设计如何发生、问题如何被解决，以及建筑背后那些通常不被看见的工作。透过展览、出版、讲座、模型与空间实验，将专业知识转化成公共语言，让建筑不只被建造，也能被讨论、被理解，甚至成为下一个设计的原型。",
  en:
    "Exhibition is how architecture, once it leaves the building, speaks to more people — an almost boundless field. Prototype Exhibition turns architecture, structure, and research into content people can view and join. We show not just finished work, but how design happens and problems get solved. Through exhibitions, publications, talks, and models, we turn expertise into public language — so architecture gets built, discussed, and understood, even becoming the prototype for what's next.",
  ja:
    "展覧会とは、建築が建物を離れたのちに、より多くの人々と対話する方法であり、境界のない場でもあります。プロトタイプ展覧会は、建築・構造・素材・研究を、見て、理解し、参加できるコンテンツへと変換します。完成した作品だけでなく、デザインがどう生まれ、課題がどう解決されたかも示します。展覧会・出版・講演・模型・空間実験を通じて専門知識を公共の言葉に翻訳し、建築が語られ、理解され、次のデザインのプロトタイプとなることを目指します。",
  ko:
    "전시는 건축이 건물을 떠난 뒤, 더 많은 사람들과 대화하는 방법이자 경계 없는 영역이 되기도 합니다. 프로토타입 전시는 건축, 구조, 재료, 연구를 보고 이해하고 참여할 수 있는 콘텐츠로 전환합니다. 완성된 작품뿐 아니라 디자인이 어떻게 일어나고 문제가 어떻게 해결되는지도 보여줍니다. 전시, 출판, 강연, 모형, 공간 실험을 통해 전문 지식을 공공의 언어로 바꾸어, 건축이 논의되고 이해되며 다음 디자인의 프로토타입이 되도록 합니다.",
};
