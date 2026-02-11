// js/classifiers.js

// Класс классификатора спама
class SpamClassifier {
    constructor() {
        this.spamWords = new Map();
        this.hamWords = new Map();
        this.totalSpam = 0;
        this.totalHam = 0;
        this.spamWordCount = 0;
        this.hamWordCount = 0;
        this.vocab = new Set();
        this.isTrained = false;
        
        // Инициализация с обучающими данными
        if (typeof trainingData !== 'undefined') {
            this.train(trainingData.spamMessages, trainingData.hamMessages);
        }
    }
    preprocess(text) {
        text = text.toLowerCase().trim();
        text = text.replace(/[^a-zа-яё0-9\s]/gi, '');
        const words = text.match(/[a-zа-яё]+|\d+/gi) || [];
        return words;
    }
    train(spamMessages, hamMessages) {
        for (const message of spamMessages) {
            this.totalSpam++;
            const words = this.preprocess(message);
            for (const word of words) {
                this.spamWords.set(word, (this.spamWords.get(word) || 0) + 1);
                this.spamWordCount++;
                this.vocab.add(word);
            }
        }
        for (const message of hamMessages) {
            this.totalHam++;
            const words = this.preprocess(message);
            for (const word of words) {
                this.hamWords.set(word, (this.hamWords.get(word) || 0) + 1);
                this.hamWordCount++;
                this.vocab.add(word);
            }
        }
        this.isTrained = true;
        console.log(`Классификатор обучен: ${this.totalSpam} спам, ${this.totalHam} не-спам, словарь: ${this.vocab.size} слов`);
    }
    wordProbability(word, isSpam) {
        const vocabSize = this.vocab.size;
        
        if (isSpam) {
            return ((this.spamWords.get(word) || 0) + 1) / (this.spamWordCount + vocabSize);
        } else {
            return ((this.hamWords.get(word) || 0) + 1) / (this.hamWordCount + vocabSize);
        }
    }

    predictSpamProbability(message) {
        if (!this.isTrained) {
            throw new Error("Классификатор не обучен");
        }
        const words = this.preprocess(message);
        if (words.length === 0) {
            return 50.0;
        }
        const pSpam = this.totalSpam / (this.totalSpam + this.totalHam);
        const pHam = this.totalHam / (this.totalSpam + this.totalHam);
        let logPSpam = Math.log(pSpam);
        let logPHam = Math.log(pHam);
        for (const word of words) {
            const pWordSpam = this.wordProbability(word, true);
            const pWordHam = this.wordProbability(word, false);

            logPSpam += Math.log(pWordSpam);
            logPHam += Math.log(pWordHam);
        }
        try {
            const maxLog = Math.max(logPSpam, logPHam);
            const scoreSpam = logPSpam - maxLog;
            const scoreHam = logPHam - maxLog;

            const expSpam = Math.exp(scoreSpam);
            const expHam = Math.exp(scoreHam);

            let p = expSpam / (expSpam + expHam);
            p = Math.max(0.0, Math.min(1.0, p));

            return p * 100;
        } catch (e) {
            return logPSpam > logPHam ? 100.0 : 0.0;
        }
    }

    getStats() {
        const topSpamWords = [...this.spamWords.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
        const topHamWords = [...this.hamWords.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10);
        return {
            totalSpam: this.totalSpam,
            totalHam: this.totalHam,
            vocabSize: this.vocab.size,
            topSpamWords: topSpamWords,
            topHamWords: topHamWords
        };
    }
}

// определения ИИ
class AIDetector {
    constructor() {
        this.aiPatterns = {
            formalPhrases: [
                'as an ai language model',
                'i am an ai',
                'as an artificial intelligence',
                'i don\'t have personal',
                'i cannot provide',
                'my knowledge cutoff',
                'based on my training data',
                'as a language model',
                'i\'m designed to',
                'i don\'t have feelings'
            ],
            repetitivePatterns: [
                /however\s*,/gi,
                /additionally\s*,/gi,
                /furthermore\s*,/gi,
                /in conclusion\s*,/gi,
                /it is important to note/gi,
                /this suggests that/gi
            ],
            excessiveFormality: [
                /endeavor to/gi,
                /utilize/gi,
                /ascertain/gi,
                /elucidate/gi,
                /consequently/gi,
                /thus/gi,
                /hence/gi
            ]
        };

        this.humanPatterns = {
            informalExpressions: [
                /lol/gi,
                /omg/gi,
                /btw/gi,
                /imo/gi,
                /tbh/gi,
                /idk/gi,
                /afaik/gi
            ],
            contractions: [
                /i\'m/gi,
                /you\'re/gi,
                /they\'re/gi,
                /don\'t/gi,
                /can\'t/gi,
                /won\'t/gi,
                /isn\'t/gi,
                /aren\'t/gi
            ],
            emotionalExpressions: [
                /haha/gi,
                /hehe/gi,
                /wow/gi,
                /awesome/gi,
                /crazy/gi,
                /unbelievable/gi
            ]
        };
    }
    
    preprocess(text) {
        return text.toLowerCase().trim();
    }
    
    analyzeText(text) {
        const processedText = this.preprocess(text);
        let aiScore = 0;
        let humanScore = 0;
        
        for (const phrase of this.aiPatterns.formalPhrases) {
            if (processedText.includes(phrase)) {
                aiScore += 15;
            }
        }
        
        for (const pattern of this.aiPatterns.repetitivePatterns) {
            const matches = processedText.match(pattern);
            if (matches) {
                aiScore += matches.length * 5;
            }
        }
        
        for (const pattern of this.aiPatterns.excessiveFormality) {
            const matches = processedText.match(pattern);
            if (matches) {
                aiScore += matches.length * 3;
            }
        }
        
        // Проверка человеческих паттернов
        for (const pattern of this.humanPatterns.informalExpressions) {
            const matches = processedText.match(pattern);
            if (matches) {
                humanScore += matches.length * 10;
            }
        }
        
        for (const pattern of this.humanPatterns.contractions) {
            const matches = processedText.match(pattern);
            if (matches) {
                humanScore += matches.length * 5;
            }
        }
        
        for (const pattern of this.humanPatterns.emotionalExpressions) {
            const matches = processedText.match(pattern);
            if (matches) {
                humanScore += matches.length * 8;
            }
        }
        
        // Анализ структуры текста
        const sentences = processedText.split(/[.!?]+/).filter(s => s.trim().length > 0);
        if (sentences.length > 3) {
            const lengthVariation = Math.max(...sentences.map(s => s.split(' ').length)) - 
                                   Math.min(...sentences.map(s => s.split(' ').length));
            if (lengthVariation < 3) {
                aiScore += 10;
            }
        }
        
        // Слишком совершенная грамматика
        const hasErrors = this.checkForCommonErrors(text);
        if (!hasErrors && text.length > 100) {
            aiScore += 5;
        }
        
        // Нормализация оценок
        const totalScore = aiScore + humanScore;
        if (totalScore === 0) return 50.0;
        
        const aiProbability = (aiScore / totalScore) * 100;
        return Math.min(Math.max(aiProbability, 0), 100);
    }
    
    checkForCommonErrors(text) {
        const commonErrors = [
            /their\s+for\s+there/gi,
            /your\s+for\s+you\'re/gi,
            /its\s+for\s+it\'s/gi,
            /then\s+for\s+than/gi
        ];
        
        for (const error of commonErrors) {
            if (text.match(error)) {
                return true;
            }
        }
        return false;
    }
    
    detectAI(text, threshold = 70) {
        const probability = this.analyzeText(text);
        return {
            probability: probability.toFixed(2),
            isAIGenerated: probability >= threshold,
            confidence: Math.abs(probability - 50) * 2
        };
    }
}

// Экспортируем классы
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SpamClassifier, AIDetector };
}