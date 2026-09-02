import { useEffect, useRef } from 'react'

export default function AuthParticles({ dark }: { dark: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let animId: number

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const NODE_COUNT = 70
    const nodes = Array.from({ length: NODE_COUNT }, () => {
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.45,
        vy: (Math.random() - 0.5) * 0.45,
        r: Math.random() * 2.2 + 0.8,
        opacity: Math.random() * 0.55 + 0.25
      }
    })

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < NODE_COUNT; i++) {
        const n = nodes[i]
        n.x += n.vx
        n.y += n.vy
        if (n.x < 0 || n.x > canvas.width) n.vx *= -1
        if (n.y < 0 || n.y > canvas.height) n.vy *= -1

        // Subtle glow halo behind node
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r * 2.5, 0, Math.PI * 2)
        if (dark) {
          ctx.fillStyle = `rgba(34,211,238,${n.opacity * 0.15})`
        } else {
          // LIGHT THEME: BLACK PARTICLE HALO
          ctx.fillStyle = `rgba(0,0,0,${n.opacity * 0.22})`
        }
        ctx.fill()

        // Inner solid node
        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        if (dark) {
          ctx.fillStyle = `rgba(34,211,238,${n.opacity * 0.95})`
        } else {
          // LIGHT THEME: PURE BLACK SOLID NODE (#000000)
          ctx.fillStyle = `rgba(0,0,0,${n.opacity * 0.90})`
        }
        ctx.fill()

        // Neural network connections between close nodes
        for (let j = i + 1; j < NODE_COUNT; j++) {
          const m = nodes[j]
          const dist = Math.hypot(n.x - m.x, n.y - m.y)
          if (dist < 140) {
            const alpha = (1 - dist / 140) * 0.4 * n.opacity
            ctx.beginPath()
            ctx.moveTo(n.x, n.y)
            ctx.lineTo(m.x, m.y)
            ctx.strokeStyle = dark
              ? `rgba(34,211,238,${alpha})`
              : `rgba(0,0,0,${alpha * 1.8})` // LIGHT THEME: PURE BLACK CONNECTING NETWORK LINES
            ctx.lineWidth = 1.15
            ctx.stroke()
          }
        }
      }

      animId = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(animId)
    }
  }, [dark])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
    />
  )
}
