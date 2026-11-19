<?php

namespace App\Http\Controllers;

use App\Http\Requests\ManagedServiceRequest;
use App\Models\Service;
use Illuminate\Http\RedirectResponse;

/**
 * Admin: add and edit services. Services are never deleted; deactivating
 * (Step 8c) hides them but keeps past appointments' history intact.
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
}
