<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactLog;
use App\Models\ContactSetting;
use App\Services\WebContentService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Admin › Contacto: datos de contacto, horario de atención y textos de la página Contáctanos.
 * Cada guardado registra en contact_logs solo lo que realmente cambió.
 */
class ContactController extends Controller
{
    public function index(Request $request): Response
    {
        $logs = ContactLog::query()
            ->when($request->filled('action'), fn ($q) => $q->where('action', $request->string('action')))
            ->latest('id')
            ->paginate(15)
            ->withQueryString();

        return Inertia::render('admin/contact/Index', [
            'contact' => ContactSetting::with('editor:id,name')->firstOrFail(),
            'logs' => $logs,
            'actions' => ContactLog::ACTIONS,
            'fields' => [...ContactSetting::DATA_FIELDS, ...ContactSetting::TEXT_FIELDS, 'schedule_summary' => 'Resumen del horario'],
            'days' => ContactSetting::DAYS,
            'filters' => ['action' => $request->input('action', '')],
            'tab' => $request->input('tab', 'data'),
            'formRecipientFallback' => config('contact.email'),
        ]);
    }

    public function updateData(Request $request): RedirectResponse
    {
        $request->merge(['whatsapp' => preg_replace('/\D/', '', (string) $request->input('whatsapp'))]);

        $validated = $request->validate([
            'whatsapp' => ['required', 'digits_between:8,15'],
            'phone' => ['nullable', 'string', 'max:40', 'regex:/^[0-9+\s\-()]+$/'],
            'email' => ['required', 'email', 'max:255'],
            'form_recipient' => ['nullable', 'email', 'max:255'],
            'address' => ['required', 'string', 'max:500'],
            'city' => ['nullable', 'string', 'max:120'],
            'maps_url' => ['nullable', 'url', 'max:500'],
            'website' => ['nullable', 'string', 'max:255'],
            'facebook' => ['nullable', 'url', 'max:255'],
            'instagram' => ['nullable', 'url', 'max:255'],
            'twitter' => ['nullable', 'url', 'max:255'],
            'tiktok' => ['nullable', 'url', 'max:255'],
        ], [
            'whatsapp.digits_between' => 'El WhatsApp debe tener entre 8 y 15 dígitos, con el código de país (ej. 591 68210861).',
            'phone.regex' => 'El teléfono solo puede tener números, espacios, +, - y paréntesis.',
            'url' => 'Ingresa un enlace completo que empiece con https://',
        ], ContactSetting::DATA_FIELDS);

        // Una línea de la dirección por renglón, sin renglones vacíos
        $validated['address'] = collect(preg_split('/\R/', $validated['address']))->map(fn ($l) => trim($l))->filter()->implode("\n");

        return $this->saveFields($validated, ContactSetting::DATA_FIELDS, 'data_updated', 'Datos de contacto actualizados.');
    }

    public function updateTexts(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'hero_title' => ['required', 'string', 'max:80'],
            'hero_subtitle' => ['nullable', 'string', 'max:300'],
            'form_title' => ['required', 'string', 'max:80'],
            'form_subtitle' => ['nullable', 'string', 'max:160'],
            'form_success' => ['required', 'string', 'max:160'],
            'hours_title' => ['required', 'string', 'max:60'],
            'hours_note' => ['nullable', 'string', 'max:200'],
        ], [], ContactSetting::TEXT_FIELDS);

        return $this->saveFields($validated, ContactSetting::TEXT_FIELDS, 'text_updated', 'Textos de Contáctanos actualizados.');
    }

    public function updateSchedule(Request $request): RedirectResponse
    {
        $time = ['nullable', 'date_format:H:i'];
        $validated = $request->validate([
            'schedule' => ['required', 'array', 'size:7'],
            'schedule.*.day' => ['required', 'integer', 'between:1,7', 'distinct'],
            'schedule.*.mode' => ['required', 'in:'.implode(',', ContactSetting::MODES)],
            'schedule.*.open' => $time,
            'schedule.*.close' => $time,
            'schedule.*.open2' => $time,
            'schedule.*.close2' => $time,
            'schedule_summary' => ['nullable', 'string', 'max:120'],
        ], [
            'schedule.*.*.date_format' => 'Usa el formato de hora HH:MM (ej. 09:00).',
        ]);

        $days = collect($validated['schedule'])->sortBy('day')->values();
        $this->checkHours($days->all());
        $schedule = $days->map(fn ($day) => ContactSetting::normalizeDay($day))->all();

        $contact = ContactSetting::firstOrFail();
        $before = collect($contact->schedule)->keyBy('day');
        $changes = 0;

        DB::transaction(function () use ($contact, $schedule, $before, $validated, &$changes) {
            foreach ($schedule as $day) {
                $old = $before->get($day['day']);
                $oldText = $old ? ContactSetting::describeDay($old) : '';
                $newText = ContactSetting::describeDay($day);
                if ($oldText !== $newText) {
                    ContactLog::record('schedule_updated', 'day_'.$day['day'], $oldText, $newText);
                    $changes++;
                }
            }

            $summary = $validated['schedule_summary'] ?? null;
            if ((string) $contact->schedule_summary !== (string) $summary) {
                ContactLog::record('schedule_updated', 'schedule_summary', $contact->schedule_summary, $summary);
                $changes++;
            }

            if ($changes) {
                $contact->update(['schedule' => $schedule, 'schedule_summary' => $summary, 'updated_by' => auth()->id()]);
            }
        });

        if (! $changes) {
            return back()->with('success', 'No hubo cambios que guardar.');
        }

        WebContentService::flushCache();

        return back()->with('success', 'Horario de atención actualizado.');
    }

    /** Guarda los campos indicados y registra en el historial solo los que cambiaron. */
    private function saveFields(array $validated, array $fields, string $action, string $message): RedirectResponse
    {
        $contact = ContactSetting::firstOrFail();
        $changes = 0;

        DB::transaction(function () use ($contact, $validated, $fields, $action, &$changes) {
            foreach (array_keys($fields) as $field) {
                $new = $validated[$field] ?? null;
                if ((string) $contact->$field !== (string) $new) {
                    ContactLog::record($action, $field, $contact->$field, $new);
                    $changes++;
                }
            }

            if ($changes) {
                $contact->update([...$validated, 'updated_by' => auth()->id()]);
            }
        });

        if (! $changes) {
            return back()->with('success', 'No hubo cambios que guardar.');
        }

        WebContentService::flushCache();

        return back()->with('success', $message);
    }

    /** Cada tramo debe cerrar después de abrir y la segunda franja empezar después de la pausa. */
    private function checkHours(array $days): void
    {
        $errors = [];

        foreach ($days as $index => $day) {
            if ($day['mode'] === 'closed') {
                continue;
            }
            $name = ContactSetting::DAYS[$day['day']];
            $key = "schedule.{$index}";

            if (blank($day['open'] ?? null) || blank($day['close'] ?? null)) {
                $errors["{$key}.open"] = "{$name}: indica la hora de apertura y de cierre.";
                continue;
            }
            if ($day['close'] <= $day['open']) {
                $errors["{$key}.close"] = "{$name}: la hora de cierre debe ser posterior a la de apertura.";
                continue;
            }
            if ($day['mode'] !== 'split') {
                continue;
            }
            if (blank($day['open2'] ?? null) || blank($day['close2'] ?? null)) {
                $errors["{$key}.open2"] = "{$name}: indica el horario de la tarde (después de la pausa).";
            } elseif ($day['open2'] <= $day['close']) {
                $errors["{$key}.open2"] = "{$name}: el horario de la tarde debe empezar después de la pausa ({$day['close']}).";
            } elseif ($day['close2'] <= $day['open2']) {
                $errors["{$key}.close2"] = "{$name}: la hora de cierre de la tarde debe ser posterior a su apertura.";
            }
        }

        if ($errors) {
            throw ValidationException::withMessages($errors);
        }
    }
}
