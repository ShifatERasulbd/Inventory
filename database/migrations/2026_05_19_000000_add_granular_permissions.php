<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add category column to permissions table
        Schema::table('permissions', function (Blueprint $table) {
            if (!Schema::hasColumn('permissions', 'category')) {
                $table->string('category', 50)->default('general')->after('slug');
            }
        });

        // Define resources with CRUD permissions
        $resources = [
            'countries' => ['create', 'read', 'update', 'delete'],
            'states' => ['create', 'read', 'update', 'delete'],
            'warehouses' => ['create', 'read', 'update', 'delete'],
            'users' => ['create', 'read', 'update', 'delete'],
            'roles' => ['create', 'read', 'update', 'delete'],
            'products' => ['create', 'read', 'update', 'delete'],
            'stocks' => ['create', 'read', 'update', 'delete'],
            'purchases' => ['create', 'read', 'update', 'delete'],
            'sales' => ['create', 'read', 'update', 'delete'],
            'brands' => ['create', 'read', 'update', 'delete'],
            'categories' => ['create', 'read', 'update', 'delete'],
            'colors' => ['create', 'read', 'update', 'delete'],
            'fabrics' => ['create', 'read', 'update', 'delete'],
            'suppliers' => ['create', 'read', 'update', 'delete'],
            'seasons' => ['create', 'read', 'update', 'delete'],
            'sizes' => ['create', 'read', 'update', 'delete'],
            'racks' => ['create', 'read', 'update', 'delete'],
            'cartoons' => ['create', 'read', 'update', 'delete'],
        ];

        // Get existing permissions
        $existingPermissions = DB::table('permissions')->pluck('slug')->toArray();

        // Create new granular permissions
        $newPermissions = [];
        foreach ($resources as $resource => $actions) {
            foreach ($actions as $action) {
                $slug = "{$action}-{$resource}";
                if (!in_array($slug, $existingPermissions)) {
                    $newPermissions[] = [
                        'name' => ucfirst($action) . ' ' . ucwords(str_replace('-', ' ', $resource)),
                        'slug' => $slug,
                        'category' => $resource,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ];
                }
            }
        }

        // Insert new permissions
        if (!empty($newPermissions)) {
            DB::table('permissions')->insert($newPermissions);
        }

        // Assign all granular permissions to super admin role
        $superAdminRole = DB::table('roles')->where('slug', 'super-admin')->first();
        if ($superAdminRole) {
            $allPermissionIds = DB::table('permissions')->pluck('id')->toArray();
            $existingAssignments = DB::table('permission_role')
                ->where('role_id', $superAdminRole->id)
                ->pluck('permission_id')
                ->toArray();

            $permissionsToAssign = array_diff($allPermissionIds, $existingAssignments);

            foreach ($permissionsToAssign as $permissionId) {
                DB::table('permission_role')->insert([
                    'permission_id' => $permissionId,
                    'role_id' => $superAdminRole->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    public function down(): void
    {
        Schema::table('permissions', function (Blueprint $table) {
            if (Schema::hasColumn('permissions', 'category')) {
                $table->dropColumn('category');
            }
        });
    }
};
