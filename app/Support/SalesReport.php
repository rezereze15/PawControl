<?php

namespace App\Support;

use App\Models\Billing;
use App\Models\BillingItem;
use App\Models\MedicalSupply;
use App\Models\Service;
use Carbon\CarbonImmutable;
use Carbon\CarbonInterface;
use Illuminate\Support\Collection;

/**
 * The clinic owner's Sales Reports, worked out from the real bills for one period
 * (this week, this month or this year, up to now) and shaped for the Sales Reports page.
 *
 * Revenue means money received: bills the clerk marked Paid, counted on the day they
 * were paid in clinic time. Bills not paid yet are reported separately (unpaid).
 *
 * Two kinds of time are involved:
 *  - paid_at / issued_at are real moments saved in UTC, so they are converted to the
 *    clinic's timezone before grouping by day,
 *  - a range in clinic time is converted back to UTC before it goes into a query.
 */
final class SalesReport
{
    public const PERIODS = ['week', 'month', 'year'];

    public const DEFAULT_PERIOD = 'month';

    /** Unpaid bills older than this many days need a follow-up. */
    public const FOLLOW_UP_DAYS = 7;

    /** How many recent payments the Overview lists. */
    public const LATEST_PAYMENTS = 5;

    /** @return array<string, mixed> */
    public static function build(string $period, ?CarbonInterface $now = null): array
    {
        $period = in_array($period, self::PERIODS, true) ? $period : self::DEFAULT_PERIOD;
        $now = CarbonImmutable::instance($now ?? now())->setTimezone(self::timezone());
        [$start, $earlierStart, $earlierEnd] = self::range($period, $now);

        $paid = self::paidBills($start, $now);
        $totals = self::totals($paid);
        $earlierTotals = self::totals(self::paidBills($earlierStart, $earlierEnd));

        return [
            'period' => $period,
            'today' => $now->toDateString(),
            'rangeLabel' => self::rangeLabel($start, $now),
            'compareLabel' => self::rangeLabel($earlierStart, $earlierEnd),
            'totals' => $totals,
            // Percent change vs the same stretch of the previous period; null = nothing to compare.
            'change' => [
                'revenue' => self::percentChange($totals['revenue'], $earlierTotals['revenue']),
                'bills' => self::percentChange($totals['bills'], $earlierTotals['bills']),
                'averageBill' => self::percentChange($totals['averageBill'], $earlierTotals['averageBill']),
            ],
            'unpaid' => self::unpaid($now),
            'series' => self::series($period, $start, $now, $paid),
            'mix' => self::mix($paid),
            'latestPayments' => self::latestPayments(),
        ];
    }

    private static function timezone(): string
    {
        return config('app.clinic_timezone', 'Asia/Manila');
    }

    /**
     * Start of the period, and the same stretch of the previous period to compare with
     * (Nov 1 – 27 is compared with Oct 1 – 27, not all of October).
     *
     * @return array{0: CarbonImmutable, 1: CarbonImmutable, 2: CarbonImmutable}
     */
    private static function range(string $period, CarbonImmutable $now): array
    {
        return match ($period) {
            'week' => [
                $now->startOfWeek(CarbonInterface::MONDAY),
                $now->startOfWeek(CarbonInterface::MONDAY)->subWeek(),
                $now->subWeek(),
            ],
            'year' => [
                $now->startOfYear(),
                $now->subYearNoOverflow()->startOfYear(),
                $now->subYearNoOverflow(),
            ],
            default => [
                $now->startOfMonth(),
                $now->subMonthNoOverflow()->startOfMonth(),
                $now->subMonthNoOverflow(),
            ],
        };
    }

    /** @return Collection<int, Billing> */
    private static function paidBills(CarbonImmutable $from, CarbonImmutable $to): Collection
    {
        return Billing::query()
            ->with('items')
            ->where('status', Billing::STATUS_PAID)
            // The database keeps UTC moments: a Manila midnight is 16:00 UTC the day before.
            ->whereBetween('paid_at', [$from->utc(), $to->utc()])
            ->get();
    }

    /** Lines minus the discount: what the bill asks for (the amount collected once paid). */
    private static function billTotal(Billing $billing): float
    {
        $subtotal = $billing->items->sum(fn (BillingItem $item) => $item->quantity * (float) $item->unit_price);

        return max(0, $subtotal - (float) $billing->discount);
    }

    private static function amountCollected(Billing $billing): float
    {
        return $billing->amount_paid === null ? self::billTotal($billing) : (float) $billing->amount_paid;
    }

    /**
     * @param  Collection<int, Billing>  $bills
     * @return array{revenue: float, bills: int, averageBill: float}
     */
    private static function totals(Collection $bills): array
    {
        $revenue = round((float) $bills->sum(fn (Billing $billing) => self::amountCollected($billing)), 2);
        $count = $bills->count();

        return [
            'revenue' => $revenue,
            'bills' => $count,
            'averageBill' => $count > 0 ? round($revenue / $count, 2) : 0.0,
        ];
    }

    private static function percentChange(float|int $current, float|int $earlier): ?float
    {
        return $earlier > 0 ? round(($current - $earlier) / $earlier * 100, 1) : null;
    }

    /**
     * Bills not paid yet, right now (not limited to the period).
     *
     * @return array{amount: float, bills: int, olderThanWeek: int}
     */
    private static function unpaid(CarbonImmutable $now): array
    {
        $bills = Billing::query()
            ->with('items')
            ->where('status', '!=', Billing::STATUS_PAID)
            ->get();
        $cutoff = $now->subDays(self::FOLLOW_UP_DAYS);

        return [
            'amount' => round((float) $bills->sum(fn (Billing $billing) => self::billTotal($billing)), 2),
            'bills' => $bills->count(),
            'olderThanWeek' => $bills->filter(fn (Billing $billing) => $billing->issued_at->lt($cutoff))->count(),
        ];
    }

    /**
     * Revenue per day (week, month) or per month (year). Days or months still ahead
     * have no value (null), so the chart line stops at today.
     *
     * @param  Collection<int, Billing>  $paid
     * @return list<array{key: string, label: string, short: string, paid: float|null}>
     */
    private static function series(string $period, CarbonImmutable $start, CarbonImmutable $now, Collection $paid): array
    {
        $byYear = $period === 'year';
        $keyFormat = $byYear ? 'Y-m' : 'Y-m-d';
        $totals = $paid
            ->groupBy(fn (Billing $billing) => $billing->paid_at->toImmutable()->setTimezone(self::timezone())->format($keyFormat))
            ->map(fn (Collection $bills) => round((float) $bills->sum(fn (Billing $billing) => self::amountCollected($billing)), 2));

        $steps = match ($period) {
            'week' => 7,
            'year' => 12,
            default => $start->daysInMonth,
        };
        $today = $now->format($keyFormat);
        $points = [];

        for ($i = 0; $i < $steps; $i++) {
            $day = $byYear ? $start->addMonthsNoOverflow($i) : $start->addDays($i);
            $key = $day->format($keyFormat);

            $points[] = [
                'key' => $key,
                'label' => $byYear ? $day->format('F Y') : $day->format('D, M j'),
                'short' => match ($period) {
                    'week' => $day->format('D'),
                    'year' => $day->format('M'),
                    default => $day->format('M j'),
                },
                'paid' => $key > $today ? null : ($totals[$key] ?? 0.0),
            ];
        }

        return $points;
    }

    /**
     * Where the money came from: each line of the paid bills, matched by name to the
     * Services and Medical Supplies lists. Lines the clerk added or renamed count as Others.
     *
     * @param  Collection<int, Billing>  $paid
     * @return array{services: float, supplies: float, others: float, billed: float, discounts: float}
     */
    private static function mix(Collection $paid): array
    {
        $services = self::lowercaseNames(Service::query()->pluck('name'));
        $supplies = self::lowercaseNames(MedicalSupply::query()->pluck('name'));
        $mix = ['services' => 0.0, 'supplies' => 0.0, 'others' => 0.0];

        foreach ($paid as $billing) {
            foreach ($billing->items as $item) {
                $name = mb_strtolower(trim($item->description));
                $kind = match (true) {
                    isset($services[$name]) => 'services',
                    isset($supplies[$name]) => 'supplies',
                    default => 'others',
                };
                $mix[$kind] += $item->quantity * (float) $item->unit_price;
            }
        }

        $mix = array_map(fn (float $amount) => round($amount, 2), $mix);

        return [
            ...$mix,
            'billed' => round(array_sum($mix), 2),
            'discounts' => round((float) $paid->sum(fn (Billing $billing) => (float) $billing->discount), 2),
        ];
    }

    /**
     * @param  Collection<int, string>  $names
     * @return array<string, true>
     */
    private static function lowercaseNames(Collection $names): array
    {
        return $names->mapWithKeys(fn (string $name) => [mb_strtolower(trim($name)) => true])->all();
    }

    /**
     * The most recent payments, whatever the period.
     *
     * @return list<array<string, mixed>>
     */
    private static function latestPayments(): array
    {
        return Billing::query()
            ->with(['items', 'medicalRecord.pet'])
            ->where('status', Billing::STATUS_PAID)
            ->whereNotNull('paid_at')
            ->latest('paid_at')
            ->latest('id')
            ->limit(self::LATEST_PAYMENTS)
            ->get()
            ->map(function (Billing $billing) {
                $record = $billing->medicalRecord;
                $pet = $record?->pet;

                return [
                    'id' => $billing->id,
                    'receiptNo' => $billing->receiptNumber(),
                    'pet' => $pet?->petName ?? 'Unknown pet',
                    'breed' => $pet?->breed ?: $pet?->species,
                    'service' => $record?->service_type ?: ($billing->items->first()?->description ?? 'Visit'),
                    'amount' => round(self::amountCollected($billing), 2),
                    'paidOn' => $billing->paid_at->toImmutable()->setTimezone(self::timezone())->format('M j, Y'),
                ];
            })
            ->values()
            ->all();
    }

    /** "Nov 1 – 27, 2026", "Oct 26 – Nov 1, 2026", "Dec 29, 2025 – Jan 4, 2026". */
    private static function rangeLabel(CarbonImmutable $from, CarbonImmutable $to): string
    {
        return match (true) {
            $from->isSameDay($to) => $from->format('M j, Y'),
            $from->year !== $to->year => $from->format('M j, Y').' – '.$to->format('M j, Y'),
            $from->month !== $to->month => $from->format('M j').' – '.$to->format('M j, Y'),
            default => $from->format('M j').' – '.$to->format('j, Y'),
        };
    }
}
