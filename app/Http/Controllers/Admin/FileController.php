<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\FileRequest;
use App\Models\File;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\View\View;

class FileController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): View
    {
        $files = File::with('filetable')
            ->orderBy('order')
            ->orderBy('name')
            ->paginate(15);
        
        return view('admin.files.index', compact('files'));
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create(): View
    {
        return view('admin.files.create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(FileRequest $request): RedirectResponse
    {
        File::create($request->validated());

        return redirect()->route('admin.files.index')
            ->with('success', 'Archivo creado exitosamente.');
    }

    /**
     * Display the specified resource.
     */
    public function show(File $file): View
    {
        $file->load('filetable');
        
        return view('admin.files.show', compact('file'));
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(File $file): View
    {
        return view('admin.files.edit', compact('file'));
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(FileRequest $request, File $file): RedirectResponse
    {
        $file->update($request->validated());

        return redirect()->route('admin.files.index')
            ->with('success', 'Archivo actualizado exitosamente.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(File $file): RedirectResponse
    {
        $file->delete();

        return redirect()->route('admin.files.index')
            ->with('success', 'Archivo eliminado exitosamente.');
    }
}





