import { Link } from "react-router-dom";
import { Code } from 'lucide-react';
import { Button } from "../components/ui/button";

const Home = () => {
  return (
    <div className="min-h-screen bg-black bg-gradient-to-br from-background via-background to-green-950/20">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Code className="h-12 w-12 text-primary mr-3" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-green-300 bg-clip-text text-transparent">
              GenCoder
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Master your coding skills with GenCoder
          </p>
          <div className="flex gap-16 justify-center">
            <Link to="/login">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Sign In
              </Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="lg">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export { Home };