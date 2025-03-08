"use client"

import { Activity, Clock, MapPin, TrendingUp, Search, Filter, Calendar } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useEffect, useState } from "react"
import { StravaActivity } from "@/lib/strava-api"
import { Skeleton } from "@/components/ui/skeleton"

// Helper function to format seconds into HH:MM:SS or MM:SS format
function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
  
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Helper function to format meters to km
function formatDistance(meters: number): string {
  return (meters / 1000).toFixed(1);
}

// Helper function to calculate pace in min/km
function calculatePace(distanceMeters: number, timeSeconds: number): string {
  if (distanceMeters === 0 || timeSeconds === 0) return "-";
  
  const distanceKm = distanceMeters / 1000;
  const paceSeconds = timeSeconds / distanceKm;
  
  const paceMinutes = Math.floor(paceSeconds / 60);
  const paceRemainingSeconds = Math.floor(paceSeconds % 60);
  
  return `${paceMinutes}:${paceRemainingSeconds.toString().padStart(2, '0')}`;
}

// Helper function to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  });
}

// Map preview component
function MapPreview({ polyline, color = "#FF5500" }: { polyline?: string, color?: string }) {
  if (!polyline) {
    return (
      <div 
        className="h-32 w-full rounded-md overflow-hidden relative mb-3 bg-gray-100"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23${color.replace('#', '')}' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }}
      >
        <div 
          className="absolute inset-0 flex items-center justify-center"
          style={{ background: `linear-gradient(45deg, ${color}40, transparent)` }}
        >
          <div className="w-3/4 h-1/2 rounded-full" style={{ 
            border: `2px solid ${color}`,
            boxShadow: `0 0 10px ${color}80`
          }}></div>
        </div>
      </div>
    );
  }

  // TODO: Implement polyline rendering using a library like Leaflet or Google Maps
  // For now, we'll use the placeholder
  return (
    <div 
      className="h-32 w-full rounded-md overflow-hidden relative mb-3 bg-gray-100"
      style={{ 
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23${color.replace('#', '')}' fill-opacity='0.2' fill-rule='evenodd'/%3E%3C/svg%3E")`,
      }}
    >
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{ background: `linear-gradient(45deg, ${color}40, transparent)` }}
      >
        <div className="w-3/4 h-1/2 rounded-full" style={{ 
          border: `2px solid ${color}`,
          boxShadow: `0 0 10px ${color}80`
        }}></div>
      </div>
    </div>
  );
}

// Skeleton loader for runs
function RunSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gray-100 p-4">
        <div className="flex justify-between items-start">
          <Skeleton className="h-6 w-2/3" />
          <Skeleton className="h-5 w-16" />
        </div>
        <Skeleton className="h-4 w-1/3 mt-2" />
      </CardHeader>
      <CardContent className="p-4">
        <Skeleton className="h-32 w-full mb-3" />
        <div className="grid grid-cols-2 gap-4 mt-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-4 w-4" />
              <div>
                <Skeleton className="h-4 w-16 mb-1" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex justify-between items-center">
        <Skeleton className="h-5 w-14" />
        <Skeleton className="h-8 w-24" />
      </CardFooter>
    </Card>
  );
}

export default function StravaRuns() {
  const [activities, setActivities] = useState<StravaActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedDistance, setSelectedDistance] = useState("all");
  const [selectedDate, setSelectedDate] = useState("all");

  useEffect(() => {
    // Function to fetch Strava activities
    async function fetchActivities() {
      try {
        setLoading(true);
        const response = await fetch('/api/strava/activities');
        
        if (!response.ok) {
          throw new Error('Failed to fetch activities');
        }
        
        const data = await response.json();
        
        if (data.success && data.activities) {
          setActivities(data.activities);
        } else {
          throw new Error(data.error || 'Failed to fetch activities');
        }
      } catch (err) {
        console.error('Error fetching Strava activities:', err);
        setError('Failed to load activities. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    
    fetchActivities();
  }, []);

  // Filter activities based on search query and selected filters
  const filteredActivities = activities.filter(activity => {
    // Search filter
    if (searchQuery && !activity.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Type filter
    if (selectedType !== "all" && activity.type.toLowerCase() !== selectedType.toLowerCase()) {
      return false;
    }
    
    // Distance filter
    if (selectedDistance !== "all") {
      const distanceKm = activity.distance / 1000;
      if (selectedDistance === "short" && distanceKm > 5) return false;
      if (selectedDistance === "medium" && (distanceKm <= 5 || distanceKm > 10)) return false;
      if (selectedDistance === "long" && distanceKm <= 10) return false;
    }
    
    // Date filter
    if (selectedDate !== "all") {
      const activityDate = new Date(activity.start_date);
      const now = new Date();
      
      if (selectedDate === "week") {
        const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (activityDate < oneWeekAgo) return false;
      } else if (selectedDate === "month") {
        const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (activityDate < oneMonthAgo) return false;
      } else if (selectedDate === "year") {
        const oneYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        if (activityDate < oneYearAgo) return false;
      }
    }
    
    return true;
  });

  // Generate a color based on the activity name for consistency
  const getActivityColor = (name: string): string => {
    const colors = [
      "#FF5733", "#33A8FF", "#33FF57", "#9E33FF", "#FF33E9", "#FF8333",
      "#3358FF", "#33FFE0", "#FFB833", "#FF33A8", "#5733FF", "#FF5733"
    ];
    
    // Simple hash function to get consistent color for the same activity name
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Your Strava Runs</h2>
          <p className="text-muted-foreground">Select a run to customize</p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600">
          Connect Strava
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <label className="text-sm font-medium mb-1.5 block">Search Runs</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="text" 
                  placeholder="Search by title or location..." 
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="w-full md:w-48">
              <label className="text-sm font-medium mb-1.5 block">Run Type</label>
              <Select 
                defaultValue="all"
                onValueChange={setSelectedType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="run">Run</SelectItem>
                  <SelectItem value="virtualrun">Virtual Run</SelectItem>
                  <SelectItem value="ride">Ride</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-48">
              <label className="text-sm font-medium mb-1.5 block">Distance</label>
              <Select 
                defaultValue="all"
                onValueChange={setSelectedDistance}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Any distance" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any distance</SelectItem>
                  <SelectItem value="short">Short (0-5 km)</SelectItem>
                  <SelectItem value="medium">Medium (5-10 km)</SelectItem>
                  <SelectItem value="long">Long (10+ km)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="w-full md:w-48">
              <label className="text-sm font-medium mb-1.5 block">Date Range</label>
              <Select 
                defaultValue="all"
                onValueChange={setSelectedDate}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="week">Last week</SelectItem>
                  <SelectItem value="month">Last month</SelectItem>
                  <SelectItem value="year">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4">
            <p className="text-red-600">{error}</p>
            <Button 
              variant="outline" 
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          // Show skeleton loaders when loading
          Array.from({ length: 6 }).map((_, index) => (
            <RunSkeleton key={index} />
          ))
        ) : filteredActivities.length > 0 ? (
          // Show actual activities
          filteredActivities.map((activity) => {
            const activityColor = getActivityColor(activity.name);
            const pace = calculatePace(activity.distance, activity.moving_time);
            
            return (
              <Card key={activity.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardHeader className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-medium">{activity.name}</CardTitle>
                    <Badge variant="secondary" className="bg-white/20 hover:bg-white/30">
                      {activity.type}
                    </Badge>
                  </div>
                  <p className="text-sm opacity-90">{formatDate(activity.start_date)}</p>
                </CardHeader>
                <CardContent className="p-4">
                  <MapPreview
                    polyline={activity.map?.summary_polyline}
                    color={activityColor}
                  />
                  
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{formatDistance(activity.distance)} km</p>
                        <p className="text-xs text-muted-foreground">Distance</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{formatDuration(activity.moving_time)}</p>
                        <p className="text-xs text-muted-foreground">Duration</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">{Math.round(activity.total_elevation_gain)} m</p>
                        <p className="text-xs text-muted-foreground">Elevation</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <div className="overflow-hidden">
                        <p className="text-sm font-medium truncate">
                          {activity.timezone?.split('/').pop()?.replace('_', ' ') || 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground">Location</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between items-center">
                  <Badge variant="outline">{pace} /km</Badge>
                  <Button variant="default" size="sm" className="bg-orange-500 hover:bg-orange-600">
                    Customize
                  </Button>
                </CardFooter>
              </Card>
            );
          })
        ) : (
          // No activities match the filters
          <div className="col-span-full text-center p-8">
            <p className="text-muted-foreground mb-2">No activities found matching your filters.</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery("");
                setSelectedType("all");
                setSelectedDistance("all");
                setSelectedDate("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 