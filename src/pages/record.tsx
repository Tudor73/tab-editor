import { useRef, useState } from "react";

// fetch("http://localhost:5000/upload", {
//     method: "POST",
//   body: formData
//   })
//     .then((res) => res.json())
//     .then((data) => {
//       console.log(data);6
//   }).catch((err) => console.log(err));
// });

export default function Record() {
  const microphone = useRef<HTMLAudioElement>(null);
  const stopButton = useRef<HTMLButtonElement>(null);

  let blob = useRef<Blob>(null).current;

  let constraintObj = {
    audio: true,
    video: false,
  };

  const startRecording = () => {
    console.log("start recording");

    navigator.mediaDevices.getUserMedia(constraintObj).then(function (mediaStreamObj) {
      //connect the media stream to the first audio element
      const audioRecorder = new MediaRecorder(mediaStreamObj);
      if (!audioRecorder) return;
      let audioInput = [] as any;

      audioRecorder.ondataavailable = function (e) {
        audioInput.push(e.data);
      };

      audioRecorder.onstop = () => {
        blob = new Blob(audioInput, { type: 'audio/wav; codecs=1'  });
        console.log(blob)
        let audioURL = window.URL.createObjectURL(blob);
        console.log(audioURL)


        if (microphone.current) microphone.current.src = audioURL;
      };

      if (stopButton.current) {
        stopButton.current.addEventListener("click", function onStopClick() {
          console.log("stop recording");
          audioRecorder.stop();
          stopButton?.current?.removeEventListener("click", onStopClick);
        });
      }
      audioRecorder.start();
    });
  };

  const sendBlob = () => {
    console.log(blob)
    if (!blob) return;
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'http://localhost:5000/upload-audio', true);
    xhr.onload = (res) => {
      console.log(res.target)
      // handle server response
    };
    xhr.send(blob);
    // const formData = new FormData();
    // formData.append("file", blob, "test.wav");
    // fetch("http://localhost:5000/upload", {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "audio/wav; codecs=1"
    //   },
    //   body: formData,
    // })
    //   .then((res) => res.json())
    //   .then((data) => {
    //     console.log(data);
    //   })
    //   .catch((err) => console.log(err));
  };

  return (
    <div>
      <button onClick={startRecording}>Start</button>
      <button ref={stopButton}>Stop</button>
      <audio controls ref={microphone}></audio>
      <button onClick={sendBlob}>SEND</button>
    </div>
  );
}
