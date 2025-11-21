export const DEFAULT_LANG = "ua";

export const LANG_OPTIONS = [
  { value: "ua", label: "UA" },
  { value: "en", label: "EN" }
];

export const translations = {
  ua: {
    nav: {
      home: "Головна",
      courses: "Курси",
      myCourses: "Мої курси",
      admin: "Адмін-панель",
      login: "Вхід",
      register: "Реєстрація",
      profile: "Профіль",
      logout: "Вийти",
      language: "Мова"
    },
    home: {
      title: "Online Courses — MVP",
      backendOk: "Бекенд: працює",
      backendFail: "Бекенд: помилка",
      dbOk: "База даних: OK ({{time}})",
      dbFail: "База даних: помилка"
    },
    common: {
      loading: "Завантаження...",
      loadFailed: "Не вдалося завантажити",
      saveFailed: "Помилка збереження",
      noDescription: "Без опису",
      teacher: "Викладач",
      teacherLine: "Викладач: {{name}}",
      modulesLessons: "Модулі: {{modules}} · Уроки: {{lessons}}",
      status: "Статус",
      progress: "Прогрес",
      edit: "Редагувати",
      delete: "Видалити",
      cancel: "Скасувати",
      save: "Зберегти",
      saving: "Збереження...",
      notFound: "Не знайдено",
      noRecords: "Немає записів.",
      progressLine: "Прогрес: {{value}}%"
    },
    auth: {
      emailLabel: "Email",
      passwordLabel: "Пароль",
      passwordPlaceholder: "Пароль",
      loginTitle: "Вхід",
      loginButton: "Увійти",
      loginError: "Помилка входу",
      registerTitle: "Реєстрація",
      registerError: "Помилка реєстрації",
      nameLabel: "Ім'я",
      namePlaceholder: "Ваше ім'я",
      passwordHint: "Пароль (мін. 8 символів)",
      createAccount: "Створити акаунт"
    },
    courses: {
      title: "Курси",
      subtitle: "Список доступних курсів",
      createCourse: "Створити курс",
      loadError: "Не вдалося завантажити",
      submitCreate: "Створити",
      confirmDelete: "Видалити курс?",
      empty: "Немає курсів."
    },
    courseForm: {
      nameLabel: "Назва",
      descriptionLabel: "Опис"
    },
    courseDetails: {
      youTeach: "Ви викладаєте цей курс",
      alreadyEnrolled: "Ви вже записані на цей курс",
      enrollAction: "Записатися на курс",
      enrollLoading: "Запис...",
      tabStructure: "Структура",
      tabStudents: "Записані студенти",
      studentsTitle: "Студенти",
      noEnrollments: "Немає записів.",
      enrollmentMeta: "Роль: {{role}} · Статус: {{status}}",
      progressLine: "Прогрес: {{value}}%",
      updateCourse: "Оновити",
      modulesTitle: "Модулі",
      modulePlaceholder: "Назва модуля",
      moduleCreating: "Створення...",
      addModule: "Додати",
      lessonsCount: "Уроків: {{count}}",
      lessonOrder: "Порядок: {{position}}",
      noLessons: "Уроків ще нема.",
      lessonTitlePlaceholder: "Назва уроку",
      lessonVideoPlaceholder: "YouTube URL (необов'язково)",
      lessonDescriptionPlaceholder: "Опис уроку",
      lessonSaving: "Збереження...",
      addLesson: "Додати урок",
      noModules: "Модулів ще нема.",
      enrollError: "Не вдалося записатися",
      moduleCreateError: "Не вдалося створити модуль",
      lessonCreateError: "Не вдалося створити урок",
      enrollmentsError: "Не вдалося завантажити список студентів"
    },
    lessons: {
      loadError: "Не вдалося завантажити",
      checkError: "Не вдалося перевірити",
      saveQuizError: "Не вдалося зберегти тест",
      notFound: "Урок не знайдено",
      backToCourse: "До курсу: {{title}}",
      quizTitle: "Тест",
      editQuiz: "Редагувати тест",
      createQuiz: "Створити тест",
      questionTitle: "Питання {{index}}",
      deleteQuestion: "Видалити",
      questionPlaceholder: "Текст питання",
      correctAnswer: "Правильна відповідь",
      optionPlaceholder: "Текст варіанту",
      addOption: "Додати варіант",
      addQuestion: "Додати питання",
      saveQuiz: "Зберегти тест",
      savingQuiz: "Збереження...",
      noQuiz: "У цього уроку ще немає тесту.",
      submitQuiz: "Перевірити результат",
      submittingQuiz: "Перевірка...",
      resultSummary: "Правильних відповідей: {{correct}} / {{total}}",
      validation: {
        textRequired: "У кожного питання має бути текст",
        optionMin: "Мінімум 2 варіанти на питання",
        correctRequired: "У кожного питання має бути правильний варіант"
      }
    },
    myCourses: {
      loadError: "Не вдалося завантажити курси",
      loginPrompt: "Будь ласка, увійдіть, щоб бачити свої курси.",
      title: "Мої курси",
      subtitle: "Курси, на які ви записалися",
      empty: "Ви ще не записані на курси."
    },
    profile: {
      notAuthenticated: "Ви не увійшли в систему.",
      title: "Профіль",
      name: "Імʼя",
      email: "Email",
      role: "Роль"
    },
    admin: {
      subtitle: "Керування користувачами та ролями",
      loadError: "Не вдалося завантажити користувачів",
      updateError: "Не вдалося оновити користувача",
      roleLabel: "Роль",
      statusLabel: "Статус",
      statusActive: "Активний",
      statusBlocked: "Заблоковано",
      block: "Заблокувати",
      activate: "Активувати",
      empty: "Ще немає користувачів."
    }
  },
  en: {
    nav: {
      home: "Home",
      courses: "Courses",
      myCourses: "My courses",
      admin: "Admin panel",
      login: "Sign in",
      register: "Sign up",
      profile: "Profile",
      logout: "Log out",
      language: "Language"
    },
    home: {
      title: "Online Courses — MVP",
      backendOk: "Backend: OK",
      backendFail: "Backend: FAIL",
      dbOk: "DB: OK ({{time}})",
      dbFail: "DB: FAIL"
    },
    common: {
      loading: "Loading...",
      loadFailed: "Failed to load data",
      saveFailed: "Failed to save data",
      noDescription: "No description",
      teacher: "Instructor",
      teacherLine: "Instructor: {{name}}",
      modulesLessons: "Modules: {{modules}} · Lessons: {{lessons}}",
      status: "Status",
      progress: "Progress",
      edit: "Edit",
      delete: "Delete",
      cancel: "Cancel",
      save: "Save",
      saving: "Saving...",
      notFound: "Not found",
      noRecords: "No entries.",
      progressLine: "Progress: {{value}}%"
    },
    auth: {
      emailLabel: "Email",
      passwordLabel: "Password",
      passwordPlaceholder: "Password",
      loginTitle: "Sign in",
      loginButton: "Sign in",
      loginError: "Sign-in error",
      registerTitle: "Sign up",
      registerError: "Registration error",
      nameLabel: "Name",
      namePlaceholder: "Your name",
      passwordHint: "Password (min. 8 characters)",
      createAccount: "Create account"
    },
    courses: {
      title: "Courses",
      subtitle: "List of available courses",
      createCourse: "Create course",
      loadError: "Failed to load data",
      submitCreate: "Create",
      confirmDelete: "Delete course?",
      empty: "No courses yet."
    },
    courseForm: {
      nameLabel: "Title",
      descriptionLabel: "Description"
    },
    courseDetails: {
      youTeach: "You teach this course",
      alreadyEnrolled: "You are already enrolled",
      enrollAction: "Enroll in course",
      enrollLoading: "Enrolling...",
      tabStructure: "Structure",
      tabStudents: "Enrolled students",
      studentsTitle: "Students",
      noEnrollments: "No entries.",
      enrollmentMeta: "Role: {{role}} · Status: {{status}}",
      progressLine: "Progress: {{value}}%",
      updateCourse: "Update",
      modulesTitle: "Modules",
      modulePlaceholder: "Module title",
      moduleCreating: "Creating...",
      addModule: "Add",
      lessonsCount: "Lessons: {{count}}",
      lessonOrder: "Order: {{position}}",
      noLessons: "No lessons yet.",
      lessonTitlePlaceholder: "Lesson title",
      lessonVideoPlaceholder: "YouTube URL (optional)",
      lessonDescriptionPlaceholder: "Lesson description",
      lessonSaving: "Saving...",
      addLesson: "Add lesson",
      noModules: "No modules yet.",
      enrollError: "Failed to enroll",
      moduleCreateError: "Failed to create module",
      lessonCreateError: "Failed to create lesson",
      enrollmentsError: "Failed to load students"
    },
    lessons: {
      loadError: "Failed to load data",
      checkError: "Failed to check answers",
      saveQuizError: "Failed to save quiz",
      notFound: "Lesson not found",
      backToCourse: "Back to course: {{title}}",
      quizTitle: "Quiz",
      editQuiz: "Edit quiz",
      createQuiz: "Create quiz",
      questionTitle: "Question {{index}}",
      deleteQuestion: "Delete",
      questionPlaceholder: "Question text",
      correctAnswer: "Correct answer",
      optionPlaceholder: "Option text",
      addOption: "Add option",
      addQuestion: "Add question",
      saveQuiz: "Save quiz",
      savingQuiz: "Saving...",
      noQuiz: "This lesson has no quiz yet.",
      submitQuiz: "Check result",
      submittingQuiz: "Checking...",
      resultSummary: "Correct answers: {{correct}} / {{total}}",
      validation: {
        textRequired: "Each question must have text",
        optionMin: "Each question needs at least 2 options",
        correctRequired: "Each question must have a correct option"
      }
    },
    myCourses: {
      loadError: "Failed to load enrolled courses",
      loginPrompt: "Please sign in to see your courses.",
      title: "My courses",
      subtitle: "Courses you are enrolled in",
      empty: "You are not enrolled in any courses yet."
    },
    profile: {
      notAuthenticated: "You are not signed in.",
      title: "Profile",
      name: "Name",
      email: "Email",
      role: "Role"
    },
    admin: {
      subtitle: "Manage users and roles",
      loadError: "Failed to load users",
      updateError: "Failed to update user",
      roleLabel: "Role",
      statusLabel: "Status",
      statusActive: "Active",
      statusBlocked: "Blocked",
      block: "Block",
      activate: "Activate",
      empty: "No users yet."
    }
  }
};
