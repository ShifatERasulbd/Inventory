<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $actions = ['create', 'read', 'update', 'delete'];
        $category = '1971co-return-requests';
        $label = '1971co Return Requests';

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

        $superAdminId = DB::table('roles')->where('slug', 'super-admin')->value('id');
        if (! $superAdminId) {
            return;
        }

        $slugs = array_map(fn ($action) => "{$action}-{$category}", $actions);
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
        $category = '1971co-return-requests';
        $slugs = array_map(fn ($action) => "{$action}-{$category}", ['create', 'read', 'update', 'delete']);

        $permissionIds = DB::table('permissions')->whereIn('slug', $slugs)->pluck('id')->all();

        if (! empty($permissionIds)) {
            DB::table('permission_role')->whereIn('permission_id', $permissionIds)->delete();
        }

        DB::table('permissions')->whereIn('slug', $slugs)->delete();
    }
};
