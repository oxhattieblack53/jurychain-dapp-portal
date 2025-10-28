/**
 * Create Case Page - Standalone Case Creation Form
 *
 * This page allows users to create new jury cases by:
 * - Providing case description and metadata
 * - Selecting jury members (wallet addresses)
 * - Setting voting duration
 * - Submitting the case to the blockchain
 *
 * Features:
 * - Form validation for all inputs
 * - Dynamic juror list management
 * - Ethereum address validation
 * - Transaction status tracking
 * - Automatic redirect to case details on success
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, PlusCircle, Trash2, Users, Clock, FileText } from "lucide-react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { decodeEventLog, isAddress } from "viem";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navigation from "@/components/Navigation";
import { useToast } from "@/hooks/use-toast";
import { SUPPORTED_CHAIN } from "@/lib/web3";
import { JURYCHAIN_ADDRESS } from "@/lib/contract";
import { JURYCHAIN_ABI } from "@/lib/abi";

export default function CreateCase() {
  const navigate = useNavigate();
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient({ chainId: SUPPORTED_CHAIN.id });
  const { data: walletClient } = useWalletClient();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Form state
  const [caseTitle, setCaseTitle] = useState("");
  const [caseDescription, setCaseDescription] = useState("");
  const [jurorAddresses, setJurorAddresses] = useState<string[]>([""]);
  const [votingDuration, setVotingDuration] = useState("1"); // Default 1 day

  // Validation errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const contractConfigured = JURYCHAIN_ADDRESS !== "0x0000000000000000000000000000000000000000";

  /**
   * Validate form inputs before submission
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!caseTitle.trim()) {
      newErrors.title = "Case title is required";
    }

    if (!caseDescription.trim()) {
      newErrors.description = "Case description is required";
    }

    const validJurors = jurorAddresses.filter((addr) => addr.trim() !== "");
    if (validJurors.length === 0) {
      newErrors.jurors = "At least one juror address is required";
    }

    // Validate each juror address
    validJurors.forEach((addr, index) => {
      if (!isAddress(addr)) {
        newErrors[`juror_${index}`] = "Invalid Ethereum address";
      }
    });

    const duration = parseInt(votingDuration);
    if (isNaN(duration) || duration < 1) {
      newErrors.duration = "Duration must be at least 1 day";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Add a new juror input field
   */
  const addJurorField = () => {
    setJurorAddresses([...jurorAddresses, ""]);
  };

  /**
   * Remove a juror input field
   */
  const removeJurorField = (index: number) => {
    setJurorAddresses(jurorAddresses.filter((_, i) => i !== index));
  };

  /**
   * Update a juror address at a specific index
   */
  const updateJurorAddress = (index: number, value: string) => {
    const updated = [...jurorAddresses];
    updated[index] = value;
    setJurorAddresses(updated);
    // Clear error for this field when user starts typing
    if (errors[`juror_${index}`]) {
      const newErrors = { ...errors };
      delete newErrors[`juror_${index}`];
      setErrors(newErrors);
    }
  };

  /**
   * Create Case Mutation
   */
  const createCaseMutation = useMutation({
    mutationKey: ["createCase"],
    mutationFn: async (payload: { metadataURI: string; jurorList: string[]; durationSeconds: number }) => {
      if (!contractConfigured) throw new Error("Contract address not configured");
      if (!walletClient || !address) throw new Error("Connect your wallet to create a case");
      if (!publicClient) throw new Error("Public client unavailable. Refresh and try again.");
      if (!payload.jurorList.length) throw new Error("Add at least one juror address");

      // Execute contract call
      const txHash = await walletClient.writeContract({
        address: JURYCHAIN_ADDRESS,
        abi: JURYCHAIN_ABI,
        functionName: "createCase",
        args: [payload.metadataURI, payload.jurorList, BigInt(payload.durationSeconds)],
        account: address,
        gas: 1000000n, // 设置合理的 gas limit（100万，创建案例需要更多 gas）
      });

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });

      // Extract case ID from event logs
      let newCaseId = BigInt(0);
      try {
        const caseLog = receipt.logs.find((log) => log.address?.toLowerCase() === JURYCHAIN_ADDRESS.toLowerCase());
        if (caseLog) {
          const decoded = decodeEventLog({
            abi: JURYCHAIN_ABI,
            data: caseLog.data,
            topics: caseLog.topics,
            eventName: "CaseCreated",
          });

          if (decoded.args && "caseId" in decoded.args) {
            newCaseId = decoded.args.caseId as bigint;
          }
        }
      } catch (error) {
        console.warn("Failed to parse CaseCreated event", error);
      }

      return { txHash, caseId: newCaseId };
    },
    onSuccess: async (data) => {
      // Invalidate cases query to refresh the list
      await queryClient.invalidateQueries({ queryKey: ["cases"] });

      toast({
        title: "Case created successfully",
        description: `Case #${data.caseId.toString()} is now live`
      });

      // Navigate to the new case details page
      if (data.caseId > BigInt(0)) {
        navigate(`/case/${data.caseId}`);
      } else {
        navigate("/");
      }
    },
    onError: (error: unknown) => {
      toast({
        title: "Failed to create case",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    },
  });

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Validation error",
        description: "Please fix the errors in the form",
        variant: "destructive",
      });
      return;
    }

    // Filter out empty juror addresses
    const validJurors = jurorAddresses.filter((addr) => addr.trim() !== "");

    // Create metadata URI (in production, this would be uploaded to IPFS)
    const metadata = {
      title: caseTitle,
      description: caseDescription,
      createdAt: new Date().toISOString(),
    };
    const metadataURI = `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;

    createCaseMutation.mutate({
      metadataURI,
      jurorList: validJurors,
      durationSeconds: parseInt(votingDuration) * 86400, // Convert days to seconds
    });
  };

  // Show connection prompt if wallet not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20">
          <Alert>
            <AlertCircle className="w-4 h-4" />
            <AlertDescription>Please connect your wallet to create a case.</AlertDescription>
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-legal-gold/10 rounded-lg">
              <PlusCircle className="w-6 h-6 text-legal-gold" />
            </div>
            <h1 className="text-3xl font-bold">Create New Case</h1>
          </div>
          <p className="text-muted-foreground">
            Create a new jury case with encrypted voting. Selected jurors will be able to submit confidential verdicts.
          </p>
        </div>

        {/* Create Case Form */}
        <form onSubmit={handleSubmit}>
          <Card className="p-6 border-border space-y-6">
            {/* Case Title */}
            <div className="space-y-2">
              <Label htmlFor="caseTitle" className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Case Title
              </Label>
              <Input
                id="caseTitle"
                placeholder="e.g., The State vs. John Doe - Theft Case"
                value={caseTitle}
                onChange={(e) => {
                  setCaseTitle(e.target.value);
                  if (errors.title) {
                    const newErrors = { ...errors };
                    delete newErrors.title;
                    setErrors(newErrors);
                  }
                }}
                className={errors.title ? "border-destructive" : ""}
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
            </div>

            {/* Case Description */}
            <div className="space-y-2">
              <Label htmlFor="caseDescription">Case Description</Label>
              <Textarea
                id="caseDescription"
                placeholder="Provide detailed information about the case, evidence, and context for the jury..."
                rows={6}
                value={caseDescription}
                onChange={(e) => {
                  setCaseDescription(e.target.value);
                  if (errors.description) {
                    const newErrors = { ...errors };
                    delete newErrors.description;
                    setErrors(newErrors);
                  }
                }}
                className={errors.description ? "border-destructive" : ""}
              />
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
            </div>

            {/* Juror Addresses */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Juror Addresses
              </Label>
              <p className="text-sm text-muted-foreground">
                Add Ethereum addresses of jury members who can vote on this case.
              </p>

              <div className="space-y-2">
                {jurorAddresses.map((addr, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      placeholder="0x..."
                      value={addr}
                      onChange={(e) => updateJurorAddress(index, e.target.value)}
                      className={errors[`juror_${index}`] ? "border-destructive" : ""}
                    />
                    {jurorAddresses.length > 1 && (
                      <Button type="button" variant="outline" size="icon" onClick={() => removeJurorField(index)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {errors.jurors && <p className="text-sm text-destructive">{errors.jurors}</p>}
                {Object.entries(errors)
                  .filter(([key]) => key.startsWith("juror_"))
                  .map(([key, value]) => (
                    <p key={key} className="text-sm text-destructive">
                      {value}
                    </p>
                  ))}
              </div>

              <Button type="button" variant="outline" onClick={addJurorField} className="w-full">
                <PlusCircle className="w-4 h-4 mr-2" />
                Add Juror
              </Button>
            </div>

            {/* Voting Duration */}
            <div className="space-y-2">
              <Label htmlFor="votingDuration" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Voting Duration (days)
              </Label>
              <Input
                id="votingDuration"
                type="number"
                min="1"
                placeholder="1"
                value={votingDuration}
                onChange={(e) => {
                  setVotingDuration(e.target.value);
                  if (errors.duration) {
                    const newErrors = { ...errors };
                    delete newErrors.duration;
                    setErrors(newErrors);
                  }
                }}
                className={errors.duration ? "border-destructive" : ""}
              />
              <p className="text-sm text-muted-foreground">
                Suggested: 1 (1 day), 7 (1 week), 30 (1 month)
              </p>
              {errors.duration && <p className="text-sm text-destructive">{errors.duration}</p>}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                className="w-full bg-legal-gold hover:bg-legal-gold/90"
                size="lg"
                disabled={createCaseMutation.isPending}
              >
                {createCaseMutation.isPending ? "Creating Case..." : "Create Case"}
              </Button>
            </div>
          </Card>
        </form>
      </div>
    </div>
  );
}
