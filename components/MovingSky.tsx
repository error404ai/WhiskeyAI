"use client"

import { useEffect, useRef } from "react"

interface Star {
    x: number
    y: number
    size: number
    speed: number
    opacity: number
}

export default function MovingSky() {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const starsRef = useRef<Star[]>([])
    // const animationRef = useRef<number>()
    const animationRef = useRef<number | null>(null)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return

        const ctx = canvas.getContext("2d")
        if (!ctx) return

        // Create a gradient background
        const createGradient = () => {
            const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
            gradient.addColorStop(0, "#000000")
            gradient.addColorStop(1, "#0a1128")
            return gradient
        }

        // Set canvas to full screen
        const handleResize = () => {
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight

            // Create stars on resize
            createStars()
        }

        // Create stars
        const createStars = () => {
            const stars: Star[] = []
            // Adjust star count based on screen size
            const starCount = Math.min(200, Math.floor((canvas.width * canvas.height) / 3000))

            for (let i = 0; i < starCount; i++) {
                stars.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: Math.random() * 1.5,
                    speed: Math.random() * 0.2 + 0.05,
                    opacity: Math.random() * 0.8 + 0.2,
                })
            }

            starsRef.current = stars
        }

        // Animation loop
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height)

            // Draw gradient background
            ctx.fillStyle = createGradient()
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            // Draw and update stars
            starsRef.current.forEach((star) => {
                ctx.beginPath()
                ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)
                ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`
                ctx.fill()

                // Move star
                star.y += star.speed

                // Reset star position if it goes off screen
                if (star.y > canvas.height) {
                    star.y = 0
                    star.x = Math.random() * canvas.width
                }
            })

            animationRef.current = requestAnimationFrame(animate)
        }

        // Initialize
        handleResize()
        window.addEventListener("resize", handleResize)

        // Start animation
        animationRef.current = requestAnimationFrame(animate)

        // Cleanup
        return () => {
            window.removeEventListener("resize", handleResize)
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current)
            }
        }
    }, [])

    return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full pointer-events-none -z-10" />
}
