<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\WareHouse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    /**
     * Resolve warehouse objects for the given IDs and attach to a user array.
     */
    private function attachWarehouses(array $userData, array $warehouseIds, \Illuminate\Database\Eloquent\Collection $warehouseMap): array
    {
        $userData['warehouses'] = collect($warehouseIds)
            ->map(fn ($id) => $warehouseMap->firstWhere('id', $id))
            ->filter()
            ->values()
            ->toArray();

        return $userData;
    }

    public function index(): JsonResponse
    {
        $users = User::query()->with('roles:id,name,slug')->orderBy('id')->get();

        $allIds = $users->flatMap(fn ($u) => $u->warehouse_ids ?? [])->unique()->values()->all();
        $warehouses = WareHouse::whereIn('id', $allIds)->get(['id', 'name']);

        $result = $users->map(function ($user) use ($warehouses) {
            return $this->attachWarehouses($user->toArray(), $user->warehouse_ids ?? [], $warehouses);
        });

        return response()->json($result);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('roles.permissions:id,name,slug');
        $warehouseIds = is_array($user->warehouse_ids) ? $user->warehouse_ids : [];
        $warehouses = WareHouse::whereIn('id', $warehouseIds)->get(['id', 'name']);

        $userData = $this->attachWarehouses($user->toArray(), $warehouseIds, $warehouses);
        $userData['warehouse'] = collect($userData['warehouses'] ?? [])->first();

        return response()->json($userData);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'warehouse_ids'   => ['required', 'array', 'min:1'],
            'warehouse_ids.*' => ['integer', 'exists:warehouses,id'],
            'role_ids'        => ['nullable', 'array'],
            'role_ids.*'      => ['integer', 'exists:roles,id'],
            'name'            => ['required', 'string', 'max:100'],
            'email'           => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password'        => ['required', 'string', 'min:6', 'same:c_password'],
            'c_password'      => ['required', 'string', 'min:6'],
        ]);

        $roleIds = $validated['role_ids'] ?? [];
        unset($validated['role_ids'], $validated['c_password']);

        $user = User::query()->create($validated);

        if (! empty($roleIds)) {
            $user->roles()->sync($roleIds);
        }

        $warehouses = WareHouse::whereIn('id', $user->warehouse_ids ?? [])->get(['id', 'name']);
        $userData = $this->attachWarehouses($user->load('roles:id,name,slug')->toArray(), $user->warehouse_ids ?? [], $warehouses);

        return response()->json($userData, 201);
    }

    public function show(User $user): JsonResponse
    {
        $user->load('roles:id,name,slug');
        $warehouses = WareHouse::whereIn('id', $user->warehouse_ids ?? [])->get(['id', 'name']);
        $userData = $this->attachWarehouses($user->toArray(), $user->warehouse_ids ?? [], $warehouses);

        return response()->json($userData);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'warehouse_ids'   => ['required', 'array', 'min:1'],
            'warehouse_ids.*' => ['integer', 'exists:warehouses,id'],
            'role_ids'        => ['nullable', 'array'],
            'role_ids.*'      => ['integer', 'exists:roles,id'],
            'name'            => ['required', 'string', 'max:100'],
            'email'           => [
                'required', 'string', 'email', 'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'password'   => ['nullable', 'string', 'min:6', 'same:c_password'],
            'c_password' => ['nullable', 'string', 'min:6'],
        ]);

        $roleIds = $validated['role_ids'] ?? null;
        unset($validated['role_ids'], $validated['c_password']);

        if (empty($validated['password'])) {
            unset($validated['password']);
        }

        $user->update($validated);
        $user->roles()->sync($roleIds ?? []);

        $fresh = $user->fresh()->load('roles:id,name,slug');
        $warehouses = WareHouse::whereIn('id', $fresh->warehouse_ids ?? [])->get(['id', 'name']);
        $userData = $this->attachWarehouses($fresh->toArray(), $fresh->warehouse_ids ?? [], $warehouses);

        return response()->json($userData);
    }

    public function destroy(User $user): JsonResponse
    {
        $user->delete();

        return response()->json(['message' => 'User deleted']);
    }

    public function syncRoles(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'role_ids'   => ['array'],
            'role_ids.*' => ['integer', 'exists:roles,id'],
        ]);

        $user->roles()->sync($validated['role_ids'] ?? []);

        return response()->json($user->fresh()->load('roles:id,name,slug'));
    }
}
