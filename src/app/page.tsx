"use client";
import { FormEvent, useCallback, useId, useState } from "react";
import { getC3POResponse } from "./openai";

interface IState {
  status: "waiting" | "processing" | "answered" | "errored";
  error?: string;
  answer?: string;
}

export default function Home() {
  const questionId = useId();
  const [state, setState] = useState<IState>({ status: "waiting" });

  const handleSubmit = useCallback((e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const question = formData.get("question")?.valueOf() as string;
    console.log(question);
    setState({ status: "processing" });
    getC3POResponse(question)
      .then((answer) => {
        if (answer) {
          setState({ status: "answered", answer });
        } else {
          setState({ status: "errored", error: "No response" });
        }
      })
      .catch((e) => {
        setState({ status: "errored", error: `${e}` });
      });
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
    </main>
  );
}
