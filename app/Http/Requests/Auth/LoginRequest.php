<?php

namespace App\Http\Requests\Auth;

use App\Models\User;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Intentos fallidos permitidos antes de bloquear temporalmente.
     */
    private const MAX_ATTEMPTS = 5;

    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Normalizar el correo antes de validar (espacios y mayúsculas).
     */
    protected function prepareForValidation(): void
    {
        if (is_string($this->email)) {
            $this->merge(['email' => mb_strtolower(trim($this->email))]);
        }
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => ['required', 'string', 'email', 'max:255'],
            'password' => ['required', 'string', 'max:255'],
        ];
    }

    /**
     * Mensajes de validación del formulario de inicio de sesión.
     */
    public function messages(): array
    {
        return [
            'email.required' => 'Ingresa tu correo electrónico.',
            'email.string' => 'El correo electrónico no es válido.',
            'email.email' => 'El correo electrónico no tiene un formato válido (ejemplo: nombre@dominio.com).',
            'email.max' => 'El correo electrónico no puede superar los 255 caracteres.',
            'password.required' => 'Ingresa tu contraseña.',
            'password.string' => 'La contraseña no es válida.',
            'password.max' => 'La contraseña no puede superar los 255 caracteres.',
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        $user = User::where('email', $this->string('email')->value())->first();

        if (! $user) {
            $this->failedAttempt('email', 'No existe ninguna cuenta registrada con este correo electrónico.');
        }

        if (! Hash::check($this->string('password')->value(), $user->password)) {
            $this->failedAttempt('password', 'La contraseña es incorrecta.');
        }

        Auth::login($user, $this->boolean('remember'));

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Registrar un intento fallido y lanzar el error indicando los intentos restantes.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    private function failedAttempt(string $field, string $message): never
    {
        RateLimiter::hit($this->throttleKey());

        $remaining = RateLimiter::remaining($this->throttleKey(), self::MAX_ATTEMPTS);

        if ($remaining === 0) {
            $this->ensureIsNotRateLimited();
        }

        if ($remaining <= 2) {
            $message .= $remaining === 1
                ? ' Te queda 1 intento antes de que el acceso se bloquee temporalmente.'
                : " Te quedan {$remaining} intentos antes de que el acceso se bloquee temporalmente.";
        }

        throw ValidationException::withMessages([$field => $message]);
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts($this->throttleKey(), self::MAX_ATTEMPTS)) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn($this->throttleKey());
        $minutes = (int) ceil($seconds / 60);

        $wait = $seconds >= 60
            ? $minutes.' '.($minutes === 1 ? 'minuto' : 'minutos')
            : $seconds.' '.($seconds === 1 ? 'segundo' : 'segundos');

        throw ValidationException::withMessages([
            'email' => "Demasiados intentos fallidos. Por seguridad, el acceso se bloqueó temporalmente. Intenta de nuevo en {$wait}.",
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return $this->string('email')
            ->lower()
            ->append('|'.$this->ip())
            ->transliterate()
            ->value();
    }
}
