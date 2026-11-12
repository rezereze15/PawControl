<?php

namespace App\Http\Controllers;

use App\Http\Requests\StorePetRequest;
use App\Models\Pet;
use Illuminate\Http\RedirectResponse;

class PetController extends Controller
{
    public function store(StorePetRequest $request): RedirectResponse
    {
        Pet::create([
            ...$request->validated(),
            'petOwnerID' => $request->user()->getAuthIdentifier(),
        ]);

        return redirect()
            ->route('dashboard.role', ['role' => 'customer'])
            ->with('success', 'Your pet was added.');
    }
}
