// скролл
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');

        if (targetId === '#top' || targetId === '#') {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        } else {
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
    });
});

// тема
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('.theme-icon');
const html = document.documentElement;

const savedTheme = localStorage.getItem('theme') || 'light';
html.setAttribute('data-theme', savedTheme);
updateThemeIcon(savedTheme);

themeToggle.addEventListener('click', () => {
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';

    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
});

function updateThemeIcon(theme) {
    themeIcon.textContent = theme === 'light' ? '☾' : '☼';
}

// UI
const testBtn = document.getElementById('testBtn');


const concreteData = {
    'B10': { class: 'B10', mark: 'М150', strength: '9.8-13.4', waterproof: 'W2-W4', frost: 'F50-F75', description: 'Подготовительные работы, подбетонка...' },
    'B12.5': { class: 'B12.5', mark: 'М150', strength: '16.1', waterproof: 'W2-W4', frost: 'F50-F75', description: 'Стяжки полов, дорожки, бордюры...' },
    'B15': { class: 'B15', mark: 'М200', strength: '19.6-22.5', waterproof: 'W4', frost: 'F100', description: 'Фундаменты малоэтажных зданий, отмостки...' },
    'B20': { class: 'B20', mark: 'М250', strength: '26.2', waterproof: 'W4-W6', frost: 'F100-F150', description: 'Ленточные фундаменты, плиты перекрытий...' },
    'B22.5': { class: 'B22.5', mark: 'М300', strength: '29.4', waterproof: 'W6', frost: 'F150-F200', description: 'Монолитные стены, фундаменты под коттеджи...' },
    'B25': { class: 'B25', mark: 'М350', strength: '32.7', waterproof: 'W6-W8', frost: 'F200', description: 'Многоэтажное жилое строительство, колонны...' },
    'B27.5': { class: 'B27.5', mark: 'М350', strength: '36.0', waterproof: 'W8', frost: 'F200-F250', description: 'Несущие конструкции повышенной нагрузки...' },
    'B30': { class: 'B30', mark: 'М400', strength: '39.3', waterproof: 'W8-W10', frost: 'F200-F300', description: 'Фундаменты многоэтажек, промышленные объекты...' },
    'B35': { class: 'B35', mark: 'М450', strength: '45.8', waterproof: 'W8-W14', frost: 'F200-F300', description: 'Мосты, эстакады, ответственные конструкции...' },
    'B40': { class: 'B40', mark: 'М550', strength: '52.4', waterproof: 'W10-W16', frost: 'F200-F300', description: 'Гидротехнические сооружения, специальные объекты...' },
    'B45': { class: 'B45', mark: 'М600', strength: '58.9', waterproof: 'W12-W20', frost: 'F100-F300', description: 'Высотное строительство, уникальные конструкции...' },
    'B50': { class: 'B50', mark: 'М650', strength: '65.5', waterproof: 'W12-W20', frost: 'F100-F300', description: 'Специальные военные и защитные сооружения...' },
    'B55': { class: 'B55', mark: 'М700', strength: '72.0', waterproof: 'W12-W20', frost: 'F100-F300', description: 'Критически важные объекты повышенной безопасности...' },
    'B60': { class: 'B60', mark: 'М800', strength: '78.0', waterproof: 'W12-W20', frost: 'F100-F300', description: 'Особо ответственные конструкции (АЭС, дамбы)...' },
    'B65': { class: 'B65', mark: 'М850', strength: '85.5', waterproof: 'W14-W20', frost: 'F200-F400', description: 'Специальное применение в экстремальных условиях.' },
    'B70': { class: 'B70', mark: 'М900', strength: '93.0', waterproof: 'W16-W20', frost: 'F300-F500', description: 'Уникальные инженерные сооружения.' }
};

const testVisualization = document.getElementById('testVisualization');
const currentStrengthEl = document.getElementById('currentStrength');
const progressFill = document.getElementById('progressFill');
const progressPercent = document.getElementById('progressPercent');
const maxStrengthEl = document.getElementById('maxStrength');
const testResultMessage = document.getElementById('testResultMessage');
const comparisonSection = document.getElementById('comparisonSection');
const strengthDetailTestEl = document.getElementById('strengthDetailTest');
const compConcrete = document.getElementById('compConcrete');
const compCars = document.getElementById('compCars');
const compSea = document.getElementById('compSea');
const comparisonText = document.getElementById('comparisonText');
const comparisonDivider = document.getElementById('comparisonDivider');
const comparisonTextSecondary = document.getElementById('comparisonTextSecondary');
const comparisonTitle = document.querySelector('.comparison-title');

let testInterval = null;
let currentTestValue = 0;
let maxStrengthNumeric = 0;
let isTesting = false;
let currentConcreteClass = null;
let comparisonTimeouts = [];
let currentClass = 'B15';
let currentStrength = 19.6;
/** object URL от последней AI-картинки — отозвать перед новой */
let aiImageObjectUrl = null;

const PROXY_API_KEY = 'sk-iCbM6JIJTT1SE4xQqvDXheITe7YGcjRp';

/** OpenAI-совместимая генерация изображений через ProxyAPI */
const PROXY_OPENAI_IMAGE_GEN_URL = 'https://api.proxyapi.ru/openai/v1/images/generations';

/** Текстовые ответы (чат) через тот же ProxyAPI */
const PROXY_OPENAI_CHAT_URL = 'https://api.proxyapi.ru/openai/v1/chat/completions';

const CONCRETE_ASSISTANT_SYSTEM =
    'Ты — ассистент образовательного сайта о бетоне (русский язык). Отвечай только по темам: классы и марки бетона (B10–B70), прочность на сжатие, область применения, уход и набор прочности, добавки, типовые ошибки при выборе. Пиши ясно и по делу; если вопрос не про бетон и строительные материалы — вежливо откажись и предложи задать вопрос по бетону. Напоминай при необходимости, что окончательные решения принимают специалисты по проекту.';

/** История диалога для chat/completions (без system — он подмешивается при запросе) */
let concreteChatHistory = [];

/** Прочность (МПа) по классу — как в таблице на странице */
const AI_CLASS_STRENGTH_MPA = {
    B10: 9.8,
    'B12.5': 16.1,
    B15: 19.6,
    B20: 26.2,
    'B22.5': 29.4,
    B25: 32.7,
    'B27.5': 36.0,
    B30: 39.3,
    B35: 45.8,
    B40: 52.4,
    B45: 58.9,
    B50: 65.5,
    B55: 72.0,
    B60: 78.0,
    B65: 85.5,
    B70: 93.0
};

const comparisonDataByClass = {
    B10: {
        strengthText: '9.8 МПа',
        title: 'Как выглядит прочность B10 в реальном мире',
        blocks: {
            concrete: { value: 'B10', sub: 'Прочность ~9.8 МПа' },
            cars: { value: '10 велосипедов', sub: 'Нагрузка на площади ладони' },
            sea: { value: 'Озеро Селигер', sub: 'Давление на глубине 97 метров' }
        },
        textHtml: `
            Давление 9.8 МПа, распределённое на площади ладони (~100 см²), эквивалентно весу 10 городских велосипедов.
            <br><br>
            Прочность B10 также соответствует давлению на глубине около 97 метров в пресноводном озере. Это примерно высота 32-этажного дома, полностью погружённого под воду.
            <ul>
                <li>9.8 МПа ≈ 98 атмосфер ≈ 100 кг/см²</li>
                <li>Давление в пресной воде растёт на 1 атм. каждые 10 метров</li>
            </ul>`,
        afterDividerText: 'Такая прочность сравнима с качественной кирпичной кладкой. Используется для подготовительных работ, где не требуется высокая несущая способность.'
    },
    B12_5: {
        strengthText: '16.1 МПа',
        title: 'Как выглядит прочность B12.5 в реальном мире',
        blocks: {
            concrete: { value: 'B12.5', sub: 'Прочность ~16.1 МПа' },
            cars: { value: '1,5 тонны', sub: 'Вес легкового авто на ладони' },
            sea: { value: 'Озеро Байкал', sub: 'Давление на глубине 160 метров' }
        },
        textHtml: `
            Давление 16.1 МПа эквивалентно весу легкового автомобиля (1.5 тонны), сконцентрированному на площади одной ладони.
            <br><br>
            Эта прочность также соответствует гидростатическому давлению на глубине 161 метр. Это глубже, чем средняя глубина многих известных озер.
            <ul>
                <li>16.1 МПа ≈ 161 атмосфера ≈ 164 кг/см²</li>
                <li>Глубина 161 м — это высота 50-этажного небоскреба</li>
            </ul>`,
        afterDividerText: 'Прочности B12.5 достаточно для создания стяжек полов, садовых дорожек и установки бордюров, где важна устойчивость к умеренным нагрузкам.'
    },
    B15: {
        strengthText: '19.6 МПа',
        title: 'Как выглядит прочность B15 в реальном мире',
        blocks: {
            concrete: { value: 'B15', sub: 'Прочность ~19.6 МПа' },
            cars: { value: '2 тонны', sub: 'Вес внедорожника на ладони' },
            sea: { value: 'Красное море', sub: 'Давление на глубине 196 метров' }
        },
        textHtml: `
            Давление 19.6 МПа сравнимо с весом большого внедорожника (2 тонны), приложенным к площади вашей ладони.
            <br><br>
            Такое же давление вы бы испытали на глубине 196 метров под водой. Это глубина, на которой работают профессиональные водолазы.
            <ul>
                <li>19.6 МПа ≈ 196 атмосфер ≈ 200 кг/см²</li>
            </ul>`,
        afterDividerText: 'Это популярный класс бетона для фундаментов малоэтажных зданий, отмосток и бетонных площадок, обеспечивающий надежность и долговечность.'
    },
    B20: {
        strengthText: '26.2 МПа',
        title: 'Как выглядит прочность B20 в реальном мире',
        blocks: {
            concrete: { value: 'B20', sub: 'Прочность ~26.2 МПа' },
            cars: { value: '2.5 тонны', sub: 'Вес слона на ладони' },
            sea: { value: 'Средиземное море', sub: 'Давление на глубине 260 метров' }
        },
        textHtml: `
            Давление 26.2 МПа эквивалентно весу небольшого слона, сосредоточенному на площади ладони.
            <br><br>
            В водной среде это соответствует давлению на глубине 262 метра — глубже, чем высота большинства небоскребов.
            <ul>
                <li>26.2 МПа ≈ 262 атмосферы ≈ 267 кг/см²</li>
            </ul>`,
        afterDividerText: 'B20 — универсальный конструкционный бетон, применяемый для ленточных фундаментов, плит перекрытий и несущих балок в частном домостроении.'
    },
    B22_5: {
        strengthText: '29.4 МПа',
        title: 'Как выглядит прочность B22.5 в реальном мире',
        blocks: {
            concrete: { value: 'B22.5', sub: 'Прочность ~29.4 МПа' },
            cars: { value: '3 тонны', sub: 'Вес грузовика-пикапа на ладони' },
            sea: { value: 'Эгейское море', sub: 'Давление на глубине 290 метров' }
        },
        textHtml: `
            Давление 29.4 МПа сравнимо с весом тяжелого пикапа Ford F-150, приложенным к площади ладони.
            <br><br>
            Такое же давление действует на глубине 294 метра под водой.
            <ul>
                <li>29.4 МПа ≈ 294 атмосферы ≈ 300 кг/см²</li>
            </ul>`,
        afterDividerText: 'Используется для монолитных стен, фундаментов под коттеджи и других конструкций, требующих повышенной прочности и надежности.'
    },
    B25: {
        strengthText: '32.7 МПа',
        title: 'Как выглядит прочность B25 в реальном мире',
        blocks: {
            concrete: { value: 'B25', sub: 'Прочность ~32.7 МПа' },
            cars: { value: '3 авто', sub: '3 легковых автомобиля на ладони' },
            sea: { value: 'Балтийское море', sub: 'Давление на глубине 320 метров' }
        },
        textHtml: `
            Давление 32.7 МПа, распределённое на площади человеческой ладони (~100 см²), эквивалентно весу трёх легковых автомобилей.
            <br><br>
            Прочность B25 соответствует давлению на глубине около 327 метров под водой. Это на ~80 метров ниже, чем находится известный затонувший корабль «Гогланд» в Финском заливе.
            <ul>
                <li>32.7 МПа ≈ 327 атмосфер ≈ 333 кг/см²</li>
                <li>На глубине 327 м давление ≈ 32.7 МПа</li>
            </ul>`,
        afterDividerText: 'Такая прочность позволяет бетонной плите толщиной 20 см выдержать собственный вес, умноженный примерно в 7 раз. Это стандарт для многоэтажного строительства.'
    },
    B27_5: {
        strengthText: '36.0 МПа',
        title: 'Как выглядит прочность B27.5 в реальном мире',
        blocks: {
            concrete: { value: 'B27.5', sub: 'Прочность ~36.0 МПа' },
            cars: { value: 'Городской автобус', sub: 'Часть веса автобуса на ладони' },
            sea: { value: 'Чёрное море', sub: 'Давление на глубине 360 метров' }
        },
        textHtml: `
            Давление 36.0 МПа — это как если бы на вашей ладони стоял небольшой городской автобус.
            <br><br>
            Такое давление встречается на глубине 360 метров. Это почти максимальная глубина Балтийского моря.
            <ul>
                <li>36.0 МПа ≈ 360 атмосфер ≈ 367 кг/см²</li>
            </ul>`,
        afterDividerText: 'Применяется для несущих конструкций с повышенной нагрузкой: колонн, балок и ригелей в жилых и коммерческих зданиях.'
    },
    B30: {
        strengthText: '39.3 МПа',
        title: 'Как выглядит прочность B30 в реальном мире',
        blocks: {
            concrete: { value: 'B30', sub: 'Прочность ~39.3 МПа' },
            cars: { value: 'Танк Т-34', sub: 'Часть веса танка на ладони' },
            sea: { value: 'Каспийское море', sub: 'Давление на глубине 390 метров' }
        },
        textHtml: `
            Прочность 39.3 МПа сравнима с давлением, которое оказал бы на вашу ладонь вес легендарного танка Т-34.
            <br><br>
            Под водой такое давление можно найти на глубине 393 метра.
            <ul>
                <li>39.3 МПа ≈ 393 атмосферы ≈ 400 кг/см²</li>
            </ul>`,
        afterDividerText: 'Это бетон для серьезных задач: фундаменты многоэтажных зданий, промышленные полы, опоры мостов и другие ответственные сооружения.'
    },
    B35: {
        strengthText: '45.8 МПа',
        title: 'Как выглядит прочность B35 в реальном мире',
        blocks: {
            concrete: { value: 'B35', sub: 'Прочность ~45.8 МПа' },
            cars: { value: 'Синий кит', sub: 'Часть веса кита на ладони' },
            sea: { value: 'Охотское море', sub: 'Давление на глубине 450 метров' }
        },
        textHtml: `
            Давление 45.8 МПа — это как если бы на вашей ладони уместилась часть самого большого животного на планете — синего кита.
            <br><br>
            Такое давление действует на глубине 458 метров, что сопоставимо с глубинами крупных морей.
            <ul>
                <li>45.8 МПа ≈ 458 атмосфер ≈ 467 кг/см²</li>
            </ul>`,
        afterDividerText: 'Критически важный материал для мостов, эстакад, гидротехнических сооружений и банковских хранилищ, где требуется максимальная надежность.'
    },
    B40: {
        strengthText: '52.4 МПа',
        title: 'Как выглядит прочность B40 в реальном мире',
        blocks: {
            concrete: { value: 'B40', sub: 'Прочность ~52.4 МПа' },
            cars: { value: 'Boeing 737', sub: 'Часть веса самолета на ладони' },
            sea: { value: 'Марианская впадина', sub: 'Давление на 520 м (начало)' }
        },
        textHtml: `
            Прочность 52.4 МПа сравнима с давлением от части взлетного веса пассажирского самолета Boeing 737, сконцентрированного на площади ладони.
            <br><br>
            Это давление на глубине 524 метра под водой. На таких глубинах начинается зона вечной темноты в океане.
            <ul>
                <li>52.4 МПа ≈ 524 атмосферы ≈ 534 кг/см²</li>
            </ul>`,
        afterDividerText: 'Высокопрочный бетон для специальных объектов: гидротехнические сооружения (плотины, шлюзы), тоннели метро, военные бункеры.'
    },
    B45: {
        strengthText: '58.9 МПа',
        title: 'Как выглядит прочность B45 в реальном мире',
        blocks: {
            concrete: { value: 'B45', sub: 'Прочность ~58.9 МПа' },
            cars: { value: 'Статуя Свободы', sub: 'Часть веса статуи на ладони' },
            sea: { value: 'Океан', sub: 'Давление на глубине 590 метров' }
        },
        textHtml: `
            Давление 58.9 МПа — это как если бы на вашей ладони стояла часть металлического каркаса Статуи Свободы.
            <br><br>
            В океане такое давление можно встретить на глубине почти 600 метров.
            <ul>
                <li>58.9 МПа ≈ 589 атмосфер ≈ 600 кг/см²</li>
            </ul>`,
        afterDividerText: 'Используется в высотном строительстве, для уникальных конструкций со сложной геометрией и особо нагруженных элементов.'
    },
    B50: {
        strengthText: '65.5 МПа',
        title: 'Как выглядит прочность B50 в реальном мире',
        blocks: {
            concrete: { value: 'B50', sub: 'Прочность ~65.5 МПа' },
            cars: { value: 'МКС', sub: 'Часть веса МКС на ладони' },
            sea: { value: 'Глубокий океан', sub: 'Давление на глубине 650 метров' }
        },
        textHtml: `
            Прочность 65.5 МПа сравнима с давлением от части массы Международной космической станции, приложенной к площади ладони.
            <br><br>
            Это давление на глубине 655 метров. Туда не проникает солнечный свет, и обитают лишь глубоководные существа.
            <ul>
                <li>65.5 МПа ≈ 655 атмосфер ≈ 668 кг/см²</li>
            </ul>`,
        afterDividerText: 'Специальный бетон для военных и защитных сооружений, конструкций атомных электростанций и объектов, требующих экстремальной прочности.'
    },
    B55: {
        strengthText: '72.0 МПа',
        title: 'Как выглядит прочность B55 в реальном мире',
        blocks: {
            concrete: { value: 'B55', sub: 'Прочность ~72.0 МПа' },
            cars: { value: 'Шаттл "Индевор"', sub: 'Часть веса на ладони' },
            sea: { value: 'Глубина 720 м', sub: 'Давление в глубоком океане' }
        },
        textHtml: `
            Давление 72.0 МПа сравнимо с тем, как если бы на вашей ладони уместилась часть веса космического шаттла "Индевор".
            <br><br>
            Такое давление встречается на глубине 720 метров. Это зона, куда не проникает солнечный свет и где обитают только приспособленные к экстремальным условиям существа.
            <ul>
                <li>72.0 МПа ≈ 720 атмосфер ≈ 734 кг/см²</li>
            </ul>`,
        afterDividerText: 'Применяется для особо ответственных конструкций, работающих в агрессивных средах, например, для опор сверхвысоких небоскребов.'
    },
    B60: {
        strengthText: '78.0 МПа',
        title: 'Как выглядит прочность B60 в реальном мире',
        blocks: {
            concrete: { value: 'B60', sub: 'Прочность ~78.0 МПа' },
            cars: { value: 'Эйфелева башня', sub: 'Часть веса башни на ладони' },
            sea: { value: 'Бездна', sub: 'Давление на глубине 780 метров' }
        },
        textHtml: `
            Давление 78.0 МПа — это как если бы на вашей ладони стояла часть металлоконструкций Эйфелевой башни.
            <br><br>
            Такое давление встречается на глубине 780 метров — в зоне "бездны", где царит абсолютная темнота и огромное давление.
            <ul>
                <li>78.0 МПа ≈ 780 атмосфер ≈ 795 кг/см²</li>
            </ul>`,
        afterDividerText: 'Сверхпрочный бетон для уникальных инженерных задач: опоры сверхвысоких небоскребов, конструкции для работы в агрессивных средах (АЭС, дамбы).'
    },
    B65: {
        strengthText: '85.5 МПа',
        title: 'Как выглядит прочность B65 в реальном мире',
        blocks: {
            concrete: { value: 'B65', sub: 'Прочность ~85.5 МПа' },
            cars: { value: 'Маневровый тепловоз', sub: 'Часть веса на ладони' },
            sea: { value: 'Глубина 850 м', sub: 'Давление в сумеречной зоне' }
        },
        textHtml: `
            Прочность 85.5 МПа можно сравнить с давлением от части веса маневрового тепловоза, сконцентрированного на площади ладони.
            <br><br>
            Это давление на глубине 855 метров. В океане эта зона называется "сумеречной", здесь почти нет света.
            <ul>
                <li>85.5 МПа ≈ 855 атмосфер ≈ 872 кг/см²</li>
            </ul>`,
        afterDividerText: 'Используется для специальных применений в экстремальных условиях, для строительства объектов с повышенными требованиями к безопасности.'
    },
    B70: {
        strengthText: '93.0 МПа',
        title: 'Как выглядит прочность B70 в реальном мире',
        blocks: {
            concrete: { value: 'B70', sub: 'Прочность ~93.0 МПа' },
            cars: { value: 'Гидравлический пресс', sub: 'Промышленное давление' },
            sea: { value: '1 километр', sub: 'Давление на глубине 930 м' }
        },
        textHtml: `
            Прочность 93.0 МПа выходит за рамки бытовых сравнений и сопоставима с давлением в промышленных гидравлических прессах.
            <br><br>
            Под водой такое давление можно найти на глубине 930 метров — почти один километр!
            <ul>
                <li>93.0 МПа ≈ 930 атмосфер ≈ 948 кг/см²</li>
            </ul>`,
        afterDividerText: 'Элита в мире бетонов. Используется для уникальных инженерных сооружений, где прочность является абсолютным приоритетом.'
    }
};


function openPanel(concreteClass) {
    const data = concreteData[concreteClass];
    if (!data) return;

    resetTestState();
    currentConcreteClass = concreteClass;

    document.getElementById('panelTitle').textContent = `Класс ${data.class}`;
    document.getElementById('panelClass').textContent = data.class;
    document.getElementById('panelMark').textContent = data.mark;
    document.getElementById('panelStrength').textContent = `${data.strength} МПа`;
    document.getElementById('panelWaterproof').textContent = data.waterproof;
    document.getElementById('panelFrost').textContent = data.frost;
    document.getElementById('panelDescription').textContent = data.description;

    if (testBtn) {
        testBtn.disabled = false;
        testBtn.textContent = 'Протестировать прочность';
        if (testVisualization && strengthDetailTestEl) {
            strengthDetailTestEl.insertBefore(testBtn, testVisualization);
        } else if (testVisualization) {
            testVisualization.parentNode.insertBefore(testBtn, testVisualization);
        }
    }
}


function parseStrengthValue(strengthStr) {
    if (!strengthStr) return 0;
    const normalized = String(strengthStr).replace(',', '.').replace('МПа', '').trim();
    const rangeMatch = normalized.match(/([\d.]+)\s*-\s*([\d.]+)/);
    if (rangeMatch) {
        return parseFloat(rangeMatch[2]);
    }
    const singleMatch = normalized.match(/([\d.]+)/);
    return singleMatch ? parseFloat(singleMatch[1]) : 0;
}

function setConcreteClass(className, strengthValue) {
    if (!className) return;
    currentClass = className;
    if (typeof strengthValue === 'number' && !Number.isNaN(strengthValue)) {
        currentStrength = strengthValue;
    } else if (AI_CLASS_STRENGTH_MPA[className] != null) {
        currentStrength = AI_CLASS_STRENGTH_MPA[className];
    }
    window.currentClass = currentClass;
    window.currentStrength = currentStrength;

    document.querySelectorAll('.concrete-class-pill').forEach((pill) => {
        pill.classList.toggle('is-selected', pill.getAttribute('data-class') === className);
    });

    syncAiDestructionModule();
}

window.setConcreteClass = setConcreteClass;

function selectConcreteClass(className, strengthValue) {
    if (!className) return;
    setConcreteClass(className, strengthValue);
    openPanel(className);

    if (window.__comparatorController && typeof window.__comparatorController.updateByClass === 'function') {
        window.__comparatorController.updateByClass(className, { animate: true, syncSelect: true });
    }
}

window.selectConcreteClass = selectConcreteClass;

function applyComparisonContent(concreteClass) {
    const comparisonKey = concreteClass.replace('.', '_');
    const data = comparisonDataByClass[comparisonKey];
    if (!data) {
        console.error(`No comparison data for class: ${concreteClass} (key: ${comparisonKey})`);
        return;
    }

    if (comparisonTitle) comparisonTitle.textContent = data.title;

    if (compConcrete) {
        const value = compConcrete.querySelector('.comparison-value');
        const sub = compConcrete.querySelector('.comparison-sub');
        if (value) value.textContent = data.blocks.concrete.value;
        if (sub) sub.textContent = data.blocks.concrete.sub;
    }

    if (compCars) {
        const value = compCars.querySelector('.comparison-value');
        const sub = compCars.querySelector('.comparison-sub');
        if (value) value.textContent = data.blocks.cars.value;
        if (sub) sub.textContent = data.blocks.cars.sub;
    }

    if (compSea) {
        const value = compSea.querySelector('.comparison-value');
        const sub = compSea.querySelector('.comparison-sub');
        if (value) value.textContent = data.blocks.sea.value;
        if (sub) sub.textContent = data.blocks.sea.sub;
    }

    if (comparisonText) comparisonText.innerHTML = data.textHtml;
    if (comparisonTextSecondary) comparisonTextSecondary.innerHTML = data.afterDividerText;

}


function resetComparison() {
    if (comparisonTimeouts.length) {
        comparisonTimeouts.forEach(t => clearTimeout(t));
        comparisonTimeouts = [];
    }
    if (comparisonSection) {
        comparisonSection.style.display = 'none';
        comparisonSection.classList.remove('active');
    }
    [compConcrete, compCars, compSea].forEach(el => {
        if (el) el.classList.remove('visible');
    });
    if (comparisonText) comparisonText.classList.remove('visible');
    if (comparisonDivider) comparisonDivider.classList.remove('visible');
    if (comparisonTextSecondary) comparisonTextSecondary.classList.remove('visible');
}

function resetTestState() {
    if (testInterval) {
        clearInterval(testInterval);
        testInterval = null;
    }
    isTesting = false;
    currentTestValue = 0;
    maxStrengthNumeric = 0;

    if (testVisualization) testVisualization.style.display = 'none';
    if (testBtn) {
        testBtn.style.display = 'block';
        testBtn.disabled = false;
        testBtn.textContent = 'Протестировать прочность';
        if (testVisualization && strengthDetailTestEl) {
            strengthDetailTestEl.insertBefore(testBtn, testVisualization);
        } else if (testVisualization) {
            testVisualization.parentNode.insertBefore(testBtn, testVisualization);
        }
    }

    if (progressFill) progressFill.style.width = '0%';
    if (progressPercent) progressPercent.textContent = '0%';
    if (currentStrengthEl) currentStrengthEl.textContent = '0.0';
    if (maxStrengthEl) maxStrengthEl.textContent = '100%';
    if (testResultMessage) testResultMessage.textContent = '';
    resetComparison();
}

function startTest() {
    if (!testBtn || !testVisualization || isTesting) return;

    const panelStrengthEl = document.getElementById('panelStrength');
    const panelClassEl = document.getElementById('panelClass');
    const strengthText = panelStrengthEl ? panelStrengthEl.textContent : '';
    const concreteClass = panelClassEl ? panelClassEl.textContent : '';

    const numericStrength = parseStrengthValue(strengthText);
    if (!numericStrength) return;

    currentConcreteClass = concreteClass || null;
    maxStrengthNumeric = numericStrength;

    testVisualization.style.display = 'block';
    testBtn.style.display = 'none';

    currentTestValue = 0;
    isTesting = true;
    if (progressFill) progressFill.style.width = '0%';
    if (progressPercent) progressPercent.textContent = '0%';
    if (currentStrengthEl) currentStrengthEl.textContent = '0.0';
    if (maxStrengthEl) maxStrengthEl.textContent = `${maxStrengthNumeric.toFixed(1)} МПа`;
    if (testResultMessage) testResultMessage.textContent = '';
    resetComparison();

    const incrementPerSecond = maxStrengthNumeric / 6;
    const incrementPerInterval = incrementPerSecond / 10;

    testInterval = setInterval(() => {
        currentTestValue += incrementPerInterval;
        if (currentTestValue >= maxStrengthNumeric) {
            currentTestValue = maxStrengthNumeric;
            updateTestVisualization();
            stopTest();
            return;
        }
        updateTestVisualization();
    }, 100);
}

function updateTestVisualization() {
    if (!maxStrengthNumeric || !progressFill) return;
    if (currentStrengthEl) {
        currentStrengthEl.textContent = currentTestValue.toFixed(1);
    }

    const percent = (currentTestValue / maxStrengthNumeric) * 100;
    if (progressPercent) progressPercent.textContent = `${Math.round(percent)}%`;
    progressFill.style.width = `${Math.min(percent, 100)}%`;

    let color;
    if (percent < 60) {
        color = '#48bb78';
    } else if (percent < 90) {
        color = '#f6e05e';
    } else {
        color = '#e53e3e';
    }
    progressFill.style.background = color;
}

function stopTest() {
    if (testInterval) {
        clearInterval(testInterval);
        testInterval = null;
    }
    isTesting = false;

    if (testBtn) {
        testBtn.style.display = 'block';
        testBtn.textContent = 'Протестировать прочность ещё раз';
    }

    const panelClassEl = document.getElementById('panelClass');
    const classLabel = panelClassEl ? panelClassEl.textContent : '';
    const comparisonKey = classLabel.replace('.', '_');

    if (testResultMessage && maxStrengthNumeric) {
        const message = `Прочность ${classLabel} составляет ${maxStrengthNumeric.toFixed(1)} МПа.`;
        testResultMessage.textContent = message;
    }

    if (testBtn && testResultMessage) {
        const parent = strengthDetailTestEl || testBtn.parentNode;
        parent.appendChild(testResultMessage);
        parent.appendChild(testBtn);
    }

    if (classLabel && comparisonDataByClass[comparisonKey]) {
        showComparisonAfterTest();
    }
}

function showComparisonAfterTest() {
    const comparisonKey = currentConcreteClass ? currentConcreteClass.replace('.', '_') : null;
    if (!comparisonSection || !currentConcreteClass || !comparisonDataByClass[comparisonKey]) return;

    resetComparison();
    applyComparisonContent(currentConcreteClass);
    comparisonSection.style.display = 'block';
    comparisonTimeouts.push(setTimeout(() => {
        comparisonSection.classList.add('active');
    }, 20));
    comparisonTimeouts.push(setTimeout(() => {
        if (compConcrete) compConcrete.classList.add('visible');
    }, 200));
    comparisonTimeouts.push(setTimeout(() => {
        if (compCars) compCars.classList.add('visible');
    }, 600));
    comparisonTimeouts.push(setTimeout(() => {
        if (compSea) compSea.classList.add('visible');
    }, 1000));
    comparisonTimeouts.push(setTimeout(() => {
        if (comparisonText) comparisonText.classList.add('visible');
        if (comparisonDivider) comparisonDivider.classList.add('visible');
        if (comparisonTextSecondary) comparisonTextSecondary.classList.add('visible');
    }, 1500));
}

if (testBtn) {
    testBtn.addEventListener('click', startTest);
}

// карусель
const carouselSlides = document.getElementById('carouselSlides');
const carouselPrev = document.getElementById('carouselPrev');
const carouselNext = document.getElementById('carouselNext');
const carouselIndicators = document.getElementById('carouselIndicators');

if (carouselSlides) {
    const totalSlides = document.querySelectorAll('.carousel-slide').length;
    let currentCarouselSlide = 0;

    for (let i = 0; i < totalSlides; i++) {
        const indicator = document.createElement('button');
        indicator.className = 'carousel-indicator';
        if (i === 0) indicator.classList.add('active');
        indicator.setAttribute('aria-label', `Перейти к слайду ${i + 1}`);
        indicator.addEventListener('click', () => goToSlide(i));
        carouselIndicators.appendChild(indicator);
    }
    const indicators = document.querySelectorAll('.carousel-indicator');

    function updateCarousel() {
        const translateX = -currentCarouselSlide * (100 / totalSlides);
        carouselSlides.style.transform = `translateX(${translateX}%)`;
        indicators.forEach((ind, i) => ind.classList.toggle('active', i === currentCarouselSlide));
    }

    function goToSlide(index) { currentCarouselSlide = index; updateCarousel(); }
    function nextSlide() { currentCarouselSlide = (currentCarouselSlide + 1) % totalSlides; updateCarousel(); }
    function prevSlide() { currentCarouselSlide = (currentCarouselSlide - 1 + totalSlides) % totalSlides; updateCarousel(); }

    carouselPrev.addEventListener('click', prevSlide);
    carouselNext.addEventListener('click', nextSlide);
}


// инициализация
function initialize() {
    const pills = document.querySelectorAll('.concrete-class-pill');
    pills.forEach((pill) => {
        pill.addEventListener('click', () => {
            const selectedClass = pill.getAttribute('data-class');
            const selectedStrength = parseFloat(pill.getAttribute('data-strength'));
            if (typeof window.selectConcreteClass === 'function') {
                window.selectConcreteClass(selectedClass, selectedStrength);
            } else {
                setConcreteClass(selectedClass, selectedStrength);
                openPanel(selectedClass);
            }
        });
    });

    const defaultPill = document.querySelector('.concrete-class-pill[data-class="B15"]') || pills[0];
    if (defaultPill) {
        const defaultClass = defaultPill.getAttribute('data-class');
        const defaultStrength = parseFloat(defaultPill.getAttribute('data-strength'));
        if (typeof window.selectConcreteClass === 'function') {
            window.selectConcreteClass(defaultClass, defaultStrength);
        } else {
            setConcreteClass(defaultClass, defaultStrength);
            openPanel(defaultClass);
        }
    }
}

function formatMpa(value) {
    return `${Number(value || 0).toFixed(1)} МПа`;
}

const AI_DAMAGE_LABELS_RU = {
    intact: 'целый',
    micro: 'микротрещины',
    significant: 'значительные повреждения',
    destruction: 'разрушение'
};

const AI_STRUCTURE_LABELS_RU = {
    panel_building: 'Панельный жилой дом',
    girder_bridge: 'Балочный мост',
    industrial: 'Промышленное здание',
    retaining_wall: 'Подпорная стена',
    axial_column: 'Колонна (ц.с.)'
};

/** Добавляется ко всем промптам: нейтральный свет, без «мрачного» кино-стиля */
const AI_PROMPT_REALISM_SUFFIX =
    ' Highly photorealistic, natural soft daylight or gentle even overcast, balanced neutral color grading, documentary engineering photography. No dramatic storm lighting, no cinematic gloom, no horror mood, no dark moody grading.';

/**
 * Промпты на английском: фото по типу конструкции и уровню повреждения.
 * P/R: <0.5 целый; 0.5–0.75 микротрещины; 0.75–1.0 значительные; >1.0 разрушение.
 */
const AI_DESTRUCTION_PROMPTS = {
    panel_building: {
        intact: 'Photorealistic photo of a modern multi-story panel apartment building made of monolithic reinforced concrete. Facade is intact, no cracks, smooth concrete surface with slight texture. Sunny daylight, clear sky, eye-level view, high resolution, architectural photography style.',
        micro: 'Photorealistic photo of a multi-story concrete panel building. Thin hairline cracks appear along panel joints and near window corners. Concrete surface still integral, no spalling. Overcast daylight, soft shadows, detailed close-up of facade, ultra HD.',
        significant: 'Photorealistic photo of a concrete panel building with visible structural damage. Wide cracks on several panels, small concrete chips missing at edges, slight deformation of balcony slabs. Soft overcast sky, oblique angle, sharp focus, high detail.',
        destruction: 'Photorealistic photo of a heavily damaged concrete apartment building. Collapsed corner, exposed rebar, large fallen concrete chunks, deep spalling. Debris on the ground. Ruins after overload. Even natural outdoor daylight, wide angle, ultra realistic.'
    },
    girder_bridge: {
        intact: 'Photorealistic photo of a reinforced concrete girder bridge over a river. Clean, smooth concrete surface on piers and beams. No cracks, perfect condition. Bright sunny day, blue sky, water reflection, perspective view from riverbank, 8K.',
        micro: 'Photorealistic photo of a concrete bridge. Thin vertical hairline cracks appear on the central pier and along the bottom of girders. Concrete color slightly faded, no spalling. Overcast daylight, side angle, high resolution, detailed.',
        significant: 'Photorealistic photo of a concrete bridge with moderate damage. Wide cracks on several girders, small concrete pieces fallen on the roadbed, slight sagging of one girder. Light cloudy sky, low-angle shot, sharp focus, ultra HD.',
        destruction: 'Photorealistic photo of a collapsed concrete bridge. One span completely broken, exposed twisted rebar, large concrete debris in the water. Severe structural failure. Clear late-afternoon daylight, wide panoramic view, documentary style, ultra realistic.'
    },
    industrial: {
        intact: 'Photorealistic photo of an industrial reinforced concrete building with massive columns and roof trusses. Concrete surface is intact, smooth grey, no visible defects. Bright daylight, clear sky, front view, high resolution architectural photo.',
        micro: 'Photorealistic photo of an industrial concrete building. Thin vertical cracks appear on the surface of two columns, near the base. No spalling, structure stable. Overcast daylight, side lighting, detailed close-up of columns, ultra HD.',
        significant: 'Photorealistic photo of an industrial concrete building with severe cracks. Wide cracks on several columns, concrete cover spalling in areas, exposed aggregate. One truss has a visible crack. Soft overcast sky, wide angle, high detail.',
        destruction: 'Photorealistic photo of a collapsed industrial concrete building. Several columns shattered, roof truss fallen, large concrete debris and bent rebar scattered. Complete structural failure. Neutral daylight, wide panoramic view, post-disaster realistic.'
    },
    retaining_wall: {
        intact: 'Photorealistic photo of a reinforced concrete retaining wall holding back soil. Wall surface is smooth, no cracks, clean concrete. Bright sunny day, green grass on top, clear sky, perspective view, high resolution.',
        micro: 'Photorealistic photo of a concrete retaining wall with thin horizontal hairline cracks near the base. No bulging, still functional. Overcast daylight, side angle, sharp focus, detailed concrete texture, ultra HD.',
        significant: 'Photorealistic photo of a concrete retaining wall with wide horizontal and diagonal cracks, slight bulging outward. Small concrete chips fallen. Soft overcast sky, low angle, even natural lighting, high detail.',
        destruction: 'Photorealistic photo of a collapsed concrete retaining wall. Large section of wall toppled, soil and concrete debris spread. Exposed rebar ends. Complete failure. Neutral outdoor daylight, wide angle, realistic documentary photo.'
    },
    axial_column: {
        intact: 'Photorealistic close-up photo of a reinforced concrete column in a building. Smooth grey surface, no cracks, clean edges. Even lighting from windows, high resolution, architectural detail.',
        micro: 'Photorealistic close-up photo of a concrete column with thin vertical hairline cracks along the surface. No spalling, concrete still intact. Overcast daylight, side lighting, sharp focus, ultra HD.',
        significant: 'Photorealistic close-up photo of a concrete column with wide vertical cracks, spalling of concrete cover, exposed aggregate, and visible rust stains on rebar. Soft even side lighting, high detail.',
        destruction: 'Photorealistic close-up photo of a crushed concrete column. Concrete shattered, rebar buckled and exposed, large fragments fallen. Complete loss of load-bearing capacity. Neutral daylight, wide angle, realistic.'
    }
};

function getDamageLevelKeyFromRatio(ratio) {
    const r = Number(ratio);
    if (!Number.isFinite(r) || r < 0) return 'intact';
    if (r < 0.5) return 'intact';
    if (r < 0.75) return 'micro';
    if (r <= 1.0) return 'significant';
    return 'destruction';
}

function getSelectedAiStructureKey() {
    const btn = document.querySelector('.ai-structure-btn.is-selected');
    if (!btn || !btn.getAttribute) return null;
    const key = btn.getAttribute('data-structure');
    return key && AI_DESTRUCTION_PROMPTS[key] ? key : null;
}

function getAiDestructionPrompt(structureKey, loadMpa, strengthMpa) {
    const strengthNum = Number(strengthMpa);
    const loadNum = Number(loadMpa);
    if (!structureKey || !AI_DESTRUCTION_PROMPTS[structureKey]) return null;
    if (!(strengthNum > 0)) return null;
    const ratio = loadNum / strengthNum;
    const level = getDamageLevelKeyFromRatio(ratio);
    const base = AI_DESTRUCTION_PROMPTS[structureKey][level];
    if (!base) return null;
    return `${base}${AI_PROMPT_REALISM_SUFFIX}`;
}

function getAiDestructionMeta(loadMpa, strengthMpa, structureKey) {
    const strengthNum = Number(strengthMpa);
    const loadNum = Number(loadMpa);
    const ratio = strengthNum > 0 ? loadNum / strengthNum : NaN;
    const levelKey = getDamageLevelKeyFromRatio(ratio);
    return {
        ratio,
        levelKey,
        damageLabelRu: AI_DAMAGE_LABELS_RU[levelKey] || '',
        structureLabelRu: AI_STRUCTURE_LABELS_RU[structureKey] || structureKey
    };
}

function showAiResultCaption(meta) {
    const cap = document.getElementById('aiResultCaption');
    if (!cap || !meta) return;
    const {
        className,
        strengthMpa,
        loadMpa,
        structureLabelRu,
        damageLabelRu,
        ratio
    } = meta;
    cap.hidden = false;
    cap.classList.remove('ai-result-caption--visible', 'ai-result-caption--error');
    const prStr = Number.isFinite(ratio) ? Number(ratio).toFixed(2) : '—';
    cap.textContent = `${structureLabelRu} · Класс ${className} · ${Number(strengthMpa).toFixed(1)} МПа · нагрузка ${Number(loadMpa).toFixed(1)} МПа · P/R ${prStr} · ${damageLabelRu}`;
    requestAnimationFrame(() => {
        requestAnimationFrame(() => cap.classList.add('ai-result-caption--visible'));
    });
}

function showAiResultCaptionError(message) {
    const cap = document.getElementById('aiResultCaption');
    if (!cap) return;
    cap.hidden = false;
    cap.classList.remove('ai-result-caption--visible');
    cap.classList.add('ai-result-caption--error');
    cap.textContent = message;
    requestAnimationFrame(() => {
        requestAnimationFrame(() => cap.classList.add('ai-result-caption--visible'));
    });
}

function resetAiResultCaption() {
    const cap = document.getElementById('aiResultCaption');
    if (!cap) return;
    cap.hidden = true;
    cap.classList.remove('ai-result-caption--visible', 'ai-result-caption--error');
    cap.textContent = '';
}

function syncAiDestructionModule() {
    const selectEl = document.getElementById('aiClassSelect');
    const strengthEl = document.getElementById('aiCurrentStrength');
    const rangeEl = document.getElementById('aiLoadRange');
    if (!strengthEl || !rangeEl) return;

    if (selectEl && selectEl.value !== currentClass) {
        selectEl.value = currentClass;
    }

    const maxLoad = Number((currentStrength * 1.5).toFixed(1));
    strengthEl.textContent = formatMpa(currentStrength);
    rangeEl.max = String(maxLoad);
    rangeEl.value = '0';
    updateAiLoadInfo();
}

function updateAiLoadInfo() {
    const rangeEl = document.getElementById('aiLoadRange');
    const loadValueEl = document.getElementById('aiLoadValue');
    const balanceTextEl = document.getElementById('aiBalanceText');
    const prRowEl = document.getElementById('aiPrDamageRow');
    if (!rangeEl || !loadValueEl || !balanceTextEl) return;

    const load = parseFloat(rangeEl.value) || 0;
    loadValueEl.textContent = formatMpa(load);

    if (currentStrength <= 0) {
        balanceTextEl.textContent = 'Недостаточно данных о прочности';
        if (prRowEl) prRowEl.textContent = 'P/R: — · Уровень: —';
        return;
    }

    const ratio = load / currentStrength;
    const levelKey = getDamageLevelKeyFromRatio(ratio);
    const dmgRu = AI_DAMAGE_LABELS_RU[levelKey] || '—';
    if (prRowEl) {
        prRowEl.textContent = `P/R: ${ratio.toFixed(2)} · Уровень: ${dmgRu}`;
    }

    if (load > currentStrength) {
        const overPct = ((load - currentStrength) / currentStrength) * 100;
        balanceTextEl.textContent = `Нагрузка превышает прочность на ${overPct.toFixed(1)}%`;
    } else {
        const reservePct = ((currentStrength - load) / currentStrength) * 100;
        balanceTextEl.textContent = `Запас прочности ${reservePct.toFixed(1)}%`;
    }
}

/**
 * ProxyAPI / OpenAI-совместимые ответы images/generations:
 * - data[0].url (HTTPS)
 * - data[0].b64_json (картинка в base64 — часто так отдают модели без публичного URL)
 */
function extractImageSrcFromGenerationsJson(data) {
    if (!data) return null;
    const list = data.data;
    if (!Array.isArray(list) || !list.length) return null;
    const first = list[0];
    if (!first || typeof first !== 'object') return null;
    if (first.url && typeof first.url === 'string') {
        return first.url.trim();
    }
    if (first.b64_json && typeof first.b64_json === 'string') {
        return `data:image/png;base64,${first.b64_json}`;
    }
    return null;
}

/**
 * Относительный url (например "img-abc.png") иначе превращается в file:///.../img-abc.png и даёт 404.
 * База — хост OpenAI-совместимого API ProxyAPI.
 */
function resolveGenerationsImageUrl(raw) {
    if (!raw || typeof raw !== 'string') return null;
    const s = raw.trim();
    if (s.startsWith('data:image/')) return s;
    if (/^https?:\/\//i.test(s)) return s;
    if (s.startsWith('//')) return `https:${s}`;
    try {
        return new URL(s, 'https://api.proxyapi.ru/').href;
    } catch {
        return s;
    }
}

function revokeAiImageObjectUrl() {
    if (aiImageObjectUrl) {
        URL.revokeObjectURL(aiImageObjectUrl);
        aiImageObjectUrl = null;
    }
}

/**
 * Только API-хост: относительные пути и защищённые файлы — fetch + Bearer.
 * content.proxyapi.ru / CDN / Azure — публичные подписанные URL: только <img>, без Authorization
 * (иначе браузер шлёт CORS preflight и запрос блокируется).
 */
function waitForImageDecode(imageEl, resolvedSrc, timeoutMs) {
    return new Promise((resolve, reject) => {
        let settled = false;
        const timer = setTimeout(() => {
            if (settled) return;
            settled = true;
            cleanup();
            reject(new Error(`Таймаут загрузки (${Math.round(timeoutMs / 1000)} с)`));
        }, timeoutMs);

        const cleanup = () => {
            clearTimeout(timer);
            imageEl.removeEventListener('load', onLoad);
            imageEl.removeEventListener('error', onErr);
        };

        const onLoad = () => {
            if (settled) return;
            settled = true;
            cleanup();
            resolve();
        };

        const onErr = () => {
            if (settled) return;
            settled = true;
            cleanup();
            reject(new Error('Не удалось загрузить изображение по ссылке (404, истёкший URL или блок).'));
        };

        imageEl.addEventListener('load', onLoad);
        imageEl.addEventListener('error', onErr);
        imageEl.removeAttribute('src');
        imageEl.src = resolvedSrc;
    });
}

async function applyGenerationsImageToElement(imageEl, rawSrc) {
    if (!rawSrc) throw new Error('Пустой источник изображения');
    revokeAiImageObjectUrl();

    if (rawSrc.startsWith('data:image/')) {
        imageEl.src = rawSrc;
        if (imageEl.decode && typeof imageEl.decode === 'function') {
            try {
                await imageEl.decode();
            } catch {
                /* ignore */
            }
        }
        return;
    }

    const resolved = resolveGenerationsImageUrl(rawSrc);
    let host = '';
    try {
        host = new URL(resolved).hostname;
    } catch {
        host = '';
    }

    const useAuthFetch = host === 'api.proxyapi.ru';

    if (useAuthFetch) {
        try {
            const r = await fetch(resolved, {
                headers: { Authorization: `Bearer ${PROXY_API_KEY}` },
                mode: 'cors',
                credentials: 'omit'
            });
            const ct = r.headers.get('content-type') || '';
            if (!r.ok) {
                const errText = await r.text().catch(() => '');
                throw new Error(`HTTP ${r.status}. ${errText.slice(0, 200)}`);
            }
            if (!ct.startsWith('image/')) {
                const errText = await r.text().catch(() => '');
                throw new Error(`Ожидалось image/*, получено: ${ct || errText.slice(0, 120)}`);
            }
            const blob = await r.blob();
            aiImageObjectUrl = URL.createObjectURL(blob);
            imageEl.src = aiImageObjectUrl;
            return;
        } catch (fetchErr) {
            if (typeof console !== 'undefined' && console.warn) {
                console.warn('[images] fetch с ключом не удался, пробуем <img>:', fetchErr);
            }
            await waitForImageDecode(imageEl, resolved, 90000);
        }
        return;
    }

    await waitForImageDecode(imageEl, resolved, 90000);
}

function getDebugPayloadPreview(data) {
    if (!data || typeof data !== 'object') return 'Ответ не является JSON-объектом';
    const rootKeys = Object.keys(data);
    const firstItem = Array.isArray(data.data) && data.data[0] ? data.data[0] : null;
    const firstItemKeys = firstItem && typeof firstItem === 'object' ? Object.keys(firstItem) : [];
    return `Ключи корня: ${rootKeys.join(', ') || '(пусто)'}; ключи data[0]: ${firstItemKeys.join(', ') || '(нет data[0])'}`;
}

async function proxyOpenAiImagesGenerations(requestBody) {
    const response = await fetch(PROXY_OPENAI_IMAGE_GEN_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${PROXY_API_KEY}`
        },
        body: JSON.stringify(requestBody)
    });
    const rawText = await response.text();
    let data = null;
    let parseError = false;
    try {
        data = rawText ? JSON.parse(rawText) : null;
    } catch {
        parseError = true;
    }
    return { response, rawText, data, parseError };
}

async function proxyOpenAiChatCompletions(requestBody) {
    const response = await fetch(PROXY_OPENAI_CHAT_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${PROXY_API_KEY}`
        },
        body: JSON.stringify(requestBody)
    });
    const rawText = await response.text();
    let data = null;
    let parseError = false;
    try {
        data = rawText ? JSON.parse(rawText) : null;
    } catch {
        parseError = true;
    }
    return { response, rawText, data, parseError };
}

function appendConcreteChatMessage(role, text, isError) {
    const wrap = document.getElementById('aiChatMessages');
    if (!wrap) return;
    const row = document.createElement('div');
    row.className = `ai-chat-msg ai-chat-msg--${role}${isError ? ' ai-chat-msg--error' : ''}`;
    const bubble = document.createElement('div');
    bubble.className = 'ai-chat-bubble';
    bubble.textContent = text;
    row.appendChild(bubble);
    wrap.appendChild(row);
    wrap.scrollTop = wrap.scrollHeight;
}

let polygoneWelcomeShown = false;

function showPolygoneWelcome() {
    if (polygoneWelcomeShown) return;
    polygoneWelcomeShown = true;
    appendConcreteChatMessage(
        'assistant',
        'Здравствуйте! Напишите свой вопрос о бетоне — классах и марках, прочности, применении, уходе за монолитом. Отвечу по существу и кратко.'
    );
}

function initializeLabPolygoneReveal() {
    const grid = document.getElementById('labPolygoneGrid');
    if (!grid) return;
    if (!('IntersectionObserver' in window)) {
        grid.classList.add('is-visible');
        setTimeout(showPolygoneWelcome, 400);
        return;
    }
    const io = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    grid.classList.add('is-visible');
                    setTimeout(showPolygoneWelcome, 550);
                    io.disconnect();
                }
            });
        },
        { threshold: 0.12, rootMargin: '0px 0px -6% 0px' }
    );
    io.observe(grid);
}

async function sendConcreteAssistantMessage(userText) {
    const sendBtn = document.getElementById('aiChatSend');
    const wrap = document.getElementById('aiChatMessages');
    appendConcreteChatMessage('user', userText);
    concreteChatHistory.push({ role: 'user', content: userText });

    const messages = [{ role: 'system', content: CONCRETE_ASSISTANT_SYSTEM }, ...concreteChatHistory];

    if (sendBtn) sendBtn.disabled = true;

    const typingRow = document.createElement('div');
    typingRow.className = 'ai-chat-msg ai-chat-msg--assistant ai-chat-msg--typing';
    typingRow.id = 'aiChatTyping';
    const typingBubble = document.createElement('div');
    typingBubble.className = 'ai-chat-bubble';
    typingBubble.textContent = 'Печатаю ответ…';
    typingRow.appendChild(typingBubble);
    if (wrap) wrap.appendChild(typingRow);

    const attempts = [{ model: 'gpt-4o-mini' }, { model: 'gpt-3.5-turbo' }];
    let lastErr = '';
    let replyText = null;

    try {
        for (const { model } of attempts) {
            const { response, data, parseError } = await proxyOpenAiChatCompletions({
                model,
                messages,
                max_tokens: 1400,
                temperature: 0.45
            });

            if (parseError || !response.ok) {
                const apiMsg = data && data.error && (data.error.message || data.error.code);
                lastErr = apiMsg || `HTTP ${response.status}`;
                continue;
            }

            const content = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
            if (content && String(content).trim()) {
                replyText = String(content).trim();
                break;
            }
            lastErr = 'Пустой ответ модели';
        }

        const typingEl = document.getElementById('aiChatTyping');
        if (typingEl) typingEl.remove();

        if (replyText) {
            appendConcreteChatMessage('assistant', replyText);
            concreteChatHistory.push({ role: 'assistant', content: replyText });
        } else {
            throw new Error(lastErr || 'Не удалось получить ответ');
        }
    } catch (error) {
        const typingEl = document.getElementById('aiChatTyping');
        if (typingEl) typingEl.remove();
        const msg = error.message || String(error);
        appendConcreteChatMessage(
            'assistant',
            `Не удалось получить ответ: ${msg}. Проверьте ключ ProxyAPI и что сайт открыт не через file://.`,
            true
        );
    } finally {
        if (sendBtn) sendBtn.disabled = false;
    }
}

function initializeConcreteAssistantChat() {
    const form = document.getElementById('aiChatForm');
    const input = document.getElementById('aiChatInput');
    if (!form || !input) return;

    form.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const t = input.value.replace(/\s+/g, ' ').trim();
        if (!t) return;
        input.value = '';
        sendConcreteAssistantMessage(t);
    });

    input.addEventListener('keydown', (ev) => {
        if (ev.key === 'Enter' && !ev.shiftKey) {
            ev.preventDefault();
            form.requestSubmit();
        }
    });
}

async function generateAiDestructionImage() {
    const rangeEl = document.getElementById('aiLoadRange');
    const statusEl = document.getElementById('aiStatus');
    const buttonEl = document.getElementById('aiGenerateBtn');
    const panel = document.getElementById('aiResultPanel');
    const loadingEl = document.getElementById('aiResultLoading');
    const loadingTextEl = document.getElementById('aiLoadingText');
    const imageWrap = document.getElementById('aiResultImageWrap');
    const imageEl = document.getElementById('aiResultImage');
    if (!rangeEl || !buttonEl || !panel || !loadingEl || !imageWrap || !imageEl) return;

    const load = parseFloat(rangeEl.value) || 0;
    const structureKey = getSelectedAiStructureKey();
    const prompt = getAiDestructionPrompt(structureKey, load, currentStrength);

    if (statusEl) statusEl.textContent = '';
    resetAiResultCaption();

    if (!structureKey) {
        panel.classList.add('ai-result-panel--open');
        panel.setAttribute('aria-hidden', 'false');
        loadingEl.hidden = true;
        loadingEl.style.display = 'none';
        imageWrap.hidden = true;
        showAiResultCaptionError('Выберите тип конструкции.');
        return;
    }
    if (!prompt) {
        panel.classList.add('ai-result-panel--open');
        panel.setAttribute('aria-hidden', 'false');
        loadingEl.hidden = true;
        loadingEl.style.display = 'none';
        imageWrap.hidden = true;
        showAiResultCaptionError('Не удалось составить промпт. Проверьте класс бетона и нагрузку.');
        return;
    }

    buttonEl.disabled = true;

    panel.classList.add('ai-result-panel--open');
    panel.setAttribute('aria-hidden', 'false');
    loadingEl.hidden = false;
    loadingEl.style.display = '';
    imageWrap.hidden = true;
    imageEl.removeAttribute('src');
    if (loadingTextEl) loadingTextEl.textContent = 'Генерация';

    let responseStatus = null;
    let responseContentType = '';
    let responsePreview = '';

    try {
        /**
         * См. https://proxyapi.ru/docs/openai-image-generation
         * Сначала gpt-image-1 (у вас стабильно отдаёт картинку), затем запас — dall-e-3.
         */
        const attempts = [
            { label: 'gpt-image-1', body: { model: 'gpt-image-1', prompt, quality: 'low', moderation: 'low' } },
            { label: 'dall-e-3', body: { model: 'dall-e-3', prompt, n: 1, size: '1024x1024', quality: 'standard' } }
        ];

        let lastFailure = '';

        for (const { label, body } of attempts) {
            if (loadingTextEl) loadingTextEl.textContent = 'Генерация';

            const { response, rawText, data, parseError } = await proxyOpenAiImagesGenerations(body);

            responseStatus = response.status;
            responseContentType = response.headers.get('content-type') || '';
            responsePreview = rawText ? rawText.slice(0, 500) : '(пустой ответ)';

            if (parseError) {
                lastFailure = `${label}: ответ не JSON (${response.status}). Откройте сайт через http://127.0.0.1, не file://.`;
                continue;
            }

            if (!response.ok) {
                const apiMsg = data && data.error && (data.error.message || data.error.code);
                if (response.status === 401 || response.status === 403) {
                    throw new Error(apiMsg || `Доступ запрещён (${response.status}). Проверьте ключ на https://console.proxyapi.ru/keys`);
                }
                lastFailure = `${label}: ${apiMsg || `HTTP ${response.status}`}`;
                if (typeof console !== 'undefined' && console.debug) {
                    console.debug(`[images/generations] ${label} error:`, data);
                }
                continue;
            }

            const imageSrc = extractImageSrcFromGenerationsJson(data);
            if (imageSrc) {
                try {
                    loadingEl.hidden = true;
                    loadingEl.style.display = 'none';
                    imageWrap.hidden = false;
                    await applyGenerationsImageToElement(imageEl, imageSrc);
                    const meta = getAiDestructionMeta(load, currentStrength, structureKey);
                    showAiResultCaption({
                        className: currentClass,
                        strengthMpa: currentStrength,
                        loadMpa: load,
                        structureLabelRu: meta.structureLabelRu,
                        damageLabelRu: meta.damageLabelRu,
                        ratio: meta.ratio
                    });
                    if (typeof console !== 'undefined' && console.debug) {
                        console.debug(`[images/generations] ok, model=${label}`);
                    }
                    return;
                } catch (loadErr) {
                    loadingEl.hidden = false;
                    loadingEl.style.display = '';
                    imageWrap.hidden = true;
                    imageEl.removeAttribute('src');
                    lastFailure = `${label}: картинка не отобразилась — ${loadErr.message}`;
                    if (typeof console !== 'undefined' && console.warn) {
                        console.warn(`[images/generations] ${label} display failed:`, loadErr);
                    }
                    continue;
                }
            }

            lastFailure = `${label}: пустой результат (data[] или нет url/b64_json). ${getDebugPayloadPreview(data)}`;
            if (typeof console !== 'undefined' && console.debug) {
                console.debug(`[images/generations] ${label} empty:`, data);
            }
        }

        throw new Error(`Не удалось сгенерировать изображение. ${lastFailure}`);
    } catch (error) {
        loadingEl.hidden = true;
        loadingEl.style.display = 'none';
        imageWrap.hidden = true;
        const msg = error.message || String(error);
        if (statusEl) statusEl.textContent = '';
        showAiResultCaptionError(msg);
        const debugInfo = [
            `diag status=${responseStatus ?? 'n/a'}`,
            `type=${responseContentType || 'n/a'}`,
            `body=${responsePreview || 'n/a'}`
        ].join(' | ');
        if (typeof console !== 'undefined' && console.error) {
            console.error('[AI image debug]', debugInfo);
        }
    } finally {
        buttonEl.disabled = false;
    }
}

function initializeAiDestructionModule() {
    const rangeEl = document.getElementById('aiLoadRange');
    const buttonEl = document.getElementById('aiGenerateBtn');
    const selectEl = document.getElementById('aiClassSelect');
    if (!rangeEl || !buttonEl) return;
    rangeEl.addEventListener('input', updateAiLoadInfo);
    buttonEl.addEventListener('click', generateAiDestructionImage);
    if (selectEl) {
        selectEl.addEventListener('change', () => {
            const cls = selectEl.value;
            const str = AI_CLASS_STRENGTH_MPA[cls];
            if (str != null) {
                setConcreteClass(cls, str);
                openPanel(cls);
            }
        });
    }
    document.querySelectorAll('.ai-structure-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.ai-structure-btn').forEach((b) => b.classList.remove('is-selected'));
            btn.classList.add('is-selected');
        });
    });
    syncAiDestructionModule();
}

function initializeComparatorModule() {
    const strengthMap = {
        B10: 9.8,
        'B12.5': 16.1,
        B15: 19.6,
        B20: 26.2,
        'B22.5': 29.4,
        B25: 32.7,
        'B27.5': 36.0,
        B30: 39.3,
        B35: 45.8,
        B40: 52.4,
        B45: 58.9,
        B50: 65.5,
        B55: 72.0,
        B60: 78.0,
        B65: 85.5,
        B70: 93.0
    };

    const classSelect = document.getElementById('comparatorClassSelect');
    const simpleCompareRow = document.getElementById('simpleCompareRow');
    const simpleBuildingItem = document.getElementById('simpleBuildingItem');
    const simpleTruckItem = document.getElementById('simpleTruckItem');
    const simpleBrickItem = document.getElementById('simpleBrickItem');
    const simpleBuildingText = document.getElementById('simpleBuildingText');
    const simpleTruckText = document.getElementById('simpleTruckText');
    const simpleBrickText = document.getElementById('simpleBrickText');
    const customCompareForm = document.getElementById('comparatorCustomForm');
    const customCompareInput = document.getElementById('comparatorCustomInput');
    const customCompareSend = document.getElementById('comparatorCustomSend');
    const customCompareResult = document.getElementById('comparatorCustomResult');
    const waterCanvas = document.getElementById('waterComparatorCanvas');
    const waterText = document.getElementById('waterComparatorText');

    if (!classSelect || !simpleCompareRow || !simpleBuildingItem || !simpleTruckItem || !simpleBrickItem ||
        !simpleBuildingText || !simpleTruckText || !simpleBrickText || !waterCanvas || !waterText) {
        return;
    }

    const waterCtx = waterCanvas.getContext('2d');
    if (!waterCtx) return;

    const leftItems = [simpleBuildingItem, simpleTruckItem, simpleBrickItem];
    let leftTimers = [];
    const waterMaxDepth = 12000;
    const bubblePool = [];

    let wavePhase = 0;
    let waterDepthCurrent = 0;
    let waterDepthTarget = 0;
    let lastDepth = 0;
    let cubeSway = 0;
    let bubbleTimer = 0;
    let currentComparatorClass = classSelect.value || 'B15';

    function clearLeftTimers() {
        leftTimers.forEach((t) => clearTimeout(t));
        leftTimers = [];
    }

    function showLeftBlocks() {
        clearLeftTimers();
        leftItems.forEach((item) => item.classList.remove('is-visible'));
        leftTimers.push(setTimeout(() => simpleBuildingItem.classList.add('is-visible'), 80));
        leftTimers.push(setTimeout(() => simpleBrickItem.classList.add('is-visible'), 270));
        leftTimers.push(setTimeout(() => simpleTruckItem.classList.add('is-visible'), 460));
    }

    function depthToY(depthMeters, top, height) {
        const ratio = Math.max(0, Math.min(1, depthMeters / waterMaxDepth));
        return top + (ratio * height);
    }

    function updateLeftComparator(className, strength) {
        const floors = Math.ceil(strength / 0.5);
        const trucks = Math.floor(strength / 0.25);
        const bricks = Math.floor(strength / 0.0003);

        simpleBuildingText.textContent = `${className} выдерживает до ${floors.toLocaleString('ru-RU')} этажей (0.5 МПа/этаж).`;
        simpleTruckText.textContent = `${className} = ${trucks.toLocaleString('ru-RU')} бетоновозов, давящих на 1 м².`;
        simpleBrickText.textContent = `${className} = ${bricks.toLocaleString('ru-RU')} кирпичей.`;
        showLeftBlocks();
    }

    function updateWaterText(className, depthMeters) {
        const balticMax = 459;
        const times = depthMeters / balticMax;
        waterText.textContent = `Класс ${className} выдерживает давление на глубине ${Math.round(depthMeters).toLocaleString('ru-RU')} м. Это в ${times.toFixed(1)} раза глубже Балтийского моря (459 м).`;
    }

    function spawnBubble(cubeX, cubeY, cubeSize, fromBottom = false) {
        const size = 1.4 + Math.random() * 3.5;
        const aquariumX = 98;
        const aquariumY = 35;
        const aquariumW = 250;
        const aquariumH = 430;
        bubblePool.push({
            x: fromBottom
                ? aquariumX + 10 + Math.random() * (aquariumW - 20)
                : cubeX + cubeSize * (0.35 + Math.random() * 0.3),
            y: fromBottom
                ? aquariumY + aquariumH - (3 + Math.random() * 10)
                : cubeY + cubeSize * (0.88 + Math.random() * 0.15),
            r: size,
            speed: fromBottom ? (0.6 + Math.random() * 1.1) : (0.8 + Math.random() * 1.4),
            drift: (Math.random() - 0.5) * (fromBottom ? 0.28 : 0.35),
            alpha: 0.7 + Math.random() * 0.25
        });
    }

    function drawWaterComparatorFrame() {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const w = waterCanvas.width;
        const h = waterCanvas.height;
        waterCtx.clearRect(0, 0, w, h);
        waterCtx.fillStyle = isDark ? '#0f172a' : '#f8fbff';
        waterCtx.fillRect(0, 0, w, h);

        const scaleLeftX = 24;
        const scaleTop = 40;
        const scaleH = 420;
        const aquariumX = 98;
        const aquariumY = 35;
        const aquariumW = 250;
        const aquariumH = 430;

        // Шкала глубины: 0 сверху, 12000 снизу.
        waterCtx.strokeStyle = isDark ? '#5f7ea9' : '#425f86';
        waterCtx.lineWidth = 2;
        waterCtx.beginPath();
        waterCtx.moveTo(scaleLeftX, scaleTop);
        waterCtx.lineTo(scaleLeftX, scaleTop + scaleH);
        waterCtx.stroke();

        waterCtx.fillStyle = isDark ? '#9eb8dd' : '#4f6e95';
        waterCtx.font = '12px Geologica, sans-serif';
        waterCtx.textAlign = 'left';
        for (let d = 0; d <= waterMaxDepth; d += 2000) {
            const y = depthToY(d, scaleTop, scaleH);
            waterCtx.beginPath();
            waterCtx.moveTo(scaleLeftX - 4, y);
            waterCtx.lineTo(scaleLeftX + 8, y);
            waterCtx.stroke();
            waterCtx.fillText(`${d} м`, scaleLeftX + 12, y + 4);
        }

        const waterGrad = waterCtx.createLinearGradient(0, aquariumY, 0, aquariumY + aquariumH);
        waterGrad.addColorStop(0, isDark ? '#295f8a' : '#b8e6ff');
        waterGrad.addColorStop(1, isDark ? '#0b2f5e' : '#0d4b99');
        waterCtx.fillStyle = waterGrad;
        waterCtx.fillRect(aquariumX, aquariumY, aquariumW, aquariumH);

        // Дополнительное движение воды в толще.
        waterCtx.globalAlpha = 0.12;
        for (let i = 0; i < 4; i += 1) {
            waterCtx.beginPath();
            for (let x = 0; x <= aquariumW; x += 8) {
                const baseY = aquariumY + 70 + i * 85;
                const y = baseY + Math.sin((x * 0.05) + wavePhase * (0.7 + i * 0.2)) * (5 + i);
                if (x === 0) waterCtx.moveTo(aquariumX + x, y);
                else waterCtx.lineTo(aquariumX + x, y);
            }
            waterCtx.strokeStyle = isDark ? 'rgba(182, 214, 247, 0.45)' : 'rgba(230, 245, 255, 0.65)';
            waterCtx.lineWidth = 1.2;
            waterCtx.stroke();
        }
        waterCtx.globalAlpha = 1;

        waterCtx.strokeStyle = isDark ? '#4f76a7' : '#7da6d3';
        waterCtx.lineWidth = 2;
        waterCtx.strokeRect(aquariumX, aquariumY, aquariumW, aquariumH);

        waterCtx.strokeStyle = isDark ? 'rgba(196, 225, 255, 0.9)' : 'rgba(236, 248, 255, 0.95)';
        waterCtx.lineWidth = 2;
        waterCtx.beginPath();
        for (let x = 0; x <= aquariumW; x += 6) {
            const y = aquariumY + Math.sin((x * 0.07) + wavePhase) * 2.5;
            if (x === 0) waterCtx.moveTo(aquariumX + x, y);
            else waterCtx.lineTo(aquariumX + x, y);
        }
        waterCtx.stroke();

        const cubeSize = 40;
        const cubeX = aquariumX + (aquariumW / 2) - (cubeSize / 2);
        const rawCubeTop = depthToY(waterDepthCurrent, aquariumY, aquariumH);
        const cubeY = Math.max(aquariumY, Math.min(aquariumY + aquariumH - cubeSize, rawCubeTop));

        waterCtx.save();
        waterCtx.translate(cubeX + (cubeSize / 2), cubeY + (cubeSize / 2));
        waterCtx.rotate(cubeSway);
        waterCtx.translate(-(cubeSize / 2), -(cubeSize / 2));

        const cubeGrad = waterCtx.createLinearGradient(0, 0, cubeSize, cubeSize);
        cubeGrad.addColorStop(0, isDark ? '#c7d3e3' : '#dbe2ea');
        cubeGrad.addColorStop(1, isDark ? '#76869a' : '#8f98a5');
        waterCtx.fillStyle = cubeGrad;
        waterCtx.fillRect(0, 0, cubeSize, cubeSize);
        waterCtx.strokeStyle = isDark ? '#4c5d72' : '#5f6b78';
        waterCtx.strokeRect(0, 0, cubeSize, cubeSize);
        waterCtx.restore();

        for (let i = bubblePool.length - 1; i >= 0; i -= 1) {
            const bubble = bubblePool[i];
            bubble.y -= bubble.speed;
            bubble.x += bubble.drift;
            bubble.alpha -= 0.008;

            if (bubble.y < aquariumY + 2 || bubble.alpha <= 0) {
                bubblePool.splice(i, 1);
                continue;
            }

            waterCtx.beginPath();
            waterCtx.fillStyle = `rgba(255, 255, 255, ${bubble.alpha})`;
            waterCtx.arc(bubble.x, bubble.y, bubble.r, 0, Math.PI * 2);
            waterCtx.fill();
        }

        const markerY = depthToY(waterDepthCurrent, scaleTop, scaleH);
        waterCtx.fillStyle = isDark ? '#7fb2f3' : '#225fa8';
        waterCtx.beginPath();
        waterCtx.moveTo(scaleLeftX - 7, markerY);
        waterCtx.lineTo(scaleLeftX - 21, markerY - 6);
        waterCtx.lineTo(scaleLeftX - 21, markerY + 6);
        waterCtx.closePath();
        waterCtx.fill();
    }

    function applySelection(className, options = {}) {
        const { animate = true, syncSelect = true } = options;
        const strength = strengthMap[className];
        if (!strength) return;

        if (syncSelect && classSelect.value !== className) {
            classSelect.value = className;
        }

        currentComparatorClass = className;
        updateLeftComparator(className, strength);
        waterDepthTarget = Math.min(strength / 0.01, waterMaxDepth);
        updateWaterText(className, waterDepthTarget);
        if (customCompareInput) customCompareInput.value = '';
        if (customCompareResult) customCompareResult.textContent = '';

        if (!animate) {
            waterDepthCurrent = waterDepthTarget;
            lastDepth = waterDepthTarget;
        }
    }

    function animationTick() {
        wavePhase += 0.07;
        const diff = waterDepthTarget - waterDepthCurrent;
        const velocity = waterDepthCurrent - lastDepth;
        lastDepth = waterDepthCurrent;
        const now = performance.now();

        if (Math.abs(diff) > 0.5) {
            waterDepthCurrent += diff * 0.09;
            cubeSway = Math.sin(now * 0.012) * 0.045;
            bubbleTimer += 1;
            if (bubbleTimer >= 5) {
                const aquariumX = 98;
                const aquariumY = 35;
                const aquariumW = 250;
                const cubeSize = 40;
                const cubeX = aquariumX + (aquariumW / 2) - (cubeSize / 2);
                const cubeY = Math.max(aquariumY, Math.min(aquariumY + 430 - cubeSize, depthToY(waterDepthCurrent, aquariumY, 430)));
                spawnBubble(cubeX, cubeY, cubeSize);
                if (Math.abs(velocity) > 0.15) spawnBubble(cubeX, cubeY, cubeSize);
                bubbleTimer = 0;
            }
        } else {
            waterDepthCurrent = waterDepthTarget;
            cubeSway = Math.sin(now * 0.006) * 0.018;
            bubbleTimer += 1;
        }

        if (bubbleTimer >= 7) {
            spawnBubble(0, 0, 0, true);
            if (Math.random() > 0.45) {
                spawnBubble(0, 0, 0, true);
            }
            bubbleTimer = 0;
        }

        drawWaterComparatorFrame();
        requestAnimationFrame(animationTick);
    }

    classSelect.addEventListener('change', () => {
        const className = classSelect.value;
        const strength = strengthMap[className];
        if (typeof window.selectConcreteClass === 'function') {
            window.selectConcreteClass(className, strength);
        } else {
            applySelection(className, { animate: true, syncSelect: true });
        }
    });

    async function sendCustomObjectCompare(objectName) {
        if (!customCompareResult || !customCompareSend) return;
        const className = currentComparatorClass;
        const strength = strengthMap[className];
        if (!strength) return;

        customCompareSend.disabled = true;
        customCompareResult.textContent = 'Считаю сравнение...';

        const comparePrompt = [
            `Сделай короткое сравнение прочности бетона класса ${className} (${strength.toFixed(1)} МПа)`,
            `с объектом "${objectName}".`,
            'Формат: 2-3 коротких предложения на русском языке.',
            'Добавь один интересный инженерный факт или аналогию.',
            'Тон: понятный, технически аккуратный, без воды.'
        ].join(' ');

        const messages = [
            { role: 'system', content: CONCRETE_ASSISTANT_SYSTEM },
            { role: 'user', content: comparePrompt }
        ];

        const attempts = [{ model: 'gpt-4o-mini' }, { model: 'gpt-3.5-turbo' }];
        let lastErr = '';
        let replyText = '';

        try {
            for (const { model } of attempts) {
                const { response, data, parseError } = await proxyOpenAiChatCompletions({
                    model,
                    messages,
                    max_tokens: 280,
                    temperature: 0.5
                });

                if (parseError || !response.ok) {
                    const apiMsg = data && data.error && (data.error.message || data.error.code);
                    lastErr = apiMsg || `HTTP ${response.status}`;
                    continue;
                }

                const content = data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
                if (content && String(content).trim()) {
                    replyText = String(content).trim();
                    break;
                }
                lastErr = 'Пустой ответ модели';
            }

            if (!replyText) {
                throw new Error(lastErr || 'Не удалось получить ответ');
            }
            customCompareResult.textContent = replyText;
        } catch (error) {
            const msg = error && error.message ? error.message : String(error);
            customCompareResult.textContent = `Не удалось получить сравнение: ${msg}. Попробуйте еще раз.`;
        } finally {
            customCompareSend.disabled = false;
        }
    }

    if (customCompareForm && customCompareInput) {
        customCompareForm.addEventListener('submit', (ev) => {
            ev.preventDefault();
            const objectName = customCompareInput.value.replace(/\s+/g, ' ').trim();
            if (!objectName) {
                if (customCompareResult) customCompareResult.textContent = 'Введите объект для сравнения.';
                return;
            }
            sendCustomObjectCompare(objectName);
        });
    }

    window.__comparatorController = {
        updateByClass(className, options = {}) {
            applySelection(className, options);
        }
    };

    const initialClass = (window.currentClass && strengthMap[window.currentClass]) ? window.currentClass : classSelect.value || 'B15';
    applySelection(initialClass, { animate: false, syncSelect: true });
    requestAnimationFrame(animationTick);
}

// анимации
function initializeCompositionAnimation() {
    const grid = document.getElementById('compositionGrid');
    if (!grid) return;

    const cards = Array.from(grid.querySelectorAll('.composition-card'));
    if (!cards.length) return;

    const collage = document.getElementById('compositionCollage');
    const collageItems = collage ? Array.from(collage.querySelectorAll('.composition-collage-item')) : [];

    cards.forEach(c => c.classList.remove('is-visible'));
    collageItems.forEach(i => i.classList.remove('is-visible'));

    const show = () => {
        collageItems.forEach((item, idx) => {
            setTimeout(() => item.classList.add('is-visible'), 120 + idx * 90);
        });

        const firstWave = cards.filter(c => ['1', '3'].includes(c.getAttribute('data-seq')));
        const secondWave = cards.filter(c => ['2', '4'].includes(c.getAttribute('data-seq')));
        const cardsStartDelay = collageItems.length ? (120 + collageItems.length * 90 + 220) : 0;

        setTimeout(() => {
            firstWave.forEach(c => c.classList.add('is-visible'));
            setTimeout(() => {
                secondWave.forEach(c => c.classList.add('is-visible'));
            }, 260);
        }, cardsStartDelay);
    };

    if (!('IntersectionObserver' in window)) {
        show();
        return;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                show();
                observer.disconnect();
            }
        });
    }, { threshold: 0.22 });

    observer.observe(grid);
}

document.addEventListener('DOMContentLoaded', () => {
    initialize();
    initializeAiDestructionModule();
    initializeComparatorModule();
    initializeCompositionAnimation();
    initializeLabPolygoneReveal();
    initializeConcreteAssistantChat();
});


/* --- ПРОДВИНУТАЯ ЛОГИКА КОНСТРУКТОРА (4 ШАГА) --- */
document.addEventListener('DOMContentLoaded', () => {
    const wizard = document.getElementById('wizardForm');
    if (!wizard) return;

    const steps = wizard.querySelectorAll('.wizard-step');
    const dots = document.querySelectorAll('.step-dot');
    const progressIndicator = document.getElementById('progressIndicator');
    const resultBlock = document.getElementById('wizardResult');

    let currentStep = 1;

    // Навигация
    wizard.querySelectorAll('.btn-next').forEach(btn => {
        btn.addEventListener('click', () => changeStep(currentStep + 1));
    });

    wizard.querySelectorAll('.btn-prev').forEach(btn => {
        btn.addEventListener('click', () => changeStep(currentStep - 1));
    });

    const calcBtn = wizard.querySelector('.btn-calculate');
    if (calcBtn) {
        calcBtn.addEventListener('click', calculateResult);
    }

    document.getElementById('btnRestart').addEventListener('click', () => {
        resultBlock.style.display = 'none';
        wizard.style.display = 'block';
        changeStep(1);
    });

    function changeStep(step) {
        if (step < 1 || step > steps.length) return;

        steps.forEach(s => {
            s.classList.remove('active');
            if (parseInt(s.dataset.step) === step) s.classList.add('active');
        });

        dots.forEach(d => {
            d.classList.remove('active');
            if (parseInt(d.dataset.step) <= step) d.classList.add('active');
        });

        const progressPercent = ((step - 1) / (steps.length - 1)) * 100;
        if (progressIndicator) {
            progressIndicator.style.width = `${progressPercent}%`;
        }
        currentStep = step;
    }

    function calculateResult() {
        // УЛУЧШЕННЫЙ АЛГОРИТМ: Используем новую функцию из improved-calculator.js
        calculateResultEnhanced();
    }

    function generateExpertExplanation(type, load, soil, season, resultClass) {
        let html = `<p>На основе анализа ваших данных (тип: <strong>${translate(type)}</strong>, условия: <strong>${translate(soil)}</strong>) мы подобрали бетон класса <strong>${resultClass}</strong>.</p>`;

        html += `<p><strong>Техническое обоснование:</strong><br>`;

        // Обоснование по классу
        if (['B15', 'B20'].includes(resultClass)) {
            html += `Для указанных нагрузок это экономически эффективное решение. Прочности достаточно для обеспечения стабильности конструкции без переплаты за избыточные характеристики. `;
        } else if (['B22.5', 'B25'].includes(resultClass)) {
            html += `Этот класс обеспечивает высокую плотность бетона. В ваших условиях (особенно с учетом грунта) это необходимо для защиты арматуры от коррозии и сопротивления деформациям почвы. `;
        } else {
            html += `Высокий класс выбран из-за экстремальных условий эксплуатации или высоких нагрузок. Это гарантирует максимальную водонепроницаемость и несущую способность. `;
        }

        // Обоснование по Грунту
        if (type === 'foundation') {
            if (soil === 'clay') html += `<em>Глинистый грунт склонен к пучению, поэтому мы повысили марку прочности для жесткости фундамента. </em>`;
            if (soil === 'water') html += `<em>Из-за высокого уровня грунтовых вод выбран бетон с индексом водонепроницаемости не ниже W6. </em>`;
        }

        // Обоснование по Сезону
        if (season === 'winter') {
            html += `<br><br><strong style="color: #e53e3e;">⚠️ Важно (Зимняя заливка):</strong><br>
            Так как работы планируются в холодное время, <strong>обязательно</strong> используйте противоморозные добавки (ПМД) и обеспечьте прогрев бетона. Сам по себе класс ${resultClass} не гарантирует твердение на морозе без добавок.`;
        } else if (season === 'hot') {
            html += `<br><br><strong>Совет (Летняя жара):</strong><br>
            При температуре выше +25°C бетон быстро теряет влагу. Обязательно укрывайте свежий бетон пленкой и поливайте его водой первые 3-5 дней, чтобы избежать трещин.`;
        }

        html += `</p>`;
        return html;
    }

    function translate(key) {
        const dict = {
            'foundation': 'Фундамент', 'floor': 'Стяжка', 'outdoor': 'Улица', 'wall': 'Стена', 'pool': 'Бассейн',
            'light': 'Легкая', 'medium': 'Средняя', 'heavy': 'Высокая',
            'sand': 'Сухой грунт', 'clay': 'Глина/Пучение', 'water': 'Высокие воды'
        };
        return dict[key] || key;
    }
});

/* карта */
(function () {
    const CONCRETE_CLASSES = ['B10', 'B12.5', 'B15', 'B20', 'B22.5', 'B25', 'B27.5', 'B30', 'B35', 'B40', 'B45', 'B50', 'B55', 'B60', 'B65', 'B70'];


    const SPB_OBJECTS_BY_CLASS = {
        'B10': [
            { name: 'Подбетонка и бордюры, Невский пр.', lat: 59.934, lng: 30.358 },
            { name: 'Подготовительные работы, Летний сад', lat: 59.942, lng: 30.336 }
        ],
        'B12.5': [
            { name: 'Стяжки и дорожки, Михайловский сад', lat: 59.939, lng: 30.334 },
            { name: 'Бордюры, Каменноостровский пр.', lat: 59.965, lng: 30.317 }
        ],
        'B15': [
            { name: 'Фундаменты малоэтажных зданий, Колпино', lat: 59.750, lng: 30.601 },
            { name: 'Отмостки, жилой комплекс Приморский', lat: 60.002, lng: 30.251 }
        ],
        'B20': [
            { name: 'Ленточные фундаменты, ЖК «Город на реке»', lat: 59.918, lng: 30.478 },
            { name: 'Плиты перекрытий, жилые кварталы', lat: 59.955, lng: 30.289 }
        ],
        'B22.5': [
            { name: 'Монолитные стены, ЖК «Полюстрово Парк»', lat: 59.978, lng: 30.378 },
            { name: 'Фундаменты коттеджей, Курортный район', lat: 60.172, lng: 29.878 }
        ],
        'B25': [
            { name: 'ЖК «Невская ратуша»', lat: 59.928, lng: 30.362 },
            { name: 'ЖК «Сенат Плаза»', lat: 59.931, lng: 30.348 },
            { name: 'Многоэтажный монолит, Приморский р-н', lat: 60.004, lng: 30.258 }
        ],
        'B27.5': [
            { name: 'Несущие конструкции, БЦ «Лахта»', lat: 59.985, lng: 30.175 },
            { name: 'Колонны и ригели, ЖК «Северная долина»', lat: 60.051, lng: 30.334 }
        ],
        'B30': [
            { name: 'Ладожский вокзал', lat: 59.932, lng: 30.462 },
            { name: 'Фундаменты и перекрытия, стадион «Газпром Арена»', lat: 59.973, lng: 30.221 },
            { name: 'Промзона «Парнас»', lat: 60.069, lng: 30.334 }
        ],
        'B35': [
            { name: 'Большой Обуховский (Вантовый) мост', lat: 59.857, lng: 30.517 },
            { name: 'Мост Бетанкура', lat: 59.923, lng: 30.257 },
            { name: 'Эстакады ЗСД (Западный скоростной диаметр)', lat: 59.880, lng: 30.220 },
            { name: 'Развязка КАД «Парнас»', lat: 60.068, lng: 30.330 }
        ],
        'B40': [
            { name: 'Северная станция аэрации', lat: 59.988, lng: 30.150 },
            { name: 'Комплекс защитных сооружений (дамба)', lat: 59.883, lng: 29.883 }
        ],
        'B45': [
            { name: 'Лахта Центр (башня)', lat: 59.987, lng: 29.772 },
            { name: 'Высотные ядра небоскрёба «Невская башня»', lat: 59.931, lng: 30.355 }
        ],
        'B50': [
            { name: 'Специальные конструкции, объекты обороны', lat: 59.950, lng: 30.300 }
        ],
        'B55': [
            { name: 'Критически ответственные узлы, Лахта Центр', lat: 59.986, lng: 29.771 }
        ],
        'B60': [
            { name: 'Особо ответственные конструкции, высотные объекты', lat: 59.986, lng: 29.773 }
        ],
        'B65': [{ name: 'Специальные сооружения СПб', lat: 59.934, lng: 30.335 }],
        'B70': [{ name: 'Уникальные инженерные объекты', lat: 59.935, lng: 30.336 }]
    };

    const mapCursorZone = document.getElementById('mapCursorZone');
    const mapToggleBtn = document.getElementById('mapToggleBtn');
    const mapSection = document.getElementById('mapSection');
    const mapClassesGrid = document.getElementById('mapClassesGrid');
    const yandexMapEl = document.getElementById('yandexMap');
    const customCursorMap = document.getElementById('customCursorMap');

    let yandexMap = null;
    let currentMapPlacemarks = [];
    let selectedMapClass = null;
    let mapInitialized = false;

    if (!mapToggleBtn || !mapSection || !mapClassesGrid || !yandexMapEl) return;


    mapToggleBtn.addEventListener('click', function () {
        const isOpen = mapSection.classList.contains('map-section--open');
        if (isOpen) {
            mapSection.classList.remove('map-section--open');
            mapSection.setAttribute('aria-hidden', 'true');
            mapToggleBtn.setAttribute('aria-expanded', 'false');
        } else {
            mapSection.classList.add('map-section--open');
            mapSection.setAttribute('aria-hidden', 'false');
            mapToggleBtn.setAttribute('aria-expanded', 'true');
            if (!mapInitialized) {
                buildMapClassesGrid();
                mapInitialized = true;
                requestAnimationFrame(function () {
                    setTimeout(initYandexMap, 150);
                });
            }
        }
    });

    function buildMapClassesGrid() {
        mapClassesGrid.innerHTML = '';
        CONCRETE_CLASSES.forEach(function (cls) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'map-class-btn';
            btn.textContent = cls;
            btn.dataset.class = cls;
            btn.addEventListener('click', function () {
                selectMapClass(cls);
            });
            mapClassesGrid.appendChild(btn);
        });
    }

    function selectMapClass(cls) {
        document.querySelectorAll('.map-class-btn').forEach(function (b) {
            b.classList.toggle('selected', b.dataset.class === cls);
        });
        selectedMapClass = cls;
        updateMapPlacemarks();
    }

    function updateMapPlacemarks() {
        if (!yandexMap) return;
        currentMapPlacemarks.forEach(function (pm) {
            yandexMap.geoObjects.remove(pm);
        });
        currentMapPlacemarks = [];
        if (!selectedMapClass) return;
        const objects = SPB_OBJECTS_BY_CLASS[selectedMapClass];
        if (!objects || !objects.length) return;
        if (typeof ymaps === 'undefined') return;
        objects.forEach(function (obj) {
            const placemark = new ymaps.Placemark(
                [obj.lat, obj.lng],
                { balloonContent: '<strong>' + obj.name + '</strong><br>Класс бетона: ' + selectedMapClass },
                { preset: 'islands#circleIcon', iconColor: '#1a365d' }
            );
            yandexMap.geoObjects.add(placemark);
            currentMapPlacemarks.push(placemark);
        });
    }

    function initYandexMap() {
        if (typeof ymaps === 'undefined') return;
        ymaps.ready(function () {
            yandexMap = new ymaps.Map(yandexMapEl, {
                center: [59.9343, 30.3351],
                zoom: 10,
                controls: ['zoomControl', 'typeSelector', 'fullscreenControl']
            });
        });
    }

    // курсор
    if (customCursorMap && mapCursorZone) {
        let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0, lastX = 0, lastY = 0;
        const easing = 0.18;

        mapCursorZone.addEventListener('mouseenter', function () {
            customCursorMap.classList.add('is-active');
        });
        mapCursorZone.addEventListener('mouseleave', function () {
            customCursorMap.classList.remove('is-active');
        });

        document.addEventListener('mousemove', function (e) {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        function animateMapCursor() {
            cursorX += (mouseX - cursorX) * easing;
            cursorY += (mouseY - cursorY) * easing;
            const dx = cursorX - lastX;
            const dy = cursorY - lastY;
            const speed = Math.min(Math.sqrt(dx * dx + dy * dy) / 25, 0.6);
            const angle = Math.atan2(dy, dx) * (180 / Math.PI);
            const stretch = speed;
            const squeeze = Math.max(1 - stretch, 0.4);
            customCursorMap.style.transform = 'translate(calc(' + cursorX + 'px - 50%), calc(' + cursorY + 'px - 50%)) rotate(' + angle + 'deg) scaleX(' + (1 + stretch) + ') scaleY(' + squeeze + ')';
            lastX = cursorX;
            lastY = cursorY;
            requestAnimationFrame(animateMapCursor);
        }
        animateMapCursor();
    }
})();

/* ============================================================
   НОВЫЕ ФУНКЦИИ: мобильная навигация, прогрессбар, reveal
   ============================================================ */

// Мобильная навигация
(function() {
    const toggle = document.getElementById('mobileNavToggle');
    const nav = document.getElementById('mainNav');
    if (!toggle || !nav) return;

    toggle.addEventListener('click', function() {
        const isOpen = nav.classList.toggle('nav-open');
        toggle.classList.toggle('open', isOpen);
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Закрывать при клике на ссылку
    nav.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('nav-open');
            toggle.classList.remove('open');
            toggle.setAttribute('aria-expanded', 'false');
        });
    });
})();

// Прогресс-бар прокрутки
(function() {
    const bar = document.getElementById('navProgressBar');
    if (!bar) return;
    function updateBar() {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
        bar.style.width = pct + '%';
    }
    window.addEventListener('scroll', updateBar, { passive: true });
    updateBar();
})();

// Активная ссылка в навигации по скроллу
(function() {
    const sections = ['strength', 'constructor', 'application', 'education', 'composition'];
    const navLinks = document.querySelectorAll('.nav-link[data-section]');
    const header = document.getElementById('siteHeader');

    function onScroll() {
        const scrollY = window.scrollY + (header ? header.offsetHeight : 80) + 80;
        let current = '';
        sections.forEach(id => {
            const el = document.getElementById(id);
            if (el && el.offsetTop <= scrollY) current = id;
        });
        navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.section === current);
        });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
})();

// Reveal анимация для edu-карточек
(function() {
    const revealEls = document.querySelectorAll('[data-reveal]');
    if (!revealEls.length) return;

    const obs = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.classList.add('revealed');
                }, i * 80);
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    revealEls.forEach(el => obs.observe(el));
})();
