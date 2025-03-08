import { NextResponse } from 'next/server';
import { getStravaActivities } from '@/lib/strava-api';

export async function GET(request: Request) {
  try {
    // Extract query parameters like page and perPage if needed
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const perPage = parseInt(searchParams.get('perPage') || '30', 10);
    
    // Fetch activities from Strava API
    const activities = await getStravaActivities(page, perPage);
    
    // Return formatted activities
    return NextResponse.json({ 
      success: true, 
      activities 
    });
  } catch (error) {
    console.error('Error in Strava activities API route:', error);
    
    let errorMessage = 'Failed to fetch Strava activities';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
} 