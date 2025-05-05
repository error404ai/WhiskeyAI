"use client"

import { useEffect, useRef } from "react"

interface Particle {
    x: number
    y: number
    size: number
    baseSize: number
    color: string
    vx: number
    vy: number
    originX: number
    originY: number
}

export default function MouseFlowEffect() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const particlesRef = useRef<Particle[]>([])
    const mouseRef = useRef({ x: 0, y: 0, radius: 100 })
    // const animationRef = useRef<number>()
    const animationRef = useRef<number | null>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Set canvas to full screen
        const handleResize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight

            // Recreate particles on resize
            initParticles()
        }

        // Create particles
        const initParticles = () => {
            const particles: Particle[] = []
            const particleCount = 100 // Reduced count since we have stars too

            for (let i = 0; i < particleCount; i++) {
                const x = Math.random() * canvas.width
                const y = Math.random() * canvas.height
                const baseSize = Math.random() * 1.5 + 0.5 // Smaller particles

                particles.push({
                    x,
                    y,
                    size: baseSize,
                    baseSize,
                    color: `rgba(255, 255, 255, ${Math.random() * 0.4 + 0.2})`, // More transparent
                    vx: 0,
                    vy: 0,
                    originX: x,
                    originY: y
                })
            }

            particlesRef.current = particles
        }

        // Handle mouse movement
        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current.x = e.clientX
            mouseRef.current.y = e.clientY
        }

        // Handle mouse leave
        const handleMouseLeave = () => {
            mouseRef.current.x = -1000
            mouseRef.current.y = -1000
        }

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Update and draw particles
            particlesRef.current.forEach(particle => {
                // Calculate distance from mouse
                const dx = mouseRef.current.x - particle.x
                const dy = mouseRef.current.y - particle.y
                const distance = Math.sqrt(dx * dx + dy * dy)
                const maxDistance = mouseRef.current.radius

                // If mouse is close enough, apply force towards mouse
                if (distance < maxDistance) {
                    // Force gets stronger as particle gets closer to mouse
                    const force = (maxDistance - distance) / maxDistance

                    // Apply force towards mouse
                    particle.vx += dx * force * 0.02
                    particle.vy += dy * force * 0.02

                    // Increase size based on proximity to mouse
                    particle.size = particle.baseSize + (particle.baseSize * 2 * force)
                } else {
                    // Return to original position when not influenced by mouse
                    const dx = particle.originX - particle.x
                    const dy = particle.originY - particle.y

                    particle.vx += dx * 0.01
                    particle.vy += dy * 0.01

                    // Return to original size
                    particle.size = particle.baseSize + (particle.size - particle.baseSize) * 0.9
                }

                // Apply friction
                particle.vx *= 0.9
                particle.vy *= 0.9

                // Update position
                particle.x += particle.vx
                particle.y += particle.vy

                // Draw particle
                ctx.beginPath()
                ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
                ctx.fillStyle = particle.color
                ctx.fill()
            })

            animationRef.current = requestAnimationFrame(animate)
        }

        // Initialize
        handleResize()
        window.addEventListener("resize", handleResize)
        window.addEventListener("mousemove", handleMouseMove)
        window.addEventListener("mouseleave", handleMouseLeave)

        // Start animation
        animationRef.current = requestAnimationFrame(animate)

        // Cleanup
        return () => {
            window.removeEventListener("resize", handleResize)
            window.removeEventListener("mousemove", handleMouseMove)
            window.removeEventListener("mouseleave", handleMouseLeave)
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
        }
    }, [])

    // Use a higher z-index than MovingSky but still behind content
    return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none -z-5" />
}