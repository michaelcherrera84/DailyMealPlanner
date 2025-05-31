"use client";

import {useMutation} from "@tanstack/react-query";
import {Spinner} from "@/components/spinner";

interface MealPlanInput {
    dietType: string;
    calories: number;
    allergies: string;
    cuisine: string;
    snacks: string;
    days?: number;
}

interface DailyMealPlan {
    Breakfast?: string;
    Lunch?: string;
    Dinner?: string;
    Snacks?: string;
}

interface WeeklyMealPlan {
    [day: string]: DailyMealPlan;
}

interface MealPlanResponse {
    mealPlan?: WeeklyMealPlan;
    error?: string;
}

async function generateMealPlan(payload: MealPlanInput) {
    const response = await fetch("/api/generate-meal-plan", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload)
    });

    return response.json();
}

export default function MealPlanDashboard() {

    const {mutate, isPending, data, isSuccess} = useMutation<MealPlanResponse, Error, MealPlanInput>({
        mutationFn: generateMealPlan,

    });

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        const payload: MealPlanInput = {
            dietType: formData.get("dietType")?.toString() || "",
            calories: Number(formData.get("calories")) || 2000,
            allergies: formData.get("allergies")?.toString() || "",
            cuisine: formData.get("cuisine")?.toString() || "",
            snacks: formData.get("snacks")?.toString() || "",
            days: 7,
        };

        mutate(payload);
    }

    const daysOfTheWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    const getMealPlanForDay = (day: string): DailyMealPlan | undefined => {
        if (!data?.mealPlan) return undefined;
        return data?.mealPlan[day];
    }

    return (
        <div className="mt-14 items-center justify-center p-4">
            <div className="w-full max-w-6xl flex flex-col md:flex-row bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="w-full md:w-1/3 lg:w-1/4 p-6 bg-emerald-500 text-white">
                    <h1 className="text-2xl font-bold mb-6 text-center">AI Meal Plan Generator</h1>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label
                                htmlFor="dietType"
                                className="block mb-1 text-sm font-medium"
                            >
                                Diet Type
                            </label>
                            <input
                                type="text"
                                id="dietType"
                                name="dietType"
                                required
                                placeholder="Vegan, Vegetarian..."
                                className="bg-white w-full px-3 py-2 border border-emerald-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="calories"
                                className="block text-sm font-medium mb-1"
                            >
                                Daily Calorie Goal
                            </label>
                            <input
                                type="number"
                                id="calories"
                                name="calories"
                                required
                                min={500}
                                max={15000}
                                placeholder="2000"
                                className="bg-white w-full px-3 py-2 border border-emerald-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="allergies"
                                className="block text-sm font-medium mb-1"
                            >
                                Allergies
                            </label>
                            <input
                                type="text"
                                id="allergies"
                                name="allergies"
                                required
                                placeholder="Nuts, Dairy, None..."
                                className="bg-white w-full px-3 py-2 border border-emerald-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="cuisine"
                                className="block text-sm font-medium mb-1"
                            >
                                Preferred Cuisine
                            </label>
                            <input
                                type="text"
                                id="cuisine"
                                name="cuisine"
                                required
                                placeholder="Italian, Chinese, No Preference..."
                                className="bg-white w-full px-3 py-2 border border-emerald-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-emerald-400"
                            />
                        </div>

                        <div>
                            <input
                                type="checkbox"
                                id="snacks"
                                name="snacks"
                                className="h-4 w-4 text-emerald-300 border-emerald-300 rounded"
                            />
                            <label htmlFor="snacks" className="ml-2 block text-sm text-white">Include Snacks</label>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full bg-emerald-500 text-white py-2 px-4 rounded-md hover:bg-emerald-600 transition-colors"
                                // className={`w-full bg-emerald-500 text-white py-2 px-4 rounded-md hover:bg-emerald-600 transition-colors ${
                                //     mutation.isPending ? "opacity-50 cursor-not-allowed" : ""
                                // }`}
                            >
                                {isPending ? "Generating..." : "Generate Meal Plan"}
                            </button>
                        </div>
                    </form>
                </div>
                <div className="w-full md:w-2/3 lg:w-3/4 p-6 bg-gray-50">
                    <h2 className="text-2xl font-bold mb-6 text-emerald-700">Weekly Meal Plan</h2>

                    {data?.mealPlan && isSuccess ? (
                        <div className="h-[600px] overflow-y-auto">
                            <div className="space-y-6">
                                {daysOfTheWeek.map((day, key) => {
                                    const mealPlan = getMealPlanForDay(day);
                                    return (
                                        <div
                                            key={key}
                                            className="bg-white shadow-md rounded-lg p-4 border border-emerald-200"
                                        >
                                            <h3 className="text-xl font-semibold mb-2 text-emerald-600">{day}</h3>
                                            {mealPlan ? (
                                                <div className="space-y-2">
                                                    <div>
                                                        <strong>Breakfast:</strong> {mealPlan.Breakfast}
                                                    </div>
                                                    <div>
                                                        <strong>Lunch:</strong> {mealPlan.Lunch}
                                                    </div>
                                                    <div>
                                                        <strong>Dinner:</strong> {mealPlan.Dinner}
                                                    </div>
                                                    <div>
                                                        <strong>Snacks:</strong> {mealPlan.Snacks}
                                                    </div>
                                                </div>
                                            ) : (<p className="text-gray-500">No meal plan available.</p>)}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : isPending ? (
                        <div className="flex justify-center items-center h-full">
                            <Spinner/>
                        </div>
                    ) : (
                        <p className="text-gray-600">Please generate a meal plan to see it here.</p>
                    )}
                </div>
            </div>
        </div>
    );
}