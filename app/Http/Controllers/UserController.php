<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            User::query()
                ->with('warehouse:id,name')
                ->orderBy('id')
                ->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'warehouse_id' => ['required', 'integer', 'exists:warehouses,id'],
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:6', 'same:c_password'],
            'c_password' => ['required', 'string', 'min:6'],
        ]);

        unset($validated['c_password']);

        $user = User::query()->create($validated);

        return response()->json($user->load('warehouse:id,name'), 201);
    }

    public function show(User $user): JsonResponse
    {
        return response()->json($user->load('warehouse:id,name'));
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'warehouse_id' => ['required', 'integer', 'exists:warehouses,id'],
            'name' => ['required', 'string', 'max:100'],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'password' => ['nullable', 'string', 'min:6', 'same:c_password'],
            'c_password' => ['nullable', 'string', 'min:6'],
        ]);

        if (empty($validated['password'])) {
            unset($validated['password']);
        }

        unset($validated['c_password']);

        $user->update($validated);

        return response()->json($user->fresh()->load('warehouse:id,name'));
    }

    public function destroy(User $user): JsonResponse
    {
        $user->delete();

        return response()->json(['message' => 'User deleted']);
    }

    public function syncRoles(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'role_ids' => ['array'],
            'role_ids.*' => ['integer', 'exists:roles,id'],
        ]);

        $user->roles()->sync($validated['role_ids'] ?? []);

        return response()->json($user->fresh()->load('roles:id,name,slug'));
    }
}
