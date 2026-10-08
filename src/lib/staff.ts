import { stores } from "@/lib/data";

export type PunchType = "in" | "out" | "break_start" | "break_end";

export type StaffMember = {
  id: string;
  email: string;
  password?: string;
  name: string;
  initials: string;
  branchId: string;
  workspace: string;
  city?: string;
  position: string;
  employeeCode: string;
  phone: string;
  address: string;
  joined: string;
  baseSalary: number;
  bankAccount: string;
  emergencyName: string;
  emergencyPhone: string;
  managerName: string;
  shiftStart: string;
  shiftEnd: string;
  /** 0 = Sunday … 5 = Friday */
  offDay: number;
};

export type Punch = {
  id: string;
  staffId: string;
  type: PunchType;
  at: string;
};

export type LeaveKind = "casual" | "sick" | "unpaid";
export type LeaveStatus = "pending" | "approved" | "declined";

export type LeaveRequest = {
  id: string;
  staffId: string;
  kind: LeaveKind;
  from: string;
  to: string;
  reason: string;
  status: LeaveStatus;
};

export type AttendanceState = "scheduled" | "in" | "break" | "done" | "off";

export type Payslip = {
  basic: number;
  allowance: number;
  overtimePay: number;
  tax: number;
  net: number;
  hours: number;
  scheduledHours: number;
  overtimeHours: number;
  absentDays: number;
  payday: string;
};

export const STAFF_POSITIONS = [
  "Cashier",
  "Floor Associate",
  "Visual Merchandiser",
  "Stock Associate",
  "Customer Care",
] as const;

const POSITION_SALARY: Record<(typeof STAFF_POSITIONS)[number], number> = {
  Cashier: 26000,
  "Floor Associate": 22000,
  "Visual Merchandiser": 30000,
  "Stock Associate": 24000,
  "Customer Care": 25000,
};

export const dailyTasks = [
  { id: "open-zone", label: "Open your zone and greet the first customers" },
  { id: "face-stock", label: "Face shelves and refill anything below the line" },
  { id: "prices", label: "Match price tags to today’s promo board" },
  { id: "break", label: "Take your scheduled break away from the floor" },
  { id: "handover", label: "Note handover issues before you clock out" },
];

export const branchAnnouncements: Record<string, string[]> = {
  "MIN-BD-DHK-014": [
    "Promo wall resets before 11:00. Ask Nusrat if a bay is unclear.",
    "Water bottles land this afternoon. Don’t promise them until the transfer is received.",
  ],
  "MIN-BD-DHK-008": [
    "Gulshan weekend roster is full. Swap requests go through Rahim before Thursday.",
    "VIP hour starts at 18:00 — cashiers stay on the front two tills.",
  ],
  "MIN-BD-DHK-021": [
    "Uttara stock count is Friday after close. Don’t start early.",
  ],
  "MIN-BD-CTG-003": [
    "Agrabad is on a short maintenance window. Keep the side aisle clear.",
  ],
};

const EXTRA_KEY = "miniso-staff-extra-v1";
const OVERRIDE_KEY = "miniso-staff-overrides-v1";
const PUNCH_KEY = "miniso-staff-punches-v1";
const LEAVE_KEY = "miniso-staff-leave-v1";
const TASK_KEY = "miniso-staff-tasks-v1";

export function initialsFor(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function salaryForPosition(position: string) {
  if (position in POSITION_SALARY) {
    return POSITION_SALARY[position as keyof typeof POSITION_SALARY];
  }
  return 22000;
}

export function branchById(branchId: string) {
  return stores.find((store) => store.id === branchId) ?? null;
}

function member(
  partial: Omit<StaffMember, "initials" | "workspace" | "managerName"> & {
    workspace?: string;
    managerName?: string;
  }
): StaffMember {
  const branch = branchById(partial.branchId);
  return {
    ...partial,
    initials: initialsFor(partial.name),
    workspace: partial.workspace ?? branch?.name ?? "Branch",
    managerName: partial.managerName ?? branch?.manager ?? "Branch manager",
  };
}

export const seedStaff: StaffMember[] = [
  member({
    id: "st-rafi",
    email: "staff@miniso.bd",
    password: "staff123",
    name: "Rafi Islam",
    branchId: "MIN-BD-DHK-014",
    position: "Cashier",
    employeeCode: "EMP-DHK-014",
    phone: "01711-220184",
    address: "House 12, Road 8, Dhanmondi, Dhaka",
    joined: "2024-03-18",
    baseSalary: 28000,
    bankAccount: "DBBL ···· 4412",
    emergencyName: "Laila Islam",
    emergencyPhone: "01819-440221",
    shiftStart: "09:00",
    shiftEnd: "17:00",
    offDay: 5,
  }),
  member({
    id: "st-sadia",
    email: "sadia.noor@miniso.bd",
    password: "staff123",
    name: "Sadia Noor",
    branchId: "MIN-BD-DHK-014",
    position: "Floor Associate",
    employeeCode: "EMP-DHK-018",
    phone: "01612-883041",
    address: "Mohammadpur, Dhaka",
    joined: "2023-11-02",
    baseSalary: 24000,
    bankAccount: "BRAC ···· 9021",
    emergencyName: "Karim Noor",
    emergencyPhone: "01911-220198",
    shiftStart: "10:00",
    shiftEnd: "19:00",
    offDay: 5,
  }),
  member({
    id: "st-imtiaz",
    email: "imtiaz.kabir@miniso.bd",
    password: "staff123",
    name: "Imtiaz Kabir",
    branchId: "MIN-BD-DHK-014",
    position: "Cashier",
    employeeCode: "EMP-DHK-021",
    phone: "01552-110984",
    address: "Kalabagan, Dhaka",
    joined: "2025-01-09",
    baseSalary: 26000,
    bankAccount: "City ···· 1180",
    emergencyName: "Roksana Kabir",
    emergencyPhone: "01713-998120",
    shiftStart: "12:00",
    shiftEnd: "21:00",
    offDay: 1,
  }),
  member({
    id: "st-lamia",
    email: "lamia.hasan@miniso.bd",
    password: "staff123",
    name: "Lamia Hasan",
    branchId: "MIN-BD-DHK-014",
    position: "Visual Merchandiser",
    employeeCode: "EMP-DHK-009",
    phone: "01312-445670",
    address: "Lalmatia, Dhaka",
    joined: "2022-08-14",
    baseSalary: 32000,
    bankAccount: "EBL ···· 7733",
    emergencyName: "Hasan Mahmud",
    emergencyPhone: "01618-221009",
    shiftStart: "09:00",
    shiftEnd: "18:00",
    offDay: 5,
  }),
  member({
    id: "st-anika",
    email: "anika.chowdhury@miniso.bd",
    password: "staff123",
    name: "Anika Chowdhury",
    branchId: "MIN-BD-DHK-008",
    position: "Floor Associate",
    employeeCode: "EMP-GUL-004",
    phone: "01718-330221",
    address: "Banani, Dhaka",
    joined: "2024-06-01",
    baseSalary: 25000,
    bankAccount: "DBBL ···· 2201",
    emergencyName: "Farzana Chowdhury",
    emergencyPhone: "01819-100334",
    shiftStart: "09:00",
    shiftEnd: "18:00",
    offDay: 5,
  }),
  member({
    id: "st-mahmud",
    email: "mahmud.hasan@miniso.bd",
    password: "staff123",
    name: "Mahmud Hasan",
    branchId: "MIN-BD-DHK-008",
    position: "Cashier",
    employeeCode: "EMP-GUL-011",
    phone: "01914-882210",
    address: "Gulshan 1, Dhaka",
    joined: "2023-02-20",
    baseSalary: 29000,
    bankAccount: "BRAC ···· 4419",
    emergencyName: "Nargis Hasan",
    emergencyPhone: "01512-009981",
    shiftStart: "11:00",
    shiftEnd: "20:00",
    offDay: 5,
  }),
  member({
    id: "st-priya",
    email: "priya.das@miniso.bd",
    password: "staff123",
    name: "Priya Das",
    branchId: "MIN-BD-DHK-008",
    position: "Stock Associate",
    employeeCode: "EMP-GUL-016",
    phone: "01620-774512",
    address: "Badda, Dhaka",
    joined: "2025-04-11",
    baseSalary: 23000,
    bankAccount: "City ···· 3094",
    emergencyName: "Ratan Das",
    emergencyPhone: "01711-665430",
    shiftStart: "08:00",
    shiftEnd: "17:00",
    offDay: 5,
  }),
  member({
    id: "st-nabil",
    email: "nabil.rahman@miniso.bd",
    password: "staff123",
    name: "Nabil Rahman",
    branchId: "MIN-BD-DHK-021",
    position: "Cashier",
    employeeCode: "EMP-UTT-003",
    phone: "01820-119043",
    address: "Uttara Sector 7, Dhaka",
    joined: "2024-09-16",
    baseSalary: 25500,
    bankAccount: "DBBL ···· 8812",
    emergencyName: "Rahman Ali",
    emergencyPhone: "01913-220187",
    shiftStart: "09:00",
    shiftEnd: "18:00",
    offDay: 5,
  }),
  member({
    id: "st-mitu",
    email: "mitu.akter@miniso.bd",
    password: "staff123",
    name: "Mitu Akter",
    branchId: "MIN-BD-DHK-021",
    position: "Floor Associate",
    employeeCode: "EMP-UTT-008",
    phone: "01516-443290",
    address: "Uttara Sector 4, Dhaka",
    joined: "2023-12-05",
    baseSalary: 22000,
    bankAccount: "BRAC ···· 1028",
    emergencyName: "Akter Hossain",
    emergencyPhone: "01712-883001",
    shiftStart: "10:00",
    shiftEnd: "19:00",
    offDay: 5,
  }),
  member({
    id: "st-shakil",
    email: "shakil.ahmed@miniso.bd",
    password: "staff123",
    name: "Shakil Ahmed",
    branchId: "MIN-BD-CTG-003",
    position: "Floor Associate",
    employeeCode: "EMP-CTG-002",
    phone: "01818-229410",
    address: "Agrabad, Chittagong",
    joined: "2022-05-22",
    baseSalary: 24000,
    bankAccount: "City ···· 5510",
    emergencyName: "Ahmed Karim",
    emergencyPhone: "01611-220945",
    shiftStart: "09:00",
    shiftEnd: "18:00",
    offDay: 5,
  }),
  member({
    id: "st-rina",
    email: "rina.begum@miniso.bd",
    password: "staff123",
    name: "Rina Begum",
    branchId: "MIN-BD-CTG-003",
    position: "Cashier",
    employeeCode: "EMP-CTG-006",
    phone: "01716-990214",
    address: "Halishahar, Chittagong",
    joined: "2024-01-28",
    baseSalary: 25000,
    bankAccount: "DBBL ···· 6641",
    emergencyName: "Begum Ara",
    emergencyPhone: "01911-334870",
    shiftStart: "12:00",
    shiftEnd: "21:00",
    offDay: 5,
  }),
];

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export function loadDirectory(): StaffMember[] {
  const overrides = readJson<Record<string, Partial<StaffMember>>>(
    OVERRIDE_KEY,
    {}
  );
  const extra = readJson<StaffMember[]>(EXTRA_KEY, []);
  const apply = (person: StaffMember) => ({
    ...person,
    ...overrides[person.id],
    id: person.id,
    email: (overrides[person.id]?.email ?? person.email).toLowerCase(),
  });
  const seeded = seedStaff.map(apply);
  const ids = new Set(seeded.map((person) => person.id));
  return [...seeded, ...extra.map(apply).filter((person) => !ids.has(person.id))];
}

export function saveProfile(id: string, patch: Partial<StaffMember>) {
  const overrides = readJson<Record<string, Partial<StaffMember>>>(
    OVERRIDE_KEY,
    {}
  );
  const { id: _id, password: _password, email: _email, ...safe } = patch;
  overrides[id] = { ...overrides[id], ...safe };
  writeJson(OVERRIDE_KEY, overrides);

  const extra = readJson<StaffMember[]>(EXTRA_KEY, []);
  const index = extra.findIndex((person) => person.id === id);
  if (index >= 0) {
    extra[index] = { ...extra[index], ...safe };
    writeJson(EXTRA_KEY, extra);
  }
}

export function registerStaff(input: {
  name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  position: string;
  branchId: string;
  emergencyName: string;
  emergencyPhone: string;
}): { ok: true; member: StaffMember } | { ok: false; error: string } {
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  if (!name || !email || !input.password || !input.branchId || !input.position) {
    return { ok: false, error: "Fill in name, email, password, branch, and position." };
  }
  if (input.password.length < 6) {
    return { ok: false, error: "Password must be at least 6 characters." };
  }
  const existing = loadDirectory();
  if (existing.some((person) => person.email === email)) {
    return { ok: false, error: "That email is already registered." };
  }
  const branch = branchById(input.branchId);
  if (!branch) return { ok: false, error: "Choose a branch." };
  const count = existing.filter((person) => person.branchId === input.branchId).length;
  const person = member({
    id: `st-${Date.now().toString(36)}`,
    email,
    password: input.password,
    name,
    branchId: input.branchId,
    position: input.position,
    employeeCode: `EMP-${branch.city.slice(0, 3).toUpperCase()}-${String(count + 1).padStart(3, "0")}`,
    phone: input.phone.trim(),
    address: input.address.trim(),
    joined: todayKey(),
    baseSalary: salaryForPosition(input.position),
    bankAccount: "Add in your profile",
    emergencyName: input.emergencyName.trim(),
    emergencyPhone: input.emergencyPhone.trim(),
    shiftStart: "09:00",
    shiftEnd: "18:00",
    offDay: 5,
  });
  const extra = readJson<StaffMember[]>(EXTRA_KEY, []);
  extra.push(person);
  writeJson(EXTRA_KEY, extra);
  return { ok: true, member: person };
}

export function loadPunches(): Punch[] {
  const stored = readJson<Punch[] | null>(PUNCH_KEY, null);
  if (stored) return stored;
  const seeded = buildSeedPunches(new Date());
  if (typeof window !== "undefined") writeJson(PUNCH_KEY, seeded);
  return seeded;
}

export function loadLeaves(): LeaveRequest[] {
  const stored = readJson<LeaveRequest[] | null>(LEAVE_KEY, null);
  if (stored) return stored;
  const today = todayKey();
  const tomorrow = addDays(new Date(), 1);
  const seeded: LeaveRequest[] = [
    {
      id: "lv-lamia",
      staffId: "st-lamia",
      kind: "casual",
      from: today,
      to: today,
      reason: "Family appointment in the morning",
      status: "pending",
    },
    {
      id: "lv-anika",
      staffId: "st-anika",
      kind: "sick",
      from: tomorrow,
      to: tomorrow,
      reason: "Fever — resting tomorrow",
      status: "pending",
    },
  ];
  if (typeof window !== "undefined") writeJson(LEAVE_KEY, seeded);
  return seeded;
}

export function loadTasks(): Record<string, string[]> {
  return readJson<Record<string, string[]>>(TASK_KEY, {});
}

export function savePunches(punches: Punch[]) {
  writeJson(PUNCH_KEY, punches);
}

export function saveLeaves(leaves: LeaveRequest[]) {
  writeJson(LEAVE_KEY, leaves);
}

export function saveTasks(tasks: Record<string, string[]>) {
  writeJson(TASK_KEY, tasks);
}

export function todayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return todayKey(next);
}

export function sameDay(iso: string, date: Date) {
  const value = new Date(iso);
  return (
    value.getFullYear() === date.getFullYear() &&
    value.getMonth() === date.getMonth() &&
    value.getDate() === date.getDate()
  );
}

function buildSeedPunches(now: Date): Punch[] {
  const punches: Punch[] = [];
  const year = now.getFullYear();
  const month = now.getMonth();
  const today = now.getDate();

  for (const person of seedStaff) {
    for (let day = 1; day <= today; day += 1) {
      const date = new Date(year, month, day);
      if (date.getDay() === person.offDay) continue;
      if (person.id === "st-lamia" && day === today) continue;
      const [startH, startM] = person.shiftStart.split(":").map(Number);
      const [endH, endM] = person.shiftEnd.split(":").map(Number);
      const start = new Date(year, month, day, startH, startM + (day % 5));
      const end = new Date(year, month, day, endH, endM);
      if (start > now) continue;
      punches.push({
        id: `${person.id}-${day}-in`,
        staffId: person.id,
        type: "in",
        at: start.toISOString(),
      });
      if (day < today || now >= end) {
        punches.push({
          id: `${person.id}-${day}-out`,
          staffId: person.id,
          type: "out",
          at: end.toISOString(),
        });
      } else if (person.id === "st-imtiaz") {
        const breakAt = new Date(now.getTime() - 12 * 60 * 1000);
        if (breakAt > start) {
          punches.push({
            id: `${person.id}-${day}-break`,
            staffId: person.id,
            type: "break_start",
            at: breakAt.toISOString(),
          });
        }
      }
    }
  }
  return punches;
}

export function punchesFor(punches: Punch[], staffId: string) {
  return punches
    .filter((punch) => punch.staffId === staffId)
    .sort((a, b) => a.at.localeCompare(b.at));
}

export function attendanceOf(
  punches: Punch[],
  person: StaffMember,
  now = new Date()
): AttendanceState {
  if (now.getDay() === person.offDay) {
    const today = punchesFor(punches, person.id).filter((punch) =>
      sameDay(punch.at, now)
    );
    if (today.length === 0) return "off";
  }
  const today = punchesFor(punches, person.id).filter((punch) =>
    sameDay(punch.at, now)
  );
  if (today.length === 0) return "scheduled";
  const last = today[today.length - 1];
  if (last.type === "in" || last.type === "break_end") return "in";
  if (last.type === "break_start") return "break";
  return "done";
}

export function workedMinutes(
  punches: Punch[],
  staffId: string,
  from: Date,
  to: Date
) {
  const list = punchesFor(punches, staffId).filter((punch) => {
    const at = new Date(punch.at).getTime();
    return at >= from.getTime() && at <= to.getTime();
  });
  let minutes = 0;
  let open: number | null = null;
  for (const punch of list) {
    const at = new Date(punch.at).getTime();
    if (punch.type === "in" || punch.type === "break_end") {
      open = at;
    } else if ((punch.type === "out" || punch.type === "break_start") && open != null) {
      minutes += (at - open) / 60000;
      open = null;
    }
  }
  if (open != null) {
    minutes += (Math.min(to.getTime(), Date.now()) - open) / 60000;
  }
  return Math.max(0, minutes);
}

export function formatDuration(minutes: number) {
  const rounded = Math.max(0, Math.round(minutes));
  const hours = Math.floor(rounded / 60);
  const remain = rounded % 60;
  if (hours <= 0) return `${remain}m`;
  return `${hours}h ${remain}m`;
}

export function shiftMinutes(person: StaffMember) {
  const [sh, sm] = person.shiftStart.split(":").map(Number);
  const [eh, em] = person.shiftEnd.split(":").map(Number);
  return Math.max(0, eh * 60 + em - (sh * 60 + sm));
}

function monthStart(now: Date) {
  return new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
}

export function scheduledMinutesToDate(person: StaffMember, now = new Date()) {
  let minutes = 0;
  const cursor = monthStart(now);
  while (cursor <= now) {
    if (cursor.getDay() !== person.offDay) minutes += shiftMinutes(person);
    cursor.setDate(cursor.getDate() + 1);
  }
  return minutes;
}

export function absentDays(person: StaffMember, punches: Punch[], now = new Date()) {
  let absent = 0;
  const cursor = monthStart(now);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  while (cursor < today) {
    if (cursor.getDay() !== person.offDay) {
      const worked = punchesFor(punches, person.id).some((punch) =>
        sameDay(punch.at, cursor)
      );
      if (!worked) absent += 1;
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return absent;
}

export function payslipFor(
  person: StaffMember,
  punches: Punch[],
  now = new Date()
): Payslip {
  const minutes = workedMinutes(punches, person.id, monthStart(now), now);
  const hours = minutes / 60;
  const scheduled = scheduledMinutesToDate(person, now) / 60;
  const overtimeHours = Math.max(0, hours - scheduled);
  const hourly = person.baseSalary / (26 * 8);
  const missed = absentDays(person, punches, now);
  const allowance = missed === 0 ? 1500 : 0;
  const overtimePay = Math.round(overtimeHours * hourly * 1.5);
  const gross = person.baseSalary + allowance + overtimePay;
  const tax = Math.round(gross * 0.05);
  const paydayDate = new Date(now.getFullYear(), now.getMonth(), 28);
  if (now.getDate() > 28) paydayDate.setMonth(paydayDate.getMonth() + 1);
  return {
    basic: person.baseSalary,
    allowance,
    overtimePay,
    tax,
    net: gross - tax,
    hours,
    scheduledHours: scheduled,
    overtimeHours,
    absentDays: missed,
    payday: paydayDate.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
    }),
  };
}

export function leaveDays(request: LeaveRequest) {
  const from = new Date(request.from);
  const to = new Date(request.to);
  const diff = Math.round((to.getTime() - from.getTime()) / 86400000);
  return Math.max(1, diff + 1);
}

export function leaveBalance(leaves: LeaveRequest[], staffId: string, kind: LeaveKind) {
  const allowance = kind === "casual" ? 10 : kind === "sick" ? 8 : 0;
  const used = leaves
    .filter(
      (leave) =>
        leave.staffId === staffId &&
        leave.kind === kind &&
        leave.status === "approved"
    )
    .reduce((sum, leave) => sum + leaveDays(leave), 0);
  return { allowance, used, left: Math.max(0, allowance - used) };
}

export function weekSchedule(person: StaffMember, now = new Date()) {
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(now);
    date.setDate(now.getDate() + index);
    const off = date.getDay() === person.offDay;
    return {
      key: todayKey(date),
      label: date.toLocaleDateString("en-GB", { weekday: "short", day: "numeric" }),
      off,
      shift: off ? "Off" : `${person.shiftStart}–${person.shiftEnd}`,
      today: index === 0,
    };
  });
}

export function taskKey(staffId: string, date = new Date()) {
  return `${staffId}:${todayKey(date)}`;
}

export function statusLabel(state: AttendanceState) {
  switch (state) {
    case "in":
      return "On shift";
    case "break":
      return "On break";
    case "done":
      return "Clocked out";
    case "off":
      return "Day off";
    default:
      return "Not in yet";
  }
}

export function statusTone(
  state: AttendanceState
): "success" | "warning" | "neutral" | "info" | "accent" {
  switch (state) {
    case "in":
      return "success";
    case "break":
      return "warning";
    case "done":
      return "info";
    case "off":
      return "neutral";
    default:
      return "accent";
  }
}
