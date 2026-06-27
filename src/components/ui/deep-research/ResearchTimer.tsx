"use client"

import { useEffect, useState } from "react"
import { useDeepResearchStore } from "@/store/deepResearch"
import { Clock, Database, FileCheck2 } from "lucide-react"

function ResearchTimer() {
  const { report, isCompleted, activities } = useDeepResearchStore()
  const [elapsedTime, setElapsedTime] = useState(0)

  useEffect(() => {
    // Reset elapsed time when activities are reset
    if (activities.length <= 0) {
      setElapsedTime(0);
      return;
    }
    
    if (report.length > 10) return;
    
    const startTime = Date.now()
    const timer = setInterval(() => {
      setElapsedTime(Date.now() - startTime)
    }, 16)

    return () => clearInterval(timer)
  }, [report, isCompleted, activities])

  if (activities.length <= 0) return null

  const seconds = Math.floor(elapsedTime / 1000)
  const milliseconds = elapsedTime % 1000

  const timeLabel = seconds > 60
    ? `${Math.floor(seconds / 60)}m ${seconds % 60 > 0 ? `${(seconds % 60).toString().padStart(2, '0')}s` : ''}`
    : `${seconds}.${milliseconds.toString().padStart(3, '0')}s`;

  return (
    <section className="glass-panel grid gap-3 rounded-lg p-4 sm:grid-cols-3 sm:items-stretch">
      <div className="flex items-center gap-2 rounded bg-[#282a2e] p-3">
        <Clock className="h-4 w-4 text-[#00daf3]" />
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#bac9cc]">Elapsed</p>
          <p className="font-mono text-lg text-[#e2e2e8]">{timeLabel}</p>
        </div>
      </div>
      <div className="contents">
        <div className="rounded bg-[#282a2e] p-3">
          <Database className="h-4 w-4 text-muted-foreground" />
          <p className="mt-2 text-lg font-semibold text-[#e2e2e8]">{activities.length}</p>
          <p className="font-mono text-[10px] uppercase text-[#bac9cc]">events</p>
        </div>
        <div className="rounded bg-[#282a2e] p-3">
          <FileCheck2 className="h-4 w-4 text-muted-foreground" />
          <p className="mt-2 text-lg font-semibold text-[#e2e2e8]">{report ? "1" : "0"}</p>
          <p className="font-mono text-[10px] uppercase text-[#bac9cc]">reports</p>
        </div>
      </div>
    </section>
  )
} 
export default ResearchTimer
