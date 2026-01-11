import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
    OrbitControls,
    Sphere,
    Torus,
    Float,
} from "@react-three/drei";

function RotatingShapes({ variant }) {
    const sphereRef = useRef(null);
    const torusRef = useRef(null);

    useFrame(() => {
        if (sphereRef.current) {
            sphereRef.current.rotation.x += 0.003;
            sphereRef.current.rotation.y += 0.005;
        }
        if (torusRef.current) {
            torusRef.current.rotation.x -= 0.002;
            torusRef.current.rotation.y -= 0.004;
        }
    });

    const isPrimary = variant === "login";

    return (
        <>
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                <Sphere ref={sphereRef} args={[1.2, 64, 64]} position={[0, 0, 0]}>
                    <meshPhongMaterial
                        color={isPrimary ? "#6d28d9" : "#0891b2"}
                        shininess={100}
                        emissive={isPrimary ? "#6d28d9" : "#0891b2"}
                        emissiveIntensity={0.3}
                    />
                </Sphere>
            </Float>

            <Float speed={1.5} rotationIntensity={0.8} floatIntensity={0.6}>
                <Torus ref={torusRef} args={[1.8, 0.4, 32, 100]} position={[0, 0, 0]}>
                    <meshPhongMaterial
                        color={isPrimary ? "#c084fc" : "#06b6d4"}
                        shininess={80}
                        emissive={isPrimary ? "#c084fc" : "#06b6d4"}
                        emissiveIntensity={0.2}
                    />
                </Torus>
            </Float>

            {/* Lights - adjusted for better blending */}
            <ambientLight intensity={0.7} />
            <directionalLight position={[10, 10, 10]} intensity={1} />
            <directionalLight
                position={[-10, -10, -10]}
                intensity={0.3}
                color="#0891b2"
            />
        </>
    );
}

function Scene3D({ variant = "login" }) {
    return (
        <div className="w-full h-full">
            <Canvas
                camera={{ position: [0, 0, 4], fov: 75 }}
                gl={{ 
                    antialias: true, 
                    alpha: true,
                    preserveDrawingBuffer: false,
                    powerPreference: "high-performance",
                    // Clear to transparent
                    clearColor: 0x000000,
                    clearAlpha: 0
                }}
                style={{ 
                    width: '100%', 
                    height: '100%',
                    display: 'block',
                    background: 'transparent'
                }}
                // Force canvas to clear with transparent
                onCreated={({ gl }) => {
                    gl.setClearColor(0x000000, 0);
                }}
            >
                {/* No Environment - it can add subtle backgrounds */}
                {/* No color background element */}
                
                <RotatingShapes variant={variant} />

                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    autoRotate
                    autoRotateSpeed={2}
                    maxPolarAngle={Math.PI * 0.6}
                    minPolarAngle={Math.PI * 0.4}
                />

                {/* Optional: If you need environment lighting but no background */}
                {/* <Environment 
                    preset="studio" 
                    background={false} // This is key!
                /> */}
            </Canvas>
        </div>
    );
}

export default Scene3D;