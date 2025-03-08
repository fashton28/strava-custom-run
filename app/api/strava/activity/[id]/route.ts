import { NextResponse } from 'next/server';
import { getStravaActivity } from '@/lib/strava-api';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const activityId = parseInt(params.id, 10);
    
    if (isNaN(activityId)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid activity ID'
        },
        { status: 400 }
      );
    }
    
    // Fetch detailed activity data
    const activity = await getStravaActivity(activityId);
    
    return NextResponse.json({
      success: true,
      activity
    });
  } catch (error) {
    console.error(`Error fetching Strava activity details:`, error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch Strava activity details' 
      },
      { status: 500 }
    );
  }
} 