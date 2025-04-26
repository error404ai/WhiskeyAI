/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { getHomeTimeLine, likeTweet, postTweet, quoteTweet, replyTweet, reTweet } from "@/server/controllers/agent/TwitterAgentController";
import { uploadFile, uploadImage } from "@/server/controllers/UploadController";
import { likeSchema, quoteSchema, replySchema, retweetSchema, tweetSchema } from "@/server/zodSchema/twitterSchema";
import { TwitterApiError, TwitterResponse } from "@/types/twitter.d";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle, Clock, Image as ImageIcon, Trash2, Twitter, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

export default function TwitterAgentTest() {
  const agentUuid = useParams().id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form handlers for each tab
  const tweetForm = useForm({
    resolver: zodResolver(tweetSchema),
    defaultValues: { tweetText: "", mediaUrl: "" },
  });

  const replyForm = useForm({
    resolver: zodResolver(replySchema),
    defaultValues: { replyTweetId: "", replyText: "" },
  });

  const likeForm = useForm({
    resolver: zodResolver(likeSchema),
    defaultValues: { likeTweetId: "" },
  });

  const quoteForm = useForm({
    resolver: zodResolver(quoteSchema),
    defaultValues: { quoteTweetId: "", quoteText: "" },
  });

  const retweetForm = useForm({
    resolver: zodResolver(retweetSchema),
    defaultValues: { retweetId: "" },
  });

  // State for results
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<TwitterApiError | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);

  // Process the response from the API
  const processResponse = (response: TwitterResponse, actionName: string) => {
    if (response.status === "error") {
      setError(response);
      // Safely log the serializable error object without trying to expand non-serializable properties
      console.error(`${actionName} error:`, JSON.stringify(response));
    } else {
      setResult({ action: actionName, data: response.data });
      setSuccess(`${actionName} completed successfully!`);
      console.log(`${actionName} response:`, response.data);
    }
  };

  // Function to handle API calls and update state
  const handleApiCall = async (apiCall: () => Promise<TwitterResponse>, actionName: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setResult(null);

    try {
      const response = await apiCall();
      processResponse(response, actionName);
    } catch (err) {
      // Create a safe serializable error object
      const safeError: TwitterApiError = {
        status: "error",
        message: `Unexpected error: ${(err as Error).message}`,
        isRateLimit: false,
        errorDetails: JSON.stringify(err),
      };
      setError(safeError);
      console.error(`${actionName} unexpected error:`, JSON.stringify(safeError));
    } finally {
      setLoading(false);
    }
  };

  // Handler functions for each action
  const handleGetTimeline = () => {
    handleApiCall(() => getHomeTimeLine(agentUuid), "Get Timeline");
  };

  const handleMediaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMediaFile(file);
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setMediaPreview(previewUrl);
  };

  const handleRemoveMedia = () => {
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview);
      setMediaPreview(null);
    }
    setMediaFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    tweetForm.setValue("mediaUrl", "");
  };

  const handlePostTweet = async (data: z.infer<typeof tweetSchema>) => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    setResult(null);

    try {
      let mediaUrl = "";
      
      // If we have a media file, upload it first
      if (mediaFile) {
        setUploadingMedia(true);
        try {
          if (mediaFile.type.startsWith("image/")) {
            const result = await uploadImage(mediaFile);
            mediaUrl = result.url;
          } else if (mediaFile.type.startsWith("video/")) {
            const result = await uploadFile(mediaFile);
            mediaUrl = result.url;
          }
          tweetForm.setValue("mediaUrl", mediaUrl);
          setUploadingMedia(false);
        } catch (err) {
          const safeError: TwitterApiError = {
            status: "error",
            message: `Failed to upload media: ${(err as Error).message}`,
            isRateLimit: false,
            errorDetails: JSON.stringify(err),
          };
          setError(safeError);
          setLoading(false);
          setUploadingMedia(false);
          return;
        }
      }

      // Post the tweet with media if uploaded
      setLoading(true);
      const response = await postTweet(agentUuid, data.tweetText, mediaUrl);
      processResponse(response, "Post Tweet");
    } catch (err) {
      const safeError: TwitterApiError = {
        status: "error",
        message: `Unexpected error: ${(err as Error).message}`,
        isRateLimit: false,
        errorDetails: JSON.stringify(err),
      };
      setError(safeError);
    } finally {
      setLoading(false);
    }
    
    tweetForm.reset();
    handleRemoveMedia();
  };

  const handleReplyTweet = (data: z.infer<typeof replySchema>) => {
    handleApiCall(() => replyTweet(agentUuid, data.replyText, data.replyTweetId), "Reply Tweet");
    replyForm.reset();
  };

  const handleLikeTweet = (data: z.infer<typeof likeSchema>) => {
    handleApiCall(() => likeTweet(agentUuid, data.likeTweetId), "Like Tweet");
    likeForm.reset();
  };

  const handleQuoteTweet = (data: z.infer<typeof quoteSchema>) => {
    handleApiCall(() => quoteTweet(agentUuid, data.quoteTweetId, data.quoteText), "Quote Tweet");
    quoteForm.reset();
  };

  const handleRetweet = (data: z.infer<typeof retweetSchema>) => {
    handleApiCall(() => reTweet(agentUuid, data.retweetId), "Retweet");
    retweetForm.reset();
  };

  // Format JSON for display
  const formatJson = (data: any) => {
    try {
      return JSON.stringify(data, null, 2);
    } catch (err) {
      return `Error formatting JSON: ${err}`;
    }
  };

  // Try to parse error details if they exist
  const getErrorDetails = () => {
    if (!error?.errorDetails) return null;

    try {
      const details = JSON.parse(error.errorDetails);
      return (
        <div className="mt-3 w-full">
          <div className="text-sm font-semibold">Error Details:</div>
          <div className="mt-1 max-h-60 w-full overflow-auto rounded bg-gray-100 p-2">
            <pre className="w-full text-xs break-words whitespace-pre-wrap">{JSON.stringify(details, null, 2)}</pre>
          </div>
        </div>
      );
    } catch (e) {
      return <div className="mt-3 w-full text-xs whitespace-normal">{error.errorDetails}</div>;
    }
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center gap-2">
        <Twitter className="text-blue-500" size={24} />
        <h1 className="text-2xl font-bold">Twitter API Test</h1>
      </div>

      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="mb-4 grid grid-cols-6">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="tweet">Tweet</TabsTrigger>
          <TabsTrigger value="reply">Reply</TabsTrigger>
          <TabsTrigger value="like">Like</TabsTrigger>
          <TabsTrigger value="quote">Quote</TabsTrigger>
          <TabsTrigger value="retweet">Retweet</TabsTrigger>
        </TabsList>

        {/* Timeline Tab */}
        <TabsContent value="timeline">
          <Card>
            <CardHeader>
              <CardTitle>Get Home Timeline</CardTitle>
              <CardDescription>Fetch your Twitter home timeline</CardDescription>
            </CardHeader>
            <CardContent>
              <Button parentClass="w-fit" onClick={handleGetTimeline} disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                {loading ? "Loading..." : "Get Timeline"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tweet Tab */}
        <TabsContent value="tweet">
          <FormProvider {...tweetForm}>
            <form onSubmit={tweetForm.handleSubmit(handlePostTweet)}>
              <Card>
                <CardHeader>
                  <CardTitle>Post a Tweet</CardTitle>
                  <CardDescription>Create a new tweet with optional media</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea name="tweetText" label="Tweet Text" placeholder="What's happening?" required />
                  <div className="-mt-2 text-xs text-gray-500">{tweetForm.watch("tweetText")?.length || 0}/280 characters</div>
                  
                  {/* Media Upload Section */}
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <Input
                        id="media-upload"
                        type="file"
                        accept="image/*,video/*"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleMediaChange}
                      />
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                        className="text-sm flex items-center gap-2 border-blue-200 hover:border-blue-400 hover:bg-blue-50"
                      >
                        <ImageIcon className="h-4 w-4" />
                        Attach Media
                      </Button>
                      
                      {mediaPreview && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleRemoveMedia}
                          disabled={loading}
                          className="text-sm flex items-center gap-2 border-red-200 text-red-600 hover:border-red-400 hover:bg-red-50"
                        >
                          <X className="h-4 w-4" />
                          Remove Media
                        </Button>
                      )}
                    </div>
                    
                    {/* Media Preview */}
                    {mediaPreview && (
                      <div className="mt-2 relative border border-blue-200 rounded-md overflow-hidden" style={{ maxWidth: '300px' }}>
                        {mediaFile?.type.startsWith('image/') && (
                          <img 
                            src={mediaPreview} 
                            alt="Preview" 
                            className="max-h-[200px] w-auto object-contain"
                          />
                        )}
                        {mediaFile?.type.startsWith('video/') && (
                          <video 
                            src={mediaPreview} 
                            controls 
                            className="max-h-[200px] w-auto"
                          />
                        )}
                      </div>
                    )}
                  </div>
                  
                  <Button parentClass="w-fit" type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                    {loading ? (uploadingMedia ? "Uploading media..." : "Posting to Twitter...") : "Post Tweet"}
                  </Button>
                </CardContent>
              </Card>
            </form>
          </FormProvider>
        </TabsContent>

        {/* Reply Tab */}
        <TabsContent value="reply">
          <FormProvider {...replyForm}>
            <form onSubmit={replyForm.handleSubmit(handleReplyTweet)}>
              <Card>
                <CardHeader>
                  <CardTitle>Reply to a Tweet</CardTitle>
                  <CardDescription>Reply to an existing tweet</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input name="replyTweetId" label="Tweet ID to Reply to" placeholder="Enter tweet ID" required />
                  <Textarea name="replyText" label="Reply Text" placeholder="Your reply" required />
                  <div className="-mt-2 text-xs text-gray-500">{replyForm.watch("replyText")?.length || 0}/280 characters</div>
                  <Button parentClass="w-fit" type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                    {loading ? "Replying..." : "Reply"}
                  </Button>
                </CardContent>
              </Card>
            </form>
          </FormProvider>
        </TabsContent>

        {/* Like Tab */}
        <TabsContent value="like">
          <FormProvider {...likeForm}>
            <form onSubmit={likeForm.handleSubmit(handleLikeTweet)}>
              <Card>
                <CardHeader>
                  <CardTitle>Like a Tweet</CardTitle>
                  <CardDescription>Like an existing tweet</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input name="likeTweetId" label="Tweet ID to Like" placeholder="Enter tweet ID" required />
                  <Button parentClass="w-fit" type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                    {loading ? "Liking..." : "Like Tweet"}
                  </Button>
                </CardContent>
              </Card>
            </form>
          </FormProvider>
        </TabsContent>

        {/* Quote Tab */}
        <TabsContent value="quote">
          <FormProvider {...quoteForm}>
            <form onSubmit={quoteForm.handleSubmit(handleQuoteTweet)}>
              <Card>
                <CardHeader>
                  <CardTitle>Quote a Tweet</CardTitle>
                  <CardDescription>Quote an existing tweet with your comment</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input name="quoteTweetId" label="Tweet ID to Quote" placeholder="Enter tweet ID" required />
                  <Textarea name="quoteText" label="Your Comment" placeholder="Add your comment" required />
                  <div className="-mt-2 text-xs text-gray-500">{quoteForm.watch("quoteText")?.length || 0}/280 characters</div>
                  <Button parentClass="w-fit" type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                    {loading ? "Quoting..." : "Quote Tweet"}
                  </Button>
                </CardContent>
              </Card>
            </form>
          </FormProvider>
        </TabsContent>

        {/* Retweet Tab */}
        <TabsContent value="retweet">
          <FormProvider {...retweetForm}>
            <form onSubmit={retweetForm.handleSubmit(handleRetweet)}>
              <Card>
                <CardHeader>
                  <CardTitle>Retweet</CardTitle>
                  <CardDescription>Retweet an existing tweet</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input name="retweetId" label="Tweet ID to Retweet" placeholder="Enter tweet ID" required />
                  <Button parentClass="w-fit" type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                    {loading ? "Retweeting..." : "Retweet"}
                  </Button>
                </CardContent>
              </Card>
            </form>
          </FormProvider>
        </TabsContent>
      </Tabs>

      {/* Results Section */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold">Results</h2>

        {error && (
          <Alert variant={error.isRateLimit ? "default" : "destructive"} className={cn("mb-4 text-black", error.isRateLimit ? "border-yellow-200 bg-yellow-50 text-yellow-800" : "")}>
            <div className="flex flex-col">
              <div className="flex items-start">
                <div className="mt-0.5 mr-2">{error.isRateLimit ? <Clock className="h-4 w-4 text-yellow-600" /> : <AlertCircle className="h-4 w-4" />}</div>
                <div className="flex-1">
                  <AlertTitle className="mb-1 block font-semibold">{error.isRateLimit ? "Rate Limit Exceeded" : `Error ${error.code ? `(${error.code})` : ""}`}</AlertTitle>
                  <AlertDescription className="block whitespace-normal">{error.message}</AlertDescription>
                  {error.isRateLimit && <div className="mt-2 text-sm whitespace-normal">Twitter limits the number of API requests. Please wait a few minutes before trying again.</div>}
                  {getErrorDetails()}
                </div>
              </div>
            </div>
          </Alert>
        )}

        {success && (
          <Alert variant="default" className="mb-4 border-green-200 bg-green-50 text-green-800">
            <div className="flex items-start">
              <div className="mt-0.5 mr-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <AlertTitle className="mb-1 block font-semibold">Success</AlertTitle>
                <AlertDescription className="block whitespace-normal">{success}</AlertDescription>
              </div>
            </div>
          </Alert>
        )}

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>{result.action} Result</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-auto rounded bg-gray-100 p-4">
                <pre className="text-sm break-words whitespace-pre-wrap">{formatJson(result.data)}</pre>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
