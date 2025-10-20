import { useState } from "react";
import { Scale, Wallet, Shield, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Navigation from "@/components/Navigation";

// DApp page for jury voting functionality
// Note: Web3 integration would require wagmi & rainbowkit setup
export default function DApp() {
  const [isConnected, setIsConnected] = useState(false);
  
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-gold rounded-lg shadow-glow">
              <Scale className="w-6 h-6 text-legal-blue-dark" />
            </div>
            <h1 className="text-3xl font-bold">JuryChain DApp</h1>
          </div>
          <p className="text-muted-foreground">
            Participate in encrypted jury voting with complete privacy
          </p>
        </div>
        
        {/* Connection Alert */}
        {!isConnected && (
          <Alert className="mb-6 border-primary/20 bg-primary/5">
            <AlertCircle className="h-4 w-4 text-primary" />
            <AlertDescription className="text-primary">
              Connect your wallet to view and participate in jury cases
            </AlertDescription>
          </Alert>
        )}
        
        {/* Wallet Connection Section */}
        <Card className="p-6 mb-8 border-border">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-accent/10 rounded-lg">
                <Wallet className="w-6 h-6 text-accent" />
              </div>
              <div>
                <h2 className="text-lg font-bold mb-1">Wallet Connection</h2>
                <p className="text-sm text-muted-foreground">
                  {isConnected 
                    ? "Connected to Ethereum Sepolia Testnet" 
                    : "Connect your wallet to get started"
                  }
                </p>
              </div>
            </div>
            <Button 
              size="lg"
              onClick={() => setIsConnected(!isConnected)}
              variant={isConnected ? "secondary" : "default"}
            >
              {isConnected ? "Disconnect" : "Connect Wallet"}
            </Button>
          </div>
        </Card>
        
        {/* Cases Section */}
        {isConnected ? (
          <div className="grid gap-6">
            <h2 className="text-2xl font-bold">Active Cases</h2>
            
            {/* Example Case Card */}
            <Card className="p-6 border-border hover:shadow-elegant transition-shadow">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-1">Case #1234</h3>
                      <p className="text-sm text-muted-foreground">Created by 0x742d...3a9f</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="font-medium text-primary">Active</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Jury Size:</span>
                      <span className="font-medium">12 jurors</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Votes Cast:</span>
                      <span className="font-medium">8 / 12</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Deadline:</span>
                      <span className="font-medium">2 days remaining</span>
                    </div>
                  </div>
                  
                  <div className="w-full bg-muted rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '67%' }} />
                  </div>
                </div>
                
                <div className="flex flex-col gap-3 justify-center">
                  <Button className="shadow-elegant">
                    View Details
                  </Button>
                  <Button variant="secondary">
                    Cast Vote
                  </Button>
                </div>
              </div>
            </Card>
            
            {/* Placeholder for more cases */}
            <div className="text-center py-12 text-muted-foreground">
              <Scale className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No more active cases available</p>
            </div>
          </div>
        ) : (
          // Not Connected State
          <div className="text-center py-20">
            <div className="p-4 bg-muted rounded-2xl w-fit mx-auto mb-6">
              <Wallet className="w-16 h-16 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">Wallet Not Connected</h3>
            <p className="text-muted-foreground mb-6">
              Connect your Ethereum wallet to view and participate in jury cases
            </p>
            <Button size="lg" onClick={() => setIsConnected(true)}>
              Connect Wallet
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
