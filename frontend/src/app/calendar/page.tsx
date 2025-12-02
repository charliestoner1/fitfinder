// src/app/calendar/page.tsx
// Calendar page to view scheduled outfits

'use client';

import { useEffect, useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday } from 'date-fns';
import { Navbar } from '@/components/navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import apiClient from '@/lib/api/client';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface ScheduledOutfit {
  id: number;
  name: string;
  occasion?: string;
  season?: string;
  scheduled_date: string;
  preview_image_url?: string;
}

export default function CalendarPage() {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [scheduledOutfits, setScheduledOutfits] = useState<ScheduledOutfit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchScheduledOutfits = async () => {
    try {
      setIsLoading(true);
      const response = await apiClient.get('/outfits/scheduled/');
      setScheduledOutfits(response.data);
    } catch (error) {
      console.error('Error fetching scheduled outfits:', error);
      toast.error('Failed to load scheduled outfits');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchScheduledOutfits();
  }, []);

  const getDaysInMonth = () => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  };

  const getOutfitsForDate = (date: Date) => {
    return scheduledOutfits.filter((outfit) => {
      // Parse the date string and treat it as local date (not UTC)
      const dateString = outfit.scheduled_date.split('T')[0]; // Get "2025-12-25" part
      const [year, month, day] = dateString.split('-').map(Number);
      const outfitDate = new Date(year, month - 1, day); // month is 0-indexed in JS
      
      return (
        outfitDate.getDate() === date.getDate() &&
        outfitDate.getMonth() === date.getMonth() &&
        outfitDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const days = getDaysInMonth();
  const firstDay = days[0];
  const emptyDays = firstDay.getDay();
  const monthName = format(currentDate, 'MMMM yyyy');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="container mx-auto py-8 flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500">Loading your calendar...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold" style={{ color: '#FFAEDA' }}>Outfit Calendar</h1>
          <p className="text-slate-600 mt-2">
            View and manage your scheduled outfits
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle>{monthName}</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrevMonth}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextMonth}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* Day headers */}
                <div className="grid grid-cols-7 gap-2 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="text-center font-semibold text-sm text-gray-600 py-2">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Empty cells for days before month starts */}
                <div className="grid grid-cols-7 gap-2">
                  {Array(emptyDays)
                    .fill(null)
                    .map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square" />
                    ))}

                  {/* Days of month */}
                  {days.map((day: Date) => {
                    const outfitsForDay = getOutfitsForDate(day);
                    const dayIsToday = isToday(day);
                    const dayIsSameMonth = isSameMonth(day, currentDate);

                    return (
                      <div
                        key={day.toISOString()}
                        className={`aspect-square p-2 rounded-lg border-2 transition-colors ${
                          dayIsToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                        } ${!dayIsSameMonth ? 'opacity-50' : ''}`}
                      >
                        <div className="text-sm font-semibold mb-1">{day.getDate()}</div>
                        <div className="space-y-1">
                          {outfitsForDay.slice(0, 2).map((outfit) => (
                            <button
                              key={outfit.id}
                              onClick={() => router.push(`/outfit-builder?edit=${outfit.id}`)}
                              className="block w-full text-left text-xs bg-indigo-100 text-indigo-700 px-1 py-0.5 rounded truncate hover:bg-indigo-200 transition-colors"
                              title={outfit.name}
                            >
                              {outfit.name}
                            </button>
                          ))}
                          {outfitsForDay.length > 2 && (
                            <div className="text-xs text-gray-500 px-1">
                              +{outfitsForDay.length - 2} more
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Scheduled Outfits List */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Outfits</CardTitle>
              </CardHeader>
              <CardContent>
                {scheduledOutfits.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p className="text-sm">No outfits scheduled yet</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => router.push('/outfit-builder')}
                    >
                      Create Outfit
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {scheduledOutfits
                      .sort((a, b) => {
                        const dateA = a.scheduled_date.split('T')[0];
                        const dateB = b.scheduled_date.split('T')[0];
                        return dateA.localeCompare(dateB);
                      })
                      .map((outfit) => {
                        // Parse date as local date
                        const dateString = outfit.scheduled_date.split('T')[0];
                        const [year, month, day] = dateString.split('-').map(Number);
                        const localDate = new Date(year, month - 1, day);
                        
                        return (
                          <div
                            key={outfit.id}
                            onClick={() => router.push(`/outfit-builder?edit=${outfit.id}`)}
                            className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                          >
                            <div className="font-semibold text-sm truncate">{outfit.name}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              {format(localDate, 'MMM d, yyyy')}
                            </div>
                            {outfit.occasion && (
                              <div className="text-xs text-gray-600 mt-1 capitalize">
                                {outfit.occasion}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
