<?php

namespace Database\Seeders;

use App\Models\User;
use Database\Seeders\CategoryStructureSeeder;
use Database\Seeders\MenuItemsSeeder;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            MenuItemsSeeder::class,
            CategoryStructureSeeder::class,
            // Add other seeders here
        ]);

        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Admin User',
            'username' => 'admin',
            'email' => 'admin@aaentertainment.com',
            'role' => 'admin',
            'password' => Hash::make('admin123'),
        ]);

        Log::info('Database seeded successfully');
    }
}
