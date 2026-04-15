import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import type { Frame } from '../../engine/types'
import { GRID_SIZE } from '../../engine/types'

interface Sphere3DProps {
  frame: Frame
  size?: number
}

/**
 * 3D sphere that wraps the 8x8 LED matrix onto its surface as a dynamic texture.
 * Used for the hero demo / crowdfunding visual — makes the current animation
 * look like it's on the physical spherical product.
 */
export function Sphere3D({ frame, size = 360 }: Sphere3DProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<Frame>(frame)
  const textureCanvasRef = useRef<HTMLCanvasElement | null>(null)
  const textureRef = useRef<THREE.CanvasTexture | null>(null)
  const rafRef = useRef<number | null>(null)

  // Keep latest frame in a ref so the RAF loop reads freshest value without re-creating scene
  useEffect(() => {
    frameRef.current = frame
    if (textureRef.current) textureRef.current.needsUpdate = true
  }, [frame])

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // Scene / camera / renderer
    const scene = new THREE.Scene()
    scene.background = null

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
    camera.position.set(0, 0, 6)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(size, size)
    renderer.setClearColor(0x000000, 0)
    mount.appendChild(renderer.domElement)

    // Texture canvas — we paint the LED grid here and wrap it around the sphere
    const TEX_SIZE = 256
    const canvas = document.createElement('canvas')
    canvas.width = TEX_SIZE
    canvas.height = TEX_SIZE
    textureCanvasRef.current = canvas
    const ctx = canvas.getContext('2d')!
    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.minFilter = THREE.LinearFilter
    texture.magFilter = THREE.LinearFilter
    textureRef.current = texture

    // Sphere
    const geometry = new THREE.SphereGeometry(1.6, 64, 64)
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      emissiveMap: texture,
      emissive: new THREE.Color(0xffffff),
      emissiveIntensity: 0.6,
      roughness: 0.35,
      metalness: 0.15,
    })
    const sphere = new THREE.Mesh(geometry, material)
    scene.add(sphere)

    // Subtle wireframe overlay so the 8x8 grid is visible
    const wire = new THREE.LineSegments(
      new THREE.WireframeGeometry(new THREE.SphereGeometry(1.605, GRID_SIZE, GRID_SIZE / 2)),
      new THREE.LineBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.15 })
    )
    scene.add(wire)

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.55))
    const keyLight = new THREE.DirectionalLight(0xffffff, 0.8)
    keyLight.position.set(2.5, 3, 4)
    scene.add(keyLight)

    // Paint LED texture from current frame
    const paintTexture = () => {
      const f = frameRef.current
      // Dark base
      ctx.fillStyle = '#0a0a0f'
      ctx.fillRect(0, 0, TEX_SIZE, TEX_SIZE)
      const cell = TEX_SIZE / GRID_SIZE
      const led = cell * 0.42
      for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
          const [r, g, b] = f[y][x]
          const cx = x * cell + cell / 2
          const cy = y * cell + cell / 2
          const isLit = r > 5 || g > 5 || b > 5
          if (isLit) {
            // Outer glow
            const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, led * 2.2)
            grad.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.7)`)
            grad.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`)
            ctx.fillStyle = grad
            ctx.fillRect(cx - led * 2.2, cy - led * 2.2, led * 4.4, led * 4.4)
            // LED core
            ctx.beginPath()
            ctx.arc(cx, cy, led, 0, Math.PI * 2)
            ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
            ctx.fill()
          } else {
            ctx.beginPath()
            ctx.arc(cx, cy, led * 0.75, 0, Math.PI * 2)
            ctx.fillStyle = '#15151f'
            ctx.fill()
          }
        }
      }
      texture.needsUpdate = true
    }

    let lastTime = performance.now()
    const animate = (now: number) => {
      rafRef.current = requestAnimationFrame(animate)
      const dt = (now - lastTime) / 1000
      lastTime = now
      sphere.rotation.y += dt * 0.35
      sphere.rotation.x = Math.sin(now * 0.0003) * 0.2
      wire.rotation.copy(sphere.rotation)
      paintTexture()
      renderer.render(scene, camera)
    }
    rafRef.current = requestAnimationFrame(animate)

    // Responsive resize
    const ro = new ResizeObserver(() => {
      const w = mount.clientWidth
      const h = mount.clientHeight
      camera.aspect = w / h
      camera.updateProjectionMatrix()
      renderer.setSize(w, h, false)
    })
    ro.observe(mount)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      ro.disconnect()
      renderer.dispose()
      geometry.dispose()
      material.dispose()
      texture.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [size])

  return (
    <div
      ref={mountRef}
      className="rounded-2xl overflow-hidden"
      style={{ width: size, height: size }}
    />
  )
}
