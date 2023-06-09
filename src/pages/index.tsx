import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useStore } from "./store";
import { useRouter } from "next/router";

const lengthOfTabString = 45;

let count = 0;

let tabState: string[] = [];
let fileName: string = "";
const SpanComponent = ({ value, index }: { value: string; index: number }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [inputValue, setInputValue] = useState(value);

    const [index1, setIndex1] = useState(0);

    const spanIndexState = useStore((state) => state.spanIndex);
    const setSpanIndexState = useStore((state) => state.setSpanIndex);
    const editMode = useStore((state) => state.editMode);

    useEffect(() => {
        count += 1;
        tabState.push(value);
        setIndex1(count);
        return () => {
            count -= 1;
            tabState.pop();
        };
    }, []);

    if (value === "") {
        return <span className="block"></span>;
    }
    return (
        <span
            onClick={(e) => {
                if (!editMode) {
                    return;
                }
                console.log(tabState[index1 - 1]);
                setSpanIndexState(index1);
            }}
        >
            {inputValue}

            {spanIndexState == index1 && (
                <input
                    type="text"
                    ref={inputRef}
                    className=" w-6 h-6 outline relative right-4 "
                    defaultValue={inputValue}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            if (inputRef.current) {
                                setInputValue(inputRef.current.value);
                                tabState[index1 - 1] = inputRef.current.value;
                                setSpanIndexState(-1);
                            }
                        }
                    }}
                />
            )}
        </span>
    );
};

const TabComponent = ({ tab }: { tab: string[][] }) => {
    return (
        <div className=" text-md font-mono mt-10">
            {tab.map((str, idx) => {
                return str.map((str2, idx2) => {
                    return <SpanComponent value={str2} index={idx2} key={idx2} />;
                });
            })}
        </div>
    );
};

function generateTab(notes: number[][]) {
    let tab = [
        ["e | "],
        [""],
        ["B | "],
        [""],
        ["G | "],
        [""],
        ["D | "],
        [""],
        ["A | "],
        [""],
        ["E | "],
        [""],
    ];

    let idx = 1;

    for (let i = 0; i < 12; i += 2) {
        for (let j = 0; j < lengthOfTabString; j++) {
            let char = "-";
            tab[i].push(char);
        }
    }
    notes.forEach((val, index) => {
        let string = val[0];
        let fret = val[1];

        let str1;
        if (string === 0) {
            str1 = tab[string];
        } else {
            str1 = tab[string * 2];
        }
        str1[idx] = String(fret);
        if (fret >= 10) {
            str1.pop();
        }
        idx += 3;
    });
    return tab;
}

export default function Home() {
    let file: File;

    const router = useRouter();
    const [renderTab, setRenderTab] = useState(false);
    const [loading, setLoading] = useState(false);
    const [tabs, setTabs] = useState<string[][][]>([]);
    const [value, setValue] = useState("");

    const [username, setUserName] = useState("");
    const [songName, setSongName] = useState("");

    const editMode = useStore((state) => state.editMode);
    const setEditMode = useStore((state) => state.setEditMode);
    const setSpanIndexState = useStore((state) => state.setSpanIndex);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            file = e.target.files[0];
        }
    };

    const handleSaveFile = () => {
        if (username === "") {
            alert("Please enter an username ");
            return;
        } else if (songName === "") {
            alert("Please enter a song name ");
            return;
        }
        console.log(fileName);
        fetch("http://localhost:5000/save", {
            method: "POST",
            body: JSON.stringify({
                tab: tabState,
                fileName: fileName,
                username: username,
                songName: songName,
            }),
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
            })
            .catch((err) => console.log(err));
    };

    const enterEditMode = () => {
        if (editMode) {
            setSpanIndexState(-1);
        }
        setEditMode(!editMode);
    };

    const handleUploadFile = () => {
        setEditMode(false);
        setSpanIndexState(-1);
        setLoading(true);
        const formData = new FormData();
        formData.append("file", file);
        fileName = file.name;
        fetch("http://localhost:5000/upload", {
            method: "POST",
            body: formData,
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                let tabs_aux = [];
                let index = 0;
                while (index < data.notes.length) {
                    let start = index;
                    let end = index + 13;

                    let generatedTab = generateTab(data.notes.slice(start, end));
                    tabs_aux.push(generatedTab);
                    index += 13;
                }
                setTabs(tabs_aux);
                let tab_edit = tabs_aux[0].join("\n");
                setValue(tab_edit);
                setLoading(false);
                setRenderTab(true);
            })
            .catch((err) => console.log(err));
    };

    return (
        <div className="flex flex-col items-center mt-20 ">
            <button
                className="mr-auto ml-10 bg-gray-300 px-4 py-2 rounded-lg"
                onClick={() => {
                    router.push("browse");
                }}
            >
                Browse
            </button>
            <div className="flex flex-col items-center gap-3">
                <input
                    type="file"
                    name="file"
                    id="upload"
                    onChange={handleFileChange}
                    className=""
                />
                <button
                    type="submit"
                    onClick={handleUploadFile}
                    className=" self-center bg-gray-300 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-400"
                >
                    Generate Tab
                </button>
            </div>
            <div className={"px-4" + (editMode ? " border-2 border-solid border-red-400" : "")}>
                <h1>Tab: </h1>
                {loading && (
                    <svg
                        className="mt-10 "
                        width="48"
                        height="100"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path d="M10.14,1.16a11,11,0,0,0-9,8.92A1.59,1.59,0,0,0,2.46,12,1.52,1.52,0,0,0,4.11,10.7a8,8,0,0,1,6.66-6.61A1.42,1.42,0,0,0,12,2.69h0A1.57,1.57,0,0,0,10.14,1.16Z">
                            <animateTransform
                                attributeName="transform"
                                type="rotate"
                                dur="0.75s"
                                values="0 12 12;360 12 12"
                                repeatCount="indefinite"
                            />
                        </path>
                    </svg>
                )}
                {renderTab &&
                    tabs.map((tab, idx) => {
                        return <TabComponent tab={tab} key={idx} />;
                    })}

                {renderTab && (
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => {
                            setUserName(e.target.value);
                        }}
                        placeholder="Name"
                        className="shadow border rounded p-2 mt-4"
                    />
                )}

                {renderTab && (
                    <input
                        type="text"
                        value={songName}
                        onChange={(e) => {
                            setSongName(e.target.value);
                        }}
                        placeholder="SongName"
                        className="shadow border rounded p-2 mt-4 ml-4"
                    />
                )}

                {renderTab && (
                    <div className="py-4">
                        <button
                            className="bg-gray-300 px-4 py-2 rounded-lg"
                            onClick={enterEditMode}
                        >
                            {!editMode ? "Edit" : "Done"}
                        </button>
                        {!editMode && (
                            <button
                                className="bg-green-300 px-4 py-2 rounded-lg ml-2"
                                onClick={handleSaveFile}
                            >
                                Save
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
