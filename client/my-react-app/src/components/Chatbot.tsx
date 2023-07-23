import { FC, useEffect, useRef, useState } from "react";
import { BarsArrowUpIcon, RocketLaunchIcon, UserIcon } from '@heroicons/react/24/solid';

type ChatMessage = {
    role: string,
    content: string
};

export const ChatBot: FC = () => {

    const [chatSession, setChatSession] = useState<ChatMessage[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);

    const processingMessage = useRef<HTMLParagraphElement>(null);
    const chatInput = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef(null);
    const [showPremium, setShowPremium] = useState<boolean>(false);
    const [currentAssistantMessage, setCurrentAssistantMessage] = useState("");
    const [userContext, setUserContext] =
        useState<{}>({ username: 'a@switchfeat.com', isPremium: true });

    const classNames = (...classes: string[]) => {
        return classes.filter(Boolean).join(' ')
    }

    useEffect(() => {
        const formData = new FormData();
        formData.append('flagKey', "premium-delivery");
        formData.append('flagContext', JSON.stringify(userContext));
        formData.append('correlationId', 'test correlation id');


        const evaluateFlag = () => {
            fetch(`http://localhost:4000/api/sdk/flag/`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Access-Control-Allow-Credentials": "true",
                    "Access-Control-Allow-Origin": "true"
                },
                body: formData
            }).then(resp => {
                return resp.json();
            }).then(respJson => {
                setShowPremium(respJson.data.match);
            }).catch(error => { console.log(error); });
        };
        evaluateFlag();
    }, [userContext]);


    const processOrderRequest = async () => {

        setIsProcessing(true);
        if (!chatInput.current) {
            setIsProcessing(false);
            return;
        }

        chatSession.push({ role: "user", content: chatInput.current.value });
        const tempArr: ChatMessage[] = [];
        for (const t of chatSession) {
            tempArr.push(t);
        }
        setChatSession([...tempArr]);

        fetch("http://localhost:4000/api/order-request", {
            method: "POST",
            body: JSON.stringify({ newMessage: chatInput.current.value }),
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((res) => res.json())
            .then((result) => {
                const order: any[] = [];
                result.items.forEach((x: any) => {
                    const options = x.product.options ? x.product.options.map((opt: any) => { return { name: opt.name, quantity: opt.optionQuantity }; }) : [];
                    order.push({ product: x.product.name, options: options, size: x.product.size });
                });
                console.log(order);

                const orderString: string[] = [];
                order.forEach((x: any) => {
                    orderString.push(`${x.size} ${x.product} with ${x.options.map((x: any) => `${x.quantity === undefined ? "" : x.quantity} ${x.name}`).join(" and ")}`);
                });
                const resp = `🎉🎉 Thanks for your order! 🎉🎉 \n\n ☕> ${orderString.join("\n ☕> ")}`;
                tempArr.push({ role: "assistant", content: resp });
                setChatSession([...tempArr]);
                setCurrentAssistantMessage("");
                if (processingMessage.current)
                    processingMessage.current.innerText = "";
                if (chatInput.current)
                    chatInput.current.value = "";
            })
            .catch((err) => console.error(err))
            .finally(() => { setIsProcessing(false); });
    };


    return (

        <div className="flex min-h-full flex-1 flex-col justify-center overflow-hidden">
            <div className="divide-y divide-gray-200 overflow-hidden  flex  flex-col justify-between">
                <div className="w-full h-full px-4 py-5 sm:p-6 mb-32">
                    <ul className="mb-8  h-full">
                        {chatSession.map((x, index) =>
                        (x.role !== 'system' ?
                            <div key={index}>
                                <li>
                                    <div className="relative pb-8">
                                        {index !== chatSession.length - 1 ? (
                                            <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                                        ) : null}
                                        <div className="relative flex space-x-3">
                                            <div>
                                                <span className={classNames('h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white', x.role === 'user' ? 'bg-slate-600' : 'bg-orange-500')}>
                                                    {x.role === 'user' && <UserIcon className="h-5 w-5 text-white" aria-hidden="true" />}
                                                    {x.role === 'assistant' && <RocketLaunchIcon className="h-5 w-5 text-white" aria-hidden="true" />}
                                                </span>
                                            </div>
                                            <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1">
                                                <div>
                                                    <p className="text-md text-gray-500" style={{ whiteSpace: "pre-wrap" }}>
                                                        {x.content}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </li>
                            </div> : <div key={index}></div>))}
                        {isProcessing && (
                            <li key={'assistant-msg'}>
                                <div className="relative pb-8">
                                    <div className="relative flex space-x-3">
                                        <div>
                                            <span className={classNames('h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white', 'bg-orange-500')}>
                                                <RocketLaunchIcon className="h-5 w-5 text-white" aria-hidden="true" />
                                            </span>
                                        </div>
                                        <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1">
                                            <div>
                                                <p ref={processingMessage} className="text-md text-gray-500" style={{ whiteSpace: "pre-wrap" }}>
                                                    {currentAssistantMessage}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </li>)}
                        < div ref={messagesEndRef} />
                        {isProcessing && (
                            <button type="button" className="inline-flex items-center px-4 py-2 font-semibold leading-6 text-sm shadow rounded-md text-white bg-indigo-500 hover:bg-indigo-400 transition ease-in-out duration-150 cursor-not-allowed" disabled>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing...
                            </button>
                        )}
                    </ul>
                </div>
                <div className=" w-full bottom-0 mt-2 flex rounded-md   px-4 py-5 sm:p-6 bg-slate-50 fixed">
                    {showPremium && <PremiumFeatures />}
                    <div className="relative flex flex-grow items-stretch focus-within:z-10 w-full">
                        <input
                            ref={chatInput}
                            type="text"
                            name="textValue"
                            className="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                            placeholder="your order here..."
                        />
                    </div>
                    <button
                        onClick={processOrderRequest}
                        type="button"
                        className="relative -ml-px inline-flex items-center gap-x-1.5 rounded-r-md px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                    >
                        <BarsArrowUpIcon className="-ml-0.5 h-5 w-5 text-gray-400" aria-hidden="true" />
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

const PremiumFeatures: FC = () => {
    return (
        <>
        </>
    );
};