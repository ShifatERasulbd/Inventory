<?php

namespace App\Models;

use App\Models\Category;
use App\Models\Color;
use App\Models\Fabric;
use App\Models\ProductFor;
use App\Models\Season;
use App\Models\Size;
use App\Models\WareHouse;
use App\Models\Brand;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Spatie\Activitylog\LogOptions;
use Spatie\Activitylog\Traits\LogsActivity;

class Product extends Model
{
  use HasFactory, SoftDeletes, LogsActivity;

      protected $fillable=[
    
        'category_id',
        'style_number',
        'hs_number',
        'ref_number',
        'name',
        'available_stock',
        'description',
        'color_id',
        'fabric_id',
        'brand_id',
        'size_id',
        'gender_id',
        'barCode',
        'sku',
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

      public function brands(): BelongsToMany
      {
        return $this->belongsToMany(Brand::class, 'product_brand', 'product_id', 'brand_id')
          ->withTimestamps();
      }
      
      public function category(): BelongsTo
      {
        return $this->belongsTo(Category::class);
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

        if (str_starts_with($path, 'uploads/')) {
          return '/' . ltrim($path, '/');
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

            if (str_starts_with($normalized, 'uploads/')) {
              return '/' . ltrim($normalized, '/');
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
        $normalized = preg_replace('#^/?storage/#', '', $normalized) ?? $normalized;

        return $normalized;
        }


         public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('product')
          ->logFillable()
            ->logOnlyDirty()
            ->dontSubmitEmptyLogs();
    }

}





