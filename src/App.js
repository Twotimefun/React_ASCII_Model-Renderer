// Threejs example: threejs.org/examples/?q=asc#webgl_effects_ascii

import { useEffect, useRef, useLayoutEffect, useState, Suspense, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, useCursor, useGLTF, Stage } from '@react-three/drei'
import { AsciiEffect } from 'three-stdlib'
import * as THREE from 'three'

import { Card, CardBack } from './Cards'
import { useSpring, config } from 'react-spring'
import { useGesture } from 'react-use-gesture'

const OFFSET = 90
const SLOW = config.gentle
const FAST = { tension: 2000, friction: 100 }

function Urus(props) {
  const { scene, nodes, materials } = useGLTF('/lambo.glb')
  useLayoutEffect(() => {
    scene.traverse((obj) => obj.type === 'Mesh' && (obj.receiveShadow = obj.castShadow = true))
    Object.assign(nodes.wheel003_020_2_Chrome_0.material, { metalness: 0.9, roughness: 0.4, color: new THREE.Color('#020202') })
    Object.assign(materials.WhiteCar, { roughness: 0.0, metalness: 0.3, emission: new THREE.Color('#500000'), envMapIntensity: 0.5 })
  }, [scene, nodes, materials])
  return <primitive object={scene} {...props} />
}

export default function App() {
  const [clicked, click] = useState(false)

  const [{ y }, set] = useSpring(() => ({ y: OFFSET }))
  const bind = useGesture(({ delta: [, y], down }) => set({ y: y > 400 ? 780 : !down ? OFFSET : y + OFFSET, config: !down || y > 400 ? SLOW : FAST }))
  const opacity = y.interpolate([180, 400], [0.2, 1], 'clamp')
  const transform = y.interpolate([OFFSET, 250], [40, 0], 'clamp').interpolate(val => `translate3d(0,${val}px,0)`)

  return (
    <>
    <CardBack onClick={() => set({ y: OFFSET })} style={{ opacity, transform }}>
        <h1 style={{ color: 'lightblue' }}>LOREM IPSUM</h1>
        <h2>In publishing and graphic design, Lorem ipsum is a placeholder text commonly used to demonstrate the visual form of a document or a typeface without relying on meaningful content. Lorem ipsum may be used as a placeholder before final copy is available. It is also used to temporarily replace text in a process called greeking, which allows designers to consider the form of a webpage or publication, without the meaning of the text influencing the design. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to ...</h2>
    </CardBack>
    <Card {...bind()} style={{ transform: y.interpolate(y => `translate3d(0,${y}px,0)`) }}>
      <h1 className='title_head1'>Drag Down</h1>
      <Canvas  camera={{fov: 65 }}>
        {/* <color attach="background" args={['black']} /> */}
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <pointLight position={[-10, -10, -10]} />
                <fog attach="fog" args={['#090909', 10, 20]} />
                <Suspense fallback={null}>
                    <Stage environment={null} intensity={1} contactShadow={false} shadowBias={-0.0015}>
                      <ModelRender onClick={() => click(!clicked)} />
                    </Stage>
                </Suspense>
        <OrbitControls target={[0, -2, 0]} />
        {/* {clicked ? <AsciiRenderer invert />: null} */}
        {clicked ? <AsciiRenderer />: null}

      </Canvas>
    </Card>
    </>
  )
}



function ModelRender(props) {
  const ref = useRef()
  // const [clicked, click] = useState(false)
  const [hovered, hover] = useState(false)
  useCursor(hovered)
  // useFrame((state) => {
  //   ref.current.rotation.y += 0.006
  // })
  useFrame((state, delta) => (ref.current.rotation.y = ref.current.rotation.y += delta / 2));
  
  return (
    <mesh
      {...props}
      ref={ref}
      scale={1}
      // onClick={() => click(!clicked)}
      onPointerOver={() => hover(true)}
      onPointerOut={() => hover(false)}>
      <Urus scale={0.01} />
      <meshStandardMaterial color="orange" />
    </mesh>
  )
}

function AsciiRenderer({ renderIndex = 1, characters = ' .:-+*=%@#', ...options }) {
  // Reactive state
  const { size, gl, scene, camera } = useThree()

  // Create effect
  const effect = useMemo(() => {
    const effect = new AsciiEffect(gl, characters, options)
    effect.domElement.style.position = 'absolute'
    effect.domElement.style.top = '0px'
    effect.domElement.style.left = '0px'
    effect.domElement.style.color = 'white'
    effect.domElement.style.backgroundColor = 'black'
    effect.domElement.style.pointerEvents = 'none'
    return effect
  }, [characters, options.invert])

  // Append on mount, remove on unmount
  useEffect(() => {
    gl.domElement.parentNode.appendChild(effect.domElement)
    return () => gl.domElement.parentNode.removeChild(effect.domElement)
  }, [effect])

  // Set size
  useEffect(() => {
    effect.setSize(size.width, size.height)
  }, [effect, size])

  // Take over render-loop (that is what the index is for)
  useFrame((state) => {
    effect.render(scene, camera)
  }, renderIndex)

  // This component returns nothing, it has no view, it is a purely logical
}
