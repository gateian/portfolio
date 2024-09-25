import { PerspectiveCamera } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { PerspectiveCamera as THREEPerspectiveCamera, Vector3 } from "three";

const SceneCamera = () => {
  const ref = useRef<THREEPerspectiveCamera>(null!);
  const lookAtRef = useRef<Vector3>(new Vector3(0, 0, 0));
  const isDraggingRef = useRef(false);
  const startMousePosRef = useRef<{ x: number; y: number } | null>(null);
  const distanceRef = useRef(0);

  const dragSensitivity = 0.5;

  const handleMouseDown = (event: MouseEvent) => {
    isDraggingRef.current = true;
    startMousePosRef.current = { x: event.clientX, y: event.clientY };
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    startMousePosRef.current = null;
  };

  const projectScreenDeltaToXZPlane = (deltaX: number, deltaY: number) => {
    if (ref.current == null) return new Vector3();

    const cameraDirection = new Vector3();
    ref.current.getWorldDirection(cameraDirection);

    const forward = new Vector3(
      cameraDirection.x,
      0,
      cameraDirection.z
    ).normalize();
    const right = new Vector3()
      .crossVectors(forward, new Vector3(0, 1, 0))
      .normalize();

    // Apply the delta to the right and forward vectors based on mouse movement
    const movementX = right.multiplyScalar(-deltaX * dragSensitivity);
    const movementZ = forward.multiplyScalar(deltaY * dragSensitivity);

    return movementX.add(movementZ);
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (isDraggingRef.current && startMousePosRef.current) {
      const deltaX = event.clientX - startMousePosRef.current.x;
      const deltaY = event.clientY - startMousePosRef.current.y;

      const movement = projectScreenDeltaToXZPlane(
        deltaX,
        deltaY
      ).multiplyScalar(distanceRef.current / 500);

      const newLookAtTarget = lookAtRef.current.clone().add(movement);
      lookAtRef.current = newLookAtTarget;

      if (ref.current) {
        const newPosition = ref.current.position.clone().add(movement);
        ref.current.position.copy(newPosition);
      }

      startMousePosRef.current = { x: event.clientX, y: event.clientY };
    }
  };

  const zoomSpeed = 0.05;

  const handleWheel = (event: WheelEvent) => {
    if (!ref.current) return;

    const direction = new Vector3()
      .subVectors(lookAtRef.current, ref.current.position)
      .normalize();

    const distance = ref.current.position.distanceTo(lookAtRef.current);

    const zoomAmount = -event.deltaY * zoomSpeed;
    const newPosition = ref.current.position
      .clone()
      .add(direction.multiplyScalar(zoomAmount));
    console.log("Wheel event", zoomAmount, distance - zoomAmount);

    if (distance - zoomAmount > 50 && distance - zoomAmount < 1000) {
      ref.current.position.copy(newPosition);
    }

    distanceRef.current = ref.current.position.distanceTo(lookAtRef.current);
  };

  useFrame(() => {
    if (ref.current && lookAtRef.current) {
      ref.current.lookAt(lookAtRef.current);
    }
  });

  useEffect(() => {
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("wheel", handleWheel);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <PerspectiveCamera
      ref={ref}
      makeDefault
      position={[-500, 500, 500]}
      fov={20}
    />
  );
};

export default SceneCamera;
