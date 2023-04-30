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

    const [audio, setAudio] = useState<HTMLAudioElement>()

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

    const loadWavFile = async ()  => {
        const response = await fetch(`http://localhost:5000/tracks/${id}/wav`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        });
        const chunks = []
        const reader =  response?.body?.getReader();
        while (true) {
          const { done, value } = await reader!.read();
          if (done) {
            // Do something with last chunk of data then exit reader
            break
            return;
          }
        chunks.push(value)
          // Otherwise do something here to process current chunk
        }
    
        const blob = new Blob(chunks, {
            type: 'audio/wav'
        })
        setAudio(new Audio(URL.createObjectURL(blob)))
        return blob
    }
    useEffect(() => {        
        if(id){
            loadTrack();
            loadWavFile();
        }
    }, [router.isReady])


    if(!track) return <h1>Loading...</h1>
    return (
        <div>
            <h1 className="text-4xl font-bold">Track</h1>
            <h1></h1>
            <button onClick={() => {
                audio?.play()
            }}>PLAYYYY</button>
        </div>
    )
 
}

