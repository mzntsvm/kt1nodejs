import fs from 'fs';
import path from 'path';
import { loadConfig } from './config/index.js'; // Укажите правильный относительный путь к файлу с loadConfig

try {
  // 1. Загружаем переменные из .env
  const config = loadConfig();

  // 2. Проверяем наличие входного файла
  const inputFilePath = path.resolve(config.inputFile);
  if (!fs.existsSync(inputFilePath)) {
    console.error(`Ошибка: Файл ${config.inputFile} не найден!`);
    process.exit(1);
  }

  // 3. Читаем данные из CSV
  const fileContent = fs.readFileSync(inputFilePath, 'utf-8');
  const lines = fileContent.split('\n').map(line => line.trim()).filter(Boolean);

  if (lines.length === 0) {
    console.log('Файл пуст.');
    process.exit(0);
  }

  // Заголовок CSV (например: id,name,age,city)
  const headers = lines[0];
  const rows = lines.slice(1);

  // 4. Фильтруем строки по возрасту и городу
  const filteredRows = rows.filter(row => {
    const columns = row.split(',');
    // Предполагаем структуру CSV: Name, Age, City или аналогичную
    // Если структура отличается, фильтр сработает по текстовому совпадению
    const rowText = row.toLowerCase();
    const matchesCity = rowText.includes(config.cityFilter.toLowerCase());
    
    // Поиск возраста (ищем числа в строке)
    const numbers = row.match(/\d+/g);
    const hasValidAge = numbers ? numbers.some(num => Number(num) >= config.minAge) : true;

    return matchesCity && hasValidAge;
  });

  // 5. Записываем результат в выходной файл
  const outputFilePath = path.resolve(config.outputFile);
  const outputData = [headers, ...filteredRows].join('\n');
  
  // Создаем папку, если ее нет
  const outputDir = path.dirname(outputFilePath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(outputFilePath, outputData, 'utf-8');

  console.log('--- Обработка завершена успешно! ---');
  console.log(`Найдено записей: ${filteredRows.length}`);
  console.log(`Результат сохранен в: ${config.outputFile}`);

} catch (error) {
  console.error('Ошибка выполнения:', error.message);
}