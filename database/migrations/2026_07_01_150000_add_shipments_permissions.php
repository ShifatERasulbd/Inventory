<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $actions = ['create', 'read', 'update', 'delete'];

        foreach ($actions as $action) {
            DB::table('permissions')->updateOrInsert(
                ['slug' => "{$action}-shipments"],
                [
                    'name' => ucfirst($action) . ' Shipments',
                    'category' => 'shipments',
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        }

        $superAdminId = DB::table('roles')->where('slug', 'super-admin')->value('id');
        if (! $superAdminId) {
            return;
        }

        $permissionIds = DB::table('permissions')
            ->whereIn('slug', [
                'create-shipments',
                'read-shipments',
                'update-shipments',
                'delete-shipments',
            ])
            ->pluck('id')
            ->all();

        foreach ($permissionIds as $permissionId) {
            DB::table('permission_role')->updateOrInsert(
                ['permission_id' => $permissionId, 'role_id' => $superAdminId],
                ['updated_at' => now(), 'created_at' => now()]
            );
        }
    }

    public function down(): void
    {
        $permissionIds = DB::table('permissions')
            ->whereIn('slug', [
                'create-shipments',
                'read-shipments',
                'update-shipments',
                'delete-shipments',
            ])
            ->pluck('id')
            ->all();

        if (!empty($permissionIds)) {
            DB::table('permission_role')->whereIn('permission_id', $permissionIds)->delete();
        }

        DB::table('permissions')->whereIn('slug', [
            'create-shipments',
            'read-shipments',
            'update-shipments',
            'delete-shipments',
        ])->delete();
    }
};
