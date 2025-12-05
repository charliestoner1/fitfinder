"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import api from "@/lib/api/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { CloudRain, Cloud, Sun, Wind, Thermometer, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";

interface RecommendationItem {
  id: number;
  name: string;
  category: string;
  item_image: string;
  brand?: string;
  material?: string;
  tags?: Record<string, any>;
}

interface Recommendation {
  id: number;
  weather: string;
  occasion: string;
  temperature?: number;
  recommended_items: RecommendationItem[];
  compatibility_score: number;
  explanation: string;
  created_at: string;
}

const WEATHER_ICONS = {
  sunny: Sun,
  cloudy: Cloud,
  rainy: CloudRain,
  snowy: CloudRain,
  hot: Sun,
  cold: Wind,
};

const OCCASIONS = [
  "casual",
  "professional",
  "formal",
  "party",
  "date",
  "gym",
  "outdoor",
  "beach",
];

const WEATHER_OPTIONS = ["sunny", "cloudy", "rainy", "snowy", "hot", "cold"];

export default function RecommendationsPage() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedWeather, setSelectedWeather] = useState("sunny");
  const [selectedOccasion, setSelectedOccasion] = useState("casual");
  const [temperature, setTemperature] = useState<string>("");
  const [pastRecommendations, setPastRecommendations] = useState<Recommendation[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [savingRecommendations, setSavingRecommendations] = useState<Set<number>>(new Set());

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
    } else {
      fetchPastRecommendations();
    }
  }, [router]);

  const fetchPastRecommendations = async () => {
    try {
      const response = await api.get("/recommendations/");
      setPastRecommendations(response.data);
    } catch (err) {
      console.error("Failed to fetch past recommendations:", err);
    }
  };

  const generateRecommendation = async () => {
    setLoading(true);
    setError(null);

    try {
      const payload: any = {
        weather: selectedWeather,
        occasion: selectedOccasion,
      };

      if (temperature) {
        payload.temperature = parseInt(temperature, 10);
      }

      const response = await api.post("/recommendations/generate/", payload);
      setRecommendations([response.data]);
      setPastRecommendations([response.data, ...pastRecommendations]);
    } catch (err: any) {
      console.error("Failed to generate recommendations:", err);
      setError(
        err.response?.data?.detail ||
          "Failed to generate recommendations. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const saveRecommendation = async (recommendation: Recommendation) => {
    try {
      setSavingRecommendations((prev) => new Set([...prev, recommendation.id]));
      
      // Create an outfit from the recommendation
      const outfitPayload = {
        name: `${recommendation.occasion
          .charAt(0)
          .toUpperCase()}${recommendation.occasion.slice(1)} Outfit - ${new Date().toLocaleDateString()}`,
        occasion: recommendation.occasion,
        items: recommendation.recommended_items.map((item) => ({
          clothing_item_id: item.id,
          layer: "base",
          position_x: 0,
          position_y: 0,
          size_width: 100,
          size_height: 100,
          rotation: 0,
          z_index: 0,
        })),
      };

      const response = await api.post("/outfits/", outfitPayload);
      
      if (response.status === 201 || response.status === 200) {
        toast.success("Recommendation saved to outfits!");
      }
    } catch (error) {
      console.error("Failed to save recommendation:", error);
      toast.error("Failed to save recommendation");
    } finally {
      setSavingRecommendations((prev) => {
        const updated = new Set(prev);
        updated.delete(recommendation.id);
        return updated;
      });
    }
  };

  const getWeatherIcon = (weather: string) => {
    const IconComponent = WEATHER_ICONS[weather as keyof typeof WEATHER_ICONS];
    return IconComponent ? <IconComponent className="w-5 h-5" /> : null;
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold flex items-center gap-3 mb-2" style={{ color: '#FFAEDA' }}>
            <Sparkles className="w-8 h-8" style={{ color: '#86B4FA' }} />
            Smart Outfit Recommendations
          </h1>
          <p className="text-slate-600">
            Get personalized outfit suggestions based on weather, occasion, and your wardrobe
          </p>
        </div>

        {/* Context Filters Card */}
        <Card className="mb-6 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wind className="w-5 h-5" />
              Recommendation Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Weather Select */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Weather
                </label>
                <Select value={selectedWeather} onValueChange={setSelectedWeather}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select weather" />
                  </SelectTrigger>
                  <SelectContent className="bg-white !bg-white bg-opacity-100">
                    {WEATHER_OPTIONS.map((w) => (
                      <SelectItem key={w} value={w}>
                        <div className="flex items-center gap-2">
                          {getWeatherIcon(w)}
                          <span className="capitalize">{w}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Occasion Select */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Occasion
                </label>
                <Select
                  value={selectedOccasion}
                  onValueChange={setSelectedOccasion}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select occasion" />
                  </SelectTrigger>
                  <SelectContent className="bg-white !bg-white bg-opacity-100">
                    {OCCASIONS.map((o) => (
                      <SelectItem key={o} value={o}>
                        <span className="capitalize">{o}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Temperature Input */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  <div className="flex items-center gap-1">
                    <Thermometer className="w-4 h-4" />
                    Temperature (°C)
                  </div>
                </label>
                <Input
                  type="number"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  placeholder="Optional"
                  min="-40"
                  max="50"
                />
              </div>

              {/* Generate Button */}
              <div className="flex items-end">
                <Button
                  onClick={generateRecommendation}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {loading ? "Generating..." : "Get Recommendations"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Current Recommendation */}
        {recommendations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Today&apos;s Recommendation
            </h2>
            {recommendations.map((rec) => (
              <Card key={rec.id} className="shadow-lg border-blue-200 mb-6">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-3 mb-2">
                        <div className="flex items-center gap-2 text-2xl">
                          {getWeatherIcon(rec.weather)}
                          <span className="capitalize text-blue-600">
                            {rec.weather}
                          </span>
                        </div>
                        •
                        <span className="capitalize text-purple-600">
                          {rec.occasion}
                        </span>
                      </CardTitle>
                      {rec.temperature !== null && rec.temperature !== undefined && (
                        <p className="text-sm text-slate-600 mt-1">
                          🌡️ {rec.temperature}°C
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-blue-600">
                        {Math.round(rec.compatibility_score)}%
                      </div>
                      <p className="text-sm text-slate-600">Compatibility</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Explanation */}
                  <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-slate-800 leading-relaxed">
                      {rec.explanation}
                    </p>
                  </div>

                  {/* Recommended Items Grid */}
                  <div>
                    <h3 className="font-semibold text-slate-900 mb-3">
                      Recommended Items
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      {rec.recommended_items && rec.recommended_items.length > 0 ? (
                        rec.recommended_items.map((item) => (
                        <div
                          key={item.id}
                          className="border border-slate-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                        >
                          {item.item_image && (
                            <div className="relative w-full aspect-square bg-slate-100 overflow-hidden">
                              <img
                                src={
                                  item.item_image.startsWith("http")
                                    ? item.item_image
                                    : `http://localhost:8000${item.item_image}`
                                }
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )}
                          <div className="p-3">
                            <h4 className="font-medium text-slate-900 truncate">
                              {item.name}
                            </h4>
                            <p className="text-sm text-slate-600">
                              {item.category}
                            </p>
                            {item.brand && (
                              <p className="text-xs text-slate-500 mt-1">
                                {item.brand}
                              </p>
                            )}
                          </div>
                        </div>
                        ))
                      ) : (
                        <div className="col-span-full text-center text-slate-500 py-8">
                          <p>No items recommended for this outfit</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Recommendation Details */}
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-xs text-slate-600">
                        Generated on{" "}
                        {new Date(rec.created_at).toLocaleDateString()}{" "}
                        {new Date(rec.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                    <Button
                      onClick={() => saveRecommendation(rec)}
                      disabled={savingRecommendations.has(rec.id)}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      {savingRecommendations.has(rec.id) ? (
                        <>Saving...</>
                      ) : (
                        <>
                          <Check className="mr-2 h-4 w-4" />
                          Save to Outfits
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* History Toggle */}
        {pastRecommendations.length > 0 && (
          <div className="mb-6">
            <Button
              variant="outline"
              onClick={() => setShowHistory(!showHistory)}
              className="w-full"
            >
              {showHistory ? "Hide" : "Show"} Recommendation History (
              {pastRecommendations.length})
            </Button>
          </div>
        )}

        {/* Past Recommendations */}
        {showHistory && pastRecommendations.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-4">
              Recommendation History
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pastRecommendations.map((rec) => (
                <Card key={rec.id} className="shadow">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getWeatherIcon(rec.weather)}
                        <span className="capitalize">{rec.occasion}</span>
                      </div>
                      <span className="text-sm font-normal text-blue-600">
                        {Math.round(rec.compatibility_score)}%
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                      {rec.explanation}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(rec.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {recommendations.length === 0 && !showHistory && (
          <Card className="border-dashed">
            <CardContent className="pt-12 pb-12 text-center">
              <Sparkles className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-600 mb-2">
                No recommendations yet
              </h3>
              <p className="text-slate-500 mb-6">
                Select weather and occasion above, then click "Get Recommendations"
                to see personalized outfit suggestions.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
