"use client";

import { useEffect, useState } from "react";
import { Address } from "@scaffold-ui/components";
import type { NextPage } from "next";
import { useAccount } from "wagmi";
import { PlusIcon } from "@heroicons/react/24/outline";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const Home: NextPage = () => {
  const { address: connectedAddress } = useAccount();
  const { targetNetwork } = useTargetNetwork();
  const [topicTitle, setTopicTitle] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [isCreating, setIsCreating] = useState(false);
  const [createdTopicLink, setCreatedTopicLink] = useState<string>("");
  const [topicCountBefore, setTopicCountBefore] = useState<bigint | undefined>();

  const { writeContractAsync: createTopicAsync } = useScaffoldWriteContract({
    contractName: "YourContract",
  });

  const { data: topicCount } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getTopicCount" as any,
  }) as { data: bigint | undefined };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""]);
    }
  };

  const removeOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  useEffect(() => {
    // Update the link when topic count changes after creation
    if (
      topicCountBefore !== undefined &&
      topicCount &&
      typeof topicCount === "bigint" &&
      topicCount > topicCountBefore
    ) {
      const newTopicId = Number(topicCount) - 1;
      const link = `${window.location.origin}/topic/${newTopicId}`;
      setCreatedTopicLink(link);
      setTopicCountBefore(undefined);
    }
  }, [topicCount, topicCountBefore]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!connectedAddress) {
      notification.error("Please connect your wallet");
      return;
    }

    const trimmedTitle = topicTitle.trim();
    const trimmedOptions = options.map(opt => opt.trim()).filter(opt => opt.length > 0);

    if (!trimmedTitle) {
      notification.error("Please enter a topic title");
      return;
    }

    if (trimmedOptions.length < 2) {
      notification.error("Please enter at least 2 options");
      return;
    }

    try {
      setIsCreating(true);
      setCreatedTopicLink("");

      // Save current topic count before creation
      const currentCount = (topicCount && typeof topicCount === "bigint" ? topicCount : 0n) as bigint;
      setTopicCountBefore(currentCount);

      await (createTopicAsync as any)({
        functionName: "createTopic",
        args: [trimmedTitle, trimmedOptions],
      });

      notification.success("Topic created successfully!");

      // Reset form
      setTopicTitle("");
      setOptions(["", ""]);
    } catch (error: any) {
      console.error("Error creating topic:", error);
      notification.error(error?.message || "Failed to create topic");
      setTopicCountBefore(undefined);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <div className="flex items-center flex-col grow pt-10">
        <div className="px-5 w-full max-w-4xl">
          <h1 className="text-center">
            <span className="block text-2xl mb-2">Welcome to</span>
            <span className="block text-4xl font-bold">Voting DApp</span>
          </h1>
          <div className="flex justify-center items-center space-x-2 flex-col mb-8">
            <p className="my-2 font-medium">Connected Address:</p>
            <Address address={connectedAddress} chain={targetNetwork} />
          </div>

          {/* Create Topic Form */}
          <div className="card bg-base-100 shadow-xl mb-8">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Create New Voting Topic</h2>
              <form onSubmit={handleSubmit}>
                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Topic Title</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter topic title"
                    className="input input-bordered w-full"
                    value={topicTitle}
                    onChange={e => setTopicTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-control mb-4">
                  <label className="label">
                    <span className="label-text">Options (at least 2, maximum 10)</span>
                  </label>
                  {options.map((option, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <input
                        type="text"
                        placeholder={`Option ${index + 1}`}
                        className="input input-bordered flex-1"
                        value={option}
                        onChange={e => handleOptionChange(index, e.target.value)}
                        required
                      />
                      {options.length > 2 && (
                        <button type="button" className="btn btn-error btn-sm" onClick={() => removeOption(index)}>
                          Remove
                        </button>
                      )}
                    </div>
                  ))}
                  {options.length < 10 && (
                    <button type="button" className="btn btn-ghost btn-sm mt-2" onClick={addOption}>
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add Option
                    </button>
                  )}
                </div>

                <div className="card-actions justify-end">
                  <button type="submit" className="btn btn-primary" disabled={isCreating}>
                    {isCreating ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Creating...
                      </>
                    ) : (
                      "Create Topic"
                    )}
                  </button>
                </div>
              </form>

              {createdTopicLink && (
                <div className="alert alert-success mt-4">
                  <div>
                    <span>Topic created! Share this link:</span>
                    <div className="mt-2">
                      <input
                        type="text"
                        className="input input-bordered w-full"
                        value={createdTopicLink}
                        readOnly
                        onClick={e => (e.target as HTMLInputElement).select()}
                      />
                      <button
                        className="btn btn-sm btn-primary mt-2"
                        onClick={() => {
                          navigator.clipboard.writeText(createdTopicLink);
                          notification.success("Link copied to clipboard!");
                        }}
                      >
                        Copy Link
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
