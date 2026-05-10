"use client"

import * as React from "react"
import { Mic, Square } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type SpeechRecognitionEventLike = Event & {
  results: {
    length: number
    [index: number]: {
      isFinal: boolean
      [index: number]: {
        transcript: string
      }
    }
  }
}

type SpeechRecognitionLike = {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onend: (() => void) | null
  onerror: ((event: { error?: string }) => void) | null
  start: () => void
  stop: () => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike

function getSpeechRecognition() {
  if (typeof window === "undefined") return null

  const browserWindow = window as Window & {
    SpeechRecognition?: SpeechRecognitionConstructor
    webkitSpeechRecognition?: SpeechRecognitionConstructor
  }

  return browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition ?? null
}

export function VoiceInputButton({
  onTranscript,
  className,
  disabled,
}: {
  onTranscript: (transcript: string) => void
  className?: string
  disabled?: boolean
}) {
  const recognitionRef = React.useRef<SpeechRecognitionLike | null>(null)
  const [isListening, setIsListening] = React.useState(false)
  const [isSupported, setIsSupported] = React.useState(true)

  React.useEffect(() => {
    setIsSupported(Boolean(getSpeechRecognition()))
  }, [])

  React.useEffect(() => {
    return () => recognitionRef.current?.stop()
  }, [])

  const handleClick = () => {
    if (isListening) {
      recognitionRef.current?.stop()
      return
    }

    const SpeechRecognition = getSpeechRecognition()
    if (!SpeechRecognition) {
      setIsSupported(false)
      toast.error("Voice input is not supported in this browser")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = "en-US"
    recognitionRef.current = recognition

    let finalTranscript = ""

    recognition.onresult = (event) => {
      const phrases = Array.from({ length: event.results.length }, (_, index) => {
        const result = event.results[index]
        return result.isFinal ? result[0]?.transcript ?? "" : ""
      })

      finalTranscript = phrases.filter(Boolean).join(" ").trim()
    }

    recognition.onerror = () => {
      setIsListening(false)
      toast.error("Voice input stopped")
    }

    recognition.onend = () => {
      setIsListening(false)
      if (finalTranscript) {
        onTranscript(finalTranscript)
      }
    }

    try {
      recognition.start()
      setIsListening(true)
    } catch {
      setIsListening(false)
      toast.error("Voice input could not start")
    }
  }

  return (
    <></>
    // <Button
    //   type="button"
    //   variant={isListening ? "destructive" : "outline"}
    //   size="sm"
    //   disabled={disabled || !isSupported}
    //   onClick={handleClick}
    //   title={isListening ? "Stop voice input" : "Voice input"}
    //   className={cn("gap-2", className)}
    // >
    //   {isListening ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    //   {isListening ? "Listening" : "Voice fill"}
    // </Button>
  )
}
