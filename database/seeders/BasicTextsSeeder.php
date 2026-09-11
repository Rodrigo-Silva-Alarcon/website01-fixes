<?php

namespace Database\Seeders;

use App\Models\Text;
use Illuminate\Database\Seeder;

class BasicTextsSeeder extends Seeder
{
    public function run(): void
    {
        $basicTexts = [
            [
                'name' => 'Reporte Mensual de Ventas',
                'date' => '2024-01-15',
                'gender' => 'male',
                'type' => ['report'],
                'print_view' => 'a4',
                'summary' => 'Análisis detallado de las ventas del mes de enero con comparativas y proyecciones.',
                'content' => '<h1>Reporte Mensual de Ventas</h1><p>Este es un reporte detallado...</p>',
                'publish' => true,
                'sector' => 'texto',
            ],
            [
                'name' => 'Artículo sobre Tecnología',
                'date' => '2024-01-20',
                'gender' => 'female',
                'type' => ['article'],
                'print_view' => 'letter',
                'summary' => 'Artículo que explora las últimas tendencias en tecnología y su impacto en la sociedad.',
                'content' => '<h1>Las Tendencias Tecnológicas del 2024</h1><p>La tecnología evoluciona...</p>',
                'publish' => false,
                'sector' => 'texto',
            ],
            [
                'name' => 'Noticia de Última Hora',
                'date' => '2024-01-25',
                'gender' => 'male',
                'type' => ['news'],
                'print_view' => 'a4',
                'summary' => 'Noticia importante sobre eventos recientes que impactan a la comunidad.',
                'content' => '<h1>Noticia de Última Hora</h1><p>Información importante...</p>',
                'publish' => true,
                'sector' => 'texto',
            ],
        ];

        foreach ($basicTexts as $textData) {
            Text::updateOrCreate(
                ['name' => $textData['name']],
                $textData
            );
        }
        
        $this->command->info('Textos básicos creados exitosamente.');
    }
}


