/**
 * 長庚中藥群島 (CGMH Herbal Archipelago) — 核心教學與業務資料庫
 * 資料依據：《中醫藥劑部人員及業務介紹(含各院區主管人員).pptx》
 * 架構依據：REA 逆向分析「政策島」(https://puma.taipei/heart-island) 之 3D 六角微縮城市與協作線架構
 * 空間排列：依台灣縣市地理分布由北而南排列（基隆 → 台北 → 新北 → 桃園［含部務室］→ 台中 → 雲林 → 嘉義 → 高雄）
 */
window.CGMH_TCM_ARCHIPELAGO_DATA = {
  meta: {
    title: "長庚中藥群島",
    subtitle: "長庚醫療財團法人 中醫藥劑部｜13 座台灣縣市微縮島群",
    sourcePptx: "中醫藥劑部人員及業務介紹(含各院區主管人員).pptx",
    architectureRef: "https://puma.taipei/heart-island (HEART 政策島 REA 架構)",
    islandCount: 13,
    buildingCount: 54,
    flowCount: 8,
    organization: {
      root: "長庚醫療財團法人 中醫藥劑部",
      units: [
        {
          id: "hq",
          name: "部務室（位於桃園）",
          members: ["陳立偉", "陳貴福", "黃馨瑀", "邱秀麗", "林昀珊"],
          desc: "體系中藥業務綜理、採購請購、藥品資料維護、品管抽驗、總倉存量管制、內部稽核、會議、教育訓練與績效處理中樞。"
        },
        {
          id: "taoyuan_div",
          name: "桃園中藥科（轄北・中・雲嘉共 9 院區）",
          campuses: ["基隆", "情人湖", "台北", "土城", "林口", "桃園", "大里仁愛", "雲林", "嘉義"],
          desc: "涵蓋基隆市、台北市、新北市、桃園市、台中市、雲林縣、嘉義縣共 9 座院區之中藥臨床調劑與藥事照護。"
        },
        {
          id: "kaohsiung_div",
          name: "高雄中藥科（轄南區共 3 院區）",
          campuses: ["高雄", "鳳山", "大同"],
          desc: "涵蓋高雄市鳥松（高雄長庚）、鳳山、前金（大同）共 3 座院區之南台灣中藥臨床藥事與品管教研。"
        }
      ]
    }
  },

  // =========================================================================
  // 部務室五位核心人員職掌資料庫 (依據 PPTX 第 2–8 頁)
  // =========================================================================
  hqStaff: [
    {
      id: "chen_li_wei",
      name: "陳立偉",
      role: "北院區業務綜理",
      badgeColor: "#db6a41",
      glbModel: "HospitalDirector.glb",
      slideNo: 3,
      categories: ["整體綜理"],
      summary: "綜理北院區中藥局各項業務，統籌跨院區資源協調與臨床藥事運作。",
      duties: [
        "綜理北院區中藥局各項業務",
        "統籌北區各院區（基隆、情人湖、台北、土城、林口、桃園等）中藥藥事服務品質與人力調度",
        "督導跨院區中藥業務標準化與整體發展方針"
      ]
    },
    {
      id: "chen_gui_fu",
      name: "陳貴福",
      role: "採購製劑・飲片資料・績效與行政",
      badgeColor: "#b8920f",
      glbModel: "Accountant.glb",
      slideNo: 4,
      categories: ["採購請購", "藥品資料維護", "績效處理"],
      summary: "負責藥品請購、中藥製劑、體系飲片資料維護、醫令與自費績效、部門網頁及行政考勤管理。",
      duties: [
        "藥品請購案件作業",
        "中藥製劑相關業務",
        "體系飲片類藥品資料維護",
        "醫令系統、體系績效及自費品項績效處理",
        "部門網頁維護",
        "部門內行政、考勤、管理等業務",
        "處理體系內中藥相關業務"
      ]
    },
    {
      id: "huang_xin_yu",
      name: "黃馨瑀",
      role: "新藥資料・稽核會議・藥師進階・績效報告",
      badgeColor: "#3e7c8c",
      glbModel: "ItEngineer.glb",
      slideNo: 5,
      categories: ["藥品資料維護", "稽核、報告與會議", "教育訓練", "績效處理"],
      summary: "負責院區新藥申請與條碼範本維護、醫令績效與工作報告、年度內部稽核、藥事會議及藥師專業進階 P 認證。",
      duties: [
        "【新藥與資料維護】院區新藥申請、開檔審核；中藥範本及條碼藥品資料維護",
        "【績效與報告】醫令系統、體系績效及自費品項績效處理；中醫藥劑部相關工作報告",
        "【內部稽核】年度規劃、報告送呈、院區提報、實際查核；材料滯存表彙總；工作規範修訂、整合",
        "【會議事宜】部務業務共識及中藥藥事小組等各類會議",
        "【藥師進階】藥師專業進階作業及 P 認證事宜（通知、溝通、初審、彙總、證書與公告製作）"
      ]
    },
    {
      id: "qiu_xiu_li",
      name: "邱秀麗",
      role: "品管抽驗・馬兜鈴酸檢驗・科中採購",
      badgeColor: "#5e9a6f",
      glbModel: "Pharmacist.glb",
      slideNo: 6,
      categories: ["品管抽驗", "採購請購"],
      summary: "負責中藥抽驗、濃縮製劑馬兜鈴酸抽驗、對抗品評估、異常事件與不良品分析，以及科中藥品採購品管。",
      duties: [
        "中藥藥品抽驗作業",
        "中藥濃縮製劑馬兜鈴酸抽驗作業",
        "對抗品評估作業",
        "異常事件檢驗及分析",
        "中藥不良品評估與匯整分析",
        "科中藥品採購及品管作業"
      ]
    },
    {
      id: "lin_yun_shan",
      name: "林昀珊",
      role: "總倉管理・存量管制・請購收費・教育訓練",
      badgeColor: "#7e57c2",
      glbModel: "StockClerk.glb",
      slideNo: 7,
      categories: ["倉儲與存量管制", "採購請購", "教育訓練"],
      summary: "負責總倉藥品管理、體系藥品存量管制（訂單、倉儲、調撥）、藥品請購、收費標準維護與教育訓練規劃督導。",
      duties: [
        "總倉藥品管理",
        "體系藥品存量管制（藥品訂單處理、倉儲管理、調撥等）",
        "體系藥品請購作業",
        "收費標準設定與維護",
        "中藥相關教育訓練課程規劃與業務督導"
      ]
    }
  ],

  // =========================================================================
  // 八大業務分工協作線 (依據 PPTX 第 8 頁「業務分工總覽」)
  // =========================================================================
  flows: [
    {
      id: "F1",
      code: "F1",
      category: "整體綜理",
      owner: "陳立偉",
      color: "#db6a41",
      walkerRole: "director",
      carryLabel: "綜理方針",
      from: "headquarters",
      targets: ["keelung", "loverlake", "taipei", "tucheng", "linkou", "taoyuan"],
      title: "F1｜整體綜理：陳立偉綜理北院區中藥局各項業務",
      desc: "由桃園部務室陳立偉統籌綜理北院區（基隆、情人湖、台北、土城、林口、桃園）中藥局各項臨床與行政業務。"
    },
    {
      id: "F2",
      code: "F2",
      category: "採購請購",
      owner: "陳貴福、林昀珊、邱秀麗（科中藥品採購）",
      color: "#d99b26",
      walkerRole: "procurement",
      carryLabel: "採購請購單",
      from: "headquarters",
      targets: ["linkou", "taoyuan", "taipei", "chiayi", "kaohsiung"],
      title: "F2｜採購請購：陳貴福、林昀珊、邱秀麗（科中採購）三軌協同",
      desc: "結合陳貴福（藥品請購案件）、林昀珊（體系藥品請購作業）與邱秀麗（科中藥品採購及品管），確保全體系藥源穩定。"
    },
    {
      id: "F3",
      code: "F3",
      category: "藥品資料維護",
      owner: "陳貴福、黃馨瑀",
      color: "#3e7c8c",
      walkerRole: "data_admin",
      carryLabel: "條碼與藥品檔",
      from: "headquarters",
      targets: ["taipei", "tucheng", "linkou", "dali", "kaohsiung", "datong"],
      title: "F3｜藥品資料維護：陳貴福（飲片資料）× 黃馨瑀（新藥／範本／條碼）",
      desc: "陳貴福維護體系飲片類藥品資料，黃馨瑀負責院區新藥申請、開檔審核、中藥範本及條碼藥品資料維護。"
    },
    {
      id: "F4",
      code: "F4",
      category: "品管抽驗",
      owner: "邱秀麗",
      color: "#5e9a6f",
      walkerRole: "qc_pharmacist",
      carryLabel: "馬兜鈴酸檢驗箱",
      from: "headquarters",
      targets: ["loverlake", "linkou", "taoyuan", "yunlin", "kaohsiung", "datong"],
      title: "F4｜品管抽驗：邱秀麗把關馬兜鈴酸抽驗、對抗品與不良品分析",
      desc: "執行中藥藥品抽驗、濃縮製劑馬兜鈴酸抽驗、對抗品評估、異常事件檢驗分析及不良品匯整分析。"
    },
    {
      id: "F5",
      code: "F5",
      category: "倉儲與存量管制",
      owner: "林昀珊",
      color: "#7e57c2",
      walkerRole: "warehouse",
      carryLabel: "總倉調撥箱",
      from: "headquarters",
      targets: ["keelung", "taoyuan", "yunlin", "chiayi", "fengshan"],
      title: "F5｜倉儲與存量管制：林昀珊總倉管理與跨院訂單調撥",
      desc: "由林昀珊統籌總倉藥品管理、體系藥品存量管制（訂單處理、倉儲管理、調撥）與收費標準設定維護。"
    },
    {
      id: "F6",
      code: "F6",
      category: "稽核、報告與會議",
      owner: "黃馨瑀",
      color: "#c75b7a",
      walkerRole: "auditor",
      carryLabel: "稽核查核表",
      from: "headquarters",
      targets: ["tucheng", "linkou", "dali", "chiayi", "kaohsiung", "datong"],
      title: "F6｜稽核、報告與會議：黃馨瑀推動內部稽核、滯存表與藥事會議",
      desc: "涵蓋年度內部稽核（規劃、送呈、提報、查核）、材料滯存表彙總、工作規範修訂整合、部務工作報告與中藥藥事小組會議。"
    },
    {
      id: "F7",
      code: "F7",
      category: "教育訓練",
      owner: "林昀珊、黃馨瑀（藥師進階）",
      color: "#2a9d8f",
      walkerRole: "educator",
      carryLabel: "P認證與教案",
      from: "headquarters",
      targets: ["taipei", "linkou", "chiayi", "kaohsiung"],
      title: "F7｜教育訓練：林昀珊（課程規劃督導）× 黃馨瑀（藥師進階 P 認證）",
      desc: "林昀珊規劃與督導中藥相關教育訓練課程，黃馨瑀辦理藥師專業進階作業及 P 認證（通知、初審、彙總、證書公告）。"
    },
    {
      id: "F8",
      code: "F8",
      category: "績效處理",
      owner: "陳貴福、黃馨瑀",
      color: "#e07a5f",
      walkerRole: "analyst",
      carryLabel: "醫令績效報表",
      from: "headquarters",
      targets: ["keelung", "taipei", "linkou", "taoyuan", "kaohsiung", "fengshan"],
      title: "F8｜績效處理：陳貴福 × 黃馨瑀協同處理醫令系統與體系／自費績效",
      desc: "共同處理醫令系統、體系績效及自費品項績效統計分析，支援各院區經營決策與部門行政管理。"
    }
  ],

  // =========================================================================
  // 13 座島嶼詳細資料 (依台灣縣市由北而南排列，部務室位於桃園中心 (0,0))
  // =========================================================================
  islands: [
    // -----------------------------------------------------------------------
    // 01. 基隆院區島 (基隆市安樂區麥金路)
    // -----------------------------------------------------------------------
    {
      id: "keelung",
      index: "01",
      name: "基隆院區島",
      shortName: "基隆院區",
      county: "基隆市",
      region: "north",
      regionLabel: "北北基院區群",
      division: "桃園中藥科",
      supervisor: "藍煒皓",
      supervisorTitle: "基隆＋情人湖院區 中藥科主管",
      q: 2,
      r: -3,
      ground: "boardwalk",
      cliffTone: "transport",
      ringTint: 0x9fc7cf,
      icon: "⚓",
      landmark: "雨都海港中藥門診樓 ＆ 防潮恆溫飲片倉",
      summary: "位於台灣東北端基隆港畔，由藍煒皓主管帶領（兼轄情人湖院區），守護基隆與東北角民眾之中醫門診調劑、海港防潮藥庫管理與用藥安全。",
      glbModels: [
        { file: "characters/Pharmacist.glb", label: "藍煒皓主管團隊藥師", role: "pharmacist", offset: [0.85, -0.55], scale: 0.52, clip: "Idle" },
        { file: "nature/TreeMed001.glb", label: "海港防風林", role: "prop", offset: [-1.1, -0.75], scale: 0.45 },
        { file: "animals/Eagle.glb", label: "基隆港黑鳶", role: "animal", offset: [1.1, 0.85], scale: 0.35 }
      ],
      outline: [
        {
          title: "一、院區定位與主管編制",
          points: [
            "隸屬部門：長庚醫療財團法人中醫藥劑部 — 桃園中藥科轄區",
            "院區主管：藍煒皓（同時綜理【基隆院區】與【情人湖院區】兩院區中藥業務）",
            "地理區位：基隆市安樂區（台灣最北端海港門戶島嶼，與情人湖院區相鄰成雙星聯防）"
          ]
        },
        {
          title: "二、核心藥事服務與院區特色",
          points: [
            "門診科學中藥與傳統飲片精準調劑、雙人覆核與發藥衛教",
            "針對基隆多雨高濕氣候，落實飲片與科學中藥「防潮恆溫除濕倉儲管理」",
            "串聯部務室林昀珊總倉存量管制（F5）與黃馨瑀條碼藥品資料維護（F3），確保條碼檢核零差錯"
          ]
        }
      ],
      buildings: [
        {
          id: "keelung-clinic",
          pin: "①",
          name: "基隆門診中藥調劑局",
          kind: "hospital",
          owner: "藍煒皓（院區主管）",
          lx: -0.35,
          lz: -0.35,
          size: 0.95,
          flows: ["F1", "F8"],
          desc: "藍煒皓主管駐點領軍之海港門診中藥局，提供東北角鄉親高效率科學中藥與飲片調劑服務。"
        },
        {
          id: "keelung-storage",
          pin: "②",
          name: "海港防潮恆溫中藥庫",
          kind: "warehouse",
          owner: "藍煒皓 × 林昀珊（總倉存量管制）",
          lx: 0.72,
          lz: -0.25,
          size: 0.68,
          flows: ["F5"],
          desc: "因應雨都氣候設置之高規除濕防潮藥庫，連線桃園總倉進行藥品訂單與存量調撥。"
        },
        {
          id: "keelung-barcode",
          pin: "③",
          name: "條碼藥品檢核工作站",
          kind: "computer",
          owner: "藍煒皓 × 黃馨瑀（條碼資料維護）",
          lx: -0.55,
          lz: 0.68,
          size: 0.62,
          flows: ["F3"],
          desc: "導入部務室維護之中藥範本與條碼藥品資料，執行調劑掃描防錯與新藥開檔同步。"
        },
        {
          id: "keelung-pier",
          pin: "④",
          name: "基情雙院聯防調撥棧",
          kind: "bridge",
          owner: "藍煒皓（基隆＋情人湖共管）",
          lx: 0.58,
          lz: 0.72,
          size: 0.6,
          flows: ["F1", "F5"],
          desc: "連結基隆本院與情人湖院區之跨院區藥品支援與人力協作樞紐。"
        }
      ],
      quiz: {
        q: "請問長庚中醫藥劑部中，同時負責「基隆院區」與「情人湖院區」的中藥科主管為哪一位？",
        options: ["藍煒皓", "謝建欣", "周佳玉", "劉賢德"],
        answer: 0,
        explanation: "依據簡報第 2 頁「部務室人員及各院區中藥科主管」，基隆＋情人湖院區主管為藍煒皓。"
      }
    },

    // -----------------------------------------------------------------------
    // 02. 情人湖院區島 (基隆市安樂區基金一路)
    // -----------------------------------------------------------------------
    {
      id: "loverlake",
      index: "02",
      name: "情人湖院區島",
      shortName: "情人湖",
      county: "基隆市",
      region: "north",
      regionLabel: "北北基院區群",
      division: "桃園中藥科",
      supervisor: "藍煒皓",
      supervisorTitle: "基隆＋情人湖院區 中藥科主管",
      q: 1,
      r: -3,
      ground: "garden",
      cliffTone: "forest",
      ringTint: 0xa9cfa8,
      icon: "🏞️",
      landmark: "情人湖畔療癒中藥館 ＆ 代客煎藥製劑坊",
      summary: "坐落於基隆情人湖山林綠意之間，與基隆院區同由藍煒皓主管統籌，結合腫瘤、慢病與高齡照護，提供溫馨細膩的中醫藥事與代客煎藥服務。",
      glbModels: [
        { file: "characters/WardNurse.glb", label: "情人湖中藥衛教人員", role: "nurse", offset: [0.8, -0.4], scale: 0.5, clip: "Idle" },
        { file: "nature/TreeHigh001.glb", label: "情人湖環湖松林", role: "prop", offset: [-1.05, -0.6], scale: 0.48 },
        { file: "animals/BlueSwan.glb", label: "情人湖水鳥", role: "animal", offset: [-0.85, 0.85], scale: 0.35 }
      ],
      outline: [
        {
          title: "一、院區定位與主管編制",
          points: [
            "隸屬部門：中醫藥劑部 — 桃園中藥科轄區",
            "院區主管：藍煒皓（基隆＋情人湖雙院區共同主管）",
            "地理區位：基隆市安樂區情人湖畔（台灣北端西側山海療癒島嶼）"
          ]
        },
        {
          title: "二、核心藥事服務與部務室協作",
          points: [
            "慢性病、腫瘤輔助治療與高齡長者之中醫門診會診藥事照護",
            "配合陳貴福中藥製劑業務（F2）與邱秀麗中藥藥品抽驗／不良品評估（F4），確保煎劑與濃縮製劑品質",
            "與基隆本院共享藥品安全庫存與教育訓練資源"
          ]
        }
      ],
      buildings: [
        {
          id: "loverlake-care",
          pin: "①",
          name: "情人湖中藥照護主館",
          kind: "loopgarden",
          owner: "藍煒皓（院區主管）",
          lx: -0.3,
          lz: -0.35,
          size: 0.92,
          flows: ["F1"],
          desc: "融合環湖綠意之溫暖中藥局，提供慢性病與住院會診病患貼心中藥調劑。"
        },
        {
          id: "loverlake-decoct",
          pin: "②",
          name: "湖畔養生煎藥與製劑坊",
          kind: "herb_lab",
          owner: "藍煒皓 × 陳貴福（中藥製劑業務）",
          lx: 0.72,
          lz: -0.25,
          size: 0.66,
          flows: ["F2"],
          desc: "遵循體系中藥製劑標準作業，提供高品質代客煎藥與傳統飲片調配。"
        },
        {
          id: "loverlake-counsel",
          pin: "③",
          name: "高齡中西藥交互作用諮詢亭",
          kind: "counsel",
          owner: "情人湖臨床中藥師團隊",
          lx: -0.58,
          lz: 0.65,
          size: 0.6,
          flows: ["F1", "F7"],
          desc: "為長者與多重用藥病患解說中藥服用時機及中西藥併用安全。"
        },
        {
          id: "loverlake-qc",
          pin: "④",
          name: "院區藥品抽驗與對抗品哨",
          kind: "qc_station",
          owner: "藍煒皓 × 邱秀麗（品管抽驗）",
          lx: 0.58,
          lz: 0.68,
          size: 0.6,
          flows: ["F4"],
          desc: "配合部務室邱秀麗執行中藥藥品抽驗、對抗品評估與不良品回報。"
        }
      ],
      quiz: {
        q: "情人湖院區在長庚中醫藥劑部組織架構（簡報第 1 頁）中隸屬於哪一個中藥科？",
        options: ["桃園中藥科", "高雄中藥科", "台北中藥科", "獨立直屬科"],
        answer: 0,
        explanation: "依據簡報第 1 頁組織架構圖，基隆、情人湖、台北、林口、桃園、土城、大里仁愛、嘉義、雲林均隸屬於「桃園中藥科」。"
      }
    },

    // -----------------------------------------------------------------------
    // 03. 台北院區島 (台北市松山區敦化北路)
    // -----------------------------------------------------------------------
    {
      id: "taipei",
      index: "03",
      name: "台北院區島",
      shortName: "台北院區",
      county: "台北市",
      region: "north",
      regionLabel: "北北基院區群",
      division: "桃園中藥科",
      supervisor: "謝建欣",
      supervisorTitle: "台北院區 中藥科主管",
      q: 1,
      r: -2,
      ground: "granite",
      cliffTone: "civil",
      ringTint: 0xe3d3b8,
      icon: "🏙️",
      landmark: "台北都會中藥門診大樓 ＆ 自費養生精品中心",
      summary: "坐落於台北市松山區核心地段，由謝建欣主管領航，服務大台北高流量門診病患，結合高速條碼調劑、自費養生品項管理與臨床藥師進階培訓。",
      glbModels: [
        { file: "characters/WhiteCoatDoctor.glb", label: "謝建欣主管團隊", role: "doctor", offset: [0.85, -0.45], scale: 0.52, clip: "Idle" },
        { file: "characters/GrandmaShopper.glb", label: "台北門診領藥市民", role: "citizen", offset: [-0.9, 0.75], scale: 0.48, clip: "Walk" },
        { file: "nature/TreeLow001.glb", label: "敦化林蔭行道樹", role: "prop", offset: [-1.05, -0.65], scale: 0.44 }
      ],
      outline: [
        {
          title: "一、院區定位與主管編制",
          points: [
            "隸屬部門：中醫藥劑部 — 桃園中藥科轄區",
            "院區主管：謝建欣（台北院區中藥科主管）",
            "地理區位：台北市松山區（緊鄰基隆／情人湖與新北土城、桃園林口，居台北盆地核心）"
          ]
        },
        {
          title: "二、核心藥事服務與部務室協作",
          points: [
            "都會區高門診量科學中藥、飲片與自費養生茶飲／膏方之快速精準調劑",
            "配合陳貴福與黃馨瑀處理「醫令系統、體系績效及自費品項績效處理」（F8）與新藥條碼維護（F3）",
            "落實林昀珊教育訓練課程規劃與黃馨瑀藥師專業進階 P 認證制度（F7）"
          ]
        }
      ],
      buildings: [
        {
          id: "taipei-main",
          pin: "①",
          name: "台北都會中藥門診大樓",
          kind: "cityhall",
          owner: "謝建欣（院區主管）",
          lx: -0.32,
          lz: -0.38,
          size: 0.98,
          flows: ["F1", "F8"],
          desc: "謝建欣主管主持之台北長庚中藥局主館，以雙翼玻璃帷幕與暖色木質調展現都會醫療效率。"
        },
        {
          id: "taipei-dispense",
          pin: "②",
          name: "高速智慧條碼調劑台",
          kind: "computer",
          owner: "謝建欣 × 黃馨瑀（中藥範本與條碼維護）",
          lx: 0.75,
          lz: -0.25,
          size: 0.66,
          flows: ["F3"],
          desc: "結合醫令系統與條碼藥品資料，在高門診量下維持快速候藥與調劑安全。"
        },
        {
          id: "taipei-selfpay",
          pin: "③",
          name: "自費中藥精品與績效站",
          kind: "shop",
          owner: "謝建欣 × 陳貴福・黃馨瑀（自費品項績效）",
          lx: -0.58,
          lz: 0.66,
          size: 0.64,
          flows: ["F2", "F8"],
          desc: "提供都會上班族與市民特色自費中藥養生品項，並與部務室同步收費標準與自費績效統計。"
        },
        {
          id: "taipei-edu",
          pin: "④",
          name: "都會臨床藥師 P 認證學堂",
          kind: "classroom",
          owner: "謝建欣 × 林昀珊・黃馨瑀（教育訓練與進階）",
          lx: 0.58,
          lz: 0.68,
          size: 0.62,
          flows: ["F7"],
          desc: "執行中藥教育訓練課程與藥師專業進階（P 認證）臨床實務考核。"
        }
      ],
      quiz: {
        q: "請問「台北院區」的中藥科主管為哪一位？",
        options: ["謝建欣", "藍煒皓", "周佳玉", "董維軒"],
        answer: 0,
        explanation: "依據簡報第 2 頁「部務室人員及各院區中藥科主管」，台北院區主管為謝建欣。"
      }
    },

    // -----------------------------------------------------------------------
    // 04. 土城院區島 (新北市土城區金城路)
    // -----------------------------------------------------------------------
    {
      id: "tucheng",
      index: "04",
      name: "土城院區島",
      shortName: "土城院區",
      county: "新北市",
      region: "north",
      regionLabel: "北北基院區群",
      division: "桃園中藥科",
      supervisor: "劉賢德",
      supervisorTitle: "土城院區 中藥科主管",
      q: 0,
      r: -2,
      ground: "softpad",
      cliffTone: "family",
      ringTint: 0xf2d2d6,
      icon: "🏥",
      landmark: "土城智慧中藥大樓 ＆ 數位條碼藥櫃中心",
      summary: "位於新北市土城區（新北市立土城醫院），由劉賢德主管主持，打造現代化智慧中藥調劑流程、條碼藥櫃防錯與新北社區中西醫整合藥事服務。",
      glbModels: [
        { file: "characters/Pharmacist.glb", label: "劉賢德主管團隊藥師", role: "pharmacist", offset: [0.82, -0.45], scale: 0.52, clip: "Idle" },
        { file: "nature/TreeLow002.glb", label: "土城桐花公園綠樹", role: "prop", offset: [-1.05, -0.55], scale: 0.45 },
        { file: "animals/Swallowtail.glb", label: "土城山林鳳蝶", role: "animal", offset: [-0.8, 0.85], scale: 0.3 }
      ],
      outline: [
        {
          title: "一、院區定位與主管編制",
          points: [
            "隸屬部門：中醫藥劑部 — 桃園中藥科轄區",
            "院區主管：劉賢德（土城院區中藥科主管）",
            "地理區位：新北市土城區（位於台北盆地西南側，銜接台北市與桃園林口台地）"
          ]
        },
        {
          title: "二、核心藥事服務與部務室協作",
          points: [
            "智慧化門診與住院中藥調劑作業，全面導入黃馨瑀維護之中藥範本與條碼藥品資料（F3）",
            "配合部務室年度內部稽核、材料滯存表彙總與工作規範修訂整合（F6）",
            "由陳立偉綜理北院區業務支援（F1），提供土城、板橋、樹林、三峽民眾優質中醫藥照護"
          ]
        }
      ],
      buildings: [
        {
          id: "tucheng-main",
          pin: "①",
          name: "土城智慧中藥局主館",
          kind: "hospital",
          owner: "劉賢德（院區主管）",
          lx: -0.32,
          lz: -0.35,
          size: 0.95,
          flows: ["F1"],
          desc: "劉賢德主管領軍之新北市立土城醫院中藥局，具備完善動線與現代化調劑設備。"
        },
        {
          id: "tucheng-smartcab",
          pin: "②",
          name: "數位條碼與新藥開檔站",
          kind: "aipod",
          owner: "劉賢德 × 黃馨瑀（新藥與條碼維護）",
          lx: 0.74,
          lz: -0.25,
          size: 0.66,
          flows: ["F3"],
          desc: "即時同步院區新藥申請、開檔審核結果與條碼藥品資料庫。"
        },
        {
          id: "tucheng-audit",
          pin: "③",
          name: "內部稽核與滯存管理室",
          kind: "admin",
          owner: "劉賢德 × 黃馨瑀（內部稽核與滯存彙總）",
          lx: -0.58,
          lz: 0.66,
          size: 0.62,
          flows: ["F6"],
          desc: "執行年度內部稽核院區提報、材料滯存表盤點與工作規範標準化。"
        },
        {
          id: "tucheng-community",
          pin: "④",
          name: "新北社區中藥用藥諮詢亭",
          kind: "kiosk",
          owner: "土城臨床中藥師團隊",
          lx: 0.58,
          lz: 0.68,
          size: 0.6,
          flows: ["F1", "F7"],
          desc: "提供社區家庭與長者中藥煎服法、保存方式與用藥安全衛教。"
        }
      ],
      quiz: {
        q: "請問新北市「土城院區」的中藥科主管為哪一位？",
        options: ["劉賢德", "王仕雯", "董維軒", "蔡盈億"],
        answer: 0,
        explanation: "依據簡報第 2 頁，土城院區中藥科主管為劉賢德。"
      }
    },

    // -----------------------------------------------------------------------
    // 05. 林口院區島 (桃園市龜山區復興街 — 緊鄰桃園部務室)
    // -----------------------------------------------------------------------
    {
      id: "linkou",
      index: "05",
      name: "林口院區島",
      shortName: "林口院區",
      county: "桃園市",
      region: "taoyuan",
      regionLabel: "桃園核心樞紐群",
      division: "桃園中藥科",
      supervisor: "周佳玉",
      supervisorTitle: "林口院區 中藥科主管",
      q: 0,
      r: -1,
      ground: "lawn",
      cliffTone: "institute",
      ringTint: 0xbfd6df,
      icon: "🏛️",
      landmark: "林口醫學中心中藥旗艦館 ＆ 臨床藥事教研圓頂",
      summary: "坐落於桃園市龜山區林口台地，由周佳玉主管統籌，為長庚體系旗艦醫學中心中藥重鎮，緊鄰桃園部務室，承擔急重症會診、新藥審核、科中品管與 P 認證臨床培訓。",
      glbModels: [
        { file: "characters/WhiteCoatDoctor.glb", label: "周佳玉主管團隊", role: "doctor", offset: [0.85, -0.45], scale: 0.54, clip: "Idle" },
        { file: "characters/WardPatient.glb", label: "林口門診候藥民眾", role: "citizen", offset: [-0.88, 0.78], scale: 0.48, clip: "Idle" },
        { file: "nature/TreeHigh002.glb", label: "林口台地樟樹", role: "prop", offset: [-1.1, -0.6], scale: 0.48 }
      ],
      outline: [
        {
          title: "一、院區定位與主管編制",
          points: [
            "隸屬部門：中醫藥劑部 — 桃園中藥科轄區",
            "院區主管：周佳玉（林口院區中藥科主管）",
            "地理區位：桃園市龜山區（與【部務室】及【桃園院區】共同構成桃園黃金三角核心群）"
          ]
        },
        {
          title: "二、核心藥事服務與部務室協作",
          points: [
            "醫學中心大規模門診調劑、西醫住院會診中醫調劑與臨床藥事照護",
            "密切配合部務室陳立偉（北院區綜理 F1）、陳貴福（採購製劑／飲片資料／績效 F2, F3, F8）、黃馨瑀（新藥審核／藥事小組會議／P 認證 F3, F6, F7）、邱秀麗（科中採購品管／抽驗 F2, F4）"
          ]
        }
      ],
      buildings: [
        {
          id: "linkou-flagship",
          pin: "①",
          name: "林口醫學中心中藥旗艦館",
          kind: "researchdome",
          owner: "周佳玉（院區主管）",
          lx: -0.35,
          lz: -0.38,
          size: 1.02,
          flows: ["F1", "F8"],
          desc: "周佳玉主管統籌之醫學中心中藥本部，支援高複雜度中西醫結合臨床調劑與教學研究。"
        },
        {
          id: "linkou-newdrug",
          pin: "②",
          name: "新藥審核與藥事小組會報廳",
          kind: "meeting",
          owner: "周佳玉 × 黃馨瑀（新藥審核・藥事會議）",
          lx: 0.76,
          lz: -0.26,
          size: 0.68,
          flows: ["F3", "F6"],
          desc: "辦理院區新藥申請、開檔審核及中藥藥事小組共識會議之核心議事場域。"
        },
        {
          id: "linkou-qc",
          pin: "③",
          name: "科中採購與對抗品品管室",
          kind: "qc_station",
          owner: "周佳玉 × 邱秀麗（科中採購及品管）",
          lx: -0.58,
          lz: 0.68,
          size: 0.64,
          flows: ["F2", "F4"],
          desc: "配合邱秀麗執行科學中藥採購品管、馬兜鈴酸抽驗與對抗品評估。"
        },
        {
          id: "linkou-pcert",
          pin: "④",
          name: "藥師專業進階 P 認證基地",
          kind: "podium",
          owner: "周佳玉 × 林昀珊・黃馨瑀（教育訓練・P認證）",
          lx: 0.6,
          lz: 0.7,
          size: 0.64,
          flows: ["F7"],
          desc: "培育中藥師專業進階（P 認證初審、彙總、實務訓練）與新進藥師之標竿基地。"
        }
      ],
      quiz: {
        q: "請問長庚醫學中心「林口院區」的中藥科主管為哪一位？",
        options: ["周佳玉", "董維軒", "陳立偉", "謝建欣"],
        answer: 0,
        explanation: "依據簡報第 2 頁，林口院區中藥科主管為周佳玉。"
      }
    },

    // -----------------------------------------------------------------------
    // 06. 部務室中樞島 (位於桃園 — 全群島座標中心 (0, 0))
    // -----------------------------------------------------------------------
    {
      id: "headquarters",
      index: "06",
      name: "部務室中樞島（桃園）",
      shortName: "部務室（桃園）",
      county: "桃園市",
      region: "taoyuan",
      regionLabel: "桃園核心樞紐群",
      division: "中醫藥劑部 部務室",
      supervisor: "陳立偉、陳貴福、黃馨瑀、邱秀麗、林昀珊",
      supervisorTitle: "中醫藥劑部 部務室五人核心團隊",
      q: 0,
      r: 0,
      ground: "courtyard",
      cliffTone: "hakka",
      ringTint: 0xfcea8b,
      icon: "⭐",
      landmark: "中醫藥劑部部務室總部殿堂 ＆ 八大業務協作星環",
      summary: "座落於桃園市核心樞紐（座標 0,0），匯聚部務室五位核心人員：陳立偉、陳貴福、黃馨瑀、邱秀麗、林昀珊，統籌全體系「整體綜理、採購請購、藥品資料維護、品管抽驗、倉儲與存量管制、稽核報告與會議、教育訓練、績效處理」八大業務分工！",
      glbModels: [
        { file: "characters/HospitalDirector.glb", label: "陳立偉（北院區綜理）", role: "director", offset: [0.0, -0.95], scale: 0.56, clip: "Idle" },
        { file: "characters/Accountant.glb", label: "陳貴福（請購・製劑・飲片・績效）", role: "staff", offset: [-1.05, -0.15], scale: 0.5, clip: "Idle" },
        { file: "characters/ItEngineer.glb", label: "黃馨瑀（新藥・稽核・會議・進階）", role: "staff", offset: [1.05, -0.15], scale: 0.5, clip: "Idle" },
        { file: "characters/Pharmacist.glb", label: "邱秀麗（品管抽驗・馬兜鈴酸・科中）", role: "staff", offset: [-0.85, 0.92], scale: 0.5, clip: "Idle" },
        { file: "characters/StockClerk.glb", label: "林昀珊（總倉・存量・收費・教訓）", role: "staff", offset: [0.85, 0.92], scale: 0.5, clip: "Idle" }
      ],
      outline: [
        {
          title: "一、部務室定位與編制（簡報第 1–2 頁）",
          points: [
            "隸屬層級：長庚醫療財團法人 中醫藥劑部直屬核心樞紐（位於桃園）",
            "部務室成員（共 5 人）：陳立偉、陳貴福、黃馨瑀、邱秀麗、林昀珊",
            "雙科協同：向下連結「桃園中藥科」（9 院區）與「高雄中藥科」（3 院區），串聯全台 12 院區"
          ]
        },
        {
          title: "二、五位部務室人員個人專責業務（簡報第 3–7 頁）",
          points: [
            "【陳立偉（P.3）】綜理北院區中藥局各項業務",
            "【陳貴福（P.4）】① 藥品請購案件作業 ② 中藥製劑相關業務 ③ 體系飲片類藥品資料維護 ④ 醫令系統、體系績效及自費品項績效處理 ⑤ 部門網頁維護 ⑥ 部門內行政、考勤、管理等業務 ⑦ 處理體系內中藥相關業務",
            "【黃馨瑀（P.5）】① 新藥與資料維護（院區新藥申請、開檔審核；中藥範本及條碼藥品資料維護）② 績效與報告（醫令系統、體系績效及自費品項績效處理；中醫藥劑部相關工作報告）③ 內部稽核（年度規劃、報告送呈、院區提報、實際查核；材料滯存表彙總；工作規範修訂、整合）④ 會議事宜（部務業務共識及中藥藥事小組等各類會議）⑤ 藥師進階（藥師專業進階作業及 P 認證事宜：通知、溝通、初審、彙總、證書與公告製作）",
            "【邱秀麗（P.6）】① 中藥藥品抽驗作業 ② 中藥濃縮製劑馬兜鈴酸抽驗作業 ③ 對抗品評估作業 ④ 異常事件檢驗及分析 ⑤ 中藥不良品評估與匯整分析 ⑥ 科中藥品採購及品管作業",
            "【林昀珊（P.7）】① 總倉藥品管理 ② 體系藥品存量管制（藥品訂單處理、倉儲管理、調撥等）③ 體系藥品請購作業 ④ 收費標準設定與維護 ⑤ 中藥相關教育訓練課程規劃與業務督導"
          ]
        },
        {
          title: "三、八大業務分工總覽（簡報第 8 頁）",
          points: [
            "1. 整體綜理：陳立偉",
            "2. 採購請購：陳貴福、林昀珊、邱秀麗（科中藥品採購）",
            "3. 藥品資料維護：陳貴福、黃馨瑀",
            "4. 品管抽驗：邱秀麗",
            "5. 倉儲與存量管制：林昀珊",
            "6. 稽核、報告與會議：黃馨瑀",
            "7. 教育訓練：林昀珊、黃馨瑀（藥師進階）",
            "8. 績效處理：陳貴福、黃馨瑀"
          ]
        }
      ],
      buildings: [
        {
          id: "hq-chen-li-wei",
          pin: "①",
          name: "北院區業務綜理指揮塔（陳立偉）",
          kind: "clocktower",
          owner: "陳立偉（整體綜理）",
          lx: 0.0,
          lz: -0.68,
          size: 0.96,
          flows: ["F1"],
          desc: "【簡報 P.3】陳立偉：綜理北院區中藥局各項業務，坐鎮桃園部務室統籌北區院區運作。"
        },
        {
          id: "hq-chen-gui-fu",
          pin: "②",
          name: "請購製劑與行政資訊館（陳貴福）",
          kind: "cityhall",
          owner: "陳貴福（採購・製劑・飲片資料・績效・行政）",
          lx: -0.82,
          lz: -0.18,
          size: 0.78,
          flows: ["F2", "F3", "F8"],
          desc: "【簡報 P.4】陳貴福：負責藥品請購案件作業、中藥製劑相關業務、體系飲片類藥品資料維護、醫令系統／體系績效及自費品項績效處理、部門網頁維護、部門內行政／考勤／管理及體系內中藥相關業務。"
        },
        {
          id: "hq-huang-xin-yu",
          pin: "③",
          name: "新藥稽核與藥師進階中心（黃馨瑀）",
          kind: "childcenter",
          owner: "黃馨瑀（新藥資料・績效報告・內稽・會議・進階）",
          lx: 0.82,
          lz: -0.18,
          size: 0.78,
          flows: ["F3", "F6", "F7", "F8"],
          desc: "【簡報 P.5】黃馨瑀：負責新藥申請與開檔審核、中藥範本及條碼資料維護；醫令與自費績效及部務工作報告；年度內部稽核、材料滯存表彙總、工作規範修訂整合；部務共識與中藥藥事小組會議；藥師專業進階作業及 P 認證事宜。"
        },
        {
          id: "hq-qiu-xiu-li",
          pin: "④",
          name: "品管抽驗與馬兜鈴酸檢驗所（邱秀麗）",
          kind: "qc_station",
          owner: "邱秀麗（品管抽驗・馬兜鈴酸・科中採購）",
          lx: -0.68,
          lz: 0.68,
          size: 0.76,
          flows: ["F2", "F4"],
          desc: "【簡報 P.6】邱秀麗：負責中藥藥品抽驗作業、中藥濃縮製劑馬兜鈴酸抽驗作業、對抗品評估作業、異常事件檢驗及分析、中藥不良品評估與匯整分析、科中藥品採購及品管作業。"
        },
        {
          id: "hq-lin-yun-shan",
          pin: "⑤",
          name: "總倉存量與教育訓練中心（林昀珊）",
          kind: "warehouse",
          owner: "林昀珊（總倉・存量管制・請購・收費・教訓）",
          lx: 0.68,
          lz: 0.68,
          size: 0.76,
          flows: ["F2", "F5", "F7"],
          desc: "【簡報 P.7】林昀珊：負責總倉藥品管理、體系藥品存量管制（訂單處理、倉儲管理、調撥等）、體系藥品請購作業、收費標準設定與維護、中藥相關教育訓練課程規劃與業務督導。"
        },
        {
          id: "hq-matrix-hub",
          pin: "⑥",
          name: "八大業務分工協作星環（全體部務室）",
          kind: "infinityforum",
          owner: "陳立偉・陳貴福・黃馨瑀・邱秀麗・林昀珊",
          lx: 0.0,
          lz: 0.15,
          size: 0.72,
          flows: ["F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8"],
          desc: "【簡報 P.8】八大業務分工總覽核心廣場：串聯整體綜理、採購請購、藥品資料維護、品管抽驗、倉儲與存量管制、稽核報告與會議、教育訓練、績效處理等 8 條跨院協作線。"
        }
      ],
      quiz: {
        q: "依據簡報第 6 頁與第 8 頁，「中藥濃縮製劑馬兜鈴酸抽驗作業」與「科中藥品採購及品管作業」是由部務室哪一位人員負責？",
        options: ["邱秀麗", "林昀珊", "黃馨瑀", "陳貴福"],
        answer: 0,
        explanation: "依據簡報第 6 頁及第 8 頁，邱秀麗負責中藥藥品抽驗、馬兜鈴酸抽驗、對抗品評估、異常事件檢驗分析、不良品評估匯整及科中藥品採購品管。"
      }
    },

    // -----------------------------------------------------------------------
    // 07. 桃園院區島 (桃園市龜山區頂湖路 — 桃園中藥科核心)
    // -----------------------------------------------------------------------
    {
      id: "taoyuan",
      index: "07",
      name: "桃園院區島",
      shortName: "桃園院區",
      county: "桃園市",
      region: "taoyuan",
      regionLabel: "桃園核心樞紐群",
      division: "桃園中藥科",
      supervisor: "董維軒",
      supervisorTitle: "桃園院區 中藥科主管",
      q: 1,
      r: -1,
      ground: "terracotta",
      cliffTone: "card",
      ringTint: 0xe6b796,
      icon: "🌿",
      landmark: "桃園中藥科本部大樓 ＆ 體系總倉煎藥製劑中心",
      summary: "位於桃園市龜山區，由董維軒主管領軍，為「桃園中藥科」核心駐地，緊鄰桃園部務室與林口院區，結合大型中醫專科門診、體系總倉物流、中藥製劑與道地飲片鑑別。",
      glbModels: [
        { file: "characters/Pharmacist.glb", label: "董維軒主管團隊藥師", role: "pharmacist", offset: [0.85, -0.45], scale: 0.52, clip: "Idle" },
        { file: "characters/FarmOwner.glb", label: "道地飲片炮製技師", role: "farmer", offset: [-0.88, 0.78], scale: 0.5, clip: "Idle" },
        { file: "animals/Doe.glb", label: "桃園本草園梅花鹿", role: "animal", offset: [1.05, 0.78], scale: 0.38 }
      ],
      outline: [
        {
          title: "一、院區定位與主管編制",
          points: [
            "隸屬部門：中醫藥劑部 — 桃園中藥科核心本院",
            "院區主管：董維軒（桃園院區中藥科主管）",
            "地理區位：桃園市龜山區（與部務室、林口院區緊密接壤，構成桃園三大核心島群）"
          ]
        },
        {
          title: "二、核心藥事服務與部務室協作",
          points: [
            "長庚中醫醫院桃園分院高專業門診、養生調理與特色中藥製劑服務",
            "與部務室林昀珊「總倉藥品管理／存量管制調撥」（F5）及陳貴福「中藥製劑／體系飲片類藥品資料維護」（F2, F3）深度整合",
            "配合邱秀麗執行飲片與濃縮製劑抽驗、對抗品評估（F4）"
          ]
        }
      ],
      buildings: [
        {
          id: "taoyuan-hq",
          pin: "①",
          name: "桃園中藥科本部大樓",
          kind: "bogongcare",
          owner: "董維軒（院區主管）",
          lx: -0.35,
          lz: -0.36,
          size: 0.98,
          flows: ["F1", "F8"],
          desc: "董維軒主管主持之桃園院區中藥局主館，融合傳統中醫本草底蘊與現代藥事管理。"
        },
        {
          id: "taoyuan-warehouse",
          pin: "②",
          name: "體系總倉與智慧煎藥中心",
          kind: "warehouse",
          owner: "董維軒 × 林昀珊（總倉管理）・陳貴福（製劑）",
          lx: 0.76,
          lz: -0.25,
          size: 0.7,
          flows: ["F2", "F5"],
          desc: "對接部務室林昀珊總倉藥品管理與陳貴福中藥製劑業務，支援體系藥品儲存與製劑生產。"
        },
        {
          id: "taoyuan-slices",
          pin: "③",
          name: "道地飲片資料與對抗品工坊",
          kind: "herb_lab",
          owner: "董維軒 × 陳貴福（飲片資料）・邱秀麗（對抗品評估）",
          lx: -0.58,
          lz: 0.66,
          size: 0.64,
          flows: ["F3", "F4"],
          desc: "落實體系飲片類藥品資料維護、真偽優劣鑑別與對抗品評估作業。"
        },
        {
          id: "taoyuan-dispatch",
          pin: "④",
          name: "北中院區藥品調撥轉運站",
          kind: "terminal",
          owner: "董維軒 × 林昀珊（存量管制與調撥）",
          lx: 0.6,
          lz: 0.68,
          size: 0.62,
          flows: ["F5"],
          desc: "執行藥品訂單處理、安全存量監控與跨院區緊急調撥支援。"
        }
      ],
      quiz: {
        q: "請問「桃園院區」的中藥科主管為哪一位？",
        options: ["董維軒", "周佳玉", "陳貴福", "林昀珊"],
        answer: 0,
        explanation: "依據簡報第 2 頁，桃園院區中藥科主管為董維軒。"
      }
    },

    // -----------------------------------------------------------------------
    // 08. 大里仁愛院區島 (台中市大里區東榮路)
    // -----------------------------------------------------------------------
    {
      id: "dali",
      index: "08",
      name: "大里仁愛院區島",
      shortName: "大里仁愛",
      county: "台中市",
      region: "central",
      regionLabel: "中台灣院區群",
      division: "桃園中藥科",
      supervisor: "王仕雯",
      supervisorTitle: "大里仁愛院區 中藥科主管",
      q: -1,
      r: 1,
      ground: "schoolyard",
      cliffTone: "education",
      ringTint: 0xf1dc9a,
      icon: "🤝",
      landmark: "大里仁愛合作聯盟中藥館 ＆ 體系醫令同步中心",
      summary: "位於台中市大里區（台中仁愛長庚合作聯盟醫院），由王仕雯主管主持，作為銜接北台灣桃園核心與南台灣雲嘉高之「中台灣樞紐島」，全面導入長庚中藥醫令範本、條碼與品管規範。",
      glbModels: [
        { file: "characters/Pharmacist.glb", label: "王仕雯主管團隊藥師", role: "pharmacist", offset: [0.82, -0.45], scale: 0.52, clip: "Idle" },
        { file: "nature/TreeMed002.glb", label: "台中盆地綠蔭", role: "prop", offset: [-1.05, -0.6], scale: 0.46 },
        { file: "animals/Bee.glb", label: "大里蜂農採蜜蜂", role: "animal", offset: [-0.8, 0.85], scale: 0.28 }
      ],
      outline: [
        {
          title: "一、院區定位與主管編制",
          points: [
            "隸屬部門：中醫藥劑部 — 桃園中藥科轄區",
            "院區主管：王仕雯（大里仁愛院區中藥科主管）",
            "地理區位：台中市大里區（居台灣中部核心，北連桃園部務室、南接雲林與嘉義院區）"
          ]
        },
        {
          title: "二、核心藥事服務與部務室協作",
          points: [
            "推動合作聯盟醫院中藥局與長庚體系「工作規範修訂、整合」及「內部稽核」（黃馨瑀 F6）",
            "同步導入長庚中藥範本、條碼藥品資料（F3）與收費標準設定維護（林昀珊 F5）",
            "提供大台中與屯區民眾高品質門診中藥調劑與用藥安全諮詢"
          ]
        }
      ],
      buildings: [
        {
          id: "dali-main",
          pin: "①",
          name: "大里仁愛中藥合作聯盟主館",
          kind: "sisterschools",
          owner: "王仕雯（院區主管）",
          lx: -0.35,
          lz: -0.36,
          size: 0.95,
          flows: ["F3", "F6"],
          desc: "王仕雯主管主持之中台灣合作聯盟中藥局，象徵長庚與大里仁愛雙院緊密攜手。"
        },
        {
          id: "dali-his",
          pin: "②",
          name: "醫令範本與條碼同步中心",
          kind: "computer",
          owner: "王仕雯 × 黃馨瑀・陳貴福（資料維護）",
          lx: 0.74,
          lz: -0.25,
          size: 0.66,
          flows: ["F3", "F8"],
          desc: "全面接軌長庚體系中藥範本、條碼藥品資料與醫令系統績效管理。"
        },
        {
          id: "dali-sop",
          pin: "③",
          name: "工作規範整合與內稽查核室",
          kind: "lawbook",
          owner: "王仕雯 × 黃馨瑀（工作規範整合・內部稽核）",
          lx: -0.58,
          lz: 0.66,
          size: 0.62,
          flows: ["F6"],
          desc: "落實部務室工作規範修訂整合、年度內部稽核實際查核與材料滯存管理。"
        },
        {
          id: "dali-care",
          pin: "④",
          name: "中台灣社區中醫藥衛教亭",
          kind: "service",
          owner: "大里仁愛臨床中藥師團隊",
          lx: 0.58,
          lz: 0.68,
          size: 0.6,
          flows: ["F7"],
          desc: "為台中屯區民眾提供親切詳盡的中藥煎服衛教與體質養生指導。"
        }
      ],
      quiz: {
        q: "請問位於台中市的「大里仁愛院區」，其中藥科主管為哪一位？",
        options: ["王仕雯", "戴俊典", "蔡盈億", "劉賢德"],
        answer: 0,
        explanation: "依據簡報第 2 頁，大里仁愛院區中藥科主管為王仕雯。"
      }
    },

    // -----------------------------------------------------------------------
    // 09. 雲林院區島 (雲林縣麥寮鄉)
    // -----------------------------------------------------------------------
    {
      id: "yunlin",
      index: "09",
      name: "雲林院區島",
      shortName: "雲林院區",
      county: "雲林縣",
      region: "yunchia",
      regionLabel: "雲嘉院區群",
      division: "桃園中藥科",
      supervisor: "蔡盈億",
      supervisorTitle: "雲林院區 中藥科主管",
      q: -2,
      r: 2,
      ground: "farmland",
      cliffTone: "lunch",
      ringTint: 0xcdb08a,
      icon: "🌾",
      landmark: "雲林沿海中藥照護堡 ＆ 偏鄉防風恆溫藥倉",
      summary: "位於雲林縣麥寮鄉沿海地區，由蔡盈億主管帶領，深耕農漁村高齡長者中醫藥照護，搭配防風防潮存量調撥與不良品即時檢驗通報，守護沿海偏鄉用藥不斷線。",
      glbModels: [
        { file: "characters/Pharmacist.glb", label: "蔡盈億主管團隊藥師", role: "pharmacist", offset: [0.8, -0.45], scale: 0.52, clip: "Idle" },
        { file: "characters/GrandmaShopper.glb", label: "雲林沿海領藥長輩", role: "citizen", offset: [-0.85, 0.78], scale: 0.48, clip: "Idle" },
        { file: "nature/Reed001.glb", label: "麥寮海岸蘆葦", role: "prop", offset: [-1.05, -0.6], scale: 0.5 }
      ],
      outline: [
        {
          title: "一、院區定位與主管編制",
          points: [
            "隸屬部門：中醫藥劑部 — 桃園中藥科轄區",
            "院區主管：蔡盈億（雲林院區中藥科主管）",
            "地理區位：雲林縣麥寮鄉（居台灣西海岸中南段，與東側【嘉義院區】構成雲嘉雙星）"
          ]
        },
        {
          title: "二、核心藥事服務與部務室協作",
          points: [
            "針對農漁村高齡人口提供台語友善中藥衛教、慢病調理與安全發藥",
            "配合部務室林昀珊「體系藥品存量管制（訂單處理、倉儲管理、調撥）」（F5），確保沿海院區藥源充裕",
            "配合邱秀麗執行中藥藥品抽驗、異常事件檢驗分析與不良品評估（F4）"
          ]
        }
      ],
      buildings: [
        {
          id: "yunlin-main",
          pin: "①",
          name: "雲林沿海中藥照護中心",
          kind: "homecare",
          owner: "蔡盈億（院區主管）",
          lx: -0.32,
          lz: -0.35,
          size: 0.94,
          flows: ["F5"],
          desc: "蔡盈億主管主持之雲林長庚中藥局，守護麥寮與沿海鄉親的中醫用藥健康。"
        },
        {
          id: "yunlin-storage",
          pin: "②",
          name: "防風防鹽恆溫藥品庫",
          kind: "warehouse",
          owner: "蔡盈億 × 林昀珊（存量管制與調撥）",
          lx: 0.74,
          lz: -0.25,
          size: 0.66,
          flows: ["F5"],
          desc: "因應沿海強風與高鹽環境強化密封倉儲，並由總倉定期精準調撥補充。"
        },
        {
          id: "yunlin-elder",
          pin: "③",
          name: "農漁村高齡台語衛教亭",
          kind: "generations",
          owner: "雲林院區中藥師團隊",
          lx: -0.58,
          lz: 0.66,
          size: 0.62,
          flows: ["F7"],
          desc: "以親切母語及圖示藥袋，輔導長輩正確服用科學中藥與傳統水煎藥。"
        },
        {
          id: "yunlin-qc",
          pin: "④",
          name: "異常事件與不良品檢驗哨",
          kind: "qc_station",
          owner: "蔡盈億 × 邱秀麗（異常事件與不良品分析）",
          lx: 0.58,
          lz: 0.68,
          size: 0.6,
          flows: ["F4"],
          desc: "連線部務室邱秀麗，執行藥品抽驗及氣候保存異常事件之檢驗與分析。"
        }
      ],
      quiz: {
        q: "請問位於雲林縣麥寮鄉的「雲林院區」，其中藥科主管為哪一位？",
        options: ["蔡盈億", "戴俊典", "王仕雯", "郭姮均"],
        answer: 0,
        explanation: "依據簡報第 2 頁，雲林院區中藥科主管為蔡盈億。"
      }
    },

    // -----------------------------------------------------------------------
    // 10. 嘉義院區島 (嘉義縣朴子市嘉朴路)
    // -----------------------------------------------------------------------
    {
      id: "chiayi",
      index: "10",
      name: "嘉義院區島",
      shortName: "嘉義院區",
      county: "嘉義縣",
      region: "yunchia",
      regionLabel: "雲嘉院區群",
      division: "桃園中藥科",
      supervisor: "戴俊典",
      supervisorTitle: "嘉義院區 中藥科主管",
      q: -1,
      r: 2,
      ground: "meadow",
      cliffTone: "welfare",
      ringTint: 0xdfe6cf,
      icon: "🌲",
      landmark: "嘉義臨床中藥大樓 ＆ 嘉南本草藥園教研館",
      summary: "坐落於嘉義縣朴子市（鄰近高鐵嘉義站與故宮南院），由戴俊典主管統籌，為雲嘉南平原大型綜合教學醫院中藥重鎮，兼顧臨床會診、藥師進階培訓與雲嘉區域藥事支援。",
      glbModels: [
        { file: "characters/WhiteCoatDoctor.glb", label: "戴俊典主管團隊", role: "doctor", offset: [0.84, -0.45], scale: 0.52, clip: "Idle" },
        { file: "nature/TreeHigh001.glb", label: "阿里山意象神木群", role: "prop", offset: [-1.05, -0.6], scale: 0.5 },
        { file: "animals/SunBear.glb", label: "台灣黑熊生態雕像", role: "animal", offset: [1.0, 0.8], scale: 0.36 }
      ],
      outline: [
        {
          title: "一、院區定位與主管編制",
          points: [
            "隸屬部門：中醫藥劑部 — 桃園中藥科轄區",
            "院區主管：戴俊典（嘉義院區中藥科主管）",
            "地理區位：嘉義縣朴子市（西接雲林院區、北連台中大里仁愛、南通高雄院區群）"
          ]
        },
        {
          title: "二、核心藥事服務與部務室協作",
          points: [
            "雲嘉南大型綜合醫院中醫門診、住院會診與急慢性病中西醫整合藥事服務",
            "配合部務室林昀珊（存量管制／藥品請購／教育訓練 F2, F5, F7）與黃馨瑀（內部稽核／材料滯存表彙總／P 認證 F6, F7）",
            "與雲林院區形成「雲嘉區域聯防」，支援藥品調撥與專業人才培訓"
          ]
        }
      ],
      buildings: [
        {
          id: "chiayi-main",
          pin: "①",
          name: "嘉義中藥臨床藥學大樓",
          kind: "hospital",
          owner: "戴俊典（院區主管）",
          lx: -0.35,
          lz: -0.36,
          size: 0.96,
          flows: ["F2", "F5"],
          desc: "戴俊典主管統籌之嘉義長庚中藥局主館，服務雲嘉南廣大門診與住院會診病患。"
        },
        {
          id: "chiayi-herb",
          pin: "②",
          name: "嘉南本草藥園與教研室",
          kind: "farm",
          owner: "戴俊典 × 林昀珊・黃馨瑀（教育訓練・P認證）",
          lx: 0.75,
          lz: -0.25,
          size: 0.68,
          flows: ["F7"],
          desc: "結合本草飲片實物教學，執行中藥相關教育訓練課程與藥師 P 認證進階輔導。"
        },
        {
          id: "chiayi-inventory",
          pin: "③",
          name: "存量管制與滯存稽核站",
          kind: "admin",
          owner: "戴俊典 × 林昀珊（存量）・黃馨瑀（材料滯存表）",
          lx: -0.58,
          lz: 0.66,
          size: 0.62,
          flows: ["F5", "F6"],
          desc: "執行藥品訂單請購、庫存週轉控管與年度內部稽核材料滯存表彙總。"
        },
        {
          id: "chiayi-hub",
          pin: "④",
          name: "雲嘉雙星藥事聯防中心",
          kind: "hub",
          owner: "戴俊典（嘉義）× 蔡盈億（雲林）",
          lx: 0.58,
          lz: 0.68,
          size: 0.6,
          flows: ["F5", "F7"],
          desc: "串聯嘉義與雲林兩院區之跨院調撥、教育訓練與臨床經驗交流。"
        }
      ],
      quiz: {
        q: "請問「嘉義院區」的中藥科主管為哪一位？",
        options: ["戴俊典", "蔡盈億", "王仕雯", "董維軒"],
        answer: 0,
        explanation: "依據簡報第 2 頁，嘉義院區中藥科主管為戴俊典。"
      }
    },

    // -----------------------------------------------------------------------
    // 11. 高雄院區島 (高雄市鳥松區大埤路 — 高雄中藥科核心)
    // -----------------------------------------------------------------------
    {
      id: "kaohsiung",
      index: "11",
      name: "高雄院區島",
      shortName: "高雄院區",
      county: "高雄市",
      region: "south",
      regionLabel: "高雄南區院區群",
      division: "高雄中藥科",
      supervisor: "郭姮均、王麗綺",
      supervisorTitle: "高雄＋鳳山＋大同院區 中藥科主管",
      q: -1,
      r: 3,
      ground: "granite",
      cliffTone: "youth",
      ringTint: 0x8fc6c4,
      icon: "🏛️",
      landmark: "高雄醫學中心中藥總館 ＆ 澄清湖畔製劑品管中心",
      summary: "位於高雄市鳥松區澄清湖畔，為「高雄中藥科」核心醫學中心，由郭姮均、王麗綺兩位主管共同領航（統籌高雄、鳳山、大同三院區），肩負南台灣臨床中藥、製劑品管、新藥審核與教育訓練重任。",
      glbModels: [
        { file: "characters/HospitalDirector.glb", label: "郭姮均・王麗綺主管團隊", role: "director", offset: [0.85, -0.45], scale: 0.54, clip: "Idle" },
        { file: "characters/Pharmacist.glb", label: "高雄中藥科臨床藥師", role: "pharmacist", offset: [-0.88, 0.78], scale: 0.5, clip: "Idle" },
        { file: "animals/SacredIbis.glb", label: "澄清湖畔水鳥", role: "animal", offset: [1.05, 0.8], scale: 0.36 }
      ],
      outline: [
        {
          title: "一、院區定位與主管編制（簡報第 1–2 頁）",
          points: [
            "隸屬部門：中醫藥劑部 — 高雄中藥科核心本院（轄高雄、鳳山、大同三院區）",
            "院區主管：郭姮均、王麗綺（兩位主管共同綜理高雄＋鳳山＋大同三院區中藥業務）",
            "地理區位：高雄市鳥松區澄清湖畔（南台灣長庚醫學中心總樞紐）"
          ]
        },
        {
          title: "二、核心藥事服務與部務室協作",
          points: [
            "統籌南區三院區門診、急重症會診、中醫病房與特色中藥製劑服務",
            "與桃園部務室全方位連線：配合陳貴福（請購／製劑／飲片資料／績效 F2, F3, F8）、黃馨瑀（新藥審核／內稽／藥事會議／P 認證 F3, F6, F7, F8）、邱秀麗（品管抽驗／馬兜鈴酸檢驗／科中採購 F2, F4）、林昀珊（總倉調撥／收費標準／教育訓練 F5, F7）"
          ]
        }
      ],
      buildings: [
        {
          id: "kaohsiung-main",
          pin: "①",
          name: "高雄中藥科醫學中心主樓",
          kind: "researchdome",
          owner: "郭姮均、王麗綺（南區三院共同主管）",
          lx: -0.35,
          lz: -0.38,
          size: 1.02,
          flows: ["F2", "F8"],
          desc: "郭姮均、王麗綺兩位主管坐鎮之高雄長庚中藥科本部，領航高雄、鳳山、大同三院區藥事服務。"
        },
        {
          id: "kaohsiung-qc",
          pin: "②",
          name: "南區中藥製劑與品管檢驗室",
          kind: "qc_station",
          owner: "郭姮均・王麗綺 × 邱秀麗（品管）・陳貴福（製劑）",
          lx: 0.76,
          lz: -0.25,
          size: 0.68,
          flows: ["F2", "F4"],
          desc: "執行南區中藥製劑品管、濃縮製劑馬兜鈴酸抽驗與不良品評估分析。"
        },
        {
          id: "kaohsiung-meeting",
          pin: "③",
          name: "南區新藥審核與共識會議廳",
          kind: "meeting",
          owner: "郭姮均・王麗綺 × 黃馨瑀（新藥・會議・內稽）",
          lx: -0.58,
          lz: 0.68,
          size: 0.64,
          flows: ["F3", "F6"],
          desc: "連線部務室召開部務業務共識、中藥藥事小組會議、新藥開檔審核與年度內部稽核。"
        },
        {
          id: "kaohsiung-edu",
          pin: "④",
          name: "南台灣中藥師 P 認證培訓館",
          kind: "classroom",
          owner: "郭姮均・王麗綺 × 林昀珊・黃馨瑀（教訓・進階）",
          lx: 0.6,
          lz: 0.7,
          size: 0.64,
          flows: ["F7"],
          desc: "推動南區三院區中藥教育訓練課程督導與藥師專業進階（P 認證）培育。"
        }
      ],
      quiz: {
        q: "依據簡報第 1 頁與第 2 頁，「高雄中藥科」轄下包含哪三個院區，並由哪兩位主管共同負責？",
        options: [
          "高雄、鳳山、大同｜郭姮均、王麗綺",
          "高雄、嘉義、雲林｜郭姮均、戴俊典",
          "高雄、鳳山、屏東｜王麗綺、蔡盈億",
          "高雄、台南、大同｜陳立偉、郭姮均"
        ],
        answer: 0,
        explanation: "依據簡報第 1–2 頁，高雄中藥科轄下為「高雄＋鳳山＋大同」三院區，主管為郭姮均、王麗綺。"
      }
    },

    // -----------------------------------------------------------------------
    // 12. 大同院區島 (高雄市前金區中華三路)
    // -----------------------------------------------------------------------
    {
      id: "datong",
      index: "12",
      name: "大同院區島",
      shortName: "大同院區",
      county: "高雄市",
      region: "south",
      regionLabel: "高雄南區院區群",
      division: "高雄中藥科",
      supervisor: "郭姮均、王麗綺",
      supervisorTitle: "高雄＋鳳山＋大同院區 中藥科主管",
      q: -2,
      r: 3,
      ground: "street",
      cliffTone: "transport",
      ringTint: 0xb9b3ab,
      icon: "🌆",
      landmark: "大同都會高齡中藥館 ＆ 醫令條碼標準同步站",
      summary: "位於高雄市前金區市中心（高雄市立大同醫院），由郭姮均、王麗綺兩位主管共轄，立足南高雄都會核心，強化高齡友善中藥服務、醫令條碼同步與品質稽核。",
      glbModels: [
        { file: "characters/Pharmacist.glb", label: "大同院區中藥師", role: "pharmacist", offset: [0.82, -0.45], scale: 0.52, clip: "Idle" },
        { file: "characters/GrandmaShopper.glb", label: "前金區高齡就醫市民", role: "citizen", offset: [-0.85, 0.76], scale: 0.48, clip: "Idle" },
        { file: "nature/Bush001.glb", label: "中央公園綠意植栽", role: "prop", offset: [-1.05, -0.55], scale: 0.45 }
      ],
      outline: [
        {
          title: "一、院區定位與主管編制",
          points: [
            "隸屬部門：中醫藥劑部 — 高雄中藥科轄區",
            "院區主管：郭姮均、王麗綺（高雄＋鳳山＋大同共同主管）",
            "地理區位：高雄市前金區（位於高雄市中心西側，與鳥松【高雄院區】及【鳳山院區】緊密串聯）"
          ]
        },
        {
          title: "二、核心藥事服務與部務室協作",
          points: [
            "都會區高齡長者與慢性病患之中醫門診調劑、用藥安全與中西藥交互作用把關",
            "同步導入部務室陳貴福、黃馨瑀維護之醫令系統、中藥範本、條碼藥品資料（F3）及林昀珊收費標準設定（F5）",
            "配合黃馨瑀年度內部稽核、工作規範整合（F6）與邱秀麗藥品抽驗（F4）"
          ]
        }
      ],
      buildings: [
        {
          id: "datong-main",
          pin: "①",
          name: "大同都會中藥照護會館",
          kind: "cityhall",
          owner: "郭姮均、王麗綺（院區主管）",
          lx: -0.34,
          lz: -0.36,
          size: 0.94,
          flows: ["F3", "F6"],
          desc: "服務高雄市中心前金、新興、鹽埕區市民之現代化都會中藥局。"
        },
        {
          id: "datong-elder",
          pin: "②",
          name: "市中心高齡友善中藥諮詢站",
          kind: "care",
          owner: "大同院區臨床中藥師團隊",
          lx: 0.74,
          lz: -0.25,
          size: 0.66,
          flows: ["F7"],
          desc: "結合市立大同醫院高齡醫學特色，提供長者多科用藥整合與貼心衛教。"
        },
        {
          id: "datong-his",
          pin: "③",
          name: "醫令條碼與收費標準同步站",
          kind: "computer",
          owner: "郭姮均・王麗綺 × 黃馨瑀・陳貴福・林昀珊",
          lx: -0.58,
          lz: 0.66,
          size: 0.62,
          flows: ["F3", "F5", "F8"],
          desc: "全面接軌長庚體系中藥範本、條碼藥品資料、收費標準與績效管理系統。"
        },
        {
          id: "datong-audit",
          pin: "④",
          name: "南區工作規範與品管查核哨",
          kind: "qc_station",
          owner: "郭姮均・王麗綺 × 黃馨瑀（內稽）・邱秀麗（抽驗）",
          lx: 0.58,
          lz: 0.68,
          size: 0.6,
          flows: ["F4", "F6"],
          desc: "落實部務室工作規範修訂整合、內部稽核實際查核與中藥藥品抽驗作業。"
        }
      ],
      quiz: {
        q: "大同院區與高雄、鳳山院區在部務室業務對接上，「中藥範本及條碼藥品資料維護」與「工作規範修訂整合」主要由部務室哪一位人員負責？",
        options: ["黃馨瑀", "陳立偉", "邱秀麗", "林昀珊"],
        answer: 0,
        explanation: "依據簡報第 5 頁，黃馨瑀負責新藥申請開檔、中藥範本及條碼藥品資料維護，以及內部稽核與工作規範修訂整合。"
      }
    },

    // -----------------------------------------------------------------------
    // 13. 鳳山院區島 (高雄市鳳山區經武路 — 台灣群島南端收尾)
    // -----------------------------------------------------------------------
    {
      id: "fengshan",
      index: "13",
      name: "鳳山院區島",
      shortName: "鳳山院區",
      county: "高雄市",
      region: "south",
      regionLabel: "高雄南區院區群",
      division: "高雄中藥科",
      supervisor: "郭姮均、王麗綺",
      supervisorTitle: "高雄＋鳳山＋大同院區 中藥科主管",
      q: -2,
      r: 4,
      ground: "rubber",
      cliffTone: "sport",
      ringTint: 0xd9866a,
      icon: "☀️",
      landmark: "鳳山社區中藥門診中心 ＆ 高雄三院聯合儲運站",
      summary: "位於高雄市鳳山區（高雄市鳳山醫院），為長庚中藥群島最南端之陽光門戶島嶼，由郭姮均、王麗綺兩位主管共同督導，深耕大鳳山高密度社區門診調劑、快速條碼領藥與南區三院聯合藥品調撥。",
      glbModels: [
        { file: "characters/WardNurse.glb", label: "鳳山中藥門診衛教師", role: "nurse", offset: [0.82, -0.45], scale: 0.52, clip: "Idle" },
        { file: "characters/StockClerk.glb", label: "南區聯合儲運藥庫人員", role: "warehouse", offset: [-0.85, 0.76], scale: 0.48, clip: "Idle" },
        { file: "nature/TreeMed001.glb", label: "鳳山熱帶暖陽綠樹", role: "prop", offset: [-1.05, -0.58], scale: 0.46 }
      ],
      outline: [
        {
          title: "一、院區定位與主管編制",
          points: [
            "隸屬部門：中醫藥劑部 — 高雄中藥科轄區",
            "院區主管：郭姮均、王麗綺（高雄＋鳳山＋大同共同主管）",
            "地理區位：高雄市鳳山區（位處長庚中藥 13 島群最南端，與高雄院區、大同院區構成高雄鐵三角）"
          ]
        },
        {
          title: "二、核心藥事服務與部務室協作",
          points: [
            "服務鳳山及東高雄廣大社區家庭之中醫門診科學中藥與飲片調劑",
            "配合部務室林昀珊「體系藥品存量管制（訂單、倉儲、調撥）」（F5），與高雄本院、大同院區靈活互通庫存",
            "配合陳貴福與黃馨瑀執行醫令系統、體系績效及自費品項績效處理（F8）"
          ]
        }
      ],
      buildings: [
        {
          id: "fengshan-main",
          pin: "①",
          name: "鳳山社區中藥門診中心",
          kind: "hospital",
          owner: "郭姮均、王麗綺（院區主管）",
          lx: -0.34,
          lz: -0.36,
          size: 0.94,
          flows: ["F8"],
          desc: "郭姮均、王麗綺主管督導之鳳山醫院中藥局，提供大鳳山居民便捷溫暖的門診中藥服務。"
        },
        {
          id: "fengshan-fast",
          pin: "②",
          name: "快速條碼核發與候藥站",
          kind: "kiosk",
          owner: "鳳山中藥師團隊 × 黃馨瑀（條碼資料維護）",
          lx: 0.74,
          lz: -0.25,
          size: 0.66,
          flows: ["F3"],
          desc: "運用條碼檢核與標準中藥範本，縮短社區民眾候藥時間並確保發藥正確率。"
        },
        {
          id: "fengshan-logistics",
          pin: "③",
          name: "高雄三院聯合調撥儲運站",
          kind: "warehouse",
          owner: "郭姮均・王麗綺 × 林昀珊（存量管制與調撥）",
          lx: -0.58,
          lz: 0.66,
          size: 0.62,
          flows: ["F5"],
          desc: "串聯高雄、鳳山、大同三院區與桃園總倉之藥品訂單、安全庫存與快速調撥。"
        },
        {
          id: "fengshan-family",
          pin: "④",
          name: "社區家庭四季養生衛教亭",
          kind: "shop",
          owner: "鳳山臨床中藥師團隊",
          lx: 0.58,
          lz: 0.68,
          size: 0.6,
          flows: ["F7", "F8"],
          desc: "推廣社區家庭中藥安全用藥、節氣茶飲保健與親子友善衛教。"
        }
      ],
      quiz: {
        q: "在長庚中藥群島的業務分工中，負責「總倉藥品管理」、「體系藥品存量管制（訂單、倉儲、調撥）」及「收費標準設定與維護」的部務室人員是誰？",
        options: ["林昀珊", "陳貴福", "邱秀麗", "黃馨瑀"],
        answer: 0,
        explanation: "依據簡報第 7 頁及第 8 頁，林昀珊負責總倉藥品管理、體系藥品存量管制、體系藥品請購作業、收費標準設定維護及中藥教育訓練課程規劃督導。"
      }
    }
  ]
};
