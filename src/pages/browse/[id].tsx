import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type Track = {
  id: string;
  name: string;
  username: string;
  tab: string;
};

const findGuitarStringsIdx = (str: string) => {
  const guitarStrings = ["e", "B", "G", "D", "A", "E"];
  const guitarStringsIdx = [];
  for (let i = 0; i < str.length; i++) {
    if (guitarStrings.includes(str[i])) {
      guitarStringsIdx.push(i);
    }
  }
  return guitarStringsIdx;
};

const TabComponent = ({ guitarString }: { guitarString: string }) => {
  if (guitarString === "") {
    return <span className="block"></span>;
  } else if (guitarString === "new_tab") {
    return <span className="block h-8"></span>;
  }
  let split_string = guitarString.split("");
  return (
    <span>
      {split_string.map((s, i) => {
        return <span className=" text-black text-md font-mono">{s}</span>;
      })}
    </span>
  );

  // <span className="">{guitarString}</span>
};

export default function Track() {
  const router = useRouter();

  const { id } = router.query;
  const [track, setTrack] = useState<Track>();

  const [pause, setPause] = useState<boolean>(false);

  const [audio, setAudio] = useState<HTMLAudioElement>();
  const [tabs, setTabs] = useState<string[]>([]);

  const loadTrack = async () => {
    let response = await fetch(`http://localhost:5000/tracks/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    let track = await response.json();
    setTrack(track.track);
    parseTab(track.track.tab);
    console.log(findGuitarStringsIdx(track.track.tab));
  };

  const loadWavFile = async () => {
    const response = await fetch(`http://localhost:5000/tracks/${id}/wav`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const chunks = [];
    const reader = response?.body?.getReader();
    while (true) {
      const { done, value } = await reader!.read();
      if (done) {
        // Do something with last chunk of data then exit reader
        break;
        return;
      }
      chunks.push(value);
      // Otherwise do something here to process current chunk
    }

    const blob = new Blob(chunks, {
      type: "audio/wav",
    });
    setAudio(new Audio(URL.createObjectURL(blob)));
    return blob;
  };
  useEffect(() => {
    if (id) {
      loadTrack();
      loadWavFile();
    }
  }, [router.isReady]);

  const parseTab = (tab: string) => {
    let createdTab = [];
    let guitarStringsIdx = findGuitarStringsIdx(tab);
    for (let i = 0; i < guitarStringsIdx.length; i++) {
      if (i % 6 === 0) {
        createdTab.push("new_tab");
      }
      let guitarString = tab.slice(guitarStringsIdx[i], guitarStringsIdx[i + 1]);
      console.log(guitarString);
      createdTab.push(guitarString);
      createdTab.push("");
      // setTabs(createdTab)
    }
    setTabs(createdTab);
  };

  if (!track) return <h1>Loading...</h1>;
  if (!tabs) return <h1>Loading...</h1>;
  return (
    <div className="text-center mt-10">
      <div className="flex flex-col">
        <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">{track.name}</h1>
        <p className="text-xl">uploaded by {track.username}</p>
        <div>
        <button
          onClick={() => {
            audio?.play();
            setPause(true);
          }}
          className=" bg-gray-300 px-4 py-2 rounded-lg cursor-pointer"
        >
          Play song
        </button>

        {pause && (
          <button
            onClick={() => {
              audio?.pause();
            }}
            className="ml-10 bg-gray-300 px-4 py-2 rounded-lg cursor-pointer"
          >
            Pause
          </button>
        )}
        </div>
        </div>
        {tabs?.map((tab, idx) => {
          return <TabComponent guitarString={tab} />;
        })}
      </div>
    </div>
  );
}
