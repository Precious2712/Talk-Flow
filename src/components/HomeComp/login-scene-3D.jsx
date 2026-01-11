import { useRef, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sphere, Torus, Float } from "@react-three/drei";
import * as THREE from "three";

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
                        wireframe={false}
                        emissive={isPrimary ? "#6d28d9" : "#0891b2"}
                        emissiveIntensity={0.3}
                        transparent
                        opacity={0.95}
                    />
                </Sphere>
            </Float>

            <Float speed={1.5} rotationIntensity={0.8} floatIntensity={0.6}>
                <Torus ref={torusRef} args={[1.8, 0.4, 32, 100]} position={[0, 0, 0]}>
                    <meshPhongMaterial
                        color={isPrimary ? "#c084fc" : "#06b6d4"}
                        shininess={80}
                        wireframe={false}
                        emissive={isPrimary ? "#c084fc" : "#06b6d4"}
                        emissiveIntensity={0.2}
                        transparent
                        opacity={0.9}
                    />
                </Torus>
            </Float>

            {/* Lights */}
            <ambientLight intensity={0.5} />
            <directionalLight position={[10, 10, 10]} intensity={0.8} />
            <directionalLight position={[-10, -10, -10]} intensity={0.2} color="#0891b2" />
        </>
    );
}

function LoginScene3D({ variant = "login" }) {
    const canvasRef = useRef(null);
    const [isReducedSize, setIsReducedSize] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            const width = window.innerWidth;
            // Reduce size at 1024px and below
            setIsReducedSize(width <= 1024);
        };

        // Initial check
        handleResize();

        // Listen for resize
        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);

    return (
        <div
            className="absolute inset-0 w-full h-full"
            style={{
                transform: "translateZ(0)",
                background: "transparent",
            }}
        >
            <Canvas
                ref={canvasRef}
                camera={{
                    position: [0, 0, isReducedSize ? 5 : 4],
                    fov: isReducedSize ? 60 : 75,
                }}
                gl={{
                    antialias: true,
                    alpha: true,
                    preserveDrawingBuffer: false,
                    powerPreference: "high-performance",
                }}
                style={{
                    width: "100%",
                    height: "100%",
                    display: "block",
                    background: "transparent",
                }}
                onCreated={({ gl }) => {
                    gl.setClearColor(0x000000, 0); // Transparent background
                }}
            >
                {/* Scale down the entire scene at 1024px */}
                <group scale={isReducedSize ? 0.8 : 1}>
                    <RotatingShapes variant={variant} />
                </group>

                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    autoRotate
                    autoRotateSpeed={isReducedSize ? 1.5 : 2}
                    maxPolarAngle={Math.PI * 0.6}
                    minPolarAngle={Math.PI * 0.4}
                />
            </Canvas>
        </div>
    );
}

export default LoginScene3D;