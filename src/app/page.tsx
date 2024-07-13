"use client";
import {
  Dispatch,
  FormEvent,
  SetStateAction,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import { getC3POResponse } from "./openai";
import { createAudioStream } from "./voice";

interface IState {
  status: "waiting" | "processing" | "answered" | "errored";
  error?: string;
  answer?: string;
}

async function processAudioText(
  text: string,
  audioContext: AudioContext,
  setState: Dispatch<SetStateAction<IState>>
) {
  console.log("process audio text", text);
  try {
    var start = performance.now();
    const response = await fetch(`/api/voice?text=${encodeURIComponent(text)}`);
    if (!response.ok) {
      console.error("error in response", response.status);
      return;
    }
    var gotResponse = performance.now();
    const responseBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(responseBuffer);
    var source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);
    source.start();
    var started = performance.now();
    console.log(
      `Get response in ${gotResponse - start}, audio processing in ${
        started - gotResponse
      }`
    );
  } catch (error) {
    console.error("error in audio text", error);
    setState((current) => ({ ...current, error: `${error}` }));
  }
}

async function processQuestion(
  question: string,
  audioContext: AudioContext,
  setState: Dispatch<SetStateAction<IState>>
) {
  setState((current) => ({ ...current, status: "processing" }));
  try {
    const answer = await getC3POResponse(question);
    if (!answer) {
      setState((current) => ({
        ...current,
        status: "errored",
        error: "No response",
      }));
      return;
    }
    setState((current) => ({ ...current, status: "answered", answer }));
    await processAudioText(answer, audioContext, setState);
  } catch (error) {
    setState((current) => ({
      ...current,
      status: "errored",
      error: `${error}`,
    }));
  }
}

export default function Home() {
  const questionId = useId();
  const [state, setState] = useState<IState>({ status: "waiting" });
  const audioRef = useRef<HTMLAudioElement>(null);
  const audioContextRef = useRef<AudioContext>();

  const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!audioContextRef.current) {
      try {
        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;
      } catch (error) {
        setState((current) => ({ ...current, error: `${error}` }));
      }
    }
    const audioContext = audioContextRef.current;
    if (!audioContext) {
      setState((current) => ({ ...current, error: `No audio context` }));
      return;
    }
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const question = formData.get("question")?.valueOf() as string;
    console.log(question);
    void processQuestion(question, audioContext, setState);
  }, []);

  useEffect(() => {
    return () => {
      const audioContext = audioContextRef.current;
      if (audioContext) {
        void audioContext.close();
      }
    };
  }, []);

  return (
    <main className="font-mono grid mx-8 grid-cols-4 lg:grid-cols-12 gap-4 min-h-screen my-4 auto-rows-min">
      <form
        onSubmit={handleSubmit}
        className="col-span-full lg:col-start-3 lg:col-span-8 flex flex-col gap-4"
      >
        <label htmlFor={questionId}>
          I say, it occurs to me that you might have questions about any number
          of subjects. My databanks contain a wealth of information on topics
          ranging from etiquette to astrogation. Perhaps you&apos;d care to test
          the extent of my knowledge? I assure you, the odds of me being unable
          to assist are a mere 2,347 to 1. Oh dear, that came out rather
          boastful, didn&apos;t it? I do apologize. What I mean to say is,
          please, feel free to inquire about anything at all. It would be my
          pleasure to be of service!
        </label>
        <textarea
          className="p-2"
          autoFocus
          id={questionId}
          name="question"
          rows={3}
        />
        <button
          className="self-start rounded-sm border border-solid border-current p-2 disabled:text-gray-300"
          type="submit"
          disabled={state.status === "processing"}
        >
          Ask me
        </button>
      </form>
      {state.answer && (
        <p className="col-span-full lg:col-start-3 lg:col-span-8">
          {state.answer}
        </p>
      )}
      {state.error && (
        <p className="col-span-full lg:col-start-3 lg:col-span-8 text-red-600">
          {state.error}
        </p>
      )}
      <audio ref={audioRef} />
    </main>
  );
}
