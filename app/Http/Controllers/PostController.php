<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\SavePostRequest;
use App\Models\Post;
use App\Traits\PostTrait;
use Illuminate\Http\Request;
use Inertia\Inertia;

/**
 * Controlador de posts con manejo automático de imágenes
 * Demuestra el uso avanzado del PostTrait
 */
class PostController extends Controller
{
    use PostTrait;

    /**
     * Constructor para configurar el trait
     */
    public function __construct()
    {
        $this->middleware(['auth', 'verified']);
        
        // Configurar campos de búsqueda
        $this->configureSearchable(['title', 'content', 'excerpt']);
        
        // Configurar campos ordenables
        $this->configureSortable(['id', 'title', 'created_at', 'updated_at'], 'created_at', 'desc');
        
        // Configurar paginación
        $this->configurePagination(15);
        
        // Configurar imágenes con redimensionamiento y thumbnail
        $this->configureImages(
            ['featured_image', 'gallery'], // Campos de imagen
            'posts',                       // Ruta de almacenamiento
            800,                          // Ancho principal
            600,                          // Alto principal
            true,                         // Crear thumbnail
            300,                          // Ancho thumbnail
            200                           // Alto thumbnail
        );
        
        // Configurar archivos adjuntos
        $this->configureFiles(
            ['attachment'],                // Campos de archivo
            'posts/attachments',          // Ruta de almacenamiento
            ['pdf', 'doc', 'docx', 'txt'], // Tipos permitidos
            5                             // Tamaño máximo en MB
        );
        
        // Configurar campos checkbox
        $this->configureCheckboxes(['is_published', 'is_featured', 'allow_comments']);
        
        // Configurar campos radio
        $this->configureRadios(['status', 'category']);
        
        // Configurar campos a excluir en updates
        $this->configureExcludeFields(['slug']);
        
        // Configurar reglas de validación personalizadas
        $this->configureCustomValidation([
            'title' => 'required|string|max:255',
            'content' => 'required|string',
            'excerpt' => 'nullable|string|max:500',
            'status' => 'required|in:draft,published,archived',
            'category' => 'required|in:news,blog,tutorial,review',
        ]);
    }

    /**
     * Mostrar lista de posts con filtros automáticos
     */
    public function index(Request $request)
    {
        return $this->indexWithFilters($request, Post::class, 'posts/Index');
    }

    /**
     * Mostrar formulario de creación
     */
    public function create()
    {
        return Inertia::render('posts/Create', [
            'post' => new Post,
            'categories' => ['news', 'blog', 'tutorial', 'review'],
            'statuses' => ['draft', 'published', 'archived'],
        ]);
    }

    /**
     * Crear nuevo post
     */
    public function store(SavePostRequest $request)
    {
        $post = $this->createRecord($request, new Post, [
            'slug' => \Illuminate\Support\Str::slug($request->title),
            'user_id' => auth()->id(),
        ]);
        
        return redirect()->route('posts.index')
            ->with('success', 'Post creado exitosamente.');
    }

    /**
     * Mostrar formulario de edición
     */
    public function edit(Post $post)
    {
        return Inertia::render('posts/Edit', [
            'post' => $post,
            'categories' => ['news', 'blog', 'tutorial', 'review'],
            'statuses' => ['draft', 'published', 'archived'],
        ]);
    }

    /**
     * Actualizar post existente
     */
    public function update(SavePostRequest $request, Post $post)
    {
        $this->updateRecord($request, $post, [
            'slug' => \Illuminate\Support\Str::slug($request->title),
        ]);
        
        return redirect()->route('posts.index')
            ->with('success', 'Post actualizado exitosamente.');
    }

    /**
     * Eliminar post
     */
    public function destroy(Post $post)
    {
        $this->destroyRecord($post);
        
        return redirect()->route('posts.index')
            ->with('success', 'Post eliminado exitosamente.');
    }

    /**
     * Mostrar post individual
     */
    public function show(Post $post)
    {
        return Inertia::render('posts/Show', [
            'post' => $post,
        ]);
    }
}
