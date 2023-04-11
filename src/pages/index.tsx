import { ChangeEvent, useEffect, useRef, useState } from "react";
import {useStore} from "./store";


const lengthOfTabString = 30;

let count = 0


const SpanComponent = ({
  value,
  index,
  showInputParent,
  onShowInput,
}: {
  value: string;
  index: number;
  showInputParent: number;
  onShowInput: (val: number) => void;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showInput, setShowInput] = useState(false);

  const [index1, setIndex1] = useState(0)

  useEffect(() => {
    count += 1
    setIndex1(count)
    return () => {
      count -=1
    }
  }, [])

  // const spanIndex   = useStore(state => state.spanIndex)


  
  if (index === lengthOfTabString) {
    return <span className="block"></span>;
  }
  return (
    <span
      onClick={(e) => {
      console.log(index1)
      }}
    >
      {value}

      {showInputParent ===index && <input type="text" ref={inputRef} className=" w-6 h-6 outline" />}
    </span>
  );
};

const TabComponent = ({ tab }: { tab: string[][];  }) => {
  const [showInputIndex, setShowInputIndex] = useState(-1);
  return (
  <div className=" text-md font-mono mt-10">
      {tab.map((str, idx) => {
        return str.map((str2, idx2) => {
          return (
            <SpanComponent
              value={str2}
              index={idx2}
              key={idx2}
              showInputParent={showInputIndex}
              onShowInput={(val: number) => setShowInputIndex(val)}
            />
          );
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
  let tab = [["e | "], ["B | "], ["G | "], ["D | "], ["A | "], ["E | "]];

  let idx = 1;

  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < lengthOfTabString; j++) {
      let char = "-";
      tab[i].push(char);
    }
  }
  notes.forEach((val, index) => {
    let string = val[0];
    let fret = val[1];

    let str1 = tab[string];
    str1[idx] = String(fret);
    idx += 3;
  });

  console.log(tab);
  return tab;
}

export default function Home() {
  let file: File;



  const [renderTab, setRenderTab] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [tabs, setTabs] = useState<string[][][]>([]);
  const [value, setValue] = useState("");

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      file = e.target.files[0];
    }
  };

  const enterEditMode = () => {
    setRenderTab(false);
    setEditMode(true);
  };

  const handleUploadFile = () => {
    const formData = new FormData();
    formData.append("file", file);
    console.log(formData.get("file"));
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
      <div className="">
        <h1>Tab: </h1>

        {renderTab &&
          tabs.map((tab, idx) => {
            return <TabComponent tab={tab} key={idx}  />;
          })}

        {renderTab && (
          <button className="bg-gray-300 px-4 py-2 rounded-lg" onClick={enterEditMode}>
            Edit
          </button>
        )}
      </div>
    </div>
  );
}
