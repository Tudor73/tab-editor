import { ChangeEvent, useRef, useState } from "react";



const TabComponent = ( {tab } : {tab: string[]}) => {


  return (
    <div className=" text-md font-mono mt-10">
      {tab.map((str, idx) => 
        {return (<span className=" block" key={idx}>{str}</span> )}
    )}
    </div>

  )
}; 


function generateTab(notes: number[][]) {
  let tab = [
    "e | ---------------------------------------------",
    "B | ---------------------------------------------",
    "G | ---------------------------------------------", 
    "D | ---------------------------------------------",
    "A | ---------------------------------------------",
    "E | ---------------------------------------------",
  ]
  let idx = 4
  notes.forEach((note) => {
    let str = tab[note[0]]
    let str1 = str.split("")
    str1[idx] = String(note[1])
    str = str1.join("")
    tab[note[0]] = str
    idx += 3
  })
  return tab 
}


export default function Home() {
  let file: File;


  const [renderTab, setRenderTab] = useState(false)
  const [tabs, setTabs] = useState<string[][]>([])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      file = e.target.files[0];
    }
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
        const nr_of_tabs = Math.ceil(data.notes.length / 15)
        let tabs_aux = []
        for (let i = 0; i < nr_of_tabs; i++) {
          tabs_aux.push(generateTab(data.notes.slice(i * 15, (i + 1) * 15)))
        }
        setTabs(tabs_aux)
        setRenderTab(true)
      })
      .catch((err) => console.log(err));
  };
  
  return (
    <div>
      <div>
        <input type="file" name="file" id="upload" onChange={handleFileChange} />
        <button type="submit" onClick={handleUploadFile}>
          Generate Tab
        </button>
      </div>
      <div className="">

      <h1>Tab: </h1>
      
      { renderTab  && tabs.map((tab, idx) => {
        return <TabComponent tab={tab} key={idx} />
      }) } 
    </div>
    </div>
  );
}
