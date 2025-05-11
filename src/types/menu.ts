// Menu-related types and enums

// Dietary restriction types
export enum DietaryRestriction {
  VEGETARIAN = 'VEGETARIAN',
  VEGAN = 'VEGAN',
  GLUTEN_FREE = 'GLUTEN_FREE',
  DAIRY_FREE = 'DAIRY_FREE',
  NUT_FREE = 'NUT_FREE',
  HALAL = 'HALAL',
  KOSHER = 'KOSHER',
}

// Spicy level labels
export const SpicyLevelLabels: Record<number, string> = {
  0: 'Not Spicy',
  1: 'Mild',
  2: 'Medium',
  3: 'Hot',
  4: 'Very Hot',
  5: 'Extreme',
};

// Dietary restriction labels
export const DietaryRestrictionLabels: Record<DietaryRestriction, string> = {
  [DietaryRestriction.VEGETARIAN]: 'Vegetarian',
  [DietaryRestriction.VEGAN]: 'Vegan',
  [DietaryRestriction.GLUTEN_FREE]: 'Gluten Free',
  [DietaryRestriction.DAIRY_FREE]: 'Dairy Free',
  [DietaryRestriction.NUT_FREE]: 'Nut Free',
  [DietaryRestriction.HALAL]: 'Halal',
  [DietaryRestriction.KOSHER]: 'Kosher',
};

// Dietary restriction icons (for UI display)
export const DietaryRestrictionIcons: Record<DietaryRestriction, string> = {
  [DietaryRestriction.VEGETARIAN]: '🥦',
  [DietaryRestriction.VEGAN]: '🌱',
  [DietaryRestriction.GLUTEN_FREE]: '🌾',
  [DietaryRestriction.DAIRY_FREE]: '🥛',
  [DietaryRestriction.NUT_FREE]: '🥜',
  [DietaryRestriction.HALAL]: '☪️',
  [DietaryRestriction.KOSHER]: '✡️',
};

// Common allergens
export const CommonAllergens = [
  'Milk',
  'Eggs',
  'Fish',
  'Shellfish',
  'Tree nuts',
  'Peanuts',
  'Wheat',
  'Soybeans',
  'Sesame',
];

// Menu item type (for categorization)
export enum MenuItemType {
  APPETIZER = 'APPETIZER',
  MAIN_COURSE = 'MAIN_COURSE',
  SIDE_DISH = 'SIDE_DISH',
  DESSERT = 'DESSERT',
  BEVERAGE = 'BEVERAGE',
  SPECIAL = 'SPECIAL',
}

// Menu item type labels
export const MenuItemTypeLabels: Record<MenuItemType, string> = {
  [MenuItemType.APPETIZER]: 'Appetizer',
  [MenuItemType.MAIN_COURSE]: 'Main Course',
  [MenuItemType.SIDE_DISH]: 'Side Dish',
  [MenuItemType.DESSERT]: 'Dessert',
  [MenuItemType.BEVERAGE]: 'Beverage',
  [MenuItemType.SPECIAL]: 'Special',
};
