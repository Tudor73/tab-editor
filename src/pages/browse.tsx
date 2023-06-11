import { Router, useRouter } from "next/router";
import { useEffect, useState } from "react";

type Track = {
  id: string;
  name: string;
  username: string;
};

export default function Browse() {
  const router = useRouter();
  const [tracks, setTracks] = useState<Track[]>([]);

  const loadTracks = async () => {
    let response = await fetch("http://localhost:5000/tracks", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    let tracks = await response.json();
    console.log(tracks);
    setTracks(tracks.tracks);
  };

  useEffect(() => {
    loadTracks();
  }, []);

  const handleClick = (id: string) => {
    router.push(`/browse/${id}`);
  };
  if (!tracks) return <h1>Loading...</h1>;

  return (
    <div className="flex flex-col gap-4 ">
      <h1 className="text-4xl text-center">Browse songs</h1>
      <button
        className="m-auto bg-gray-300 px-4 py-2 rounded-lg"
        onClick={() => {
          router.push("/");
        }}
      >
        Add song
      </button>
      <div className="w-1/3 m-auto">
        {tracks.map((track, idx) => {
          return (
            <div
              className="border-2 border-gray-400 rounded-lg p-2 my-2 cursor-pointer hover:border-gray-700 "
              key={idx}
              onClick={() => {
                handleClick(track.id);
              }}
            >
              <h1 className="text-2xl font-bold">{track.name}</h1>
              <h2 className="text-xl font-bold">{track.username}</h2>
            </div>
          );
        })}
      </div>
    </div>
  );
}
