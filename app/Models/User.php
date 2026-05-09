<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

#[Fillable(['warehouse_ids', 'name', 'email', 'password'])]
#[Hidden(['password', 'remember_token'])]
class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable, SoftDeletes;

    protected $appends = [
        'role_slugs',
        'permission_slugs',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'warehouse_ids' => 'array',
        ];
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_user');
    }

    public function hasRole(string $slug): bool
    {
        if ($this->relationLoaded('roles')) {
            return $this->roles->contains(fn (Role $role) => $role->slug === $slug);
        }

        return $this->roles()->where('slug', $slug)->exists();
    }

    public function getRoleSlugsAttribute(): array
    {
        if (! $this->relationLoaded('roles')) {
            $this->load('roles:id,slug');
        }

        return $this->roles
            ->pluck('slug')
            ->filter()
            ->values()
            ->all();
    }

    public function getPermissionSlugsAttribute(): array
    {
        if (! $this->relationLoaded('roles')) {
            $this->load('roles.permissions:id,slug');
        }

        return $this->roles
            ->flatMap(fn (Role $role) => $role->permissions->pluck('slug'))
            ->filter()
            ->unique()
            ->values()
            ->all();
    }

    public function hasPermission(string $slug): bool
    {
        if ($this->hasRole('super-admin')) {
            return true;
        }

        return in_array($slug, $this->permission_slugs, true);
    }
}
