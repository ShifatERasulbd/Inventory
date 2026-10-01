<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $actions = ['create', 'read', 'update', 'delete'];

        // Each store menu (they all share RemoteOrderController, filtered by order_from) gets its
        // own category so roles can be granted access to individual stores independently.
        $categories = [
            '1971co-orders' => '1971co Orders',
            'viveren-orders' => 'Viveren Orders',
            'joor-orders' => 'Joor Orders',
            'amazon-orders' => 'Amazon Orders',
            'return-orders' => 'Return Orders',
        ];

        foreach ($categories as $category => $label) {
            foreach ($actions as $action) {
                DB::table('permissions')->updateOrInsert(
                    ['slug' => "{$action}-{$category}"],
                    [
                        'name' => ucfirst($action) . ' ' . $label,
                        'category' => $category,
                        'updated_at' => now(),
                        'created_at' => now(),
                    ]
                );
            }
        }

        $superAdminId = DB::table('roles')->where('slug', 'super-admin')->value('id');
        if (! $superAdminId) {
            return;
        }

        $slugs = [];
        foreach (array_keys($categories) as $category) {
            foreach ($actions as $action) {
                $slugs[] = "{$action}-{$category}";
            }
        }

        $permissionIds = DB::table('permissions')->whereIn('slug', $slugs)->pluck('id')->all();

        foreach ($permissionIds as $permissionId) {
            DB::table('permission_role')->updateOrInsert(
                ['permission_id' => $permissionId, 'role_id' => $superAdminId],
                ['updated_at' => now(), 'created_at' => now()]
            );
        }
    }

    public function down(): void
    {
        $slugs = [];
        foreach (['1971co-orders', 'viveren-orders', 'joor-orders', 'amazon-orders', 'return-orders'] as $category) {
            foreach (['create', 'read', 'update', 'delete'] as $action) {
                $slugs[] = "{$action}-{$category}";
            }
        }

        $permissionIds = DB::table('permissions')->whereIn('slug', $slugs)->pluck('id')->all();

        if (!empty($permissionIds)) {
            DB::table('permission_role')->whereIn('permission_id', $permissionIds)->delete();
        }

        DB::table('permissions')->whereIn('slug', $slugs)->delete();
    }
};
