<?php

namespace Database\Seeders;

use App\Models\User;
use Database\Seeders\CategoryStructureSeeder;
use Database\Seeders\MenuItemsSeeder;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\App;
use Illuminate\Support\Facades\Log;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Only run seeders if not in production or if specifically allowed
        if (app()->environment('production')) {
            Log::info('Skipping database seeding in production environment.');
            return;
        }

        $this->call([
            MenuItemsSeeder::class,
            CategoryStructureSeeder::class,
            // Add other seeders here
        ]);

        // User::factory(10)->create();

        // Create admin user with direct values instead of factory
        if (!User::where('email', 'admin@aaentertainment.com')->exists()) {
            User::create([
                'name' => 'Admin User',
                'username' => 'admin',
                'email' => 'admin@aaentertainment.com',
                'role' => 'admin',
                'password' => Hash::make('admin123'),
            ]);
        }

        Log::info('Database seeding completed.');
    }
}
