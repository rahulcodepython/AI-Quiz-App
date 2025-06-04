"use client"

import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger
} from "@/components/ui/drawer";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { AI_MODELS } from "@/const";
import { AIModelType, ModelType } from "@/types";
import { Settings } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";


const Navbar = ({ isAuthenticated, setAIModel, aiModel, selectedModel }: {
    isAuthenticated: boolean
    setAIModel: (model: ModelType, apiKey: string) => void;
    aiModel: AIModelType[] | null;
    selectedModel: ModelType | null;
}) => {
    const { theme, setTheme } = useTheme()
    const [model, setModel] = useState<ModelType | null>(null);
    const [apiKey, setApiKey] = useState<string>('');
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (selectedModel) {
            setModel(selectedModel);
            const selectedAIModel = aiModel?.find(m => m.id === selectedModel);
            if (selectedAIModel) {
                setApiKey(selectedAIModel.apiKey);
            }
        } else {
            setModel(null);
            setApiKey('');
        }
    }, [selectedModel, aiModel]);


    return (
        <header className="flex w-full items-center justify-between container mx-auto py-4">
            <div>
                <h1 className="text-2xl font-bold">Quiz App</h1>
            </div>
            <div className="flex items-center gap-4">
                <Drawer open={isOpen} onOpenChange={setIsOpen}>
                    <DrawerTrigger asChild>
                        <Settings className="w-5 h-5 cursor-pointer" />
                    </DrawerTrigger>
                    <DrawerContent className="my-4 w-full dark:bg-gray-900">
                        <div className="container mx-auto w-full max-w-4xl">
                            <DrawerHeader>
                                <DrawerTitle className="flex items-center">
                                    <Settings className="inline-block mr-2 w-4 h-4 animate-spin" />
                                    Settings
                                </DrawerTitle>
                            </DrawerHeader>
                            <div className="p-4 pb-0 flex flex-col gap-4">
                                <div className="flex items-center justify-between">
                                    <span className="">Dark Mode</span>
                                    <Switch checked={theme === "dark"} onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")} className="cursor-pointer" />
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="">Model</span>
                                    <Select value={model ?? ''} onValueChange={(value) => {
                                        setModel(value as ModelType);
                                        setApiKey(aiModel?.find(m => m.id === value)?.apiKey || '');
                                    }}>
                                        <SelectTrigger className="w-full flex-1">
                                            <SelectValue placeholder="Select your preferred model" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {
                                                AI_MODELS.map((m) => (
                                                    <SelectItem key={m.id} value={m.id}>
                                                        {m.name}
                                                    </SelectItem>
                                                ))
                                            }
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center justify-between gap-4">
                                    <span className="">API Key</span>
                                    <Input placeholder="Enter your API key" className="w-full flex-1" value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
                                </div>
                                <Button className="bg-btn hover:bg-btn-hover cursor-pointer w-full" onClick={() => {
                                    if (model && apiKey.length > 0) {
                                        setAIModel(model, apiKey)
                                        toast("Settings saved successfully!")
                                        setIsOpen(false);
                                    }
                                }}>
                                    Save
                                </Button>
                            </div>
                        </div>
                    </DrawerContent>
                </Drawer>
                {
                    // isAuthenticated ? <Menubar className="p-0 border-0">
                    //     <MenubarMenu>
                    //         <MenubarTrigger className="cursor-pointer p-0 rounded-full" asChild>
                    //             <Avatar className="cursor-pointer">
                    //                 <AvatarImage src="https://github.com/shadcn.png" />
                    //                 <AvatarFallback>CN</AvatarFallback>
                    //             </Avatar>
                    //         </MenubarTrigger>
                    //         <MenubarContent>
                    //             <MenubarItem className="cursor-pointer text-red-600 focus:text-red-600">Log Out</MenubarItem>
                    //         </MenubarContent>
                    //     </MenubarMenu>
                    // </Menubar> : <Button className="bg-btn hover:bg-btn-hover cursor-pointer">
                    //     Sign in
                    // </Button>
                }
            </div>
        </header>
    );
};


export default Navbar;