import { useState } from "react";
import { Header } from "@/components/layout/Header";
import { Sidebar } from "@/components/layout/Sidebar";
import { BottomDock } from "@/components/layout/BottomDock";
import { GeneralPage } from "@/components/features/GeneralPage";
import { toast } from "sonner";

export default function Dashboard() {
  const [activeFeature, setActiveFeature] = useState("general");
  const [currentPrompt, setCurrentPrompt] = useState("");

  const handleFeatureChange = (featureId: string) => {
    setActiveFeature(featureId);
  };

  const handlePromptSelect = (prompt: string) => {
    setCurrentPrompt(prompt);
  };

  const handleGenerate = async (prompt: string) => {
    toast.success("Generation started! This is a demo - actual generation would happen here.");
    // Here you would integrate with your AI generation API
    console.log("Generating with prompt:", prompt);
  };

  const renderActiveFeature = () => {
    switch (activeFeature) {
      case "general":
        return <GeneralPage onPromptSelect={handlePromptSelect} />;
      case "avatar":
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center glass-morph p-8 rounded-xl">
              <h2 className="text-2xl font-bold text-foreground mb-4">Avatar Generation</h2>
              <p className="text-muted-foreground">Coming soon! Upload your photo and transform it into amazing avatars.</p>
            </div>
          </div>
        );
      case "try-on":
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center glass-morph p-8 rounded-xl">
              <h2 className="text-2xl font-bold text-foreground mb-4">Clothing Try-on</h2>
              <p className="text-muted-foreground">Coming soon! Try on different outfits virtually with AI.</p>
            </div>
          </div>
        );
      case "vector":
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center glass-morph p-8 rounded-xl">
              <h2 className="text-2xl font-bold text-foreground mb-4">Vector Graphics</h2>
              <p className="text-muted-foreground">Coming soon! Generate scalable vector graphics and icons.</p>
            </div>
          </div>
        );
      case "more":
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center glass-morph p-8 rounded-xl">
              <h2 className="text-2xl font-bold text-foreground mb-4">More Features</h2>
              <p className="text-muted-foreground">Exciting new features are coming! Stay tuned for updates.</p>
            </div>
          </div>
        );
      default:
        return <GeneralPage onPromptSelect={handlePromptSelect} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-main particles">
      {/* Header */}
      <Header />
      
      {/* Main Layout */}
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className="p-4 pr-2">
          <Sidebar 
            activeItem={activeFeature} 
            onItemChange={handleFeatureChange} 
          />
        </div>

        {/* Main Content */}
        <main className="flex-1 p-4 pb-24 overflow-auto">
          <div className="h-full">
            {renderActiveFeature()}
          </div>
        </main>
      </div>

      {/* Bottom Dock */}
      <BottomDock onGenerate={handleGenerate} />
    </div>
  );
}