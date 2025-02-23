"use client"

import { useState } from "react"
import { MapContainer } from "@/components/map-container"
import { Header } from "@/components/header"
import { ChatPanel } from "@/components/chat-panel"
import { FleetModal } from "@/components/fleet-modal"
import { RouteModal } from "@/components/route-modal"
import { SettingsModal } from "@/components/settings-modal"

export default function HomePage() {
  const [showSettings, setShowSettings] = useState(false)
  const [showFleetModal, setShowFleetModal] = useState(false)
  const [showRouteModal, setShowRouteModal] = useState(false)

  return (
    <div className="min-h-screen flex flex-col">
      <Header 
        onSettingsClick={() => setShowSettings(true)}
      />
      
      <main className="flex-1 container mx-auto p-4 flex gap-4 bg-background">
        <MapContainer className="w-2/3" />
        <ChatPanel className="w-1/3" />
      </main>

      <SettingsModal 
        open={showSettings}
        onOpenChange={setShowSettings}
      />
      
      <FleetModal
        open={showFleetModal}
        onOpenChange={setShowFleetModal}
      />

      <RouteModal
        open={showRouteModal}
        onOpenChange={setShowRouteModal}
      />
    </div>
  )
} 