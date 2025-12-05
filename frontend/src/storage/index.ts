import AsyncStorage from "@react-native-async-storage/async-storage";

export type WeightEntry = { date: string; weight: number };
export type FoodItem = {
  id: string;
  name: string;
  protein: number;
  carbs: number;
  fat: number;
  calories: number;
};
export type MealEntry = {
  date: string;
  type: "breakfast" | "lunch" | "dinner" | "snack";
  items: { foodId: string; grams: number }[];
};

const KEYS = {
  weights: "wj:weights",
  foods: "wj:foods",
  meals: "wj:meals",
};

export async function getWeights(): Promise<WeightEntry[]> {
  const raw = await AsyncStorage.getItem(KEYS.weights);
  return raw ? JSON.parse(raw) : [];
}
export async function saveWeights(list: WeightEntry[]) {
  await AsyncStorage.setItem(KEYS.weights, JSON.stringify(list));
}

export async function getFoods(): Promise<FoodItem[]> {
  const raw = await AsyncStorage.getItem(KEYS.foods);
  return raw ? JSON.parse(raw) : [];
}
export async function saveFoods(list: FoodItem[]) {
  await AsyncStorage.setItem(KEYS.foods, JSON.stringify(list));
}

export async function getMeals(): Promise<MealEntry[]> {
  const raw = await AsyncStorage.getItem(KEYS.meals);
  return raw ? JSON.parse(raw) : [];
}
export async function saveMeals(list: MealEntry[]) {
  await AsyncStorage.setItem(KEYS.meals, JSON.stringify(list));
}
