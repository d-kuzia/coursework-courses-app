-- Seed: Створення тестових курсів з модулями, уроками та тестами

do $$
declare
  
  -- Курси
  course1_id uuid := gen_random_uuid();
  course2_id uuid := gen_random_uuid();
  course3_id uuid := gen_random_uuid();
  course4_id uuid := gen_random_uuid();
  course5_id uuid := gen_random_uuid();
  
  -- Модулі
  m1_1 uuid := gen_random_uuid();
  m1_2 uuid := gen_random_uuid();
  m1_3 uuid := gen_random_uuid();
  
  m2_1 uuid := gen_random_uuid();
  m2_2 uuid := gen_random_uuid();
  
  m3_1 uuid := gen_random_uuid();
  m3_2 uuid := gen_random_uuid();
  m3_3 uuid := gen_random_uuid();
  
  m4_1 uuid := gen_random_uuid();
  m4_2 uuid := gen_random_uuid();
  
  m5_1 uuid := gen_random_uuid();
  m5_2 uuid := gen_random_uuid();
  m5_3 uuid := gen_random_uuid();
  
  -- Уроки
  l1_1_1 uuid := gen_random_uuid();
  l1_1_2 uuid := gen_random_uuid();
  l1_2_1 uuid := gen_random_uuid();
  l1_2_2 uuid := gen_random_uuid();
  l1_3_1 uuid := gen_random_uuid();
  
  l2_1_1 uuid := gen_random_uuid();
  l2_1_2 uuid := gen_random_uuid();
  l2_2_1 uuid := gen_random_uuid();
  l2_2_2 uuid := gen_random_uuid();
  
  l3_1_1 uuid := gen_random_uuid();
  l3_1_2 uuid := gen_random_uuid();
  l3_2_1 uuid := gen_random_uuid();
  l3_2_2 uuid := gen_random_uuid();
  l3_3_1 uuid := gen_random_uuid();
  
  l4_1_1 uuid := gen_random_uuid();
  l4_1_2 uuid := gen_random_uuid();
  l4_2_1 uuid := gen_random_uuid();
  l4_2_2 uuid := gen_random_uuid();
  
  l5_1_1 uuid := gen_random_uuid();
  l5_1_2 uuid := gen_random_uuid();
  l5_2_1 uuid := gen_random_uuid();
  l5_2_2 uuid := gen_random_uuid();
  l5_3_1 uuid := gen_random_uuid();
  
  -- Тести
  quiz1 uuid := gen_random_uuid();
  quiz2 uuid := gen_random_uuid();
  quiz3 uuid := gen_random_uuid();
  quiz4 uuid := gen_random_uuid();
  quiz5 uuid := gen_random_uuid();
  
  -- Питання
  q1_1 uuid := gen_random_uuid();
  q1_2 uuid := gen_random_uuid();
  q2_1 uuid := gen_random_uuid();
  q2_2 uuid := gen_random_uuid();
  q3_1 uuid := gen_random_uuid();
  q3_2 uuid := gen_random_uuid();
  q4_1 uuid := gen_random_uuid();
  q4_2 uuid := gen_random_uuid();
  q5_1 uuid := gen_random_uuid();
  q5_2 uuid := gen_random_uuid();

begin
  -- ============================================
  -- КУРС 1: Основи JavaScript
  -- ============================================
  insert into courses (id, title, description, teacher_id) values
  (course1_id, 'Основи JavaScript', 'Повний курс з вивчення JavaScript з нуля. Ви навчитесь створювати інтерактивні веб-сторінки та розуміти основні концепції програмування.', NULL);

  -- Модулі курсу 1
  insert into modules (id, course_id, title, position) values
  (m1_1, course1_id, 'Вступ до JavaScript', 1),
  (m1_2, course1_id, 'Змінні та типи даних', 2),
  (m1_3, course1_id, 'Функції та об''єкти', 3);

  -- Уроки курсу 1
  insert into lessons (id, module_id, title, content, video_url, position) values
  (l1_1_1, m1_1, 'Що таке JavaScript?', 'JavaScript — це мова програмування, яка дозволяє створювати інтерактивні веб-сторінки. Вона працює безпосередньо у браузері користувача.

## Історія JavaScript

JavaScript був створений Бренданом Айком у 1995 році всього за 10 днів. Спочатку мова називалась Mocha, потім LiveScript, і нарешті — JavaScript.

## Де використовується JavaScript?

- Веб-розробка (фронтенд і бекенд)
- Мобільні додатки
- Ігри
- Серверні застосунки (Node.js)', 'https://www.youtube.com/watch?v=W6NZfCO5SIk', 1),
  (l1_1_2, m1_1, 'Налаштування середовища', 'Для початку роботи з JavaScript вам потрібен лише браузер та текстовий редактор.

## Рекомендовані інструменти

1. **VS Code** — безкоштовний редактор коду
2. **Chrome DevTools** — інструменти розробника в браузері
3. **Node.js** — для запуску JavaScript поза браузером

## Ваш перший код

```javascript
console.log("Привіт, світ!");
```', null, 2),
  (l1_2_1, m1_2, 'Змінні: let, const, var', 'Змінні — це контейнери для зберігання даних.

## Оголошення змінних

```javascript
let name = "Олена";
const age = 25;
var city = "Київ"; // застарілий спосіб
```

## Різниця між let, const та var

- **let** — змінна, яку можна перезаписати
- **const** — константа, не можна змінити
- **var** — старий синтаксис, краще не використовувати', null, 1),
  (l1_2_2, m1_2, 'Типи даних', 'JavaScript має кілька базових типів даних:

## Примітивні типи

- **String** — рядки тексту
- **Number** — числа
- **Boolean** — true/false
- **null** — відсутність значення
- **undefined** — неініціалізована змінна

## Приклади

```javascript
let text = "Привіт";      // String
let number = 42;          // Number
let isActive = true;      // Boolean
let empty = null;         // null
let notDefined;           // undefined
```', null, 2),
  (l1_3_1, m1_3, 'Функції в JavaScript', 'Функції — це блоки коду, які можна викликати багато разів.

## Оголошення функції

```javascript
function greet(name) {
  return "Привіт, " + name + "!";
}

// Стрілкова функція
const greetArrow = (name) => `Привіт, ${name}!`;
```

## Виклик функції

```javascript
console.log(greet("Олена")); // Привіт, Олена!
```', 'https://www.youtube.com/watch?v=FOD408a0EzU', 1);

  -- Тест до уроку 1.2.2
  insert into lesson_quizzes (id, lesson_id) values (quiz1, l1_2_2);
  
  insert into quiz_questions (id, quiz_id, text, position) values
  (q1_1, quiz1, 'Який тип даних використовується для зберігання тексту?', 1),
  (q1_2, quiz1, 'Що поверне typeof null?', 2);
  
  insert into quiz_options (question_id, text, is_correct) values
  (q1_1, 'Number', false),
  (q1_1, 'String', true),
  (q1_1, 'Boolean', false),
  (q1_1, 'Array', false),
  (q1_2, 'null', false),
  (q1_2, 'undefined', false),
  (q1_2, 'object', true),
  (q1_2, 'string', false);

  -- ============================================
  -- КУРС 2: Веб-дизайн з HTML та CSS
  -- ============================================
  insert into courses (id, title, description, teacher_id) values
  (course2_id, 'Веб-дизайн з HTML та CSS', 'Навчіться створювати красиві та адаптивні веб-сторінки. Від базових тегів HTML до сучасних CSS-анімацій.', NULL);

  insert into modules (id, course_id, title, position) values
  (m2_1, course2_id, 'HTML: структура веб-сторінки', 1),
  (m2_2, course2_id, 'CSS: стилізація елементів', 2);

  insert into lessons (id, module_id, title, content, video_url, position) values
  (l2_1_1, m2_1, 'Базові HTML-теги', 'HTML (HyperText Markup Language) — це мова розмітки для створення веб-сторінок.

## Структура HTML-документа

```html
<!DOCTYPE html>
<html>
<head>
  <title>Моя сторінка</title>
</head>
<body>
  <h1>Привіт!</h1>
  <p>Це мій перший сайт.</p>
</body>
</html>
```

## Основні теги

- `<h1>` - `<h6>` — заголовки
- `<p>` — параграф
- `<a>` — посилання
- `<img>` — зображення', null, 1),
  (l2_1_2, m2_1, 'Семантичні теги HTML5', 'Семантичні теги допомагають краще структурувати сторінку.

## Приклади семантичних тегів

- `<header>` — шапка сайту
- `<nav>` — навігація
- `<main>` — основний контент
- `<article>` — стаття
- `<section>` — секція
- `<footer>` — підвал сайту

## Чому це важливо?

1. Покращує SEO
2. Допомагає скрінрідерам
3. Робить код зрозумілішим', null, 2),
  (l2_2_1, m2_2, 'CSS: селектори та властивості', 'CSS (Cascading Style Sheets) — мова для стилізації HTML-елементів.

## Підключення CSS

```html
<link rel="stylesheet" href="styles.css">
```

## Селектори

```css
/* За тегом */
p { color: blue; }

/* За класом */
.button { background: green; }

/* За ID */
#header { height: 60px; }
```', null, 1),
  (l2_2_2, m2_2, 'Flexbox та Grid', 'Сучасні методи розташування елементів на сторінці.

## Flexbox

```css
.container {
  display: flex;
  justify-content: center;
  align-items: center;
}
```

## CSS Grid

```css
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 20px;
}
```

Обидва методи дозволяють створювати адаптивні макети без хаків.', 'https://www.youtube.com/watch?v=JJSoEo8JSnc', 2);

  -- Тест до уроку 2.2.2
  insert into lesson_quizzes (id, lesson_id) values (quiz2, l2_2_2);
  
  insert into quiz_questions (id, quiz_id, text, position) values
  (q2_1, quiz2, 'Яка властивість робить контейнер flex-контейнером?', 1),
  (q2_2, quiz2, 'Як вирівняти елементи по центру в Flexbox?', 2);
  
  insert into quiz_options (question_id, text, is_correct) values
  (q2_1, 'flex: 1', false),
  (q2_1, 'display: flex', true),
  (q2_1, 'position: flex', false),
  (q2_1, 'layout: flex', false),
  (q2_2, 'align: center', false),
  (q2_2, 'justify-content: center; align-items: center', true),
  (q2_2, 'text-align: center', false),
  (q2_2, 'margin: auto', false);

  -- ============================================
  -- КУРС 3: Python для початківців
  -- ============================================
  insert into courses (id, title, description, teacher_id) values
  (course3_id, 'Python для початківців', 'Вивчіть Python — одну з найпопулярніших мов програмування. Ідеально підходить для новачків та має широке застосування.', NULL);

  insert into modules (id, course_id, title, position) values
  (m3_1, course3_id, 'Знайомство з Python', 1),
  (m3_2, course3_id, 'Структури даних', 2),
  (m3_3, course3_id, 'Робота з файлами', 3);

  insert into lessons (id, module_id, title, content, video_url, position) values
  (l3_1_1, m3_1, 'Встановлення Python', 'Python — це інтерпретована мова програмування високого рівня.

## Встановлення

1. Завантажте Python з [python.org](https://python.org)
2. Встановіть, обравши "Add to PATH"
3. Перевірте: `python --version`

## IDE

- **PyCharm** — професійна IDE
- **VS Code** — легкий редактор з плагінами
- **IDLE** — вбудований редактор Python', null, 1),
  (l3_1_2, m3_1, 'Перша програма', 'Напишемо першу програму на Python!

```python
# Привітання
print("Привіт, світ!")

# Змінні
name = "Олена"
age = 25

print(f"Мене звати {name}, мені {age} років")
```

## Коментарі

```python
# Це однорядковий коментар

"""
Це багаторядковий
коментар
"""
```', null, 2),
  (l3_2_1, m3_2, 'Списки та кортежі', 'Списки та кортежі — це колекції елементів.

## Списки (list)

```python
fruits = ["яблуко", "банан", "апельсин"]
fruits.append("груша")
print(fruits[0])  # яблуко
```

## Кортежі (tuple)

```python
coordinates = (10, 20)
# coordinates[0] = 5  # Помилка! Кортежі незмінні
```', null, 1),
  (l3_2_2, m3_2, 'Словники та множини', 'Словники зберігають пари ключ-значення.

## Словники (dict)

```python
person = {
    "name": "Олена",
    "age": 25,
    "city": "Київ"
}
print(person["name"])  # Олена
```

## Множини (set)

```python
unique_numbers = {1, 2, 3, 3, 3}
print(unique_numbers)  # {1, 2, 3}
```', null, 2),
  (l3_3_1, m3_3, 'Читання та запис файлів', 'Python дозволяє легко працювати з файлами.

## Запис у файл

```python
with open("file.txt", "w") as f:
    f.write("Привіт!")
```

## Читання файлу

```python
with open("file.txt", "r") as f:
    content = f.read()
    print(content)
```

Конструкція `with` автоматично закриває файл.', null, 1);

  -- Тест до уроку 3.2.1
  insert into lesson_quizzes (id, lesson_id) values (quiz3, l3_2_1);
  
  insert into quiz_questions (id, quiz_id, text, position) values
  (q3_1, quiz3, 'Чим відрізняється список від кортежу?', 1),
  (q3_2, quiz3, 'Як додати елемент до списку?', 2);
  
  insert into quiz_options (question_id, text, is_correct) values
  (q3_1, 'Список можна змінювати, кортеж — ні', true),
  (q3_1, 'Кортеж швидший за список', false),
  (q3_1, 'Список використовує [], кортеж — {}', false),
  (q3_1, 'Немає різниці', false),
  (q3_2, 'list.add("item")', false),
  (q3_2, 'list.append("item")', true),
  (q3_2, 'list.push("item")', false),
  (q3_2, 'list += "item"', false);

  -- ============================================
  -- КУРС 4: React: Сучасна веб-розробка
  -- ============================================
  insert into courses (id, title, description, teacher_id) values
  (course4_id, 'React: Сучасна веб-розробка', 'Опануйте React — найпопулярнішу бібліотеку для створення користувацьких інтерфейсів. Від компонентів до хуків.', NULL);

  insert into modules (id, course_id, title, position) values
  (m4_1, course4_id, 'Основи React', 1),
  (m4_2, course4_id, 'Хуки та стан', 2);

  insert into lessons (id, module_id, title, content, video_url, position) values
  (l4_1_1, m4_1, 'Що таке React?', 'React — це JavaScript-бібліотека для створення UI.

## Чому React?

- **Компонентний підхід** — код легко перевикористовувати
- **Virtual DOM** — швидкі оновлення інтерфейсу
- **Великий екосистема** — багато готових рішень

## Створення проекту

```bash
npm create vite@latest my-app -- --template react
cd my-app
npm install
npm run dev
```', 'https://www.youtube.com/watch?v=Tn6-PIqc4UM', 1),
  (l4_1_2, m4_1, 'JSX та компоненти', 'JSX дозволяє писати HTML-подібний код у JavaScript.

## JSX

```jsx
const element = <h1>Привіт, React!</h1>;
```

## Компоненти

```jsx
function Welcome({ name }) {
  return <h1>Привіт, {name}!</h1>;
}

// Використання
<Welcome name="Олена" />
```

Компоненти — це функції, які повертають JSX.', null, 2),
  (l4_2_1, m4_2, 'useState: локальний стан', 'useState — хук для зберігання стану в компоненті.

```jsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>Лічильник: {count}</p>
      <button onClick={() => setCount(count + 1)}>
        Додати
      </button>
    </div>
  );
}
```

useState повертає масив: поточне значення та функцію для оновлення.', null, 1),
  (l4_2_2, m4_2, 'useEffect: побічні ефекти', 'useEffect виконує код при зміні залежностей.

```jsx
import { useState, useEffect } from "react";

function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);

    // Очищення при розмонтуванні
    return () => clearInterval(interval);
  }, []); // Порожній масив = тільки при монтуванні

  return <p>Секунди: {seconds}</p>;
}
```', 'https://www.youtube.com/watch?v=0ZJgIjIuY7U', 2);

  -- Тест до уроку 4.2.1
  insert into lesson_quizzes (id, lesson_id) values (quiz4, l4_2_1);
  
  insert into quiz_questions (id, quiz_id, text, position) values
  (q4_1, quiz4, 'Що повертає хук useState?', 1),
  (q4_2, quiz4, 'Як правильно оновити стан?', 2);
  
  insert into quiz_options (question_id, text, is_correct) values
  (q4_1, 'Тільки поточне значення', false),
  (q4_1, 'Масив [значення, функція оновлення]', true),
  (q4_1, 'Об''єкт { value, setValue }', false),
  (q4_1, 'Promise', false),
  (q4_2, 'count = count + 1', false),
  (q4_2, 'setCount(count + 1)', true),
  (q4_2, 'useState(count + 1)', false),
  (q4_2, 'this.setState({ count: count + 1 })', false);

  -- ============================================
  -- КУРС 5: Бази даних та SQL
  -- ============================================
  insert into courses (id, title, description, teacher_id) values
  (course5_id, 'Бази даних та SQL', 'Вивчіть основи реляційних баз даних та мову SQL. Навчіться проектувати бази даних та писати ефективні запити.', NULL);

  insert into modules (id, course_id, title, position) values
  (m5_1, course5_id, 'Вступ до баз даних', 1),
  (m5_2, course5_id, 'Основи SQL', 2),
  (m5_3, course5_id, 'Складні запити', 3);

  insert into lessons (id, module_id, title, content, video_url, position) values
  (l5_1_1, m5_1, 'Що таке база даних?', 'База даних — це організована колекція даних.

## Типи баз даних

- **Реляційні** (PostgreSQL, MySQL) — таблиці з рядками та стовпцями
- **NoSQL** (MongoDB, Redis) — документи, ключ-значення
- **Графові** (Neo4j) — вузли та зв''язки

## Реляційна модель

Дані зберігаються в таблицях, пов''язаних через ключі.

| id | name    | email           |
|----|---------|-----------------|
| 1  | Олена   | olena@email.com |
| 2  | Андрій  | andrii@email.com|', null, 1),
  (l5_1_2, m5_1, 'Встановлення PostgreSQL', 'PostgreSQL — потужна реляційна СУБД з відкритим кодом.

## Встановлення

### Windows
1. Завантажте з postgresql.org
2. Запустіть інсталятор
3. Запам''ятайте пароль для postgres

### macOS
```bash
brew install postgresql@15
brew services start postgresql@15
```

## Перевірка
```bash
psql --version
```', null, 2),
  (l5_2_1, m5_2, 'SELECT: вибірка даних', 'SELECT — основний запит для отримання даних.

```sql
-- Вибрати всі стовпці
SELECT * FROM users;

-- Вибрати конкретні стовпці
SELECT name, email FROM users;

-- Фільтрація
SELECT * FROM users WHERE age > 18;

-- Сортування
SELECT * FROM users ORDER BY name ASC;

-- Ліміт
SELECT * FROM users LIMIT 10;
```', null, 1),
  (l5_2_2, m5_2, 'INSERT, UPDATE, DELETE', 'Операції модифікації даних.

## INSERT — додавання

```sql
INSERT INTO users (name, email)
VALUES (''Олена'', ''olena@email.com'');
```

## UPDATE — оновлення

```sql
UPDATE users
SET email = ''new@email.com''
WHERE id = 1;
```

## DELETE — видалення

```sql
DELETE FROM users
WHERE id = 1;
```

**Увага!** Завжди використовуйте WHERE, щоб не змінити/видалити всі записи!', null, 2),
  (l5_3_1, m5_3, 'JOIN: об''єднання таблиць', 'JOIN дозволяє об''єднувати дані з кількох таблиць.

## Типи JOIN

```sql
-- INNER JOIN — тільки співпадіння
SELECT u.name, o.product
FROM users u
INNER JOIN orders o ON u.id = o.user_id;

-- LEFT JOIN — всі з лівої + співпадіння
SELECT u.name, o.product
FROM users u
LEFT JOIN orders o ON u.id = o.user_id;

-- RIGHT JOIN — всі з правої + співпадіння
-- FULL JOIN — всі записи з обох таблиць
```', 'https://www.youtube.com/watch?v=9yeOJ0ZMUYw', 1);

  -- Тест до уроку 5.2.1
  insert into lesson_quizzes (id, lesson_id) values (quiz5, l5_2_1);
  
  insert into quiz_questions (id, quiz_id, text, position) values
  (q5_1, quiz5, 'Який оператор використовується для вибірки даних?', 1),
  (q5_2, quiz5, 'Як обмежити кількість результатів?', 2);
  
  insert into quiz_options (question_id, text, is_correct) values
  (q5_1, 'GET', false),
  (q5_1, 'SELECT', true),
  (q5_1, 'FETCH', false),
  (q5_1, 'READ', false),
  (q5_2, 'LIMIT 10', true),
  (q5_2, 'MAX 10', false),
  (q5_2, 'TOP 10', false),
  (q5_2, 'FIRST 10', false);

  raise notice 'Seed data created successfully!';
end $$;

