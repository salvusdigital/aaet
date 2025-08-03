<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class CategoryStructureSeeder extends Seeder
{
    /**
     * Define category groups and their sort order
     */
    private array $categoryGroups = [
        'FOOD' => [
            'STARTERS',
            'PEPPER SOUP (NATIONAL)',
            'PEPPER SOUP (CONTINENTAL)',
            'NIGERIAN DISH',
            'GRILLS',
            'CONTINENTAL',
            'SANDWICH/BURGER',
            'PIZZA',
            'CHINESE CUISINE',
            'INDIAN CUISINE',
            'PASTA',
            'DESSERT',
            'SNACKS',
            'KIDS MENU',
            'EXTRAS'
        ],
        'DRINKS' => [
            'NON ALCOHOLIC BEVERAGES',
            'COFFEE',
            'WINES',
            'BEER',
            'SPIRIT PER TOT',
            'SPIRIT PER BOTTLE',
            'CHAMPAGNE',
            'COCKTAILS/MOCKTAILS'
        ]
    ];

    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Start a database transaction
        DB::beginTransaction();

        try {
            // 1. Remove all parent categories (if any)
            // Category::query()->update(['parent_id' => null]);

            // 2. Get all existing categories
            $existingCategories = Category::all()->keyBy(function ($category) {
                return strtoupper($category->name);
            });

            // 3. Update categories with new groups and sort orders
            $this->command->info('Updating category groups and sort orders...');
            
            // Process FOOD group
            $this->updateCategoriesForGroup('FOOD', $existingCategories);
            
            // Process DRINKS group
            $this->updateCategoriesForGroup('DRINKS', $existingCategories);

            // 4. Verify the updates
            $this->verifyCategoryStructure();

            DB::commit();
            $this->command->info('Category structure updated successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            $this->command->error('Error updating category structure: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Update categories for a specific group
     */
    private function updateCategoriesForGroup(string $group, $existingCategories): void
    {
        $sortOrder = 1;
        
        foreach ($this->categoryGroups[$group] as $categoryName) {
            $normalizedName = strtoupper($categoryName);
            
            if ($existingCategories->has($normalizedName)) {
                $category = $existingCategories[$normalizedName];
                $category->update([
                    'group' => $group,
                    'sort_order' => $sortOrder++,
                ]);
            } else {
                $this->command->warn("Category not found: {$categoryName}");
            }
        }
    }

    /**
     * Verify the category structure after updates
     */
    private function verifyCategoryStructure(): void
    {
        $this->command->info('\nVerifying category structure...');

        $categories = Category::query()
            ->select(['name', 'group', 'sort_order'])
            ->orderBy('group')
            ->orderBy('sort_order')
            ->get()
            ->groupBy('group');

        $this->command->info('\nCategory Structure:');
        
        foreach ($categories as $group => $groupedCategories) {
            $this->command->info("\n[{$group}]");
            
            foreach ($groupedCategories as $category) {
                $this->command->info("  - {$category->name} (Order: {$category->sort_order})");
            }
        }

        // Check for any remaining parent categories
        // $remainingParents = Category::whereNotNull('parent_id')->count();
        // if ($remainingParents > 0) {
        //     $this->command->warn("\nWarning: Found {$remainingParents} categories with parent relationships");
        // }
    }
}
