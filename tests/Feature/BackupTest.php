<?php

use App\Services\BackupService;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

beforeEach(function () {
    $this->dir = storage_path('framework/testing/backups-'.uniqid());
    config(['backups.path' => $this->dir.'/backups']);
    File::ensureDirectoryExists($this->dir);
});

afterEach(function () {
    DB::purge('backup_test');
    File::deleteDirectory($this->dir);
});

/** Base SQLite en un archivo (los tests normales usan :memory:, que no se puede copiar). */
function useFileDatabase(string $dir): string
{
    $file = $dir.'/app.sqlite';
    $pdo = new PDO('sqlite:'.$file);
    $pdo->exec('CREATE TABLE orders (id INTEGER PRIMARY KEY, total INTEGER)');
    $pdo->exec('INSERT INTO orders (total) VALUES (100), (250)');
    $pdo = null;

    config([
        'database.connections.backup_test' => ['driver' => 'sqlite', 'database' => $file, 'prefix' => '', 'foreign_key_constraints' => true],
        'database.default' => 'backup_test',
    ]);

    return $file;
}

function fakeBackup(string $dir, CarbonImmutable $date): string
{
    $name = 'db-'.$date->format('Y-m-d_His').'.sqlite.gz';
    File::ensureDirectoryExists($dir);
    file_put_contents($dir.'/'.$name, 'x');

    return $name;
}

it('creates a compressed, verified database backup that can be read back', function () {
    useFileDatabase($this->dir);

    $backup = app(BackupService::class)->backupDatabase();

    expect($backup['name'])->toMatch(BackupService::DB_PATTERN);
    $copy = $this->dir.'/copy.sqlite';
    file_put_contents($copy, gzdecode(file_get_contents(config('backups.path').'/'.$backup['name'])));
    $pdo = new PDO('sqlite:'.$copy);
    expect((int) $pdo->query('SELECT sum(total) FROM orders')->fetchColumn())->toBe(350);
    $pdo = null;
});

it('restores a backup and keeps a safety copy of the current state', function () {
    $file = useFileDatabase($this->dir);
    $service = app(BackupService::class);
    $backup = $service->backupDatabase();

    DB::table('orders')->delete();
    $safety = $service->restoreDatabase($backup['name']);

    expect(DB::table('orders')->sum('total'))->toEqual(350)
        ->and($safety)->toContain('pre-restore')
        ->and(collect($service->databaseBackups())->pluck('name'))->toContain($safety);
});

it('refuses to restore a file that is not a backup', function () {
    useFileDatabase($this->dir);

    app(BackupService::class)->restoreDatabase('../app.sqlite');
})->throws(RuntimeException::class);

it('keeps recent backups and thins out old ones', function () {
    $now = CarbonImmutable::parse('2026-10-06 12:00:00');
    $dir = config('backups.path');

    // Una copia cada 6 horas durante 400 días.
    for ($i = 0; $i < 400 * 4; $i++) {
        fakeBackup($dir, $now->subHours($i * 6));
    }

    app(BackupService::class)->pruneDatabaseBackups($now);
    $kept = collect(app(BackupService::class)->databaseBackups());

    $recent = $kept->filter(fn ($b) => $b['created_at']->diffInHours($now) <= 48);
    expect($recent)->toHaveCount(9)
        ->and($kept->count())->toBeLessThan(45)
        ->and($kept->first()['created_at']->equalTo($now))->toBeTrue()
        ->and($kept->last()['created_at']->diffInMonths($now))->toBeGreaterThanOrEqual(11);
});

it('never deletes the newest backup when over the size limit', function () {
    config(['backups.max_size_mb' => 0]);
    $now = CarbonImmutable::now();
    $newest = fakeBackup(config('backups.path'), $now);
    fakeBackup(config('backups.path'), $now->subHour());

    app(BackupService::class)->pruneDatabaseBackups($now);

    expect(collect(app(BackupService::class)->databaseBackups())->pluck('name')->all())->toBe([$newest]);
});

it('replaces the images zip on every backup', function () {
    config(['backups.images_path' => $this->dir.'/data']);
    File::ensureDirectoryExists($this->dir.'/data/products');
    file_put_contents($this->dir.'/data/products/a.webp', 'a');

    $service = app(BackupService::class);
    expect($service->backupImages()['files'])->toBe(1);

    file_put_contents($this->dir.'/data/products/b.webp', 'b');
    expect($service->backupImages()['files'])->toBe(2);

    $zip = new ZipArchive;
    $zip->open(config('backups.path').'/images.zip');
    expect($zip->numFiles)->toBe(2);
    $zip->close();
    expect(File::files(config('backups.path')))->toHaveCount(1);
});
