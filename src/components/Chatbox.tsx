"use client"
import { Textarea } from "@/components/ui/textarea";
import { ArrowUp, LoaderIcon } from "lucide-react";
import React from 'react';
import { Button } from "./ui/button";

const Chatbox = ({ prompt, setPrompt, generating, submitPrompt }: {
    prompt: string;
    setPrompt: React.Dispatch<React.SetStateAction<string>>;
    generating: boolean;
    submitPrompt: () => void;
}) => {
    return (
        <section className="w-full flex justify-center items-center pb-6">
            <div className="w-[900px] h-[80px] relative">
                <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="focus-visible:border-border h-full resize-none p-4"
                    placeholder="Generate an intermediate quiz about World War 2 with 10 questions" />
                <Button className={`cursor-pointer absolute bottom-4 right-4 bg-btn hover:bg-btn-hover text-white`} disabled={generating} variant={"secondary"} size={"icon"} onClick={submitPrompt}>
                    {
                        generating ? <LoaderIcon className="h-4 w-4 animate-spin" /> : <ArrowUp className="h-4 w-4" />
                    }
                </Button>
            </div>
        </section>
    )
}

export default Chatbox