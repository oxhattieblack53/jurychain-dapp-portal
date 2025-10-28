/**
 * Case Detail Page - Individual Case View
 *
 * This page displays detailed information about a specific jury case and allows:
 * - Viewing case metadata and status
 * - Casting encrypted votes (for jurors)
 * - Closing the case (for judge)
 * - Decrypting and viewing results (after closure)
 *
 * Features:
 * - Role-based UI (judge, juror, or observer)
 * - Real-time vote tallies
 * - FHE encryption for votes
 * - Progress indicators for voting
 * - Automatic result decryption after case closure
 */

import { useEffect, useState, useMemo } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Clock,
  Gavel,
  Lock,
  Scale,
  Shield,
  ThumbsDown,
  ThumbsUp,
  Users,
  XCircle,
} from "lucide-react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { formatDistanceToNowStrict } from "date-fns";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Buffer } from "buffer";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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

type CaseMetadata = {
  title?: string;
  description?: string;
  createdAt?: string;
};

const DEADLINE_MULTIPLIER = 1_000;

export default function CaseDetail() {
  const { caseId } = useParams<{ caseId: string }>();
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient({ chainId: SUPPORTED_CHAIN.id });
  const { data: walletClient } = useWalletClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [tallies, setTallies] = useState<{ guilty: number; notGuilty: number } | null>(null);
  const [metadata, setMetadata] = useState<CaseMetadata | null>(null);

  const contractConfigured = useMemo(
    () => JURYCHAIN_ADDRESS !== "0x0000000000000000000000000000000000000000",
    [],
  );

  // Fetch case details
  const caseQuery = useQuery<CaseInfo | null>({
    queryKey: ["case", caseId],
    enabled: Boolean(publicClient && contractConfigured && caseId),
    queryFn: async () => {
      if (!publicClient || !caseId) return null;

      try {
        const id = BigInt(caseId);

        // 🚀 OPTIMIZED: Use getCaseFullDetails to fetch all data in ONE call
        // This reduces RPC calls from 3 to 1 (3x faster!)
        const details = (await publicClient.readContract({
          address: JURYCHAIN_ADDRESS,
          abi: JURYCHAIN_ABI,
          functionName: "getCaseFullDetails",
          args: [id, address || "0x0000000000000000000000000000000000000000"],
        })) as {
          caseId: bigint;
          judge: string;
          deadline: bigint;
          isClosed: boolean;
          metadataURI: string;
          votesCast: bigint;
          jurorCount: bigint;
          jurors: string[];
          hasVoted: boolean;
        };

        return {
          id,
          judge: details.judge,
          deadline: details.deadline,
          isClosed: details.isClosed,
          metadataURI: details.metadataURI,
          votesCast: details.votesCast,
          jurorCount: details.jurorCount,
          jurors: details.jurors,
          hasVoted: details.hasVoted,
        } satisfies CaseInfo;
      } catch (error) {
        console.warn("Failed to fetch case", error);
        return null;
      }
    },
    refetchInterval: 10_000,
    retry: 1,
    staleTime: 5_000, // Consider data fresh for 5 seconds
    gcTime: 5 * 60 * 1000, // Keep unused data in cache for 5 minutes
  });

  // Parse metadata URI
  useEffect(() => {
    if (!caseQuery.data?.metadataURI) return;

    try {
      const uri = caseQuery.data.metadataURI;
      if (uri.startsWith("data:application/json;base64,")) {
        const base64 = uri.replace("data:application/json;base64,", "");
        const decoded = atob(base64);
        const parsed = JSON.parse(decoded) as CaseMetadata;
        setMetadata(parsed);
      } else {
        setMetadata({ title: uri, description: "" });
      }
    } catch (error) {
      console.warn("Failed to parse metadata", error);
      setMetadata({ title: caseQuery.data.metadataURI, description: "" });
    }
  }, [caseQuery.data?.metadataURI]);

  /**
   * Cast Vote Mutation
   */
  const castVoteMutation = useMutation({
    mutationKey: ["castVote", caseId],
    mutationFn: async (isGuilty: boolean) => {
      if (!contractConfigured) throw new Error("Contract address not configured");
      if (!walletClient || !address) throw new Error("Connect your wallet to vote");
      if (!publicClient) throw new Error("Public client unavailable");
      if (!caseId) throw new Error("Invalid case ID");

      const id = BigInt(caseId);

      // Development mode: Use plain-text voting
      if (USE_DEV_FHE) {
        const txHash = await walletClient.writeContract({
          address: JURYCHAIN_ADDRESS,
          abi: JURYCHAIN_ABI,
          functionName: "castVoteDev",
          args: [id, isGuilty],
          account: address,
          gas: 500000n, // 设置合理的 gas limit（50万）
        });
        await publicClient.waitForTransactionReceipt({ hash: txHash });
        return txHash;
      }

      // Production mode: Use FHE encryption
      const encrypted = await encryptVerdict(JURYCHAIN_ADDRESS, address, isGuilty);
      const encryptedHandle = Array.isArray(encrypted.handles)
        ? encrypted.handles[0]
        : (encrypted as unknown as { handles: string[] }).handles[0];
      const handleHex =
        typeof encryptedHandle === "string"
          ? (encryptedHandle as `0x${string}`)
          : (`0x${Buffer.from(encryptedHandle as Uint8Array).toString("hex")}` as `0x${string}`);
      const proofHex = `0x${Buffer.from(encrypted.inputProof).toString("hex")}` as `0x${string}`;

      const txHash = await walletClient.writeContract({
        address: JURYCHAIN_ADDRESS,
        abi: JURYCHAIN_ABI,
        functionName: "castVote",
        args: [id, handleHex, proofHex],
        account: address,
      });

      await publicClient.waitForTransactionReceipt({ hash: txHash });
      return txHash;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["case", caseId] });
      toast({ title: "Vote submitted", description: "Your encrypted verdict has been recorded" });
    },
    onError: (error: unknown) => {
      toast({
        title: "Vote failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  /**
   * Close Case Mutation
   */
  const closeCaseMutation = useMutation({
    mutationKey: ["closeCase", caseId],
    mutationFn: async () => {
      if (!contractConfigured) throw new Error("Contract address not configured");
      if (!walletClient || !address) throw new Error("Connect your wallet to close the case");
      if (!publicClient) throw new Error("Public client unavailable");
      if (!caseId) throw new Error("Invalid case ID");

      const txHash = await walletClient.writeContract({
        address: JURYCHAIN_ADDRESS,
        abi: JURYCHAIN_ABI,
        functionName: "closeCase",
        args: [BigInt(caseId)],
        account: address,
        gas: 1000000n, // 设置合理的 gas limit（100万，关闭案例需要更多 gas）
      });

      await publicClient.waitForTransactionReceipt({ hash: txHash });
      return txHash;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["case", caseId] });
      toast({ title: "Case closed", description: "Results can now be decrypted" });
    },
    onError: (error: unknown) => {
      toast({
        title: "Close case failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  /**
   * Decrypt tallies after case is closed
   */
  const handleDecryptTallies = async () => {
    if (!caseId || !publicClient || !contractConfigured) return;

    try {
      const id = BigInt(caseId);

      if (USE_DEV_FHE) {
        // Development mode: Fetch plain tallies
        const plain = await publicClient.readContract({
          address: JURYCHAIN_ADDRESS,
          abi: JURYCHAIN_ABI,
          functionName: "getPlainTallies",
          args: [id],
        });

        if (!plain) throw new Error("Unable to fetch tallies");
        const [guiltyCount, notGuiltyCount] = plain as [bigint, bigint];
        setTallies({ guilty: Number(guiltyCount), notGuilty: Number(notGuiltyCount) });
      } else {
        // Production mode: Fetch encrypted tallies and decrypt
        const result = await publicClient.readContract({
          address: JURYCHAIN_ADDRESS,
          abi: JURYCHAIN_ABI,
          functionName: "getEncryptedTallies",
          args: [id],
        });

        if (!result) throw new Error("Unable to fetch tallies");
        const decrypted = await decryptTallies(result as string[]);
        setTallies({ guilty: decrypted[0], notGuilty: decrypted[1] });
      }

      toast({ title: "Tallies decrypted", description: "Verdict counts are now visible" });
    } catch (error) {
      toast({
        title: "Decryption failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    }
  };

  // Show loading state
  if (caseQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-muted-foreground">Loading case details...</p>
        </div>
      </div>
    );
  }

  // Show error if case not found
  if (!caseQuery.data) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>Case not found. Please check the case ID and try again.</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Link to="/">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to All Cases
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const caseInfo = caseQuery.data;
  const deadlineMs = Number(caseInfo.deadline) * DEADLINE_MULTIPLIER;
  const isExpired = deadlineMs < Date.now();
  const isJuror = address ? caseInfo.jurors.some((j) => j.toLowerCase() === address.toLowerCase()) : false;
  const isJudge = address && caseInfo.judge ? caseInfo.judge.toLowerCase() === address.toLowerCase() : false;
  const voteProgress = Number(caseInfo.votesCast) / Number(caseInfo.jurorCount) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to All Cases
            </Button>
          </Link>
        </div>

        {/* Case Header */}
        <Card className="p-6 mb-6 border-border">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Scale className="w-8 h-8 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h1 className="text-3xl font-bold mb-2">
                    {metadata?.title || `Case #${caseInfo.id.toString()}`}
                  </h1>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={caseInfo.isClosed ? "outline" : "default"}>
                      {caseInfo.isClosed ? "Closed" : "Active"}
                    </Badge>
                    {isJuror && <Badge variant="secondary">You are a Juror</Badge>}
                    {isJudge && <Badge className="bg-legal-gold">You are the Judge</Badge>}
                  </div>
                </div>
              </div>

              {metadata?.description && (
                <p className="text-muted-foreground mt-4 whitespace-pre-wrap">{metadata.description}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Case Information Grid */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          {/* Judge Info */}
          <Card className="p-4 border-border">
            <div className="flex items-center gap-3">
              <Gavel className="w-5 h-5 text-legal-gold" />
              <div>
                <p className="text-sm text-muted-foreground">Judge</p>
                <p className="font-mono text-sm">
                  {caseInfo.judge.slice(0, 10)}...{caseInfo.judge.slice(-8)}
                </p>
              </div>
            </div>
          </Card>

          {/* Deadline Info */}
          <Card className="p-4 border-border">
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Deadline</p>
                <p className="font-semibold">
                  {caseInfo.isClosed
                    ? "Closed"
                    : isExpired
                      ? "Expired"
                      : formatDistanceToNowStrict(deadlineMs, { addSuffix: true })}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Voting Progress */}
        <Card className="p-6 mb-6 border-border">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Voting Progress</h2>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {caseInfo.votesCast.toString()} of {caseInfo.jurorCount.toString()} votes cast
              </span>
              <span className="font-semibold">{voteProgress.toFixed(0)}%</span>
            </div>
            <Progress value={voteProgress} className="h-2" />
          </div>

          {/* Juror List */}
          <div className="mt-4">
            <p className="text-sm font-semibold mb-2">Juror Addresses:</p>
            <div className="space-y-1">
              {caseInfo.jurors.map((juror, index) => (
                <div key={index} className="text-sm font-mono text-muted-foreground">
                  {juror}
                  {juror.toLowerCase() === address?.toLowerCase() && (
                    <Badge variant="secondary" className="ml-2 text-xs">
                      You
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Voting Actions (for jurors) */}
        {isConnected && isJuror && !caseInfo.isClosed && (
          <Card className="p-6 mb-6 border-border">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Cast Your Vote</h2>
            </div>

            {caseInfo.hasVoted ? (
              <Alert>
                <CheckCircle className="w-4 h-4" />
                <AlertDescription>You have already voted on this case. Your vote is encrypted and cannot be changed.</AlertDescription>
              </Alert>
            ) : isExpired ? (
              <Alert variant="destructive">
                <XCircle className="w-4 h-4" />
                <AlertDescription>The voting deadline has passed. Wait for the judge to close the case.</AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Your vote will be encrypted using FHE technology and cannot be revealed until the judge closes the case.
                </p>
                <div className="flex gap-4">
                  <Button
                    onClick={() => castVoteMutation.mutate(true)}
                    disabled={castVoteMutation.isPending}
                    className="flex-1 bg-red-500 hover:bg-red-600"
                    size="lg"
                  >
                    <ThumbsDown className="w-5 h-5 mr-2" />
                    Vote Guilty
                  </Button>
                  <Button
                    onClick={() => castVoteMutation.mutate(false)}
                    disabled={castVoteMutation.isPending}
                    className="flex-1 bg-green-500 hover:bg-green-600"
                    size="lg"
                  >
                    <ThumbsUp className="w-5 h-5 mr-2" />
                    Vote Not Guilty
                  </Button>
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Judge Actions */}
        {isConnected && isJudge && !caseInfo.isClosed && (
          <Card className="p-6 mb-6 border-border bg-legal-gold/5">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-5 h-5 text-legal-gold" />
              <h2 className="text-xl font-bold">Judge Controls</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Close the case to reveal encrypted votes. This action is irreversible.
            </p>
            <Button
              onClick={() => closeCaseMutation.mutate()}
              disabled={closeCaseMutation.isPending}
              className="bg-legal-gold hover:bg-legal-gold/90"
              size="lg"
            >
              {closeCaseMutation.isPending ? "Closing Case..." : "Close Case & Reveal Votes"}
            </Button>
          </Card>
        )}

        {/* Results (after case is closed) */}
        {caseInfo.isClosed && (
          <Card className="p-6 border-border">
            <div className="flex items-center gap-3 mb-4">
              <Scale className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Final Results</h2>
            </div>

            {!tallies ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">Votes are encrypted. Click to decrypt and view results.</p>
                <Button onClick={handleDecryptTallies}>Decrypt Results</Button>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                <Card className="p-6 border-2 border-red-500/20 bg-red-500/5">
                  <div className="flex items-center gap-3 mb-2">
                    <ThumbsDown className="w-6 h-6 text-red-500" />
                    <h3 className="text-lg font-bold">Guilty</h3>
                  </div>
                  <p className="text-4xl font-bold text-red-500">{tallies.guilty}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {((tallies.guilty / Number(caseInfo.jurorCount)) * 100).toFixed(0)}%
                  </p>
                </Card>

                <Card className="p-6 border-2 border-green-500/20 bg-green-500/5">
                  <div className="flex items-center gap-3 mb-2">
                    <ThumbsUp className="w-6 h-6 text-green-500" />
                    <h3 className="text-lg font-bold">Not Guilty</h3>
                  </div>
                  <p className="text-4xl font-bold text-green-500">{tallies.notGuilty}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {((tallies.notGuilty / Number(caseInfo.jurorCount)) * 100).toFixed(0)}%
                  </p>
                </Card>
              </div>
            )}
          </Card>
        )}

        {/* Not Connected Warning */}
        {!isConnected && (
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>Connect your wallet to interact with this case.</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
