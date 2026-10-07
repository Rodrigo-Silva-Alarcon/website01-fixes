<?php

namespace App\Services;

use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;
use PDO;
use RuntimeException;
use ZipArchive;

/**
 * Copias de seguridad de la base de datos SQLite y de las imágenes subidas.
 *
 * - Base de datos: copia consistente con VACUUM INTO (no bloquea la web), se verifica
 *   con PRAGMA integrity_check y se comprime con gzip. Se conservan varias copias
 *   según la retención de config/backups.php.
 * - Imágenes: un único images.zip que se reemplaza en cada copia.
 */
class BackupService
{
    /** db-2026-10-06_210000.sqlite.gz o db-2026-10-06_210000-manual.sqlite.gz */
    public const DB_PATTERN = '/^db-(\d{4}-\d{2}-\d{2}_\d{6})(?:-([a-z0-9-]+))?\.sqlite\.gz$/';

    public const IMAGES_FILE = 'images.zip';

    public function path(?string $file = null): string
    {
        $dir = config('backups.path');

        return $file === null ? $dir : $dir.DIRECTORY_SEPARATOR.$file;
    }

    /**
     * Crea una copia comprimida y verificada de la base de datos y aplica la retención.
     *
     * @return array{name: string, size: int, created_at: CarbonImmutable, label: ?string}
     */
    public function backupDatabase(?string $label = null): array
    {
        $source = $this->sqlitePath();
        File::ensureDirectoryExists($this->path());

        $name = $this->newDatabaseFileName($label);
        $tmp = $this->path($name.'.tmp');
        $part = $this->path($name.'.part');

        try {
            // VACUUM INTO genera una copia limpia y consistente aunque haya escrituras en curso.
            DB::connection()->statement('VACUUM INTO '.DB::connection()->getPdo()->quote($tmp));
            $this->assertHealthy($tmp);
            $this->gzipFile($tmp, $part);
            $this->assertGzipReadable($part);
            rename($part, $this->path($name));
        } finally {
            File::delete([$tmp, $part]);
        }

        $this->pruneDatabaseBackups();

        return $this->describe($name);
    }

    /**
     * Comprime public/data en images.zip, reemplazando la copia anterior.
     *
     * @return array{name: string, size: int, files: int, created_at: CarbonImmutable}
     */
    public function backupImages(): array
    {
        $source = config('backups.images_path');
        if (! is_dir($source)) {
            throw new RuntimeException("No existe la carpeta de imágenes: {$source}");
        }

        File::ensureDirectoryExists($this->path());
        $part = $this->path(self::IMAGES_FILE.'.part');
        File::delete($part);

        $zip = new ZipArchive;
        if ($zip->open($part, ZipArchive::CREATE | ZipArchive::OVERWRITE) !== true) {
            throw new RuntimeException('No se pudo crear el archivo zip de imágenes.');
        }

        $files = 0;
        foreach (File::allFiles($source) as $file) {
            $relative = str_replace('\\', '/', $file->getRelativePathname());
            $zip->addFile($file->getPathname(), $relative);
            // Las imágenes ya vienen comprimidas: volver a comprimirlas solo gasta CPU.
            $zip->setCompressionName($relative, ZipArchive::CM_STORE);
            $files++;
        }

        if (! $zip->close()) {
            File::delete($part);
            throw new RuntimeException('No se pudo escribir el archivo zip de imágenes.');
        }

        // Si la carpeta está vacía, ZipArchive no crea el archivo.
        if (! is_file($part)) {
            throw new RuntimeException('La carpeta de imágenes está vacía; no se reemplaza la copia anterior.');
        }

        rename($part, $this->path(self::IMAGES_FILE));

        return [
            'name' => self::IMAGES_FILE,
            'size' => filesize($this->path(self::IMAGES_FILE)),
            'files' => $files,
            'created_at' => CarbonImmutable::now(),
        ];
    }

    /**
     * Restaura una copia. Antes guarda una copia del estado actual para poder deshacerlo.
     *
     * @return string nombre de la copia de seguridad hecha antes de restaurar
     */
    public function restoreDatabase(string $name): string
    {
        $file = $this->resolveDatabaseBackup($name);
        $target = $this->sqlitePath();
        $tmp = $this->path($name.'.restore');

        try {
            $this->gunzipFile($file, $tmp);
            $this->assertHealthy($tmp);

            $safety = $this->backupDatabase('pre-restore')['name'];

            DB::disconnect();
            File::delete([$target.'-wal', $target.'-shm', $target.'-journal']);
            if (! copy($tmp, $target)) {
                throw new RuntimeException('No se pudo reemplazar la base de datos.');
            }
            DB::reconnect();
        } finally {
            File::delete($tmp);
        }

        return $safety;
    }

    /**
     * Copias de la base de datos, de la más reciente a la más antigua.
     *
     * @return list<array{name: string, size: int, created_at: CarbonImmutable, label: ?string}>
     */
    public function databaseBackups(): array
    {
        if (! is_dir($this->path())) {
            return [];
        }

        $backups = [];
        foreach (scandir($this->path()) as $file) {
            if (preg_match(self::DB_PATTERN, $file)) {
                $backups[] = $this->describe($file);
            }
        }

        usort($backups, fn ($a, $b) => strcmp($b['name'], $a['name']));

        return $backups;
    }

    /**
     * @return array{name: string, size: int, created_at: CarbonImmutable}|null
     */
    public function imagesBackup(): ?array
    {
        $file = $this->path(self::IMAGES_FILE);
        if (! is_file($file)) {
            return null;
        }

        return [
            'name' => self::IMAGES_FILE,
            'size' => filesize($file),
            'created_at' => CarbonImmutable::createFromTimestamp(filemtime($file)),
        ];
    }

    /**
     * Ruta absoluta de un archivo de copia existente (solo nombres válidos, sin rutas).
     */
    public function resolveFile(string $name): string
    {
        if ($name === self::IMAGES_FILE) {
            $file = $this->path($name);
            if (is_file($file)) {
                return $file;
            }
        }

        return $this->resolveDatabaseBackup($name);
    }

    /**
     * Borra las copias que ya no hacen falta según la retención y el tope de espacio.
     *
     * @return list<string> nombres de las copias borradas
     */
    public function pruneDatabaseBackups(?CarbonImmutable $now = null): array
    {
        $now ??= CarbonImmutable::now();
        $retention = config('backups.retention');
        $backups = $this->databaseBackups();

        $keep = [];
        $seen = ['day' => [], 'week' => [], 'month' => []];

        foreach ($backups as $i => $backup) {
            $date = $backup['created_at'];
            $hours = $date->diffInHours($now);
            $keys = [
                'day' => $date->format('Y-m-d'),
                'week' => $date->format('o-W'),
                'month' => $date->format('Y-m'),
            ];

            $tier = match (true) {
                $i === 0 || $hours <= $retention['keep_all_hours'] => 'all',
                $hours <= $retention['keep_daily_days'] * 24 => 'day',
                $hours <= $retention['keep_weekly_weeks'] * 7 * 24 => 'week',
                $hours <= $retention['keep_monthly_months'] * 31 * 24 => 'month',
                default => null,
            };

            // En cada nivel se conserva la copia más reciente de ese día, semana o mes.
            if ($tier === 'all' || ($tier !== null && ! isset($seen[$tier][$keys[$tier]]))) {
                $keep[] = $backup;
                foreach ($keys as $period => $key) {
                    $seen[$period][$key] = true;
                }
            }
        }

        $deleted = array_values(array_diff(
            array_column($backups, 'name'),
            array_column($keep, 'name'),
        ));

        // Tope de espacio: se borran las más antiguas, nunca la más reciente.
        $limit = config('backups.max_size_mb') * 1024 * 1024;
        $total = array_sum(array_column($keep, 'size'));
        while ($total > $limit && count($keep) > 1) {
            $oldest = array_pop($keep);
            $total -= $oldest['size'];
            $deleted[] = $oldest['name'];
        }

        foreach ($deleted as $name) {
            File::delete($this->path($name));
        }

        return $deleted;
    }

    private function sqlitePath(): string
    {
        $connection = DB::connection();
        if ($connection->getDriverName() !== 'sqlite') {
            throw new RuntimeException('Las copias automáticas solo admiten SQLite (conexión actual: '.$connection->getDriverName().').');
        }

        $path = $connection->getConfig('database');
        if ($path === ':memory:' || ! is_file($path)) {
            throw new RuntimeException("No se encontró el archivo de la base de datos: {$path}");
        }

        return $path;
    }

    private function newDatabaseFileName(?string $label): string
    {
        $label = $label === null ? '' : '-'.trim(preg_replace('/[^a-z0-9]+/', '-', strtolower($label)), '-');
        $stamp = CarbonImmutable::now()->format('Y-m-d_His');

        $name = "db-{$stamp}{$label}.sqlite.gz";
        for ($n = 2; is_file($this->path($name)); $n++) {
            $name = "db-{$stamp}{$label}-{$n}.sqlite.gz";
        }

        return $name;
    }

    /**
     * @return array{name: string, size: int, created_at: CarbonImmutable, label: ?string}
     */
    private function describe(string $name): array
    {
        preg_match(self::DB_PATTERN, $name, $m);

        return [
            'name' => $name,
            'size' => filesize($this->path($name)),
            'created_at' => CarbonImmutable::createFromFormat('Y-m-d_His', $m[1]),
            'label' => $m[2] ?? null,
        ];
    }

    private function resolveDatabaseBackup(string $name): string
    {
        $file = $this->path($name);
        if (! preg_match(self::DB_PATTERN, $name) || ! is_file($file)) {
            throw new RuntimeException("No existe la copia: {$name}");
        }

        return $file;
    }

    /** Comprueba que el archivo sea una base SQLite íntegra y con tablas. */
    private function assertHealthy(string $file): void
    {
        $pdo = new PDO('sqlite:'.$file, null, null, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
        try {
            $check = $pdo->query('PRAGMA integrity_check')->fetchColumn();
            $tables = (int) $pdo->query("SELECT count(*) FROM sqlite_master WHERE type = 'table'")->fetchColumn();
        } finally {
            $pdo = null;
        }

        if ($check !== 'ok') {
            throw new RuntimeException("La copia no pasó la verificación de integridad: {$check}");
        }
        if ($tables === 0) {
            throw new RuntimeException('La copia no contiene tablas.');
        }
    }

    private function gzipFile(string $from, string $to): void
    {
        $in = fopen($from, 'rb');
        $out = gzopen($to, 'wb9');
        if ($in === false || $out === false) {
            throw new RuntimeException('No se pudo comprimir la copia.');
        }

        while (! feof($in)) {
            gzwrite($out, fread($in, 1024 * 512));
        }

        fclose($in);
        gzclose($out);
    }

    private function gunzipFile(string $from, string $to): void
    {
        $in = gzopen($from, 'rb');
        $out = fopen($to, 'wb');
        if ($in === false || $out === false) {
            throw new RuntimeException('No se pudo descomprimir la copia.');
        }

        while (! gzeof($in)) {
            $chunk = gzread($in, 1024 * 512);
            if ($chunk === false) {
                throw new RuntimeException('La copia comprimida está dañada.');
            }
            fwrite($out, $chunk);
        }

        gzclose($in);
        fclose($out);
    }

    /** Lee el gzip completo: si el CRC no cuadra, gzread falla. */
    private function assertGzipReadable(string $file): void
    {
        $in = gzopen($file, 'rb');
        $bytes = 0;
        while (! gzeof($in)) {
            $chunk = gzread($in, 1024 * 512);
            if ($chunk === false) {
                gzclose($in);
                throw new RuntimeException('La copia comprimida está dañada.');
            }
            $bytes += strlen($chunk);
        }
        gzclose($in);

        if ($bytes === 0) {
            throw new RuntimeException('La copia comprimida está vacía.');
        }
    }
}
