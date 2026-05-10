<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

use App\Models\Brand;
use App\Models\Color;
use App\Models\Fabric;
use App\Models\ProductFor;
use App\Models\Size;
use App\Models\WareHouse;
use App\Models\Season;

class Product extends Model
{
      use HasFactory, SoftDeletes;

      protected $fillable=[
        'brand_id',
        'style_number',
        'hs_number',
        'ref_number',
        'name',
        'available_stock',
        'description',
        'color_id',
        'fabric_id',
        'size_id',
        'gender_id',
        'barCode',
        'warehouse_id',
        'cover_image',
        'gallery_images',
        'season_id'
      ];

      protected $casts = [
        'gallery_images' => 'array',
        'available_stock' => 'integer',
      ];

      protected $appends = [
        'cover_image_url',
        'gallery_image_urls',
      ];

      public function brand(): BelongsTo
      {
            return $this->belongsTo(Brand::class);
      }

      public function color(): BelongsTo
      {
            return $this->belongsTo(Color::class);
      }

      public function fabric():BelongsTo
      {
        return $this->belongsTo(Fabric::class);
      }

      public function size():BelongsTo
      {
        return $this->belongsTo(Size::class);
      }

      public function gender():BelongsTo
      {
        return $this->belongsTo(ProductFor::class);
      }

      public function warehouse(): BelongsTo
      {
        return $this->belongsTo(WareHouse::class);
      }

      public function season():BelongsTo
      {
        return $this->belongsTo(Season::class);
      }

      public function getCoverImageUrlAttribute(): ?string
      {
        if (! $this->cover_image) {
            return null;
        }

        $path = $this->normalizeImagePath($this->cover_image);
        if (! $path) {
          return null;
        }

        if (str_starts_with($path, 'http://') || str_starts_with($path, 'https://') || str_starts_with($path, '/')) {
          return $path;
        }

        return '/storage/' . ltrim($path, '/');
      }

      public function getGalleryImageUrlsAttribute(): array
      {
        return collect($this->gallery_images ?? [])
            ->filter()
          ->map(function ($path) {
            $normalized = $this->normalizeImagePath($path);

            if (! $normalized) {
              return null;
            }

            if (str_starts_with($normalized, 'http://') || str_starts_with($normalized, 'https://') || str_starts_with($normalized, '/')) {
              return $normalized;
            }

            return '/storage/' . ltrim($normalized, '/');
          })
          ->filter()
            ->values()
            ->all();
      }

        private function normalizeImagePath(?string $path): ?string
        {
        if (! $path) {
          return null;
        }

        $normalized = str_replace('\\', '/', trim($path));
        $normalized = preg_replace('#^public/#', '', $normalized) ?? $normalized;

        return $normalized;
        }

}
