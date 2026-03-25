import { useRef, useState, type ChangeEvent } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { PcmWavRecorder } from "@/lib/audio/pcmRecorder";
import { FileText, Loader2, Mic, Sparkles, Square, Upload } from "lucide-react";

interface ReviewInputProps {
  onAnalyze: (reviews: string[], productName: string, platform: string) => void;
  isLoading: boolean;
}

export function ReviewInput({ onAnalyze, isLoading }: ReviewInputProps) {
  const [reviewText, setReviewText] = useState("");
  const [productName, setProductName] = useState("");
  const [platform, setPlatform] = useState("amazon");
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const recorderRef = useRef<PcmWavRecorder | null>(null);
  const { toast } = useToast();

  const handleAnalyze = () => {
    if (!reviewText.trim()) {
      toast({
        title: "No reviews entered",
        description: "Please enter at least one review to analyze",
        variant: "destructive",
      });
      return;
    }

    if (!productName.trim()) {
      toast({
        title: "Product name required",
        description: "Please enter a product name",
        variant: "destructive",
      });
      return;
    }

    const reviews = reviewText
      .split(/\n{2,}|(?=\d+\.\s)/)
      .map((r) => r.replace(/^\d+\.\s*/, "").trim())
      .filter((r) => r.length > 10);

    if (reviews.length === 0) {
      toast({
        title: "No valid reviews",
        description: "Reviews must be at least 10 characters each",
        variant: "destructive",
      });
      return;
    }

    onAnalyze(reviews, productName, platform);
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (
      file.type !== "text/csv" &&
      !file.name.endsWith(".csv") &&
      file.type !== "text/plain"
    ) {
      toast({
        title: "Invalid file type",
        description: "Please upload a CSV or TXT file",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setReviewText(content);
      toast({
        title: "File loaded",
        description: `Loaded ${content
          .split("\n")
          .filter((l) => l.trim()).length} lines`,
      });
    };
    reader.readAsText(file);
  };

  const startRecording = async () => {
    if (isRecording || isTranscribing) return;

    try {
      const recorder = new PcmWavRecorder({ sampleRate: 16000 });
      recorderRef.current = recorder;
      await recorder.start();

      setIsRecording(true);
      toast({
        title: "Recording started",
        description: "Speak your review clearly. Click stop when done.",
      });
    } catch (err) {
      console.error("Recording error:", err);
      recorderRef.current = null;
      setIsRecording(false);
      toast({
        title: "Microphone access denied",
        description: "Please allow microphone access to use voice input",
        variant: "destructive",
      });
    }
  };

  const stopRecording = async () => {
    const recorder = recorderRef.current;
    if (!recorder || !isRecording) return;

    setIsRecording(false);
    setIsTranscribing(true);
    recorderRef.current = null;

    try {
      const wavBase64 = await recorder.stop();

      const { data, error } = await supabase.functions.invoke("transcribe-audio", {
        body: { audio: wavBase64, format: "wav" },
      });

      if (error) throw new Error(error.message || "Transcription failed");

      const text = typeof data?.text === "string" ? data.text.trim() : "";
      if (!text) {
        throw new Error(typeof data?.error === "string" ? data.error : "No speech detected");
      }

      setReviewText((prev) => (prev ? `${prev}\n\n${text}` : text));
      toast({
        title: "Voice recorded",
        description: "Your review has been transcribed successfully",
      });
    } catch (err) {
      console.error("Stop/transcribe error:", err);
      toast({
        title: "Transcription failed",
        description:
          err instanceof Error
            ? err.message
            : "Could not transcribe your voice. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  const sampleReviews = `1. This product exceeded my expectations! The quality is amazing and it arrived faster than expected. Would definitely recommend to anyone looking for value.

2. Terrible experience. The product broke after just one week of use. Customer service was unhelpful and I'm still waiting for my refund.

3. Decent product for the price. Nothing special but gets the job done. Packaging could be better.

4. Absolutely love it! Best purchase I've made this year. The build quality is premium and works exactly as described.

5. Disappointed with this purchase. The colors don't match the pictures and size runs smaller than expected.`;

  return (
    <Card variant="glow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          Review Input
        </CardTitle>
        <CardDescription>
          Enter customer reviews via text, file upload, or voice recording
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Product Name</label>
            <Input
              placeholder="e.g., Wireless Bluetooth Headphones"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Platform</label>
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="amazon">Amazon</SelectItem>
                <SelectItem value="flipkart">Flipkart</SelectItem>
                <SelectItem value="ebay">eBay</SelectItem>
                <SelectItem value="walmart">Walmart</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Customer Reviews</label>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReviewText(sampleReviews)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Load sample reviews
              </Button>

              {isRecording ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={stopRecording}
                  className="gap-1"
                >
                  {isTranscribing ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Square className="h-3 w-3" />
                  )}
                  {isTranscribing ? "Transcribing..." : "Stop"}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={startRecording}
                  disabled={isTranscribing}
                  className="gap-1"
                >
                  {isTranscribing ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Mic className="h-3 w-3" />
                  )}
                  {isTranscribing ? "Transcribing..." : "Voice Input"}
                </Button>
              )}
            </div>
          </div>

          <div className="relative">
            <Textarea
              placeholder="Paste customer reviews here. Separate each review with a blank line or number them (1. 2. 3.)..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="min-h-[200px] bg-background resize-none"
            />
            {isRecording && (
              <div className="absolute inset-0 bg-destructive/10 border-2 border-destructive rounded-md flex items-center justify-center">
                <div className="flex items-center gap-2 text-destructive">
                  <div className="h-3 w-3 bg-destructive rounded-full animate-pulse" />
                  <span className="font-medium">Recording... Speak your review</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="gradient"
            size="lg"
            onClick={handleAnalyze}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Analyze Sentiment
              </>
            )}
          </Button>

          <label className="cursor-pointer">
            <input
              type="file"
              accept=".csv,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button variant="outline" size="lg" asChild>
              <span>
                <Upload className="h-4 w-4 mr-2" />
                Upload CSV
              </span>
            </Button>
          </label>
        </div>
      </CardContent>
    </Card>
  );
}
