import { useEffect, useRef } from 'react';

export function App() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    initConcreteCalculator(containerRef.current);
  }, []);

  return <div ref={containerRef} />;
}

/* ============================================================
   ПОЛНОСТЬЮ ВАНИЛЬНЫЙ JS КАЛЬКУЛЯТОР КЛАССА БЕТОНА
   Диапазон результатов: B10 — B90
   ============================================================ */

function initConcreteCalculator(root: HTMLElement) {

  // ──────────── DATA ────────────

  const CLASS_SCALE = [
    'B10','B12.5','B15','B20','B22.5','B25','B27.5','B30',
    'B35','B40','B45','B50','B55','B60','B65','B70','B75','B80','B85','B90'
  ];

  function classAtIndex(idx: number): string {
    if (idx < 0) return CLASS_SCALE[0];
    if (idx >= CLASS_SCALE.length) return CLASS_SCALE[CLASS_SCALE.length - 1];
    return CLASS_SCALE[idx];
  }

  function classToMarka(cls: string): string {
    const map: Record<string, string> = {
      'B10':'M150','B12.5':'M150','B15':'M200','B20':'M250',
      'B22.5':'M300','B25':'M350','B27.5':'M350','B30':'M400',
      'B35':'M450','B40':'M550','B45':'M600','B50':'M700',
      'B55':'M750','B60':'M800','B65':'M850','B70':'M900',
      'B75':'M1000','B80':'M1050','B85':'M1100','B90':'M1200',
    };
    return map[cls] || '—';
  }

  interface ConstructionOption {
    id: string; label: string; description: string;
    baseClassIndex: number; showGroundwater?: boolean; showSoil?: boolean;
  }
  interface OptionGroup { group: string; options: ConstructionOption[]; }

  // baseClassIndex теперь в шкале 0..19 (B10..B90)
  const CONSTRUCTION_GROUPS: OptionGroup[] = [
    {
      group: 'Ненагруженные конструкции',
      options: [
        { id:'floor_screed', label:'Стяжки полов', description:'Выравнивающие стяжки, подготовительные слои', baseClassIndex:0 },
        { id:'prep_layer', label:'Подготовительные слои', description:'Бетонная подготовка под фундамент', baseClassIndex:1 },
        { id:'sidewalk', label:'Тротуары', description:'Пешеходные дорожки, отмостки', baseClassIndex:2 },
      ]
    },
    {
      group: 'Малонагруженные конструкции',
      options: [
        { id:'fence_found', label:'Фундаменты под заборы', description:'Столбчатые и ленточные фундаменты заборов', baseClassIndex:2 },
        { id:'garden_path', label:'Садовые дорожки', description:'Декоративные дорожки, площадки', baseClassIndex:2 },
        { id:'small_building', label:'Небольшие хозпостройки', description:'Сараи, беседки, навесы', baseClassIndex:3 },
      ]
    },
    {
      group: 'Фундаменты',
      options: [
        { id:'found_strip', label:'Ленточный (малоэтажный дом)', description:'Для домов 1-3 этажа', baseClassIndex:4, showGroundwater:true, showSoil:true },
        { id:'found_slab', label:'Плитный (дом, гараж)', description:'Монолитная плита', baseClassIndex:6, showGroundwater:true, showSoil:true },
        { id:'found_pile', label:'Свайно-ростверковый', description:'Для сложных грунтов', baseClassIndex:6, showGroundwater:true, showSoil:true },
        { id:'basement', label:'Цокольные этажи, подвалы', description:'Заглублённые помещения', baseClassIndex:6, showGroundwater:true, showSoil:true },
      ]
    },
    {
      group: 'Стены',
      options: [
        { id:'wall_bearing', label:'Несущие (многоэтажные)', description:'Несущие стены зданий', baseClassIndex:7 },
        { id:'wall_self', label:'Самонесущие', description:'Стены, несущие только свой вес', baseClassIndex:4 },
        { id:'wall_partition', label:'Перегородки', description:'Внутренние ненесущие стены', baseClassIndex:3 },
      ]
    },
    {
      group: 'Перекрытия',
      options: [
        { id:'slab_inter', label:'Межэтажные', description:'Перекрытия между этажами', baseClassIndex:7 },
        { id:'slab_base', label:'Цокольные', description:'Перекрытие над подвалом', baseClassIndex:6 },
        { id:'slab_attic', label:'Чердачные', description:'Перекрытие под кровлей', baseClassIndex:4 },
      ]
    },
    {
      group: 'Колонны, опоры',
      options: [
        { id:'col_decorative', label:'Декоративные', description:'Декоративные столбы, опоры', baseClassIndex:4 },
        { id:'col_bearing', label:'Несущие (высотные здания)', description:'Колонны каркасных зданий', baseClassIndex:10 },
      ]
    },
    {
      group: 'Балки, ригели',
      options: [
        { id:'beam_span', label:'Прогоны', description:'Балки перекрытий и покрытий', baseClassIndex:7 },
        { id:'beam_lintel', label:'Перемычки', description:'Оконные и дверные перемычки', baseClassIndex:6 },
      ]
    },
    {
      group: 'Специальные конструкции',
      options: [
        { id:'stair', label:'Лестничные марши', description:'Лестницы, площадки', baseClassIndex:7 },
        { id:'pool', label:'Бассейны', description:'Чаши бассейнов', baseClassIndex:8 },
        { id:'reservoir', label:'Резервуары для воды', description:'Ёмкости, цистерны', baseClassIndex:8 },
        { id:'road_slab', label:'Дорожные плиты', description:'Плиты покрытий дорог', baseClassIndex:9 },
        { id:'curb', label:'Бордюры', description:'Бордюрные камни', baseClassIndex:6 },
      ]
    },
    {
      group: 'Мостовые и гидротехнические',
      options: [
        { id:'bridge', label:'Опоры мостов', description:'Мостовые конструкции', baseClassIndex:12 },
        { id:'dam', label:'Плотины', description:'Гидротехнические сооружения', baseClassIndex:14 },
        { id:'pier', label:'Причалы', description:'Портовые сооружения', baseClassIndex:12 },
      ]
    },
  ];

  interface SimpleOption {
    id: string; label: string; description: string;
    classModifier: number;
    frostReq?: string; waterproofReq?: string; frostBoost?: string; notes?: string;
    baseClassIndex?: number;
  }

  const LOAD_OPTIONS: SimpleOption[] = [
    { id:'static', label:'Статические нагрузки', description:'Вес конструкции, отделки, оборудования (постоянные)', classModifier:0 },
    { id:'dynamic', label:'Динамические/вибрационные', description:'Станки, транспорт, пешеходный поток', classModifier:2 },
  ];

  const TEMP_OPTIONS: SimpleOption[] = [
    { id:'standard', label:'Стандартный (-30°C до +30°C)', description:'Обычные климатические условия', classModifier:0, frostReq:'F100' },
    { id:'frost', label:'Морозный (ниже -30°C)', description:'Высокая морозостойкость', classModifier:1, frostReq:'F200' },
    { id:'hot', label:'Жаркий/пожароопасный', description:'Повышенные температуры, жаропрочность', classModifier:1, notes:'Рекомендуется жаростойкий бетон' },
  ];

  const MOISTURE_OPTIONS: SimpleOption[] = [
    { id:'dry', label:'Сухие условия', description:'Отапливаемые помещения', classModifier:0 },
    { id:'humid', label:'Влажные условия', description:'Подвалы, сырые помещения', classModifier:0, waterproofReq:'W4' },
    { id:'periodic_water', label:'Периодический контакт с водой', description:'Ливневые стоки, отмостки', classModifier:1, waterproofReq:'W6', frostBoost:'F150' },
    { id:'constant_water', label:'Постоянный контакт с водой', description:'Бассейны, резервуары', classModifier:2, waterproofReq:'W8', frostBoost:'F200' },
    { id:'aggressive', label:'Агрессивная среда', description:'Морская вода, химические пары', classModifier:3, waterproofReq:'W12', frostBoost:'F300', notes:'Рекомендуется сульфатостойкий цемент' },
  ];

  const SOIL_OPTIONS: SimpleOption[] = [
    { id:'rock', label:'Скальный/крупнообломочный', description:'Прочный, непучинистый', classModifier:0 },
    { id:'sand', label:'Песчаный', description:'Средней пучинистости, хорошо дренирует', classModifier:0 },
    { id:'loam', label:'Супесь/Суглинок', description:'Пучинистый, требует внимания', classModifier:1 },
    { id:'clay', label:'Глина', description:'Сильно пучинистый, высокая жёсткость фундамента', classModifier:2 },
    { id:'peat', label:'Заторфованный/слабый', description:'Требует свай или усиленного основания', classModifier:3 },
  ];

  const GROUNDWATER_OPTIONS: SimpleOption[] = [
    { id:'low', label:'Низкий уровень', description:'', classModifier:0 },
    { id:'variable', label:'Переменный уровень', description:'', classModifier:1, waterproofReq:'W6' },
    { id:'high', label:'Высокий уровень', description:'', classModifier:2, waterproofReq:'W8' },
  ];

  const THICKNESS_OPTIONS: SimpleOption[] = [
    { id:'thin', label:'Тонкостенные (менее 150 мм)', description:'', classModifier:1 },
    { id:'medium', label:'Стандартные (150–500 мм)', description:'', classModifier:0 },
    { id:'massive', label:'Массивные (более 500 мм)', description:'', classModifier:0 },
  ];

  const FLOORS_OPTIONS: SimpleOption[] = [
    { id:'1-2', label:'1–2 этажа', description:'', classModifier:0, baseClassIndex:4 },
    { id:'3-5', label:'3–5 этажей', description:'', classModifier:0, baseClassIndex:7 },
    { id:'6-16', label:'6–16 этажей', description:'', classModifier:0, baseClassIndex:10 },
    { id:'16+', label:'Свыше 16 этажей', description:'', classModifier:0, baseClassIndex:14 },
  ];

  const REINFORCEMENT_OPTIONS: SimpleOption[] = [
    { id:'none', label:'Неармированные', description:'', classModifier:0 },
    { id:'light', label:'Слабоармированные', description:'', classModifier:0 },
    { id:'prestressed', label:'Предварительно напряжённые', description:'Минимальный класс B30', classModifier:3, notes:'Минимальный класс B30 для предварительного напряжения' },
  ];

  // ──────────── STATE ────────────

  let currentStep = 1;
  let selectedConstruction: ConstructionOption | null = null;
  let selectedLoad: SimpleOption | null = null;
  let selectedTemp: SimpleOption | null = null;
  let selectedMoisture: SimpleOption | null = null;
  let selectedSoil: SimpleOption | null = null;
  let selectedGroundwater: SimpleOption | null = null;
  let selectedThickness: SimpleOption | null = null;
  let selectedFloors: SimpleOption | null = null;
  let selectedReinforcement: SimpleOption | null = null;

  // ──────────── STYLES ────────────

  const style = document.createElement('style');
  style.textContent = `
    .cc-root {
      min-height: 100vh;
      background: #0a1628;
      color: #ffffff;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 0;
    }
    .cc-root * { box-sizing: border-box; margin: 0; padding: 0; }

    .cc-header {
      background: #0d1f3c;
      border-bottom: 1px solid #1a3a6a;
      box-shadow: 0 4px 20px rgba(0,0,0,0.3);
      padding: 20px 16px;
    }
    .cc-header-inner {
      max-width: 960px;
      margin: 0 auto;
    }
    .cc-header h1 {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .cc-header h1 span { color: #60a5fa; }
    .cc-header p {
      color: rgba(147,197,253,0.5);
      font-size: 13px;
      margin-top: 4px;
    }

    .cc-main {
      max-width: 960px;
      margin: 0 auto;
      padding: 24px 16px;
    }

    /* Step indicator */
    .cc-steps {
      display: flex;
      align-items: flex-start;
      gap: 4px;
      margin-bottom: 24px;
    }
    .cc-step-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .cc-step-row {
      display: flex;
      align-items: center;
      width: 100%;
    }
    .cc-step-circle {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 700;
      flex-shrink: 0;
      transition: all 0.3s;
    }
    .cc-step-circle.active {
      background: #3b82f6;
      color: #fff;
      box-shadow: 0 0 20px rgba(59,130,246,0.3);
    }
    .cc-step-circle.done {
      background: rgba(59,130,246,0.3);
      color: #93c5fd;
      border: 1px solid rgba(59,130,246,0.5);
    }
    .cc-step-circle.pending {
      background: #152238;
      color: #6b7280;
      border: 1px solid #374151;
    }
    .cc-step-line {
      flex: 1;
      height: 2px;
      margin: 0 4px;
      transition: all 0.3s;
    }
    .cc-step-line.done { background: rgba(59,130,246,0.5); }
    .cc-step-line.pending { background: #374151; }
    .cc-step-label {
      font-size: 10px;
      margin-top: 6px;
      text-align: center;
      line-height: 1.3;
    }
    .cc-step-label.active { color: #93c5fd; }
    .cc-step-label.done { color: rgba(96,165,250,0.5); }
    .cc-step-label.pending { color: #4b5563; }

    /* Card */
    .cc-card {
      background: #0d1f3c;
      border-radius: 16px;
      border: 1px solid #1a3a6a;
      box-shadow: 0 8px 30px rgba(0,0,0,0.3);
      overflow: hidden;
    }
    .cc-card-body { padding: 24px; }
    @media(min-width:768px) { .cc-card-body { padding: 32px; } }
    .cc-card h2 { font-size: 20px; font-weight: 600; margin-bottom: 4px; }
    .cc-card .cc-subtitle {
      color: rgba(147,197,253,0.45);
      font-size: 13px;
      margin-bottom: 24px;
    }

    /* Section */
    .cc-section { margin-bottom: 24px; }
    .cc-section:last-child { margin-bottom: 0; }
    .cc-section-title {
      color: #60a5fa;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }

    /* Option grid */
    .cc-grid {
      display: grid;
      gap: 8px;
      grid-template-columns: 1fr;
    }
    .cc-grid-2 { grid-template-columns: repeat(2, 1fr); }
    .cc-grid-3 { grid-template-columns: repeat(3, 1fr); }
    .cc-grid-4 { grid-template-columns: repeat(4, 1fr); }
    @media(max-width:768px) {
      .cc-grid-2, .cc-grid-3, .cc-grid-4 { grid-template-columns: 1fr; }
    }
    @media(min-width:640px) and (max-width:768px) {
      .cc-grid-2 { grid-template-columns: repeat(2, 1fr); }
      .cc-grid-3 { grid-template-columns: repeat(2, 1fr); }
      .cc-grid-4 { grid-template-columns: repeat(2, 1fr); }
    }

    /* Option button */
    .cc-option {
      text-align: left;
      padding: 12px;
      border-radius: 12px;
      border: 1px solid #1e3a5f;
      background: #152238;
      cursor: pointer;
      transition: all 0.2s;
      color: #fff;
      font-family: inherit;
      font-size: 14px;
      width: 100%;
    }
    .cc-option:hover {
      border-color: rgba(59,130,246,0.5);
      background: #1a2d4a;
    }
    .cc-option.selected {
      background: rgba(59,130,246,0.2);
      border-color: #3b82f6;
      box-shadow: 0 0 20px rgba(59,130,246,0.1);
    }
    .cc-option .cc-opt-label {
      font-weight: 500;
      font-size: 13px;
    }
    .cc-option .cc-opt-desc {
      font-size: 11px;
      color: #9ca3af;
      margin-top: 2px;
    }

    /* Group title within step 1 */
    .cc-group-title {
      color: #60a5fa;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 8px;
      margin-top: 20px;
    }
    .cc-group-title:first-child { margin-top: 0; }

    /* Navigation bar */
    .cc-nav {
      border-top: 1px solid #1a3a6a;
      background: #0b1a30;
      padding: 16px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .cc-btn {
      padding: 10px 20px;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      border: none;
      font-family: inherit;
    }
    .cc-btn-secondary {
      background: #152238;
      border: 1px solid #1e3a5f;
      color: #d1d5db;
    }
    .cc-btn-secondary:hover {
      background: #1a2d4a;
      color: #fff;
    }
    .cc-btn-primary {
      background: #3b82f6;
      color: #fff;
      box-shadow: 0 4px 15px rgba(59,130,246,0.25);
    }
    .cc-btn-primary:hover {
      background: #60a5fa;
    }
    .cc-btn-primary:disabled {
      background: #374151;
      color: #6b7280;
      cursor: not-allowed;
      box-shadow: none;
    }

    /* Result */
    .cc-result-card {
      background: linear-gradient(135deg, rgba(59,130,246,0.15), rgba(30,58,95,0.3));
      border: 1px solid rgba(59,130,246,0.3);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
    }
    .cc-result-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
    }
    @media(min-width:768px) {
      .cc-result-grid { grid-template-columns: repeat(4, 1fr); }
    }
    .cc-result-item { text-align: center; }
    .cc-result-label {
      font-size: 10px;
      color: rgba(147,197,253,0.7);
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 4px;
    }
    .cc-result-value {
      font-size: 28px;
      font-weight: 700;
      color: #fff;
    }
    .cc-result-value.accent { color: #60a5fa; }
    .cc-result-sub {
      font-size: 11px;
      color: #9ca3af;
      margin-top: 4px;
    }

    /* Notes */
    .cc-notes {
      background: #152238;
      border: 1px solid rgba(202,138,4,0.3);
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .cc-notes-title {
      color: #facc15;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }
    .cc-notes ul { list-style: none; }
    .cc-notes li {
      font-size: 13px;
      color: #d1d5db;
      padding: 4px 0;
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }
    .cc-notes li::before {
      content: '•';
      color: #eab308;
      flex-shrink: 0;
      margin-top: 1px;
    }

    /* Summary */
    .cc-summary {
      background: #152238;
      border: 1px solid #1e3a5f;
      border-radius: 12px;
      padding: 20px;
    }
    .cc-summary-title {
      color: #60a5fa;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 12px;
    }
    .cc-summary-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 0;
    }
    @media(min-width:768px) {
      .cc-summary-grid { grid-template-columns: repeat(2, 1fr); column-gap: 24px; }
    }
    .cc-summary-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      border-bottom: 1px solid rgba(30,58,95,0.5);
      font-size: 13px;
    }
    .cc-summary-row .cc-sr-label { color: #9ca3af; }
    .cc-summary-row .cc-sr-value { color: #fff; font-weight: 500; }

    /* Footer */
    .cc-footer {
      text-align: center;
      font-size: 11px;
      color: #4b5563;
      margin-top: 24px;
      padding-bottom: 32px;
    }

    /* Group container in step 1 */
    .cc-groups-container {
      max-height: 60vh;
      overflow-y: auto;
      padding-right: 4px;
    }
    .cc-groups-container::-webkit-scrollbar {
      width: 6px;
    }
    .cc-groups-container::-webkit-scrollbar-track {
      background: #0d1f3c;
    }
    .cc-groups-container::-webkit-scrollbar-thumb {
      background: #1e3a5f;
      border-radius: 3px;
    }
  `;
  root.appendChild(style);

  // ──────────── RENDER ENGINE ────────────

  const wrapper = document.createElement('div');
  wrapper.className = 'cc-root';
  root.appendChild(wrapper);

  function render() {
    wrapper.innerHTML = '';

    // Header
    const header = el('div', 'cc-header');
    const headerInner = el('div', 'cc-header-inner');
    headerInner.innerHTML = `
      <h1><span>◆</span> Калькулятор класса бетона</h1>
      <p>Определение рекомендуемого класса бетона по параметрам конструкции (B10 — B90)</p>
    `;
    header.appendChild(headerInner);
    wrapper.appendChild(header);

    // Main
    const main = el('div', 'cc-main');

    // Step indicator
    const stepNames = ['Тип конструкции', 'Нагрузки и среда', 'Геометрия', 'Результат'];
    const stepsDiv = el('div', 'cc-steps');
    stepNames.forEach((name, i) => {
      const stepNum = i + 1;
      const isActive = currentStep === stepNum;
      const isDone = currentStep > stepNum;

      const item = el('div', 'cc-step-item');
      const row = el('div', 'cc-step-row');

      const circle = el('div', 'cc-step-circle ' + (isActive ? 'active' : isDone ? 'done' : 'pending'));
      circle.textContent = isDone ? '✓' : String(stepNum);
      row.appendChild(circle);

      if (i < 3) {
        const line = el('div', 'cc-step-line ' + (isDone ? 'done' : 'pending'));
        row.appendChild(line);
      }
      item.appendChild(row);

      const label = el('div', 'cc-step-label ' + (isActive ? 'active' : isDone ? 'done' : 'pending'));
      label.textContent = name;
      item.appendChild(label);

      stepsDiv.appendChild(item);
    });
    main.appendChild(stepsDiv);

    // Card
    const card = el('div', 'cc-card');
    const cardBody = el('div', 'cc-card-body');

    if (currentStep === 1) renderStep1(cardBody);
    else if (currentStep === 2) renderStep2(cardBody);
    else if (currentStep === 3) renderStep3(cardBody);
    else if (currentStep === 4) renderStep4(cardBody);

    card.appendChild(cardBody);

    // Nav
    const nav = el('div', 'cc-nav');
    const navLeft = el('div', '');
    const navRight = el('div', '');

    if (currentStep > 1 && currentStep < 4) {
      const backBtn = el('button', 'cc-btn cc-btn-secondary') as HTMLButtonElement;
      backBtn.textContent = '← Назад';
      backBtn.onclick = () => { currentStep--; render(); };
      navLeft.appendChild(backBtn);
    }
    if (currentStep === 4) {
      const resetBtn = el('button', 'cc-btn cc-btn-secondary') as HTMLButtonElement;
      resetBtn.textContent = '↺ Начать заново';
      resetBtn.onclick = () => {
        currentStep = 1;
        selectedConstruction = null;
        selectedLoad = null;
        selectedTemp = null;
        selectedMoisture = null;
        selectedSoil = null;
        selectedGroundwater = null;
        selectedThickness = null;
        selectedFloors = null;
        selectedReinforcement = null;
        render();
      };
      navLeft.appendChild(resetBtn);
    }

    if (currentStep < 4) {
      const nextBtn = el('button', 'cc-btn cc-btn-primary') as HTMLButtonElement;
      let canNext = false;
      if (currentStep === 1) {
        canNext = selectedConstruction !== null;
        nextBtn.textContent = 'Далее →';
      } else if (currentStep === 2) {
        const showSoil = selectedConstruction?.showSoil ?? false;
        const showGW = selectedConstruction?.showGroundwater ?? false;
        canNext = selectedLoad !== null && selectedTemp !== null && selectedMoisture !== null
          && (!showSoil || selectedSoil !== null)
          && (!showGW || selectedGroundwater !== null);
        nextBtn.textContent = 'Далее →';
      } else if (currentStep === 3) {
        canNext = selectedThickness !== null && selectedFloors !== null && selectedReinforcement !== null;
        nextBtn.textContent = 'Рассчитать ✓';
      }
      nextBtn.disabled = !canNext;
      nextBtn.onclick = () => { if (canNext) { currentStep++; render(); } };
      navRight.appendChild(nextBtn);
    }

    nav.appendChild(navLeft);
    nav.appendChild(navRight);
    card.appendChild(nav);

    main.appendChild(card);

    // Footer
    const footer = el('div', 'cc-footer');
    footer.textContent = 'Калькулятор предоставляет рекомендательный результат. Для ответственных конструкций обратитесь к проектной документации.';
    main.appendChild(footer);

    wrapper.appendChild(main);
  }

  // ──────────── STEP RENDERERS ────────────

  function renderStep1(container: HTMLElement) {
    container.innerHTML = '<h2>Шаг 1. Тип конструкции</h2><p class="cc-subtitle">Выберите тип конструкции, для которой подбирается бетон</p>';

    const scrollContainer = el('div', 'cc-groups-container');

    CONSTRUCTION_GROUPS.forEach(group => {
      const title = el('div', 'cc-group-title');
      title.textContent = group.group;
      scrollContainer.appendChild(title);

      const grid = el('div', 'cc-grid cc-grid-3');
      group.options.forEach(opt => {
        const btn = el('button', 'cc-option' + (selectedConstruction?.id === opt.id ? ' selected' : '')) as HTMLButtonElement;
        btn.innerHTML = `<div class="cc-opt-label">${opt.label}</div><div class="cc-opt-desc">${opt.description}</div>`;
        btn.onclick = () => {
          selectedConstruction = opt;
          if (!opt.showSoil) selectedSoil = null;
          if (!opt.showGroundwater) selectedGroundwater = null;
          render();
        };
        grid.appendChild(btn);
      });
      scrollContainer.appendChild(grid);
    });

    container.appendChild(scrollContainer);
  }

  function renderStep2(container: HTMLElement) {
    container.innerHTML = '<h2>Шаг 2. Нагрузки и среда эксплуатации</h2><p class="cc-subtitle">Укажите характер нагрузок и условия эксплуатации</p>';

    addSection(container, 'Характер нагрузок', LOAD_OPTIONS, selectedLoad, 'cc-grid-2', (opt) => { selectedLoad = opt; render(); });
    addSection(container, 'Температурный режим', TEMP_OPTIONS, selectedTemp, 'cc-grid-3', (opt) => { selectedTemp = opt; render(); });
    addSection(container, 'Влажностный режим / контакт с водой', MOISTURE_OPTIONS, selectedMoisture, 'cc-grid-3', (opt) => { selectedMoisture = opt; render(); });

    if (selectedConstruction?.showSoil) {
      addSection(container, 'Тип грунта', SOIL_OPTIONS, selectedSoil, 'cc-grid-3', (opt) => { selectedSoil = opt; render(); });
    }
    if (selectedConstruction?.showGroundwater) {
      addSection(container, 'Уровень грунтовых вод', GROUNDWATER_OPTIONS, selectedGroundwater, 'cc-grid-3', (opt) => { selectedGroundwater = opt; render(); });
    }
  }

  function renderStep3(container: HTMLElement) {
    container.innerHTML = '<h2>Шаг 3. Геометрия и армирование</h2><p class="cc-subtitle">Укажите геометрические параметры и тип армирования</p>';

    addSection(container, 'Толщина элемента', THICKNESS_OPTIONS, selectedThickness, 'cc-grid-3', (opt) => { selectedThickness = opt; render(); });
    addSection(container, 'Этажность / высота здания', FLOORS_OPTIONS, selectedFloors, 'cc-grid-4', (opt) => { selectedFloors = opt; render(); });
    addSection(container, 'Наличие армирования', REINFORCEMENT_OPTIONS, selectedReinforcement, 'cc-grid-3', (opt) => { selectedReinforcement = opt; render(); });
  }

  function renderStep4(container: HTMLElement) {
    const result = computeResult();
    container.innerHTML = '<h2>Результат расчёта</h2><p class="cc-subtitle">Рекомендуемые характеристики бетона</p>';

    // Main result
    const resultCard = el('div', 'cc-result-card');
    const resultGrid = el('div', 'cc-result-grid');

    resultGrid.appendChild(makeResultItem('Класс бетона', result.concreteClass, '≈ ' + classToMarka(result.concreteClass), true));
    resultGrid.appendChild(makeResultItem('Морозостойкость', result.frostMark, 'марка по морозостойкости', false));
    resultGrid.appendChild(makeResultItem('Водонепроницаемость', result.waterproofMark, 'марка по водонепроницаемости', false));
    resultGrid.appendChild(makeResultItem('Марка прочности', classToMarka(result.concreteClass), 'ориентировочная', false));

    resultCard.appendChild(resultGrid);
    container.appendChild(resultCard);

    // Notes
    if (result.notes.length > 0) {
      const notesDiv = el('div', 'cc-notes');
      notesDiv.innerHTML = '<div class="cc-notes-title">⚠ Дополнительные рекомендации</div>';
      const ul = document.createElement('ul');
      result.notes.forEach(note => {
        const li = document.createElement('li');
        li.textContent = note;
        ul.appendChild(li);
      });
      notesDiv.appendChild(ul);
      container.appendChild(notesDiv);
    }

    // Summary
    const summary = el('div', 'cc-summary');
    summary.innerHTML = '<div class="cc-summary-title">Сводка введённых параметров</div>';
    const summaryGrid = el('div', 'cc-summary-grid');

    const rows: [string, string | undefined][] = [
      ['Конструкция', selectedConstruction?.label],
      ['Нагрузки', selectedLoad?.label],
      ['Температура', selectedTemp?.label],
      ['Влажность', selectedMoisture?.label],
    ];
    if (selectedConstruction?.showSoil) rows.push(['Грунт', selectedSoil?.label]);
    if (selectedConstruction?.showGroundwater) rows.push(['Грунтовые воды', selectedGroundwater?.label]);
    rows.push(['Толщина', selectedThickness?.label]);
    rows.push(['Этажность', selectedFloors?.label]);
    rows.push(['Армирование', selectedReinforcement?.label]);

    rows.forEach(([label, value]) => {
      const row = el('div', 'cc-summary-row');
      row.innerHTML = `<span class="cc-sr-label">${label}:</span><span class="cc-sr-value">${value || '—'}</span>`;
      summaryGrid.appendChild(row);
    });

    summary.appendChild(summaryGrid);
    container.appendChild(summary);
  }

  // ──────────── COMPUTE RESULT ────────────

  function computeResult() {
    const bases: number[] = [];
    if (selectedConstruction) bases.push(selectedConstruction.baseClassIndex);
    if (selectedFloors?.baseClassIndex !== undefined) bases.push(selectedFloors.baseClassIndex);

    let maxBase = bases.length > 0 ? Math.max(...bases) : 4;

    let modTotal = 0;
    if (selectedLoad) modTotal += selectedLoad.classModifier;
    if (selectedTemp) modTotal += selectedTemp.classModifier;
    if (selectedMoisture) modTotal += selectedMoisture.classModifier;
    if (selectedSoil) modTotal += selectedSoil.classModifier;
    if (selectedGroundwater) modTotal += selectedGroundwater.classModifier;
    if (selectedThickness) modTotal += selectedThickness.classModifier;
    if (selectedReinforcement) modTotal += selectedReinforcement.classModifier;

    let finalIdx = maxBase + modTotal;

    // Prestressed constraint: min B30
    if (selectedReinforcement?.id === 'prestressed') {
      const b30Idx = CLASS_SCALE.indexOf('B30');
      if (finalIdx < b30Idx) finalIdx = b30Idx;
    }

    const concreteClass = classAtIndex(finalIdx);

    // Frost
    let frostMark = selectedTemp?.frostReq || 'F100';
    if (selectedMoisture?.frostBoost) {
      const frostNum = (s: string) => parseInt(s.replace('F', ''));
      if (frostNum(selectedMoisture.frostBoost) > frostNum(frostMark)) {
        frostMark = selectedMoisture.frostBoost;
      }
    }

    // Waterproof
    const wpMarks: string[] = [];
    if (selectedMoisture?.waterproofReq) wpMarks.push(selectedMoisture.waterproofReq);
    if (selectedGroundwater?.waterproofReq) wpMarks.push(selectedGroundwater.waterproofReq);
    const wpNum = (s: string) => parseInt(s.replace('W', ''));
    let waterproofMark = '—';
    if (wpMarks.length > 0) {
      const maxWp = Math.max(...wpMarks.map(wpNum));
      waterproofMark = 'W' + maxWp;
    }

    // Notes
    const notes: string[] = [];
    if (selectedTemp?.notes) notes.push(selectedTemp.notes);
    if (selectedMoisture?.notes) notes.push(selectedMoisture.notes);
    if (selectedReinforcement?.notes) notes.push(selectedReinforcement.notes);
    if (selectedSoil?.id === 'peat') notes.push('Для слабых грунтов рекомендуется свайный фундамент или замена грунта');
    if (selectedGroundwater?.id === 'high') notes.push('При высоком уровне грунтовых вод обязательна гидроизоляция');

    // Special constructions
    if (selectedConstruction?.id === 'pool' || selectedConstruction?.id === 'reservoir') {
      if (waterproofMark === '—' || wpNum(waterproofMark) < 8) {
        waterproofMark = 'W8';
        notes.push('Для водосодержащих конструкций минимальная водонепроницаемость W8');
      }
    }
    if (selectedConstruction?.id === 'bridge' || selectedConstruction?.id === 'dam' || selectedConstruction?.id === 'pier') {
      const fn = (s: string) => parseInt(s.replace('F', ''));
      if (fn(frostMark) < 200) frostMark = 'F200';
      notes.push('Для мостовых/гидротехнических конструкций требуется повышенная морозостойкость');
    }

    return { concreteClass, frostMark, waterproofMark, notes };
  }

  // ──────────── HELPERS ────────────

  function el(tag: string, className: string): HTMLElement {
    const e = document.createElement(tag);
    if (className) e.className = className;
    return e;
  }

  function addSection(
    container: HTMLElement,
    title: string,
    options: SimpleOption[],
    selected: SimpleOption | null,
    gridClass: string,
    onSelect: (opt: SimpleOption) => void
  ) {
    const section = el('div', 'cc-section');
    const titleEl = el('div', 'cc-section-title');
    titleEl.textContent = title;
    section.appendChild(titleEl);

    const grid = el('div', 'cc-grid ' + gridClass);
    options.forEach(opt => {
      const btn = el('button', 'cc-option' + (selected?.id === opt.id ? ' selected' : '')) as HTMLButtonElement;
      let html = `<div class="cc-opt-label">${opt.label}</div>`;
      if (opt.description) html += `<div class="cc-opt-desc">${opt.description}</div>`;
      btn.innerHTML = html;
      btn.onclick = () => onSelect(opt);
      grid.appendChild(btn);
    });
    section.appendChild(grid);
    container.appendChild(section);
  }

  function makeResultItem(label: string, value: string, sub: string, accent: boolean): HTMLElement {
    const item = el('div', 'cc-result-item');
    item.innerHTML = `
      <div class="cc-result-label">${label}</div>
      <div class="cc-result-value${accent ? ' accent' : ''}">${value}</div>
      <div class="cc-result-sub">${sub}</div>
    `;
    return item;
  }

  // Initial render
  render();
}
