
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Header } from "@/components/layout/Header";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAuth = async (action: "login" | "signup") => {
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Call our local server endpoint
      const response = await fetch(`http://localhost:3000/api/${action}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Authentication failed");
      }

      toast({
        title: "Success",
        description: action === "login" ? "Logged in successfully" : "Account created successfully",
      });

      if (action === "login" || action === "signup") {
        navigate("/dashboard");
      }
    } catch (error: any) {
      toast({
        title: "Authentication Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address to verify",
        variant: "destructive",
      });
      return;
    }

    try {
       const response = await fetch(`http://localhost:3000/api/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message);
      }

      toast({
        title: "Verification",
        description: `Your password is: ${data.password}`, // In a real app we wouldn't show this, but requested "txt file verification" implies simple retrieval
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <Tabs defaultValue="login" className="w-[400px]">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="m@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <Button variant="link" className="px-0 font-normal" onClick={handleForgotPassword}>
                  Forgot password?
                </Button>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => handleAuth("login")} disabled={isLoading}>
                  {isLoading ? "Logging in..." : "Login"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>
                  Create a new account to start analyzing
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input 
                    id="signup-email" 
                    type="email" 
                    placeholder="m@example.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input 
                    id="signup-password" 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" onClick={() => handleAuth("signup")} disabled={isLoading}>
                  {isLoading ? "Creating account..." : "Sign Up"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
