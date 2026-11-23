<?php

namespace App\Http\Controllers;

use App\Http\Requests\ManagedSupplyRequest;
use App\Models\MedicalSupply;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

/**
 * Admin: add, edit, activate and deactivate medical supplies. Supplies are never deleted;
 * deactivating hides them from low stock alerts but keeps their record.
 */
class AdminSupplyController extends Controller
{
    public function store(ManagedSupplyRequest $request): RedirectResponse
    {
        $supply = MedicalSupply::create([...$request->validated(), 'is_active' => true]);

        return back()->with('success', "{$supply->name} was added.");
    }

    public function update(ManagedSupplyRequest $request, MedicalSupply $supply): RedirectResponse
    {
        $supply->update($request->validated());

        return back()->with('success', "{$supply->name} was updated.");
    }

    public function updateStatus(Request $request, MedicalSupply $supply): RedirectResponse
    {
        $validated = $request->validate([
            'is_active' => ['required', 'boolean'],
        ]);

        $supply->update(['is_active' => $validated['is_active']]);

        return back()->with('success', $supply->is_active
            ? "{$supply->name} is active again."
            : "{$supply->name} was deactivated.");
    }
}
