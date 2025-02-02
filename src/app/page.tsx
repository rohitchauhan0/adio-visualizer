"use client";
import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { TbPlayerTrackPrevFilled, TbPlayerTrackNextFilled } from "react-icons/tb";
import { FaPlayCircle, FaPauseCircle } from "react-icons/fa";

const Constants = {
  TWO_PI: Math.PI * 2
};

const Page = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLInputElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTrack, setCurrentTrack] = useState(0);
  const tracks = ["/track1.mp3", "/track2.mp3", "/track3.mp3"];

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const bufferLengthRef = useRef<number>(0);
  const dataArrayRef = useRef<Uint8Array | null>(null);

  let hue = 0;
  let hueAdd = 0.2;

  // Setup audio visualizer
  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaElementSource(audio);
      source.connect(analyserRef.current);
      analyserRef.current.connect(audioContextRef.current.destination);

      analyserRef.current.fftSize = 256;
      bufferLengthRef.current = analyserRef.current.frequencyBinCount;
      dataArrayRef.current = new Uint8Array(bufferLengthRef.current);

      audio.onplay = () => {
        audioContextRef.current?.resume();
      };
    }
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      const updateTime = () => {
        setCurrentTime(audioRef.current!.currentTime);
        setDuration(audioRef.current!.duration);
      };
      audioRef.current.addEventListener("timeupdate", updateTime);
      return () => {
        audioRef.current?.removeEventListener("timeupdate", updateTime);
      };
    }
  }, []);

  const audioVisualize_2 = () => {
    if (analyserRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (ctx && dataArrayRef.current) {
        analyserRef.current.getByteTimeDomainData(dataArrayRef.current);

        const width = canvas.width;
        const height = canvas.height;

        ctx.clearRect(0, 0, width, height); // Clear the canvas

        let cX = width / 2;
        let cY = height / 2;

        let radianAdd = Constants.TWO_PI / dataArrayRef.current.length;
        let radian = 0;

        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        for (let i = 0; i < dataArrayRef.current.length; i++) {
          const v = dataArrayRef.current[i];

          let x = v * Math.cos(radian) + cX;
          let y = v * Math.sin(radian) + cY;

          ctx.beginPath();
          ctx.arc(x, y, 5, 0, Constants.TWO_PI, false);
          ctx.fill();

          radian += radianAdd;
        }

        hue += hueAdd;
        if (hue > 360) {
          hue = 0;
        }
      }
    }

    // Continue the animation
    requestAnimationFrame(audioVisualize_2);
  };


  useEffect(() => {
    audioVisualize_2();
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const changeTrack = (direction: "next" | "prev") => {
    if (direction === "next") {
      setCurrentTrack((prev) => (prev + 1) % tracks.length);
    } else {
      setCurrentTrack((prev) => (prev - 1 + tracks.length) % tracks.length);
    }
  };


  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = (parseFloat(e.target.value) / 100) * duration;
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen  relative  bg-[#35363A]  ">
      <div className="absolute bottom-32  left-80 w-[300px] h-[300px] rounded-full bg-[#335158] blur-2xl animate-pulse "></div>
      <div className="absolute top-0  right-80 w-[500px] h-[500px] rounded-full bg-[#335158] blur-2xl animate-pulse"></div>


      <div className="w-[450px]  overflow-hidden h-[700px] flex items-center justify-center flex-col relative space-y-20 bg-[#14161D] backdrop-blur-lg rounded-xl px-8 shadow-lg shadow-[#335158] ">
      <div className="absolute top-0  -right-5 w-[100px] h-[100px] rounded-full bg-[#3E4348] blur-2xl e"></div>

        <canvas
          ref={canvasRef}
          className="absolute bg-transparent -mx-[75px] -top-[7.5rem] inset-0 z-0 rounded-full "
          width={600}
          height={600}
        />
        <Image
          src="/image.jpg"
          alt="secret-diary"
          width={500}
          height={500}
          className=" h-64 w-64 rounded-full pb-1 p-1  object-cover z-10 "
        />
        <audio ref={audioRef} src={tracks[currentTrack]} />




        <div className="text-white  w-full text-center z-10">
         <div className=" mt-16 flex  items-center justify-center">
         <button className="text-2xl mr-4" onClick={() => changeTrack("prev")}>
         <TbPlayerTrackPrevFilled 
  size={30} 
  className="drop-shadow-[0_0_20px_rgba(51,81,88,0.8)]  "
/>

          </button>
          <button className="text-2xl" onClick={togglePlay}>
            {isPlaying ? <FaPauseCircle size={40} className="drop-shadow-[0_0_10px_rgba(51,81,88,0.8)] " /> : <FaPlayCircle className="drop-shadow-[0_0_10px_rgba(51,84,88,0.8)] " size={40} />}
          </button>
          <button className="text-2xl ml-4" onClick={() => changeTrack("next")}>
          <TbPlayerTrackNextFilled size={30} className="drop-shadow-[0_0_10px_rgba(51,100,88,1)] " />


          </button>
         </div>
        </div>


        <div className="w-full   z-10">
         <div className="-mt-16 flex items-center justify-center">
         <input
            type="range"
            ref={progressRef}
            className="w-full"
            min="0"
            max="100"
            step="1"
            id="progress-bar"
            
            onChange={handleProgressChange}
          />
         </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
