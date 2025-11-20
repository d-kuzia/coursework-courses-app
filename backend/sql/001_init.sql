create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  name text not null,
  role text not null default 'USER',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_users_updated_at on users;
create trigger trg_users_updated_at
before update on users
for each row execute function set_updated_at();

-- courses
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  title varchar(255) not null,
  description text,
  teacher_id uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_courses_updated_at on courses;
create trigger trg_courses_updated_at
before update on courses
for each row execute function set_updated_at();

-- modules
create table if not exists modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  title varchar(255) not null,
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_modules_updated_at on modules;
create trigger trg_modules_updated_at
before update on modules
for each row execute function set_updated_at();

-- lessons
create table if not exists lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references modules(id) on delete cascade,
  title varchar(255) not null,
  content text,
  video_url text,
  position int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_lessons_updated_at on lessons;
create trigger trg_lessons_updated_at
before update on lessons
for each row execute function set_updated_at();

-- quizzes
create table if not exists lesson_quizzes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null unique references lessons(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_lesson_quizzes_updated_at on lesson_quizzes;
create trigger trg_lesson_quizzes_updated_at
before update on lesson_quizzes
for each row execute function set_updated_at();

create table if not exists quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references lesson_quizzes(id) on delete cascade,
  text text not null,
  position int not null default 0
);

create table if not exists quiz_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references quiz_questions(id) on delete cascade,
  text text not null,
  is_correct boolean not null default false
);

-- enrollments
create table if not exists enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  course_id uuid not null references courses(id) on delete cascade,
  status text not null default 'ENROLLED',
  progress int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, course_id)
);

drop trigger if exists trg_enrollments_updated_at on enrollments;
create trigger trg_enrollments_updated_at
before update on enrollments
for each row execute function set_updated_at();

create table if not exists lesson_progress (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references enrollments(id) on delete cascade,
  lesson_id uuid not null references lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique (enrollment_id, lesson_id)
);
