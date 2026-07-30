/**
 * ============================================================================
 * БОГДАН & ОЛЕКСАНДРА — ВЕСІЛЬНИЙ ВЕБСАЙТ (03.10.2026)
 * GOOGLE APPS SCRIPT BACKEND (Code.gs)
 * ============================================================================
 * Інструкція з налаштування:
 * 1. Створіть нову таблицю в Google Таблицях (https://sheets.new).
 * 2. У верхньому меню оберіть: Розширення (Extensions) -> Apps Script.
 * 3. Вставте цей код у редактор файлу Code.gs.
 * 4. Натисніть кнопку "Зберегти" (іконка дискети або Ctrl+S).
 * 5. Натисніть кнопку "Розгорнути" (Deploy) -> "Нове розгортання" (New deployment).
 * 6. Оберіть тип розгортання: "Веб-програма" (Web app).
 * 7. Встановіть параметри:
 *    - Опис: Весільний RSVP Б&О
 *    - Виконувати як: Я (ваша електронна пошта)
 *    - Хто має доступ: Усі (Anyone) — КРИТИЧНО для роботи форми без авторизації!
 * 8. Натисніть "Розгорнути" (Deploy), надайте дозволи при запиті.
 * 9. Скопіюйте отримане "URL-адресу веб-програми" (Web App URL).
 * 10. Вставте цю URL-адресу у весільний сайт (або в налаштуваннях у футтері).
 * ============================================================================
 */

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Перевіряємо та створюємо заголовки столбців, якщо таблиця порожня
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Дата та час (Timestamp)",
        "Ім'я (First Name)",
        "Прізвище (Last Name)",
        "Присутність (Attendance)",
        "Кількість гостей (Guest Count)",
        "Вибір алкоголю (Alcohol)",
        "Особливості харчування (Dietary)",
        "Коментар / Побажання (Comment)"
      ]);
      
      // Стилізація заголовка
      var headerRange = sheet.getRange(1, 1, 1, 8);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#63725A"); // Dark Eucalyptus
      headerRange.setFontColor("#FFFFFF");
      sheet.setFrozenRows(1);
    }
    
    // Отримуємо дані з POST запиту
    var data = {};
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    }
    
    var timestamp = new Date().toLocaleString("uk-UA", { timeZone: "Europe/Kyiv" });
    var firstName = data.firstName || "";
    var lastName = data.lastName || "";
    var attending = data.attending ? "Так" : "Ні";
    var guestCount = data.attending ? (data.guestCount || 1) : 0;
    var alcohol = Array.isArray(data.alcohol) ? data.alcohol.join(", ") : (data.alcohol || "Не вказано");
    var dietary = data.dietary || "Немає";
    var comment = data.comment || "";
    
    // Додаємо новий рядок у Google Таблицю
    sheet.appendRow([
      timestamp,
      firstName,
      lastName,
      attending,
      guestCount,
      alcohol,
      dietary,
      comment
    ]);
    
    // Форматування колонок для зручного читання
    sheet.autoResizeColumns(1, 8);
    
    return ContentService.createTextOutput(JSON.stringify({
      result: "success",
      message: "Відповідь успішно збережено в Google Sheets"
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      result: "error",
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "active",
    message: "RSVP Google Sheets Web App працює належним чином!"
  })).setMimeType(ContentService.MimeType.JSON);
}
