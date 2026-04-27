<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('permissions')->updateOrInsert(
            ['slug' => 'manage-product'],
            [
                'name' => 'Manage Product',
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        $superAdminId = DB::table('roles')->where('slug', 'super-admin')->value('id');
        $permissionId = DB::table('permissions')->where('slug', 'manage-product')->value('id');

        if ($superAdminId && $permissionId) {
            DB::table('permission_role')->updateOrInsert(
                [
                    'permission_id' => $permissionId,
                    'role_id' => $superAdminId,
                ],
                [
                    'updated_at' => now(),
                    'created_at' => now(),
                ]
            );
        }
    }

    public function down(): void
    {
        $permissionId = DB::table('permissions')->where('slug', 'manage-product')->value('id');

        if ($permissionId) {
            DB::table('permission_role')->where('permission_id', $permissionId)->delete();
            DB::table('permissions')->where('id', $permissionId)->delete();
        }
    }
};
