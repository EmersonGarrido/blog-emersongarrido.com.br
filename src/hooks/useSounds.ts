'use client'

import { useCallback, useRef } from 'react'

// Sound frequencies and durations for different actions
const sounds = {
  like: {
    frequencies: [523.25, 659.25, 783.99], // C5, E5, G5 - happy chord
    durations: [0.1, 0.1, 0.15],
    type: 'sine' as OscillatorType,
    volume: 0.15
  },
  unlike: {
    frequencies: [392, 349.23], // G4, F4 - descending
    durations: [0.1, 0.15],
    type: 'sine' as OscillatorType,
    volume: 0.1
  },
  share: {
    frequencies: [440, 554.37, 659.25], // A4, C#5, E5 - ascending
    durations: [0.08, 0.08, 0.12],
    type: 'triangle' as OscillatorType,
    volume: 0.12
  },
  copy: {
    frequencies: [880, 1046.5], // A5, C6 - quick high
    durations: [0.05, 0.1],
    type: 'sine' as OscillatorType,
    volume: 0.1
  },
  success: {
    frequencies: [523.25, 659.25, 783.99, 1046.5], // C5, E5, G5, C6
    durations: [0.1, 0.1, 0.1, 0.2],
    type: 'sine' as OscillatorType,
    volume: 0.12
  },
  pop: {
    frequencies: [600],
    durations: [0.08],
    type: 'sine' as OscillatorType,
    volume: 0.08
  },
  click: {
    frequencies: [800],
    durations: [0.03],
    type: 'square' as OscillatorType,
    volume: 0.05
  }
}

export type SoundType = keyof typeof sounds

export function useSounds() {
  const audioContextRef = useRef<AudioContext | null>(null)

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  const playSound = useCallback((soundType: SoundType) => {
    try {
      const ctx = getAudioContext()
      const sound = sounds[soundType]

      if (ctx.state === 'suspended') {
        ctx.resume()
      }

      let startTime = ctx.currentTime

      sound.frequencies.forEach((freq, i) => {
        const oscillator = ctx.createOscillator()
        const gainNode = ctx.createGain()

        oscillator.type = sound.type
        oscillator.frequency.setValueAtTime(freq, startTime)

        gainNode.gain.setValueAtTime(sound.volume, startTime)
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + sound.durations[i])

        oscillator.connect(gainNode)
        gainNode.connect(ctx.destination)

        oscillator.start(startTime)
        oscillator.stop(startTime + sound.durations[i])

        startTime += sound.durations[i] * 0.7 // Overlap slightly
      })
    } catch (e) {
      // Silently fail if audio context is not available
      console.debug('Sound not available:', e)
    }
  }, [getAudioContext])

  return { playSound }
}
