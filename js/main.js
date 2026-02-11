// js/main.js

// Главный объект приложения
const AntiFraudApp = {
    // Инициализация компонентов
    init: function() {
        console.log('Инициализация приложения Анти-мошенник...');
        
        // Инициализация классификаторов
        this.spamClassifier = new SpamClassifier();
        this.aiDetector = new AIDetector();
        
        // Настройка обработчиков событий
        this.setupEventListeners();
        
        // Загрузка примера сообщения
        this.loadExampleMessage();
        
        console.log('Приложение готово к работе');
    },
    
    // Настройка обработчиков событий
    setupEventListeners: function() {
        // Обработчик кнопки анализа
        const analyzeBtn = document.getElementById('analyze-btn');
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.analyzeMessage());
        }
        
        // Плавная прокрутка для навигации
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('href');
                if (targetId === '#') return;
                
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            });
        });
    },
    
    // Загрузка примера сообщения
    loadExampleMessage: function() {
        const exampleMessage = "Уважаемый клиент! Ваш банковский счет был заблокирован из-за подозрительной активности. Для разблокировки срочно перейдите по ссылке: http://fake-bank-security.ru/verify и введите свои данные. Это необходимо сделать в течение 24 часов, иначе доступ к счету будет утерян навсегда.";
        const messageInput = document.getElementById('message');
        if (messageInput) {
            messageInput.value = exampleMessage;
        }
    },
    
    // Анализ сообщения
    analyzeMessage: function() {
        const message = document.getElementById('message').value;
        const resultDiv = document.getElementById('result');
        const recommendationsDiv = document.getElementById('recommendations');
        const recommendationList = document.getElementById('recommendation-list');
        
        if (message.trim() === '') {
            alert('Пожалуйста, введите сообщение для анализа.');
            return;
        }
        
        // Показать индикатор загрузки
        const btn = document.getElementById('analyze-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Анализ...';
        btn.disabled = true;
        
        // Анализ сообщения
        setTimeout(() => {
            try {
                // Анализ на спам
                const spamProbability = this.spamClassifier.predictSpamProbability(message);
                
                // Анализ на ИИ
                const aiAnalysis = this.aiDetector.detectAI(message);
                const aiProbability = parseFloat(aiAnalysis.probability);
                const aiDetected = aiAnalysis.isAIGenerated;
                
                // Проверка на мошеннические паттерны
                const fraudScore = Utils.checkFraudPatterns(message, typeof fraudPatterns !== 'undefined' ? fraudPatterns : {});
                
                // Используем максимум из двух оценок
                const finalFraudScore = Math.max(spamProbability, fraudScore);
                
                // Определение уровня спама
                let spamLevel;
                if (finalFraudScore < 30) {
                    spamLevel = 'Низкий';
                } else if (finalFraudScore < 70) {
                    spamLevel = 'Средний';
                } else {
                    spamLevel = 'Высокий';
                }
                
                // Определение общей оценки безопасности
                const overallRisk = Utils.calculateOverallRisk(finalFraudScore, aiProbability);
                let safetyScore, safetyClass;
                const overallScore = parseFloat(overallRisk.score);
                
                if (overallScore < 30) {
                    safetyScore = 'Безопасно';
                    safetyClass = 'safe';
                } else if (overallScore < 70) {
                    safetyScore = 'Подозрительно';
                    safetyClass = 'spam-detected';
                } else {
                    safetyScore = 'Опасно';
                    safetyClass = 'danger';
                }
                
                // Обновление результатов на странице
                this.updateResults(
                    finalFraudScore, 
                    aiProbability, 
                    aiDetected, 
                    spamLevel, 
                    safetyScore, 
                    safetyClass, 
                    overallScore
                );
                
                // Генерация рекомендаций
                this.generateAndDisplayRecommendations(
                    finalFraudScore, 
                    aiDetected, 
                    spamLevel, 
                    recommendationList
                );
                
                // Показать результаты
                resultDiv.style.display = 'block';
                recommendationsDiv.style.display = 'block';
                
            } catch (error) {
                console.error('Ошибка при анализе сообщения:', error);
                alert('Произошла ошибка при анализе сообщения. Пожалуйста, попробуйте еще раз.');
            } finally {
                // Вернуть кнопку в исходное состояние
                btn.innerHTML = originalText;
                btn.disabled = false;
                
                // Прокрутка к результатам
                resultDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }, 500);
    },
    
    // Обновление результатов на странице
    updateResults: function(fraudScore, aiProbability, aiDetected, spamLevel, safetyScore, safetyClass, overallScore) {
        const fraudScoreElement = document.getElementById('fraud-score');
        fraudScoreElement.textContent = fraudScore.toFixed(2) + '%';
        fraudScoreElement.className = 'result-value ' + 
            (fraudScore < 30 ? 'safe' : fraudScore < 70 ? 'spam-detected' : 'danger');
        
        const aiScoreElement = document.getElementById('ai-score');
        aiScoreElement.textContent = aiDetected ? 
            `Обнаружено (${aiProbability}%)` : 
            `Не обнаружено (${aiProbability}%)`;
        aiScoreElement.className = 'result-value ' + 
            (aiDetected ? 'ai-detected' : 'safe');
        
        const spamScoreElement = document.getElementById('spam-score');
        spamScoreElement.textContent = `${spamLevel} (${fraudScore.toFixed(2)}%)`;
        spamScoreElement.className = 'result-value ' + 
            (spamLevel === 'Высокий' ? 'danger' : spamLevel === 'Средний' ? 'spam-detected' : 'safe');
        
        const safetyScoreElement = document.getElementById('safety-score');
        safetyScoreElement.textContent = `${safetyScore} (${overallScore.toFixed(2)}%)`;
        safetyScoreElement.className = 'result-value ' + safetyClass;
    },
    
    // Генерация и отображение рекомендаций
    generateAndDisplayRecommendations: function(fraudScore, aiDetected, spamLevel, recommendationListElement) {
        // Очищаем предыдущие рекомендации
        recommendationListElement.innerHTML = '';
        
        // Генерируем рекомендации
        const recommendations = Utils.generateRecommendations(
            fraudScore, 
            aiDetected, 
            spamLevel, 
            typeof recommendationsDB !== 'undefined' ? recommendationsDB : {}
        );
        
        // Добавляем рекомендации в список
        recommendations.forEach(rec => {
            const li = document.createElement('li');
            li.textContent = rec;
            recommendationListElement.appendChild(li);
        });
    }
};

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    AntiFraudApp.init();
});