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

    const NODE_COUNT = 60
    const nodes = Array.from({ length: NODE_COUNT }, () => {
      const rand = Math.random()
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 2.2 + 0.8,
        opacity: Math.random() * 0.55 + 0.25,
        color: rand > 0.65 ? 'emerald' : rand > 0.35 ? 'cyan' : 'blue'
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

        ctx.beginPath()
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        if (n.color === 'emerald') {
          ctx.fillStyle = dark
            ? `rgba(52,211,153,${n.opacity})`
            : `rgba(16,185,129,${n.opacity * 0.75})`
        } else if (n.color === 'cyan') {
          ctx.fillStyle = dark
            ? `rgba(34,211,238,${n.opacity})`
            : `rgba(6,182,212,${n.opacity * 0.75})`
        } else {
          ctx.fillStyle = dark
            ? `rgba(96,165,250,${n.opacity * 0.9})`
            : `rgba(37,99,235,${n.opacity * 0.65})`
        }
        ctx.fill()

        // Neural network connections between close nodes
        for (let j = i + 1; j < NODE_COUNT; j++) {
          const m = nodes[j]
          const dist = Math.hypot(n.x - m.x, n.y - m.y)
          if (dist < 130) {
            const alpha = (1 - dist / 130) * 0.25 * n.opacity
            ctx.beginPath()
            ctx.moveTo(n.x, n.y)
            ctx.lineTo(m.x, m.y)
            ctx.strokeStyle = dark
              ? `rgba(34,211,238,${alpha})`
              : `rgba(16,185,129,${alpha * 0.85})`
            ctx.lineWidth = 0.75
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

