"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Address } from "@scaffold-ui/components";
import { parseEther } from "viem";
import { useAccount } from "wagmi";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useTargetNetwork } from "~~/hooks/scaffold-eth";
import { useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

interface TopicData {
  title: string;
  options: string[];
  voteCounts: bigint[];
  creator: string;
  totalVotes: bigint;
}

const TopicPage = () => {
  const params = useParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const topicId = params?.topicId ? parseInt(params.topicId as string) : null;
  const { address: connectedAddress } = useAccount();
  const { targetNetwork } = useTargetNetwork();
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [hasUserVoted, setHasUserVoted] = useState(false);

  // Fixed voting amount: 0.001 MON
  const VOTE_AMOUNT = "0.001";

  // Ensure component is mounted (client-side only)
  useEffect(() => {
    setMounted(true);
  }, []);

  const { writeContractAsync: voteAsync } = useScaffoldWriteContract({
    contractName: "YourContract",
  });

  const { data: topicDataRaw, refetch: refetchTopic } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getTopic" as any,
    args: (topicId !== null ? [BigInt(topicId)] : undefined) as any,
    query: {
      enabled: topicId !== null,
      refetchInterval: 5000, // Refresh every 5 seconds to show updated vote counts
    },
  }) as { data: [string, string[], bigint[], string, bigint] | undefined; refetch: () => void };

  // Transform the raw data to TopicData format
  // Only process if we have valid data
  const topicData: TopicData | undefined =
    topicDataRaw && Array.isArray(topicDataRaw) && topicDataRaw.length >= 5
      ? {
          title: topicDataRaw[0] || "",
          options: Array.isArray(topicDataRaw[1]) ? topicDataRaw[1] : [],
          voteCounts: Array.isArray(topicDataRaw[2]) ? topicDataRaw[2] : [],
          creator: topicDataRaw[3] || "",
          totalVotes: topicDataRaw[4] || 0n,
        }
      : undefined;

  const { data: userHasVoted } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "checkHasVoted" as any,
    args: (topicId !== null && connectedAddress ? [BigInt(topicId), connectedAddress] : undefined) as any,
    query: {
      enabled: topicId !== null && connectedAddress !== undefined,
    },
  }) as { data: boolean | undefined };

  useEffect(() => {
    if (userHasVoted !== undefined && typeof userHasVoted === "boolean") {
      setHasUserVoted(userHasVoted);
    }
  }, [userHasVoted]);

  // Show loading state until component is mounted
  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (topicId === null || isNaN(topicId)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Topic ID</h1>
          <button className="btn btn-primary" onClick={() => router.push("/")}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!topicData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg"></span>
          <p className="mt-4">Loading topic...</p>
        </div>
      </div>
    );
  }

  // Validate topicData structure
  if (
    !topicData.options ||
    !topicData.voteCounts ||
    !Array.isArray(topicData.options) ||
    !Array.isArray(topicData.voteCounts)
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Topic Not Found</h1>
          <p className="mb-4">The topic with ID {topicId} does not exist or data is invalid.</p>
          <button className="btn btn-primary" onClick={() => router.push("/")}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const handleVote = async () => {
    if (!connectedAddress) {
      notification.error("Please connect your wallet");
      return;
    }

    if (selectedOption === null) {
      notification.error("Please select an option");
      return;
    }

    if (hasUserVoted) {
      notification.error("You have already voted on this topic");
      return;
    }

    try {
      setIsVoting(true);
      await (voteAsync as any)({
        functionName: "vote",
        args: [BigInt(topicId), BigInt(selectedOption)],
        value: parseEther(VOTE_AMOUNT),
      });

      notification.success("Vote submitted successfully!");
      setSelectedOption(null);
      setHasUserVoted(true);
      refetchTopic();
    } catch (error: any) {
      console.error("Error voting:", error);
      notification.error(error?.message || "Failed to vote");
    } finally {
      setIsVoting(false);
    }
  };

  const totalVotes = Number(topicData.totalVotes || 0n);
  const voteCountsArray = topicData.voteCounts || [];
  const maxVotes = voteCountsArray.length > 0 ? Math.max(...voteCountsArray.map(count => Number(count || 0n)), 1) : 1;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <button className="btn btn-ghost mb-4" onClick={() => router.push("/")}>
        <ArrowLeftIcon className="h-5 w-5 mr-2" />
        Back to Home
      </button>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-3xl mb-4">{topicData.title}</h1>

          <div className="mb-4">
            <p className="text-sm text-base-content/70">Created by:</p>
            <Address address={topicData.creator as `0x${string}`} chain={targetNetwork} />
          </div>

          <div className="divider"></div>

          <h2 className="text-2xl font-bold mb-4">Voting Options</h2>

          {!hasUserVoted ? (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-2">Cast Your Vote:</h3>
              <div className="space-y-2 mb-4">
                {topicData.options.map((option, index) => (
                  <div key={index} className="form-control">
                    <label className="label cursor-pointer">
                      <span className="label-text text-lg">{option}</span>
                      <input
                        type="radio"
                        name="voteOption"
                        className="radio radio-primary"
                        checked={selectedOption === index}
                        onChange={() => setSelectedOption(index)}
                      />
                    </label>
                  </div>
                ))}
              </div>

              <div className="mb-4">
                <div className="alert alert-info">
                  <div>
                    <span className="font-semibold">Payment Amount: </span>
                    <span className="text-lg">{VOTE_AMOUNT} MON</span>
                  </div>
                  <div className="text-sm mt-1 text-base-content/70">
                    You will pay {VOTE_AMOUNT} MON to cast your vote
                  </div>
                </div>
              </div>

              <button
                className="btn btn-primary w-full"
                onClick={handleVote}
                disabled={isVoting || selectedOption === null}
              >
                {isVoting ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    Voting...
                  </>
                ) : (
                  "Vote"
                )}
              </button>
            </div>
          ) : (
            <div className="alert alert-info mb-6">
              <span>You have already voted on this topic.</span>
            </div>
          )}

          {/* Only show voting results if the connected wallet has voted */}
          {hasUserVoted ? (
            <>
              <div className="divider"></div>

              <h2 className="text-2xl font-bold mb-4">Voting Results</h2>
              <p className="text-sm text-base-content/70 mb-4">
                Total Votes: <span className="font-bold">{totalVotes}</span>
              </p>

              <div className="space-y-4">
                {topicData.options.map((option, index) => {
                  const voteCount = Number(voteCountsArray[index] || 0n);
                  const percentage = totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{option}</span>
                        <span className="text-sm">
                          {voteCount} vote{voteCount !== 1 ? "s" : ""} ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <progress
                        className="progress progress-primary w-full"
                        value={voteCount}
                        max={maxVotes}
                      ></progress>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <>
              <div className="divider"></div>
              <div className="alert alert-warning">
                {connectedAddress ? (
                  <div>
                    <p className="font-semibold mb-2">Voting Results Hidden</p>
                    <p>
                      You must vote to view the voting results. Connect your wallet and cast your vote to see the
                      results.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-semibold mb-2">Voting Results Hidden</p>
                    <p>Please connect your wallet and vote to view the voting results.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default TopicPage;
