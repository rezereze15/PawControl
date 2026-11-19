<?php

namespace App\Http\Controllers;

use App\Http\Requests\ManagedServiceRequest;
use App\Models\Service;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * Admin: add, edit, activate and deactivate services. Services are never deleted;
 * deactivating hides them from booking but keeps past appointments' history intact.
 */
class AdminServiceController extends Controller
{
    public function store(ManagedServiceRequest $request): RedirectResponse
    {
        $service = Service::create([...$request->validated(), 'is_active' => true]);

        return back()->with('success', "{$service->name} was added.");
    }

    public function update(ManagedServiceRequest $request, Service $service): RedirectResponse
    {
        $service->update($request->validated());

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
