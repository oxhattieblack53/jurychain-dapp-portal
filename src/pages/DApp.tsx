import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, ArrowRight, Gavel, Scale, Shield } from "lucide-react";
import { useAccount, usePublicClient, useWalletClient, useSwitchChain } from "wagmi";
import { formatDistanceToNowStrict } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Buffer } from "buffer";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { SUPPORTED_CHAIN, USE_DEV_FHE } from "@/lib/web3";
import { JURYCHAIN_ADDRESS } from "@/lib/contract";
import { JURYCHAIN_ABI } from "@/lib/abi";
import { encryptVerdict, decryptTallies } from "@/lib/fhe";

type CaseInfo = {
  id: bigint;
  judge: string;
  deadline: bigint;
  isClosed: boolean;
  metadataURI: string;
  votesCast: bigint;
  jurorCount: bigint;
  jurors: string[];
  hasVoted: boolean;
};

const DEADLINE_MULTIPLIER = 1_000;

export default function DApp() {
  const { address, isConnected, chain } = useAccount();
  const publicClient = usePublicClient({ chainId: SUPPORTED_CHAIN.id });
  const { data: walletClient } = useWalletClient();
  const { switchChainAsync } = useSwitchChain();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [tallies, setTallies] = useState<Record<string, { guilty: number; notGuilty: number }>>({});
  const [devTallies, setDevTallies] = useState<Record<string, { guilty: number; notGuilty: number }>>({});
  const contractConfigured = useMemo(
    () => JURYCHAIN_ADDRESS !== "0x0000000000000000000000000000000000000000",
    [],
  );

  // Debug: Log when publicClient becomes available
  useEffect(() => {
    const isEnabled = Boolean(publicClient && contractConfigured);
    console.log("🔍 DApp Debug:", {
      publicClient: !!publicClient,
      publicClientType: typeof publicClient,
      publicClientKeys: publicClient ? Object.keys(publicClient).slice(0, 5) : [],
      contractConfigured,
      contractAddress: JURYCHAIN_ADDRESS,
      queryEnabled: isEnabled,
      address,
      isConnected,
    });
  }, [publicClient, contractConfigured, address, isConnected]);

  const casesQuery = useQuery<CaseInfo[]>({
    queryKey: ["cases", address],
    enabled: Boolean(publicClient && contractConfigured),
    refetchOnMount: true,
    staleTime: 0,
    queryFn: async () => {
      console.log("🚀 Query function called!");
      if (!publicClient) {
        console.warn("❌ No publicClient available");
        return [];
      }
      try {
        console.time("⏱️ Fetch Cases");

        console.time("  1️⃣ Get Case IDs");
        const ids = (await publicClient.readContract({
          address: JURYCHAIN_ADDRESS,
          abi: JURYCHAIN_ABI,
          functionName: "getCaseIds",
        })) as bigint[];
        console.timeEnd("  1️⃣ Get Case IDs");

        if (ids.length === 0) {
          console.timeEnd("⏱️ Fetch Cases");
          return [];
        }

        console.log(`📊 Fetching ${ids.length} cases in ONE batch call...`);

        // 🚀 OPTIMIZED: Use getBatchCaseDetails to fetch all cases in ONE call
        // This reduces RPC calls from 3N to 1 (30x faster for 10 cases!)
        console.time("  2️⃣ Batch Get All Case Details");
        const batchDetails = (await publicClient.readContract({
          address: JURYCHAIN_ADDRESS,
          abi: JURYCHAIN_ABI,
          functionName: "getBatchCaseDetails",
          args: [ids, address || "0x0000000000000000000000000000000000000000"],
        })) as Array<{
          caseId: bigint;
          judge: string;
          deadline: bigint;
          isClosed: boolean;
          metadataURI: string;
          votesCast: bigint;
          jurorCount: bigint;
          jurors: string[];
          hasVoted: boolean;
        }>;

        console.timeEnd("  2️⃣ Batch Get All Case Details");

        const cases = batchDetails.map((detail) => ({
          id: detail.caseId,
          judge: detail.judge,
          deadline: detail.deadline,
          isClosed: detail.isClosed,
          metadataURI: detail.metadataURI,
          votesCast: detail.votesCast,
          jurorCount: detail.jurorCount,
          jurors: detail.jurors,
          hasVoted: detail.hasVoted,
        })) satisfies CaseInfo[];

        console.timeEnd("⏱️ Fetch Cases");
        console.log(`✅ Successfully fetched ${cases.length} cases`);
        console.log("📋 Cases data:", cases);

        const sorted = cases.sort((a, b) => Number(b.id - a.id));
        console.log("📋 Sorted cases:", sorted);
        return sorted;
      } catch (error) {
        console.warn("Failed to fetch cases", error);
        return queryClient.getQueryData<CaseInfo[]>(["cases"]) ?? [];
      }
    },
    refetchInterval: 15_000,
    retry: 0,
    // Removed initialData to force query execution
    gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
  });

  useEffect(() => {
    if (typeof window !== "undefined") {
      (window as any).__JURYCHAIN_CASES__ = casesQuery.data;
      (window as any).__JURYCHAIN_CASES_ERROR__ = casesQuery.error;
    }
  }, [casesQuery.data, casesQuery.error]);

  const isOnSupportedChain = useMemo(() => chain?.id === SUPPORTED_CHAIN.id, [chain]);

  useEffect(() => {
    if (isConnected && !isOnSupportedChain && switchChainAsync) {
      switchChainAsync({ chainId: SUPPORTED_CHAIN.id }).catch(() => {
        toast({
          title: "Network switch required",
          description: "Please switch to Sepolia to interact with JuryChain.",
          variant: "destructive",
        });
      });
    }
  }, [isConnected, isOnSupportedChain, switchChainAsync, toast]);


  const castVoteMutation = useMutation({
    mutationKey: ["castVote"],
    mutationFn: async (payload: { caseId: bigint; isGuilty: boolean }) => {
      if (!contractConfigured) throw new Error("Contract address not configured");
      if (!walletClient || !address) throw new Error("Connect your wallet to vote");
      if (!publicClient) throw new Error("Public client unavailable. Refresh and try again.");

      if (USE_DEV_FHE) {
        const txHash = await walletClient.writeContract({
          address: JURYCHAIN_ADDRESS,
          abi: JURYCHAIN_ABI,
          functionName: "castVoteDev",
          args: [payload.caseId, payload.isGuilty],
          account: address,
          gas: 500000n, // 设置合理的 gas limit（50万）
        });
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        return txHash;
      }

      const encrypted = await encryptVerdict(JURYCHAIN_ADDRESS, address, payload.isGuilty);
      console.debug("Encrypted verdict", encrypted);
      const encryptedHandle = Array.isArray(encrypted.handles)
        ? encrypted.handles[0]
        : (encrypted as unknown as { handles: string[] }).handles[0];
      const handleHex = typeof encryptedHandle === "string"
        ? (encryptedHandle as `0x${string}`)
        : (`0x${Buffer.from(encryptedHandle as Uint8Array).toString("hex")}` as `0x${string}`);
      const proofHex = (`0x${Buffer.from(encrypted.inputProof).toString("hex")}`) as `0x${string}`;
      const txHash = await walletClient.writeContract({
        address: JURYCHAIN_ADDRESS,
        abi: JURYCHAIN_ABI,
        functionName: "castVote",
        args: [payload.caseId, handleHex, proofHex],
        account: address,
      });

      await publicClient.waitForTransactionReceipt({ hash: txHash });
      return txHash;
    },
    onSuccess: async (_tx, payload) => {
      await queryClient.invalidateQueries({ queryKey: ["cases"] });
      const updated = (queryClient.getQueryData<CaseInfo[]>(["cases"]) ?? []).map((item) =>
        item.id === payload.caseId
          ? {
              ...item,
              hasVoted: true,
              votesCast: item.votesCast + BigInt(1),
            }
          : item,
      );
      queryClient.setQueryData(["cases"], updated);
      if (USE_DEV_FHE) {
        setDevTallies((previous) => {
          const caseKey = payload.caseId.toString();
          const current = previous[caseKey] ?? { guilty: 0, notGuilty: 0 };
          return {
            ...previous,
            [caseKey]: {
              guilty: current.guilty + (payload.isGuilty ? 1 : 0),
              notGuilty: current.notGuilty + (payload.isGuilty ? 0 : 1),
            },
          };
        });
      }
      toast({ title: "Vote submitted", description: "Your encrypted verdict has been recorded." });
    },
    onError: (error: unknown) => {
      console.error("castVote error", error);
      toast({
        title: "Vote failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  const closeCaseMutation = useMutation({
    mutationKey: ["closeCase"],
    mutationFn: async (caseId: bigint) => {
      if (!contractConfigured) throw new Error("Contract address not configured");
      if (!walletClient || !address) throw new Error("Connect your wallet to close the case");
      if (!publicClient) throw new Error("Public client unavailable. Refresh and try again.");
      const txHash = await walletClient.writeContract({
        address: JURYCHAIN_ADDRESS,
        abi: JURYCHAIN_ABI,
        functionName: "closeCase",
        args: [caseId],
        account: address,
        gas: 1000000n, // 设置合理的 gas limit（100万，关闭案例需要更多 gas）
      });
      await publicClient.waitForTransactionReceipt({ hash: txHash });
      return txHash;
    },
    onSuccess: async (_tx, variables) => {
      await queryClient.invalidateQueries({ queryKey: ["cases"] });
      const updated = (queryClient.getQueryData<CaseInfo[]>(["cases"]) ?? []).map((item) =>
        item.id === variables
          ? {
              ...item,
              isClosed: true,
            }
          : item,
      );
      queryClient.setQueryData(["cases"], updated);
      toast({ title: "Case closed", description: "Results can now be decrypted." });
    },
    onError: (error: unknown) => {
      toast({
        title: "Close case failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  const handleDecryptTallies = async (caseId: bigint) => {
    try {
      if (!contractConfigured) throw new Error("Contract address not configured");
      if (USE_DEV_FHE) {
        try {
          const plain = await publicClient?.readContract({
            address: JURYCHAIN_ADDRESS,
            abi: JURYCHAIN_ABI,
            functionName: "getPlainTallies",
            args: [caseId],
          });

          if (!plain) throw new Error("Unable to fetch tallies");
          const [guiltyCount, notGuiltyCount] = plain as [bigint, bigint];
          setTallies((prev) => ({
            ...prev,
            [caseId.toString()]: { guilty: Number(guiltyCount), notGuilty: Number(notGuiltyCount) },
          }));
        } catch (error) {
          const fallback = devTallies[caseId.toString()];
          if (fallback) {
            setTallies((prev) => ({ ...prev, [caseId.toString()]: fallback }));
          } else {
            throw error;
          }
        }
      } else {
        const result = await publicClient?.readContract({
          address: JURYCHAIN_ADDRESS,
          abi: JURYCHAIN_ABI,
          functionName: "getEncryptedTallies",
          args: [caseId],
        });

        if (!result) throw new Error("Unable to fetch tallies");
        const decrypted = await decryptTallies(result as string[]);
        setTallies((prev) => ({ ...prev, [caseId.toString()]: { guilty: decrypted[0], notGuilty: decrypted[1] } }));
      }
      toast({ title: "Tallies decrypted", description: "Verdict counts are visible below." });
    } catch (error) {
      toast({
        title: "Decryption failed",
        description:
          error instanceof Error
            ? error.message
            : "Unable to decrypt tallies. Ensure you have access permissions.",
        variant: "destructive",
      });
    }
  };


  const parseMetadata = (metadataURI: string) => {
    try {
      console.log("🔍 Parsing metadata:", metadataURI.substring(0, 50) + "...");
      if (metadataURI.startsWith("data:application/json;base64,")) {
        const base64 = metadataURI.replace("data:application/json;base64,", "");
        const json = Buffer.from(base64, "base64").toString("utf-8");
        const parsed = JSON.parse(json);
        console.log("✅ Parsed metadata:", parsed);
        return parsed;
      }
      console.log("⚠️ Not a base64 metadata URI");
      return { title: "Untitled Case", description: metadataURI };
    } catch (error) {
      console.warn("❌ Failed to parse metadata", error);
      return { title: "Untitled Case", description: "Failed to load case details" };
    }
  };

  const renderCaseCard = (caseInfo: CaseInfo) => {
    const caseIdStr = caseInfo.id.toString();
    const metadata = parseMetadata(caseInfo.metadataURI);
    const deadlineSeconds = Number(caseInfo.deadline);
    const deadlineDate =
      Number.isFinite(deadlineSeconds) && deadlineSeconds > 0
        ? new Date(deadlineSeconds * DEADLINE_MULTIPLIER)
        : new Date();
    const deadlineLabel =
      Number.isFinite(deadlineSeconds) && deadlineSeconds > 0
        ? formatDistanceToNowStrict(deadlineDate, { addSuffix: true })
        : "N/A";
    const isJuror = address ? caseInfo.jurors.some((j) => j.toLowerCase() === address.toLowerCase()) : false;
    const isJudge = address && caseInfo.judge ? caseInfo.judge.toLowerCase() === address.toLowerCase() : false;
    const talliesForCase = tallies[caseIdStr];

    return (
      <Card key={caseIdStr} className="p-6 border-border hover:shadow-elegant transition-shadow">
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Scale className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="text-xl font-bold">{metadata.title || `Case #${caseIdStr}`}</h3>
                <span className="text-sm text-muted-foreground">Judge: {caseInfo.judge.slice(0, 6)}...{caseInfo.judge.slice(-4)}</span>
              </div>
              {metadata.description && (
                <p className="text-sm text-muted-foreground break-words mt-2 line-clamp-2">
                  {metadata.description}
                </p>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground block">Status</span>
              <span className="font-medium" data-testid={`status-${caseIdStr}`}>
                {caseInfo.isClosed ? "Closed" : "Active"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Jurors</span>
              <span className="font-medium">{caseInfo.jurorCount.toString()}</span>
            </div>
            <div>
              <span className="text-muted-foreground block">Votes Cast</span>
              <span className="font-medium">
                {caseInfo.votesCast.toString()} / {caseInfo.jurorCount.toString()}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block">Deadline</span>
              <span className="font-medium">{deadlineLabel}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            {isJuror && !caseInfo.isClosed && (
              <>
                <Button
                  disabled={caseInfo.hasVoted || castVoteMutation.isPending}
                  onClick={() => castVoteMutation.mutate({ caseId: caseInfo.id, isGuilty: true })}
                >
                  Vote Guilty
                </Button>
                <Button
                  variant="secondary"
                  disabled={caseInfo.hasVoted || castVoteMutation.isPending}
                  onClick={() => castVoteMutation.mutate({ caseId: caseInfo.id, isGuilty: false })}
                >
                  Vote Not Guilty
                </Button>
              </>
            )}

            {caseInfo.hasVoted && !caseInfo.isClosed && (
              <span
                className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs uppercase tracking-wide"
                data-testid={`vote-status-${caseIdStr}`}
              >
                Vote submitted
              </span>
            )}

            {isJudge && !caseInfo.isClosed && (
              <Button
                variant="outline"
                disabled={closeCaseMutation.isPending}
                onClick={() => closeCaseMutation.mutate(caseInfo.id)}
              >
                Close Case
              </Button>
            )}

            {caseInfo.isClosed && (
              <Button variant="ghost" onClick={() => handleDecryptTallies(caseInfo.id)}>
                Decrypt Tallies
              </Button>
            )}
          </div>

          {talliesForCase && (
            <div className="grid md:grid-cols-2 gap-4">
              <Card
                className="p-4 bg-primary/10 border-primary/30"
                data-testid={`tallies-${caseIdStr}-guilty`}
              >
                <div className="flex items-center gap-2">
                  <Gavel className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-primary">Guilty</span>
                </div>
                <p className="text-2xl font-bold mt-2">{talliesForCase.guilty}</p>
              </Card>
              <Card
                className="p-4 bg-accent/10 border-accent/30"
                data-testid={`tallies-${caseIdStr}-not-guilty`}
              >
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-accent" />
                  <span className="font-semibold text-accent">Not Guilty</span>
                </div>
                <p className="text-2xl font-bold mt-2">{talliesForCase.notGuilty}</p>
              </Card>
            </div>
          )}

          {/* View Details Link */}
          <div className="pt-2 border-t border-border">
            <Link to={`/case/${caseIdStr}`}>
              <Button variant="ghost" className="w-full justify-between">
                View Full Details
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8 space-y-8">
        <header className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-gold rounded-lg shadow-glow">
              <Scale className="w-6 h-6 text-legal-blue-dark" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">JuryChain DApp</h1>
              <p className="text-muted-foreground">Encrypted verdict voting for decentralized justice.</p>
            </div>
          </div>
        </header>

        {!contractConfigured && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Contract address is not configured. Set VITE_CONTRACT_ADDRESS before interacting.
            </AlertDescription>
          </Alert>
        )}

        {!isConnected && contractConfigured && (
          <Alert className="border-primary/20 bg-primary/5">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="text-primary">
              Connect your wallet to cast encrypted votes. You can view cases without connecting.
            </AlertDescription>
          </Alert>
        )}


        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Cases</h2>
            <span className="text-sm text-muted-foreground">
              {casesQuery.isLoading ? "Loading cases..." : `${casesQuery.data?.length ?? 0} found`}
            </span>
          </div>

          {casesQuery.data && casesQuery.data.length > 0 ? (
            <div className="grid gap-6">{casesQuery.data.map(renderCaseCard)}</div>
          ) : (
            <Card className="p-12 text-center text-muted-foreground">
              <Scale className="w-10 h-10 mx-auto mb-4 opacity-40" />
              <p>No cases available. Create the first encrypted trial to get started.</p>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
