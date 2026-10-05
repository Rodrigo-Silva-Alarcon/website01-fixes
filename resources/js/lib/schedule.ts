/**
 * Horario de atención (Admin › Contacto). Un elemento por día, 1 = lunes … 7 = domingo:
 * - continuous: abre y cierra una vez
 * - split: con pausa (open → close y open2 → close2)
 * - closed: no se atiende
 */

export type ScheduleMode = 'continuous' | 'split' | 'closed';

export interface ScheduleDay {
    day: number;
    mode: ScheduleMode;
    open: string | null;
    close: string | null;
    open2: string | null;
    close2: string | null;
}

export const DAY_NAMES: Record<number, string> = {
    1: 'Lunes',
    2: 'Martes',
    3: 'Miércoles',
    4: 'Jueves',
    5: 'Viernes',
    6: 'Sábado',
    7: 'Domingo',
};

export const DEFAULT_SCHEDULE: ScheduleDay[] = [1, 2, 3, 4, 5, 6, 7].map((day) =>
    day <= 5
        ? { day, mode: 'continuous', open: '09:00', close: '18:00', open2: null, close2: null }
        : day === 6
          ? { day, mode: 'continuous', open: '10:00', close: '16:00', open2: null, close2: null }
          : { day, mode: 'closed', open: null, close: null, open2: null, close2: null },
);

/** Tramos abiertos del día, en minutos desde medianoche. */
function spans(d: ScheduleDay): [number, number][] {
    const min = (t: string | null) => {
        const [h, m] = (t ?? '').split(':').map(Number);
        return Number.isFinite(h) ? h * 60 + (m || 0) : NaN;
    };
    const list: [number, number][] = [];
    if (d.mode !== 'closed') list.push([min(d.open), min(d.close)]);
    if (d.mode === 'split') list.push([min(d.open2), min(d.close2)]);
    return list.filter(([a, b]) => Number.isFinite(a) && Number.isFinite(b));
}

/** Horario del día en texto: ["09:00 – 18:00"], ["09:00 – 12:30", "14:30 – 19:00"] o [] si cierra. */
export function dayHours(d: ScheduleDay): string[] {
    if (d.mode === 'closed') return [];
    const first = `${d.open} – ${d.close}`;
    return d.mode === 'split' ? [first, `${d.open2} – ${d.close2}`] : [first];
}

const sameHours = (a: ScheduleDay, b: ScheduleDay) => dayHours(a).join('|') === dayHours(b).join('|');

export interface ScheduleGroup {
    days: number[];
    label: string;
    hours: string[];
    closed: boolean;
}

/** Agrupa días seguidos con el mismo horario: "Lunes – Viernes", "Sábado", "Domingo". */
export function groupSchedule(schedule: ScheduleDay[]): ScheduleGroup[] {
    const sorted = [...schedule].sort((a, b) => a.day - b.day);
    const groups: ScheduleGroup[] = [];
    let current: ScheduleDay[] = [];

    const flush = () => {
        if (!current.length) return;
        const first = current[0];
        const last = current[current.length - 1];
        groups.push({
            days: current.map((d) => d.day),
            label:
                current.length === 1
                    ? DAY_NAMES[first.day]
                    : current.length === 2
                      ? `${DAY_NAMES[first.day]} y ${DAY_NAMES[last.day]}`
                      : `${DAY_NAMES[first.day]} – ${DAY_NAMES[last.day]}`,
            hours: dayHours(first),
            closed: first.mode === 'closed',
        });
        current = [];
    };

    for (const d of sorted) {
        const prev = current[current.length - 1];
        if (prev && (d.day !== prev.day + 1 || !sameHours(prev, d))) flush();
        current.push(d);
    }
    flush();
    return groups;
}

/** "Atención de lunes a sábado" a partir de los días abiertos. */
export function autoSummary(schedule: ScheduleDay[]): string {
    const open = [...schedule].filter((d) => d.mode !== 'closed').sort((a, b) => a.day - b.day);
    if (!open.length) return 'Consulta nuestro horario de atención';
    if (open.length === 7) return 'Atención todos los días';
    const name = (n: number) => DAY_NAMES[n].toLowerCase();
    const consecutive = open.every((d, i) => i === 0 || d.day === open[i - 1].day + 1);
    if (open.length === 1) return `Atención los ${name(open[0].day).replace(/([^s])$/, '$1s')}`;
    if (consecutive) return `Atención de ${name(open[0].day)} a ${name(open[open.length - 1].day)}`;
    return `Atención ${open.map((d) => name(d.day)).join(', ').replace(/, ([^,]*)$/, ' y $1')}`;
}

/** Día (1–7) y minutos actuales en La Paz, sin depender de la zona horaria del visitante. */
function nowInLaPaz(date = new Date()): { day: number; minutes: number } {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/La_Paz',
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric',
        hourCycle: 'h23',
    }).formatToParts(date);
    const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
    const day = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(get('weekday')) + 1;
    return { day, minutes: Number(get('hour')) * 60 + Number(get('minute')) };
}

/** Día de hoy (1–7) y si la tienda está abierta en este momento. */
export function scheduleNow(schedule: ScheduleDay[], date = new Date()): { today: number; open: boolean } {
    const { day, minutes } = nowInLaPaz(date);
    const today = schedule.find((d) => d.day === day);
    const open = !!today && spans(today).some(([from, to]) => minutes >= from && minutes < to);
    return { today: day, open };
}
