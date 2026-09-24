<?php

namespace App\Console\Commands;

use App\Models\Cart;
use Illuminate\Console\Command;

class PruneCarts extends Command
{
    protected $signature = 'carts:prune {--days=30 : Days of inactivity before pruning}';

    protected $description = 'Delete abandoned carts older than the given number of days';

    public function handle(): int
    {
        $days = (int) $this->option('days');
        $cutoff = now()->subDays($days);

        $deleted = Cart::where('updated_at', '<', $cutoff)
            ->whereDoesntHave('orders')
            ->delete();

        $this->info("Pruned {$deleted} abandoned carts (>{$days}d, no orders).");

        return self::SUCCESS;
    }
}