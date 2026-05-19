<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\Permission;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class RoleController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            Role::query()
                ->with('permissions:id,name,slug,category')
                ->orderBy('name')
                ->get()
        );
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'slug' => ['required', 'string', 'max:100', 'unique:roles,slug'],
            'permission_ids' => ['array'],
            'permission_ids.*' => ['integer', 'exists:permissions,id'],
        ]);

        $role = Role::query()->create([
            'name' => $validated['name'],
            'slug' => $validated['slug'],
        ]);

        $role->permissions()->sync($validated['permission_ids'] ?? []);

        return response()->json($role->load('permissions:id,name,slug,category'), 201);
    }

    public function show(Role $role): JsonResponse
    {
        return response()->json($role->load('permissions:id,name,slug,category'));
    }

    public function update(Request $request, Role $role): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'slug' => [
                'required',
                'string',
                'max:100',
                Rule::unique('roles', 'slug')->ignore($role->id),
            ],
            'permission_ids' => ['array'],
            'permission_ids.*' => ['integer', 'exists:permissions,id'],
        ]);

        $role->update([
            'name' => $validated['name'],
            'slug' => $validated['slug'],
        ]);

        if (array_key_exists('permission_ids', $validated)) {
            $role->permissions()->sync($validated['permission_ids']);
        }

        return response()->json($role->fresh()->load('permissions:id,name,slug,category'));
    }

    public function destroy(Role $role): JsonResponse
    {
        if ($role->slug === 'super-admin') {
            return response()->json(['message' => 'Super Admin role cannot be deleted.'], 422);
        }

        $role->delete();

        return response()->json(['message' => 'Role deleted']);
    }

    /**
     * Get all permissions grouped by category with CRUD actions
     */
    public function getPermissionsByCategory(): JsonResponse
    {
        $permissions = Permission::all()
            ->groupBy('category')
            ->map(function ($permissions, $category) {
                $actions = [];
                foreach ($permissions as $permission) {
                    preg_match('/^(create|read|update|delete)-/', $permission->slug, $matches);
                    if (!empty($matches[1])) {
                        $actions[$matches[1]][] = [
                            'id' => $permission->id,
                            'name' => $permission->name,
                            'slug' => $permission->slug,
                        ];
                    }
                }
                
                return [
                    'category' => $category,
                    'permissions' => $permissions->toArray(),
                    'actions' => $actions,
                ];
            })
            ->values();

        return response()->json($permissions);
    }
}
