import { AgentPlatformService } from "@/http/services/agent/AgentPlatformService";
import { AgentService } from "@/http/services/agent/AgentService";
import SocialiteService from "@/http/services/oAuthService/SocialiteService";
import { redirect } from "next/navigation";
import { NextResponse } from "next/server";

// Define error interface for better typing
interface TwitterApiError {
  message?: string;
  response?: {
    data?: {
      reason?: string;
      detail?: string;
    };
    status?: number;
  };
}

export const GET = async (request: Request): Promise<Response> => {
  try {
    // Decode state from URL parameter
    const url = new URL(request.url);
    const stateParam = url.searchParams.get('state');
    
    if (!stateParam) {
      return createErrorResponse("Missing state parameter");
    }
    
    const base64StateString = stateParam;
    const stateString = atob(base64StateString);
    const state = JSON.parse(stateString);

    // Get agent information including Twitter credentials
    const agent = await AgentService.getAgentByUuid(state.agentUuid);
    if (!agent) {
      return createErrorResponse("Agent not found");
    }
    
    if (!agent.twitterClientId || !agent.twitterClientSecret) {
      return createErrorResponse("Twitter credentials not found for this agent");
    }

    // Initialize Twitter provider with agent credentials
    const twitterCredentials = {
      clientId: agent.twitterClientId,
      clientSecret: agent.twitterClientSecret
    };
    
    const twitterProvider = new SocialiteService(twitterCredentials).driver("twitter");
    
    try {
      // Exchange code for token
      const res = await twitterProvider.exchangeCodeForToken(request);
      
      try {
        const profile = await twitterProvider.getUserInfo(res.accessToken);
        
        // Store the platform credentials
        await AgentPlatformService.storeAgentPlatform({
          name: "twitter",
          agentId: agent.id,
          description: "twitter",
          enabled: true,
          type: "twitter",
          credentials: {
            accessToken: res.accessToken,
            refreshToken: res.refreshToken ?? "",
            expiresIn: res.expiresIn ?? 0,
            expiryTimestamp: res.expiresIn ? Math.floor(Date.now() / 1000) + res.expiresIn : 0,
          },
          account: profile,
        });
        
        return redirect(state.url);
      } catch (error) {
        const userInfoError = error as TwitterApiError;
        console.error("User info request failed:", userInfoError);
        
        if (userInfoError.message?.includes("client-not-enrolled") || 
            (userInfoError.response?.data && userInfoError.response.data.reason === "client-not-enrolled")) {
          return createErrorResponse(
            "Twitter API Project Error",
            "Your Twitter app needs to be associated with a Project in the Twitter developer portal. " +
            "Please visit the Twitter developer portal, create a project, and attach your app to it. " +
            "Make sure your project has the appropriate level of API access."
          );
        }
        
        return createErrorResponse(`Failed to fetch user info: ${userInfoError.message || JSON.stringify(userInfoError)}`);
      }
    } catch (error) {
      const tokenError = error as TwitterApiError;
      console.error("Token exchange failed:", tokenError);
      return createErrorResponse(`Failed to exchange token: ${tokenError.message || JSON.stringify(tokenError)}`);
    }
  } catch (error) {
    const genericError = error as Error;
    console.error("Twitter OAuth callback error:", genericError);
    return createErrorResponse(`Twitter authentication failed: ${genericError.message || JSON.stringify(genericError)}`);
  }
};

// Helper function to create a nice error response
function createErrorResponse(title: string, message?: string): Response {
  const htmlContent = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Twitter Authentication Error</title>
    <style>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        background-color: #f5f8fa;
        color: #14171a;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        margin: 0;
      }
      .error-container {
        background-color: white;
        border-radius: 15px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        padding: 2rem;
        max-width: 550px;
        width: 90%;
        text-align: center;
      }
      h1 {
        color: #1da1f2;
        margin-bottom: 1rem;
      }
      .error-title {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 1rem;
        color: #e0245e;
      }
      .error-message {
        line-height: 1.5;
        margin-bottom: 1.5rem;
      }
      .back-button {
        background-color: #1da1f2;
        color: white;
        border: none;
        border-radius: 30px;
        padding: 0.75rem 1.5rem;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.2s;
      }
      .back-button:hover {
        background-color: #1a91da;
      }
    </style>
  </head>
  <body>
    <div class="error-container">
      <h1>Twitter Authentication Error</h1>
      <div class="error-title">${title}</div>
      ${message ? `<div class="error-message">${message}</div>` : ''}
      <button class="back-button" onclick="window.history.back()">Go Back</button>
    </div>
    <script>
      // Auto go back after 30 seconds
      setTimeout(() => {
        window.history.back();
      }, 30000);
    </script>
  </body>
  </html>
  `;

  return new NextResponse(htmlContent, {
    status: 400,
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
