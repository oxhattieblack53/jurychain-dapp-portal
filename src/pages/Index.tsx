import { Link } from "react-router-dom";
import { Scale, Shield, Lock, Users, ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navigation from "@/components/Navigation";

// Main landing page for JuryChain
export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-hero opacity-5" />
        
        <div className="container mx-auto px-4 py-20 relative">
          <div className="max-w-4xl mx-auto text-center">
            {/* Hero Icon */}
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-gradient-gold rounded-2xl shadow-glow">
                <Scale className="w-16 h-16 text-legal-blue-dark" />
              </div>
            </div>
            
            {/* Hero Title */}
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-legal-blue to-legal-gold bg-clip-text text-transparent">
              Encrypted Jury Voting on Blockchain
            </h1>
            
            {/* Hero Description */}
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              JuryChain uses Fully Homomorphic Encryption (FHE) to enable confidential jury verdicts. 
              Jurors can submit encrypted votes that remain private until case closure.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/dapp">
                <Button size="lg" className="shadow-elegant">
                  Launch DApp
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button size="lg" variant="secondary">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why JuryChain?
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Built with cutting-edge encryption technology to ensure complete privacy and transparency
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Feature 1: Privacy */}
            <Card className="p-6 border-border hover:shadow-elegant transition-shadow">
              <div className="p-3 bg-primary/10 rounded-lg w-fit mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Complete Privacy</h3>
              <p className="text-muted-foreground">
                Votes are encrypted using FHE technology. No one can see individual votes until the judge closes the case.
              </p>
            </Card>
            
            {/* Feature 2: Transparency */}
            <Card className="p-6 border-border hover:shadow-elegant transition-shadow">
              <div className="p-3 bg-accent/10 rounded-lg w-fit mb-4">
                <Shield className="w-8 h-8 text-accent" />
              </div>
              <h3 className="text-xl font-bold mb-3">Transparent Results</h3>
              <p className="text-muted-foreground">
                All votes are recorded on-chain. Once revealed, verdicts are publicly verifiable and immutable.
              </p>
            </Card>
            
            {/* Feature 3: Decentralized */}
            <Card className="p-6 border-border hover:shadow-elegant transition-shadow">
              <div className="p-3 bg-secondary/10 rounded-lg w-fit mb-4">
                <Users className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-bold mb-3">Decentralized Justice</h3>
              <p className="text-muted-foreground">
                No central authority. Jury selections and verdicts are managed by smart contracts on Ethereum.
              </p>
            </Card>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Simple, secure, and transparent jury voting process
            </p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Step 1 */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                  1
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Judge Creates Case</h3>
                <p className="text-muted-foreground">
                  The judge deploys a new case on-chain, selecting jury members and setting a voting deadline.
                </p>
              </div>
            </div>
            
            {/* Step 2 */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                  2
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Jurors Cast Encrypted Votes</h3>
                <p className="text-muted-foreground">
                  Selected jurors connect their wallets and submit encrypted guilty/not-guilty verdicts using FHE.
                </p>
              </div>
            </div>
            
            {/* Step 3 */}
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xl font-bold">
                  3
                </div>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Case Closed & Results Revealed</h3>
                <p className="text-muted-foreground">
                  When the deadline passes, the judge closes the case. The smart contract decrypts all votes and reveals the final verdict.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-gradient-hero text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Experience Decentralized Justice?
          </h2>
          <p className="text-lg mb-8 text-white/80 max-w-2xl mx-auto">
            Connect your wallet and start participating in confidential jury voting
          </p>
          <Link to="/dapp">
            <Button size="lg" variant="secondary" className="shadow-glow">
              Launch DApp Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 JuryChain. Powered by FHE & Ethereum.</p>
        </div>
      </footer>
    </div>
  );
}
