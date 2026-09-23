# Fase 4-14 — Dashboard con métricas útiles (§4.7.14 / §4.6.3)

## Problema

Solo 4 conteos básicos + logo. Sin pedidos, stock bajo ni ingresos.

## Cambios

| Archivo | Cambio |
|---|---|
| `app/Http/Controllers/Admin/DashboardController.php` | `lowStock` (stock ≤ 5), `recentOrders` (últimos 8), `revenueMonth`, `ordersMonth` |
| `resources/js/pages/admin/dashboard.tsx` | Cards Pedidos/Ingresos del mes + tablas Stock bajo y Pedidos recientes |
| `tests/Feature/DashboardMetricsTest.php` | 2 tests: props del dashboard y lowStock vacío |

## Verificación

- `artisan test --compact` → **100 passed (492 assertions)**
- `npx tsc --noEmit` → OK

## Commit

`feat(admin): métricas de pedidos, stock bajo e ingresos en dashboard (Fase 4)`
