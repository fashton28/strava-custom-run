import { Suspense } from "react"
import RunCustomizer from "@/components/run-customizer"
import StravaRuns from "@/components/strava-runs"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  return (
    <main className="container mx-auto py-10 px-4 md:px-6">
      <div className="flex flex-col items-center text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Strava Run Customizer</h1>
        <p className="text-muted-foreground max-w-2xl">
          Customize your Strava runs with different colors, rotations, fonts, and more. Create beautiful
          visualizations of your running achievements.
        </p>
      </div>

      <Tabs defaultValue="runs" className="max-w-6xl mx-auto">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="runs">My Runs</TabsTrigger>
          <TabsTrigger value="customize">Customize</TabsTrigger>
        </TabsList>
        <TabsContent value="runs">
          <Card>
            <CardHeader>
              <CardTitle>Your Strava Runs</CardTitle>
              <CardDescription>Browse your recent runs and select one to customize.</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading your runs...</div>}>
                <StravaRuns />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="customize">
          <Card>
            <CardHeader>
              <CardTitle>Customize Your Run</CardTitle>
              <CardDescription>
                Adjust colors, rotation, fonts, and other settings to personalize your run visualization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<div>Loading customizer...</div>}>
                <RunCustomizer />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}

