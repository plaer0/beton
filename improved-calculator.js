/* 
 * УЛУЧШЕННЫЙ АЛГОРИТМ ПОДБОРА БЕТОНА 
 * На основе детализированного технического задания
 */

// Иерархия классов бетона (индекс для расчетов)
const CONCRETE_CLASSES_INDEXED = [
    'B10', 'B12.5', 'B15', 'B20', 'B22.5', 'B25', 'B27.5', 'B30',
    'B35', 'B40', 'B45', 'B50', 'B55', 'B60', 'B65', 'B70'
];

// Функция получения индекса класса
function getClassIndex(className) {
    return CONCRETE_CLASSES_INDEXED.indexOf(className);
}

// Функция повышения класса на N уровней
function increaseClass(baseClass, levels) {
    const currentIndex = getClassIndex(baseClass);
    if (currentIndex === -1) return baseClass; // Fallback
    const newIndex = Math.min(currentIndex + levels, CONCRETE_CLASSES_INDEXED.length - 1);
    return CONCRETE_CLASSES_INDEXED[newIndex];
}

/**
 * ОСНОВНАЯ ФУНКЦИЯ ПОДБОРА КЛАССА БЕТОНА
 * @param {Object} params - Параметры конструкции
 * @returns {Object} - Результат с классом, характеристиками и пояснениями
 */
function calculateConcreteClass(params) {
    const {
        elementType,
        loadType,
        buildingFloors,
        soilType,
        waterLevel,
        moistureCondition,
        temperatureZone,
        reinforcement,
        elementThickness
    } = params;

    let baseClass = 'B15';  // Базовый класс по умолчанию
    let modifiers = 0;      // Количество уровней для повышения
    let requirements = {
        waterproofing: null,
        frost_resistance: null,
        sulfate_resistance: false,
        special_notes: []
    };
    let explanation = [];

    // ============================================
    // ШАГ 1: ОПРЕДЕЛЕНИЕ БАЗОВОГО КЛАССА
    // ============================================
    let constructionType = '';
    if (elementType === 'preparatory') constructionType = 'preparatory';
    if (elementType === 'lightly_loaded') constructionType = 'lightly_loaded';
    if (elementType.startsWith('foundation')) constructionType = 'foundation';

    if (constructionType === 'preparatory') {
        baseClass = 'B10';
        explanation.push('Подготовительные работы (стяжки, подбетонка) - базовый класс B10.');
    } else if (constructionType === 'lightly_loaded') {
        baseClass = 'B15';
        explanation.push('Малонагруженные конструкции (отмостки, дорожки) - базовый класс B15.');
    } else if (constructionType === 'foundation') {
        if (buildingFloors <= 2) {
            baseClass = 'B20';
            explanation.push('Фундамент для малоэтажного здания (1-2 этажа) - базовый класс B20.');
        } else if (buildingFloors <= 5) {
            baseClass = 'B25';
            explanation.push('Фундамент для среднеэтажного здания (3-5 этажей) - базовый класс B25.');
        } else if (buildingFloors <= 16) {
            baseClass = 'B30';
            explanation.push('Фундамент для многоэтажного здания (6-16 этажей) - базовый класс B30.');
        } else {
            baseClass = 'B35';
            explanation.push('Фундамент для высотного здания (17+ этажей) - базовый класс B35.');
        }
    } else if (elementType === 'wall') {
        if (buildingFloors <= 2) baseClass = 'B20';
        else if (buildingFloors <= 16) baseClass = 'B25';
        else baseClass = 'B30';
        explanation.push(`Несущие стены для здания ${buildingFloors} эт. - базовый класс ${baseClass}.`);
    } else if (elementType === 'floor_slab' || elementType === 'ceiling') {
        if (buildingFloors <= 5) baseClass = 'B20';
        else baseClass = 'B25';
        explanation.push(`Перекрытия для здания ${buildingFloors} эт. - базовый класс ${baseClass}.`);
    } else if (elementType === 'column' || elementType === 'beam') {
        if (buildingFloors <= 5) baseClass = 'B25';
        else if (buildingFloors <= 16) baseClass = 'B30';
        else baseClass = 'B40';
        explanation.push(`Колонны/балки для высотной нагрузки - базовый класс ${baseClass}.`);
    } else if (elementType === 'stairs') {
        baseClass = 'B20';
        explanation.push('Лестничные марши и площадки - базовый класс B20.');
    } else if (elementType === 'pool' || elementType === 'reservoir') {
        baseClass = 'B25';
        requirements.waterproofing = 'W8';
        explanation.push('Бассейн/резервуар - базовый класс B25, требуется высокая водонепроницаемость (W8).');
    } else if (elementType === 'bridge' || elementType === 'hydraulic') {
        baseClass = 'B35';
        requirements.waterproofing = 'W10';
        requirements.frost_resistance = 'F300';
        explanation.push('Мостовые/гидротехнические сооружения - высокий базовый класс B35, W10, F300.');
    } else if (elementType === 'road_slab') {
        baseClass = 'B30';
        requirements.frost_resistance = 'F200';
        explanation.push('Дорожные плиты - базовый класс B30, требуется высокая морозостойкость (F200).');
    }

    // ============================================
    // ШАГ 2: МОДИФИКАТОРЫ ПО ГРУНТУ (для фундаментов)
    // ============================================
    if (constructionType === 'foundation') {
        if (soilType === 'clay' || soilType === 'clay_loam') {
            modifiers += 1;
            explanation.push('⬆️ +1 уровень: Глинистый/пучинистый грунт требует повышенной жесткости фундамента.');
        } else if (soilType === 'weak') {
            modifiers += 2;
            explanation.push('⬆️ +2 уровня: Слабый/заторфованный грунт требует значительно более прочного основания.');
        }
        
        if (waterLevel === 'high') {
            modifiers += 2;
            requirements.waterproofing = requirements.waterproofing || 'W6';
            explanation.push('⬆️ +2 уровня: Высокий уровень грунтовых вод (УГВ) требует повышения класса и водонепроницаемости (W6).');
        } else if (waterLevel === 'variable') {
            modifiers += 1;
            requirements.waterproofing = requirements.waterproofing || 'W4';
            explanation.push('⬆️ +1 уровень: Переменный УГВ требует дополнительной защиты от влаги (W4).');
        }
    }

    // ============================================
    // ШАГ 3: МОДИФИКАТОРЫ ПО ВЛАЖНОСТИ И ВОДЕ
    // ============================================
    if (moistureCondition === 'humid') {
        if (!requirements.waterproofing) requirements.waterproofing = 'W4';
        explanation.push('💧 Влажные условия (подвал) - минимальное требование по водонепроницаемости W4.');
    } else if (moistureCondition === 'periodic_water_contact') {
        requirements.waterproofing = 'W6';
        explanation.push('💧 Периодический контакт с водой - требуется водонепроницаемость W6.');
    } else if (moistureCondition === 'constant_water_contact') {
        requirements.waterproofing = 'W8';
        modifiers += 1;
        explanation.push('⬆️ +1 уровень: Постоянный контакт с водой (бассейн) - требуется W8 и повышение класса.');
    } else if (moistureCondition === 'aggressive_water') {
        requirements.waterproofing = 'W12';
        requirements.sulfate_resistance = true;
        modifiers += 2;
        explanation.push('⬆️ +2 уровня: Агрессивная среда (морская вода, хим. производство) - требуется W12, сульфатостойкий цемент и повышение класса.');
    }

    // ============================================
    // ШАГ 4: МОДИФИКАТОРЫ ПО ТЕМПЕРАТУРЕ
    // ============================================
    if (temperatureZone === 'cold') {
        requirements.frost_resistance = 'F200';
        modifiers += 1;
        explanation.push('⬆️ +1 уровень: Эксплуатация в морозном климате (ниже -30°C) - требуется морозостойкость F200 и повышение класса.');
    } else if (temperatureZone === 'hot') {
        requirements.special_notes.push('Требуется использование жаропрочных добавок и специальный уход при твердении.');
        explanation.push('🔥 Жаркие/пожароопасные условия - требуются специальные добавки.');
    }

    // ============================================
    // ШАГ 5: МОДИФИКАТОРЫ ПО НАГРУЗКАМ
    // ============================================
    if (loadType === 'dynamic') {
        modifiers += 1;
        explanation.push('⬆️ +1 уровень: Динамические/вибрационные нагрузки требуют запаса прочности.');
    }

    // ============================================
    // ШАГ 6: МОДИФИКАТОРЫ ПО АРМИРОВАНИЮ
    // ============================================
    if (reinforcement === 'prestressed') {
        modifiers += 2;
        explanation.push('⬆️ +2 уровня: Предварительно напряженные конструкции требуют бетона высокого класса.');
    }

    // ============================================
    // ШАГ 7: МОДИФИКАТОРЫ ПО ТОЛЩИНЕ
    // ============================================
    if (elementThickness < 150) {
        modifiers += 1;
        explanation.push('⬆️ +1 уровень: Тонкостенные конструкции (<150 мм) более чувствительны к качеству бетона.');
    }
    
    // ============================================
    // ИТОГОВЫЙ РАСЧЕТ
    // ============================================
    const finalClass = increaseClass(baseClass, modifiers);

    // Авто-назначение W и F, если не заданы жестко
    const finalClassIndex = getClassIndex(finalClass);
    if (!requirements.waterproofing) {
        if (finalClassIndex <= 3) requirements.waterproofing = 'W2-W4';
        else if (finalClassIndex <= 6) requirements.waterproofing = 'W4-W6';
        else if (finalClassIndex <= 9) requirements.waterproofing = 'W6-W8';
        else requirements.waterproofing = 'W8-W12';
    }
    if (!requirements.frost_resistance) {
        if (finalClassIndex <= 4) requirements.frost_resistance = 'F75-F100';
        else if (finalClassIndex <= 7) requirements.frost_resistance = 'F150-F200';
        else requirements.frost_resistance = 'F200-F300';
    } else {
        // Убедимся, что F-марка не ниже требуемой
        const currentF = parseInt(String(requirements.frost_resistance).replace('F',''));
        if (finalClassIndex > 7 && currentF < 200) requirements.frost_resistance = 'F200';
        if (finalClassIndex > 9 && currentF < 300) requirements.frost_resistance = 'F300';
    }


    const classToMark = {
        'B10': 'М150', 'B12.5': 'М150', 'B15': 'М200', 'B20': 'М250',
        'B22.5': 'М300', 'B25': 'М350', 'B27.5': 'М350', 'B30': 'М400',
        'B35': 'М450', 'B40': 'М550', 'B45': 'М600', 'B50': 'М650',
        'B55': 'М700', 'B60': 'М800', 'B65': 'М850', 'B70': 'М900'
    };

    return {
        concreteClass: finalClass,
        mark: classToMark[finalClass] || 'N/A',
        baseClass: baseClass,
        modifiersApplied: modifiers,
        waterproofing: requirements.waterproofing,
        frostResistance: requirements.frost_resistance,
        sulfateResistance: requirements.sulfate_resistance,
        specialNotes: requirements.special_notes,
        explanation: explanation
    };
}

function calculateResultEnhanced() {
    const wizard = document.getElementById('wizardForm');
    const resultBlock = document.getElementById('wizardResult');
    if (!wizard || !resultBlock) return;

    const type = wizard.querySelector('input[name="type"]:checked')?.value || 'foundation';
    const load = wizard.querySelector('input[name="load"]:checked')?.value || 'light';
    const soil = wizard.querySelector('input[name="soil"]:checked')?.value || 'sand';
    const season = wizard.querySelector('input[name="season"]:checked')?.value || 'summer';

    const baseByType = {
        floor_screed: 'B12.5',
        prep_layers: 'B10',
        sidewalks: 'B15',
        fence_foundation: 'B15',
        garden_paths: 'B15',
        small_outbuildings: 'B15',
        foundation: 'B20',
        slab_foundation: 'B22.5',
        pile_foundation: 'B25',
        basement: 'B25',
        wall: 'B25',
        self_supporting_walls: 'B20'
    };

    const loadShift = { light: 0, medium: 1, heavy: 2 };
    const soilShift = { sand: 0, clay: 1, water: 2 };
    const baseClass = baseByType[type] || 'B20';
    const up = (loadShift[load] || 0) + (soilShift[soil] || 0);
    const resultClass = increaseClass(baseClass, up);

    const classToMark = {
        'B10': 'М150', 'B12.5': 'М150', 'B15': 'М200', 'B20': 'М250',
        'B22.5': 'М300', 'B25': 'М350', 'B27.5': 'М350', 'B30': 'М400',
        'B35': 'М450', 'B40': 'М550', 'B45': 'М600', 'B50': 'М650',
        'B55': 'М700', 'B60': 'М800', 'B65': 'М850', 'B70': 'М900'
    };

    const seasonAdvice = season === 'winter'
        ? 'Зимняя заливка: используйте противоморозные добавки и прогрев.'
        : season === 'hot'
            ? 'При жаре обязательно увлажняйте и укрывайте бетон первые 3-5 дней.'
            : 'Условия сезона благоприятные для стандартного набора прочности.';

    const loadText = { light: 'лёгкая', medium: 'средняя', heavy: 'высокая' }[load] || load;
    const soilText = { sand: 'сухой/песчаный', clay: 'глинистый', water: 'высокие грунтовые воды' }[soil] || soil;

    const resClassEl = document.getElementById('resClass');
    const resMarkEl = document.getElementById('resMark');
    const resTextEl = document.getElementById('resText');

    if (resClassEl) resClassEl.textContent = resultClass;
    if (resMarkEl) resMarkEl.textContent = classToMark[resultClass] || 'N/A';
    if (resTextEl) {
        resTextEl.innerHTML = `Подбор выполнен для типа конструкции: <strong>${type}</strong>, нагрузка: <strong>${loadText}</strong>, грунт: <strong>${soilText}</strong>.<br>${seasonAdvice}`;
    }

    wizard.style.display = 'none';
    resultBlock.style.display = 'block';
}