<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\SaveUserRequest;
use App\Models\Role;
use App\Models\User;
use App\Traits\PostTrait;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;

/**
 * Controlador de usuarios simplificado usando PostTrait
 * Maneja automáticamente: búsqueda, ordenamiento, paginación, validación
 */
class UserController extends Controller
{
    use PostTrait;

    /**
     * Constructor para configurar el trait
     */
    public function __construct()
    {
        //$this->middleware(['auth', 'verified']);
        
        // Configurar campos de búsqueda
        $this->configureSearchable(['name', 'last_name', 'last2_name', 'email', 'alias']);
        
        // Configurar campos ordenables
        $this->configureSortable(['id', 'name', 'last_name', 'last2_name', 'email', 'alias', 'created_at'], 'id', 'asc');
        
        // Configurar paginación
        $this->configurePagination(20);
        
        // Configurar campos a hashear
        $this->configureHashes(['password']);
        
        // Configurar campos a excluir en updates
        $this->configureExcludeFields(['password']);
        
        // Configurar relaciones a cargar
        $this->configureRelations(['roles']);
        
        // Configurar reglas de validación personalizadas
        $this->configureCustomValidation([
            'name' => 'required|string|max:255',
            'last_name' => 'nullable|string|max:255',
            'last2_name' => 'nullable|string|max:255',
        ]);
    }

    /**
     * Mostrar lista de usuarios con filtros automáticos
     */
    public function index(Request $request)
    {
        return $this->indexWithFilters($request, User::class, 'admin/users/Index');
    }

    /**
     * Mostrar información de un usuario específico
     */
    public function show(User $user)
    {
        $user->load('roles');
        
        return Inertia::render('admin/users/Show', [
            'user' => $user,
        ]);
    }

    /**
     * Mostrar formulario de creación
     */
    public function create()
    {
        $roles = Role::orderBy('name')->get();
        
        return Inertia::render('admin/users/Create', [
            'user' => new User,
            'roles' => $roles,
        ]);
    }

    /**
     * Crear nuevo usuario
     */
    public function store(SaveUserRequest $request)
    {
        $user = $this->createRecord($request, new User);
        
        // Asignar roles si se proporcionan
        if ($request->has('roles')) {
            $user->roles()->sync($request->roles);
        }
        
        return redirect()->route('admin.users.index')
            ->with('success', 'Usuario creado exitosamente.');
    }

    /**
     * Mostrar formulario de edición
     */
    public function edit(User $user)
    {
        $user->load('roles');
        $roles = Role::orderBy('name')->get();
        
        return Inertia::render('admin/users/Edit', [
            'user' => $user,
            'roles' => $roles,
        ]);
    }

    /**
     * Actualizar usuario existente
     */
    public function update(SaveUserRequest $request, User $user)
    {
        $this->updateRecord($request, $user);
        
        // Actualizar roles si se proporcionan
        if ($request->has('roles')) {
            $user->roles()->sync($request->roles);
        }
        
        return redirect()->route('admin.users.index')
            ->with('success', 'Usuario actualizado exitosamente.');
    }

    /**
     * Eliminar usuario con protección del administrador
     */
    public function destroy(User $user)
    {
        // Proteger administradores de ser eliminados
        if ($user->email === 'admin@example.com') {
            return redirect()->route('admin.users.index')
                ->with('error', 'No se puede eliminar el usuario administrador.');
        }

        $this->destroyRecord($user);
        
        return redirect()->route('admin.users.index')
            ->with('success', 'Usuario eliminado exitosamente.');
    }

    /**
     * Mostrar formulario de cambio de contraseña
     */
    public function editPassword(User $user)
    {
        return Inertia::render('admin/users/Password', [
            'user' => $user,
        ]);
    }

    /**
     * Actualizar contraseña del usuario
     */
    public function updatePassword(Request $request, User $user)
    {
        $request->validate([
            'password' => 'required|confirmed|min:8',
        ]);

        $user->update(['password' => Hash::make($request->password)]);
        
        return redirect()->route('admin.users.index')
            ->with('success', 'Contraseña actualizada exitosamente.');
    }
}