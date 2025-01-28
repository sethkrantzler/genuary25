import React, { useState, useEffect } from 'react';
import { GUI } from 'lil-gui';
import { useGLTF } from '@react-three/drei';
import { OrbitControls } from '@react-three/drei';
import { Rug } from './Rug';

const Experience = () => {
    const [gridSize, setGridSize] = useState(120);
    const [couchPosition, setCouchPosition] = useState([3.9, 0, 16.6]);
    const [couchRotation, setCouchRotation] = useState([0, Math.PI, 0]);
    const [couchScale, setCouchScale] = useState([0.1, 0.1, 0.1]);
    const [armchairPosition, setArmchairPosition] = useState([29.7, 0,9.7]);
    const [pointLightPosition, setPointLightPosition] = useState([-0.19, 5.7, -0.19]);
    const [armchairRotation, setArmchairRotation] = useState([0, 4.3, 0]);
    const [armchairScale, setArmchairScale] = useState([2.5, 2.5, 2.5]);
    const [tvCabinetPosition, setTvCabinetPosition] = useState([0, 0, 7.5]);
    const [tvCabinetRotation, setTvCabinetRotation] = useState([0, Math.PI / 2, 0]);
    const [tvCabinetScale, setTvCabinetScale] = useState([1.2, 1.2, 1.2]);
    const [rugSize, setRugSize] = useState(gridSize);

    const couch = useGLTF('./couch/scene.gltf');
    const armchair = useGLTF('./armchair/scene.gltf');
    const tvCabinet = useGLTF('./tvCabinet/scene.gltf');

    useEffect(() => {
        const gui = new GUI();
        gui.add({ gridSize }, 'gridSize', 1, 40, 1).onChange((value: React.SetStateAction<number>) => setGridSize(value));

        const couchFolder = gui.addFolder('Couch');
        couchFolder.add(couchPosition, 0, -10, 10, 0.1).name('Position X').onChange((value: number) => setCouchPosition([value, couchPosition[1], couchPosition[2]]));
        couchFolder.add(couchPosition, 1, -20, 20, 0.1).name('Position Y').onChange((value: number) => setCouchPosition([couchPosition[0], value, couchPosition[2]]));
        couchFolder.add(couchPosition, 2, -20, 20, 0.1).name('Position Z').onChange((value: number) => setCouchPosition([couchPosition[0], couchPosition[1], value]));
        couchFolder.add(couchRotation, 1, 0, Math.PI * 2, 0.1).name('Rotation Y').onChange((value: number) => setCouchRotation([couchRotation[0], value, couchRotation[2]]));
        couchFolder.add(couchScale, 0, 0.1, 10, 0.1).name('Scale X').onChange((value: number) => setCouchScale([value, couchScale[1], couchScale[2]]));
        couchFolder.add(couchScale, 1, 0.1, 10, 0.1).name('Scale Y').onChange((value: number) => setCouchScale([couchScale[0], value, couchScale[2]]));
        couchFolder.add(couchScale, 2, 0.1, 10, 0.1).name('Scale Z').onChange((value: number) => setCouchScale([couchScale[0], couchScale[1], value]));

        const armchairFolder = gui.addFolder('Armchair');
        armchairFolder.add(armchairPosition, 0, -30, 40, 0.1).name('Position X').onChange((value: number) => setArmchairPosition([value, armchairPosition[1], armchairPosition[2]]));
        armchairFolder.add(armchairPosition, 1, -20, 20, 0.1).name('Position Y').onChange((value: number) => setArmchairPosition([armchairPosition[0], value, armchairPosition[2]]));
        armchairFolder.add(armchairPosition, 2, -20, 20, 0.1).name('Position Z').onChange((value: number) => setArmchairPosition([armchairPosition[0], armchairPosition[1], value]));
        armchairFolder.add(pointLightPosition, 0, -20, 20, 0.1).name('LPosition X').onChange((value: number) => setPointLightPosition([value, pointLightPosition[1], pointLightPosition[2]]));
        armchairFolder.add(pointLightPosition, 1, -20, 20, 0.1).name('LPosition Y').onChange((value: number) => setPointLightPosition([pointLightPosition[0], value, pointLightPosition[2]]));
        armchairFolder.add(pointLightPosition, 2, -20, 20, 0.1).name('LPosition Z').onChange((value: number) => setPointLightPosition([pointLightPosition[0], pointLightPosition[1], value]));
        armchairFolder.add(armchairRotation, 1, 0, Math.PI * 2, 0.1).name('Rotation Y').onChange((value: number) => setArmchairRotation([pointLightPosition[0], value, pointLightPosition[2]]));
        armchairFolder.add(armchairScale, 0, 0.1, 10, 0.1).name('Scale X').onChange((value: number) => setArmchairScale([value, armchairScale[1], armchairScale[2]]));
        armchairFolder.add(armchairScale, 1, 0.1, 10, 0.1).name('Scale Y').onChange((value: number) => setArmchairScale([armchairScale[0], value, armchairScale[2]]));
        armchairFolder.add(armchairScale, 2, 0.1, 10, 0.1).name('Scale Z').onChange((value: number) => setArmchairScale([armchairScale[0], armchairScale[1], value]));

        const tvCabinetFolder = gui.addFolder('TV Cabinet');
        tvCabinetFolder.add(tvCabinetPosition, 0, -10, 10, 0.1).name('Position X').onChange((value: number) => setTvCabinetPosition([value, tvCabinetPosition[1], tvCabinetPosition[2]]));
        tvCabinetFolder.add(tvCabinetPosition, 1, -10, 10, 0.1).name('Position Y').onChange((value: number) => setTvCabinetPosition([tvCabinetPosition[0], value, tvCabinetPosition[2]]));
        tvCabinetFolder.add(tvCabinetPosition, 2, -10, 10, 0.1).name('Position Z').onChange((value: number) => setTvCabinetPosition([tvCabinetPosition[0], tvCabinetPosition[1], value]));
        tvCabinetFolder.add(tvCabinetRotation, 1, 0, Math.PI * 2, 0.1).name('Rotation Y').onChange((value: number) => setTvCabinetRotation([tvCabinetRotation[0], value, tvCabinetRotation[2]]));
        tvCabinetFolder.add(tvCabinetScale, 0, 0.1, 10, 0.1).name('Scale X').onChange((value: number) => setTvCabinetScale([value, tvCabinetScale[1], tvCabinetScale[2]]));
        tvCabinetFolder.add(tvCabinetScale, 1, 0.1, 10, 0.1).name('Scale Y').onChange((value: number) => setTvCabinetScale([tvCabinetScale[0], value, tvCabinetScale[2]]));
        tvCabinetFolder.add(tvCabinetScale, 2, 0.1, 10, 0.1).name('Scale Z').onChange((value: number) => setTvCabinetScale([tvCabinetScale[0], tvCabinetScale[1], value]));

        const rugFolder = gui.addFolder('Rug');
        rugFolder.add({ rugSize }, 'rugSize', 1, 100, 1).onChange((value: React.SetStateAction<number>) => setRugSize(value));

        const toggleGUIVisibility = (event: KeyboardEvent) => {
            if (event.key === 'h') {
                gui.domElement.style.display = gui.domElement.style.display === 'none' ? '' : 'none';
            }
        };

        window.addEventListener('keydown', toggleGUIVisibility);

        return () => {
            window.removeEventListener('keydown', toggleGUIVisibility);
            gui.destroy();
        };
    }, []);

    return (
        <>
            <directionalLight position={[5, 5, 5]} intensity={0.2} />
            <primitive object={couch.scene} position={couchPosition} rotation={couchRotation} scale={couchScale} />
            <primitive object={tvCabinet.scene} position={tvCabinetPosition} rotation={tvCabinetRotation} scale={tvCabinetScale} />
            <primitive object={armchair.scene} position={armchairPosition} rotation={armchairRotation} scale={armchairScale}>
                <pointLight position={pointLightPosition} intensity={100} color="orange" />
            </primitive>
            <Rug position={[0, 0.6, 0]} size={rugSize} />
            <OrbitControls />
        </>
    );
};

export default Experience;