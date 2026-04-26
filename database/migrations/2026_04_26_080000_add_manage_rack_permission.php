<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;
use App\Models\Permission;
use App\Models\Role;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Create manage-rack permission
        $permission = Permission::firstOrCreate([
            'name' => 'manage-rack'
        ]);

        // Attach to super-admin role
        $superAdminRole = Role::where('name', 'super-admin')->first();
        if ($superAdminRole && !$superAdminRole->hasPermissionTo('manage-rack')) {
            $superAdminRole->givePermissionTo('manage-rack');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Permission::where('name', 'manage-rack')->delete();
    }
};
