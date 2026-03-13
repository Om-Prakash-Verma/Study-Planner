const form = document.getElementById('planner-form');
const dailyPlanList = document.getElementById('daily-plan');
const remindersList = document.getElementById('reminders');
const revisionScheduleList = document.getElementById('revision-schedule');

const startOfToday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};

const toDateLabel = (date) =>
  date.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

const clearList = (list) => {
  list.innerHTML = '';
};

const appendItems = (list, items) => {
  clearList(list);

  if (!items.length) {
    const empty = document.createElement('li');
    empty.className = 'empty';
    empty.textContent = 'No items yet. Fill the form and generate a plan.';
    list.appendChild(empty);
    return;
  }

  items.forEach((item) => {
    const li = document.createElement('li');
    li.textContent = item;
    list.appendChild(li);
  });
};

const buildDailyStudyPlan = (subjects, daysUntilExam, hoursPerDay) => {
  const plan = [];
  const focusPerSubject = Math.max(0.5, hoursPerDay / subjects.length);

  for (let day = 1; day <= Math.min(daysUntilExam, 7); day += 1) {
    const subject = subjects[(day - 1) % subjects.length];
    plan.push(`Day ${day}: ${subject} (${focusPerSubject.toFixed(1)}h focus) + mixed practice (${(hoursPerDay - focusPerSubject).toFixed(1)}h)`);
  }

  if (daysUntilExam > 7) {
    plan.push(`Repeat this weekly rotation for the next ${Math.ceil((daysUntilExam - 7) / 7)} week(s).`);
  }

  return plan;
};

const buildReminders = (subjects, examDate) => {
  const reminders = [
    'Daily reminder: Start your study session at a consistent time.',
    'Take a 5-10 minute break every 50 minutes.',
    'End-of-day reminder: write 3 key takeaways.'
  ];

  subjects.forEach((subject) => {
    reminders.push(`Reminder: Review ${subject} flashcards before bed.`);
  });

  const oneWeekBefore = new Date(examDate);
  oneWeekBefore.setDate(oneWeekBefore.getDate() - 7);
  reminders.push(`Checkpoint: Full mock test on ${toDateLabel(oneWeekBefore)}.`);

  return reminders;
};

const buildRevisionSchedule = (subjects, examDate) => {
  const revisionMarkers = [14, 7, 3, 1];
  const schedule = [];

  revisionMarkers.forEach((daysBefore) => {
    const revisionDate = new Date(examDate);
    revisionDate.setDate(revisionDate.getDate() - daysBefore);

    if (revisionDate >= startOfToday()) {
      schedule.push(`${toDateLabel(revisionDate)} (${daysBefore} day(s) before): revise ${subjects.join(', ')}.`);
    }
  });

  schedule.push(`Final quick review on exam morning (${toDateLabel(examDate)}).`);
  return schedule;
};

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(form);
  const subjectsRaw = String(formData.get('subjects') || '');
  const examDateRaw = String(formData.get('examDate') || '');
  const hoursRaw = Number(formData.get('hours'));

  const subjects = subjectsRaw
    .split(',')
    .map((subject) => subject.trim())
    .filter(Boolean);

  const examDate = new Date(examDateRaw);
  const today = startOfToday();
  const examDay = new Date(examDate.getFullYear(), examDate.getMonth(), examDate.getDate());

  if (!subjects.length || Number.isNaN(hoursRaw) || hoursRaw <= 0 || examDay < today) {
    appendItems(dailyPlanList, ['Please enter valid subjects, future exam date, and available hours.']);
    appendItems(remindersList, []);
    appendItems(revisionScheduleList, []);
    return;
  }

  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const daysUntilExam = Math.max(1, Math.ceil((examDay - today) / millisecondsPerDay));

  const dailyPlan = buildDailyStudyPlan(subjects, daysUntilExam, hoursRaw);
  const reminders = buildReminders(subjects, examDay);
  const revisionSchedule = buildRevisionSchedule(subjects, examDay);

  appendItems(dailyPlanList, dailyPlan);
  appendItems(remindersList, reminders);
  appendItems(revisionScheduleList, revisionSchedule);
});

appendItems(dailyPlanList, []);
appendItems(remindersList, []);
appendItems(revisionScheduleList, []);
