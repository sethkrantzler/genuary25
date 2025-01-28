import { Environment } from "@react-three/drei";
import { SourceButton, SourceButtonProps } from "./SourceButton";
import { useState } from "react";
import { VideoMachine } from "./VideoMachine";
import { Vector3 } from "three";
interface SourceButtonConfig{
    name: string;
    src: string;
}

export default function Experience()
{
    const [currentSource, setCurrentSource] = useState<string>('https://www.youtube.com/embed/VqE9ZBY70IM');
    const sourceConfigurations: SourceButtonConfig[]= [{
        name: 'Photolines',
        src: 'https://sethlovestotalk.com'
    },
    {
        name: 'Last YouTube Video',
        src: 'https://www.youtube.com/embed/Uefmud7SnJk?si=CI-w0HdF0eetr6AW'
    }]
    return (
        <>
            <Environment preset="warehouse"/>
            {sourceConfigurations.map((config, index) => (
            <SourceButton
                key={config.name}
                name={config.name}
                onButtonClicked={() => setCurrentSource(config.src)}
                position={new Vector3(-4, index*2, 0)}
            />
            ))}
            <VideoMachine src={currentSource}/>
        </>
    );
}
        