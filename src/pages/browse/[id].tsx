import { useRouter } from "next/router"
import { useEffect, useState } from "react";

type Track = { 
    id: string;
    name: string;
    username: string;
    tab: string
}

export default function Track() {
    const router = useRouter();

    const { id } = router.query;

    const [track, setTrack] = useState<Track>()


    const findAllSpaces = (str: string) => {
        const spaces = []
        for(let i = 0; i < str.length; i++) {
            if(str[i] === " ") {
                spaces.push(i)
            }
        }
        return spaces
    }

    const loadTrack = async () => {

        let response = await fetch(`http://localhost:5000/tracks/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        let track = await response.json();
        setTrack(track.track)
        console.log(track)
    } 

    useEffect(() => {        
        if(id)
        loadTrack();

    }, [router.isReady])


    if(!track) return <h1>Loading...</h1>
    return (
        <div>
            <h1 className="text-4xl font-bold">Track</h1>
            <h1></h1>
        </div>
    )
}