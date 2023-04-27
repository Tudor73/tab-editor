import { ChangeEvent, useEffect, useRef, useState } from "react";
import { useStore } from "./store";

const lengthOfTabString = 30;

let count = 0;


let tabState: string[] = []
let fileName : string = ""
const SpanComponent = ({ value, index }: { value: string; index: number }) => {
  const inputRef = useRef<HTMLInputElement>(null);


  

  const [inputValue, setInputValue] = useState(value);

  const [index1, setIndex1] = useState(0);

  const spanIndexState = useStore(state => state.spanIndex);
  const setSpanIndexState = useStore(state => state.setSpanIndex);
  const editMode = useStore(state => state.editMode);

  useEffect(() => {
    count += 1;
    tabState.push(value)
    setIndex1(count);
    return () => {
      count -= 1; 
      tabState.pop()
    };
  }, []);

  if (value ==="") {
    return <span className="block"></span>;
  }
  return (
    <span
      onClick={(e) => {

        if(!editMode) {
          return;
        }
        console.log(tabState[index1-1])
        setSpanIndexState(index1);
      }}
    >
      {inputValue}

      {spanIndexState == index1 && (
        <input type="text" ref={inputRef} className=" w-6 h-6 outline relative right-4 " defaultValue={inputValue} onKeyDown={(e) => {
          if(e.key === "Enter") {
            if(inputRef.current) {
              setInputValue(inputRef.current.value);
              tabState[index1-1] = inputRef.current.value;
              setSpanIndexState(-1);
            }
          }
        }}/>
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

// const EditTabComponent = ({ tab }: { tab: string[] }) => {
//   return (
//     <div className=" text-md font-mono mt-10">
//       {tab.map((str, idx) => {
//         return (
//           <span className=" block" key={idx}>
//             {str}
//           </span>
//         );
//       })}
//     </div>
//   );
// };

function generateTab(notes: number[][]) {
  let tab = [["e | "],[""], ["B | "], [""], ["G | "] ,[""], ["D | "], [""], ["A | "],[""],  ["E | "], [""]];

  let idx = 1;

  for (let i = 0; i < 12; i+=2) {
    for (let j = 0; j < lengthOfTabString; j++) {
      let char = "-";
      tab[i].push(char);
    }
  }
  notes.forEach((val, index) => {
    
    let string = val[0];
    let fret = val[1];

    let str1 
    if (string === 0) {
    str1 = tab[string];
    }
    else {
      str1 = tab[string * 2 -2 ]
    }
    str1[idx] = String(fret);
    if (fret >= 10) {
      str1.pop()
    }
    idx += 3;
  });
  return tab;
}

export default function Home() {
  let file: File;

  const [renderTab, setRenderTab] = useState(false);
  const [tabs, setTabs] = useState<string[][][]>([]);
  const [value, setValue] = useState("");

  const editMode = useStore((state) => state.editMode);
  const setEditMode = useStore((state) => state.setEditMode);
  const setSpanIndexState = useStore((state) => state.setSpanIndex);


  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      file = e.target.files[0];
    }
  };

  const handleSaveFile = () => {
    console.log(fileName)
    fetch("http://localhost:5000/save", { 
      method: "POST",
      body: JSON.stringify({tab: tabState, fileName: fileName}),
      headers: {
        "Content-Type": "application/json"
      }
    }).then((res) => res.json()).then((data) => {
      console.log(data)
    }).catch((err) => console.log(err))
  }


  const enterEditMode = () => {
    if (editMode) {
      setSpanIndexState(-1);
    }
    setEditMode(!editMode);
  };

  const handleUploadFile = () => {
    setEditMode(false)
    setSpanIndexState(-1)
    const formData = new FormData();
    formData.append("file", file);
    fileName = file.name
    fetch("http://localhost:5000/upload", {
      method: "POST",
      body: formData,
    })
      .then((res) => res.json())
      .then((data) => {
        let tabs_aux = [];
        let index = 0;
        while (index < data.notes.length) {
          let start = index;
          let end = index + 8;

          let generatedTab = generateTab(data.notes.slice(start, end));
          tabs_aux.push(generatedTab);
          index += 8;
        }
        setTabs(tabs_aux);
        let tab_edit = tabs_aux[0].join("\n");
        setValue(tab_edit);
        setRenderTab(true);
      })
      .catch((err) => console.log(err));
  };

  return (
    <div className="flex flex-col items-center mt-20 ">
      <div className="flex flex-col items-center gap-3">
        <input type="file" name="file" id="upload" onChange={handleFileChange} className="" />
        <button
          type="submit"
          onClick={handleUploadFile}
          className=" self-center bg-gray-300 px-4 py-2 rounded-lg cursor-pointer hover:bg-gray-400"
        >
          Generate Tab
        </button>
      </div>
      <div className={ "px-4" + (editMode ? ' border-2 border-solid border-red-400' : "")}>
        <h1>Tab: </h1>

        {renderTab &&
          tabs.map((tab, idx) => {
            return <TabComponent tab={tab} key={idx} />;
          })}

        {renderTab && (
          <div className="py-4">

          <button className="bg-gray-300 px-4 py-2 rounded-lg" onClick={enterEditMode}>
            {!editMode ? "Edit" : "Done"}
          </button>
          {
            !editMode && (
              <button className="bg-green-300 px-4 py-2 rounded-lg ml-2"onClick={handleSaveFile}>Save</button>
            )
          }
          </div>

        )}
      </div>
    </div>
  );
}
