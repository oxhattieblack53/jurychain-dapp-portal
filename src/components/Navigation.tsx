/**
 * Navigation Component - Enhanced Version
 *
 * Provides the main navigation bar for JuryChain with:
 * - Logo and branding
 * - Smart navigation (Cases, My Votes, Create Case)
 * - Wallet connection with address display
 * - Network indicator
 *
 * Features:
 * - Responsive design
 * - Wallet connection state management
 * - Network status display
 * - User-friendly interface
 */

import { Link, useLocation } from "react-router-dom";
import { Scale, Gavel, History, PlusCircle, Wallet, ChevronDown } from "lucide-react";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { Button } from "@/components/ui/button";

export default function Navigation() {
  const location = useLocation();
  const { address, isConnected, chain } = useAccount();

  // Helper function to determine if a navigation link is active
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path);

  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2 bg-gradient-to-br from-legal-blue to-legal-gold rounded-lg shadow-glow group-hover:scale-105 transition-transform">
              <Scale className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-r from-legal-blue to-legal-gold bg-clip-text text-transparent">
                JuryChain
              </span>
              <span className="text-xs text-muted-foreground">Encrypted Jury Voting</span>
            </div>
          </Link>

          {/* Main Navigation */}
          <div className="flex items-center gap-2">
            {/* All Cases */}
            <Link
              to="/dapp"
              className={`
                flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium
                ${isActive("/dapp") || (isActive("/") && location.pathname === "/")
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }
              `}
            >
              <Gavel className="w-4 h-4" />
              <span className="hidden sm:inline">All Cases</span>
            </Link>

            {/* My Votes */}
            {isConnected && (
              <Link
                to="/my-votes"
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium
                  ${isActive("/my-votes")
                    ? "bg-primary text-primary-foreground shadow-md"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"}
                `}
              >
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">My Votes</span>
              </Link>
            )}

            {/* Create Case - Highlighted */}
            {isConnected && (
              <Link
                to="/create"
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-lg transition-all font-medium
                  ${isActive("/create")
                    ? "bg-legal-gold text-white shadow-md"
                    : "bg-legal-gold/10 text-legal-gold hover:bg-legal-gold/20 border border-legal-gold/30"}
                `}
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Create Case</span>
              </Link>
            )}

            {/* Wallet Connection - Custom RainbowKit Button */}
            <div className="ml-2 pl-2 border-l border-border">
              <ConnectButton.Custom>
                {({
                  account,
                  chain,
                  openAccountModal,
                  openChainModal,
                  openConnectModal,
                  authenticationStatus,
                  mounted,
                }) => {
                  const ready = mounted && authenticationStatus !== "loading";
                  const connected =
                    ready &&
                    account &&
                    chain &&
                    (!authenticationStatus || authenticationStatus === "authenticated");

                  return (
                    <div
                      {...(!ready && {
                        "aria-hidden": true,
                        style: {
                          opacity: 0,
                          pointerEvents: "none",
                          userSelect: "none",
                        },
                      })}
                    >
                      {(() => {
                        if (!connected) {
                          return (
                            <Button onClick={openConnectModal} className="gap-2">
                              <Wallet className="w-4 h-4" />
                              Connect Wallet
                            </Button>
                          );
                        }

                        if (chain.unsupported) {
                          return (
                            <Button onClick={openChainModal} variant="destructive" className="gap-2">
                              Wrong Network
                            </Button>
                          );
                        }

                        return (
                          <div className="flex gap-2">
                            {/* Chain Selector */}
                            <Button
                              onClick={openChainModal}
                              variant="outline"
                              size="sm"
                              className="gap-2"
                            >
                              {chain.hasIcon && (
                                <div
                                  style={{
                                    background: chain.iconBackground,
                                    width: 16,
                                    height: 16,
                                    borderRadius: 999,
                                    overflow: "hidden",
                                  }}
                                >
                                  {chain.iconUrl && (
                                    <img
                                      alt={chain.name ?? "Chain icon"}
                                      src={chain.iconUrl}
                                      style={{ width: 16, height: 16 }}
                                    />
                                  )}
                                </div>
                              )}
                              <span className="hidden sm:inline">{chain.name}</span>
                            </Button>

                            {/* Account Button */}
                            <Button
                              onClick={openAccountModal}
                              variant="outline"
                              className="gap-2"
                            >
                              <Wallet className="w-4 h-4" />
                              <span className="font-mono">{formatAddress(account.address)}</span>
                              <ChevronDown className="w-3 h-3" />
                            </Button>
                          </div>
                        );
                      })()}
                    </div>
                  );
                }}
              </ConnectButton.Custom>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
