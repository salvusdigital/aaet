<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Menu;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\File;

class MenuItemsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Start a database transaction
        DB::beginTransaction();

        try {
            $this->command->info('Starting menu seeding from JSON...');

            // Load menu data from JSON file
            $jsonPath = database_path('seeders/real-menu.json');
            $this->command->info("Reading menu data from {$jsonPath}");

            if (!File::exists($jsonPath)) {
                $this->command->error("ERROR: JSON file not found at {$jsonPath}");
                return;
            }

            $menuDataRaw = File::get($jsonPath);
            $this->command->info("JSON file read, size: " . strlen($menuDataRaw) . " bytes");

            $menuData = json_decode($menuDataRaw, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                $this->command->error('ERROR: Invalid JSON data: ' . json_last_error_msg());
                return;
            }

            $this->command->info('JSON parsed successfully, found ' . 
                (isset($menuData['menu_categories']) && is_array($menuData['menu_categories']) ? 
                    count($menuData['menu_categories']) : 0) . ' categories');

            // Clear existing data
            $this->command->info('Clearing existing menu items...');
            Menu::query()->delete();
            
            $this->command->info('Clearing existing categories...');
            Category::query()->delete();
            
            $this->command->info('Existing data cleared successfully');

            if (!isset($menuData['menu_categories']) || !is_array($menuData['menu_categories']) || 
                empty($menuData['menu_categories'])) {
                $this->command->error('ERROR: No menu categories found in JSON data');
                return;
            }

            // Process each category in the menu_categories array
            $totalItemsCreated = 0;
            $sortOrder = 1;

            foreach ($menuData['menu_categories'] as $categoryObj) {
                if (!is_array($categoryObj) || empty($categoryObj)) {
                    continue;
                }
                
                $categoryName = array_key_first($categoryObj);
                $menuItems = $categoryObj[$categoryName] ?? [];

                $this->command->info("Processing category: {$categoryName} with " . 
                    (is_array($menuItems) ? count($menuItems) : 0) . " items");

                // Create category
                try {
                    $category = Category::create([
                        'name' => $categoryName,
                        'group' => $this->determineGroup($categoryName),
                        'sort_order' => $sortOrder++
                    ]);
                    
                    $this->command->info("Created new category: {$categoryName} with ID {$category->id}");

                    // Process menu items for this category
                    if (is_array($menuItems) && !empty($menuItems)) {
                        $itemsCreated = $this->processMenuItems($menuItems, $category);
                        $totalItemsCreated += $itemsCreated;
                    }
                } catch (\Exception $e) {
                    $this->command->error("Error processing category {$categoryName}: " . $e->getMessage());
                    continue;
                }
            }

            $this->command->info("\nMenu seeding from JSON completed successfully. Created {$totalItemsCreated} menu items.");
            DB::commit();
        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error('Error seeding menu from JSON: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Process menu items for a category
     */
    private function processMenuItems(array $menuItems, Category $category): int
    {
        $itemsCreated = 0;
        
        foreach ($menuItems as $item) {
            if (!is_array($item) || !isset($item['name'])) {
                continue;
            }

            $this->command->info("Processing item: {$item['name']} (Room: " . 
                ($item['room_service_price'] ?? 'N/A') . ", Restaurant: " . 
                ($item['restaurant_price'] ?? 'N/A') . ")");

            try {
                // Create new menu item
                Menu::create([
                    'name' => $item['name'],
                    'description' => $item['description'] ?? '',
                    'category_id' => $category->id,
                    'price_room' => $this->parsePrice($item['room_service_price'] ?? 0),
                    'price_restaurant' => $this->parsePrice($item['restaurant_price'] ?? 0),
                    'available' => true,
                    'image_url' => null,
                    'tags' => json_encode([])
                ]);

                $itemsCreated++;
                $this->command->info("Created menu item: {$item['name']} in {$category->name}");
            } catch (\Exception $e) {
                $this->command->error("Error creating menu item '{$item['name']}': " . $e->getMessage());
            }
        }

        return $itemsCreated;
    }

    /**
     * Determine the group (FOOD or DRINKS) based on category name
     */
    private function determineGroup(string $categoryName): string
    {
        $drinkCategories = [
            'NON ALCOHOLIC BEVERAGES', 'COFFEE', 'WINES', 'BEER', 
            'SPIRIT PER TOT', 'SPIRIT PER BOTTLE', 'CHAMPAGNE', 'COCKTAILS/MOCKTAILS'
        ];

        return in_array(strtoupper($categoryName), $drinkCategories) ? 'DRINKS' : 'FOOD';
    }

    /**
     * Parse price to ensure it's a valid number
     */
    private function parsePrice($price): float
    {
        if (is_numeric($price)) {
            return (float) $price;
        }
        
        // Handle string prices with currency symbols or commas
        if (is_string($price)) {
            return (float) preg_replace('/[^0-9.]/', '', $price);
        }
        
        return 0.0;
    }
}
