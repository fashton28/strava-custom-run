/**
 * Strava API integration
 * This file contains functions to interact with the Strava API
 */

// Types for Strava API responses
export interface StravaActivity {
  id: number;
  name: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  type: string;
  sport_type: string;
  start_date: string;
  start_date_local: string;
  timezone: string;
  start_latlng: [number, number];
  end_latlng: [number, number];
  achievement_count: number;
  kudos_count: number;
  comment_count: number;
  athlete_count: number;
  photo_count: number;
  map: {
    id: string;
    summary_polyline: string;
    polyline?: string;
  };
  trainer: boolean;
  commute: boolean;
  manual: boolean;
  private: boolean;
  flagged: boolean;
  workout_type: number | null;
  average_speed: number;
  max_speed: number;
  has_heartrate: boolean;
  average_heartrate: number | null;
  max_heartrate: number | null;
  // Add any other fields you need
}

export interface StravaTokenResponse {
  token_type: string;
  access_token: string;
  expires_at: number;
  expires_in: number;
  refresh_token: string;
}

// Configuration for Strava API
const STRAVA_API_BASE_URL = 'https://www.strava.com/api/v3';
const STRAVA_AUTH_URL = 'https://www.strava.com/oauth/token';

// Helper function to refresh the access token if it's expired
async function refreshStravaToken(): Promise<StravaTokenResponse> {
  // For testing/debugging, let's log what environment variables we have
  console.log('Refresh token available:', !!process.env.STRAVA_REFRESH_TOKEN);
  
  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing Strava API credentials');
  }

  try {
    const response = await fetch(STRAVA_AUTH_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Token refresh error response:', errorText);
      throw new Error(`Failed to refresh Strava token: ${response.statusText}`);
    }

    const data: StravaTokenResponse = await response.json();
    console.log('Successfully refreshed token, expires in:', data.expires_in);
    
    return data;
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
}

// For development/testing, let's use a mock API response to avoid API rate limits
// Remove this in production
const useMockData = true;

// Get a valid access token (refresh if needed)
async function getValidAccessToken(): Promise<string> {
  if (useMockData) {
    return "mock_token";
  }
  
  try {
    const currentToken = process.env.STRAVA_ACCESS_TOKEN;
    const tokenExpiry = process.env.STRAVA_TOKEN_EXPIRY;
    
    if (!currentToken) {
      throw new Error('Missing Strava access token');
    }
    
    // For debugging
    console.log('Token expiry:', tokenExpiry);
    
    // If token expiry is in the future, return the current token
    if (tokenExpiry && new Date(tokenExpiry) > new Date()) {
      console.log('Using existing token as it has not expired');
      return currentToken;
    }
    
    // Token has expired, refresh it
    console.log('Token expired, refreshing...');
    const newTokens = await refreshStravaToken();
    return newTokens.access_token;
  } catch (error) {
    console.error('Error getting valid access token:', error);
    throw error;
  }
}

// Mock data for development/testing
const mockActivities: StravaActivity[] = [
  {
    id: 1001,
    name: "Morning Run in Central Park",
    distance: 8200,
    moving_time: 2732,
    elapsed_time: 2800,
    total_elevation_gain: 124,
    type: "Run",
    sport_type: "Run",
    start_date: "2023-03-02T08:30:00Z",
    start_date_local: "2023-03-02T03:30:00Z",
    timezone: "America/New_York",
    start_latlng: [40.7812, -73.9665],
    end_latlng: [40.7812, -73.9665],
    achievement_count: 3,
    kudos_count: 12,
    comment_count: 2,
    athlete_count: 1,
    photo_count: 0,
    map: {
      id: "m1001",
      summary_polyline: "abc123",
    },
    trainer: false,
    commute: false,
    manual: false,
    private: false,
    flagged: false,
    workout_type: 0,
    average_speed: 3.0,
    max_speed: 4.2,
    has_heartrate: true,
    average_heartrate: 152,
    max_heartrate: 175,
  },
  {
    id: 1002,
    name: "Evening Trail Run",
    distance: 12500,
    moving_time: 4815,
    elapsed_time: 5000,
    total_elevation_gain: 350,
    type: "Trail Run",
    sport_type: "Run",
    start_date: "2023-03-01T17:15:00Z",
    start_date_local: "2023-03-01T12:15:00Z",
    timezone: "America/New_York",
    start_latlng: [40.7123, -73.9874],
    end_latlng: [40.7123, -73.9874],
    achievement_count: 5,
    kudos_count: 18,
    comment_count: 3,
    athlete_count: 1,
    photo_count: 1,
    map: {
      id: "m1002",
      summary_polyline: "def456",
    },
    trainer: false,
    commute: false,
    manual: false,
    private: false,
    flagged: false,
    workout_type: 1,
    average_speed: 2.6,
    max_speed: 3.8,
    has_heartrate: true,
    average_heartrate: 158,
    max_heartrate: 182,
  },
  {
    id: 1003,
    name: "Weekend Long Run",
    distance: 21100,
    moving_time: 7102,
    elapsed_time: 7500,
    total_elevation_gain: 230,
    type: "Run",
    sport_type: "Run",
    start_date: "2023-02-26T09:00:00Z",
    start_date_local: "2023-02-26T04:00:00Z",
    timezone: "America/New_York",
    start_latlng: [40.7812, -74.0110],
    end_latlng: [40.7812, -74.0110],
    achievement_count: 8,
    kudos_count: 35,
    comment_count: 7,
    athlete_count: 1,
    photo_count: 2,
    map: {
      id: "m1003",
      summary_polyline: "ghi789",
    },
    trainer: false,
    commute: false,
    manual: false,
    private: false,
    flagged: false,
    workout_type: 2,
    average_speed: 2.97,
    max_speed: 4.1,
    has_heartrate: true,
    average_heartrate: 155,
    max_heartrate: 178,
  }
];

// Fetch athlete activities from Strava
export async function getStravaActivities(page: number = 1, perPage: number = 30): Promise<StravaActivity[]> {
  if (useMockData) {
    console.log('Using mock data instead of calling Strava API');
    return mockActivities;
  }
  
  try {
    const accessToken = await getValidAccessToken();
    console.log('Got access token for activities request:', accessToken.substring(0, 5) + '...');
    
    const response = await fetch(
      `${STRAVA_API_BASE_URL}/athlete/activities?page=${page}&per_page=${perPage}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        // Add cache: 'no-store' to prevent Next.js from caching the response
        cache: 'no-store',
      }
    );

    console.log('Strava API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Strava API error response:', errorText);
      throw new Error(`Failed to fetch Strava activities: ${response.statusText}`);
    }

    const activities: StravaActivity[] = await response.json();
    console.log(`Fetched ${activities.length} activities successfully`);
    return activities;
  } catch (error) {
    console.error('Error fetching Strava activities:', error);
    throw error;
  }
}

// Get detailed information for a specific activity
export async function getStravaActivity(activityId: number): Promise<StravaActivity> {
  if (useMockData) {
    const activity = mockActivities.find(a => a.id === activityId);
    if (!activity) {
      throw new Error('Activity not found');
    }
    return activity;
  }
  
  try {
    const accessToken = await getValidAccessToken();
    
    const response = await fetch(
      `${STRAVA_API_BASE_URL}/activities/${activityId}?include_all_efforts=true`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Strava activity API error response:', errorText);
      throw new Error(`Failed to fetch Strava activity: ${response.statusText}`);
    }

    const activity: StravaActivity = await response.json();
    return activity;
  } catch (error) {
    console.error(`Error fetching Strava activity ${activityId}:`, error);
    throw error;
  }
} 