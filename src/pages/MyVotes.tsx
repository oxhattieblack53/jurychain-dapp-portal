/**
 * My Votes Page - User's Voting History
 *
 * This page displays all cases where the connected user is a juror.
 * It shows:
 * - Cases where the user has voted
 * - Cases where the user hasn't voted yet
 * - Vote status and deadline information
 * - Revealed results for closed cases
 *
 * Features:
 * - Automatic filtering to only show user's cases
 * - Visual indicators for voted/not voted status
 * - Quick navigation to case details
 * - Real-time updates via React Query
 */

import { useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { AlertCircle, CheckCircle, Clock, Gavel, History, XCircle } from "lucide-react";
import { useAccount, usePublicClient } from "wagmi";
import { formatDistanceToNowStrict } from "date-fns";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import Navigation from "@/components/Navigation";
import { SUPPORTED_CHAIN } from "@/lib/web3";
import { JURYCHAIN_ADDRESS } from "@/lib/contract";
import { JURYCHAIN_ABI } from "@/lib/abi";

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

export default function MyVotes() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient({ chainId: SUPPORTED_CHAIN.id });

  const contractConfigured = useMemo(
    () => JURYCHAIN_ADDRESS !== "0x0000000000000000000000000000000000000000",
    [],
  );

  /**
   * Fetch all cases and filter to only show cases where the user is a juror
   */
  const myCasesQuery = useQuery<CaseInfo[]>({
    queryKey: ["myCases", address],
    enabled: Boolean(publicClient && contractConfigured && address),
    queryFn: async () => {
      if (!publicClient || !address) return [];

      try {
        // Fetch all case IDs
        const ids = (await publicClient.readContract({
          address: JURYCHAIN_ADDRESS,
          abi: JURYCHAIN_ABI,
          functionName: "getCaseIds",
        })) as bigint[];

        // Fetch case details for all cases
        const allCases = await Promise.all(
          ids.map(async (id) => {
            const summary = (await publicClient.readContract({
              address: JURYCHAIN_ADDRESS,
              abi: JURYCHAIN_ABI,
              functionName: "getCase",
              args: [id],
            })) as [bigint, string, bigint, boolean, string, bigint, bigint];

            const jurors = (await publicClient.readContract({
              address: JURYCHAIN_ADDRESS,
              abi: JURYCHAIN_ABI,
              functionName: "getCaseJurors",
              args: [id],
            })) as string[];

            const hasVoted = (await publicClient.readContract({
              address: JURYCHAIN_ADDRESS,
              abi: JURYCHAIN_ABI,
              functionName: "hasVoted",
              args: [id, address],
            })) as boolean;

            return {
              id,
              judge: summary[1],
              deadline: summary[2],
              isClosed: summary[3],
              metadataURI: summary[4],
              votesCast: summary[5],
              jurorCount: summary[6],
              jurors,
              hasVoted,
            } satisfies CaseInfo;
          }),
        );

        // Filter to only show cases where the connected user is a juror
        const myCases = allCases.filter((caseInfo) =>
          caseInfo.jurors.some((juror) => juror.toLowerCase() === address.toLowerCase()),
        );

        return myCases.sort((a, b) => Number(b.id - a.id));
      } catch (error) {
        console.warn("Failed to fetch cases", error);
        return [];
      }
    },
    refetchInterval: 15_000,
    retry: 1,
    initialData: [],
  });

  /**
   * Helper function to format deadline display
   */
  const formatDeadline = (deadline: bigint, isClosed: boolean) => {
    if (isClosed) return "Closed";
    const deadlineMs = Number(deadline) * DEADLINE_MULTIPLIER;
    const now = Date.now();
    if (deadlineMs < now) return "Expired";
    return formatDistanceToNowStrict(deadlineMs, { addSuffix: true });
  };

  /**
   * Helper function to get vote status badge
   */
  const getVoteStatusBadge = (hasVoted: boolean, isClosed: boolean) => {
    if (isClosed) {
      return (
        <Badge variant="outline" className="gap-1">
          <CheckCircle className="w-3 h-3" />
          Case Closed
        </Badge>
      );
    }
    if (hasVoted) {
      return (
        <Badge variant="default" className="gap-1 bg-green-500 hover:bg-green-600">
          <CheckCircle className="w-3 h-3" />
          Voted
        </Badge>
      );
    }
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="w-3 h-3" />
        Not Voted
      </Badge>
    );
  };

  // Show connection prompt if wallet not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>Please connect your wallet to view your voting history.</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  // Show contract configuration error
  if (!contractConfigured) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <Alert variant="destructive">
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>
              Contract address not configured. Please set VITE_CONTRACT_ADDRESS in your .env file.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  const cases = myCasesQuery.data || [];
  const votedCases = cases.filter((c) => c.hasVoted);
  const pendingCases = cases.filter((c) => !c.hasVoted && !c.isClosed);
  const closedCases = cases.filter((c) => c.isClosed);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <History className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold">My Voting History</h1>
          </div>
          <p className="text-muted-foreground">
            Cases where you are a juror. {cases.length} total case{cases.length !== 1 ? "s" : ""}.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-4 border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Votes</p>
                <p className="text-2xl font-bold">{pendingCases.length}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-500" />
            </div>
          </Card>

          <Card className="p-4 border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Voted</p>
                <p className="text-2xl font-bold">{votedCases.length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </Card>

          <Card className="p-4 border-border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Closed</p>
                <p className="text-2xl font-bold">{closedCases.length}</p>
              </div>
              <Gavel className="w-8 h-8 text-blue-500" />
            </div>
          </Card>
        </div>

        {/* Cases List */}
        {cases.length === 0 ? (
          <Card className="p-12 text-center border-dashed border-2">
            <Gavel className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Cases Assigned</h3>
            <p className="text-muted-foreground mb-4">You haven't been assigned to any jury cases yet.</p>
            <Link to="/">
              <Button variant="outline">Browse All Cases</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-4">
            {cases.map((caseInfo) => {
              const deadlineMs = Number(caseInfo.deadline) * DEADLINE_MULTIPLIER;
              const isExpired = deadlineMs < Date.now();

              return (
                <Card key={caseInfo.id.toString()} className="p-6 border-border hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    {/* Case Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-bold">Case #{caseInfo.id.toString()}</h3>
                        {getVoteStatusBadge(caseInfo.hasVoted, caseInfo.isClosed)}
                      </div>

                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Gavel className="w-4 h-4" />
                          <span>
                            Judge: {caseInfo.judge.slice(0, 6)}...{caseInfo.judge.slice(-4)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>Deadline: {formatDeadline(caseInfo.deadline, caseInfo.isClosed)}</span>
                          {isExpired && !caseInfo.isClosed && (
                            <Badge variant="destructive" className="text-xs">
                              Expired
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4" />
                          <span>
                            Votes: {caseInfo.votesCast.toString()} / {caseInfo.jurorCount.toString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Action Button */}
                    <div>
                      <Link to={`/case/${caseInfo.id}`}>
                        <Button variant="outline">View Details</Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
