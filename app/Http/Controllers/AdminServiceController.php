<?php

namespace App\Http\Controllers;

use App\Http\Requests\ManagedServiceRequest;
use App\Models\Service;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Admin: add, edit, activate and deactivate services. Services are never deleted;
 * deactivating hides them from booking but keeps past appointments' history intact.
 */
class AdminServiceController extends Controller
{
    public function store(ManagedServiceRequest $request): RedirectResponse
    {
        // A transaction saves the service and its supplies together: if one part fails, neither is saved.
        $service = DB::transaction(function () use ($request): Service {
            $service = Service::create([...$request->safe()->except('supplies'), 'is_active' => true]);
            $service->supplies()->sync($request->suppliesForSync());

            return $service;
        });

        return back()->with('success', "{$service->name} was added.");
    }

    public function update(ManagedServiceRequest $request, Service $service): RedirectResponse
    {
        DB::transaction(function () use ($request, $service): void {
            $service->update($request->safe()->except('supplies'));
            // sync() makes the links match the list: adds new ones, updates amounts, removes the rest.
            $service->supplies()->sync($request->suppliesForSync());
        });

        return back()->with('success', "{$service->name} was updated.");
    }

    public function updateStatus(Request $request, Service $service): RedirectResponse
    {
        $validated = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $service->update(['is_active' => $validated['is_active']]);

        return back()->with('success', $service->is_active
            ? "{$service->name} is active again."
            : "{$service->name} was deactivated.");
    }
}
