/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { getHomeTimeLine, likeTweet, postTweet, quoteTweet, replyTweet, reTweet } from "@/http/controllers/agent/TwitterAgentController";
import { likeSchema, quoteSchema, replySchema, retweetSchema, tweetSchema } from "@/http/zodSchema/twitterSchema";
import { TwitterApiError, TwitterResponse } from "@/types/twitter";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle, Clock, Twitter } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

export default function TwitterAgentTest() {
  const agentUuid = useParams().id as string;

  // Form handlers for each tab
  const tweetForm = useForm({
    resolver: zodResolver(tweetSchema),
    defaultValues: { tweetText: "" },
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
        errorDetails: JSON.stringify(err)
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

  const handlePostTweet = (data: z.infer<typeof tweetSchema>) => {
    handleApiCall(() => postTweet(agentUuid, data.tweetText), "Post Tweet");
    tweetForm.reset();
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
        <div className="mt-2 text-xs">
          <div className="font-semibold">Error Details:</div>
          <pre className="mt-1 max-h-32 overflow-auto rounded bg-gray-100 p-2">{JSON.stringify(details, null, 2)}</pre>
        </div>
      );
    } catch (e) {
      return <div className="mt-2 text-xs">{error.errorDetails}</div>;
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
              <Button onClick={handleGetTimeline} disabled={loading} className="bg-blue-500 hover:bg-blue-600">
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
                  <CardDescription>Create a new tweet</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea name="tweetText" label="Tweet Text" placeholder="What's happening?" required />
                  <div className="-mt-2 text-xs text-gray-500">{tweetForm.watch("tweetText")?.length || 0}/280 characters</div>
                  <Button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600">
                    {loading ? "Posting..." : "Post Tweet"}
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
                  <Button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600">
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
                  <Button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600">
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
                  <Button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600">
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
                  <Button type="submit" disabled={loading} className="bg-blue-500 hover:bg-blue-600">
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
          <Alert variant={error.isRateLimit ? "default" : "destructive"} className={`mb-4 ${error.isRateLimit ? "border-yellow-200 bg-yellow-50 text-yellow-800" : ""}`}>
            {error.isRateLimit ? <Clock className="h-4 w-4 text-yellow-600" /> : <AlertCircle className="h-4 w-4" />}
            <AlertTitle>{error.isRateLimit ? "Rate Limit Exceeded" : `Error ${error.code ? `(${error.code})` : ""}`}</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
            {error.isRateLimit && <div className="mt-2 text-sm">Twitter limits the number of API requests. Please wait a few minutes before trying again.</div>}
            {getErrorDetails()}
          </Alert>
        )}

        {success && (
          <Alert variant="default" className="mb-4 border-green-200 bg-green-50 text-green-800">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>{success}</AlertDescription>
          </Alert>
        )}

        {result && (
          <Card>
            <CardHeader>
              <CardTitle>{result.action} Result</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="max-h-96 overflow-auto rounded bg-gray-100 p-4 text-sm">{formatJson(result.data)}</pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
