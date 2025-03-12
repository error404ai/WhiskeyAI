/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { getHomeTimeLine, likeTweet, postTweet, quoteTweet, replyTweet, reTweet } from "@/http/controllers/agent/TwitterAgentController";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function TwitterAgentTest() {
  const agentUuid = useParams().id as string;
  // State for tweet text
  const [tweetText, setTweetText] = useState("");
  const [replyText, setReplyText] = useState("");
  const [replyTweetId, setReplyTweetId] = useState("");
  const [likeTweetId, setLikeTweetId] = useState("");
  const [quoteText, setQuoteText] = useState("");
  const [quoteTweetId, setQuoteTweetId] = useState("");
  const [retweetId, setRetweetId] = useState("");

  // State for results
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  // Function to handle API calls and update state
  const handleApiCall = async (apiCall: () => Promise<any>, actionName: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiCall();
      setResult({ action: actionName, data: response });
      console.log(`${actionName} response:`, response);
    } catch (err) {
      setError(`Error in ${actionName}: ${(err as Error).message}`);
      console.error(`${actionName} error:`, err);
    } finally {
      setLoading(false);
    }
  };

  // Handler functions for each action
  const handleGetTimeline = () => {
    handleApiCall(() => getHomeTimeLine(agentUuid), "Get Timeline");
  };

  const handlePostTweet = () => {
    handleApiCall(() => postTweet(agentUuid, tweetText), "Post Tweet");
  };

  const handleReplyTweet = () => {
    handleApiCall(() => replyTweet(agentUuid, replyText, replyTweetId), "Reply Tweet");
  };

  const handleLikeTweet = () => {
    handleApiCall(() => likeTweet(agentUuid, likeTweetId), "Like Tweet");
  };

  const handleQuoteTweet = () => {
    handleApiCall(() => quoteTweet(agentUuid, quoteTweetId, quoteText), "Quote Tweet");
  };

  const handleRetweet = () => {
    handleApiCall(() => reTweet(agentUuid, retweetId), "Retweet");
  };

  // Format JSON for display
  const formatJson = (data: any) => {
    return JSON.stringify(data, null, 2);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">Twitter API Test</h1>

      <Tabs defaultValue="timeline" className="w-full">
        <TabsList className="mb-4 grid grid-cols-7">
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
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
              <Button onClick={handleGetTimeline} disabled={loading}>
                {loading ? "Loading..." : "Get Timeline"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Search Tab */}
        <TabsContent value="search">
          <Card>
            <CardHeader>
              <CardTitle>Search Twitter</CardTitle>
              <CardDescription>Search for tweets</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>

        {/* Tweet Tab */}
        <TabsContent value="tweet">
          <Card>
            <CardHeader>
              <CardTitle>Post a Tweet</CardTitle>
              <CardDescription>Create a new tweet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tweet-text">Tweet Text</Label>
                <Textarea id="tweet-text" value={tweetText} onChange={(e) => setTweetText(e.target.value)} placeholder="What's happening?" />
              </div>
              <Button onClick={handlePostTweet} disabled={loading || !tweetText}>
                {loading ? "Posting..." : "Post Tweet"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reply Tab */}
        <TabsContent value="reply">
          <Card>
            <CardHeader>
              <CardTitle>Reply to a Tweet</CardTitle>
              <CardDescription>Reply to an existing tweet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reply-tweet-id">Tweet ID to Reply to</Label>
                <Input id="reply-tweet-id" value={replyTweetId} onChange={(e) => setReplyTweetId(e.target.value)} placeholder="Enter tweet ID" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reply-text">Reply Text</Label>
                <Textarea id="reply-text" value={replyText} onChange={(e) => setReplyText(e.target.value)} placeholder="Your reply" />
              </div>
              <Button onClick={handleReplyTweet} disabled={loading || !replyText || !replyTweetId}>
                {loading ? "Replying..." : "Reply"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Like Tab */}
        <TabsContent value="like">
          <Card>
            <CardHeader>
              <CardTitle>Like a Tweet</CardTitle>
              <CardDescription>Like an existing tweet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="like-tweet-id">Tweet ID to Like</Label>
                <Input id="like-tweet-id" value={likeTweetId} onChange={(e) => setLikeTweetId(e.target.value)} placeholder="Enter tweet ID" />
              </div>
              <Button onClick={handleLikeTweet} disabled={loading || !likeTweetId}>
                {loading ? "Liking..." : "Like Tweet"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quote Tab */}
        <TabsContent value="quote">
          <Card>
            <CardHeader>
              <CardTitle>Quote a Tweet</CardTitle>
              <CardDescription>Quote an existing tweet with your comment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="quote-tweet-id">Tweet ID to Quote</Label>
                <Input id="quote-tweet-id" value={quoteTweetId} onChange={(e) => setQuoteTweetId(e.target.value)} placeholder="Enter tweet ID" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quote-text">Your Comment</Label>
                <Textarea id="quote-text" value={quoteText} onChange={(e) => setQuoteText(e.target.value)} placeholder="Add your comment" />
              </div>
              <Button onClick={handleQuoteTweet} disabled={loading || !quoteText || !quoteTweetId}>
                {loading ? "Quoting..." : "Quote Tweet"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Retweet Tab */}
        <TabsContent value="retweet">
          <Card>
            <CardHeader>
              <CardTitle>Retweet</CardTitle>
              <CardDescription>Retweet an existing tweet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="retweet-id">Tweet ID to Retweet</Label>
                <Input id="retweet-id" value={retweetId} onChange={(e) => setRetweetId(e.target.value)} placeholder="Enter tweet ID" />
              </div>
              <Button onClick={handleRetweet} disabled={loading || !retweetId}>
                {loading ? "Retweeting..." : "Retweet"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Results Section */}
      <div className="mt-8">
        <h2 className="mb-4 text-xl font-semibold">Results</h2>
        {error && <div className="mb-4 rounded border border-red-400 bg-red-100 px-4 py-3 text-red-700">{error}</div>}
        {result && (
          <Card>
            <CardHeader>
              <CardTitle>{result.action} Result</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="max-h-96 overflow-auto rounded bg-gray-100 p-4">{formatJson(result.data)}</pre>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
