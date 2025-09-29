const express = require('express');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3889;
// Настройка EJS как шаблонизатора
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
// Поддерживаемые категории
const validCategories = ['auto', 'world', 'internet', 'sport', 'culture', 'movies', 'politics'];
// Маршрут для обработки запросов новостей
app.get('/yandex/:count/news/for/:category', async (req, res) => {
try {
const { count, category } = req.params;
// Проверяем валидность категории
if (!validCategories.includes(category)) {
return res.status(400).send('Неверная категория. Допустимые значения: ' + validCategories.join(', '));
}
// Проверяем валидность количества
const newsCount = parseInt(count);
if (isNaN(newsCount) || newsCount <= 0) {
return res.status(400).send('Количество новостей должно быть положительным числом');
}
// Формируем URL для RSS Яндекса
const yandexRssUrl = `http://news.yandex.ru/${category}.rss`;
// Формируем URL для запроса к rss2json
const rss2jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(yandexRssUrl)}`;
// Делаем запрос к rss2json API
const response = await axios.get(rss2jsonUrl);
const newsData = response.data;
// Проверяем, есть ли новости в ответе
if (!newsData.items || newsData.items.length === 0) {
return res.status(404).send('Новости не найдены');
}
// Ограничиваем количество новостей согласно запросу
const limitedNews = newsData.items.slice(0, newsCount);
// Рендерим шаблон с новостями
res.render('news', {
count: newsCount,
category: category,
news: limitedNews
});
} catch (error) {
console.error('Ошибка при получении новостей:', error.message);
res.status(500).send('Произошла ошибка при получении новостей');
}
});
// Запуск сервера
app.listen(PORT, () => {
console.log(`Сервер запущен на порту ${PORT}`);
console.log(`Пример запроса: http://localhost:${PORT}/yandex/5/news/for/auto`);
});

