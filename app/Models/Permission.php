<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Permission extends Model
{
    /**
     * Los atributos que son asignables masivamente.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'description',
        'sector',
    ];

    /**
     * Relación muchos a muchos con Role.
     * Un permiso puede pertenecer a múltiples roles.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'permission_role');
    }

    /**
     * Relación muchos a muchos con User a través de roles.
     * Un permiso puede ser asignado a usuarios a través de sus roles.
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'role_user', 'role_id', 'user_id')
            ->join('permission_role', 'roles.id', '=', 'permission_role.role_id')
            ->where('permission_role.permission_id', $this->id);
    }

    /**
     * Obtener la etiqueta del sector del permiso.
     */
    public function getSectorLabelAttribute()
    {
        $sectors = config('variables.permission_sectors', []);
        return $sectors[$this->sector] ?? ucfirst($this->sector);
    }

    /**
     * Scope para filtrar permisos por sector.
     */
    public function scopeBySector($query, $sector)
    {
        return $query->where('sector', $sector);
    }

    /**
     * Obtener todos los sectores disponibles desde la configuración.
     */
    public static function getSectors()
    {
        return config('variables.permission_sectors', []);
    }
}
