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

    const NODE_COUNT = 44
    const nodes = Array.from({ length: NODE_COUNT }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.8 + 0.6,
      opacity: Math.random() * 0.5 + 0.2,
    }))

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
        ctx.fillStyle = dark
          ? `rgba(52,211,153,${n.opacity})`
          : `rgba(16,185,129,${n.opacity * 0.7})`
        ctx.fill()

        for (let j = i + 1; j < NODE_COUNT; j++) {
          const m = nodes[j]
          const dist = Math.hypot(n.x - m.x, n.y - m.y)
          if (dist < 110) {
            const alpha = (1 - dist / 110) * 0.18 * n.opacity
            ctx.beginPath()
            ctx.moveTo(n.x, n.y)
            ctx.lineTo(m.x, m.y)
            ctx.strokeStyle = dark
              ? `rgba(96,165,250,${alpha})`
              : `rgba(59,130,246,${alpha})`
            ctx.lineWidth = 0.6
            ctx.stroke()
          }
        }
      }
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [dark])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ opacity: 0.55 }}
    />
  )
}
