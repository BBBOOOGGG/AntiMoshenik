// js/utils.js

// Функции для работы с данными
const Utils = {
    // Загрузка сообщений из файла (эмуляция)
    loadMessagesFromFile: function(filename) {
        try {
            // В реальном приложении здесь будет чтение файла
            console.log(`Загрузка данных из ${filename}...`);
            return [];
        } catch (error) {
            console.error(`Ошибка загрузки файла ${filename}:`, error);
            return [];
        }
    },

    // Разделение на обучающую и тестовую выборки
    trainTestSplit: function(messages, labels, testSize = 0.2) {
        const combined = messages.map((msg, idx) => [msg, labels[idx]]);
        
        for (let i = combined.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [combined[i], combined[j]] = [combined[j], combined[i]];
        }
        
        const splitIdx = Math.floor(combined.length * (1 - testSize));
        const trainData = combined.slice(0, splitIdx);
        const testData = combined.slice(splitIdx);
        
        const trainMessages = trainData.map(item => item[0]);
        const trainLabels = trainData.map(item => item[1]);
        const testMessages = testData.map(item => item[0]);
        const testLabels = testData.map(item => item[1]);
        
        return [trainMessages, trainLabels, testMessages, testLabels];
    },

    // Оценка модели
    evaluateModel: function(predictFunction, testMessages, testLabels) {
        let correct = 0;
        const total = testMessages.length;
        const threshold = 50;
        
        for (let i = 0; i < total; i++) {
            const probability = predictFunction(testMessages[i]);
            const prediction = probability >= threshold ? 1 : 0;
            if (prediction === testLabels[i]) {
                correct++;
            }
        }
        
        const accuracy = (correct / total) * 100;
        return accuracy;
    },

    // Расчет общего риска
    calculateOverallRisk: function(spamProb, aiProb) {
        const spamWeight = 0.7;
        const aiWeight = 0.3;
        
        const spamRisk = spamProb * spamWeight / 100;
        const aiRisk = aiProb * aiWeight / 100;
        
        const overallRisk = (spamRisk + aiRisk) * 100;
        
        return {
            score: overallRisk.toFixed(2),
            level: this.getRiskLevel(overallRisk)
        };
    },

    // Определение уровня риска
    getRiskLevel: function(score) {
        if (score < 30) return 'Low';
        if (score < 70) return 'Medium';
        return 'High';
    },

    // Генерация рекомендаций
    generateRecommendations: function(fraudScore, aiDetected, spamLevel, recommendationDB) {
        const recommendations = [];
        
        // Определяем уровень угрозы мошенничества
        let fraudLevel;
        if (fraudScore < 30) {
            fraudLevel = 'low';
        } else if (fraudScore < 70) {
            fraudLevel = 'medium';
        } else {
            fraudLevel = 'high';
        }
        
        // Добавляем рекомендации по мошенничеству
        const fraudRecs = recommendationDB.fraud[fraudLevel] || [];
        fraudRecs.forEach(rec => {
            recommendations.push(rec);
        });
        
        // Добавляем рекомендации по ИИ
        const aiRecs = aiDetected ? recommendationDB.ai.detected : recommendationDB.ai.notDetected;
        aiRecs.forEach(rec => {
            recommendations.push(rec);
        });
        
        // Добавляем рекомендации по спаму
        let spamKey;
        if (spamLevel === 'Низкий') spamKey = 'low';
        else if (spamLevel === 'Средний') spamKey = 'medium';
        else spamKey = 'high';
        
        const spamRecs = recommendationDB.spam[spamKey] || [];
        spamRecs.forEach(rec => {
            recommendations.push(rec);
        });
        
        // Добавляем общие рекомендации
        (recommendationDB.general || []).forEach(rec => {
            recommendations.push(rec);
        });
        
        // Удаляем дубликаты
        return [...new Set(recommendations)];
    },

    // Проверка сообщения на мошенничество по паттернам
    checkFraudPatterns: function(text, patterns) {
        const lowerText = text.toLowerCase();
        let score = 0;
        
        // Проверка срочных фраз
        for (const phrase of patterns.urgentPhrases || []) {
            if (lowerText.includes(phrase)) {
                score += 10;
            }
        }
        
        // Проверка финансовых фраз
        for (const phrase of patterns.financialPhrases || []) {
            if (lowerText.includes(phrase)) {
                score += 15;
            }
        }
        
        // Проверка подозрительных ссылок
        for (const phrase of patterns.suspiciousLinks || []) {
            if (lowerText.includes(phrase)) {
                score += 20;
            }
        }
        
        // Проверка запросов личных данных
        for (const phrase of patterns.personalDataRequests || []) {
            if (lowerText.includes(phrase)) {
                score += 25;
            }
        }
        
        return Math.min(score, 100);
    }
};

// Экспортируем утилиты
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Utils;
}